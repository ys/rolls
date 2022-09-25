package lightroom

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/oklog/ulid/v2"
)

type API struct {
	token    string
	clientID string
}

type Catalog struct {
	ID string `json:"id"`
}

type AlbumsResponse struct {
	Base      string     `json:"base"`
	Resources []Resource `json:"resources"`
}

type Resource struct {
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

func (a *API) Albums() (*Albums, error) {
	catalog := Catalog{}
	err := a.Get("/v2/catalog", &catalog)
	if err != nil {
		return nil, err
	}
	albumsResponse := AlbumsResponse{}
	err = a.Get("/v2/catalogs/"+catalog.ID+"/albums?limit=1000", &albumsResponse)
	if err != nil {
		return nil, err
	}
	return &Albums{api: *a, resources: albumsResponse.Resources}, nil
}

func (a *API) Catalog() (*Catalog, error) {
	catalog := Catalog{}
	err := a.Get("/v2/catalog", &catalog)
	if err != nil {
		panic(err)
	}
	return &catalog, err
}

type CreateAlbumPayload struct {
	subtype string
	payload struct {
		userCreated string
		userUpdated string
		name        string
		parent      struct {
			ID string `json:"id"`
		}
	}
}

func (a *API) CreateAlbum(name, parentID string) (*Resource, error) {
	id := ulid.Make()
	catalog := Catalog{}
	err := a.Get("/v2/catalog", &catalog)
	if err != nil {
		return nil, err
	}
	var payload io.Reader
	var response AlbumsResponse
	err = a.Put("/v2/catalogs/"+catalog.ID+"/albums/"+id.String(), payload, response)

	return nil, nil

}

func (a *API) Get(path string, object interface{}) error {
	client := &http.Client{}
	req, err := http.NewRequest(http.MethodGet, "https://lr.adobe.io"+path, nil)
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

func (a *API) Put(path string, data io.Reader, object interface{}) error {
	client := &http.Client{}
	req, err := http.NewRequest(http.MethodPut, "https://lr.adobe.io"+path, data)
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
