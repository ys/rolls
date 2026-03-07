package roll

import (
	"testing"
	"time"
)

func TestFormatDate(t *testing.T) {
	tm := time.Date(2024, 1, 15, 14, 30, 45, 0, time.UTC)
	got := FormatDate(tm)
	want := "2024-01-15"
	if got != want {
		t.Errorf("FormatDate() = %q, want %q", got, want)
	}
}

func TestFormatDateTime(t *testing.T) {
	tm := time.Date(2024, 1, 15, 14, 30, 45, 0, time.UTC)
	got := FormatDateTime(tm)
	want := "2024-01-15 14:30:45"
	if got != want {
		t.Errorf("FormatDateTime() = %q, want %q", got, want)
	}
}

func TestFormatExifDateTime(t *testing.T) {
	tm := time.Date(2024, 1, 15, 14, 30, 45, 0, time.UTC)
	got := FormatExifDateTime(tm)
	want := "2024:01:15 14:30:45"
	if got != want {
		t.Errorf("FormatExifDateTime() = %q, want %q", got, want)
	}
}

func TestFormatFilePrefixDate(t *testing.T) {
	tm := time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC)
	got := FormatFilePrefixDate(tm)
	want := "0115"
	if got != want {
		t.Errorf("FormatFilePrefixDate() = %q, want %q", got, want)
	}
}

func TestParseDate(t *testing.T) {
	tests := []struct {
		input   string
		wantErr bool
		want    time.Time
	}{
		{
			input:   "2024-01-15",
			wantErr: false,
			want:    time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC),
		},
		{
			input:   "invalid",
			wantErr: true,
		},
		{
			input:   "2024/01/15",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got, err := ParseDate(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseDate(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}
			if !tt.wantErr && !got.Equal(tt.want) {
				t.Errorf("ParseDate(%q) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}

func TestParseDateTime(t *testing.T) {
	tests := []struct {
		input   string
		wantErr bool
		want    time.Time
	}{
		{
			input:   "2024-01-15 14:30:45",
			wantErr: false,
			want:    time.Date(2024, 1, 15, 14, 30, 45, 0, time.UTC),
		},
		{
			input:   "invalid",
			wantErr: true,
		},
		{
			input:   "2024-01-15",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got, err := ParseDateTime(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseDateTime(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}
			if !tt.wantErr && !got.Equal(tt.want) {
				t.Errorf("ParseDateTime(%q) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}
