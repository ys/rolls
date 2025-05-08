package lightroom

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/ys/rolls/openapi"
	"github.com/ys/rolls/roll"
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

func (a *API) Albums(cfg *roll.Config) (*Albums, error) {
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

// GenerateAssetID creates a 32-character hexadecimal ID for Lightroom assets
func GenerateAssetID() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (a *API) CreateAsset(catalogID string, assetID string, req *openapi.CreateAssetRequest) (*http.Response, error) {
	// Generate a new 32-character hex ID if none provided
	if assetID == "" {
		var err error
		assetID, err = GenerateAssetID()
		if err != nil {
			return nil, err
		}
	}
	return a.client.AssetsApi.CreateAsset(context.Background(), catalogID, assetID).
		XAPIKey(a.clientID).
		Authorization("Bearer "+a.token).
		CreateAssetRequest(*req).
		Execute()
}

func (a *API) UploadAsset(catalogID string, assetID string, file *os.File, contentLength int64, contentType string) error {
	// Get the base URL and path
	baseURL, err := a.client.GetConfig().ServerURLWithContext(context.Background(), "AssetsApiService.CreateAssetOriginal")
	if err != nil {
		return fmt.Errorf("failed to get server URL: %w", err)
	}

	// Create the URL
	path := baseURL + "/v2/catalogs/" + url.PathEscape(catalogID) + "/assets/" + url.PathEscape(assetID) + "/master"

	// Create a new HTTP request
	httpReq, err := http.NewRequest(http.MethodPut, path, file)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("X-API-Key", a.clientID)
	httpReq.Header.Set("Authorization", "Bearer "+a.token)
	httpReq.Header.Set("Content-Type", contentType)
	httpReq.Header.Set("Content-Length", fmt.Sprintf("%d", contentLength))

	// Execute the request
	resp, err := a.client.GetConfig().HTTPClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Check for error response
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("request failed with status %s: %s", resp.Status, string(body))
	}

	return nil
}

func (a *API) AddAssetsToAlbum(catalogID string, albumID string, req *openapi.AddAssetsToAlbumRequest) (*openapi.AddAssetsToAlbum201Response, error) {
	resp, _, err := a.client.AlbumsApi.AddAssetsToAlbum(context.Background(), catalogID, albumID).
		XAPIKey(a.clientID).
		Authorization("Bearer "+a.token).
		AddAssetsToAlbumRequest(*req).
		Execute()
	return resp, err
}

func (a *API) GetAlbumAssets(catalogID string, albumID string) (*openapi.ListAssetsOfAlbum200Response, error) {
	resp, _, err := a.client.AlbumsApi.ListAssetsOfAlbum(context.Background(), catalogID, albumID).
		XAPIKey(a.clientID).
		Authorization("Bearer "+a.token).
		Limit(1000).
		Embed("asset").
		Execute()
	return resp, err
}
