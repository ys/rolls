package lightroom

import (
	"context"
	"fmt"
	"strings"

	"github.com/int128/oauth2cli"
	"github.com/int128/oauth2cli/oauth2params"
	"github.com/pkg/browser"
	"github.com/ys/rolls/config"
	"golang.org/x/oauth2"
	"golang.org/x/sync/errgroup"
)

func Login(cfg *config.Config) (string, error) {
	pkce, err := oauth2params.NewPKCE()
	if err != nil {
		return "", err
	}
	ready := make(chan string, 1)
	defer close(ready)
	oauthCfg := oauth2cli.Config{
		OAuth2Config: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			Endpoint: oauth2.Endpoint{
				AuthURL:  cfg.AuthorizeURL,
				TokenURL: cfg.TokenURL,
			},
			Scopes: strings.Split(cfg.Scopes, ","),
		},
		AuthCodeOptions:      pkce.AuthCodeOptions(),
		RedirectURLHostname:  "localhost",
		TokenRequestOptions:  pkce.TokenRequestOptions(),
		LocalServerReadyChan: ready,
	}

	ctx := context.Background()
	eg, ctx := errgroup.WithContext(ctx)
	var token string
	eg.Go(func() error {
		select {
		case url := <-ready:
			if err := browser.OpenURL(url); err != nil {
				return err
			}
			return nil
		case <-ctx.Done():
			return fmt.Errorf("context done while waiting for authorization: %w", ctx.Err())
		}
	})
	eg.Go(func() error {
		cliToken, err := oauth2cli.GetToken(ctx, oauthCfg)
		if err != nil {
			return err
		}
		token = cliToken.AccessToken
		return nil
	})
	if err := eg.Wait(); err != nil {
		return "", err
	}
	return token, nil
}
