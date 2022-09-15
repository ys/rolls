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
