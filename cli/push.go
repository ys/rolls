package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/cli/roll"
)

var reNonAlnum = regexp.MustCompile(`[^a-z0-9]`)

func normStr(s string) string {
	return reNonAlnum.ReplaceAllString(strings.ToLower(s), "")
}

// matchScore returns how specifically the unknown string matches a set of candidates.
// Higher score = more specific match. Zero means no match.
func matchScore(nu string, candidates ...string) int {
	best := 0
	for _, c := range candidates {
		nc := normStr(c)
		if nc == "" {
			continue
		}
		var score int
		if nu == nc {
			score = 1000 + len(nc) // exact match wins outright
		} else if len(nc) >= 4 && strings.Contains(nu, nc) {
			score = len(nc) // longer candidate = more specific containment
		} else if len(nu) >= 4 && strings.Contains(nc, nu) {
			score = len(nu)
		}
		if score > best {
			best = score
		}
	}
	return best
}

func findSimilarCamera(unknownID string, cameras roll.Cameras) (string, bool) {
	nu := normStr(unknownID)
	if len(nu) < 3 {
		return "", false
	}
	bestID, bestScore := "", 0
	for id, cam := range cameras {
		score := matchScore(nu, id, cam.Brand+" "+cam.Model, cam.Nickname)
		if score > bestScore {
			bestScore = score
			bestID = id
		}
	}
	if bestScore >= 4 {
		return bestID, true
	}
	return "", false
}

func findSimilarFilm(unknownID string, films roll.Films) (string, bool) {
	nu := normStr(unknownID)
	if len(nu) < 3 {
		return "", false
	}
	bestID, bestScore := "", 0
	for id, film := range films {
		isoSuffix := ""
		if film.Iso > 0 {
			isoSuffix = fmt.Sprintf("%d", film.Iso)
		}
		score := matchScore(nu,
			id,
			film.Brand+" "+film.Name+" "+isoSuffix,
			film.Name+" "+isoSuffix,
			film.Brand+" "+film.Name,
			film.Nickname,
		)
		if score > bestScore {
			bestScore = score
			bestID = id
		}
	}
	if bestScore >= 4 {
		return bestID, true
	}
	return "", false
}

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
	AlbumName       string     `json:"album_name,omitempty"`
	Tags            []string   `json:"tags,omitempty"`
	Notes           string     `json:"notes,omitempty"`
	ContactSheetURL string     `json:"contact_sheet_url,omitempty"`
}

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push local rolls data to the web app",
	Long: `Reads all local cameras, films, and roll.md files and bulk-upserts them
to the web app. Also uploads any contact sheet images not yet on the web.

Unknown camera/film IDs are fuzzy-matched to known entries, or added as stubs.
Note: does not set processed_at. Use 'rolls process' for that.`,
	Run: func(cmd *cobra.Command, args []string) {
		dryRun, _ := cmd.Flags().GetBool("dry-run")
		sheetsOnly, _ := cmd.Flags().GetBool("sheets")
		year, _ := cmd.Flags().GetInt("year")

		if cfg.URL() == "" {
			cobra.CheckErr(fmt.Errorf("web_app_url is not set in config"))
		}
		if cfg.APIKey() == "" {
			cobra.CheckErr(fmt.Errorf("web_app_api_key is not set in config"))
		}

		if sheetsOnly {
			uploadContactSheets(dryRun, nil, nil)
			return
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
		if year != 0 {
			rolls = roll.Filter(rolls, func(r roll.Roll) bool {
				return r.Metadata.ShotAt.Year() == year || r.Metadata.ScannedAt.Year() == year
			})
		}

		// For unknown camera/film IDs: try fuzzy-match to a known entry first,
		// only fall back to a stub if nothing similar is found.
		cameraRemap := make(map[string]string)
		filmRemap := make(map[string]string)

		for _, r := range rolls {
			if r.Metadata.CameraID != "" && !knownCameras[r.Metadata.CameraID] {
				if canonID, ok := findSimilarCamera(r.Metadata.CameraID, cfg.Cameras); ok {
					fmt.Printf("  mapped camera %q → %q\n", r.Metadata.CameraID, canonID)
					cameraRemap[r.Metadata.CameraID] = canonID
				} else {
					fmt.Printf("  note: unknown camera %q — adding stub\n", r.Metadata.CameraID)
					payload.Cameras = append(payload.Cameras, cameraJSON{
						ID:    r.Metadata.CameraID,
						Brand: r.Metadata.CameraID,
						Model: "unknown",
					})
				}
				knownCameras[r.Metadata.CameraID] = true
			}
			if r.Metadata.FilmID != "" && !knownFilms[r.Metadata.FilmID] {
				if canonID, ok := findSimilarFilm(r.Metadata.FilmID, cfg.Films); ok {
					fmt.Printf("  mapped film   %q → %q\n", r.Metadata.FilmID, canonID)
					filmRemap[r.Metadata.FilmID] = canonID
				} else {
					fmt.Printf("  note: unknown film %q — adding stub\n", r.Metadata.FilmID)
					payload.Films = append(payload.Films, filmJSON{
						ID:    r.Metadata.FilmID,
						Brand: r.Metadata.FilmID,
						Name:  "unknown",
						Color: true,
					})
				}
				knownFilms[r.Metadata.FilmID] = true
			}
		}

		for _, r := range rolls {
			cameraID := r.Metadata.CameraID
			if mapped, ok := cameraRemap[cameraID]; ok {
				cameraID = mapped
			}
			filmID := r.Metadata.FilmID
			if mapped, ok := filmRemap[filmID]; ok {
				filmID = mapped
			}
			rj := rollJSON{
				RollNumber: r.Metadata.RollNumber,
				CameraID:   cameraID,
				FilmID:     filmID,
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

		if dryRun {
			fmt.Printf("[dry-run] would push %d cameras, %d films, %d rolls\n",
				len(payload.Cameras), len(payload.Films), len(payload.Rolls))
		} else {
			body, err := json.Marshal(payload)
			cobra.CheckErr(err)

			url := cfg.URL() + "/api/import"
			req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
			cobra.CheckErr(err)
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+cfg.APIKey())

			client := &http.Client{Timeout: 60 * time.Second}
			resp, err := client.Do(req)
			cobra.CheckErr(err)
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				cobra.CheckErr(fmt.Errorf("import failed with status %s", resp.Status))
			}

			fmt.Printf("Pushed %d cameras, %d films, %d rolls\n",
				len(payload.Cameras), len(payload.Films), len(payload.Rolls))
		}

		var allowRolls map[string]bool
		if year != 0 {
			allowRolls = make(map[string]bool, len(payload.Rolls))
			for _, r := range payload.Rolls {
				allowRolls[r.RollNumber] = true
			}
		}
		uploadContactSheets(dryRun, payload.Rolls, allowRolls)
	},
}

// uploadContactSheets uploads all .webp files from contact_sheet_path/images/ to R2.
// If knownRolls is non-nil, rolls that already have a contact_sheet_url are skipped.
// Pass nil to force-upload all (used by --sheets).
// uploadContactSheets uploads .webp files from contact_sheet_path/images/ to R2.
// knownRolls: if non-nil, rolls with a contact_sheet_url are skipped (normal push).
// allowOnly:  if non-nil, only roll numbers in this set are uploaded (--year filter).
func uploadContactSheets(dryRun bool, knownRolls []rollJSON, allowOnly map[string]bool) {
	if cfg.ContactSheetPath == "" {
		return
	}

	skip := make(map[string]bool)
	if knownRolls != nil {
		for _, r := range knownRolls {
			if r.ContactSheetURL != "" {
				skip[r.RollNumber] = true
			}
		}
	}

	imagesDir := filepath.Join(cfg.ContactSheetPath, "images")
	entries, err := os.ReadDir(imagesDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "warn: could not read %s: %v\n", imagesDir, err)
		return
	}

	uploaded, skipped, failed := 0, 0, 0
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".webp" {
			continue
		}
		rollNum := entry.Name()[:len(entry.Name())-5]
		if allowOnly != nil && !allowOnly[rollNum] {
			continue
		}
		if skip[rollNum] {
			skipped++
			continue
		}
		if dryRun {
			fmt.Printf("[dry-run] would upload contact sheet for %s\n", rollNum)
			uploaded++
			continue
		}
		imgPath := filepath.Join(cfg.ContactSheetPath, "images", entry.Name())
		data, readErr := os.ReadFile(imgPath)
		if readErr != nil {
			fmt.Fprintf(os.Stderr, "  warn: could not read %s: %v\n", entry.Name(), readErr)
			failed++
			continue
		}
		putURL := cfg.URL() + "/api/rolls/" + rollNum + "/contact-sheet"
		req, _ := http.NewRequest(http.MethodPut, putURL, bytes.NewReader(data))
		req.Header.Set("Content-Type", "image/webp")
		req.Header.Set("Authorization", "Bearer "+cfg.APIKey())
		resp, reqErr := (&http.Client{Timeout: 60 * time.Second}).Do(req)
		if reqErr != nil || resp.StatusCode != http.StatusOK {
			fmt.Fprintf(os.Stderr, "  warn: upload failed for %s\n", rollNum)
			failed++
			if resp != nil {
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
			}
			continue
		}
		io.Copy(io.Discard, resp.Body)
		resp.Body.Close()
		fmt.Printf("  uploaded %s\n", rollNum)
		uploaded++
	}
	if dryRun {
		fmt.Printf("[dry-run] would upload %d contact sheets (%d skipped)\n", uploaded, skipped)
	} else {
		fmt.Printf("Uploaded %d contact sheets (%d skipped, %d failed)\n", uploaded, skipped, failed)
	}
}

func init() {
	rootCmd.AddCommand(pushCmd)
	pushCmd.Flags().Bool("dry-run", false, "Show what would be pushed without sending data")
	pushCmd.Flags().Bool("sheets", false, "Re-upload all contact sheets to R2 (skip metadata import)")
	pushCmd.Flags().Int("year", 0, "Only push rolls from this year")
}
