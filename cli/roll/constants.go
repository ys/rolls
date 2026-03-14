package roll

import "time"

// File processing constants
const (
	// NumWorkers is the number of concurrent workers for EXIF processing
	NumWorkers = 4

	// ContactSheetScale is the divisor for scaling images in contact sheets
	// Based on Mori scans of about 5300x3600 pixels
	ContactSheetScale = 20
)

// File names and extensions
const (
	RollMarkdownFile = "roll.md"
	MarkdownExt      = ".md"
	ContactSheetExt  = ".webp"
	DSStoreFile      = ".DS_Store"
)

// Date format layouts for Go's time.Format
const (
	// DateFormat is the standard date format (YYYY-MM-DD)
	DateFormat = "2006-01-02"

	// DateTimeFormat is the standard datetime format (YYYY-MM-DD HH:MM:SS)
	DateTimeFormat = "2006-01-02 15:04:05"

	// ExifDateTimeFormat is the EXIF datetime format (YYYY:MM:DD HH:MM:SS)
	ExifDateTimeFormat = "2006:01:02 15:04:05"

	// FilePrefixDateFormat is the date format used in file prefixes (MMDD)
	FilePrefixDateFormat = "0102"
)

// FormatDate formats a time as YYYY-MM-DD
func FormatDate(t time.Time) string {
	return t.Format(DateFormat)
}

// FormatDateTime formats a time as YYYY-MM-DD HH:MM:SS
func FormatDateTime(t time.Time) string {
	return t.Format(DateTimeFormat)
}

// FormatExifDateTime formats a time for EXIF metadata (YYYY:MM:DD HH:MM:SS)
func FormatExifDateTime(t time.Time) string {
	return t.Format(ExifDateTimeFormat)
}

// FormatFilePrefixDate formats a time as MMDD for file prefixes
func FormatFilePrefixDate(t time.Time) string {
	return t.Format(FilePrefixDateFormat)
}

// ParseDate parses a YYYY-MM-DD string into a time.Time
func ParseDate(s string) (time.Time, error) {
	return time.Parse(DateFormat, s)
}

// ParseDateTime parses a datetime string in YYYY-MM-DD HH:MM:SS, RFC3339, or date-only YYYY-MM-DD format
func ParseDateTime(s string) (time.Time, error) {
	if t, err := time.Parse(DateTimeFormat, s); err == nil {
		return t, nil
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, nil
	}
	// Fall back to date-only (treat as start of day)
	return time.Parse(DateFormat, s)
}
