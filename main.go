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
		m.tabs, cmd = m.tabs.Update(msg)
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
				parents = append(parents, album{ID: *a.Id, Name: *a.Payload.Name})
			}
		}
		m.Albums = &AlbumsTree{Parents: parents, Kids: kids}
		m.list.SetItems(m.Albums.Parents)
		m.showSpinner = false
	case tokenMsg:
		cmd = func() tea.Msg {
			m.Cfg.AccessToken = msg.token
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

func main() {
	zone.NewGlobal()
	r := NewRolls()
	p := tea.NewProgram(r, tea.WithAltScreen(), tea.WithMouseCellMotion())
	if err := p.Start(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
