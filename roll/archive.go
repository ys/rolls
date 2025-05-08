package roll

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ys/rolls/style"
)

// Styling is defined in styling.go

func (roll *Roll) GenerateNewContactSheet(cfg *Config) error {
	files, err := os.ReadDir(roll.Folder)

	if err != nil {
		return err
	}

	contactSheet := NewContactSheet()
	defer contactSheet.Destroy()

	fmt.Println(style.RenderTitle("🔄", fmt.Sprintf("Creating contact sheet for roll %s", roll.Metadata.RollNumber)))

	// Count valid files
	validFiles := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
			validFiles++
		}
	}

	processed := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			continue
		}
		if filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}

		processed++
		fmt.Print(style.ProgressStyle.Render(fmt.Sprintf("Adding %s %s", file.Name(), style.RenderProgressBar(processed, validFiles))))

		err = contactSheet.AddImage(path.Join(roll.Folder, file.Name()))
		if err != nil {
			return err
		}
		fmt.Print("\r")
	}
	fmt.Println()

	os.MkdirAll(path.Join(cfg.ContactSheetPath, strconv.Itoa(roll.Metadata.ShotAt.Year())), 0755)
	destination := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	fmt.Println(style.RenderFile(fmt.Sprintf("💾 Saving contact sheet to %s", destination)))
	err = contactSheet.WriteImage(destination)
	if err != nil {
		return err
	}
	return nil
}

// processFiles handles Phase 1: EXIF updates and file renaming
func (roll *Roll) processFiles(files []os.DirEntry, camera *Camera, film *Film, author string, forceExif bool) (bool, error) {
	fmt.Println(style.RenderTitle("📝", "Processing files..."))

	// Count valid files for progress bar
	validFiles := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
			validFiles++
		}
	}

	// Create a channel for work items
	type workItem struct {
		file     os.DirEntry
		index    int
		filePath string
	}
	workChan := make(chan workItem, validFiles)
	results := make(chan error, validFiles)

	// Start worker pool
	numWorkers := 4 // Adjust based on your system's capabilities
	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for work := range workChan {
				// Check if file needs renaming
				fileName := strings.ToLower(work.file.Name())
				expectedPrefix := strings.ToLower(roll.FilesPrefix())
				needsRenaming := !strings.HasPrefix(fileName, expectedPrefix)

				// Check if file needs EXIF update
				if forceExif || needsRenaming {
					err := roll.WriteExif(work.filePath, camera, film, author)
					if err != nil {
						results <- fmt.Errorf("failed to update EXIF for %s: %w", work.file.Name(), err)
						continue
					}
				}

				// Only rename if needed
				if needsRenaming {
					newName := strings.ToLower(fmt.Sprintf("%s-%02d%s", roll.FilesPrefix(), work.index+1, filepath.Ext(work.file.Name())))
					newPath := path.Join(roll.Folder, newName)
					err := os.Rename(work.filePath, newPath)
					if err != nil {
						results <- fmt.Errorf("failed to rename %s to %s: %w", work.file.Name(), newName, err)
						continue
					}
				}
				results <- nil
			}
		}()
	}

	// Send work items
	processed := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" || filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}

		filePath := path.Join(roll.Folder, file.Name())
		fmt.Print(style.ProgressStyle.Render(fmt.Sprintf("Processing %s %s", file.Name(), style.RenderProgressBar(processed+1, validFiles))))
		workChan <- workItem{file: file, index: processed, filePath: filePath}
		processed++
		time.Sleep(50 * time.Millisecond)
	}
	close(workChan)

	// Wait for all workers to finish
	wg.Wait()
	close(results)

	// Check for any errors
	needsExifUpdate := false
	for err := range results {
		if err != nil {
			return false, err
		}
		needsExifUpdate = true
	}

	fmt.Println()
	return needsExifUpdate, nil
}

// createContactSheet handles Phase 2: Contact sheet creation
func (roll *Roll) createContactSheet(cfg *Config, validFiles int) error {
	contactSheetPath := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	if _, err := os.Stat(contactSheetPath); err == nil {
		fmt.Println(style.RenderAccent("\n✨ Contact sheet already exists, skipping"))
		return nil
	}

	fmt.Println(style.RenderTitle("🔄", "Creating contact sheet..."))
	contactSheet := NewContactSheet()
	defer contactSheet.Destroy()

	// Get updated file list after renaming
	files, err := os.ReadDir(roll.Folder)
	if err != nil {
		return err
	}

	processed := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" || filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}

		filePath := path.Join(roll.Folder, file.Name())
		fmt.Print(style.ProgressStyle.Render(fmt.Sprintf("Adding %s %s", file.Name(), style.RenderProgressBar(processed+1, validFiles))))

		err = contactSheet.AddImage(filePath)
		if err != nil {
			return err
		}
		processed++
		fmt.Print("\r")
		time.Sleep(50 * time.Millisecond)
	}
	fmt.Println()

	os.MkdirAll(path.Join(cfg.ContactSheetPath, strconv.Itoa(roll.Metadata.ShotAt.Year())), 0755)
	destination := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	fmt.Println(style.RenderFile(fmt.Sprintf("\n💾 Saving contact sheet to %s", destination)))
	return contactSheet.WriteImage(destination)
}

// renameFolder handles Phase 3: Folder renaming and metadata update
func (roll *Roll) renameFolder() error {
	// First, find and rename the markdown file if it exists
	files, err := os.ReadDir(roll.Folder)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", roll.Folder, err)
	}

	// Find the markdown file
	var markdownFile string
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" && file.Name() != "roll.md" {
			markdownFile = file.Name()
			break
		}
	}

	// Rename the markdown file if found
	if markdownFile != "" {
		oldPath := filepath.Join(roll.Folder, markdownFile)
		newPath := filepath.Join(roll.Folder, "roll.md")
		fmt.Println(style.RenderFile(fmt.Sprintf("📝 Renaming markdown file from %s to roll.md", markdownFile)))
		err = os.Rename(oldPath, newPath)
		if err != nil {
			return fmt.Errorf("failed to rename markdown file from %s to %s: %w", oldPath, newPath, err)
		}
	}

	// Rename the folder if needed
	newFolder := strings.ToLower(fmt.Sprintf("%s-%s-%s", roll.FilesPrefix(), roll.Metadata.CameraID, roll.Metadata.FilmID))
	if filepath.Base(roll.Folder) != newFolder {
		fmt.Println(style.RenderFile(fmt.Sprintf("📁 Renaming folder to %s", newFolder)))
		newFolderPath := path.Join(filepath.Dir(roll.Folder), newFolder)
		err = os.Rename(roll.Folder, newFolderPath)
		if err != nil {
			return fmt.Errorf("failed to rename folder from %s to %s: %w", roll.Folder, newFolderPath, err)
		}
		// Update the roll's folder path
		roll.Folder = newFolderPath
		fmt.Println(style.RenderFile(fmt.Sprintf("   Updated folder path to: %s", roll.Folder)))
	}

	// Update the processed timestamp
	err = roll.UpdateProcessedTime()
	if err != nil {
		return fmt.Errorf("failed to update processed time in folder %s: %w", roll.Folder, err)
	}
	return nil
}

// updateProcessedTime handles Phase 4: Update processed timestamp
func (roll *Roll) updateProcessedTime() error {
	fmt.Println(style.RenderTitle("⏰", "Updating processed timestamp..."))
	roll.Metadata.ProcessedAt = time.Now()
	markdownPath := filepath.Join(roll.Folder, "roll.md")

	// Check if the file exists
	if _, err := os.Stat(markdownPath); os.IsNotExist(err) {
		return fmt.Errorf("markdown file not found at %s: %w", markdownPath, err)
	}

	content := fmt.Sprintf("---\nroll_number: %s\ncamera: %s\nfilm: %s\nshot_at: %s\nscanned_at: %s\nprocessed_at: %s\ntags: %v\n---\n\n%s",
		roll.Metadata.RollNumber,
		roll.Metadata.CameraID,
		roll.Metadata.FilmID,
		roll.Metadata.ShotAt.Format("2006-01-02"),
		roll.Metadata.ScannedAt.Format("2006-01-02"),
		roll.Metadata.ProcessedAt.Format("2006-01-02 15:04:05"),
		roll.Metadata.Tags,
		roll.Content)

	err := os.WriteFile(markdownPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("failed to write to markdown file at %s: %w", markdownPath, err)
	}
	return nil
}

func (roll *Roll) Archive(cfg *Config, forceExif bool) error {
	fmt.Println(style.RenderTitle("📦", fmt.Sprintf("Processing roll %s", roll.Metadata.RollNumber)))
	fmt.Println(style.RenderFile(fmt.Sprintf("   Camera: %s", roll.Metadata.CameraID)))
	fmt.Println(style.RenderFile(fmt.Sprintf("   Film: %s", roll.Metadata.FilmID)))
	fmt.Println(style.RenderFile(fmt.Sprintf("   Shot at: %s", roll.Metadata.ShotAt.Format("2006-01-02"))))

	files, err := os.ReadDir(roll.Folder)
	if err != nil {
		return err
	}

	// Count valid files for progress bar
	validFiles := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
			validFiles++
		}
	}

	camera := cfg.Cameras[roll.Metadata.CameraID]
	film := cfg.Films[roll.Metadata.FilmID]
	author := cfg.Copyright

	if camera == nil {
		splitted := strings.SplitN(roll.Metadata.CameraID, " ", 2)
		camera = &Camera{
			Brand: splitted[0],
			Model: splitted[1],
		}
	}
	if film == nil {
		film = &Film{
			Nickname: roll.Metadata.FilmID,
			ShowIso:  false,
		}
	}

	// Phase 1: Process files
	needsExifUpdate, err := roll.processFiles(files, camera, film, author, forceExif)
	if err != nil {
		return err
	}

	// Phase 2: Create contact sheet
	err = roll.createContactSheet(cfg, validFiles)
	if err != nil {
		return err
	}

	// Phase 3: Rename folder
	err = roll.renameFolder()
	if err != nil {
		return fmt.Errorf("failed to rename folder: %w", err)
	}

	// Phase 4: Update processed timestamp
	err = roll.updateProcessedTime()
	if err != nil {
		return fmt.Errorf("failed to update processed time: %w", err)
	}

	if forceExif {
		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nEXIF data updated for roll %s\n", roll.Metadata.RollNumber)))
	} else if needsExifUpdate {
		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nRoll %s updated with new EXIF data\n", roll.Metadata.RollNumber)))
	} else {
		fmt.Println(style.RenderSuccess(fmt.Sprintf("\nRoll %s archived successfully!\n", roll.Metadata.RollNumber)))
	}
	return nil
}

// IsArchived checks if the roll is already properly archived by verifying:
// 1. All files have the correct prefix format
// 2. Contact sheet exists
// 3. Folder has the correct name format
// 4. Roll has been processed before
func (roll *Roll) IsArchived(cfg *Config) (bool, error) {
	// Check if roll has been processed before
	wasProcessed := !roll.Metadata.ProcessedAt.IsZero()
	if wasProcessed {
		fmt.Println(style.RenderSummary(fmt.Sprintf("✨ Roll %s was last processed at %s", roll.Metadata.RollNumber, roll.Metadata.ProcessedAt.Format("2006-01-02 15:04:05"))))
	}

	// Check folder name
	expectedFolder := strings.ToLower(fmt.Sprintf("%s-%s-%s", roll.FilesPrefix(), roll.Metadata.CameraID, roll.Metadata.FilmID))
	if filepath.Base(roll.Folder) != expectedFolder {
		fmt.Println(style.RenderFile(fmt.Sprintf("📁 Folder name mismatch: %s (expected: %s)", filepath.Base(roll.Folder), expectedFolder)))
		return false, nil
	}

	// Check contact sheet
	contactSheetPath := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	if _, err := os.Stat(contactSheetPath); os.IsNotExist(err) {
		fmt.Println(style.RenderFile(fmt.Sprintf("🖼️  Missing contact sheet: %s", contactSheetPath)))
		return false, nil
	}

	// Check all files have correct prefix
	files, err := os.ReadDir(roll.Folder)
	if err != nil {
		return false, err
	}

	expectedPrefix := strings.ToLower(roll.FilesPrefix())
	hasMismatch := false
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" || filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}

		fileName := strings.ToLower(file.Name())
		if !strings.HasPrefix(fileName, expectedPrefix) {
			if !hasMismatch {
				fmt.Println(style.RenderTitle("📝", fmt.Sprintf("Files with incorrect prefix in %s:", roll.Metadata.RollNumber)))
				hasMismatch = true
			}
			fmt.Println(style.RenderFile(fmt.Sprintf("   - %s (expected prefix: %s)", file.Name(), expectedPrefix)))
		}
	}
	if hasMismatch {
		return false, nil
	}

	// Check and clean up markdown files
	hasRollMd := false
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			if file.Name() == "roll.md" {
				hasRollMd = true
			} else if !hasRollMd {
				// Rename the first markdown file to roll.md if we don't have one
				oldMdPath := filepath.Join(roll.Folder, file.Name())
				newMdPath := filepath.Join(roll.Folder, "roll.md")
				fmt.Println(style.RenderFile(fmt.Sprintf("📝 Renaming %s to roll.md", file.Name())))
				err = os.Rename(oldMdPath, newMdPath)
				if err != nil {
					return false, fmt.Errorf("failed to rename markdown file %s to roll.md: %w", file.Name(), err)
				}
				hasRollMd = true
			} else {
				// Remove any other markdown files if we already have roll.md
				oldMdPath := filepath.Join(roll.Folder, file.Name())
				fmt.Println(style.RenderFile(fmt.Sprintf("🗑️  Removing old markdown file: %s", file.Name())))
				err = os.Remove(oldMdPath)
				if err != nil {
					return false, fmt.Errorf("failed to remove old markdown file %s: %w", file.Name(), err)
				}
			}
		}
	}

	// If roll.md doesn't exist but we have processed_at, create it
	if !hasRollMd && wasProcessed {
		markdownPath := filepath.Join(roll.Folder, "roll.md")
		content := fmt.Sprintf("---\nroll_number: %s\ncamera: %s\nfilm: %s\nshot_at: %s\nscanned_at: %s\nprocessed_at: %s\ntags: %v\n---\n\n%s",
			roll.Metadata.RollNumber,
			roll.Metadata.CameraID,
			roll.Metadata.FilmID,
			roll.Metadata.ShotAt.Format("2006-01-02"),
			roll.Metadata.ScannedAt.Format("2006-01-02"),
			roll.Metadata.ProcessedAt.Format("2006-01-02 15:04:05"),
			roll.Metadata.Tags,
			roll.Content)
		err = os.WriteFile(markdownPath, []byte(content), 0644)
		if err != nil {
			return false, fmt.Errorf("failed to create roll.md: %w", err)
		}
		fmt.Println(style.RenderFile("📝 Created roll.md with current metadata"))
	}

	fmt.Println(style.RenderSummary(fmt.Sprintf("✨ Roll %s is already properly archived", roll.Metadata.RollNumber)))
	return true, nil
}

// UpdateProcessedTime updates the processed time for a roll
func (roll *Roll) UpdateProcessedTime() error {
	roll.Metadata.ProcessedAt = time.Now()
	markdownPath := filepath.Join(roll.Folder, "roll.md")

	// Check if the file exists
	if _, err := os.Stat(markdownPath); os.IsNotExist(err) {
		return fmt.Errorf("markdown file not found at %s: %w", markdownPath, err)
	}

	content := fmt.Sprintf("---\nroll_number: %s\ncamera: %s\nfilm: %s\nshot_at: %s\nscanned_at: %s\nprocessed_at: %s\ntags: %v\n---\n\n%s",
		roll.Metadata.RollNumber,
		roll.Metadata.CameraID,
		roll.Metadata.FilmID,
		roll.Metadata.ShotAt.Format("2006-01-02"),
		roll.Metadata.ScannedAt.Format("2006-01-02"),
		roll.Metadata.ProcessedAt.Format("2006-01-02 15:04:05"),
		roll.Metadata.Tags,
		roll.Content)

	err := os.WriteFile(markdownPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("failed to write to markdown file at %s: %w", markdownPath, err)
	}
	return nil
}
