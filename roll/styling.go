package roll

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Flexoki color scheme
var (
	subtle    = lipgloss.AdaptiveColor{Light: "#0B7285", Dark: "#0B7285"}    // Flexoki cyan
	highlight = lipgloss.AdaptiveColor{Light: "#8B7EC8", Dark: "#8B7EC8"}    // Flexoki purple
	special   = lipgloss.AdaptiveColor{Light: "#AD3FA4", Dark: "#AD3FA4"}    // Flexoki magenta
	accent    = lipgloss.AdaptiveColor{Light: "#B47109", Dark: "#B47109"}    // Flexoki yellow

	titleStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(highlight)

	progressStyle = lipgloss.NewStyle().
			MarginLeft(2).
			MarginRight(2).
			Padding(0, 1).
			Foreground(subtle)

	fileStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(special)

	accentStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(accent)

	summaryStyle = lipgloss.NewStyle().
			MarginLeft(2).
			Foreground(subtle)
)

// RenderProgressBar creates a formatted progress bar
func RenderProgressBar(current, total int) string {
	progress := float64(current) / float64(total)
	bar := fmt.Sprintf("[%s%s] %d/%d",
		strings.Repeat("=", int(progress*20)),
		strings.Repeat(" ", 20-int(progress*20)),
		current,
		total)
	return progressStyle.Render(bar)
}

// RenderTitle formats a title with emoji
func RenderTitle(emoji string, text string) string {
	return titleStyle.Render(fmt.Sprintf("%s %s", emoji, text))
}

// RenderFile formats a file name or path
func RenderFile(text string) string {
	return fileStyle.Render(text)
}

// RenderAccent formats accent text
func RenderAccent(text string) string {
	return accentStyle.Render(text)
}

// RenderSummary formats summary text
func RenderSummary(text string) string {
	return summaryStyle.Render(text)
}

// RenderSuccess formats a success message with a checkmark
func RenderSuccess(text string) string {
	return titleStyle.Render(fmt.Sprintf("✅ %s", text))
}