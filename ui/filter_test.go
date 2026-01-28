package ui

import "testing"

func TestFilter_Matches(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		input    string
		expected bool
	}{
		{
			name:     "empty query matches everything",
			query:    "",
			input:    "anything",
			expected: true,
		},
		{
			name:     "exact match",
			query:    "roll-001",
			input:    "roll-001",
			expected: true,
		},
		{
			name:     "partial match",
			query:    "roll",
			input:    "roll-001 Leica Portra",
			expected: true,
		},
		{
			name:     "case insensitive match lowercase query",
			query:    "leica",
			input:    "roll-001 Leica M6 Portra",
			expected: true,
		},
		{
			name:     "case insensitive match uppercase query",
			query:    "PORTRA",
			input:    "roll-001 Leica portra 400",
			expected: true,
		},
		{
			name:     "case insensitive match mixed case",
			query:    "LeIcA",
			input:    "LEICA M6",
			expected: true,
		},
		{
			name:     "no match",
			query:    "nikon",
			input:    "roll-001 Leica Portra",
			expected: false,
		},
		{
			name:     "match in middle of string",
			query:    "M6",
			input:    "roll-001 Leica M6 Portra 400",
			expected: true,
		},
		{
			name:     "match at end of string",
			query:    "400",
			input:    "roll-001 Portra 400",
			expected: true,
		},
		{
			name:     "whitespace in query",
			query:    "Leica M6",
			input:    "roll-001 Leica M6 Portra",
			expected: true,
		},
		{
			name:     "special characters",
			query:    "-001",
			input:    "roll-001",
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := Filter{Query: tt.query}
			result := f.Matches(tt.input)
			if result != tt.expected {
				t.Errorf("Filter.Matches(%q) with query %q = %v, want %v",
					tt.input, tt.query, result, tt.expected)
			}
		})
	}
}

func TestNewFilter(t *testing.T) {
	f := NewFilter()

	if f.Active {
		t.Error("NewFilter() should not be active by default")
	}

	if f.Query != "" {
		t.Errorf("NewFilter() query should be empty, got %q", f.Query)
	}
}

func TestFilter_Clear(t *testing.T) {
	f := NewFilter()
	f.Query = "test query"
	f.Active = true

	f.Clear()

	if f.Query != "" {
		t.Errorf("Filter.Clear() should reset query to empty, got %q", f.Query)
	}

	if f.Active {
		t.Error("Filter.Clear() should set Active to false")
	}
}

func TestFilter_Blur(t *testing.T) {
	f := NewFilter()
	f.Active = true

	f.Blur()

	if f.Active {
		t.Error("Filter.Blur() should set Active to false")
	}
}
