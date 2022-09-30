/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package main

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	zone "github.com/lrstanley/bubblezone"

	"github.com/ys/rolls/config"
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
}

func (m Rolls) Init() tea.Cmd {
	// Just return `nil`, which means "no I/O right now, please."
	return nil
}

func (m Rolls) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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
		case "c":
			m.CurrentView = "Cameras"
			m.list.SetItems(m.Cameras.Items())
		case "f":
			m.CurrentView = "Films"
			m.list.SetItems(m.Films.Items())
		// These keys should exit the program.
		case "ctrl+c", "q":
			return m, tea.Quit

		// The "enter" key and the spacebar (a literal space) toggle
		// the selected state for the item that the cursor is pointing at.
		case "enter", " ":
			//item := m.list.SelectedItem()
			//fmt.Println(item)
		}
	}

	var cmd tea.Cmd
	m.tabs, _ = m.tabs.Update(msg)
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m Rolls) View() string {
	s := lipgloss.NewStyle().MaxHeight(m.height).MaxWidth(m.width).Padding(1, 2, 1, 2)
	return zone.Scan(s.Render(lipgloss.JoinVertical(lipgloss.Center, m.tabs.View(), m.list.View())))
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
	r.CurrentView = "rolls"
	r.list = list.New(r.Rolls.Items(), list.NewDefaultDelegate(), 0, 0)
	r.list.SetShowTitle(false)
	r.tabs = &tabs{
		id:     "tabs",
		height: 3,
		active: "Rolls",
		items:  []string{"Rolls", "Cameras", "Films"},
	}
	p := tea.NewProgram(r, tea.WithAltScreen(), tea.WithMouseCellMotion())
	if err := p.Start(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
func New(cfg *config.Config, rolls *roll.Rolls, cameras *roll.Cameras, films *roll.Films) *Rolls {

	r := Rolls{
		Cfg:         cfg,
		CurrentView: "Rolls",
		Cameras:     cameras,
		Films:       films,
		Rolls:       rolls,
	}
	return &r
}
