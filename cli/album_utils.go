package cli

import (
	"fmt"

	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/roll"
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
