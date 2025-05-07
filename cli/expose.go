package cli

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

// exposeCmd represents the expose command
var exposeCmd = &cobra.Command{
	Use:   "expose [year]",
	Short: "Generate yearly markdown file for rolls",
	Long:  `Generate a markdown file listing all rolls from a specific year with their contact sheets. If no year is specified, generates files for all years.`,
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

			// Sort rolls by roll number in descending order
			sort.Slice(yearRolls, func(i, j int) bool {
				return yearRolls[i].Metadata.RollNumber > yearRolls[j].Metadata.RollNumber
			})

			// Generate markdown content
			var content strings.Builder
			content.WriteString(fmt.Sprintf("# %d\n\n", year))

			for _, r := range yearRolls {
				content.WriteString(fmt.Sprintf("## %s - %s - %s\n", r.Metadata.RollNumber, r.Metadata.CameraID, r.Metadata.FilmID))

				// Check if contact sheet exists
				contactSheetPath := filepath.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", r.Metadata.RollNumber))
				if _, err := os.Stat(contactSheetPath); err == nil {
					content.WriteString(fmt.Sprintf("![[%s.webp]]\n", r.Metadata.RollNumber))
				}
				content.WriteString("\n")
			}

			// Write to file
			yearlyPath := filepath.Join(cfg.ContactSheetPath, fmt.Sprintf("%d.md", year))
			err = os.WriteFile(yearlyPath, []byte(content.String()), 0644)
			if err != nil {
				return fmt.Errorf("failed to write yearly markdown file for %d: %w", year, err)
			}

			fmt.Println(titleStyle.Render(fmt.Sprintf("📝 Generated yearly markdown file for %d with %d rolls", year, len(yearRolls))))
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(exposeCmd)
}
