package lightroom

import (
	"errors"
	"fmt"
	"strings"
)

type Albums struct {
	api       API
	resources []Resource
}

func (a *Albums) getChildrenAlbums(ID string) (*Albums, error) {
	children := []Resource{}
	for _, album := range a.resources {
		if album.Payload.Parent.ID == ID {
			children = append(children, album)
		}
	}
	return &Albums{resources: children}, nil
}

func (a *Albums) EnsureAlbumUnder(ID, name string) (*Resource, error) {
	var parent *Resource
	for _, album := range a.resources {
		if album.ID == ID {
			parent = &album
			break
		}
	}
	if parent == nil {
		return nil, errors.New(fmt.Sprintf("Parent not found with ID: %s", ID))
	}
	children, err := a.getChildrenAlbums(ID)
	if err != nil {
		return nil, err
	}
	var currentAlbum *Resource
	for _, album := range children.resources {
		if album.Payload.Name == name {
			currentAlbum = &album
			break
		}
	}
	if currentAlbum == nil {
		if currentAlbum, err = a.api.CreateAlbum(name, ID); err != nil {
			return nil, err
		}
	}
	return currentAlbum, nil
}

func (a *Albums) Print() {
	kids := map[string][]Resource{}
	parents := []Resource{}
	for _, album := range a.resources {
		if album.Payload.Parent.ID != "" {
			kids[album.Payload.Parent.ID] = append(kids[album.Payload.Parent.ID], album)
		} else {
			parents = append(parents, album)
		}
	}
	for _, root := range parents {
		fmt.Println(root.Payload.Name)
		printKids(root, kids, 0)
	}
}

func printKids(parent Resource, kids map[string][]Resource, level int) {
	for _, album := range kids[parent.ID] {
		fmt.Println(strings.Repeat(" ", level+2), "↳ ", album.Payload.Name, "(", album.ID, ")")
		printKids(album, kids, level+2)
	}
}
