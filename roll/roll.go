package roll

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/adrg/frontmatter"
	"github.com/barasher/go-exiftool"
	"github.com/charmbracelet/bubbles/list"
)

type Metadata struct {
	CameraID   string    `yaml:"camera"`
	FilmID     string    `yaml:"film"`
	ShotAt     time.Time `yaml:"shot_at"`
	ScannedAt  time.Time `yaml:"scanned_at"`
	RollNumber string    `yaml:"roll_number"`
	Tags       []string  `yaml:"tags"`
}

type Roll struct {
	Folder   string
	Content  string
	Metadata Metadata
	list.Item
}

func (roll *Roll) WriteExif(file string, camera *Camera, film *Film) error {
	e, err := exiftool.NewExiftool()
	defer e.Close()
	if err != nil {
		return err
	}
	originals := e.ExtractMetadata(file)

	originals[0].SetString("Make", camera.Brand)
	originals[0].SetString("Model", camera.Model)
	originals[0].SetInt("Iso", int64(film.Iso))
	description := fmt.Sprintf("%s - %s", camera.Name(), film.NameWithBrand())
	originals[0].SetString("captionabstract", description)
	originals[0].SetString("imagedescription", description)
	originals[0].SetString("description", description)
	at := roll.Metadata.ShotAt.Format("2006:01:02 15:04:05")
	originals[0].SetString("DateTimeOriginal", at)
	originals[0].SetString("FileCreateDate", at)
	originals[0].SetString("ModifyDate", at)
	originals[0].SetString("CreateDate", at)
	kw := make([]string, len(roll.Metadata.Tags))
	copy(kw, roll.Metadata.Tags)
	kw = append(kw, camera.Name(), film.NameWithBrand())
	originals[0].SetStrings("Keywords", kw)
	e.WriteMetadata(originals)
	return nil
}

func (roll *Roll) FilesPrefix() string {
	return fmt.Sprintf("%s-%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"))
}

type Rolls []Roll

func (r *Rolls) Items() []list.Item {
	items := []list.Item{}
	for _, roll := range *r {
		items = append(items, roll)
	}
	return items
}

func (i Roll) Title() string       { return i.Metadata.RollNumber }
func (i Roll) Description() string { return i.Metadata.CameraID + " - " + i.Metadata.FilmID }
func (i Roll) FilterValue() string { return i.Metadata.RollNumber }

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
