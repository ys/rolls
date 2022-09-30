package main

import (
	"os"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/ys/rolls/config"
	"github.com/ys/rolls/lightroom"
	"github.com/ys/rolls/roll"
)

type Rolls struct {
	height      int
	width       int
	Cfg         *config.Config
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
