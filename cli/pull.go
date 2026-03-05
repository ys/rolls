package cli

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"gopkg.in/yaml.v2"
)

type exportResponse struct {
	Cameras []cameraJSON `json:"cameras"`
	Films   []filmJSON   `json:"films"`
	Rolls   []rollJSON   `json:"rolls"`
}

var pullCmd = &cobra.Command{
	Use:   "pull",
	Short: "Pull web app data to local files",
	Long: `Fetches all data from the web app and writes it to local files:
  - cameras.yml and films.yml → config dir (~/.config/rolls/)
  - {scans_path}/{roll_number}/roll.md → one markdown file per roll

Use --dry-run to preview what would be written without touching any files.

Requires web_app_url and web_app_api_key to be set in config.
scans_path must be set to write roll files.`,
	Run: func(cmd *cobra.Command, args []string) {
		dryRun, _ := cmd.Flags().GetBool("dry-run")

		if cfg.WebAppURL == "" {
			cobra.CheckErr(fmt.Errorf("web_app_url is not set in config"))
		}
		if cfg.WebAppAPIKey == "" {
			cobra.CheckErr(fmt.Errorf("web_app_api_key is not set in config"))
		}

		url := cfg.WebAppURL + "/api/export"
		req, err := http.NewRequest(http.MethodGet, url, nil)
		cobra.CheckErr(err)
		req.Header.Set("Authorization", "Bearer "+cfg.WebAppAPIKey)

		client := &http.Client{Timeout: 30 * time.Second}
		resp, err := client.Do(req)
		cobra.CheckErr(err)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			cobra.CheckErr(fmt.Errorf("export failed with status %s", resp.Status))
		}

		var data exportResponse
		cobra.CheckErr(json.NewDecoder(resp.Body).Decode(&data))

		configDir := cfg.Dir()

		// Write cameras.yml
		camerasMap := make(map[string]map[string]interface{})
		for _, c := range data.Cameras {
			camerasMap[c.ID] = map[string]interface{}{
				"brand":    c.Brand,
				"model":    c.Model,
				"nickname": c.Nickname,
				"format":   c.Format,
			}
		}
		if dryRun {
			fmt.Printf("[dry-run] would write cameras.yml (%d cameras)\n", len(data.Cameras))
		} else {
			writeyaml(filepath.Join(configDir, "cameras.yml"), camerasMap)
			fmt.Printf("Wrote %d cameras to cameras.yml\n", len(data.Cameras))
		}

		// Write films.yml
		filmsMap := make(map[string]map[string]interface{})
		for _, f := range data.Films {
			filmsMap[f.ID] = map[string]interface{}{
				"brand":    f.Brand,
				"name":     f.Name,
				"nickname": f.Nickname,
				"iso":      f.Iso,
				"color":    f.Color,
				"showiso":  f.ShowIso,
			}
		}
		if dryRun {
			fmt.Printf("[dry-run] would write films.yml (%d films)\n", len(data.Films))
		} else {
			writeyaml(filepath.Join(configDir, "films.yml"), filmsMap)
			fmt.Printf("Wrote %d films to films.yml\n", len(data.Films))
		}

		// Write roll.md for each roll
		if cfg.ScansPath == "" {
			fmt.Println("scans_path not set, skipping roll files")
			return
		}

		// Build camera/film lookup maps for folder name generation
		cameraNames := map[string]string{}
		for _, c := range data.Cameras {
			if c.Nickname != "" {
				cameraNames[c.ID] = strings.ToLower(c.Nickname)
			} else {
				cameraNames[c.ID] = strings.ToLower(c.Brand + " " + c.Model)
			}
		}
		filmNames := map[string]string{}
		for _, f := range data.Films {
			if f.Nickname != "" {
				filmNames[f.ID] = strings.ToLower(f.Nickname)
			} else {
				name := strings.ToLower(f.Brand + " " + f.Name)
				if f.Iso > 0 {
					name += fmt.Sprintf(" %d", f.Iso)
				}
				filmNames[f.ID] = name
			}
		}

		// Pre-scan to find existing roll folders (handles year-nested structures).
		// Tries frontmatter roll_number first; falls back to the directory name
		// prefix (e.g. "25x01" from "25x01-0112-canon eos 33v-kodak portra 400").
		existingFolders := map[string]string{}
		_ = filepath.Walk(cfg.ScansPath, func(path string, info os.FileInfo, err error) error {
			if err != nil || info.IsDir() || filepath.Base(path) != "roll.md" {
				return nil
			}
			dir := filepath.Dir(path)
			r, parseErr := roll.FromMarkdown(path)
			if parseErr == nil && r.Metadata.RollNumber != "" {
				existingFolders[r.Metadata.RollNumber] = dir
				return nil
			}
			// Fall back: first segment of dir name before "-" is the roll number
			dirName := filepath.Base(dir)
			if rollNum := strings.SplitN(dirName, "-", 2)[0]; rollNum != "" {
				existingFolders[rollNum] = dir
			}
			return nil
		})

		written := 0
		for _, r := range data.Rolls {
			if r.RollNumber == "" {
				continue
			}

			// Use existing folder if found, otherwise create with full naming convention:
			// {year}/{roll_number}-{MMDD}-{camera}-{film}/
			rollDir, exists := existingFolders[r.RollNumber]
			if !exists {
				year := "unknown"
				mmdd := ""
				if r.ShotAt != nil {
					year = r.ShotAt.Format("2006")
					mmdd = r.ShotAt.Format("0102")
				} else if r.ScannedAt != nil {
					year = r.ScannedAt.Format("2006")
					mmdd = r.ScannedAt.Format("0102")
				}
				dirName := r.RollNumber
				if mmdd != "" {
					dirName += "-" + mmdd
				}
				if cam := cameraNames[r.CameraID]; cam != "" {
					dirName += "-" + cam
				}
				if film := filmNames[r.FilmID]; film != "" {
					dirName += "-" + film
				}
				rollDir = filepath.Join(cfg.ScansPath, year, dirName)
			}
			rollFile := filepath.Join(rollDir, "roll.md")

			if dryRun {
				fmt.Printf("[dry-run] would write %s\n", rollFile)
				written++
				continue
			}
			if err := os.MkdirAll(rollDir, 0755); err != nil {
				fmt.Fprintf(os.Stderr, "failed to create %s: %v\n", rollDir, err)
				continue
			}
			if err := writeRollMarkdown(rollFile, r); err != nil {
				fmt.Fprintf(os.Stderr, "failed to write %s: %v\n", rollFile, err)
				continue
			}
			written++
		}
		if dryRun {
			fmt.Printf("[dry-run] would write %d roll files\n", written)
		} else {
			fmt.Printf("Wrote %d roll files\n", written)
		}
	},
}

func writeyaml(path string, v interface{}) {
	data, err := yaml.Marshal(v)
	cobra.CheckErr(err)
	cobra.CheckErr(os.WriteFile(path, data, 0644))
}

func writeRollMarkdown(path string, r rollJSON) error {
	var sb strings.Builder
	sb.WriteString("---\n")
	sb.WriteString(fmt.Sprintf("roll_number: %s\n", r.RollNumber))
	sb.WriteString(fmt.Sprintf("camera: %s\n", r.CameraID))
	sb.WriteString(fmt.Sprintf("film: %s\n", r.FilmID))
	if r.ShotAt != nil {
		sb.WriteString(fmt.Sprintf("shot_at: %s\n", r.ShotAt.Format("2006-01-02")))
	}
	if r.FridgeAt != nil {
		sb.WriteString(fmt.Sprintf("fridge_at: %s\n", r.FridgeAt.Format("2006-01-02T15:04:05Z07:00")))
	}
	if r.LabAt != nil {
		sb.WriteString(fmt.Sprintf("lab_at: %s\n", r.LabAt.Format("2006-01-02T15:04:05Z07:00")))
	}
	if r.LabName != "" {
		sb.WriteString(fmt.Sprintf("lab: %s\n", r.LabName))
	}
	if r.ScannedAt != nil {
		sb.WriteString(fmt.Sprintf("scanned_at: %s\n", r.ScannedAt.Format("2006-01-02")))
	}
	if r.ProcessedAt != nil {
		sb.WriteString(fmt.Sprintf("processed_at: %s\n", r.ProcessedAt.Format("2006-01-02T15:04:05Z07:00")))
	}
	if r.UploadedAt != nil {
		sb.WriteString(fmt.Sprintf("uploaded_at: %s\n", r.UploadedAt.Format("2006-01-02T15:04:05Z07:00")))
	}
	if r.ArchivedAt != nil {
		sb.WriteString(fmt.Sprintf("archived_at: %s\n", r.ArchivedAt.Format("2006-01-02T15:04:05Z07:00")))
	}
	if r.AlbumName != "" {
		sb.WriteString(fmt.Sprintf("album_name: %s\n", r.AlbumName))
	}
	if len(r.Tags) > 0 {
		sb.WriteString(fmt.Sprintf("tags: %s\n", strings.Join(r.Tags, ", ")))
	}
	if r.ContactSheetURL != "" {
		sb.WriteString(fmt.Sprintf("contact_sheet_url: %s\n", r.ContactSheetURL))
	}
	sb.WriteString("---\n")
	if r.Notes != "" {
		sb.WriteString(r.Notes)
		sb.WriteString("\n")
	}

	return os.WriteFile(path, []byte(sb.String()), 0644)
}

func init() {
	rootCmd.AddCommand(pullCmd)
	pullCmd.Flags().Bool("dry-run", false, "Show what would be written without writing files")
}
