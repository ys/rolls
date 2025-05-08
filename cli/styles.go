package cli

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

var (
	// Flexoki color scheme
	Subtle    = lipgloss.AdaptiveColor{Light: "#0B7285", Dark: "#0B7285"}    // Flexoki cyan
	Highlight = lipgloss.AdaptiveColor{Light: "#8B7EC8", Dark: "#8B7EC8"}    // Flexoki purple
	Special   = lipgloss.AdaptiveColor{Light: "#AD3FA4", Dark: "#AD3FA4"}    // Flexoki magenta
	Accent    = lipgloss.AdaptiveColor{Light: "#B47109", Dark: "#B47109"}    // Flexoki yellow

	// Title style for section headings and important information
	TitleStyle = lipgloss.NewStyle().
		MarginLeft(2).
		Foreground(Highlight)

	// Progress style for progress bars and status indicators
	ProgressStyle = lipgloss.NewStyle().
		MarginLeft(2).
		MarginRight(2).
		Padding(0, 1).
		Foreground(Subtle)

	// File style for showing file paths and names
	FileStyle = lipgloss.NewStyle().
		MarginLeft(2).
		Foreground(Special)

	// Accent style for highlighting secondary information
	AccentStyle = lipgloss.NewStyle().
		MarginLeft(2).
		Foreground(Accent)

	// Summary style for final results and summaries
	SummaryStyle = lipgloss.NewStyle().
		MarginLeft(2).
		Foreground(Subtle)
)

// RenderProgressBar creates a formatted progress bar
func RenderProgressBar(current, total int) string {
	progress := float64(current) / float64(total)
	bar := fmt.Sprintf("[%s%s] %d/%d",
		strings.Repeat("=", int(progress*20)),
		strings.Repeat(" ", 20-int(progress*20)),
		current,
		total)
	return ProgressStyle.Render(bar)
}

// RenderTitle formats a title with emoji
func RenderTitle(emoji string, text string) string {
	return TitleStyle.Render(fmt.Sprintf("%s %s", emoji, text))
}

// RenderFile formats a file name or path
func RenderFile(text string) string {
	return FileStyle.Render(text)
}

// RenderAccent formats accent text
func RenderAccent(text string) string {
	return AccentStyle.Render(text)
}

// RenderSummary formats summary text
func RenderSummary(text string) string {
	return SummaryStyle.Render(text)
}

// RenderSuccess formats a success message with a checkmark
func RenderSuccess(text string) string {
	return TitleStyle.Render(fmt.Sprintf("✅ %s", text))
}

// FormatTime formats a time in a consistent manner
func FormatTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// FormatDate formats a date in a consistent manner
func FormatDate(t time.Time) string {
	return t.Format("2006-01-02")
}

// ClearPreviousOutput clears lines from terminal output
func ClearPreviousOutput(lines int) {
	// Move cursor up n lines
	fmt.Printf("\033[%dA", lines)
	// Clear from cursor to end of screen
	fmt.Print("\033[J")
}

// RenderFilePath formats a file path or name
func RenderFilePath(path string) string {
	return FileStyle.Render(fmt.Sprintf("📄 %s", path))
}

// RenderFolderPath formats a folder path
func RenderFolderPath(path string) string {
	return FileStyle.Render(fmt.Sprintf("📁 %s", path))
}