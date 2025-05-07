package roll

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

var (
	// Flexoki color scheme
	subtle    = lipgloss.AdaptiveColor{Light: "#0B7285", Dark: "#0B7285"}    // Flexoki cyan
	highlight = lipgloss.AdaptiveColor{Light: "#8B7EC8", Dark: "#8B7EC8"}    // Flexoki purple
	special   = lipgloss.AdaptiveColor{Light: "#AD3FA4", Dark: "#AD3FA4"}    // Flexoki magenta
	accent    = lipgloss.AdaptiveColor{Light: "#B47109", Dark: "#B47109"}    // Flexoki yellow

	titleStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(highlight)

	progressStyle = lipgloss.NewStyle().
			MarginLeft(2).
			MarginRight(2).
			Padding(0, 1).
			Foreground(subtle)

	fileStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(special)

	accentStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(accent)
)

func (roll *Roll) GenerateNewContactSheet(cfg *Config) error {
	files, err := ioutil.ReadDir(roll.Folder)

	if err != nil {
		return err
	}

	contactSheet := NewContactSheet()
	defer contactSheet.Destroy()

	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			continue
		}
		if filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}
		fmt.Println("Add file ", file.Name())
		err = contactSheet.AddImage(path.Join(roll.Folder, file.Name()))
		if err != nil {
			return err
		}
	}
	os.MkdirAll(path.Join(cfg.ContactSheetPath, strconv.Itoa(roll.Metadata.ShotAt.Year())), 0755)
	destination := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	fmt.Println("Contact Sheet to", destination)
	err = contactSheet.WriteImage(destination)
	if err != nil {
		return err
	}
	return nil
}

// processFiles handles Phase 1: EXIF updates and file renaming
func (roll *Roll) processFiles(files []os.DirEntry, camera *Camera, film *Film, author string, forceExif bool) (bool, error) {
	fmt.Println(titleStyle.Render("\n📝 Processing files..."))

	// Count valid files for progress bar
	validFiles := 0
	for _, file := range files {
		if filepath.Ext(file.Name()) != ".md" && filepath.Base(file.Name()) != ".DS_Store" {
			validFiles++
		}
	}

	processed := 0
	needsExifUpdate := false

	for _, file := range files {
		if filepath.Ext(file.Name()) == ".md" || filepath.Base(file.Name()) == ".DS_Store" {
			continue
		}

		filePath := path.Join(roll.Folder, file.Name())
		progress := float64(processed) / float64(validFiles)
		bar := fmt.Sprintf("[%s%s] %d/%d",
			strings.Repeat("=", int(progress*20)),
			strings.Repeat(" ", 20-int(progress*20)),
			processed+1,
			validFiles)
		fmt.Print(progressStyle.Render(fmt.Sprintf("Processing %s %s", file.Name(), bar)))

		// Check if file needs renaming
		fileName := strings.ToLower(file.Name())
		expectedPrefix := strings.ToLower(roll.FilesPrefix())
		needsRenaming := !strings.HasPrefix(fileName, expectedPrefix)

		// Check if file needs EXIF update
		if forceExif || needsRenaming {
			roll.WriteExif(filePath, camera, film, author)
			needsExifUpdate = true
		}

		// Only rename if needed
		if needsRenaming {
			newName := strings.ToLower(fmt.Sprintf("%s-%02d%s", roll.FilesPrefix(), processed+1, filepath.Ext(file.Name())))
			newPath := path.Join(roll.Folder, newName)
			os.Rename(filePath, newPath)
		}

		processed++
		fmt.Print("\r")
		time.Sleep(50 * time.Millisecond)
	}
	fmt.Println()
	return needsExifUpdate, nil
}

// createContactSheet handles Phase 2: Contact sheet creation
func (roll *Roll) createContactSheet(cfg *Config, validFiles int) error {
	contactSheetPath := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	if _, err := os.Stat(contactSheetPath); err == nil {
		fmt.Println(accentStyle.Render("\n✨ Contact sheet already exists, skipping"))
		return nil
	}

	fmt.Println(titleStyle.Render("\n🔄 Creating contact sheet..."))
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
		progress := float64(processed) / float64(validFiles)
		bar := fmt.Sprintf("[%s%s] %d/%d",
			strings.Repeat("=", int(progress*20)),
			strings.Repeat(" ", 20-int(progress*20)),
			processed+1,
			validFiles)
		fmt.Print(progressStyle.Render(fmt.Sprintf("Adding %s %s", file.Name(), bar)))

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
	fmt.Println(fileStyle.Render(fmt.Sprintf("\n💾 Saving contact sheet to %s", destination)))
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
		fmt.Println(fileStyle.Render(fmt.Sprintf("📝 Renaming markdown file from %s to roll.md", markdownFile)))
		err = os.Rename(oldPath, newPath)
		if err != nil {
			return fmt.Errorf("failed to rename markdown file from %s to %s: %w", oldPath, newPath, err)
		}
	}

	// Rename the folder if needed
	newFolder := strings.ToLower(fmt.Sprintf("%s-%s-%s", roll.FilesPrefix(), roll.Metadata.CameraID, roll.Metadata.FilmID))
	if filepath.Base(roll.Folder) != newFolder {
		fmt.Println(fileStyle.Render(fmt.Sprintf("📁 Renaming folder to %s", newFolder)))
		newFolderPath := path.Join(filepath.Dir(roll.Folder), newFolder)
		err = os.Rename(roll.Folder, newFolderPath)
		if err != nil {
			return fmt.Errorf("failed to rename folder from %s to %s: %w", roll.Folder, newFolderPath, err)
		}
		// Update the roll's folder path
		roll.Folder = newFolderPath
		fmt.Println(fileStyle.Render(fmt.Sprintf("   Updated folder path to: %s", roll.Folder)))
	}

	// Update the processed timestamp
	err = roll.UpdateProcessedTime()
	if err != nil {
		return fmt.Errorf("failed to update processed time in folder %s: %w", roll.Folder, err)
	}
	return nil
}

func (roll *Roll) Archive(cfg *Config, forceExif bool) error {
	fmt.Println(titleStyle.Render(fmt.Sprintf("📦 Processing roll %s", roll.Metadata.RollNumber)))
	fmt.Println(fileStyle.Render(fmt.Sprintf("   Camera: %s", roll.Metadata.CameraID)))
	fmt.Println(fileStyle.Render(fmt.Sprintf("   Film: %s", roll.Metadata.FilmID)))
	fmt.Println(fileStyle.Render(fmt.Sprintf("   Shot at: %s", roll.Metadata.ShotAt.Format("2006-01-02"))))

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

	// Phase 3: Rename folder and update metadata
	err = roll.renameFolder()
	if err != nil {
		return fmt.Errorf("failed to update processed time: %w", err)
	}

	if forceExif {
		fmt.Println(titleStyle.Render(fmt.Sprintf("\n✅ EXIF data updated for roll %s\n", roll.Metadata.RollNumber)))
	} else if needsExifUpdate {
		fmt.Println(titleStyle.Render(fmt.Sprintf("\n✅ Roll %s updated with new EXIF data\n", roll.Metadata.RollNumber)))
	} else {
		fmt.Println(titleStyle.Render(fmt.Sprintf("\n✅ Roll %s archived successfully!\n", roll.Metadata.RollNumber)))
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
		fmt.Printf("✨ Roll %s was last processed at %s\n", roll.Metadata.RollNumber, roll.Metadata.ProcessedAt.Format("2006-01-02 15:04:05"))
	}

	// Check folder name
	expectedFolder := strings.ToLower(fmt.Sprintf("%s-%s-%s", roll.FilesPrefix(), roll.Metadata.CameraID, roll.Metadata.FilmID))
	if filepath.Base(roll.Folder) != expectedFolder {
		fmt.Printf("📁 Folder name mismatch: %s (expected: %s)\n", filepath.Base(roll.Folder), expectedFolder)
		return false, nil
	}

	// Check contact sheet
	contactSheetPath := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	if _, err := os.Stat(contactSheetPath); os.IsNotExist(err) {
		fmt.Printf("🖼️  Missing contact sheet: %s\n", contactSheetPath)
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
				fmt.Printf("📝 Files with incorrect prefix in %s:\n", roll.Metadata.RollNumber)
				hasMismatch = true
			}
			fmt.Printf("   - %s (expected prefix: %s)\n", file.Name(), expectedPrefix)
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
			} else {
				// Remove any other markdown files
				oldMdPath := filepath.Join(roll.Folder, file.Name())
				fmt.Println(fileStyle.Render(fmt.Sprintf("🗑️  Removing old markdown file: %s", file.Name())))
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
		fmt.Println(fileStyle.Render("📝 Created roll.md with current metadata"))
	}

	fmt.Printf("✨ Roll %s is already properly archived\n", roll.Metadata.RollNumber)
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
