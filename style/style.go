package style

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	// ProgressStyle is used for progress bars
	ProgressStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	// TitleStyle is used for titles
	TitleStyle = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("205"))

	// FileStyle is used for file paths
	FileStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("252"))

	// AccentStyle is used for accent text
	AccentStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("213"))

	// SummaryStyle is used for summary text
	SummaryStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("252"))

	// SuccessStyle is used for success messages
	SuccessStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("46"))

	// ErrorStyle is used for error messages
	ErrorStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("196"))
)

// RenderTitle renders a title with an emoji
func RenderTitle(emoji, text string) string {
	return TitleStyle.Render(fmt.Sprintf("%s %s", emoji, text))
}

// RenderFile renders a file path
func RenderFile(text string) string {
	return FileStyle.Render(text)
}

// RenderAccent renders accent text
func RenderAccent(text string) string {
	return AccentStyle.Render(text)
}

// RenderSummary renders summary text
func RenderSummary(text string) string {
	return SummaryStyle.Render(text)
}

// RenderSuccess renders success text
func RenderSuccess(text string) string {
	return SuccessStyle.Render(text)
}

// RenderError renders error text
func RenderError(text string) string {
	return ErrorStyle.Render(text)
}

// RenderProgressBar renders a progress bar
func RenderProgressBar(current, total int) string {
	progress := float64(current) / float64(total)
	bar := fmt.Sprintf("[%s%s] %d/%d",
		strings.Repeat("=", int(progress*20)),
		strings.Repeat(" ", 20-int(progress*20)),
		current,
		total)
	return ProgressStyle.Render(bar)
}
