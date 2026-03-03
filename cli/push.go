package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

type importPayload struct {
	Cameras []cameraJSON `json:"cameras"`
	Films   []filmJSON   `json:"films"`
	Rolls   []rollJSON   `json:"rolls"`
}

type cameraJSON struct {
	ID       string `json:"id"`
	Brand    string `json:"brand"`
	Model    string `json:"model"`
	Nickname string `json:"nickname,omitempty"`
	Format   int    `json:"format"`
}

type filmJSON struct {
	ID       string `json:"id"`
	Brand    string `json:"brand"`
	Name     string `json:"name"`
	Nickname string `json:"nickname,omitempty"`
	Iso      int    `json:"iso"`
	Color    bool   `json:"color"`
	ShowIso  bool   `json:"show_iso"`
}

type rollJSON struct {
	RollNumber  string     `json:"roll_number"`
	CameraID    string     `json:"camera_id"`
	FilmID      string     `json:"film_id"`
	ShotAt      *time.Time `json:"shot_at,omitempty"`
	FridgeAt    *time.Time `json:"fridge_at,omitempty"`
	LabAt       *time.Time `json:"lab_at,omitempty"`
	LabName     string     `json:"lab_name,omitempty"`
	ScannedAt   *time.Time `json:"scanned_at,omitempty"`
	ProcessedAt *time.Time `json:"processed_at,omitempty"`
	UploadedAt  *time.Time `json:"uploaded_at,omitempty"`
	ArchivedAt  *time.Time `json:"archived_at,omitempty"`
	AlbumName   string     `json:"album_name,omitempty"`
	Tags        []string   `json:"tags,omitempty"`
	Notes       string     `json:"notes,omitempty"`
}

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push local rolls data to the web app",
	Long:  `Reads all local cameras, films, and rolls and uploads them to the web app via the import API.`,
	Run: func(cmd *cobra.Command, args []string) {
		if cfg.WebAppURL == "" {
			cobra.CheckErr(fmt.Errorf("web_app_url is not set in config"))
		}
		if cfg.WebAppAPIKey == "" {
			cobra.CheckErr(fmt.Errorf("web_app_api_key is not set in config"))
		}

		payload := importPayload{}

		// Collect cameras
		for id, camera := range cfg.Cameras {
			payload.Cameras = append(payload.Cameras, cameraJSON{
				ID:       id,
				Brand:    camera.Brand,
				Model:    camera.Model,
				Nickname: camera.Nickname,
				Format:   camera.Format,
			})
		}

		// Collect films
		for id, film := range cfg.Films {
			payload.Films = append(payload.Films, filmJSON{
				ID:       id,
				Brand:    film.Brand,
				Name:     film.Name,
				Nickname: film.Nickname,
				Iso:      film.Iso,
				Color:    film.Color,
				ShowIso:  film.ShowIso,
			})
		}

		// Build lookup sets for known camera/film IDs
		knownCameras := make(map[string]bool)
		for id := range cfg.Cameras {
			knownCameras[id] = true
		}
		knownFilms := make(map[string]bool)
		for id := range cfg.Films {
			knownFilms[id] = true
		}

		// Collect rolls from scans path
		rolls, err := roll.GetRolls(cfg.ScansPath)
		cobra.CheckErr(err)

		// Also collect in-progress rolls from the Obsidian vault (01 Loaded, 02 Fridge, 03 Scanned)
		if cfg.ObsidianRollsPath != "" {
			obsidianRolls, err := roll.GetFlatRolls(cfg.ObsidianRollsPath)
			cobra.CheckErr(err)

			// Merge: scans rolls take priority (they have more metadata)
			seen := make(map[string]bool)
			for _, r := range rolls {
				seen[r.Metadata.RollNumber] = true
			}
			added := 0
			for _, r := range obsidianRolls {
				if !seen[r.Metadata.RollNumber] {
					rolls = append(rolls, r)
					added++
				}
			}
			if added > 0 {
				fmt.Printf("  + %d rolls from Obsidian vault\n", added)
			}
		}

		// Synthesize stub entries for any camera/film IDs not in the YAML files
		for _, r := range rolls {
			if r.Metadata.CameraID != "" && !knownCameras[r.Metadata.CameraID] {
				fmt.Printf("  note: unknown camera %q — adding stub\n", r.Metadata.CameraID)
				payload.Cameras = append(payload.Cameras, cameraJSON{
					ID:    r.Metadata.CameraID,
					Brand: r.Metadata.CameraID,
					Model: "unknown",
				})
				knownCameras[r.Metadata.CameraID] = true
			}
			if r.Metadata.FilmID != "" && !knownFilms[r.Metadata.FilmID] {
				fmt.Printf("  note: unknown film %q — adding stub\n", r.Metadata.FilmID)
				payload.Films = append(payload.Films, filmJSON{
					ID:    r.Metadata.FilmID,
					Brand: r.Metadata.FilmID,
					Name:  "unknown",
					Color: true,
				})
				knownFilms[r.Metadata.FilmID] = true
			}
		}

		for _, r := range rolls {
			rj := rollJSON{
				RollNumber: r.Metadata.RollNumber,
				CameraID:   r.Metadata.CameraID,
				FilmID:     r.Metadata.FilmID,
				Tags:       r.Metadata.Tags,
				Notes:      r.Content,
				AlbumName:  r.Metadata.AlbumName,
				LabName:    r.Metadata.LabName,
			}
			if !r.Metadata.ShotAt.IsZero() {
				t := r.Metadata.ShotAt
				rj.ShotAt = &t
			}
			if !r.Metadata.FridgeAt.IsZero() {
				t := r.Metadata.FridgeAt
				rj.FridgeAt = &t
			}
			if !r.Metadata.LabAt.IsZero() {
				t := r.Metadata.LabAt
				rj.LabAt = &t
			}
			if !r.Metadata.ScannedAt.IsZero() {
				t := r.Metadata.ScannedAt
				rj.ScannedAt = &t
			}
			if !r.Metadata.ProcessedAt.IsZero() {
				t := r.Metadata.ProcessedAt
				rj.ProcessedAt = &t
			}
			if !r.Metadata.UploadedAt.IsZero() {
				t := r.Metadata.UploadedAt
				rj.UploadedAt = &t
			}
			if !r.Metadata.ArchivedAt.IsZero() {
				t := r.Metadata.ArchivedAt
				rj.ArchivedAt = &t
			}
			payload.Rolls = append(payload.Rolls, rj)
		}

		body, err := json.Marshal(payload)
		cobra.CheckErr(err)

		url := cfg.WebAppURL + "/api/import"
		req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
		cobra.CheckErr(err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+cfg.WebAppAPIKey)

		client := &http.Client{Timeout: 60 * time.Second}
		resp, err := client.Do(req)
		cobra.CheckErr(err)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			cobra.CheckErr(fmt.Errorf("import failed with status %s", resp.Status))
		}

		fmt.Printf("Pushed %d cameras, %d films, %d rolls\n",
			len(payload.Cameras), len(payload.Films), len(payload.Rolls))
	},
}

func init() {
	rootCmd.AddCommand(pushCmd)
}
