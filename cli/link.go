package cli

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/barasher/go-exiftool"
	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

var linkCmd = &cobra.Command{
	Use:   "link",
	Short: "Link uploaded assets to film stock and camera albums based on EXIF data",
	RunE: func(cmd *cobra.Command, args []string) error {
		// Get the year filter if provided
		year, err := cmd.Flags().GetInt("year")
		if err != nil {
			return err
		}

		// Get roll number if provided
		rollNumber, err := cmd.Flags().GetString("roll")
		if err != nil {
			return err
		}

		// Get dry-run flag
		dryRun, err := cmd.Flags().GetBool("dry-run")
		if err != nil {
			return err
		}

		if dryRun {
			fmt.Println(style.RenderAccent("🔍 Running in dry-run mode - no changes will be made"))
		}

		// Get all rolls
		rolls, err := roll.GetRolls(cfg.ScansPath)
		if err != nil {
			return err
		}

		// Filter by roll number if specified
		if rollNumber != "" {
			filteredRolls := make([]roll.Roll, 0)
			for _, r := range rolls {
				if r.Metadata.RollNumber == rollNumber {
					filteredRolls = append(filteredRolls, r)
					break
				}
			}
			if len(filteredRolls) == 0 {
				return fmt.Errorf("roll %s not found", rollNumber)
			}
			rolls = filteredRolls
		}

		// Filter by year if specified
		if year > 0 {
			filteredRolls := make([]roll.Roll, 0)
			for _, r := range rolls {
				if r.Metadata.ShotAt.Year() == year {
					filteredRolls = append(filteredRolls, r)
				}
			}
			rolls = filteredRolls
		}

		// Initialize exiftool
		et, err := exiftool.NewExiftool()
		if err != nil {
			return fmt.Errorf("failed to initialize exiftool: %w", err)
		}
		defer et.Close()

		// Initialize Lightroom API client
		api := lightroom.New(cfg.ClientID, cfg.AccessToken)

		// Get all albums from Lightroom
		albums, err := api.Albums(cfg)
		if err != nil {
			return fmt.Errorf("failed to get albums: %w", err)
		}

		// Create a map of album names to IDs
		albumMap := make(map[string]string)
		for _, album := range albums.Resources {
			if album.Payload != nil && album.Payload.Name != nil {
				albumMap[strings.ToLower(*album.Payload.Name)] = *album.Id
			}
		}

		// Process each roll
		for _, r := range rolls {
			fmt.Println(style.RenderTitle("📸", fmt.Sprintf("Processing roll %s", r.Metadata.RollNumber)))

			// Get all files in the roll directory
			files, err := os.ReadDir(r.Folder)
			if err != nil {
				fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to read directory: %v", err)))
				continue
			}

			// Get camera and film info from the first file
			var make, model, filmInfo string
			var found bool
			for _, file := range files {
				if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
					filePath := filepath.Join(r.Folder, file.Name())

					// Extract EXIF data
					metadata := et.ExtractMetadata(filePath)
					if len(metadata) == 0 || metadata[0].Err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to extract EXIF from %s: %v", file.Name(), metadata[0].Err)))
						continue
					}

					// Get camera and film info from EXIF
					make, _ = metadata[0].GetString("Make")
					model, _ = metadata[0].GetString("Model")
					description, _ := metadata[0].GetString("ImageDescription")

					// Extract film info from description
					parts := strings.Split(description, " - ")
					if len(parts) != 2 {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Invalid description format in %s: %s", file.Name(), description)))
						continue
					}

					filmInfo = parts[1]
					found = true
					break
				}
			}

			if !found {
				fmt.Println(style.RenderError("  ⚠️  No valid files found in roll"))
				continue
			}

			// Create album names
			cameraAlbum := fmt.Sprintf("%s %s", make, model)
			filmAlbum := filmInfo

			// Check if albums exist
			cameraAlbumID, hasCameraAlbum := albumMap[strings.ToLower(cameraAlbum)]
			filmAlbumID, hasFilmAlbum := albumMap[strings.ToLower(filmAlbum)]

			if !hasCameraAlbum {
				fmt.Println(style.RenderAccent(fmt.Sprintf("  ℹ️  Camera album not found: %s", cameraAlbum)))
			}
			if !hasFilmAlbum {
				fmt.Println(style.RenderAccent(fmt.Sprintf("  ℹ️  Film album not found: %s", filmAlbum)))
			}

			if dryRun {
				if hasCameraAlbum {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  🔍 Would link all files to camera album %s", cameraAlbum)))
				}
				if hasFilmAlbum {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  🔍 Would link all files to film album %s", filmAlbum)))
				}
				continue
			}

			// Process each file
			for _, file := range files {
				if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
					filePath := filepath.Join(r.Folder, file.Name())

					// Open the file
					f, err := os.Open(filePath)
					if err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to open file %s: %v", file.Name(), err)))
						continue
					}
					defer f.Close()

					// Get file info
					fileInfo, err := f.Stat()
					if err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to get file info for %s: %v", file.Name(), err)))
						continue
					}

					// Generate asset ID
					assetID, err := lightroom.GenerateAssetID()
					if err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to generate asset ID for %s: %v", file.Name(), err)))
						continue
					}

					// Create asset request
					req := openapi.NewCreateAssetRequest()
					payload := openapi.NewCreateAssetRequestPayload()
					req.Payload = payload

					// Create asset
					_, err = api.CreateAsset(cfg.CatalogID, assetID, req)
					if err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to create asset for %s: %v", file.Name(), err)))
						continue
					}

					// Upload asset
					err = api.UploadAsset(cfg.CatalogID, assetID, f, fileInfo.Size(), "image/jpeg")
					if err != nil {
						fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to upload asset for %s: %v", file.Name(), err)))
						continue
					}

					// Add to camera album if it exists
					if hasCameraAlbum {
						addReq := openapi.NewAddAssetsToAlbumRequest()
						resource := openapi.NewAddAssetsToAlbumRequestResourcesInner()
						resource.SetId(assetID)
						addReq.SetResources([]openapi.AddAssetsToAlbumRequestResourcesInner{*resource})
						_, err = api.AddAssetsToAlbum(cfg.CatalogID, cameraAlbumID, addReq)
						if err != nil {
							fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to add %s to camera album: %v", file.Name(), err)))
						} else {
							fmt.Println(style.RenderSuccess(fmt.Sprintf("  ✨ Linked %s to camera album %s", file.Name(), cameraAlbum)))
						}
					}

					// Add to film album if it exists
					if hasFilmAlbum {
						addReq := openapi.NewAddAssetsToAlbumRequest()
						resource := openapi.NewAddAssetsToAlbumRequestResourcesInner()
						resource.SetId(assetID)
						addReq.SetResources([]openapi.AddAssetsToAlbumRequestResourcesInner{*resource})
						_, err = api.AddAssetsToAlbum(cfg.CatalogID, filmAlbumID, addReq)
						if err != nil {
							fmt.Println(style.RenderError(fmt.Sprintf("  ⚠️  Failed to add %s to film album: %v", file.Name(), err)))
						} else {
							fmt.Println(style.RenderSuccess(fmt.Sprintf("  ✨ Linked %s to film album %s", file.Name(), filmAlbum)))
						}
					}
				}
			}
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(linkCmd)
	linkCmd.Flags().Int("year", 0, "Filter by year")
	linkCmd.Flags().String("roll", "", "Process a single roll by its roll number")
	linkCmd.Flags().Bool("dry-run", false, "Show what would happen without making changes")
}
