package roll

import (
	"fmt"
	"strconv"

	"github.com/charmbracelet/bubbles/list"
	"github.com/spf13/viper"
)

type Film struct {
	ID       string `yaml:"-"`
	Brand    string `yaml:"brand" mapstructure:"brand"`
	Name     string `yaml:"name" mapstructure:"name"`
	Nickname string `yaml:"nickname" mapstructure:"nickname"`
	Color    bool   `yaml:"color" mapstructure:"color"`
	Iso      int    `yaml:"iso" mapstructure:"iso"`
	ShowIso  bool   `yaml:"showiso" mapstructure:"showiso" default:"true"`
}

func (f *Film) NameWithBrand() string {
	if f.Nickname != "" {
		return f.Nickname
	}
	if f.ShowIso {
		return f.Brand + " " + f.Name + " " + strconv.Itoa(f.Iso)
	}
	return f.Brand + " " + f.Name
}

func (i Film) Title() string       { return i.NameWithBrand() }
func (i Film) Description() string { return fmt.Sprintf("%d", i.Iso) }
func (i Film) FilterValue() string { return i.NameWithBrand() }

type Films map[string]*Film

func (r *Films) Items() []list.Item {
	items := []list.Item{}
	for _, film := range *r {
		items = append(items, *film)
	}
	return items
}

func GetFilms(path string) (Films, error) {
	filmsCfg := viper.New()
	filmsCfg.AddConfigPath(path)
	filmsCfg.SetConfigType("yaml")
	filmsCfg.SetConfigName("films.yml")
	filmsCfg.ReadInConfig()

	var films Films
	err := filmsCfg.Unmarshal(&films)
	if err != nil {
		return nil, err
	}
	return films, nil
}
