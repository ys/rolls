/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

// clearPreviousRoll clears the output of the previous roll
func clearPreviousRoll() {
	// Clear 10 lines of previous output
	ClearPreviousOutput(10)
}

// archiveCmd represents the archive command
var archiveCmd = &cobra.Command{
	Use:   "archive",
	Short: "Archive a roll",
	Long:  `Archive a roll by renaming files, updating EXIF data, and creating a contact sheet.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.Flags().GetInt("year")
		if err != nil {
			return err
		}

		exifOnly, err := cmd.Flags().GetBool("exif-only")
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
				for _, arg := range args {
					if r.Metadata.RollNumber == arg {
						return true
					}
				}
				return false
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

			// Archive the roll
			err = r.Archive(cfg, exifOnly)
			if err != nil {
				return err
			}

			// Print summary line
			status := "Archived"
			if exifOnly {
				status = "EXIF updated"
			}
			fmt.Println(style.RenderSummary(fmt.Sprintf("   ✨ Roll %s: %s", r.Metadata.RollNumber, status)))
		}

		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nSuccessfully processed %d rolls\n", len(rollsToProcess))))
		return nil
	},
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.Flags().Int("year", 0, "Only process rolls from this year")
	archiveCmd.Flags().Bool("exif-only", false, "Only update EXIF data for already processed rolls")
}
