package cli

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

// reconcileCmd represents the reconcile command
var reconcileCmd = &cobra.Command{
	Use:   "reconcile [year]",
	Short: "Reconcile roll.md files with missing metadata",
	Long:  `Update roll.md files with missing metadata fields while preserving existing values. If no year is specified, processes all years.`,
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		// Get all rolls
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return err
		}

		// Group rolls by year
		rollsByYear := make(map[int][]roll.Roll)
		for _, r := range rolls {
			// Use ShotAt if available, otherwise fall back to ScannedAt
			var year int
			if !r.Metadata.ShotAt.IsZero() {
				year = r.Metadata.ShotAt.Year()
			} else {
				year = r.Metadata.ScannedAt.Year()
			}
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// Get years to process
		var years []int
		if len(args) > 0 {
			year, err := strconv.Atoi(args[0])
			if err != nil {
				return fmt.Errorf("invalid year: %s", args[0])
			}
			years = []int{year}
		} else {
			// Get all years and sort them
			for year := range rollsByYear {
				years = append(years, year)
			}
			sort.Sort(sort.Reverse(sort.IntSlice(years)))
		}

		// Process each year
		for _, year := range years {
			yearRolls := rollsByYear[year]
			if len(yearRolls) == 0 {
				fmt.Printf("No rolls found from year %d\n", year)
				continue
			}

			// Sort rolls by roll number
			sort.Slice(yearRolls, func(i, j int) bool {
				return yearRolls[i].Metadata.RollNumber < yearRolls[j].Metadata.RollNumber
			})

			fmt.Println(titleStyle.Render(fmt.Sprintf("\n📝 Processing rolls from %d", year)))

			// Process each roll
			for _, r := range yearRolls {
				// Read existing metadata if available
				markdownPath := filepath.Join(r.Folder, "roll.md")
				existingMetadata := &roll.Metadata{}
				if _, err := os.Stat(markdownPath); err == nil {
					existingRoll, err := roll.FromMarkdown(markdownPath)
					if err == nil {
						existingMetadata = &existingRoll.Metadata
					}
				}

				// Reconcile metadata
				reconciled := r.Metadata
				if existingMetadata.RollNumber != "" {
					reconciled.RollNumber = existingMetadata.RollNumber
				}
				if existingMetadata.CameraID != "" {
					reconciled.CameraID = existingMetadata.CameraID
				}
				if existingMetadata.FilmID != "" {
					reconciled.FilmID = existingMetadata.FilmID
				}
				if !existingMetadata.ShotAt.IsZero() {
					reconciled.ShotAt = existingMetadata.ShotAt
				}
				if !existingMetadata.ScannedAt.IsZero() {
					reconciled.ScannedAt = existingMetadata.ScannedAt
				}
				if !existingMetadata.ProcessedAt.IsZero() {
					reconciled.ProcessedAt = existingMetadata.ProcessedAt
				}
				if len(existingMetadata.Tags) > 0 {
					reconciled.Tags = existingMetadata.Tags
				}

				// Generate markdown content
				content := fmt.Sprintf("---\nroll_number: %s\ncamera: %s\nfilm: %s\nshot_at: %s\nscanned_at: %s\nprocessed_at: %s\ntags: %v\n---\n\n%s",
					reconciled.RollNumber,
					reconciled.CameraID,
					reconciled.FilmID,
					reconciled.ShotAt.Format("2006-01-02"),
					reconciled.ScannedAt.Format("2006-01-02"),
					reconciled.ProcessedAt.Format("2006-01-02 15:04:05"),
					reconciled.Tags,
					r.Content)

				// Write to file
				err = os.WriteFile(markdownPath, []byte(content), 0644)
				if err != nil {
					return fmt.Errorf("failed to write roll.md for %s: %w", r.Metadata.RollNumber, err)
				}

				fmt.Println(fileStyle.Render(fmt.Sprintf("   ✨ Updated roll.md for %s", r.Metadata.RollNumber)))
			}
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(reconcileCmd)
}
