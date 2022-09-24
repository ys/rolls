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
	"github.com/spf13/viper"
)

var camerasCfg viper.Viper
var filmsCfg viper.Viper
var cameras map[string]*Camera
var films map[string]*Film

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
}

func (r *Roll) Camera() string {
	camera := cameras[r.Metadata.CameraID]
	if camera != nil {
		return camera.Name()
	}
	return r.Metadata.CameraID
}

func (r *Roll) Film() string {
	film := films[r.Metadata.FilmID]
	if film != nil {
		return film.NameWithBrand()
	}
	return r.Metadata.FilmID
}

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

func GetCameras() map[string]*Camera {
	return cameras
}

func GetFilms() map[string]*Film {
	return films
}

func GetRolls(root string) ([]Roll, error) {
	rolls := []Roll{}
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

func Filter(vs []Roll, f func(Roll) bool) []Roll {
	filtered := make([]Roll, 0)
	for _, v := range vs {
		if f(v) {
			filtered = append(filtered, v)
		}
	}
	return filtered
}

type ByRollNumber []Roll

func (a ByRollNumber) Len() int           { return len(a) }
func (a ByRollNumber) Less(i, j int) bool { return a[i].Metadata.RollNumber < a[j].Metadata.RollNumber }
func (a ByRollNumber) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func init() {
	home, err := os.UserHomeDir()
	camerasCfg := viper.New()
	camerasCfg.AddConfigPath(home + "/.config/rolls")
	camerasCfg.SetConfigType("yaml")
	camerasCfg.SetConfigName("cameras.yml")
	camerasCfg.ReadInConfig()

	cameras = make(map[string]*Camera)
	err = camerasCfg.Unmarshal(&cameras)
	if err != nil {
		panic(err)
	}

	filmsCfg := viper.New()
	filmsCfg.AddConfigPath(home + "/.config/rolls")
	filmsCfg.SetConfigType("yaml")
	filmsCfg.SetConfigName("films.yml")
	filmsCfg.ReadInConfig()

	films = make(map[string]*Film)
	err = filmsCfg.Unmarshal(&films)
	if err != nil {
		panic(err)
	}
}
