package lightroom

import (
	"errors"
	"fmt"
	"strings"

	"github.com/ys/rolls/openapi"
)

type Albums struct {
	api       API
	resources []openapi.GetAlbums200ResponseResourcesInner
}

func (a *Albums) getChildrenAlbums(ID string) (*Albums, error) {
	children := []openapi.GetAlbums200ResponseResourcesInner{}
	for _, album := range a.resources {
		if *album.Payload.Parent.Id == ID {
			children = append(children, album)
		}
	}
	return &Albums{resources: children}, nil
}

func (a *Albums) EnsureAlbumUnder(ID, name string) (*openapi.GetAlbums200ResponseResourcesInner, error) {
	var parent *openapi.GetAlbums200ResponseResourcesInner
	for _, album := range a.resources {
		if *album.Id == ID {
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
	var currentAlbum *openapi.GetAlbums200ResponseResourcesInner
	for _, album := range children.resources {
		if *album.Payload.Name == name {
			currentAlbum = &album
			break
		}
	}
	if currentAlbum == nil {
		if err = a.api.CreateAlbum(name, ID); err != nil {
			return nil, err
		}
	}
	return currentAlbum, nil
}

func (a *Albums) Print() {
	kids := map[string][]openapi.GetAlbums200ResponseResourcesInner{}
	parents := []openapi.GetAlbums200ResponseResourcesInner{}
	for _, album := range a.resources {
		if album.Payload.Parent != nil && *album.Payload.Parent.Id != "" {
			kids[*album.Payload.Parent.Id] = append(kids[*album.Payload.Parent.Id], album)
		} else {
			parents = append(parents, album)
		}
	}
	for _, root := range parents {
		fmt.Println(root.Payload.Name)
		printKids(root, kids, 0)
	}
}

func printKids(parent openapi.GetAlbums200ResponseResourcesInner, kids map[string][]openapi.GetAlbums200ResponseResourcesInner, level int) {
	for _, album := range kids[*parent.Id] {
		fmt.Println(strings.Repeat(" ", level+2), "↳ ", *album.Payload.Name, "(", *album.Id, ")")
		printKids(album, kids, level+2)
	}
}
