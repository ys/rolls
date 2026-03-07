package roll

import (
	"github.com/charmbracelet/bubbles/list"
	"github.com/spf13/viper"
)

type Camera struct {
	ID       string `yaml:"-"`
	Brand    string `yaml:"brand" mapstructure:"brand"`
	Model    string `yaml:"model" mapstructure:"model"`
	Nickname string `yaml:"nickname" mapstructure:"nickname"`
	Format   int    `yaml:"format" mapstructure:"format"`
}

func (c Camera) Title() string       { return c.Name() }
func (c Camera) Description() string { return "" }
func (c Camera) FilterValue() string { return c.Name() }

func (c *Camera) Name() string {
	if c.Nickname != "" {
		return c.Nickname
	}
	return c.Brand + " " + c.Model
}

type Cameras map[string]*Camera

func (r *Cameras) Items() []list.Item {
	items := []list.Item{}
	for _, camera := range *r {
		items = append(items, *camera)
	}
	return items
}
func GetCameras(path string) (Cameras, error) {
	camerasCfg := viper.New()
	camerasCfg.AddConfigPath(path)
	camerasCfg.SetConfigType("yaml")
	camerasCfg.SetConfigName("cameras.yml")
	camerasCfg.ReadInConfig()

	var cameras Cameras
	err := camerasCfg.Unmarshal(&cameras)
	if err != nil {
		return nil, err
	}
	return cameras, nil
}
