package lightroom

import (
	"context"
	"fmt"

	"github.com/int128/oauth2cli"
	"github.com/int128/oauth2cli/oauth2params"
	"github.com/pkg/browser"
	"github.com/ys/rolls/roll"
	"golang.org/x/oauth2"
	"golang.org/x/sync/errgroup"
)

var (
	authorizeURL = "https://ims-na1.adobelogin.com/ims/authorize/v2"
	tokenURL     = "https://ims-na1.adobelogin.com/ims/token/v3"
	scopes       = []string{"offline_access", "openid", "lr_partner_apis"}
)

func Login(cfg *roll.Config) (*oauth2.Token, error) {
	pkce, err := oauth2params.NewPKCE()
	if err != nil {
		return nil, err
	}
	ready := make(chan string, 1)
	defer close(ready)
	oauthCfg := oauth2cli.Config{
		OAuth2Config: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			Endpoint: oauth2.Endpoint{
				AuthURL:  authorizeURL,
				TokenURL: tokenURL,
			},
			Scopes: scopes,
		},
		AuthCodeOptions:      pkce.AuthCodeOptions(),
		RedirectURLHostname:  "localhost",
		TokenRequestOptions:  pkce.TokenRequestOptions(),
		LocalServerReadyChan: ready,
	}

	ctx := context.Background()
	eg, ctx := errgroup.WithContext(ctx)
	var token *oauth2.Token
	eg.Go(func() error {
		select {
		case url := <-ready:
			if err := browser.OpenURL(url); err != nil {
				return err
			}
			fmt.Println("Opened browser for " + url)
			return nil
		case <-ctx.Done():
			return fmt.Errorf("context done while waiting for authorization: %w", ctx.Err())
		}
	})
	eg.Go(func() error {
		var err error
		token, err = oauth2cli.GetToken(ctx, oauthCfg)
		if err != nil {
			return err
		}
		return nil
	})
	if err := eg.Wait(); err != nil {
		return nil, err
	}
	return token, nil
}
