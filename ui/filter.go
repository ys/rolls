package ui

import (
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	filterStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(subtle).
			Padding(0, 1)

	filterLabelStyle = lipgloss.NewStyle().
				Foreground(accent).
				Bold(true)
)

// Filter represents a search/filter component
type Filter struct {
	textInput textinput.Model
	Active    bool
	Query     string
}

// NewFilter creates a new filter component
func NewFilter() Filter {
	ti := textinput.New()
	ti.Placeholder = "Type to filter..."
	ti.CharLimit = 100
	ti.Width = 30
	ti.Prompt = "/ "
	ti.PromptStyle = filterLabelStyle

	return Filter{
		textInput: ti,
		Active:    false,
		Query:     "",
	}
}

// Focus activates the filter
func (f *Filter) Focus() tea.Cmd {
	f.Active = true
	return f.textInput.Focus()
}

// Blur deactivates the filter
func (f *Filter) Blur() {
	f.Active = false
	f.textInput.Blur()
}

// Clear resets the filter
func (f *Filter) Clear() {
	f.Query = ""
	f.textInput.SetValue("")
	f.Blur()
}

// Update handles messages for the filter
func (f Filter) Update(msg tea.Msg) (Filter, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			f.Clear()
			return f, nil
		case "enter":
			f.Query = f.textInput.Value()
			f.Blur()
			return f, nil
		}
	}

	f.textInput, cmd = f.textInput.Update(msg)
	f.Query = f.textInput.Value()
	return f, cmd
}

// View renders the filter
func (f Filter) View() string {
	if !f.Active && f.Query == "" {
		return ""
	}

	return filterStyle.Render(f.textInput.View())
}

// Matches checks if a string matches the filter query
func (f Filter) Matches(s string) bool {
	if f.Query == "" {
		return true
	}
	return strings.Contains(strings.ToLower(s), strings.ToLower(f.Query))
}

// FilterMsg is sent when filter state changes
type FilterMsg struct {
	Query  string
	Active bool
}
