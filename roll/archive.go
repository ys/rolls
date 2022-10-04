package roll

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/ys/rolls/config"
)

/*
* Needed: contact sheet destination, cameras, films
 */
func (roll *Roll) Archive(cfg *config.Config, cameras Cameras, films Films) error {
	files, err := ioutil.ReadDir(roll.Folder)

	if err != nil {
		return err
	}

	camera := cameras[roll.Metadata.CameraID]
	film := films[roll.Metadata.FilmID]

	if camera == nil {
		return errors.New(fmt.Sprintf("No camera found for '%s'\n", roll.Metadata.CameraID))
	}
	if film == nil {
		return errors.New(fmt.Sprintf("No film found for '%s'\n", roll.Metadata.FilmID))
	}

	contactSheet := NewContactSheet()
	defer contactSheet.Destroy()

	for i, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			continue
		}
		newName := fmt.Sprintf("%s-%02d%s", roll.FilesPrefix(), i+1, filepath.Ext(file.Name()))

		roll.WriteExif(path.Join(roll.Folder, file.Name()), camera, film)

		err = contactSheet.AddImage(path.Join(roll.Folder, file.Name()))
		if err != nil {
			return err
		}

		os.Rename(path.Join(roll.Folder, file.Name()), path.Join(roll.Folder, newName))
	}
	destination := path.Join(cfg.ContactSheetPath, strconv.Itoa(roll.Metadata.ShotAt.Year()), fmt.Sprintf("%s.webp", roll.Metadata.RollNumber))
	fmt.Println("Contact Sheet to", destination)
	err = contactSheet.WriteImage(destination)
	if err != nil {
		return err
	}
	newFolder := fmt.Sprintf("%s-%s-%s", roll.FilesPrefix(), roll.Metadata.CameraID, roll.Metadata.FilmID)
	os.Rename(roll.Folder, path.Join(filepath.Dir(roll.Folder), newFolder))
	return nil
}
