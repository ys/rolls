package roll

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/barasher/go-exiftool"
	"github.com/charmbracelet/bubbles/list"
)

type Metadata struct {
	CameraID        string    `yaml:"camera"`
	FilmID          string    `yaml:"film"`
	ShotAt          time.Time `yaml:"shot_at"`
	FridgeAt        time.Time `yaml:"fridge_at,omitempty"`
	LabAt           time.Time `yaml:"lab_at,omitempty"`
	LabName         string    `yaml:"lab,omitempty"`
	ScannedAt       time.Time `yaml:"scanned_at"`
	ScannedAtSet    bool      `yaml:"-"` // true only when scanned_at was explicit in frontmatter
	RollNumber      string    `yaml:"roll_number"`
	Tags            []string  `yaml:"tags"`
	Copyright       string
	ProcessedAt     time.Time `yaml:"processed_at,omitempty"`
	UploadedAt      time.Time `yaml:"uploaded_at,omitempty"`
	UploadedAtSet   bool      `yaml:"-"` // true only when uploaded_at was explicit in frontmatter
	AlbumName       string    `yaml:"album_name,omitempty"`
	ArchivedAt      time.Time `yaml:"archived_at,omitempty"`
	ContactSheetURL string    `yaml:"contact_sheet_url,omitempty"`
	PushPull        *float64  `yaml:"push_pull,omitempty"`
	Frames          int       `yaml:"frames,omitempty"`
	LabID           string    `yaml:"lab_id,omitempty"`
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
	at := FormatExifDateTime(roll.Metadata.ShotAt)
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
	return fmt.Sprintf("%s-%s", roll.Metadata.RollNumber, FormatFilePrefixDate(roll.Metadata.ShotAt))
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
			if t, err := ParseDate(value); err == nil {
				metadata.ShotAt = t
			}
		case "fridge_at":
			if t, err := ParseDateTime(value); err == nil {
				metadata.FridgeAt = t
			}
		case "finished_at":
			// Obsidian alias: when the roll was finished shooting → fridge
			if t, err := ParseDate(value); err == nil && metadata.FridgeAt.IsZero() {
				metadata.FridgeAt = t
			}
		case "lab_at":
			if t, err := ParseDateTime(value); err == nil {
				metadata.LabAt = t
			}
		case "sent":
			// Obsidian alias: when the roll was sent to the lab
			if t, err := ParseDate(value); err == nil && metadata.LabAt.IsZero() {
				metadata.LabAt = t
			}
		case "lab":
			metadata.LabName = value
		case "scanned_at":
			if t, err := ParseDate(value); err == nil {
				metadata.ScannedAt = t
				metadata.ScannedAtSet = true
			}
		case "processed_at":
			if t, err := ParseDateTime(value); err == nil {
				metadata.ProcessedAt = t
			}
		case "uploaded_at":
			if t, err := ParseDateTime(value); err == nil {
				metadata.UploadedAt = t
				metadata.UploadedAtSet = true
			}
		case "archived_at":
			if t, err := ParseDateTime(value); err == nil {
				metadata.ArchivedAt = t
			}
		case "tags":
			for _, tag := range strings.Split(value, ",") {
				if t := strings.TrimSpace(tag); t != "" && t != "[]" {
					metadata.Tags = append(metadata.Tags, t)
				}
			}
		case "contact_sheet_url":
			metadata.ContactSheetURL = value
		case "album_name":
			metadata.AlbumName = value
		case "push_pull":
			if v, err := strconv.ParseFloat(value, 64); err == nil {
				metadata.PushPull = &v
			}
		case "frames":
			if v, err := strconv.Atoi(value); err == nil {
				metadata.Frames = v
			}
		case "lab_id":
			metadata.LabID = value
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

		// Only process roll.md files
		if filepath.Base(path) != "roll.md" {
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

// GetFlatRolls reads all .md files directly under dir (recursively), skipping
// any that don't contain valid roll frontmatter (e.g. year-summary files).
func GetFlatRolls(dir string) (Rolls, error) {
	var rolls Rolls

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() || filepath.Ext(path) != ".md" {
			return nil
		}

		r, err := FromMarkdown(path)
		if err != nil || r.Metadata.RollNumber == "" {
			return nil // skip non-roll files silently
		}

		rolls = append(rolls, r)
		return nil
	})

	if err != nil {
		return nil, err
	}

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
		case "fridge_at":
			if !roll.Metadata.FridgeAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("fridge_at: %s", FormatDateTime(roll.Metadata.FridgeAt)))
				updated["fridge_at"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "lab_name":
			if roll.Metadata.LabName != "" {
				updatedLines = append(updatedLines, fmt.Sprintf("lab: %s", roll.Metadata.LabName))
				updated["lab_name"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "lab_at":
			if !roll.Metadata.LabAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("lab_at: %s", FormatDateTime(roll.Metadata.LabAt)))
				updated["lab_at"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "uploaded_at":
			if !roll.Metadata.UploadedAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("uploaded_at: %s", FormatDateTime(roll.Metadata.UploadedAt)))
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
		case "processed_at":
			if !roll.Metadata.ProcessedAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("processed_at: %s", FormatDateTime(roll.Metadata.ProcessedAt)))
				updated["processed_at"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "archived_at":
			if !roll.Metadata.ArchivedAt.IsZero() {
				updatedLines = append(updatedLines, fmt.Sprintf("archived_at: %s", FormatDateTime(roll.Metadata.ArchivedAt)))
				updated["archived_at"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "frames":
			if roll.Metadata.Frames > 0 {
				updatedLines = append(updatedLines, fmt.Sprintf("frames: %d", roll.Metadata.Frames))
				updated["frames"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		case "lab_id":
			if roll.Metadata.LabID != "" {
				updatedLines = append(updatedLines, fmt.Sprintf("lab_id: %s", roll.Metadata.LabID))
				updated["lab_id"] = true
			} else {
				updatedLines = append(updatedLines, line)
			}
		default:
			updatedLines = append(updatedLines, line)
		}
	}

	// Add new fields if they weren't updated
	if !updated["fridge_at"] && !roll.Metadata.FridgeAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("fridge_at: %s", FormatDateTime(roll.Metadata.FridgeAt)))
	}
	if !updated["lab_name"] && roll.Metadata.LabName != "" {
		updatedLines = append(updatedLines, fmt.Sprintf("lab: %s", roll.Metadata.LabName))
	}
	if !updated["lab_at"] && !roll.Metadata.LabAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("lab_at: %s", FormatDateTime(roll.Metadata.LabAt)))
	}
	if !updated["uploaded_at"] && !roll.Metadata.UploadedAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("uploaded_at: %s", FormatDateTime(roll.Metadata.UploadedAt)))
	}
	if !updated["album_name"] && roll.Metadata.AlbumName != "" {
		updatedLines = append(updatedLines, fmt.Sprintf("album_name: %s", roll.Metadata.AlbumName))
	}
	if !updated["processed_at"] && !roll.Metadata.ProcessedAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("processed_at: %s", FormatDateTime(roll.Metadata.ProcessedAt)))
	}
	if !updated["archived_at"] && !roll.Metadata.ArchivedAt.IsZero() {
		updatedLines = append(updatedLines, fmt.Sprintf("archived_at: %s", FormatDateTime(roll.Metadata.ArchivedAt)))
	}
	if !updated["frames"] && roll.Metadata.Frames > 0 {
		updatedLines = append(updatedLines, fmt.Sprintf("frames: %d", roll.Metadata.Frames))
	}
	if !updated["lab_id"] && roll.Metadata.LabID != "" {
		updatedLines = append(updatedLines, fmt.Sprintf("lab_id: %s", roll.Metadata.LabID))
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

// MergeFrom fills zero/empty fields in r.Metadata from src, and appends src.Content
// if r.Content is empty. Primary (r) always wins on non-zero fields.
func (r *Roll) MergeFrom(src Roll) {
	m, s := &r.Metadata, src.Metadata
	if m.CameraID == "" {
		m.CameraID = s.CameraID
	}
	if m.FilmID == "" {
		m.FilmID = s.FilmID
	}
	if m.ShotAt.IsZero() {
		m.ShotAt = s.ShotAt
	}
	if m.FridgeAt.IsZero() {
		m.FridgeAt = s.FridgeAt
	}
	if m.LabAt.IsZero() {
		m.LabAt = s.LabAt
	}
	if m.LabName == "" {
		m.LabName = s.LabName
	}
	if m.ScannedAt.IsZero() {
		m.ScannedAt = s.ScannedAt
	}
	if m.ProcessedAt.IsZero() {
		m.ProcessedAt = s.ProcessedAt
	}
	if m.UploadedAt.IsZero() {
		m.UploadedAt = s.UploadedAt
	}
	if m.ArchivedAt.IsZero() {
		m.ArchivedAt = s.ArchivedAt
	}
	if m.AlbumName == "" {
		m.AlbumName = s.AlbumName
	}
	if len(m.Tags) == 0 {
		m.Tags = s.Tags
	}
	if m.PushPull == nil {
		m.PushPull = s.PushPull
	}
	if m.Frames == 0 {
		m.Frames = s.Frames
	}
	if r.Content == "" {
		r.Content = src.Content
	}
}

// WriteRollMd serialises the roll's current metadata + content to roll.md.
func (r *Roll) WriteRollMd() error {
	var sb strings.Builder
	m := r.Metadata
	sb.WriteString("---\n")
	sb.WriteString("roll_number: " + m.RollNumber + "\n")
	if m.CameraID != "" {
		sb.WriteString("camera: " + m.CameraID + "\n")
	}
	if m.FilmID != "" {
		sb.WriteString("film: " + m.FilmID + "\n")
	}
	if !m.ShotAt.IsZero() {
		sb.WriteString("shot_at: " + m.ShotAt.Format("2006-01-02") + "\n")
	}
	if !m.FridgeAt.IsZero() {
		sb.WriteString("fridge_at: " + FormatDateTime(m.FridgeAt) + "\n")
	}
	if !m.LabAt.IsZero() {
		sb.WriteString("lab_at: " + FormatDateTime(m.LabAt) + "\n")
	}
	if m.LabName != "" {
		sb.WriteString("lab: " + m.LabName + "\n")
	}
	if !m.ScannedAt.IsZero() {
		sb.WriteString("scanned_at: " + m.ScannedAt.Format("2006-01-02") + "\n")
	}
	if !m.ProcessedAt.IsZero() {
		sb.WriteString("processed_at: " + FormatDateTime(m.ProcessedAt) + "\n")
	}
	if !m.UploadedAt.IsZero() {
		sb.WriteString("uploaded_at: " + FormatDateTime(m.UploadedAt) + "\n")
	}
	if !m.ArchivedAt.IsZero() {
		sb.WriteString("archived_at: " + FormatDateTime(m.ArchivedAt) + "\n")
	}
	if m.AlbumName != "" {
		sb.WriteString("album_name: " + m.AlbumName + "\n")
	}
	if len(m.Tags) > 0 {
		sb.WriteString("tags: " + strings.Join(m.Tags, ", ") + "\n")
	}
	if m.PushPull != nil {
		sb.WriteString("push_pull: " + strconv.FormatFloat(*m.PushPull, 'f', -1, 64) + "\n")
	}
	if m.Frames > 0 {
		sb.WriteString("frames: " + strconv.Itoa(m.Frames) + "\n")
	}
	if m.LabID != "" {
		sb.WriteString("lab_id: " + m.LabID + "\n")
	}
	sb.WriteString("---\n")
	if r.Content != "" {
		sb.WriteString(r.Content)
		if !strings.HasSuffix(r.Content, "\n") {
			sb.WriteByte('\n')
		}
	}
	return os.WriteFile(filepath.Join(r.Folder, "roll.md"), []byte(sb.String()), 0644)
}

// SetCameraFilm rewrites the camera: and film: frontmatter lines in-place.
// Pass empty string for a field to leave it unchanged.
func (r *Roll) SetCameraFilm(cameraID, filmID string) error {
	path := filepath.Join(r.Folder, "roll.md")
	content, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	parts := strings.Split(string(content), "---")
	if len(parts) < 3 {
		return fmt.Errorf("missing frontmatter in %s", path)
	}
	lines := strings.Split(parts[1], "\n")
	for i, line := range lines {
		kv := strings.SplitN(line, ":", 2)
		if len(kv) != 2 {
			continue
		}
		switch strings.TrimSpace(kv[0]) {
		case "camera":
			if cameraID != "" {
				lines[i] = "camera: " + cameraID
			}
		case "film":
			if filmID != "" {
				lines[i] = "film: " + filmID
			}
		}
	}
	newContent := "---" + strings.Join(lines, "\n") + "---" + parts[2]
	return os.WriteFile(path, []byte(newContent), 0644)
}

// SetArchived sets the archived timestamp for a roll
func (roll *Roll) SetArchived() error {
	roll.Metadata.ArchivedAt = time.Now()
	return roll.UpdateMetadata()
}

// IsArchivedLocally checks if the roll has been archived locally (has archived_at timestamp)
func (roll *Roll) IsArchivedLocally() bool {
	return !roll.Metadata.ArchivedAt.IsZero()
}
