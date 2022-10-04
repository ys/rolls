package roll

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/barasher/go-exiftool"
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

	e, err := exiftool.NewExiftool()
	defer e.Close()
	if err != nil {
		return err
	}

	contactSheet := NewContactSheet()
	defer contactSheet.Destroy()

	for i, file := range files {
		if filepath.Ext(file.Name()) == ".md" {
			continue
		}
		newName := fmt.Sprintf("%s-%02d%s", roll.FilesPrefix(), i+1, filepath.Ext(file.Name()))

		originals := e.ExtractMetadata(path.Join(roll.Folder, file.Name()))

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
