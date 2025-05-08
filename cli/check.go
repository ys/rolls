package cli

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

var checkCmd = &cobra.Command{
	Use:   "check [roll_number]",
	Short: "Check if local files match the ones in Lightroom albums",
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.PersistentFlags().GetInt("year")
		if err != nil {
			return err
		}

		if len(args) > 0 && year != 0 {
			return errors.New("you can only set year or the roll number, not both")
		}

		// Get all rolls from your rolls directory
		fmt.Println(style.RenderTitle("📝", "Loading rolls from scans directory..."))
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return fmt.Errorf("failed to load rolls: %w", err)
		}

		// Filter rolls based on year or roll number
		var targetRolls []roll.Roll
		if len(args) > 0 {
			// Find the specific roll
			rollNumber := args[0]
			for _, r := range rolls {
				if r.Metadata.RollNumber == rollNumber {
					targetRolls = append(targetRolls, r)
					break
				}
			}
			if len(targetRolls) == 0 {
				return fmt.Errorf("roll %s not found", rollNumber)
			}
		} else if year != 0 {
			// Filter rolls by year
			for _, r := range rolls {
				if (r.Metadata.ShotAt.Year() == year) || (r.Metadata.ScannedAt.Year() == year) {
					targetRolls = append(targetRolls, r)
				}
			}
			if len(targetRolls) == 0 {
				return fmt.Errorf("no rolls found for year %d", year)
			}
		} else {
			return errors.New("you must provide either a roll number or a year")
		}

		// Get Lightroom API client
		api := lightroom.New(cfg.ClientID, cfg.AccessToken)
		albums, err := api.Albums(cfg)
		if err != nil {
			return fmt.Errorf("failed to get Lightroom albums: %w", err)
		}

		// Get root album children
		children, err := albums.GetChildrenAlbums(cfg.ScansAlbumID)
		if err != nil {
			return fmt.Errorf("failed to get root album children: %w", err)
		}

		// Track missing albums by year
		missingAlbums := make(map[string][]struct {
			rollNumber string
			fullName   string
		})

		// Group rolls by year
		rollsByYear := make(map[string][]roll.Roll)
		for _, r := range targetRolls {
			year := r.Metadata.ShotAt.Format("2006")
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// For each year in local rolls
		for year, yearRolls := range rollsByYear {
			// Find year album
			var yearAlbum *openapi.GetAlbums200ResponseResourcesInner
			for _, album := range children.Resources {
				if *album.Payload.Name == year {
					yearAlbum = &album
					break
				}
			}

			// Get existing roll albums for this year
			var existingRolls []string
			if yearAlbum != nil {
				yearChildren, err := albums.GetChildrenAlbums(*yearAlbum.Id)
				if err != nil {
					return fmt.Errorf("failed to get children of year album %s: %w", year, err)
				}
				for _, child := range yearChildren.Resources {
					// Extract roll number from album name (format: "ROLL_NUMBER - CAMERA - FILM")
					parts := strings.SplitN(*child.Payload.Name, " - ", 2)
					if len(parts) > 0 {
						existingRolls = append(existingRolls, parts[0])
					}
				}
			}

			// Check which rolls need albums
			for _, r := range yearRolls {
				if !slices.Contains(existingRolls, r.Metadata.RollNumber) {
					missingAlbums[year] = append(missingAlbums[year], struct {
						rollNumber string
						fullName   string
					}{
						rollNumber: r.Metadata.RollNumber,
						fullName:   formatAlbumName(r),
					})
				}
			}
		}

		// Print summary of albums to create
		if len(missingAlbums) > 0 {
			fmt.Println(style.RenderTitle("📦", "Albums to create:"))
			for year, missing := range missingAlbums {
				fmt.Println(style.RenderAccent(fmt.Sprintf("\n%s:", year)))
				for _, m := range missing {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  • %s", m.fullName)))
				}
			}
			fmt.Println() // Add a blank line at the end
		}

		// Process each target roll
		for _, targetRoll := range targetRolls {
			// Determine year from ShotAt or ScannedAt
			var year string
			if !targetRoll.Metadata.ShotAt.IsZero() {
				year = targetRoll.Metadata.ShotAt.Format("2006")
			} else {
				year = targetRoll.Metadata.ScannedAt.Format("2006")
			}

			// Find year album
			var yearAlbum *openapi.GetAlbums200ResponseResourcesInner
			for _, album := range children.Resources {
				if *album.Payload.Name == year {
					yearAlbum = &album
					break
				}
			}

			if yearAlbum == nil {
				fmt.Println(style.RenderAccent(fmt.Sprintf("⚠️  No year album found for %s", year)))
				continue
			}

			// Get roll albums for this year
			yearChildren, err := albums.GetChildrenAlbums(*yearAlbum.Id)
			if err != nil {
				return fmt.Errorf("failed to get children of year album %s: %w", year, err)
			}

			// Find the roll album
			var rollAlbum *openapi.GetAlbums200ResponseResourcesInner
			albumName := formatAlbumName(targetRoll)
			for _, album := range yearChildren.Resources {
				if *album.Payload.Name == albumName {
					rollAlbum = &album
					break
				}
			}

			if rollAlbum == nil {
				fmt.Println(style.RenderAccent(fmt.Sprintf("⚠️  No album found for roll %s", targetRoll.Metadata.RollNumber)))
				continue
			}

			// Get files in the roll folder
			files, err := os.ReadDir(targetRoll.Folder)
			if err != nil {
				return fmt.Errorf("failed to read roll folder %s: %w", targetRoll.Folder, err)
			}

			// Filter out non-image files
			var imageFiles []os.DirEntry
			for _, file := range files {
				ext := strings.ToLower(filepath.Ext(file.Name()))
				if isImageFile(ext) {
					imageFiles = append(imageFiles, file)
				}
			}

			if len(imageFiles) == 0 {
				fmt.Println(style.RenderAccent(fmt.Sprintf("⚠️  No image files found in roll %s", targetRoll.Metadata.RollNumber)))
				continue
			}

			fmt.Println(style.RenderTitle("📸", fmt.Sprintf("Roll %s (%d files)", targetRoll.Metadata.RollNumber, len(imageFiles))))

			// Get existing files in the album
			existingFiles, err := getExistingAlbumFilenames(api, cfg, *rollAlbum.Id)
			if err != nil {
				return fmt.Errorf("failed to get album assets: %w", err)
			}

			// Compare local files with album contents
			var missingFiles []string
			var extraFiles []string
			var presentFiles []string
			localFiles := make(map[string]bool)

			// Check which files are missing from the album
			for _, file := range imageFiles {
				localFiles[file.Name()] = true
				if !existingFiles[file.Name()] {
					missingFiles = append(missingFiles, file.Name())
				} else {
					presentFiles = append(presentFiles, file.Name())
				}
			}

			// Check which files are in the album but not locally
			for fileName := range existingFiles {
				if !localFiles[fileName] {
					extraFiles = append(extraFiles, fileName)
				}
			}

			// Print results
			if len(missingFiles) == 0 && len(extraFiles) == 0 {
				fmt.Println(style.RenderSuccess(fmt.Sprintf("  ✨ All %d files are in sync!", len(presentFiles))))

				// Update roll metadata if all files are in sync
				targetRoll.Metadata.AlbumName = albumName
				if err := targetRoll.UpdateMetadata(); err != nil {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  ⚠️  Failed to update roll metadata: %v", err)))
				}
			} else {
				if len(missingFiles) > 0 {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  ⚡️ %d files need to be uploaded:", len(missingFiles))))
					for _, file := range missingFiles {
						fmt.Println(style.RenderAccent(fmt.Sprintf("    - %s", file)))
					}
					fmt.Println() // Add a blank line between sections
				}

				if len(extraFiles) > 0 {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  🔍 %d files in album but not locally:", len(extraFiles))))
					for _, file := range extraFiles {
						fmt.Println(style.RenderAccent(fmt.Sprintf("    - %s", file)))
					}
					fmt.Println() // Add a blank line between sections
				}
			}
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(checkCmd)
	checkCmd.PersistentFlags().Int("year", 0, "Filter by year")
}
