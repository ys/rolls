package cli

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

// processCmd represents the process command
var processCmd = &cobra.Command{
	Use:   "process [roll_number...]",
	Short: "Process rolls: rename files, update EXIF, generate contact sheet, and publish to web",
	Long: `Process one or more rolls locally (rename files, update EXIF data, generate contact sheet)
and then publish to the web app (upload contact sheet, set processed_at).

Use --local-only to skip the web publish step.
Use --exif-only to only refresh EXIF data on already-archived rolls.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.Flags().GetInt("year")
		if err != nil {
			return err
		}

		exifOnly, err := cmd.Flags().GetBool("exif-only")
		if err != nil {
			return err
		}

		yes, err := cmd.Flags().GetBool("yes")
		if err != nil {
			return err
		}

		localOnly, err := cmd.Flags().GetBool("local-only")
		if err != nil {
			return err
		}

		// Get all rolls to process
		var rollsToProcess []roll.Roll

		if len(args) > 0 {
			// Process specific rolls
			allRolls, err := roll.GetRolls(cfg.ScansPath)
			if err != nil {
				return err
			}
			rollsToProcess = roll.Filter(allRolls, func(r roll.Roll) bool {
				return slices.Contains(args, r.Metadata.RollNumber)
			})
		} else {
			// Process all rolls in the scans directory
			rollsToProcess, err = roll.GetRolls(cfg.ScansPath)
			if err != nil {
				return err
			}
		}

		// Filter by year if specified
		if year > 0 {
			rollsToProcess = roll.Filter(rollsToProcess, func(r roll.Roll) bool {
				return r.Metadata.ShotAt.Year() == year
			})
			if len(rollsToProcess) == 0 {
				fmt.Printf("No rolls found from year %d\n", year)
				return nil
			}
			fmt.Printf("Found %d rolls from year %d\n", len(rollsToProcess), year)
		}

		if len(rollsToProcess) == 0 {
			fmt.Println("No rolls to process")
			return nil
		}

		// Ask for confirmation if processing multiple rolls without --yes flag
		if len(rollsToProcess) > 1 && !yes {
			fmt.Printf("\n%s\n", style.RenderAccent(fmt.Sprintf("⚠️  About to process %d rolls", len(rollsToProcess))))
			fmt.Print("Continue? (y/N): ")
			reader := bufio.NewReader(os.Stdin)
			response, err := reader.ReadString('\n')
			if err != nil {
				return err
			}
			response = strings.TrimSpace(strings.ToLower(response))
			if response != "y" && response != "yes" {
				fmt.Println(style.RenderAccent("Cancelled"))
				return nil
			}
		}

		// Determine whether to publish to web
		doWebPublish := !localOnly && cfg.WebAppURL != "" && cfg.WebAppAPIKey != "" && cfg.ContactSheetPath != ""
		var client *http.Client
		if doWebPublish {
			client = &http.Client{Timeout: 60 * time.Second}
		}

		// Show global progress
		fmt.Println(style.RenderTitle("📦", fmt.Sprintf("Processing %d rolls", len(rollsToProcess))))

		// Process each roll
		for i, r := range rollsToProcess {
			// Show global progress
			progress := float64(i) / float64(len(rollsToProcess))
			bar := fmt.Sprintf("[%s%s] %d/%d",
				strings.Repeat("=", int(progress*20)),
				strings.Repeat(" ", 20-int(progress*20)),
				i+1,
				len(rollsToProcess))
			fmt.Println(style.ProgressStyle.Render(fmt.Sprintf("Processing roll %s %s", r.Metadata.RollNumber, bar)))

			// Check if already archived
			isArchived, err := r.IsArchived(cfg)
			if err != nil {
				return err
			}

			// If exif-only mode, only process archived rolls
			if exifOnly && !isArchived {
				fmt.Println(style.RenderSummary(fmt.Sprintf("   ✨ Roll %s: Skipped (not archived)", r.Metadata.RollNumber)))
				continue
			}

			// Archive the roll locally
			err = r.Archive(cfg, exifOnly)
			if err != nil {
				return err
			}

			// Always stamp processed_at in local roll.md
			now := time.Now().UTC()
			mdPath := filepath.Join(r.Folder, "roll.md")
			if localRoll, err := roll.FromMarkdown(mdPath); err == nil {
				localRoll.Metadata.ProcessedAt = now
				if err := localRoll.UpdateMetadata(); err != nil {
					fmt.Fprintf(os.Stderr, "  warn: could not update processed_at in roll.md: %v\n", err)
				}
			}

			status := "Archived"
			if exifOnly {
				status = "EXIF updated"
			}

			// Publish to web app unless --local-only
			if doWebPublish {
				if err := publishRollToWeb(r.Metadata.RollNumber, client, now); err != nil {
					fmt.Fprintf(os.Stderr, "  warn: could not publish %s: %v\n", r.Metadata.RollNumber, err)
				} else {
					status += " + published"
				}
			}

			fmt.Println(style.RenderSummary(fmt.Sprintf("   ✨ Roll %s: %s", r.Metadata.RollNumber, status)))
		}

		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nSuccessfully processed %d rolls\n", len(rollsToProcess))))
		return nil
	},
}

// publishRollToWeb uploads the contact sheet to the web app and sets processed_at.
func publishRollToWeb(rollNum string, client *http.Client, now time.Time) error {
	imgPath := filepath.Join(cfg.ContactSheetPath, "images", rollNum+".webp")
	imgData, err := os.ReadFile(imgPath)
	if err != nil {
		return fmt.Errorf("contact sheet not found at %s: %w", imgPath, err)
	}

	// Upload contact sheet
	req, err := http.NewRequest(http.MethodPut,
		cfg.WebAppURL+"/api/rolls/"+rollNum+"/contact-sheet",
		bytes.NewReader(imgData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "image/webp")
	req.Header.Set("Authorization", "Bearer "+cfg.WebAppAPIKey)

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("contact sheet upload failed: %w", err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("contact sheet upload failed with status %s", resp.Status)
	}

	// Set processed_at on web app
	patchBody, err := json.Marshal(map[string]string{
		"processed_at": now.Format(time.RFC3339),
	})
	if err != nil {
		return err
	}
	req, err = http.NewRequest(http.MethodPatch,
		cfg.WebAppURL+"/api/rolls/"+rollNum,
		bytes.NewReader(patchBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.WebAppAPIKey)

	resp, err = client.Do(req)
	if err != nil {
		return fmt.Errorf("setting processed_at failed: %w", err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("setting processed_at failed with status %s", resp.Status)
	}
	return nil
}

func init() {
	rootCmd.AddCommand(processCmd)
	processCmd.Flags().Int("year", 0, "Only process rolls from this year")
	processCmd.Flags().Bool("exif-only", false, "Only update EXIF data for already processed rolls")
	processCmd.Flags().BoolP("yes", "y", false, "Skip confirmation prompt")
	processCmd.Flags().Bool("local-only", false, "Skip web publish (contact sheet upload and processed_at)")
}
