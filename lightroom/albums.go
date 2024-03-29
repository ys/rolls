package lightroom

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/oklog/ulid/v2"
	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
)

type Albums struct {
	cfg       *roll.Config
	api       API
	Resources []openapi.GetAlbums200ResponseResourcesInner
}

func (a *Albums) getChildrenAlbums(ID string) (*Albums, error) {
	children := []openapi.GetAlbums200ResponseResourcesInner{}
	for _, album := range a.Resources {
		if album.Payload.Parent != nil && *album.Payload.Parent.Id == ID {
			children = append(children, album)
		}
	}
	return &Albums{Resources: children}, nil
}

func (a *Albums) EnsureAlbumUnder(ID *string, name, subtype string) error {
	catalog, err := a.api.Catalog()
	if err != nil {
		return err
	}
	var parent *openapi.GetAlbums200ResponseResourcesInner
	for _, album := range a.Resources {
		if *album.Id == *ID {
			parent = &album
			break
		}
	}
	if parent == nil {
		return errors.New(fmt.Sprintf("Parent not found with ID: %s", *ID))
	}
	children, err := a.getChildrenAlbums(*ID)
	if err != nil {
		return err
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
		// album.Payload.SetParent(openapi.AlbumPayloadCover{Id: ID})
		randomID := ulid.Make().String()
		req := a.api.client.AlbumsApi.CreateAlbum(context.Background(), *catalog.Id, randomID).
			Authorization("Bearer " + a.api.token).XAPIKey(a.api.clientID).CreateAlbumRequest(*album)
		if _, err := req.Execute(); err != nil {
			return err
		}
	}
	return nil
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
