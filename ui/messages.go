package ui

import (
	"github.com/ys/rolls/lightroom"
	"golang.org/x/oauth2"
)

type errMsg struct{ err error }
type albumsMsg struct{ albums *lightroom.Albums }
type tokenMsg struct{ token *oauth2.Token }

// For messages that contain errors it's often handy to also implement the
// error interface on the message.
func (e errMsg) Error() string { return e.err.Error() }

type album struct {
	ID      string
	Name    string
	Subtype string
}

func (i album) Title() string       { return i.Name }
func (i album) Description() string { return i.Subtype }
func (i album) FilterValue() string { return i.ID }
