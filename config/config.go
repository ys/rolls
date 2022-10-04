package config

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

type Config struct {
	ScansPath        string `mapstructure:"scans_path" yaml:"scans_path"`
	ContactSheetPath string `mapstructure:"contact_sheet_path" yaml:"contact_sheet_path"`
	ClientID         string `mapstructure:"client_id" yaml:"client_id"`
	ClientSecret     string `mapstructure:"client_secret" yaml:"client_secret"`
	AccessToken      string `mapstructure:"access_token" yaml:"access_token"`
	ScansAlbumID     string `mapstructure:"scans_album_id" yaml:"scans_album_id"`
	CatalogID        string `mapstructure:"catalog_id" yaml:"catalog_id"`
	FilePath         string `mapstructure:"-" yaml:"-"`
}

func (cfg *Config) Dir() string {
	return filepath.Dir(cfg.FilePath)
}

func (cfg *Config) Write() error {
	data, err := yaml.Marshal(&cfg)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(cfg.FilePath, data, 0)
	return err
}

func New(path string) (*Config, error) {
	var cfg Config
	if path != "" {
	} else {
		// Find home directory.
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}

		// Search config in home directory with name ".rolls" (without extension).
		path = home + "/.config/rolls"
		err = os.MkdirAll(path, os.ModePerm)
		if err != nil {
			return nil, err
		}
		path = path + "/config.yml"
	}
	// Use config file from the flag.
	viper.SetConfigFile(path)

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	err := viper.ReadInConfig()
	if err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
	cobra.CheckErr(err)
	err = viper.Unmarshal(&cfg)
	cfg.FilePath = path

	return &cfg, err
}
