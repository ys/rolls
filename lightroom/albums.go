package lightroom

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
)

type Albums struct {
	cfg       *roll.Config
	api       API
	Resources []openapi.GetAlbums200ResponseResourcesInner
}

func (a *Albums) GetChildrenAlbums(ID string) (*Albums, error) {
	children := []openapi.GetAlbums200ResponseResourcesInner{}
	for _, album := range a.Resources {
		if album.Payload.Parent != nil && *album.Payload.Parent.Id == ID {
			children = append(children, album)
		}
	}
	return &Albums{Resources: children}, nil
}

func (a *Albums) EnsureAlbumUnder(ID *string, name, subtype string) (*openapi.GetAlbums200ResponseResourcesInner, error) {
	catalog, err := a.api.Catalog()
	if err != nil {
		return nil, err
	}
	var parent *openapi.GetAlbums200ResponseResourcesInner
	for _, album := range a.Resources {
		if *album.Id == *ID {
			parent = &album
			break
		}
	}
	if parent == nil {
		return nil, errors.New(fmt.Sprintf("Parent not found with ID: %s", *ID))
	}
	children, err := a.GetChildrenAlbums(*ID)
	if err != nil {
		return nil, err
	}
	var currentAlbum *openapi.GetAlbums200ResponseResourcesInner
	for _, album := range children.Resources {
		if *album.Payload.Name == name {
			currentAlbum = &album
			break
		}
	}
	if currentAlbum == nil {
		album := openapi.NewCreateAlbumRequest()
		album.SetServiceId(a.api.clientID)
		album.SetPayload(*openapi.NewAlbumPayload())
		album.Payload.SetName(name)
		album.Payload.SetUserCreated(time.Now().Format(time.RFC3339))
		album.Payload.SetUserUpdated(time.Now().Format(time.RFC3339))
		album.SetSubtype(subtype)

		// Set the parent album
		parentCover := openapi.NewAlbumPayloadCover()
		parentCover.SetId(*ID)
		album.Payload.SetParent(*parentCover)

		randomID := fmt.Sprintf("%032x", rand.Int63())
		req := a.api.client.AlbumsApi.CreateAlbum(context.Background(), *catalog.Id, randomID).
			Authorization("Bearer " + a.api.token).XAPIKey(a.api.clientID).CreateAlbumRequest(*album)
		if _, err := req.Execute(); err != nil {
			return nil, err
		}

		// Refresh the albums list to get the new album
		albums, _, err := a.api.client.AlbumsApi.GetAlbums(context.Background(), *catalog.Id).
			Limit(1000).
			XAPIKey(a.api.clientID).
			Authorization("Bearer " + a.api.token).
			Execute()
		if err != nil {
			return nil, err
		}
		a.Resources = albums.Resources

		// Find the newly created album
		for _, album := range a.Resources {
			if album.Payload.Parent != nil && *album.Payload.Parent.Id == *ID && *album.Payload.Name == name {
				currentAlbum = &album
				break
			}
		}
		if currentAlbum == nil {
			return nil, fmt.Errorf("failed to find newly created album %s", name)
		}
	}
	return currentAlbum, nil
}

func (a *Albums) Print() {
	kids := map[string][]openapi.GetAlbums200ResponseResourcesInner{}
	parents := []openapi.GetAlbums200ResponseResourcesInner{}
	for _, album := range a.Resources {
		if album.Payload.Parent != nil && *album.Payload.Parent.Id != "" {
			kids[*album.Payload.Parent.Id] = append(kids[*album.Payload.Parent.Id], album)
		} else {
			parents = append(parents, album)
		}
	}
	for _, root := range parents {
		fmt.Println(*root.Payload.Name)
		printKids(root, kids, 0)
	}
}

func printKids(parent openapi.GetAlbums200ResponseResourcesInner, kids map[string][]openapi.GetAlbums200ResponseResourcesInner, level int) {
	for _, album := range kids[*parent.Id] {
		fmt.Println(strings.Repeat(" ", level+2), "↳ ", *album.Payload.Name, "(", *album.Id, ")")
		printKids(album, kids, level+2)
	}
}
