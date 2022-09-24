/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/int128/oauth2cli"
	"github.com/int128/oauth2cli/oauth2params"
	"github.com/pkg/browser"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"golang.org/x/oauth2"
	"golang.org/x/sync/errgroup"
)

// loginCmd represents the login command
var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to Adobe",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(config)
		pkce, err := oauth2params.NewPKCE()
		if err != nil {
			log.Fatalf("error: %s", err)
		}
		ready := make(chan string, 1)
		defer close(ready)
		cfg := oauth2cli.Config{
			OAuth2Config: oauth2.Config{
				ClientID:     config.ClientID,
				ClientSecret: config.ClientSecret,
				Endpoint: oauth2.Endpoint{
					AuthURL:  config.AuthorizeURL,
					TokenURL: config.TokenURL,
				},
				Scopes: strings.Split(config.Scopes, ","),
			},
			AuthCodeOptions:      pkce.AuthCodeOptions(),
			RedirectURLHostname:  "rolls.localhost",
			TokenRequestOptions:  pkce.TokenRequestOptions(),
			LocalServerReadyChan: ready,
			Logf:                 log.Printf,
		}

		ctx := context.Background()
		eg, ctx := errgroup.WithContext(ctx)
		eg.Go(func() error {
			select {
			case url := <-ready:
				log.Printf("Open %s", url)
				if err := browser.OpenURL(url); err != nil {
					log.Printf("could not open the browser: %s", err)
				}
				return nil
			case <-ctx.Done():
				return fmt.Errorf("context done while waiting for authorization: %w", ctx.Err())
			}
		})
		eg.Go(func() error {
			token, err := oauth2cli.GetToken(ctx, cfg)
			if err != nil {
				return fmt.Errorf("could not get a token: %w", err)
			}
			log.Printf("You got a valid token until %s", token.Expiry)
			config.AccessToken = token.AccessToken
			viper.Set("access_token", config.AccessToken)
			viper.WriteConfig()
			return nil
		})
		if err := eg.Wait(); err != nil {
			log.Fatalf("authorization error: %s", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// loginCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// loginCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
