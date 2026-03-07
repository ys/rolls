package roll

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestFromMarkdown(t *testing.T) {
	tests := []struct {
		name     string
		content  string
		wantErr  bool
		validate func(t *testing.T, r Roll)
	}{
		{
			name: "valid roll with all fields",
			content: `---
roll_number: 24x01
camera: leica-m6
film: portra-400
shot_at: 2024-01-15
scanned_at: 2024-01-20
processed_at: 2024-01-21 14:30:00
tags: street, color
---

Some notes about this roll.`,
			wantErr: false,
			validate: func(t *testing.T, r Roll) {
				if r.Metadata.RollNumber != "24x01" {
					t.Errorf("RollNumber = %q, want %q", r.Metadata.RollNumber, "24x01")
				}
				if r.Metadata.CameraID != "leica-m6" {
					t.Errorf("CameraID = %q, want %q", r.Metadata.CameraID, "leica-m6")
				}
				if r.Metadata.FilmID != "portra-400" {
					t.Errorf("FilmID = %q, want %q", r.Metadata.FilmID, "portra-400")
				}
				expectedShotAt := time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC)
				if !r.Metadata.ShotAt.Equal(expectedShotAt) {
					t.Errorf("ShotAt = %v, want %v", r.Metadata.ShotAt, expectedShotAt)
				}
				expectedScannedAt := time.Date(2024, 1, 20, 0, 0, 0, 0, time.UTC)
				if !r.Metadata.ScannedAt.Equal(expectedScannedAt) {
					t.Errorf("ScannedAt = %v, want %v", r.Metadata.ScannedAt, expectedScannedAt)
				}
				expectedProcessedAt := time.Date(2024, 1, 21, 14, 30, 0, 0, time.UTC)
				if !r.Metadata.ProcessedAt.Equal(expectedProcessedAt) {
					t.Errorf("ProcessedAt = %v, want %v", r.Metadata.ProcessedAt, expectedProcessedAt)
				}
				if len(r.Metadata.Tags) != 2 {
					t.Errorf("Tags length = %d, want 2", len(r.Metadata.Tags))
				}
				if r.Content != "Some notes about this roll." {
					t.Errorf("Content = %q, want %q", r.Content, "Some notes about this roll.")
				}
			},
		},
		{
			name: "minimal roll",
			content: `---
roll_number: 24x02
camera: contax-t2
film: hp5
---

`,
			wantErr: false,
			validate: func(t *testing.T, r Roll) {
				if r.Metadata.RollNumber != "24x02" {
					t.Errorf("RollNumber = %q, want %q", r.Metadata.RollNumber, "24x02")
				}
				if r.Metadata.CameraID != "contax-t2" {
					t.Errorf("CameraID = %q, want %q", r.Metadata.CameraID, "contax-t2")
				}
				if r.Metadata.FilmID != "hp5" {
					t.Errorf("FilmID = %q, want %q", r.Metadata.FilmID, "hp5")
				}
				if !r.Metadata.ShotAt.IsZero() {
					t.Errorf("ShotAt should be zero, got %v", r.Metadata.ShotAt)
				}
			},
		},
		{
			name:    "missing frontmatter",
			content: `Just some content without frontmatter`,
			wantErr: true,
		},
		{
			name: "only one delimiter",
			content: `---
roll_number: 24x03
no closing delimiter`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create temp directory and file
			tmpDir := t.TempDir()
			tmpFile := filepath.Join(tmpDir, "roll.md")
			if err := os.WriteFile(tmpFile, []byte(tt.content), 0644); err != nil {
				t.Fatalf("failed to write temp file: %v", err)
			}

			roll, err := FromMarkdown(tmpFile)
			if (err != nil) != tt.wantErr {
				t.Errorf("FromMarkdown() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr && tt.validate != nil {
				tt.validate(t, roll)
			}
		})
	}
}

func TestFilesPrefix(t *testing.T) {
	tests := []struct {
		name       string
		rollNumber string
		shotAt     time.Time
		want       string
	}{
		{
			name:       "standard prefix",
			rollNumber: "24x01",
			shotAt:     time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC),
			want:       "24x01-0115",
		},
		{
			name:       "december date",
			rollNumber: "23x36",
			shotAt:     time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC),
			want:       "23x36-1225",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roll := Roll{
				Metadata: Metadata{
					RollNumber: tt.rollNumber,
					ShotAt:     tt.shotAt,
				},
			}
			if got := roll.FilesPrefix(); got != tt.want {
				t.Errorf("FilesPrefix() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestSet(t *testing.T) {
	t.Run("Add and ToSlice", func(t *testing.T) {
		s := make(Set)
		s.Add("a")
		s.Add("b")
		s.Add("a") // duplicate

		slice := s.ToSlice()
		if len(slice) != 2 {
			t.Errorf("Set should have 2 unique elements, got %d", len(slice))
		}
	})

	t.Run("AddAll", func(t *testing.T) {
		s := make(Set)
		s.AddAll([]string{"x", "y", "z", "x"})

		slice := s.ToSlice()
		if len(slice) != 3 {
			t.Errorf("Set should have 3 unique elements, got %d", len(slice))
		}
	})
}

func TestFilter(t *testing.T) {
	rolls := Rolls{
		{Metadata: Metadata{RollNumber: "24x01", CameraID: "leica-m6"}},
		{Metadata: Metadata{RollNumber: "24x02", CameraID: "contax-t2"}},
		{Metadata: Metadata{RollNumber: "24x03", CameraID: "leica-m6"}},
	}

	filtered := Filter(rolls, func(r Roll) bool {
		return r.Metadata.CameraID == "leica-m6"
	})

	if len(filtered) != 2 {
		t.Errorf("Filter should return 2 rolls, got %d", len(filtered))
	}
}

func TestByRollNumber(t *testing.T) {
	rolls := Rolls{
		{Metadata: Metadata{RollNumber: "24x03"}},
		{Metadata: Metadata{RollNumber: "24x01"}},
		{Metadata: Metadata{RollNumber: "24x02"}},
	}

	byNum := ByRollNumber(rolls)

	if byNum.Len() != 3 {
		t.Errorf("Len() = %d, want 3", byNum.Len())
	}

	if !byNum.Less(1, 0) { // 24x01 < 24x03
		t.Error("Less() should return true for 24x01 < 24x03")
	}

	byNum.Swap(0, 1)
	if rolls[0].Metadata.RollNumber != "24x01" {
		t.Errorf("After Swap, first roll should be 24x01, got %s", rolls[0].Metadata.RollNumber)
	}
}
