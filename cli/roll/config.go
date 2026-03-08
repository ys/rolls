package roll

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

// Env holds per-environment web app credentials.
type Env struct {
	WebAppURL    string `mapstructure:"web_app_url" yaml:"web_app_url"`
	WebAppAPIKey string `mapstructure:"web_app_api_key" yaml:"web_app_api_key"`
}

type Config struct {
	ScansPath         string         `mapstructure:"scans_path" yaml:"scans_path"`
	ContactSheetPath  string         `mapstructure:"contact_sheet_path" yaml:"contact_sheet_path"`
	ObsidianRollsPath string         `mapstructure:"obsidian_rolls_path" yaml:"obsidian_rolls_path"`
	ClientID          string         `mapstructure:"client_id" yaml:"client_id"`
	ClientSecret      string         `mapstructure:"client_secret" yaml:"client_secret"`
	AccessToken       string         `mapstructure:"access_token" yaml:"access_token"`
	ScansAlbumID      string         `mapstructure:"scans_album_id" yaml:"scans_album_id"`
	UserID            string         `mapstructure:"catalog_id" yaml:"-"`
	CatalogID         string         `mapstructure:"catalog_id" yaml:"catalog_id"`
	Copyright         string         `mapstructure:"copyright" yaml:"copyright"`
	BrandName         string         `mapstructure:"brand_name" yaml:"brand_name"`
	AuthorName        string         `mapstructure:"author_name" yaml:"author_name"`
	WebAppURL         string         `mapstructure:"web_app_url" yaml:"web_app_url"`
	WebAppAPIKey      string         `mapstructure:"web_app_api_key" yaml:"web_app_api_key"`
	Environments      map[string]Env `mapstructure:"environments" yaml:"environments,omitempty"`
	ActiveEnv         string         `mapstructure:"active_env" yaml:"active_env,omitempty"`
	FilePath          string         `mapstructure:"-" yaml:"-"`
	Cameras           Cameras        `mapstructure:"-" yaml:"-"`
	Films             Films          `mapstructure:"-" yaml:"-"`
}

// URL returns the web app URL for the active environment,
// falling back to the top-level web_app_url.
func (cfg *Config) URL() string {
	if cfg.ActiveEnv != "" {
		if env, ok := cfg.Environments[cfg.ActiveEnv]; ok && env.WebAppURL != "" {
			return env.WebAppURL
		}
	}
	return cfg.WebAppURL
}

// APIKey returns the API key for the active environment,
// falling back to the top-level web_app_api_key.
func (cfg *Config) APIKey() string {
	if cfg.ActiveEnv != "" {
		if env, ok := cfg.Environments[cfg.ActiveEnv]; ok && env.WebAppAPIKey != "" {
			return env.WebAppAPIKey
		}
	}
	return cfg.WebAppAPIKey
}

// SetEnv adds or updates a named environment and writes the config.
func (cfg *Config) SetEnv(name, url, apiKey string) error {
	if cfg.Environments == nil {
		cfg.Environments = make(map[string]Env)
	}
	cfg.Environments[name] = Env{WebAppURL: url, WebAppAPIKey: apiKey}
	return cfg.Write()
}

func (cfg *Config) Dir() string {
	return filepath.Dir(cfg.FilePath)
}

func (cfg *Config) Write() error {
	data, err := yaml.Marshal(&cfg)
	if err != nil {
		return err
	}
	return os.WriteFile(cfg.FilePath, data, 0o600)
}

func New(path string) (*Config, error) {
	var cfg Config
	if path != "" {
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		path = home + "/.config/rolls"
		err = os.MkdirAll(path, os.ModePerm)
		if err != nil {
			return nil, err
		}
		path = path + "/config.yml"
	}
	viper.SetConfigFile(path)
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
	cobra.CheckErr(err)
	err = viper.Unmarshal(&cfg)
	cfg.FilePath = path
	cobra.CheckErr(err)
	cfg.Cameras, err = GetCameras(cfg.Dir())
	cobra.CheckErr(err)
	cfg.Films, err = GetFilms(cfg.Dir())
	cobra.CheckErr(err)

	return &cfg, err
}
