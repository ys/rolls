package cli

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/cli/roll"
	"github.com/ys/rolls/cli/style"
)

// remapIDs rewrites camera/film frontmatter values to canonical IDs in any .md files
// under root (including the Obsidian flat-file structure).
func remapIDs(root string) (changed, total int) {
	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() || filepath.Ext(path) != ".md" {
			return nil
		}
		total++
		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		content := string(data)
		if !strings.HasPrefix(content, "---") {
			return nil
		}

		scanner := bufio.NewScanner(strings.NewReader(content))
		var lines []string
		modified := false
		inFM, fmDone := false, false
		lineNum := 0

		for scanner.Scan() {
			line := scanner.Text()
			if lineNum == 0 && strings.TrimSpace(line) == "---" {
				inFM = true
				lines = append(lines, line)
				lineNum++
				continue
			}
			if inFM && !fmDone && strings.TrimSpace(line) == "---" {
				fmDone = true
				lines = append(lines, line)
				lineNum++
				continue
			}
			if inFM && !fmDone {
				if strings.HasPrefix(line, "camera: ") {
					val := strings.TrimSpace(strings.TrimPrefix(line, "camera: "))
					if _, known := cfg.Cameras[val]; !known {
						if canonID, ok := findSimilarCamera(val, cfg.Cameras); ok {
							fmt.Printf("  %s: camera %q → %q\n", filepath.Base(path), val, canonID)
							line = "camera: " + canonID
							modified = true
						}
					}
				} else if strings.HasPrefix(line, "film: ") {
					val := strings.TrimSpace(strings.TrimPrefix(line, "film: "))
					if _, known := cfg.Films[val]; !known {
						if canonID, ok := findSimilarFilm(val, cfg.Films); ok {
							fmt.Printf("  %s: film   %q → %q\n", filepath.Base(path), val, canonID)
							line = "film: " + canonID
							modified = true
						}
					}
				}
			}
			lines = append(lines, line)
			lineNum++
		}

		if modified {
			os.WriteFile(path, []byte(strings.Join(lines, "\n")), 0644)
			changed++
		}
		return nil
	})
	return
}

// reconcileCmd represents the reconcile command
var reconcileCmd = &cobra.Command{
	Use:   "reconcile [year]",
	Short: "Reconcile roll.md files with missing metadata and canonical IDs",
	Long: `Scans roll.md files in scans_path and obsidian_rolls_path and:
  - Rewrites unknown camera/film IDs to canonical IDs using fuzzy matching
  - Fills in missing metadata fields (e.g. roll_number from folder name)

Useful after importing old rolls or renaming cameras/films in the config.`,
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		// Remap camera/film IDs in Obsidian flat files first
		if cfg.ObsidianRollsPath != "" {
			fmt.Println("Remapping IDs in Obsidian vault…")
			changed, total := remapIDs(cfg.ObsidianRollsPath)
			fmt.Printf("  %d/%d files updated\n", changed, total)
		}
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

			fmt.Println(style.RenderTitle("📝", fmt.Sprintf("Processing rolls from %d", year)))

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
				if _, known := cfg.Cameras[reconciled.CameraID]; !known && reconciled.CameraID != "" {
					if canonID, ok := findSimilarCamera(reconciled.CameraID, cfg.Cameras); ok {
						fmt.Printf("  %s: camera %q → %q\n", r.Metadata.RollNumber, reconciled.CameraID, canonID)
						reconciled.CameraID = canonID
					}
				}
				if existingMetadata.FilmID != "" {
					reconciled.FilmID = existingMetadata.FilmID
				}
				if _, known := cfg.Films[reconciled.FilmID]; !known && reconciled.FilmID != "" {
					if canonID, ok := findSimilarFilm(reconciled.FilmID, cfg.Films); ok {
						fmt.Printf("  %s: film   %q → %q\n", r.Metadata.RollNumber, reconciled.FilmID, canonID)
						reconciled.FilmID = canonID
					}
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

				fmt.Println(style.RenderFile(fmt.Sprintf("   ✨ Updated roll.md for %s", r.Metadata.RollNumber)))
			}
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(reconcileCmd)
}
