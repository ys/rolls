package cli

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var envCmd = &cobra.Command{
	Use:   "env",
	Short: "Manage web app environments (prod, staging, local, …)",
}

var envListCmd = &cobra.Command{
	Use:   "list",
	Short: "List configured environments",
	RunE: func(cmd *cobra.Command, args []string) error {
		active := cfg.ActiveEnv

		// Show top-level default if present
		if cfg.WebAppURL != "" {
			marker := "  "
			if active == "" {
				marker = "* "
			}
			fmt.Printf("%s(default)  %s\n", marker, cfg.WebAppURL)
		}

		for name, env := range cfg.Environments {
			marker := "  "
			if name == active {
				marker = "* "
			}
			fmt.Printf("%s%-12s %s\n", marker, name, env.WebAppURL)
		}

		if active != "" {
			fmt.Printf("\nActive: %s (override with --env or `rolls env use`)\n", active)
		}
		return nil
	},
}

var envUseCmd = &cobra.Command{
	Use:   "use <name>",
	Short: "Switch the active environment",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		if name != "default" {
			if _, ok := cfg.Environments[name]; !ok {
				return fmt.Errorf("unknown environment %q — run `rolls env list` to see available", name)
			}
		}

		if name == "default" {
			cfg.ActiveEnv = ""
		} else {
			cfg.ActiveEnv = name
		}
		if err := cfg.Write(); err != nil {
			return fmt.Errorf("failed to save config: %w", err)
		}
		if name == "default" {
			fmt.Printf("Now using default (%s)\n", cfg.WebAppURL)
		} else {
			fmt.Printf("Now using %q (%s)\n", name, cfg.Environments[name].WebAppURL)
		}
		return nil
	},
}

var envAddCmd = &cobra.Command{
	Use:   "add <name>",
	Short: "Add or update a named environment",
	Long: `Add or update a named environment with a URL and API key.

Example:
  rolls env add local --url http://localhost:3000 --key rk_abc123
  rolls env add staging`,
	Args: cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		reader := bufio.NewReader(os.Stdin)

		// --- URL ---
		urlFlag, _ := cmd.Flags().GetString("url")
		webURL := urlFlag
		if webURL == "" {
			existing := cfg.Environments[name].WebAppURL
			if existing != "" {
				fmt.Printf("URL [%s]: ", existing)
			} else {
				fmt.Print("URL: ")
			}
			input, _ := reader.ReadString('\n')
			input = strings.TrimSpace(input)
			if input != "" {
				webURL = input
			} else {
				webURL = existing
			}
		}
		webURL = strings.TrimRight(webURL, "/")
		if webURL == "" {
			return fmt.Errorf("URL is required")
		}

		// --- API key ---
		keyFlag, _ := cmd.Flags().GetString("key")
		apiKey := keyFlag
		if apiKey == "" {
			var loginErr error
			apiKey, loginErr = browserLogin(webURL, name)
			if loginErr != nil {
				// Fall back to manual paste
				fmt.Printf("\nCould not complete browser login (%v).\n", loginErr)
				fmt.Printf("Create a key at: %s/settings/api-keys\n\n", webURL)
				fmt.Print("API key: ")
				input, _ := reader.ReadString('\n')
				apiKey = strings.TrimSpace(input)
			}
		}
		if apiKey == "" {
			return fmt.Errorf("API key is required")
		}

		// --- Verify ---
		fmt.Print("Verifying… ")
		req, err := http.NewRequest("GET", webURL+"/api/rolls/next", nil)
		if err != nil {
			return fmt.Errorf("invalid URL: %w", err)
		}
		req.Header.Set("Authorization", "Bearer "+apiKey)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return fmt.Errorf("could not reach %s: %w", webURL, err)
		}
		resp.Body.Close()
		if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
			return fmt.Errorf("invalid API key (got %d)", resp.StatusCode)
		}
		if resp.StatusCode >= 400 {
			return fmt.Errorf("unexpected response: %d", resp.StatusCode)
		}

		// --- Save ---
		if err := cfg.SetEnv(name, webURL, apiKey); err != nil {
			return fmt.Errorf("failed to save config: %w", err)
		}
		fmt.Printf("OK\nEnvironment %q saved to %s\n", name, cfg.FilePath)
		fmt.Printf("Run `rolls env use %s` to make it active.\n", name)
		return nil
	},
}

var envRemoveCmd = &cobra.Command{
	Use:     "remove <name>",
	Aliases: []string{"rm"},
	Short:   "Remove a named environment",
	Args:    cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		if _, ok := cfg.Environments[name]; !ok {
			return fmt.Errorf("unknown environment %q", name)
		}
		delete(cfg.Environments, name)
		if cfg.ActiveEnv == name {
			cfg.ActiveEnv = ""
		}
		if err := cfg.Write(); err != nil {
			return fmt.Errorf("failed to save config: %w", err)
		}
		fmt.Printf("Removed environment %q\n", name)
		return nil
	},
}

// browserLogin starts a local HTTP server, opens the web app's CLI auth page,
// and waits for the API key to be delivered via redirect callback.
func browserLogin(webURL, envName string) (string, error) {
	// Find a free port
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return "", fmt.Errorf("could not start local server: %w", err)
	}
	port := ln.Addr().(*net.TCPAddr).Port
	ln.Close()

	// Generate a random state token to prevent CSRF
	stateBytes := make([]byte, 16)
	if _, err := rand.Read(stateBytes); err != nil {
		return "", err
	}
	state := hex.EncodeToString(stateBytes)

	keyCh := make(chan string, 1)
	errCh := make(chan error, 1)

	srv := &http.Server{Addr: fmt.Sprintf("127.0.0.1:%d", port)}
	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("state") != state {
			errCh <- fmt.Errorf("state mismatch — possible CSRF")
			http.Error(w, "invalid state", http.StatusBadRequest)
			return
		}
		key := r.URL.Query().Get("key")
		if key == "" {
			errCh <- fmt.Errorf("no key in callback")
			http.Error(w, "no key", http.StatusBadRequest)
			return
		}
		fmt.Fprintln(w, "<html><body><p>API key received! You can close this tab.</p></body></html>")
		keyCh <- key
	})

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	label := "CLI " + envName
	callback := fmt.Sprintf("http://127.0.0.1:%d/callback", port)
	params := url.Values{
		"callback": {callback},
		"label":    {label},
		"state":    {state},
	}
	authURL := webURL + "/api/auth/cli-token?" + params.Encode()

	fmt.Printf("Opening browser for login…\n  %s\n", authURL)
	exec.Command("open", authURL).Start() //nolint:errcheck

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	defer srv.Shutdown(context.Background()) //nolint:errcheck

	select {
	case key := <-keyCh:
		fmt.Println("Login successful.")
		return key, nil
	case err := <-errCh:
		return "", err
	case <-ctx.Done():
		return "", fmt.Errorf("timed out waiting for browser login")
	}
}

func init() {
	rootCmd.AddCommand(envCmd)
	envCmd.AddCommand(envListCmd, envUseCmd, envAddCmd, envRemoveCmd)

	envAddCmd.Flags().String("url", "", "Web app URL")
	envAddCmd.Flags().String("key", "", "API key")
}
