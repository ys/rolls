package roll

import (
	"fmt"
	"os"
	"path/filepath"
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
