package cli

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/cli/roll"
)

var auditCmd = &cobra.Command{
	Use:   "audit",
	Short: "Report rolls with missing or unmatched camera/film IDs",
	Long: `Reads all local roll.md files and reports:
  - camera/film IDs that have no match in cameras.yml / films.yml
  - rolls with no camera or film set at all

Use --fix to automatically rewrite fuzzy-matched IDs to their canonical slug.
These rolls will have no camera_uuid / film_uuid after 'rolls push'.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		fix, _ := cmd.Flags().GetBool("fix")

		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return err
		}

		// seed known sets from config
		knownCameras := make(map[string]bool)
		for id := range cfg.Cameras {
			knownCameras[id] = true
		}
		knownFilms := make(map[string]bool)
		for id := range cfg.Films {
			knownFilms[id] = true
		}

		// unknown ID → roll numbers using it
		unknownCameras := make(map[string][]string)
		unknownFilms := make(map[string][]string)
		var missingCamera, missingFilm []string

		// cameraRemap/filmRemap: raw ID → canonical slug (for --fix)
		cameraRemap := make(map[string]string)
		filmRemap := make(map[string]string)

		for _, r := range rolls {
			num := r.Metadata.RollNumber

			cam := r.Metadata.CameraID
			switch {
			case cam == "":
				missingCamera = append(missingCamera, num)
			case !knownCameras[cam]:
				if canon, ok := findSimilarCamera(cam, cfg.Cameras); ok {
					cameraRemap[cam] = canon
				} else {
					unknownCameras[cam] = append(unknownCameras[cam], num)
				}
				knownCameras[cam] = true
			}

			film := r.Metadata.FilmID
			switch {
			case film == "":
				missingFilm = append(missingFilm, num)
			case !knownFilms[film]:
				if canon, ok := findSimilarFilm(film, cfg.Films); ok {
					filmRemap[film] = canon
				} else {
					unknownFilms[film] = append(unknownFilms[film], num)
				}
				knownFilms[film] = true
			}
		}

		// --fix: rewrite roll.md files with canonical slugs
		if fix && (len(cameraRemap) > 0 || len(filmRemap) > 0) {
			fixed := 0
			for i := range rolls {
				r := &rolls[i]
				newCam := cameraRemap[r.Metadata.CameraID]
				newFilm := filmRemap[r.Metadata.FilmID]
				if newCam == "" && newFilm == "" {
					continue
				}
				if newCam != "" {
					fmt.Printf("  %s: camera %q → %q\n", r.Metadata.RollNumber, r.Metadata.CameraID, newCam)
				}
				if newFilm != "" {
					fmt.Printf("  %s: film   %q → %q\n", r.Metadata.RollNumber, r.Metadata.FilmID, newFilm)
				}
				if err := r.SetCameraFilm(newCam, newFilm); err != nil {
					fmt.Printf("  error updating %s: %v\n", r.Metadata.RollNumber, err)
				} else {
					fixed++
				}
			}
			fmt.Printf("Fixed %d roll(s).\n\n", fixed)
		} else if len(cameraRemap) > 0 || len(filmRemap) > 0 {
			fmt.Println("IDs with a fuzzy match (run with --fix to rewrite):")
			for raw, canon := range cameraRemap {
				fmt.Printf("  camera %-30s → %s\n", raw, canon)
			}
			for raw, canon := range filmRemap {
				fmt.Printf("  film   %-30s → %s\n", raw, canon)
			}
			fmt.Println()
		}

		issues := 0

		if len(unknownCameras) > 0 {
			issues++
			fmt.Println("Cameras with no match in cameras.yml:")
			for _, id := range sortedKeys(unknownCameras) {
				rolls := unknownCameras[id]
				fmt.Printf("  %-32s %d roll(s): %v\n", id, len(rolls), rolls)
			}
			fmt.Println()
		}

		if len(unknownFilms) > 0 {
			issues++
			fmt.Println("Films with no match in films.yml:")
			for _, id := range sortedKeys(unknownFilms) {
				rolls := unknownFilms[id]
				fmt.Printf("  %-32s %d roll(s): %v\n", id, len(rolls), rolls)
			}
			fmt.Println()
		}

		if len(missingCamera) > 0 {
			issues++
			fmt.Printf("Rolls with no camera set (%d): %v\n", len(missingCamera), missingCamera)
		}

		if len(missingFilm) > 0 {
			issues++
			fmt.Printf("Rolls with no film set (%d): %v\n", len(missingFilm), missingFilm)
		}

		if issues == 0 && len(cameraRemap) == 0 && len(filmRemap) == 0 {
			fmt.Printf("OK — all %d rolls have matched cameras and films.\n", len(rolls))
		}

		// --merge-dupes: find other .md files in roll folders and merge into roll.md
		mergeDupes, _ := cmd.Flags().GetBool("merge-dupes")
		{
			// Always report dupes; only merge when --merge-dupes is set
			_ = filepath.Walk(cfg.ScansPath, func(path string, info os.FileInfo, err error) error {
				if err != nil || info.IsDir() || filepath.Base(path) == "roll.md" {
					return nil
				}
				if filepath.Ext(path) != ".md" {
					return nil
				}
				dir := filepath.Dir(path)
				rollMdPath := filepath.Join(dir, "roll.md")
				if _, statErr := os.Stat(rollMdPath); os.IsNotExist(statErr) {
					return nil // no roll.md alongside it — skip
				}

				other, parseErr := roll.FromMarkdown(path)
				if parseErr != nil || other.Metadata.RollNumber == "" {
					return nil // not a roll file
				}
				primary, parseErr := roll.FromMarkdown(rollMdPath)
				if parseErr != nil {
					return nil
				}

				fmt.Printf("dupe: %s  (alongside %s)\n", path, rollMdPath)
				if !mergeDupes {
					return nil
				}

				primary.MergeFrom(other)
				if err := primary.WriteRollMd(); err != nil {
					fmt.Fprintf(os.Stderr, "  error writing roll.md: %v\n", err)
					return nil
				}
				if err := os.Remove(path); err != nil {
					fmt.Fprintf(os.Stderr, "  error removing %s: %v\n", path, err)
				} else {
					fmt.Printf("  merged into roll.md and removed %s\n", filepath.Base(path))
				}
				return nil
			})
		}

		return nil
	},
}

func sortedKeys(m map[string][]string) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func init() {
	rootCmd.AddCommand(auditCmd)
	auditCmd.Flags().Bool("fix", false, "Rewrite fuzzy-matched camera/film IDs to their canonical slug")
	auditCmd.Flags().Bool("merge-dupes", false, "Merge other .md files in roll folders into roll.md and delete them")
}
