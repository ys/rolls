/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"fmt"
	"sort"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

// archiveCmd represents the archive command
var archiveCmd = &cobra.Command{
	Use:   "archive",
	Short: "Archive a roll",
	Long:  `Mark a roll as archived by setting the archived_at timestamp in the metadata file.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.Flags().GetInt("year")
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
		fmt.Println(style.RenderTitle("📦", fmt.Sprintf("Archiving %d rolls", len(rollsToProcess))))

		// Process each roll
		for i, r := range rollsToProcess {
			// Show global progress
			progress := float64(i) / float64(len(rollsToProcess))
			bar := fmt.Sprintf("[%s%s] %d/%d",
				strings.Repeat("=", int(progress*20)),
				strings.Repeat(" ", 20-int(progress*20)),
				i+1,
				len(rollsToProcess))
			fmt.Println(style.ProgressStyle.Render(fmt.Sprintf("Archiving roll %s %s", r.Metadata.RollNumber, bar)))

			// Check if already archived
			if r.IsArchivedLocally() {
				fmt.Println(style.RenderSummary(fmt.Sprintf("   ✨ Roll %s: Already archived at %s", r.Metadata.RollNumber, r.Metadata.ArchivedAt.Format("2006-01-02 15:04:05"))))
				continue
			}

			// Archive the roll
			err = r.SetArchived()
			if err != nil {
				return err
			}

			// Print summary line
			fmt.Println(style.RenderSummary(fmt.Sprintf("   ✨ Roll %s: Archived at %s", r.Metadata.RollNumber, r.Metadata.ArchivedAt.Format("2006-01-02 15:04:05"))))
		}

		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nSuccessfully archived %d rolls\n", len(rollsToProcess))))
		return nil
	},
}

// listMissingCmd represents the archive:missing command
var listMissingCmd = &cobra.Command{
	Use:   "archive:missing",
	Short: "List rolls that are not archived locally",
	Long:  `List all rolls that don't have the archived_at timestamp set in their metadata.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.Flags().GetInt("year")
		if err != nil {
			return err
		}

		// Get all rolls
		allRolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return err
		}

		// Filter by year if specified
		if year > 0 {
			allRolls = roll.Filter(allRolls, func(r roll.Roll) bool {
				return r.Metadata.ShotAt.Year() == year
			})
		}

		// Filter to only non-archived rolls
		missingRolls := roll.Filter(allRolls, func(r roll.Roll) bool {
			return !r.IsArchivedLocally()
		})

		if len(missingRolls) == 0 {
			fmt.Println(style.RenderSuccess("All rolls are archived locally! 🎉"))
			return nil
		}

		// Group missing rolls by year
		rollsByYear := make(map[int][]roll.Roll)
		for _, r := range missingRolls {
			year := r.Metadata.ShotAt.Year()
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// Get sorted years
		var years []int
		for year := range rollsByYear {
			years = append(years, year)
		}
		sort.Ints(years)

		// Show missing rolls grouped by year
		fmt.Println(style.RenderTitle("📋", fmt.Sprintf("Missing %d archived rolls", len(missingRolls))))

		for _, year := range years {
			yearRolls := rollsByYear[year]
			fmt.Println(style.RenderAccent(fmt.Sprintf("\n📅 %d (%d rolls)", year, len(yearRolls))))

			for _, r := range yearRolls {
				fmt.Println(style.RenderFile(fmt.Sprintf("   • %s (%s - %s) - Shot: %s",
					r.Metadata.RollNumber,
					r.Metadata.CameraID,
					r.Metadata.FilmID,
					r.Metadata.ShotAt.Format("2006-01-02"))))
			}
		}

		fmt.Println(style.RenderSummary(fmt.Sprintf("\nTotal missing: %d rolls across %d years", len(missingRolls), len(years))))
		return nil
	},
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.Flags().Int("year", 0, "Only process rolls from this year")

	rootCmd.AddCommand(listMissingCmd)
	listMissingCmd.Flags().Int("year", 0, "Only show rolls from this year")
}
