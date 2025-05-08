package roll

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/barasher/go-exiftool"
	"github.com/charmbracelet/bubbles/list"
)

type Metadata struct {
	CameraID    string    `yaml:"camera"`
	FilmID      string    `yaml:"film"`
	ShotAt      time.Time `yaml:"shot_at"`
	ScannedAt   time.Time `yaml:"scanned_at"`
	RollNumber  string    `yaml:"roll_number"`
	Tags        []string  `yaml:"tags"`
	Copyright   string
	ProcessedAt time.Time `yaml:"processed_at,omitempty"`
	UploadedAt  time.Time `yaml:"uploaded_at,omitempty"`
	AlbumName   string    `yaml:"album_name,omitempty"`
}

type Roll struct {
	Folder   string
	Content  string
	Metadata Metadata
	list.Item
}

// Set is a simple set implementation using a map
type Set map[string]struct{}

// Add adds a value to the set
func (s Set) Add(v string) {
	s[v] = struct{}{}
}

// AddAll adds multiple values to the set
func (s Set) AddAll(vs []string) {
	for _, v := range vs {
		s[v] = struct{}{}
	}
}

// ToSlice converts the set to a slice
func (s Set) ToSlice() []string {
	slice := make([]string, 0, len(s))
	for k := range s {
		slice = append(slice, k)
	}
	return slice
}

func (roll *Roll) WriteExif(file string, camera *Camera, film *Film, author string) error {
	e, err := exiftool.NewExiftool()
	if err != nil {
		return err
	}
	defer e.Close()

	originals := e.ExtractMetadata(file)

	originals[0].SetString("Copyright", author)
	originals[0].SetString("Make", camera.Brand)
	originals[0].SetString("Model", camera.Model)
	originals[0].SetInt("Iso", int64(film.Iso))
	description := fmt.Sprintf("%s - %s", camera.Name(), film.NameWithBrand())
	originals[0].SetString("captionabstract", description)
	originals[0].SetString("imagedescription", description)
	originals[0].SetString("description", description)
	at := roll.Metadata.ShotAt.Format("2006:01:02 15:04:05")
	originals[0].SetString("DateTimeOriginal", at)
	originals[0].SetString("FileCreateDate", at)
	originals[0].SetString("ModifyDate", at)
	originals[0].SetString("CreateDate", at)

	// Create a set for unique keywords
	keywords := make(Set)

	// Add roll tags
	keywords.AddAll(roll.Metadata.Tags)

	// Add standard keywords
	standardKeywords := []string{"Analog", camera.Name(), film.NameWithBrand(), roll.Metadata.FilmID, roll.Metadata.RollNumber}
	keywords.AddAll(standardKeywords)

	originals[0].SetStrings("Keywords", keywords.ToSlice())
	e.WriteMetadata(originals)
	return nil
}

func (roll *Roll) FilesPrefix() string {
	return fmt.Sprintf("%s-%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"))
}

type Rolls []Roll

func (r *Rolls) Items() []list.Item {
	items := []list.Item{}
	for _, roll := range *r {
		items = append(items, roll)
	}
	return items
}

func (i Roll) Title() string       { return i.Metadata.RollNumber }
func (i Roll) Description() string { return i.Metadata.CameraID + " - " + i.Metadata.FilmID }
func (i Roll) FilterValue() string { return i.Metadata.RollNumber }

// getCreationTime returns the creation time of a file on macOS
func getCreationTime(path string) (time.Time, error) {
	var stat syscall.Stat_t
	if err := syscall.Stat(path, &stat); err != nil {
		return time.Time{}, err
	}
	return time.Unix(stat.Birthtimespec.Sec, stat.Birthtimespec.Nsec), nil
}

// FromMarkdown reads a roll from a markdown file
func FromMarkdown(path string) (Roll, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return Roll{}, err
	}

	// Split frontmatter and content
	parts := strings.Split(string(content), "---")
	if len(parts) < 3 {
		return Roll{}, fmt.Errorf("invalid markdown file: missing frontmatter")
	}

	// Parse frontmatter
	frontmatter := parts[1]
	metadata := Metadata{}
	scanner := bufio.NewScanner(strings.NewReader(frontmatter))
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}

		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		switch key {
		case "roll_number":
			metadata.RollNumber = value
		case "camera":
			metadata.CameraID = value
		case "film":
			metadata.FilmID = value
		case "shot_at":
			if t, err := time.Parse("2006-01-02", value); err == nil {
				metadata.ShotAt = t
			}
		case "scanned_at":
			if t, err := time.Parse("2006-01-02", value); err == nil {
				metadata.ScannedAt = t
			}
		case "processed_at":
			if t, err := time.Parse("2006-01-02 15:04:05", value); err == nil {
				metadata.ProcessedAt = t
			}
		case "tags":
			metadata.Tags = strings.Split(value, ",")
			for i, tag := range metadata.Tags {
				metadata.Tags[i] = strings.TrimSpace(tag)
			}
		}
	}

	return Roll{
		Folder:   filepath.Dir(path),
		Metadata: metadata,
		Content:  strings.TrimSpace(parts[2]),
	}, nil
}

// GetRolls returns all rolls in the scans directory
func GetRolls(scansPath string) (Rolls, error) {
	var rolls Rolls

	// Walk through the scans directory
	err := filepath.Walk(scansPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Only process markdown files
		if filepath.Ext(path) != ".md" {
			return nil
		}

		// Read the markdown file
		roll, err := FromMarkdown(path)
		if err != nil {
			return err
		}

		// Set default copyright
		roll.Metadata.Copyright = "Yannick Schutz"

		// If ScannedAt is not set or is before 2000, use the folder's creation time
		if roll.Metadata.ScannedAt.IsZero() || roll.Metadata.ScannedAt.Year() < 2000 {
			creationTime, err := getCreationTime(roll.Folder)
			if err != nil {
				return fmt.Errorf("failed to get folder creation time for %s: %w", roll.Folder, err)
			}
			roll.Metadata.ScannedAt = creationTime
		}

		rolls = append(rolls, roll)
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort rolls by roll number
	sort.Sort(ByRollNumber(rolls))
	return rolls, nil
}

func Filter(vs Rolls, f func(Roll) bool) Rolls {
	filtered := make(Rolls, 0)
	for _, v := range vs {
		if f(v) {
			filtered = append(filtered, v)
		}
	}
	return filtered
}

type ByRollNumber Rolls

func (a ByRollNumber) Len() int           { return len(a) }
func (a ByRollNumber) Less(i, j int) bool { return a[i].Metadata.RollNumber < a[j].Metadata.RollNumber }
func (a ByRollNumber) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

// UpdateMetadata updates the roll's metadata in the markdown file
func (roll *Roll) UpdateMetadata() error {
	// Read the current content
	content, err := os.ReadFile(filepath.Join(roll.Folder, "roll.md"))
	if err != nil {
		return fmt.Errorf("failed to read roll.md: %w", err)
	}

	// Split frontmatter and content
	parts := strings.Split(string(content), "---")
	if len(parts) < 3 {
		return fmt.Errorf("invalid markdown file: missing frontmatter")
	}

	// Parse and update frontmatter
	frontmatter := parts[1]
	lines := strings.Split(frontmatter, "\n")
	var updatedLines []string

	// Track which fields we've updated
	updated := make(map[string]bool)

	// Process existing lines
	for _, line := range lines {
		if line == "" {
			continue
		}

		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			updatedLines = append(updatedLines, line)
			continue
		}

		key := strings.TrimSpace(parts[0])

		// Update fields if they exist in metadata
		switch key {
		case "uploaded_at":
			if !roll.Metadata.UploadedAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("uploaded_at: %s", roll.Metadata.UploadedAt.Format("2006-01-02 15:04:05")))
				updated["uploaded_at"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "album_name":
			if roll.Metadata.AlbumName != "" {
				updatedLines = append(updatedLines, fmt.Sprintf("album_name: %s", roll.Metadata.AlbumName))
				updated["album_name"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		default:
			updatedLines = append(updatedLines, line)
		}
	}

	// Add new fields if they weren't updated
	if !updated["uploaded_at"] && !roll.Metadata.UploadedAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("uploaded_at: %s", roll.Metadata.UploadedAt.Format("2006-01-02 15:04:05")))
	}
	if !updated["album_name"] && roll.Metadata.AlbumName != "" {
		updatedLines = append(updatedLines, fmt.Sprintf("album_name: %s", roll.Metadata.AlbumName))
	}

	// Reconstruct the file content
	newContent := fmt.Sprintf("---\n%s\n---\n%s", strings.Join(updatedLines, "\n"), parts[2])

	// Write back to file
	err = os.WriteFile(filepath.Join(roll.Folder, "roll.md"), []byte(newContent), 0644)
	if err != nil {
		return fmt.Errorf("failed to write roll.md: %w", err)
	}

	return nil
}
