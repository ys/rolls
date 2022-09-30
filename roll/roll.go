package roll

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/adrg/frontmatter"
	"github.com/charmbracelet/bubbles/list"
	"github.com/spf13/viper"
)

type Metadata struct {
	CameraID   string    `yaml:"camera"`
	FilmID     string    `yaml:"film"`
	ShotAt     time.Time `yaml:"shot_at"`
	ScannedAt  time.Time `yaml:"scanned_at"`
	RollNumber string    `yaml:"roll_number"`
}

type Roll struct {
	Folder   string
	Content  string
	Metadata Metadata
	list.Item
}

type Rolls []Roll
type Cameras map[string]*Camera
type Films map[string]*Film

func (r *Rolls) Items() []list.Item {
	items := []list.Item{}
	for _, roll := range *r {
		items = append(items, roll)
	}
	return items
}
func (r *Cameras) Items() []list.Item {
	items := []list.Item{}
	for _, camera := range *r {
		items = append(items, *camera)
	}
	return items
}
func (r *Films) Items() []list.Item {
	items := []list.Item{}
	for _, film := range *r {
		items = append(items, *film)
	}
	return items
}

func (i Roll) Title() string       { return i.Metadata.RollNumber }
func (i Roll) Description() string { return i.Metadata.CameraID + " - " + i.Metadata.FilmID }
func (i Roll) FilterValue() string { return i.Metadata.RollNumber }

func (i Camera) Title() string       { return i.Name() }
func (i Camera) Description() string { return "" }
func (i Camera) FilterValue() string { return i.Name() }

func (i Film) Title() string       { return i.NameWithBrand() }
func (i Film) Description() string { return fmt.Sprintf("%d", i.Iso) }
func (i Film) FilterValue() string { return i.NameWithBrand() }

type Camera struct {
	ID       string `yaml:"-"`
	Brand    string `yaml:"brand" mapstructure:"brand"`
	Model    string `yaml:"model" mapstructure:"model"`
	Nickname string `yaml:"nickname" mapstructure:"nickname"`
	Format   int    `yaml:"format" mapstructure:"format"`
}

func (c *Camera) Name() string {
	if c.Nickname != "" {
		return c.Nickname
	}
	return c.Brand + " " + c.Model
}

type Film struct {
	ID    string `yaml:"-"`
	Brand string `yaml:"brand" mapstructure:"brand"`
	Name  string `yaml:"name" mapstructure:"name"`
	Color bool   `yaml:"color" mapstructure:"color"`
	Iso   int    `yaml:"iso" mapstructure:"iso"`
}

func (f *Film) NameWithBrand() string {
	return f.Brand + " " + f.Name + " " + strconv.Itoa(f.Iso)
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

func GetRolls(root string) (Rolls, error) {
	rolls := Rolls{}
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if filepath.Ext(info.Name()) != ".md" {
			return nil
		}
		var matter Metadata
		input, err := os.ReadFile(path)
		content, err := frontmatter.Parse(strings.NewReader(string(input)), &matter)
		if err != nil {
			return err
		}

		r := Roll{
			Folder:   filepath.Dir(path),
			Metadata: matter,
			Content:  string(content),
		}

		rolls = append(rolls, r)
		return nil
	})
	if err != nil {
		fmt.Println(err)
	}
	sort.Sort(ByRollNumber(rolls))
	return rolls, err
}

func Filter(vs Rolls, f func(Roll) bool) []Roll {
	filtered := make(Rolls, 0)
	for _, v := range vs {
		if f(v) {
			filtered = append(filtered, v)
		}
	}
	return filtered
}

type ByRollNumber Rolls

func (a ByRollNumber) Len() int           { return len(a) }
func (a ByRollNumber) Less(i, j int) bool { return a[i].Metadata.RollNumber < a[j].Metadata.RollNumber }
func (a ByRollNumber) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
