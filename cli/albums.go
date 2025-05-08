package cli

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
	"golang.org/x/exp/slices"
)

// albumsCmd represents the albums command
var albumsCmd = &cobra.Command{
	Use:    "albums",
	Short:  "Manage Lightroom albums for rolls",
	Hidden: false,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		if len(args) > 0 && year != 0 {
			return errors.New("You can only set year or the rolls not both")
		}

		fmt.Println(style.RenderTitle("🔄", "Connecting to Lightroom API..."))
		api := lightroom.New(cfg.ClientID, cfg.AccessToken)
		albums, err := api.Albums(cfg)
		cobra.CheckErr(err)

		// Get all rolls from your rolls directory
		fmt.Println(style.RenderTitle("📝", "Loading rolls from scans directory..."))
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return fmt.Errorf("failed to load rolls: %w", err)
		}

		// Filter rolls based on year
		if year != 0 {
			rolls = roll.Filter(rolls, func(r roll.Roll) bool {
				return (r.Metadata.ShotAt.Year() == year) || (r.Metadata.ScannedAt.Year() == year)
			})
			if len(rolls) == 0 {
				return fmt.Errorf("no rolls found for year %d", year)
			}
		}

		// Group rolls by year
		rollsByYear := make(map[string][]roll.Roll)
		for _, r := range rolls {
			year := r.Metadata.ShotAt.Format("2006")
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// Get all albums under the root scans album
		root := &cfg.ScansAlbumID
		children, err := albums.GetChildrenAlbums(*root)
		if err != nil {
			return fmt.Errorf("failed to get children albums: %w", err)
		}

		// Track missing albums by year
		missingAlbums := make(map[string][]struct {
			rollNumber string
			fullName   string
		})

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
		} else {
			fmt.Println(style.RenderSuccess("✨ All local rolls have corresponding albums in Lightroom"))
		}

		return nil
	},
}

// compareCmd represents the compare command
var compareCmd = &cobra.Command{
	Use:   "compare",
	Short: "Compare Lightroom albums with local rolls",
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.PersistentFlags().GetInt("year")
		if err != nil {
			return err
		}

		api := lightroom.New(cfg.ClientID, cfg.AccessToken)
		albums, err := api.Albums(cfg)
		cobra.CheckErr(err)

		// Get all rolls from your rolls directory
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return fmt.Errorf("failed to load rolls: %w", err)
		}

		// Filter rolls based on year
		if year != 0 {
			rolls = roll.Filter(rolls, func(r roll.Roll) bool {
				return (r.Metadata.ShotAt.Year() == year) || (r.Metadata.ScannedAt.Year() == year)
			})
			if len(rolls) == 0 {
				return fmt.Errorf("no rolls found for year %d", year)
			}
		}

		// Group rolls by year
		rollsByYear := make(map[string][]roll.Roll)
		for _, r := range rolls {
			year := r.Metadata.ShotAt.Format("2006")
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// Get all albums under the root scans album
		root := &cfg.ScansAlbumID
		children, err := albums.GetChildrenAlbums(*root)
		if err != nil {
			return fmt.Errorf("failed to get children albums: %w", err)
		}

		// Track missing albums by year
		missingAlbums := make(map[string][]struct {
			rollNumber string
			fullName   string
		})

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
			fmt.Println("Albums to create:")
			for year, missing := range missingAlbums {
				fmt.Printf("%s:\n", year)
				for _, m := range missing {
					fmt.Printf("%s\n", m.fullName)
				}
			}
		} else {
			fmt.Println("All local rolls have corresponding albums in Lightroom")
		}

		// Now check file contents for existing albums
		fmt.Println("\nChecking file contents in existing albums...")
		for year, yearRolls := range rollsByYear {
			// Find year album
			var yearAlbum *openapi.GetAlbums200ResponseResourcesInner
			for _, album := range children.Resources {
				if *album.Payload.Name == year {
					yearAlbum = &album
					break
				}
			}

			if yearAlbum == nil {
				continue
			}

			// Get roll albums for this year
			yearChildren, err := albums.GetChildrenAlbums(*yearAlbum.Id)
			if err != nil {
				return fmt.Errorf("failed to get children of year album %s: %w", year, err)
			}

			// For each roll in this year
			for _, r := range yearRolls {
				// Find the roll album
				var rollAlbum *openapi.GetAlbums200ResponseResourcesInner
				albumName := formatAlbumName(r)
				for _, album := range yearChildren.Resources {
					if *album.Payload.Name == albumName {
						rollAlbum = &album
						break
					}
				}

				if rollAlbum == nil {
					continue // Skip if album doesn't exist
				}

				// Get files in the roll folder
				files, err := os.ReadDir(r.Folder)
				if err != nil {
					return fmt.Errorf("failed to read roll folder %s: %w", r.Folder, err)
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
					fmt.Printf("⚠️  No image files found in roll %s\n", r.Metadata.RollNumber)
					continue
				}

				fmt.Printf("\n%s\n", style.RenderTitle("📸", fmt.Sprintf("Roll %s (%d files)", r.Metadata.RollNumber, len(imageFiles))))

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
		}

		return nil
	},
}

func formatAlbumName(r roll.Roll) string {
	camera := cfg.Cameras[r.Metadata.CameraID]
	film := cfg.Films[r.Metadata.FilmID]
	if camera == nil {
		splitted := strings.SplitN(r.Metadata.CameraID, " ", 2)
		if len(splitted) == 2 {
			camera = &roll.Camera{
				Brand: splitted[0],
				Model: splitted[1],
			}
		} else {
			camera = &roll.Camera{
				Brand: splitted[0],
				Model: "Unknown",
			}
		}
	}
	if film == nil {
		film = &roll.Film{
			Nickname: r.Metadata.FilmID,
			ShowIso:  false,
		}
	}
	return fmt.Sprintf("%s - %s - %s", r.Metadata.RollNumber, camera.Name(), film.NameWithBrand())
}

func init() {
	rootCmd.AddCommand(albumsCmd)
	albumsCmd.PersistentFlags().Int("year", 0, "Filter by year")
	albumsCmd.AddCommand(compareCmd)
	compareCmd.PersistentFlags().Int("year", 0, "Filter by year")
}
