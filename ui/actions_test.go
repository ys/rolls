package ui

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ys/rolls/roll"
)

func TestHasContactSheet(t *testing.T) {
	// Create a temporary directory for testing
	tmpDir, err := os.MkdirTemp("", "rolls-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create the images subdirectory
	imagesDir := filepath.Join(tmpDir, "images")
	err = os.MkdirAll(imagesDir, 0755)
	if err != nil {
		t.Fatalf("Failed to create images dir: %v", err)
	}

	// Create a test contact sheet file
	testContactSheet := filepath.Join(imagesDir, "roll-001.webp")
	err = os.WriteFile(testContactSheet, []byte("fake image"), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	cfg := &roll.Config{
		ContactSheetPath: tmpDir,
	}

	tests := []struct {
		name     string
		roll     *roll.Roll
		cfg      *roll.Config
		expected bool
	}{
		{
			name:     "nil roll returns false",
			roll:     nil,
			cfg:      cfg,
			expected: false,
		},
		{
			name: "nil config returns false",
			roll: &roll.Roll{
				Metadata: roll.Metadata{RollNumber: "roll-001"},
			},
			cfg:      nil,
			expected: false,
		},
		{
			name: "existing contact sheet returns true",
			roll: &roll.Roll{
				Metadata: roll.Metadata{RollNumber: "roll-001"},
			},
			cfg:      cfg,
			expected: true,
		},
		{
			name: "missing contact sheet returns false",
			roll: &roll.Roll{
				Metadata: roll.Metadata{RollNumber: "roll-999"},
			},
			cfg:      cfg,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := HasContactSheet(tt.roll, tt.cfg)
			if result != tt.expected {
				t.Errorf("HasContactSheet() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestArchiveRollCmd_NilRoll(t *testing.T) {
	cmd := ArchiveRollCmd(nil)
	if cmd == nil {
		t.Fatal("ArchiveRollCmd(nil) returned nil command")
	}

	msg := cmd()
	result, ok := msg.(ActionResultMsg)
	if !ok {
		t.Fatalf("ArchiveRollCmd(nil) returned %T, want ActionResultMsg", msg)
	}

	if result.Success {
		t.Error("ArchiveRollCmd(nil) should not succeed")
	}

	if result.Action != "Archive" {
		t.Errorf("ActionResultMsg.Action = %q, want %q", result.Action, "Archive")
	}
}

func TestOpenFolderCmd_NilRoll(t *testing.T) {
	cmd := OpenFolderCmd(nil)
	if cmd == nil {
		t.Fatal("OpenFolderCmd(nil) returned nil command")
	}

	msg := cmd()
	result, ok := msg.(ActionResultMsg)
	if !ok {
		t.Fatalf("OpenFolderCmd(nil) returned %T, want ActionResultMsg", msg)
	}

	if result.Success {
		t.Error("OpenFolderCmd(nil) should not succeed")
	}

	if result.Action != "Open" {
		t.Errorf("ActionResultMsg.Action = %q, want %q", result.Action, "Open")
	}
}

func TestViewContactSheetCmd_NilRoll(t *testing.T) {
	cfg := &roll.Config{ContactSheetPath: "/tmp"}

	cmd := ViewContactSheetCmd(nil, cfg)
	if cmd == nil {
		t.Fatal("ViewContactSheetCmd(nil, cfg) returned nil command")
	}

	msg := cmd()
	result, ok := msg.(ActionResultMsg)
	if !ok {
		t.Fatalf("ViewContactSheetCmd(nil, cfg) returned %T, want ActionResultMsg", msg)
	}

	if result.Success {
		t.Error("ViewContactSheetCmd(nil, cfg) should not succeed")
	}

	if result.Action != "View" {
		t.Errorf("ActionResultMsg.Action = %q, want %q", result.Action, "View")
	}
}

func TestViewContactSheetCmd_MissingContactSheet(t *testing.T) {
	// Create a temporary directory that doesn't have the contact sheet
	tmpDir, err := os.MkdirTemp("", "rolls-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	cfg := &roll.Config{ContactSheetPath: tmpDir}
	r := &roll.Roll{
		Metadata: roll.Metadata{RollNumber: "nonexistent-roll"},
	}

	cmd := ViewContactSheetCmd(r, cfg)
	msg := cmd()
	result, ok := msg.(ActionResultMsg)
	if !ok {
		t.Fatalf("ViewContactSheetCmd() returned %T, want ActionResultMsg", msg)
	}

	if result.Success {
		t.Error("ViewContactSheetCmd() should fail for missing contact sheet")
	}

	if result.Action != "View" {
		t.Errorf("ActionResultMsg.Action = %q, want %q", result.Action, "View")
	}
}

func TestActions_Defined(t *testing.T) {
	expectedActions := []string{"A", "O", "V", "P", "U", "G"}

	for _, key := range expectedActions {
		action, exists := Actions[key]
		if !exists {
			t.Errorf("Actions[%q] not defined", key)
			continue
		}

		if action.Key != key {
			t.Errorf("Actions[%q].Key = %q, want %q", key, action.Key, key)
		}

		if action.Name == "" {
			t.Errorf("Actions[%q].Name is empty", key)
		}

		if action.Description == "" {
			t.Errorf("Actions[%q].Description is empty", key)
		}
	}
}

func TestActionResultMsg_Fields(t *testing.T) {
	msg := ActionResultMsg{
		Action:  "Test",
		Success: true,
		Message: "Test message",
		Error:   nil,
	}

	if msg.Action != "Test" {
		t.Errorf("ActionResultMsg.Action = %q, want %q", msg.Action, "Test")
	}

	if !msg.Success {
		t.Error("ActionResultMsg.Success should be true")
	}

	if msg.Message != "Test message" {
		t.Errorf("ActionResultMsg.Message = %q, want %q", msg.Message, "Test message")
	}

	if msg.Error != nil {
		t.Errorf("ActionResultMsg.Error = %v, want nil", msg.Error)
	}
}
