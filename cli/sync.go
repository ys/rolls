package cli

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

func init() {
	rootCmd.AddCommand(syncCmd)
	syncCmd.Flags().Bool("dry-run", false, "Show changes without modifying files")
}

var syncCmd = &cobra.Command{
	Use:   "sync",
	Short: "Sync roll archive to Obsidian as yearly summary notes",
	RunE: func(cmd *cobra.Command, args []string) error {
		dryRun, _ := cmd.Flags().GetBool("dry-run")

		if cfg.ScansPath == "" {
			return errors.New("scans_path is not set in config")
		}
		if cfg.ObsidianRollsPath == "" {
			return errors.New("obsidian_rolls_path is not set in config")
		}

		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return err
		}

		// Copy contact sheet images to Obsidian images/ subfolder
		obsidianImagesDir := filepath.Join(cfg.ObsidianRollsPath, "images")
		copiedSheets := map[string]bool{} // roll_number → true if local image exists
		if cfg.ContactSheetPath != "" {
			srcDir := filepath.Join(cfg.ContactSheetPath, "images")
			if !dryRun {
				os.MkdirAll(obsidianImagesDir, 0755)
			}
			entries, err := os.ReadDir(srcDir)
			if err == nil {
				for _, e := range entries {
					if e.IsDir() || filepath.Ext(e.Name()) != ".webp" {
						continue
					}
					rollNum := e.Name()[:len(e.Name())-5]
					src := filepath.Join(srcDir, e.Name())
					dst := filepath.Join(obsidianImagesDir, e.Name())
					if dryRun {
						copiedSheets[rollNum] = true
						continue
					}
					if err := copyFile(src, dst); err != nil {
						fmt.Fprintf(os.Stderr, "  warn: could not copy %s: %v\n", e.Name(), err)
					} else {
						copiedSheets[rollNum] = true
					}
				}
			}
			fmt.Printf("Copied %d contact sheets to Obsidian\n", len(copiedSheets))
		}

		// Group rolls by year
		byYear := make(map[int][]roll.Roll)
		for _, r := range rolls {
			var year int
			if !r.Metadata.ShotAt.IsZero() {
				year = r.Metadata.ShotAt.Year()
			} else if !r.Metadata.ScannedAt.IsZero() {
				year = r.Metadata.ScannedAt.Year()
			} else {
				continue
			}
			byYear[year] = append(byYear[year], r)
		}

		years := make([]int, 0, len(byYear))
		for y := range byYear {
			years = append(years, y)
		}
		sort.Sort(sort.Reverse(sort.IntSlice(years)))

		for _, year := range years {
			yearRolls := byYear[year]
			// Newest first
			sort.Slice(yearRolls, func(i, j int) bool {
				return yearRolls[i].Metadata.RollNumber > yearRolls[j].Metadata.RollNumber
			})

			content := renderYearNote(year, yearRolls, copiedSheets)
			outPath := filepath.Join(cfg.ObsidianRollsPath, fmt.Sprintf("%d.md", year))

			if dryRun {
				fmt.Printf("[dry-run] would write %s (%d rolls)\n", outPath, len(yearRolls))
				continue
			}

			if err := os.WriteFile(outPath, []byte(content), 0644); err != nil {
				return fmt.Errorf("failed to write %s: %w", outPath, err)
			}
			fmt.Printf("Wrote %s (%d rolls)\n", outPath, len(yearRolls))
		}

		return nil
	},
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

func renderYearNote(year int, rolls []roll.Roll, sheets map[string]bool) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# Film Log %d\n\n", year)

	for _, r := range rolls {
		cam := cameraDisplay(r.Metadata.CameraID)
		film := filmDisplay(r.Metadata.FilmID)

		fmt.Fprintf(&sb, "## %s %s\n\n", cam, film)

		if sheets[r.Metadata.RollNumber] {
			fmt.Fprintf(&sb, "![](images/%s.webp)\n\n", r.Metadata.RollNumber)
		}

		fmt.Fprintf(&sb, "---\n\n")
	}

	fmt.Fprintf(&sb, "_Updated %s_\n", time.Now().Format("2006-01-02"))
	return sb.String()
}

func cameraDisplay(id string) string {
	if id == "" {
		return "—"
	}
	cam, ok := cfg.Cameras[id]
	if !ok {
		return id
	}
	if cam.Nickname != "" {
		return cam.Nickname
	}
	return cam.Brand + " " + cam.Model
}

func filmDisplay(id string) string {
	if id == "" {
		return "—"
	}
	film, ok := cfg.Films[id]
	if !ok {
		return id
	}
	if film.Nickname != "" {
		return film.Nickname
	}
	name := film.Brand + " " + film.Name
	if film.ShowIso && film.Iso > 0 {
		name += fmt.Sprintf(" %d", film.Iso)
	}
	return name
}
