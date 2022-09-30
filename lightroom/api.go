package lightroom

import (
	"context"

	"github.com/ys/rolls/config"
	"github.com/ys/rolls/openapi"
)

type API struct {
	token    string
	clientID string
	client   openapi.APIClient
}

func New(clientID, token string) *API {
	cfg := openapi.NewConfiguration()
	client := openapi.NewAPIClient(cfg)

	return &API{
		token:    token,
		clientID: clientID,
		client:   *client,
	}
}

func (a *API) Albums(cfg *config.Config) (*Albums, error) {
	catalog, err := a.Catalog()
	if err != nil {
		return nil, err
	}
	req := a.client.AlbumsApi.GetAlbums(context.Background(), *catalog.Id)
	albums, _, err := req.Limit(1000).XAPIKey(a.clientID).Authorization("Bearer " + a.token).Execute()
	if err != nil {
		return nil, err
	}
	return &Albums{api: *a, Resources: albums.Resources, cfg: cfg}, nil
}

func (a *API) Catalog() (*openapi.GetCatalog200Response, error) {
	req := a.client.CatalogsApi.GetCatalog(context.Background())
	catalog, _, err := req.XAPIKey(a.clientID).Authorization("Bearer " + a.token).Execute()
	if err != nil {
		panic(err)
	}
	return catalog, err
}

func (a *API) CreateAlbum(name, parentID string) error {
	_, err := a.Catalog()
	if err != nil {
		return err
	}

	return nil

}
