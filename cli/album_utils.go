package cli

import (
	"fmt"
	"strings"

	"github.com/ys/rolls/cli/lightroom"
	"github.com/ys/rolls/cli/openapi"
	"github.com/ys/rolls/cli/roll"
	"golang.org/x/exp/slices"
)

// getExistingAlbumFilenames returns a map of filenames that exist in the specified album
func getExistingAlbumFilenames(api *lightroom.API, cfg *roll.Config, albumID string) (map[string]bool, error) {
	assets, err := api.GetAlbumAssets(cfg.CatalogID, albumID)
	if err != nil {
		return nil, fmt.Errorf("failed to get album assets: %w", err)
	}

	existingFiles := make(map[string]bool)
	for _, asset := range assets.Resources {
		if asset.Asset != nil && asset.Asset.Payload != nil {
			importSource := asset.Asset.Payload["importSource"].(map[string]interface{})
			if fileName, ok := importSource["fileName"].(string); ok {
				existingFiles[fileName] = true
			}
		}
	}

	return existingFiles, nil
}

// MissingAlbum represents an album that needs to be created
type MissingAlbum struct {
	RollNumber string
	FullName   string
}

// findMissingAlbums identifies which rolls need albums created in Lightroom
func findMissingAlbums(albums *lightroom.Albums, cfg *roll.Config, rolls []roll.Roll) (map[string][]MissingAlbum, error) {
	// Group rolls by year
	rollsByYear := make(map[string][]roll.Roll)
	for _, r := range rolls {
		year := r.Metadata.ShotAt.Format("2006")
		rollsByYear[year] = append(rollsByYear[year], r)
	}

	// Get all albums under the root scans album
	children, err := albums.GetChildrenAlbums(cfg.ScansAlbumID)
	if err != nil {
		return nil, fmt.Errorf("failed to get children albums: %w", err)
	}

	// Track missing albums by year
	missingAlbums := make(map[string][]MissingAlbum)

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
				return nil, fmt.Errorf("failed to get children of year album %s: %w", year, err)
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
				missingAlbums[year] = append(missingAlbums[year], MissingAlbum{
					RollNumber: r.Metadata.RollNumber,
					FullName:   formatAlbumName(r),
				})
			}
		}
	}

	return missingAlbums, nil
}
