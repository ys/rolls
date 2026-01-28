package ui

import (
	"fmt"
	"os"
	"os/exec"
	"path"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/ys/rolls/roll"
)

// Action represents a TUI action
type Action struct {
	Key         string
	Name        string
	Description string
}

// Available actions
var Actions = map[string]Action{
	"A": {Key: "A", Name: "Archive", Description: "Mark roll as archived"},
	"O": {Key: "O", Name: "Open", Description: "Open folder in Finder"},
	"V": {Key: "V", Name: "View", Description: "View contact sheet"},
	"P": {Key: "P", Name: "Process", Description: "Process roll (EXIF update)"},
	"U": {Key: "U", Name: "Upload", Description: "Upload to Lightroom"},
	"G": {Key: "G", Name: "Contact Sheet", Description: "Generate contact sheet"},
}

// ActionResultMsg is sent when an action completes
type ActionResultMsg struct {
	Action  string
	Success bool
	Message string
	Error   error
}

// ArchiveRollCmd archives a roll by setting archived_at timestamp
func ArchiveRollCmd(r *roll.Roll) tea.Cmd {
	return func() tea.Msg {
		if r == nil {
			return ActionResultMsg{
				Action:  "Archive",
				Success: false,
				Message: "No roll selected",
			}
		}

		if r.IsArchivedLocally() {
			return ActionResultMsg{
				Action:  "Archive",
				Success: false,
				Message: fmt.Sprintf("%s is already archived", r.Metadata.RollNumber),
			}
		}

		err := r.SetArchived()
		if err != nil {
			return ActionResultMsg{
				Action:  "Archive",
				Success: false,
				Message: fmt.Sprintf("Failed to archive: %v", err),
				Error:   err,
			}
		}

		return ActionResultMsg{
			Action:  "Archive",
			Success: true,
			Message: fmt.Sprintf("Archived %s", r.Metadata.RollNumber),
		}
	}
}

// OpenFolderCmd opens the roll folder in Finder
func OpenFolderCmd(r *roll.Roll) tea.Cmd {
	return func() tea.Msg {
		if r == nil {
			return ActionResultMsg{
				Action:  "Open",
				Success: false,
				Message: "No roll selected",
			}
		}

		cmd := exec.Command("open", r.Folder)
		err := cmd.Run()
		if err != nil {
			return ActionResultMsg{
				Action:  "Open",
				Success: false,
				Message: fmt.Sprintf("Failed to open folder: %v", err),
				Error:   err,
			}
		}

		return ActionResultMsg{
			Action:  "Open",
			Success: true,
			Message: fmt.Sprintf("Opened %s", r.Folder),
		}
	}
}

// ViewContactSheetCmd opens the contact sheet in Preview
func ViewContactSheetCmd(r *roll.Roll, cfg *roll.Config) tea.Cmd {
	return func() tea.Msg {
		if r == nil {
			return ActionResultMsg{
				Action:  "View",
				Success: false,
				Message: "No roll selected",
			}
		}

		contactSheetPath := path.Join(cfg.ContactSheetPath, "images", r.Metadata.RollNumber+".webp")

		if _, err := os.Stat(contactSheetPath); os.IsNotExist(err) {
			return ActionResultMsg{
				Action:  "View",
				Success: false,
				Message: fmt.Sprintf("No contact sheet for %s", r.Metadata.RollNumber),
			}
		}

		cmd := exec.Command("open", contactSheetPath)
		err := cmd.Run()
		if err != nil {
			return ActionResultMsg{
				Action:  "View",
				Success: false,
				Message: fmt.Sprintf("Failed to open contact sheet: %v", err),
				Error:   err,
			}
		}

		return ActionResultMsg{
			Action:  "View",
			Success: true,
			Message: fmt.Sprintf("Viewing contact sheet for %s", r.Metadata.RollNumber),
		}
	}
}

// HasContactSheet checks if a roll has a contact sheet image
func HasContactSheet(r *roll.Roll, cfg *roll.Config) bool {
	if r == nil || cfg == nil {
		return false
	}
	contactSheetPath := path.Join(cfg.ContactSheetPath, "images", r.Metadata.RollNumber+".webp")
	_, err := os.Stat(contactSheetPath)
	return err == nil
}
