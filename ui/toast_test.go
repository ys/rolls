package ui

import (
	"testing"
	"time"
)

func TestNewToast(t *testing.T) {
	tests := []struct {
		name        string
		message     string
		toastType   ToastType
		wantVisible bool
	}{
		{
			name:        "success toast",
			message:     "Operation completed",
			toastType:   ToastSuccess,
			wantVisible: true,
		},
		{
			name:        "error toast",
			message:     "Something went wrong",
			toastType:   ToastError,
			wantVisible: true,
		},
		{
			name:        "info toast",
			message:     "Information message",
			toastType:   ToastInfo,
			wantVisible: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			toast := NewToast(tt.message, tt.toastType)

			if toast.Message != tt.message {
				t.Errorf("NewToast() message = %q, want %q", toast.Message, tt.message)
			}

			if toast.Type != tt.toastType {
				t.Errorf("NewToast() type = %v, want %v", toast.Type, tt.toastType)
			}

			if toast.Visible != tt.wantVisible {
				t.Errorf("NewToast() visible = %v, want %v", toast.Visible, tt.wantVisible)
			}

			// Check that expiration is set in the future
			if toast.ExpiresAt.Before(time.Now()) {
				t.Error("NewToast() ExpiresAt should be in the future")
			}

			// Check expiration is approximately ToastDuration from now
			expectedExpiry := time.Now().Add(ToastDuration)
			tolerance := 100 * time.Millisecond
			if toast.ExpiresAt.Before(expectedExpiry.Add(-tolerance)) ||
				toast.ExpiresAt.After(expectedExpiry.Add(tolerance)) {
				t.Errorf("NewToast() ExpiresAt not within expected range")
			}
		})
	}
}

func TestToast_View(t *testing.T) {
	tests := []struct {
		name        string
		toast       Toast
		wantEmpty   bool
		wantContain string
	}{
		{
			name: "visible toast renders message",
			toast: Toast{
				Message: "Test message",
				Type:    ToastSuccess,
				Visible: true,
			},
			wantEmpty:   false,
			wantContain: "Test message",
		},
		{
			name: "invisible toast renders empty",
			toast: Toast{
				Message: "Test message",
				Type:    ToastSuccess,
				Visible: false,
			},
			wantEmpty: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.toast.View()

			if tt.wantEmpty && result != "" {
				t.Errorf("Toast.View() = %q, want empty string", result)
			}

			if !tt.wantEmpty && result == "" {
				t.Error("Toast.View() returned empty string, want non-empty")
			}

			if tt.wantContain != "" && !containsString(result, tt.wantContain) {
				t.Errorf("Toast.View() = %q, should contain %q", result, tt.wantContain)
			}
		})
	}
}

func TestToast_Style(t *testing.T) {
	// Test that each toast type returns a non-nil style
	types := []ToastType{ToastSuccess, ToastError, ToastInfo}

	for _, toastType := range types {
		toast := Toast{Type: toastType}
		style := toast.Style()

		// Style should be valid (not panic) and render something
		rendered := style.Render("test")
		if rendered == "" {
			t.Errorf("Toast.Style() for type %v rendered empty string", toastType)
		}
	}
}

func TestToastDuration(t *testing.T) {
	// Verify the toast duration constant is reasonable
	if ToastDuration < 1*time.Second {
		t.Error("ToastDuration should be at least 1 second")
	}

	if ToastDuration > 10*time.Second {
		t.Error("ToastDuration should not exceed 10 seconds")
	}
}

func TestShowToast(t *testing.T) {
	cmd := ShowToast("test message", ToastSuccess)

	if cmd == nil {
		t.Fatal("ShowToast() returned nil command")
	}

	// Execute the command and check the message
	msg := cmd()
	toastMsg, ok := msg.(ToastMsg)
	if !ok {
		t.Fatalf("ShowToast() command returned %T, want ToastMsg", msg)
	}

	if toastMsg.Message != "test message" {
		t.Errorf("ToastMsg.Message = %q, want %q", toastMsg.Message, "test message")
	}

	if toastMsg.Type != ToastSuccess {
		t.Errorf("ToastMsg.Type = %v, want %v", toastMsg.Type, ToastSuccess)
	}
}

// containsString checks if a string contains a substring
// This is needed because the rendered output includes ANSI codes
func containsString(s, substr string) bool {
	return len(s) >= len(substr) && findSubstring(s, substr)
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
