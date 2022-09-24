package lightroom

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type API struct {
	token    string
	clientID string
}

type Catalog struct {
	ID string `json:"id"`
}

type AlbumsResponse struct {
	Base      string  `json:"base"`
	Resources []Album `json:"resources"`
}
type Album struct {
	ID        string
	Type      string
	Subtype   string
	ServiceID string
	Payload   struct {
		Name        string `json:"name"`
		UserCreated string `json:"userCreated"`
		Cover       struct {
			ID string
		}
		Parent struct {
			ID string
		}
	} `json:"payload"`
}

func New(clientID, token string) *API {
	return &API{
		token:    token,
		clientID: clientID,
	}
}

func (a *API) Albums() error {
	catalog := Catalog{}
	err := a.Get("/v2/catalog", &catalog)
	if err != nil {
		panic(err)
	}
	albumsResponse := AlbumsResponse{}
	err = a.Get("/v2/catalogs/"+catalog.ID+"/albums?limit=1000", &albumsResponse)
	if err != nil {
		panic(err)
	}
	kids := map[string][]Album{}
	parents := []Album{}
	for _, album := range albumsResponse.Resources {
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
	return nil
}

func printKids(parent Album, kids map[string][]Album, level int) {
	for _, album := range kids[parent.ID] {
		fmt.Println(strings.Repeat(" ", level+2), album.Payload.Name)
		printKids(album, kids, level+2)
	}
}

func (a *API) Catalog() (*Catalog, error) {
	catalog := Catalog{}
	err := a.Get("/v2/catalog", &catalog)
	if err != nil {
		panic(err)
	}
	return &catalog, err
}

func (a *API) Get(path string, object interface{}) error {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://lr.adobe.io"+path, nil)
	if err != nil {
		return err
	}
	req.Header.Add("X-API-Key", a.clientID)
	req.Header.Add("Authorization", "Bearer "+a.token)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	whilePart := []byte("while (1) {}")
	if err = json.Unmarshal(bytes.TrimPrefix(body, whilePart), object); err != nil {
		return err
	}

	return nil
}
