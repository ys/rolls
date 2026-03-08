package cli

import (
	"bufio"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

var webLoginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with the Rolls web app and save credentials",
	Long: `Saves your web app URL and API key to ~/.config/rolls/config.yml.

If --env is set (e.g. rolls --env local login), credentials are saved
to that named environment. Otherwise they update the default.

Create an API key at: <web_app_url>/settings/api-keys

Example:
  rolls login
  rolls login --url https://rolls.example.com --key rk_abc123
  rolls --env local login --url http://localhost:3000 --key rk_abc123`,
	RunE: func(cmd *cobra.Command, args []string) error {
		reader := bufio.NewReader(os.Stdin)

		// --- URL ---
		urlFlag, _ := cmd.Flags().GetString("url")
		webURL := urlFlag
		if webURL == "" {
			webURL = cfg.URL() // uses active env or default
		}
		if webURL == "" {
			fmt.Print("Web app URL: ")
			input, _ := reader.ReadString('\n')
			webURL = strings.TrimSpace(input)
		}
		webURL = strings.TrimRight(webURL, "/")
		if webURL == "" {
			return fmt.Errorf("web app URL is required")
		}

		// --- API key ---
		keyFlag, _ := cmd.Flags().GetString("key")
		apiKey := keyFlag
		if apiKey == "" {
			envName := cfg.ActiveEnv
			if envName == "" {
				envName = "default"
			}
			var loginErr error
			apiKey, loginErr = browserLogin(webURL, envName)
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
			return fmt.Errorf("unexpected response from server: %d", resp.StatusCode)
		}

		// --- Save ---
		if cfg.ActiveEnv != "" {
			// Save into the named environment
			if err := cfg.SetEnv(cfg.ActiveEnv, webURL, apiKey); err != nil {
				return fmt.Errorf("failed to save config: %w", err)
			}
			fmt.Printf("OK\nSaved to environment %q in %s\n", cfg.ActiveEnv, cfg.FilePath)
		} else {
			// Save as top-level default
			cfg.WebAppURL = webURL
			cfg.WebAppAPIKey = apiKey
			if err := cfg.Write(); err != nil {
				return fmt.Errorf("failed to save config: %w", err)
			}
			fmt.Printf("OK\nSaved to %s\n", cfg.FilePath)
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(webLoginCmd)
	webLoginCmd.Flags().String("url", "", "Web app URL (default from config)")
	webLoginCmd.Flags().String("key", "", "API key")
}
