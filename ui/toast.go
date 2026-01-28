package ui

import (
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ToastType defines the type of toast notification
type ToastType int

const (
	ToastSuccess ToastType = iota
	ToastError
	ToastInfo
)

// ToastDuration is how long toasts are visible
const ToastDuration = 3 * time.Second

// Toast represents a temporary notification message
type Toast struct {
	Message   string
	Type      ToastType
	Visible   bool
	ExpiresAt time.Time
}

// toastStyle returns the appropriate style for the toast type
func (t Toast) Style() lipgloss.Style {
	base := lipgloss.NewStyle().
		Padding(0, 1).
		MarginTop(1)

	switch t.Type {
	case ToastSuccess:
		return base.
			Foreground(lipgloss.Color("#FFFFFF")).
			Background(lipgloss.Color("#66A80F"))
	case ToastError:
		return base.
			Foreground(lipgloss.Color("#FFFFFF")).
			Background(lipgloss.Color("#E03131"))
	case ToastInfo:
		return base.
			Foreground(lipgloss.Color("#FFFFFF")).
			Background(lipgloss.Color("#1971C2"))
	default:
		return base
	}
}

// View renders the toast
func (t Toast) View() string {
	if !t.Visible {
		return ""
	}
	return t.Style().Render(t.Message)
}

// NewToast creates a new toast notification
func NewToast(message string, toastType ToastType) Toast {
	return Toast{
		Message:   message,
		Type:      toastType,
		Visible:   true,
		ExpiresAt: time.Now().Add(ToastDuration),
	}
}

// ToastMsg is sent when a toast should be displayed
type ToastMsg struct {
	Message string
	Type    ToastType
}

// ToastExpiredMsg is sent when a toast should be hidden
type ToastExpiredMsg struct{}

// ShowToast creates a command to show a toast
func ShowToast(message string, toastType ToastType) tea.Cmd {
	return func() tea.Msg {
		return ToastMsg{Message: message, Type: toastType}
	}
}

// ScheduleToastDismiss schedules the toast to be dismissed
func ScheduleToastDismiss() tea.Cmd {
	return tea.Tick(ToastDuration, func(time.Time) tea.Msg {
		return ToastExpiredMsg{}
	})
}
