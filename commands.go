package main

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/ys/rolls/config"
	"github.com/ys/rolls/lightroom"
)

func activeTabFn(tab string) func() tea.Msg {
	return func() tea.Msg {
		return activeTabMsg{tab: tab}
	}
}
func loginFn(cfg *config.Config) func() tea.Msg {
	return func() tea.Msg {
		token, err := lightroom.Login(cfg)
		if err != nil {
			return errMsg{err}
		}
		return tokenMsg{token}
	}
}

func AlbumsFn(cfg *config.Config, client *lightroom.API) func() tea.Msg {

	return func() tea.Msg {
		albums, err := client.Albums(cfg)
		if err != nil {
			return errMsg{err}
		}
		return albumsMsg{albums}
	}
}
