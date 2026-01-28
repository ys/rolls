package ui

import (
	"strings"
	"testing"
	"time"

	"github.com/ys/rolls/roll"
)

func TestRollItem_Title(t *testing.T) {
	tests := []struct {
		name            string
		rollNumber      string
		hasContactSheet bool
		wantContains    string
		wantCS          bool
	}{
		{
			name:            "roll without contact sheet",
			rollNumber:      "roll-001",
			hasContactSheet: false,
			wantContains:    "roll-001",
			wantCS:          false,
		},
		{
			name:            "roll with contact sheet",
			rollNumber:      "roll-002",
			hasContactSheet: true,
			wantContains:    "roll-002",
			wantCS:          true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item := RollItem{
				Roll: roll.Roll{
					Metadata: roll.Metadata{
						RollNumber: tt.rollNumber,
					},
				},
				hasContactSheet: tt.hasContactSheet,
			}

			title := item.Title()

			if !strings.Contains(title, tt.wantContains) {
				t.Errorf("RollItem.Title() = %q, should contain %q", title, tt.wantContains)
			}

			hasCSIndicator := strings.Contains(title, "[CS]")
			if hasCSIndicator != tt.wantCS {
				t.Errorf("RollItem.Title() contact sheet indicator = %v, want %v", hasCSIndicator, tt.wantCS)
			}
		})
	}
}

func TestRollItem_Description(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name        string
		metadata    roll.Metadata
		wantBadge   string
		wantCamera  bool
		wantFilm    bool
	}{
		{
			name: "pending roll (no dates set)",
			metadata: roll.Metadata{
				CameraID: "leica-m6",
				FilmID:   "portra-400",
			},
			wantBadge:  "PENDING",
			wantCamera: true,
			wantFilm:   true,
		},
		{
			name: "processed roll",
			metadata: roll.Metadata{
				CameraID:    "leica-m6",
				FilmID:      "portra-400",
				ProcessedAt: now,
			},
			wantBadge:  "PROCESSED",
			wantCamera: true,
			wantFilm:   true,
		},
		{
			name: "uploaded roll",
			metadata: roll.Metadata{
				CameraID:    "leica-m6",
				FilmID:      "portra-400",
				ProcessedAt: now,
				UploadedAt:  now,
			},
			wantBadge:  "UPLOADED",
			wantCamera: true,
			wantFilm:   true,
		},
		{
			name: "archived roll",
			metadata: roll.Metadata{
				CameraID:    "leica-m6",
				FilmID:      "portra-400",
				ProcessedAt: now,
				UploadedAt:  now,
				ArchivedAt:  now,
			},
			wantBadge:  "ARCHIVED",
			wantCamera: true,
			wantFilm:   true,
		},
		{
			name: "archived takes precedence over uploaded",
			metadata: roll.Metadata{
				CameraID:   "nikon-f3",
				FilmID:     "hp5",
				UploadedAt: now,
				ArchivedAt: now,
			},
			wantBadge:  "ARCHIVED",
			wantCamera: true,
			wantFilm:   true,
		},
		{
			name: "uploaded takes precedence over processed",
			metadata: roll.Metadata{
				CameraID:    "nikon-f3",
				FilmID:      "hp5",
				ProcessedAt: now,
				UploadedAt:  now,
			},
			wantBadge:  "UPLOADED",
			wantCamera: true,
			wantFilm:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item := RollItem{
				Roll: roll.Roll{
					Metadata: tt.metadata,
				},
			}

			desc := item.Description()

			if !strings.Contains(desc, tt.wantBadge) {
				t.Errorf("RollItem.Description() = %q, should contain badge %q", desc, tt.wantBadge)
			}

			if tt.wantCamera && !strings.Contains(desc, tt.metadata.CameraID) {
				t.Errorf("RollItem.Description() = %q, should contain camera %q", desc, tt.metadata.CameraID)
			}

			if tt.wantFilm && !strings.Contains(desc, tt.metadata.FilmID) {
				t.Errorf("RollItem.Description() = %q, should contain film %q", desc, tt.metadata.FilmID)
			}
		})
	}
}

func TestRollItem_FilterValue(t *testing.T) {
	tests := []struct {
		name       string
		rollNumber string
		cameraID   string
		filmID     string
	}{
		{
			name:       "includes all searchable fields",
			rollNumber: "roll-001",
			cameraID:   "leica-m6",
			filmID:     "portra-400",
		},
		{
			name:       "different values",
			rollNumber: "2024-042",
			cameraID:   "nikon-f3",
			filmID:     "hp5-plus",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item := RollItem{
				Roll: roll.Roll{
					Metadata: roll.Metadata{
						RollNumber: tt.rollNumber,
						CameraID:   tt.cameraID,
						FilmID:     tt.filmID,
					},
				},
			}

			filterVal := item.FilterValue()

			if !strings.Contains(filterVal, tt.rollNumber) {
				t.Errorf("RollItem.FilterValue() = %q, should contain roll number %q", filterVal, tt.rollNumber)
			}

			if !strings.Contains(filterVal, tt.cameraID) {
				t.Errorf("RollItem.FilterValue() = %q, should contain camera %q", filterVal, tt.cameraID)
			}

			if !strings.Contains(filterVal, tt.filmID) {
				t.Errorf("RollItem.FilterValue() = %q, should contain film %q", filterVal, tt.filmID)
			}
		})
	}
}

func TestBadgeFunctions(t *testing.T) {
	tests := []struct {
		name     string
		badgeFn  func() string
		wantText string
	}{
		{
			name:     "archived badge",
			badgeFn:  archivedBadge,
			wantText: "ARCHIVED",
		},
		{
			name:     "processed badge",
			badgeFn:  processedBadge,
			wantText: "PROCESSED",
		},
		{
			name:     "uploaded badge",
			badgeFn:  uploadedBadge,
			wantText: "UPLOADED",
		},
		{
			name:     "pending badge",
			badgeFn:  pendingBadge,
			wantText: "PENDING",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.badgeFn()

			if !strings.Contains(result, tt.wantText) {
				t.Errorf("%s() = %q, should contain %q", tt.name, result, tt.wantText)
			}

			// Badge should not be empty
			if result == "" {
				t.Errorf("%s() returned empty string", tt.name)
			}
		})
	}
}

func TestContactSheetIcon(t *testing.T) {
	icon := contactSheetIcon()

	if !strings.Contains(icon, "[CS]") {
		t.Errorf("contactSheetIcon() = %q, should contain [CS]", icon)
	}
}
