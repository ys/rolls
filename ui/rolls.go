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
			Width(40).
			Height(20)

	divider = lipgloss.NewStyle().
		SetString("•").
		Padding(0, 1).
		Foreground(subtle).
		String()
)

type Rolls struct {
	height      int
	width       int
	Cfg         *roll.Config
	CurrentView string
	Cameras     *roll.Cameras
	Films       *roll.Films
	Rolls       *roll.Rolls
	Albums      *AlbumsTree
	list        list.Model
	tabs        tea.Model
	lightroom   *lightroom.API
	showSpinner bool
	spinner     spinner.Model
	err         error
	Kids        map[string][]list.Item
}

type AlbumsTree struct {
	Parents []list.Item
	Kids    map[string][]list.Item
}

type RollItem struct {
	roll.Roll
}

func (i RollItem) Title() string       { return i.Metadata.RollNumber }
func (i RollItem) Description() string {
	var desc strings.Builder
	desc.WriteString(fmt.Sprintf("📷 %s\n", i.Metadata.CameraID))
	desc.WriteString(fmt.Sprintf("🎞️  %s\n", i.Metadata.FilmID))

	if !i.Metadata.ShotAt.IsZero() {
		desc.WriteString(fmt.Sprintf("📅 Shot: %s\n", i.Metadata.ShotAt.Format("2006-01-02")))
	}
	if !i.Metadata.ScannedAt.IsZero() {
		desc.WriteString(fmt.Sprintf("🖨️  Scanned: %s\n", i.Metadata.ScannedAt.Format("2006-01-02")))
	}
	if !i.Metadata.ProcessedAt.IsZero() {
		desc.WriteString(fmt.Sprintf("⚡ Processed: %s\n", i.Metadata.ProcessedAt.Format("2006-01-02 15:04:05")))
	}
	if len(i.Metadata.Tags) > 0 {
		desc.WriteString(fmt.Sprintf("🏷️  Tags: %s\n", strings.Join(i.Metadata.Tags, ", ")))
	}
	desc.WriteString(fmt.Sprintf("📁 %s", i.Folder))
	return desc.String()
}
func (i RollItem) FilterValue() string { return i.Metadata.RollNumber }

func (r *Rolls) Items() []list.Item {
	items := []list.Item{}
	if r.Rolls != nil {
		for _, roll := range *r.Rolls {
			items = append(items, RollItem{roll})
		}
	}
	return items
}

func NewRolls() *Rolls {
	//	cmd.Execute()
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
		lightroom:   lightroom.New(cfg.ClientID, cfg.AccessToken),
		showSpinner: false,
		spinner:     s,
	}
	r.CurrentView = "rolls"
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
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.height = msg.Height
		m.width = msg.Width
		msg.Height -= 2
		msg.Width -= 4
		m.list.SetSize(msg.Width-4, msg.Height-8)

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
		// These keys should exit the program.
		case "ctrl+c", "q":
			return m, tea.Quit

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
		switch msg.tab {
		case "Films":
			m.showSpinner = false
			m.list.SetItems(m.Films.Items())
		case "Cameras":
			m.showSpinner = false
			m.list.SetItems(m.Cameras.Items())
		case "Rolls":
			m.showSpinner = false
			m.list.SetItems(m.Rolls.Items())
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
		title = "📸 Film Rolls"
	case "Cameras":
		title = "📷 Cameras"
	case "Films":
		title = "🎞️ Films"
	case "Albums":
		title = "📚 Albums"
	default:
		title = "📸 Film Rolls"
	}
	s.WriteString(titleStyle.Render(title))
	s.WriteString("\n\n")

	// Always create side window content
	var sideContent strings.Builder
	selectedItem, ok := m.list.SelectedItem().(RollItem)
	if ok {
		sideContent.WriteString(lipgloss.NewStyle().Foreground(special).Render("📝 Content\n"))
		sideContent.WriteString(selectedItem.Content)
		sideContent.WriteString("\n\n")
		if len(selectedItem.Metadata.Tags) > 0 {
			sideContent.WriteString(lipgloss.NewStyle().Foreground(accent).Render("🏷️  Tags\n"))
			for _, tag := range selectedItem.Metadata.Tags {
				sideContent.WriteString(lipgloss.NewStyle().
					Foreground(subtle).
					PaddingLeft(2).
					Render("• " + tag))
				sideContent.WriteString("\n")
			}
		}
	} else {
		sideContent.WriteString(lipgloss.NewStyle().Foreground(accent).Render("[No roll selected or cast failed]"))
	}

	sideWindow := sideWindowStyle.Render(sideContent.String())
	m.list.SetWidth(m.width - 50)
	mainContent := m.list.View()

	s.WriteString(lipgloss.JoinHorizontal(
		lipgloss.Top,
		mainContent,
		sideWindow,
	))

	// Wrap everything in a zone scan
	return zone.Scan(lipgloss.NewStyle().
		MaxHeight(m.height).
		MaxWidth(m.width).
		Padding(1, 2).
		Render(s.String()))
}
