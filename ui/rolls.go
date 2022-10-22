package ui

import (
	"os"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	zone "github.com/lrstanley/bubblezone"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/roll"
)

var (
	subtle    = lipgloss.AdaptiveColor{Light: "#D9DCCF", Dark: "#383838"}
	highlight = lipgloss.AdaptiveColor{Light: "#874BFD", Dark: "#7D56F4"}
	special   = lipgloss.AdaptiveColor{Light: "#43BF6D", Dark: "#73F59F"}

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
}

type AlbumsTree struct {
	Parents []list.Item
	Kids    map[string][]list.Item
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
	r.list = list.New(r.Rolls.Items(), list.NewDefaultDelegate(), 0, 0)
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
	s := lipgloss.NewStyle().MaxHeight(m.height).MaxWidth(m.width).Padding(1, 2, 1, 2)
	var window string
	if m.showSpinner {
		window = lipgloss.NewStyle().Padding(2, 2, 2, 2).Render(lipgloss.JoinHorizontal(lipgloss.Center, m.spinner.View(), "Loading"))
	} else {
		window = m.list.View()
	}
	return zone.Scan(s.Render(lipgloss.JoinVertical(lipgloss.Left, m.tabs.View(), window)))
}
