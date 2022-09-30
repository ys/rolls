package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	ScansPath    string `mapstructure:"scans_path"`
	AuthorizeURL string `mapstructure:"authorize_url"`
	TokenURL     string `mapstructure:"token_url"`
	Scopes       string `mapstructure:"scopes"`
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
	AccessToken  string `mapstructure:"access_token"`
	ScansAlbumID string `mapstructure:"scans_album_id"`
	CatalogID    string `mapstructure:"catalog_id"`
}

func New(path string) (*Config, error) {
	var cfg Config
	if path != "" {
		// Use config file from the flag.
		viper.SetConfigFile(path)
	} else {
		// Find home directory.
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}

		// Search config in home directory with name ".rolls" (without extension).
		path := home + "/.config/rolls"
		err = os.MkdirAll(path, os.ModePerm)
		if err != nil {
			return nil, err
		}
		viper.AddConfigPath(home + "/.config/rolls")
		viper.SetConfigType("yaml")
		viper.SetConfigName("config.yml")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
	err := viper.Unmarshal(&cfg)

	return &cfg, err
}
