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

	"github.com/ys/rolls/config"
	"github.com/ys/rolls/roll"
)

var docStyle = lipgloss.NewStyle().Margin(1, 2)

type Rolls struct {
	Cfg         *config.Config
	CurrentView string
	Cameras     *roll.Cameras
	Films       *roll.Films
	Rolls       *roll.Rolls
	list        list.Model
}

func (m Rolls) Init() tea.Cmd {
	// Just return `nil`, which means "no I/O right now, please."
	return nil
}

func (m Rolls) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		h, v := docStyle.GetFrameSize()
		m.list.SetSize(msg.Width-h, msg.Height-v)
	// Is it a key press?
	case tea.KeyMsg:

		// Cool, what was the actual key pressed?
		switch msg.String() {

		case "r":
			m.CurrentView = "rolls"
			m.list.SetItems(m.Rolls.Items())
			m.list.Title = "📷 - Rolls"
		case "c":
			m.CurrentView = "cameras"
			m.list.SetItems(m.Cameras.Items())
			m.list.Title = "📷 - Cameras"
		case "f":
			m.CurrentView = "films"
			m.list.SetItems(m.Films.Items())
			m.list.Title = "📷 - Films"
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
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m Rolls) View() string {
	return m.list.View()
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
	r := New(cfg, &rolls, &cameras, &films)
	r.CurrentView = "rolls"
	r.list = list.New(r.Rolls.Items(), list.NewDefaultDelegate(), 0, 0)
	r.list.Title = "📷 - Rolls"
	p := tea.NewProgram(r, tea.WithAltScreen())
	if err := p.Start(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
func New(cfg *config.Config, rolls *roll.Rolls, cameras *roll.Cameras, films *roll.Films) *Rolls {

	r := Rolls{
		Cfg:         cfg,
		CurrentView: "rolls",
		Cameras:     cameras,
		Films:       films,
		Rolls:       rolls,
	}
	return &r
}
