package cli

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
	"golang.org/x/exp/slices"
)

// albumsCmd represents the albums command
var albumsCmd = &cobra.Command{
	Use:    "albums",
	Short:  "Manage Lightroom albums for rolls",
	Hidden: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		if len(args) > 0 && year != 0 {
			return errors.New("You can only set year or the rolls not both")
		}

		api := lightroom.New(cfg.ClientID, cfg.AccessToken)
		albums, err := api.Albums(cfg)
		cobra.CheckErr(err)

		err = ensureRollAlbums(albums, year, args)
		cobra.CheckErr(err)
		return nil
	},
}

// compareCmd represents the compare command
var compareCmd = &cobra.Command{
	Use:   "compare",
	Short: "Compare Lightroom albums with local rolls",
	RunE: func(cmd *cobra.Command, args []string) error {
		api := lightroom.New(cfg.ClientID, cfg.AccessToken)
		albums, err := api.Albums(cfg)
		cobra.CheckErr(err)

		// Get all rolls from your rolls directory
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return fmt.Errorf("failed to load rolls: %w", err)
		}

		// Group rolls by year
		rollsByYear := make(map[string][]roll.Roll)
		for _, r := range rolls {
			year := r.Metadata.ShotAt.Format("2006")
			rollsByYear[year] = append(rollsByYear[year], r)
		}

		// Get all albums under the root scans album
		rootAlbum := &cfg.ScansAlbumID
		children, err := albums.GetChildrenAlbums(*rootAlbum)
		if err != nil {
			return fmt.Errorf("failed to get children albums: %w", err)
		}

		// Track missing albums by year
		missingAlbums := make(map[string][]struct {
			rollNumber string
			fullName   string
		})

		// Compare year albums
		fmt.Println("Checking year albums...")
		for year := range rollsByYear {
			found := false
			for _, album := range children.Resources {
				if *album.Payload.Name == year {
					found = true
					break
				}
			}
			if !found {
				fmt.Printf("Missing year album: %s\n", year)
			}
		}

		// Compare roll albums under each year
		fmt.Println("\nChecking roll albums...")
		for year, yearRolls := range rollsByYear {
			// Find the year album
			var yearAlbum *openapi.GetAlbums200ResponseResourcesInner
			for _, album := range children.Resources {
				if *album.Payload.Name == year {
					yearAlbum = &album
					break
				}
			}
			if yearAlbum == nil {
				fmt.Printf("Skipping year %s as album not found\n", year)
				continue
			}

			// Get roll albums under this year
			rollAlbums, err := albums.GetChildrenAlbums(*yearAlbum.Id)
			if err != nil {
				return fmt.Errorf("failed to get roll albums for year %s: %w", year, err)
			}

			// Compare each roll
			for _, r := range yearRolls {
				found := false
				for _, album := range rollAlbums.Resources {
					// Extract roll number from album name (format: "ROLL_NUMBER - CAMERA - FILM")
					parts := strings.SplitN(*album.Payload.Name, " - ", 2)
					if len(parts) > 0 && parts[0] == r.Metadata.RollNumber {
						found = true
						break
					}
				}
				if !found {
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

		// Print summary of missing albums
		if len(missingAlbums) > 0 {
			fmt.Println("\nSummary of missing albums to create:")
			fmt.Println("====================================")
			for year, missing := range missingAlbums {
				fmt.Printf("\nYear %s:\n", year)
				for _, album := range missing {
					fmt.Printf("  - %s\n", album.fullName)
				}
			}
		} else {
			fmt.Println("\nNo missing albums found!")
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

func ensureRollAlbums(albums *lightroom.Albums, year int, rollNumbers []string) error {
	// Get all rolls from your rolls directory
	rolls, err := roll.GetRolls(cfg.ScansPath)
	if err != nil {
		return fmt.Errorf("failed to load rolls: %w", err)
	}

	// Filter rolls based on year or roll numbers
	rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
		if len(rollNumbers) > 0 {
			return slices.Contains(rollNumbers, roll.Metadata.RollNumber)
		}
		return year == 0 || (roll.Metadata.ShotAt.Year() == year) ||
			(roll.Metadata.ScannedAt.Year() == year)
	})

	// Group rolls by year
	rollsByYear := make(map[string][]roll.Roll)
	for _, r := range rolls {
		year := r.Metadata.ShotAt.Format("2006")
		rollsByYear[year] = append(rollsByYear[year], r)
	}

	// For each year, ensure year album exists and create roll albums
	for year, yearRolls := range rollsByYear {
		// Ensure year album exists under root album
		yearAlbum, err := albums.EnsureAlbumUnder(&cfg.ScansAlbumID, year, "collection_set")
		if err != nil {
			return fmt.Errorf("failed to ensure year album %s: %w", year, err)
		}

		// Create albums for each roll under the year album
		for _, r := range yearRolls {
			albumName := formatAlbumName(r)
			_, err = albums.EnsureAlbumUnder(yearAlbum.Id, albumName, "collection")
			if err != nil {
				return fmt.Errorf("failed to ensure roll album %s: %w", albumName, err)
			}
		}
	}

	return nil
}

func init() {
	rootCmd.AddCommand(albumsCmd)
	albumsCmd.PersistentFlags().Int("year", 0, "Filter by year")
	albumsCmd.AddCommand(compareCmd)
}
