package cli

import (
	"errors"
	"fmt"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
	"github.com/ys/rolls/style"
)

var uploadCmd = &cobra.Command{
	Use:   "upload [roll_number]",
	Short: "Upload assets to Lightroom albums",
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
				fmt.Println(style.RenderAccent(fmt.Sprintf("📁 Creating year album for %s", year)))
				// Create the year album
				createdYearAlbum, err := albums.EnsureAlbumUnder(&cfg.ScansAlbumID, year, "collection")
				if err != nil {
					return fmt.Errorf("failed to create year album %s: %w", year, err)
				}
				yearAlbum = createdYearAlbum
				fmt.Println(style.RenderSuccess(fmt.Sprintf("✅ Created year album: %s", year)))
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
				fmt.Println(style.RenderAccent(fmt.Sprintf("📁 Creating album for roll %s", targetRoll.Metadata.RollNumber)))
				// Create the roll album
				createdRollAlbum, err := albums.EnsureAlbumUnder(yearAlbum.Id, albumName, "collection")
				if err != nil {
					return fmt.Errorf("failed to create roll album %s: %w", albumName, err)
				}
				rollAlbum = createdRollAlbum
				fmt.Println(style.RenderSuccess(fmt.Sprintf("✅ Created roll album: %s", albumName)))
			}

			// Get files in the roll folder
			files, err := os.ReadDir(targetRoll.Folder)
			if err != nil {
				return fmt.Errorf("failed to read roll folder %s: %w", targetRoll.Folder, err)
			}

			// Filter out non-image files
			var imageFiles []os.DirEntry
			for _, file := range files {
				if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
					imageFiles = append(imageFiles, file)
				}
			}

			if len(imageFiles) == 0 {
				fmt.Println(style.RenderAccent(fmt.Sprintf("⚠️  No image files found in roll %s", targetRoll.Metadata.RollNumber)))
				continue
			}

			fmt.Println(style.RenderTitle("📸", fmt.Sprintf("Processing roll %s (%d files)", targetRoll.Metadata.RollNumber, len(imageFiles))))

			// Get existing files in the album first
			existingFiles, err := getExistingAlbumFilenames(api, cfg, *rollAlbum.Id)
			if err != nil {
				return fmt.Errorf("failed to check existing files: %w", err)
			}

			// Create job and result channels
			numWorkers := 4 // Number of concurrent uploads
			jobs := make(chan uploadJob, len(imageFiles))
			results := make(chan uploadResult, len(imageFiles))

			// Start worker pool
			var wg sync.WaitGroup
			for w := 1; w <= numWorkers; w++ {
				wg.Add(1)
				go func() {
					defer wg.Done()
					processUpload(api, cfg, jobs, results)
				}()
			}

			// Send jobs
			for _, file := range imageFiles {
				filePath := filepath.Join(targetRoll.Folder, file.Name())
				fileInfo, err := file.Info()
				if err != nil {
					fmt.Println(style.RenderAccent(fmt.Sprintf("⚠️  Failed to get file info for %s: %v", file.Name(), err)))
					continue
				}

				// Skip if file already exists
				if existingFiles[file.Name()] {
					results <- uploadResult{
						fileName: file.Name(),
						err:     fmt.Errorf("file already exists in album"),
						skipped: true,
					}
					continue
				}

				jobs <- uploadJob{
					file:       fileInfo,
					filePath:   filePath,
					rollAlbum:  rollAlbum,
					rollNumber: targetRoll.Metadata.RollNumber,
				}
			}
			close(jobs)

			// Wait for all workers to finish
			wg.Wait()
			close(results)

			// Process results with progress bar
			successCount := 0
			failCount := 0
			skipCount := 0
			totalFiles := len(imageFiles)
			progressChars := []string{"🌱", "🌿", "🌳", "🌲", "🎄"}
			progressIndex := 0

			for result := range results {
				if result.err != nil {
					if result.skipped {
						skipCount++
						fmt.Println(style.RenderAccent(fmt.Sprintf("  ⏭️  %s: %v", result.fileName, result.err)))
					} else {
						failCount++
						fmt.Println(style.RenderAccent(fmt.Sprintf("  ❌ %s: %v", result.fileName, result.err)))
					}
				} else {
					successCount++
				}

				// Show cute progress bar
				progress := float64(successCount+failCount+skipCount) / float64(totalFiles)
				progressIndex = int(progress * float64(len(progressChars)-1))
				if progressIndex >= len(progressChars) {
					progressIndex = len(progressChars) - 1
				}
				fmt.Printf("\r%s Uploading... %s (%d/%d)",
					progressChars[progressIndex],
					style.RenderProgressBar(successCount+failCount+skipCount, totalFiles),
					successCount+failCount+skipCount,
					totalFiles)
			}
			fmt.Println() // New line after progress bar

			// Show cute summary for this roll
			if failCount == 0 && skipCount == 0 {
				fmt.Println(style.RenderSuccess(fmt.Sprintf("✨ All %d files uploaded successfully!", successCount)))

				// Update roll metadata with upload timestamp and album name
				targetRoll.Metadata.UploadedAt = time.Now()
				targetRoll.Metadata.AlbumName = albumName
				if err := targetRoll.UpdateMetadata(); err != nil {
					fmt.Println(style.RenderAccent(fmt.Sprintf("  ⚠️  Failed to update roll metadata: %v", err)))
				}
			} else {
				fmt.Println(style.RenderSummary(fmt.Sprintf("📊 Roll %s: %d uploaded, %d skipped, %d failed",
					targetRoll.Metadata.RollNumber,
					successCount,
					skipCount,
					failCount)))
			}
		}

		return nil
	},
}

type uploadJob struct {
	file       os.FileInfo
	filePath   string
	rollAlbum  *openapi.GetAlbums200ResponseResourcesInner
	rollNumber string
}

type uploadResult struct {
	fileName string
	err      error
	skipped  bool
}

func processUpload(api *lightroom.API, cfg *roll.Config, jobs <-chan uploadJob, results chan<- uploadResult) {
	for job := range jobs {
		// Skip non-image files
		ext := strings.ToLower(filepath.Ext(job.file.Name()))
		if !isImageFile(ext) {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("skipped non-image file"),
				skipped: true,
			}
			continue
		}

		// Create a new asset
		assetID, err := lightroom.GenerateAssetID()
		if err != nil {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to generate asset ID: %v", err),
			}
			continue
		}

		createAssetReq := openapi.NewCreateAssetRequest()
		createAssetReq.SetSubtype("image")
		payload := openapi.NewCreateAssetRequestPayload()
		payload.SetCaptureDate("0000-00-00T00:00:00") // Let Lightroom extract from EXIF
		importSource := &openapi.CreateAssetRequestPayloadImportSource{
			FileName:        job.file.Name(),
			ImportedOnDevice: "rolls-cli",
			ImportedBy:      cfg.UserID,
			ImportTimestamp: time.Now().Format(time.RFC3339),
		}
		payload.SetImportSource(*importSource)
		createAssetReq.SetPayload(*payload)

		// Create the asset
		_, err = api.CreateAsset(cfg.CatalogID, assetID, createAssetReq)
		if err != nil {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to create asset: %v", err),
			}
			continue
		}

		// Upload the file
		fileContent, err := os.Open(job.filePath)
		if err != nil {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to open file: %v", err),
			}
			continue
		}

		fileInfo, err := fileContent.Stat()
		if err != nil {
			fileContent.Close()
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to get file info: %v", err),
			}
			continue
		}

		contentType := mime.TypeByExtension(ext)
		if contentType == "" {
			contentType = "image/jpeg" // Default to JPEG if mime type not found
		}

		err = api.UploadAsset(cfg.CatalogID, assetID, fileContent, fileInfo.Size(), contentType)
		fileContent.Close()
		if err != nil {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to upload file: %v", err),
			}
			continue
		}

		// Add the asset to the album
		addAssetsReq := openapi.NewAddAssetsToAlbumRequest()
		resource := openapi.NewAddAssetsToAlbumRequestResourcesInner()
		resource.SetId(assetID)
		addAssetsReq.SetResources([]openapi.AddAssetsToAlbumRequestResourcesInner{*resource})

		_, err = api.AddAssetsToAlbum(cfg.CatalogID, *job.rollAlbum.Id, addAssetsReq)
		if err != nil {
			results <- uploadResult{
				fileName: job.file.Name(),
				err:     fmt.Errorf("failed to add asset to album: %v", err),
			}
			continue
		}

		results <- uploadResult{
			fileName: job.file.Name(),
			err:     nil,
		}
	}
}

func isImageFile(ext string) bool {
	imageExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".tiff": true,
		".tif":  true,
		".raw":  true,
		".cr2":  true,
		".nef":  true,
		".arw":  true,
	}
	return imageExts[ext]
}

func init() {
	rootCmd.AddCommand(uploadCmd)
	uploadCmd.PersistentFlags().Int("year", 0, "Filter by year")
}
