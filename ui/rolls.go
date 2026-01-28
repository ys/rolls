package ui

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	zone "github.com/lrstanley/bubblezone"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/roll"
)

var (
	subtle    = lipgloss.AdaptiveColor{Light: "#0B7285", Dark: "#0B7285"} // cyan
	highlight = lipgloss.AdaptiveColor{Light: "#8B7EC8", Dark: "#8B7EC8"} // purple
	special   = lipgloss.AdaptiveColor{Light: "#AD3FA4", Dark: "#AD3FA4"} // magenta
	accent    = lipgloss.AdaptiveColor{Light: "#B47109", Dark: "#B47109"} // yellow

	// Status badge colors
	success = lipgloss.AdaptiveColor{Light: "#66A80F", Dark: "#66A80F"} // green
	warning = lipgloss.AdaptiveColor{Light: "#E8590C", Dark: "#E8590C"} // orange
	muted   = lipgloss.AdaptiveColor{Light: "#6E6E6E", Dark: "#878787"} // gray

	titleStyle = lipgloss.NewStyle().
			Foreground(highlight).
			Bold(true).
			Padding(0, 1).
			MarginBottom(1)

	sideWindowStyle = lipgloss.NewStyle().
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(subtle).
			Padding(1, 2).
			MarginLeft(2).
			Width(50).
			Height(20)

	divider = lipgloss.NewStyle().
		SetString("•").
		Padding(0, 1).
		Foreground(subtle).
		String()

	helpBarStyle = lipgloss.NewStyle().
			Foreground(muted).
			Padding(0, 1).
			MarginTop(1)

	badgeStyle = lipgloss.NewStyle().
			Padding(0, 1).
			Bold(true)

	sectionHeaderStyle = lipgloss.NewStyle().
				Foreground(special).
				Bold(true).
				MarginBottom(1)

	sectionLabelStyle = lipgloss.NewStyle().
				Foreground(muted).
				Width(12)

	sectionValueStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FFFFFF"))
)

// Badge helper functions
func archivedBadge() string {
	return badgeStyle.Foreground(success).Render("ARCHIVED")
}

func processedBadge() string {
	return badgeStyle.Foreground(highlight).Render("PROCESSED")
}

func uploadedBadge() string {
	return badgeStyle.Foreground(accent).Render("UPLOADED")
}

func pendingBadge() string {
	return badgeStyle.Foreground(muted).Render("PENDING")
}

func contactSheetIcon() string {
	return lipgloss.NewStyle().Foreground(accent).Render(" [CS]")
}

type Rolls struct {
	height      int
	width       int
	Cfg         *roll.Config
	CurrentView string
	Cameras     *roll.Cameras
	Films       *roll.Films
	Rolls       *roll.Rolls
	allRolls    *roll.Rolls // Keep original list for filtering
	Albums      *AlbumsTree
	list        list.Model
	tabs        tea.Model
	lightroom   *lightroom.API
	showSpinner bool
	spinner     spinner.Model
	err         error
	Kids        map[string][]list.Item
	filter      Filter
	filterMode  bool
	toast       Toast
	showHelp    bool
	statusMsg   string
}

type AlbumsTree struct {
	Parents []list.Item
	Kids    map[string][]list.Item
}

type RollItem struct {
	roll.Roll
	hasContactSheet bool
}

func (i RollItem) Title() string {
	title := i.Metadata.RollNumber
	if i.hasContactSheet {
		title += contactSheetIcon()
	}
	return title
}

func (i RollItem) Description() string {
	var parts []string

	// Camera and Film on first line
	parts = append(parts, fmt.Sprintf("%s | %s", i.Metadata.CameraID, i.Metadata.FilmID))

	// Status badges
	var badges []string
	if !i.Metadata.ArchivedAt.IsZero() {
		badges = append(badges, archivedBadge())
	} else if !i.Metadata.UploadedAt.IsZero() {
		badges = append(badges, uploadedBadge())
	} else if !i.Metadata.ProcessedAt.IsZero() {
		badges = append(badges, processedBadge())
	} else {
		badges = append(badges, pendingBadge())
	}

	if len(badges) > 0 {
		parts = append(parts, strings.Join(badges, " "))
	}

	return strings.Join(parts, "\n")
}

func (i RollItem) FilterValue() string {
	// Include camera, film, and roll number in filter
	return fmt.Sprintf("%s %s %s", i.Metadata.RollNumber, i.Metadata.CameraID, i.Metadata.FilmID)
}

func (r *Rolls) Items() []list.Item {
	items := []list.Item{}
	if r.Rolls != nil {
		for _, rl := range *r.Rolls {
			item := RollItem{
				Roll:            rl,
				hasContactSheet: HasContactSheet(&rl, r.Cfg),
			}
			items = append(items, item)
		}
	}
	return items
}

func (r *Rolls) FilteredItems() []list.Item {
	items := []list.Item{}
	if r.Rolls != nil {
		for _, rl := range *r.Rolls {
			item := RollItem{
				Roll:            rl,
				hasContactSheet: HasContactSheet(&rl, r.Cfg),
			}
			filterVal := item.FilterValue()
			if r.filter.Matches(filterVal) {
				items = append(items, item)
			}
		}
	}
	return items
}

func NewRolls() *Rolls {
	home, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	configPath := home + "/.config/rolls"
	cfg, err := roll.New(configPath + "/config.yml")
	if err != nil {
		panic(err)
	}
	cameras, err := roll.GetCameras(configPath)
	if err != nil {
		panic(err)
	}
	films, err := roll.GetFilms(configPath)
	if err != nil {
		panic(err)
	}
	rolls, err := roll.GetRolls(cfg.ScansPath)
	if err != nil {
		panic(err)
	}

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	// Create a custom delegate with Flexoki colors
	delegate := list.NewDefaultDelegate()
	delegate.Styles.NormalTitle = lipgloss.NewStyle().
		Foreground(highlight).
		Bold(true)
	delegate.Styles.NormalDesc = lipgloss.NewStyle().
		Foreground(subtle)
	delegate.Styles.SelectedTitle = lipgloss.NewStyle().
		Foreground(special).
		Bold(true)
	delegate.Styles.SelectedDesc = lipgloss.NewStyle().
		Foreground(accent)

	r := Rolls{
		Cfg:         cfg,
		CurrentView: "Rolls",
		Cameras:     &cameras,
		Films:       &films,
		Rolls:       &rolls,
		allRolls:    &rolls,
		lightroom:   lightroom.New(cfg.ClientID, cfg.AccessToken),
		showSpinner: false,
		spinner:     s,
		filter:      NewFilter(),
		filterMode:  false,
		showHelp:    false,
	}
	r.CurrentView = "Rolls"
	r.list = list.New(r.Items(), delegate, 0, 0)
	r.list.SetShowTitle(false)
	r.tabs = &tabs{
		id:     "tabs",
		height: 3,
		active: "Rolls",
		items:  []string{"Rolls", "Cameras", "Films", "Albums"},
	}
	return &r
}

func (m Rolls) Init() tea.Cmd {
	return nil
}

func (m Rolls) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	// Handle filter input when in filter mode
	if m.filterMode {
		switch msg := msg.(type) {
		case tea.KeyMsg:
			switch msg.String() {
			case "esc":
				m.filter.Clear()
				m.filterMode = false
				// Reset to full list
				if m.CurrentView == "Rolls" {
					m.list.SetItems(m.Items())
				}
				return m, nil
			case "enter":
				m.filterMode = false
				m.filter.Blur()
				return m, nil
			}
		}
		m.filter, cmd = m.filter.Update(msg)
		// Update list with filtered items
		if m.CurrentView == "Rolls" {
			m.list.SetItems(m.FilteredItems())
		}
		return m, cmd
	}

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.height = msg.Height
		m.width = msg.Width
		msg.Height -= 2
		msg.Width -= 4
		m.list.SetSize(msg.Width-4, msg.Height-10) // Extra space for help bar

	case tea.MouseMsg:
		cmds := make([]tea.Cmd, 0)
		m.tabs, cmd = m.tabs.Update(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}
		m.list, cmd = m.list.Update(msg)
		if cmd != nil {
			cmds = append(cmds, cmd)
		}
		cmd = tea.Batch(cmds...)

	case tea.KeyMsg:
		switch msg.String() {
		case "r":
			return m, activeTabFn("Rolls")
		case "c":
			return m, activeTabFn("Cameras")
		case "f":
			return m, activeTabFn("Films")
		case "a":
			return m, activeTabFn("Albums")
		case "ctrl+l":
			return m, loginFn(m.Cfg)
		case "ctrl+c", "q":
			return m, tea.Quit
		case "?":
			m.showHelp = !m.showHelp
			return m, nil
		case "/":
			m.filterMode = true
			return m, m.filter.Focus()
		case "esc":
			if m.filter.Query != "" {
				m.filter.Clear()
				if m.CurrentView == "Rolls" {
					m.list.SetItems(m.Items())
				}
			}
			return m, nil

		// Action keys (only for Rolls view)
		case "A":
			if m.CurrentView == "Rolls" {
				if selectedItem, ok := m.list.SelectedItem().(RollItem); ok {
					r := selectedItem.Roll
					return m, ArchiveRollCmd(&r)
				}
			}
		case "O":
			if m.CurrentView == "Rolls" {
				if selectedItem, ok := m.list.SelectedItem().(RollItem); ok {
					r := selectedItem.Roll
					return m, OpenFolderCmd(&r)
				}
			}
		case "V":
			if m.CurrentView == "Rolls" {
				if selectedItem, ok := m.list.SelectedItem().(RollItem); ok {
					r := selectedItem.Roll
					return m, ViewContactSheetCmd(&r, m.Cfg)
				}
			}

		case "enter", " ":
			switch m.CurrentView {
			case "Albums":
				kids := m.Albums.Kids[m.list.SelectedItem().FilterValue()]
				if kids != nil {
					m.list.SetItems(kids)
				}
			}
		}

	case spinner.TickMsg:
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd

	case errMsg:
		m.err = msg
		return m, tea.Quit

	case activeTabMsg:
		m.CurrentView = msg.tab
		m.filter.Clear()
		m.filterMode = false
		switch msg.tab {
		case "Films":
			m.showSpinner = false
			m.list.SetItems(m.Films.Items())
		case "Cameras":
			m.showSpinner = false
			m.list.SetItems(m.Cameras.Items())
		case "Rolls":
			m.showSpinner = false
			m.list.SetItems(m.Items())
		case "Albums":
			m.showSpinner = true
			cmd = tea.Batch(AlbumsFn(m.Cfg, m.lightroom), m.spinner.Tick)
		}

	case albumsMsg:
		m.CurrentView = "Albums"
		parents := []list.Item{}
		kids := map[string][]list.Item{}
		for _, a := range msg.albums.Resources {
			if a.Payload.Parent != nil && *a.Payload.Parent.Id != "" {
				kids[*a.Payload.Parent.Id] = append(kids[*a.Payload.Parent.Id], album{ID: *a.Id, Name: *a.Payload.Name})
			} else {
				parents = append(parents, album{ID: *a.Id, Name: *a.Payload.Name, Subtype: a.GetSubtype()})
			}
		}
		m.Albums = &AlbumsTree{Parents: parents, Kids: kids}
		m.list.SetItems(m.Albums.Parents)
		m.showSpinner = false

	case tokenMsg:
		cmd = func() tea.Msg {
			m.Cfg.AccessToken = msg.token.AccessToken
			err := m.Cfg.Write()
			if err != nil {
				m.err = err
				return tea.Quit
			}
			return nil
		}

	case ActionResultMsg:
		if msg.Success {
			m.toast = NewToast(msg.Message, ToastSuccess)
			// Refresh rolls if archived
			if msg.Action == "Archive" {
				rolls, _ := roll.GetRolls(m.Cfg.ScansPath)
				m.Rolls = &rolls
				m.allRolls = &rolls
				m.list.SetItems(m.Items())
			}
		} else {
			m.toast = NewToast(msg.Message, ToastError)
		}
		return m, ScheduleToastDismiss()

	case ToastMsg:
		m.toast = NewToast(msg.Message, msg.Type)
		return m, ScheduleToastDismiss()

	case ToastExpiredMsg:
		m.toast.Visible = false
		return m, nil

	case rollsUpdatedMsg:
		m.Rolls = msg.rolls
		m.allRolls = msg.rolls
		m.list.SetItems(m.Items())
	}

	var listUpdateCmd tea.Cmd
	m.tabs, _ = m.tabs.Update(msg)
	m.list, listUpdateCmd = m.list.Update(msg)
	return m, tea.Batch(listUpdateCmd, cmd)
}

func (m Rolls) View() string {
	if m.showSpinner {
		return m.spinner.View()
	}

	if m.err != nil {
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FF0000")).
			Render(m.err.Error())
	}

	var s strings.Builder

	// Add tabs at the top
	s.WriteString(m.tabs.View())
	s.WriteString("\n\n")

	// Add dynamic title based on current view
	var title string
	switch m.CurrentView {
	case "Rolls":
		title = "Film Rolls"
	case "Cameras":
		title = "Cameras"
	case "Films":
		title = "Films"
	case "Albums":
		title = "Albums"
	default:
		title = "Film Rolls"
	}
	s.WriteString(titleStyle.Render(title))

	// Show filter if active
	if m.filterMode || m.filter.Query != "" {
		s.WriteString("  ")
		s.WriteString(m.filter.View())
	}
	s.WriteString("\n\n")

	// Create side window content based on view
	sideContent := m.renderSidePanel()
	sideWindow := sideWindowStyle.Render(sideContent)

	m.list.SetWidth(m.width - 60)
	mainContent := m.list.View()

	s.WriteString(lipgloss.JoinHorizontal(
		lipgloss.Top,
		mainContent,
		sideWindow,
	))

	// Add toast notification if visible
	if m.toast.Visible {
		s.WriteString("\n")
		s.WriteString(m.toast.View())
	}

	// Add help bar at the bottom
	s.WriteString("\n")
	s.WriteString(m.renderHelpBar())

	// Wrap everything in a zone scan
	return zone.Scan(lipgloss.NewStyle().
		MaxHeight(m.height).
		MaxWidth(m.width).
		Padding(1, 2).
		Render(s.String()))
}

func (m Rolls) renderSidePanel() string {
	var content strings.Builder

	switch m.CurrentView {
	case "Rolls":
		content.WriteString(m.renderRollSidePanel())
	case "Cameras":
		content.WriteString(m.renderCameraSidePanel())
	case "Films":
		content.WriteString(m.renderFilmSidePanel())
	default:
		content.WriteString(lipgloss.NewStyle().Foreground(muted).Render("Select an item to view details"))
	}

	return content.String()
}

func (m Rolls) renderRollSidePanel() string {
	var content strings.Builder

	selectedItem, ok := m.list.SelectedItem().(RollItem)
	if !ok {
		content.WriteString(lipgloss.NewStyle().Foreground(muted).Render("No roll selected"))
		return content.String()
	}

	// Status Section
	content.WriteString(sectionHeaderStyle.Render("Status"))
	content.WriteString("\n")

	// Status badge
	if !selectedItem.Metadata.ArchivedAt.IsZero() {
		content.WriteString(archivedBadge())
	} else if !selectedItem.Metadata.UploadedAt.IsZero() {
		content.WriteString(uploadedBadge())
	} else if !selectedItem.Metadata.ProcessedAt.IsZero() {
		content.WriteString(processedBadge())
	} else {
		content.WriteString(pendingBadge())
	}

	// Contact sheet indicator
	if selectedItem.hasContactSheet {
		content.WriteString(" ")
		content.WriteString(lipgloss.NewStyle().Foreground(accent).Render("[Contact Sheet]"))
	}
	content.WriteString("\n\n")

	// Equipment Section
	content.WriteString(sectionHeaderStyle.Render("Equipment"))
	content.WriteString("\n")

	// Camera details
	content.WriteString(sectionLabelStyle.Render("Camera:"))
	if camera, ok := (*m.Cameras)[selectedItem.Metadata.CameraID]; ok {
		content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%s %s", camera.Brand, camera.Model)))
	} else {
		content.WriteString(sectionValueStyle.Render(selectedItem.Metadata.CameraID))
	}
	content.WriteString("\n")

	// Film details
	content.WriteString(sectionLabelStyle.Render("Film:"))
	if film, ok := (*m.Films)[selectedItem.Metadata.FilmID]; ok {
		colorType := "B&W"
		if film.Color {
			colorType = "Color"
		}
		content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%s %s ISO %d (%s)", film.Brand, film.Name, film.Iso, colorType)))
	} else {
		content.WriteString(sectionValueStyle.Render(selectedItem.Metadata.FilmID))
	}
	content.WriteString("\n\n")

	// Dates Section
	content.WriteString(sectionHeaderStyle.Render("Dates"))
	content.WriteString("\n")

	if !selectedItem.Metadata.ShotAt.IsZero() {
		content.WriteString(sectionLabelStyle.Render("Shot:"))
		content.WriteString(sectionValueStyle.Render(roll.FormatDate(selectedItem.Metadata.ShotAt)))
		content.WriteString("\n")
	}
	if !selectedItem.Metadata.ScannedAt.IsZero() {
		content.WriteString(sectionLabelStyle.Render("Scanned:"))
		content.WriteString(sectionValueStyle.Render(roll.FormatDate(selectedItem.Metadata.ScannedAt)))
		content.WriteString("\n")
	}
	if !selectedItem.Metadata.ProcessedAt.IsZero() {
		content.WriteString(sectionLabelStyle.Render("Processed:"))
		content.WriteString(sectionValueStyle.Render(roll.FormatDate(selectedItem.Metadata.ProcessedAt)))
		content.WriteString("\n")
	}
	if !selectedItem.Metadata.ArchivedAt.IsZero() {
		content.WriteString(sectionLabelStyle.Render("Archived:"))
		content.WriteString(sectionValueStyle.Render(roll.FormatDate(selectedItem.Metadata.ArchivedAt)))
		content.WriteString("\n")
	}

	// Notes Section (Content)
	if selectedItem.Content != "" {
		content.WriteString("\n")
		content.WriteString(sectionHeaderStyle.Render("Notes"))
		content.WriteString("\n")
		// Truncate long notes
		notes := selectedItem.Content
		if len(notes) > 200 {
			notes = notes[:200] + "..."
		}
		content.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("#FFFFFF")).Render(notes))
		content.WriteString("\n")
	}

	// Tags Section
	if len(selectedItem.Metadata.Tags) > 0 {
		content.WriteString("\n")
		content.WriteString(sectionHeaderStyle.Render("Tags"))
		content.WriteString("\n")
		for _, tag := range selectedItem.Metadata.Tags {
			content.WriteString(lipgloss.NewStyle().
				Foreground(subtle).
				Render("  " + tag))
			content.WriteString("\n")
		}
	}

	return content.String()
}

func (m Rolls) renderCameraSidePanel() string {
	var content strings.Builder

	selectedItem, ok := m.list.SelectedItem().(roll.Camera)
	if !ok {
		content.WriteString(lipgloss.NewStyle().Foreground(muted).Render("No camera selected"))
		return content.String()
	}

	// Camera Details
	content.WriteString(sectionHeaderStyle.Render("Details"))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("Brand:"))
	content.WriteString(sectionValueStyle.Render(selectedItem.Brand))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("Model:"))
	content.WriteString(sectionValueStyle.Render(selectedItem.Model))
	content.WriteString("\n")

	if selectedItem.Nickname != "" {
		content.WriteString(sectionLabelStyle.Render("Nickname:"))
		content.WriteString(sectionValueStyle.Render(selectedItem.Nickname))
		content.WriteString("\n")
	}

	content.WriteString(sectionLabelStyle.Render("Format:"))
	content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%dmm", selectedItem.Format)))
	content.WriteString("\n\n")

	// Count rolls shot with this camera
	if m.Rolls != nil {
		count := 0
		filmsUsed := make(map[string]bool)
		for _, rl := range *m.Rolls {
			if rl.Metadata.CameraID == selectedItem.ID || rl.Metadata.CameraID == selectedItem.Name() {
				count++
				filmsUsed[rl.Metadata.FilmID] = true
			}
		}

		content.WriteString(sectionHeaderStyle.Render("Statistics"))
		content.WriteString("\n")
		content.WriteString(sectionLabelStyle.Render("Rolls:"))
		content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%d", count)))
		content.WriteString("\n")

		if len(filmsUsed) > 0 {
			content.WriteString("\n")
			content.WriteString(sectionHeaderStyle.Render("Films Used"))
			content.WriteString("\n")
			for filmID := range filmsUsed {
				content.WriteString(lipgloss.NewStyle().Foreground(subtle).Render("  " + filmID))
				content.WriteString("\n")
			}
		}
	}

	return content.String()
}

func (m Rolls) renderFilmSidePanel() string {
	var content strings.Builder

	selectedItem, ok := m.list.SelectedItem().(roll.Film)
	if !ok {
		content.WriteString(lipgloss.NewStyle().Foreground(muted).Render("No film selected"))
		return content.String()
	}

	// Film Details
	content.WriteString(sectionHeaderStyle.Render("Details"))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("Brand:"))
	content.WriteString(sectionValueStyle.Render(selectedItem.Brand))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("Name:"))
	content.WriteString(sectionValueStyle.Render(selectedItem.Name))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("ISO:"))
	content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%d", selectedItem.Iso)))
	content.WriteString("\n")

	content.WriteString(sectionLabelStyle.Render("Type:"))
	if selectedItem.Color {
		content.WriteString(sectionValueStyle.Render("Color"))
	} else {
		content.WriteString(sectionValueStyle.Render("Black & White"))
	}
	content.WriteString("\n\n")

	// Count rolls shot with this film
	if m.Rolls != nil {
		count := 0
		camerasUsed := make(map[string]bool)
		for _, rl := range *m.Rolls {
			if rl.Metadata.FilmID == selectedItem.ID || rl.Metadata.FilmID == selectedItem.NameWithBrand() {
				count++
				camerasUsed[rl.Metadata.CameraID] = true
			}
		}

		content.WriteString(sectionHeaderStyle.Render("Statistics"))
		content.WriteString("\n")
		content.WriteString(sectionLabelStyle.Render("Rolls:"))
		content.WriteString(sectionValueStyle.Render(fmt.Sprintf("%d", count)))
		content.WriteString("\n")

		if len(camerasUsed) > 0 {
			content.WriteString("\n")
			content.WriteString(sectionHeaderStyle.Render("Cameras Used"))
			content.WriteString("\n")
			for cameraID := range camerasUsed {
				content.WriteString(lipgloss.NewStyle().Foreground(subtle).Render("  " + cameraID))
				content.WriteString("\n")
			}
		}
	}

	return content.String()
}

func (m Rolls) renderHelpBar() string {
	if m.showHelp {
		return m.renderFullHelp()
	}

	// Compact help bar
	var help strings.Builder

	baseHelp := "r:Rolls | c:Cameras | f:Films | a:Albums | /:Filter"

	if m.CurrentView == "Rolls" {
		help.WriteString(baseHelp)
		help.WriteString(" | A:Archive | V:View | O:Open")
	} else {
		help.WriteString(baseHelp)
	}

	help.WriteString(" | ?:Help | q:Quit")

	return helpBarStyle.Render(help.String())
}

func (m Rolls) renderFullHelp() string {
	var help strings.Builder

	help.WriteString(sectionHeaderStyle.Render("Navigation"))
	help.WriteString("\n")
	help.WriteString("  r      Switch to Rolls\n")
	help.WriteString("  c      Switch to Cameras\n")
	help.WriteString("  f      Switch to Films\n")
	help.WriteString("  a      Switch to Albums\n")
	help.WriteString("  /      Open filter\n")
	help.WriteString("  Esc    Clear filter\n")
	help.WriteString("\n")

	help.WriteString(sectionHeaderStyle.Render("Actions (Rolls view)"))
	help.WriteString("\n")
	help.WriteString("  A      Archive selected roll\n")
	help.WriteString("  V      View contact sheet\n")
	help.WriteString("  O      Open folder in Finder\n")
	help.WriteString("\n")

	help.WriteString(sectionHeaderStyle.Render("General"))
	help.WriteString("\n")
	help.WriteString("  ?      Toggle help\n")
	help.WriteString("  q      Quit\n")

	return lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(subtle).
		Padding(1, 2).
		Render(help.String())
}
