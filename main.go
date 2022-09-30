/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package main

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	zone "github.com/lrstanley/bubblezone"

	"github.com/ys/rolls/config"
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
	Cfg         *config.Config
	CurrentView string
	Cameras     *roll.Cameras
	Films       *roll.Films
	Rolls       *roll.Rolls
	list        list.Model
	tabs        tea.Model
	lightroom   *lightroom.API
	showSpinner bool
	spinner     spinner.Model
	err         error
}

type errMsg struct{ err error }
type albumsMsg struct{ albums *lightroom.Albums }
type tokenMsg struct{ token string }

// For messages that contain errors it's often handy to also implement the
// error interface on the message.
func (e errMsg) Error() string { return e.err.Error() }

type album struct {
	Name string
}

func (i album) Title() string       { return i.Name }
func (i album) Description() string { return " " }
func (i album) FilterValue() string { return i.Name }

func (m Rolls) Init() tea.Cmd {
	return func() tea.Msg {
		token, err := lightroom.Login(m.Cfg)
		if err != nil {
			return errMsg{err}
		}
		return tokenMsg{token}
	}
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

	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		case "r":
			m.CurrentView = "Rolls"
			m.list.SetItems(m.Rolls.Items())
			m.showSpinner = false
		case "c":
			m.CurrentView = "Cameras"
			m.list.SetItems(m.Cameras.Items())
			m.showSpinner = false
		case "f":
			m.CurrentView = "Films"
			m.list.SetItems(m.Films.Items())
			m.showSpinner = false
		case "a":
			m.CurrentView = "Albums"
			m.showSpinner = true
			cmd = func() tea.Msg {
				albums, err := m.lightroom.Albums(m.Cfg)
				if err != nil {
					return errMsg{err}
				}
				return albumsMsg{albums}
			}
			return m, cmd
		// These keys should exit the program.
		case "ctrl+c", "q":
			return m, tea.Quit

		// The "enter" key and the spacebar (a literal space) toggle
		// the selected state for the item that the cursor is pointing at.
		case "enter", " ":
			//item := m.list.SelectedItem()
			//fmt.Println(item)
		}
	case spinner.TickMsg:
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	case errMsg:
		// There was an error. Note it in the model. And tell the runtime
		// we're done and want to quit.
		m.err = msg
		return m, tea.Quit
	case albumsMsg:
		m.CurrentView = "Albums"
		items := []list.Item{}
		for _, a := range msg.albums.Resources {
			items = append(items, album{Name: *a.Payload.Name})
		}
		m.list.SetItems(items)
		m.showSpinner = false
	case tokenMsg:
		m.Cfg.AccessToken = msg.token

	}

	m.tabs, _ = m.tabs.Update(msg)
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m Rolls) View() string {
	s := lipgloss.NewStyle().MaxHeight(m.height).MaxWidth(m.width).Padding(1, 2, 1, 2)
	var window string
	if m.showSpinner {
		window = lipgloss.JoinHorizontal(lipgloss.Center, m.spinner.View(), "Loading")
	} else {
		window = m.list.View()
	}
	return zone.Scan(s.Render(lipgloss.JoinVertical(lipgloss.Center, m.tabs.View(), window)))
}

func main() {
	//	cmd.Execute()
	home, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}
	configPath := home + "/.config/rolls"
	cfg, err := config.New(configPath + "/config.yml")
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
	zone.NewGlobal()
	r := New(cfg, &rolls, &cameras, &films)
	p := tea.NewProgram(r, tea.WithAltScreen(), tea.WithMouseCellMotion())
	if err := p.Start(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
func New(cfg *config.Config, rolls *roll.Rolls, cameras *roll.Cameras, films *roll.Films) *Rolls {

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
	r := Rolls{
		Cfg:         cfg,
		CurrentView: "Rolls",
		Cameras:     cameras,
		Films:       films,
		Rolls:       rolls,
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
