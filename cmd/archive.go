/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"sync"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"gopkg.in/gographics/imagick.v3/imagick"
)

// archiveCmd represents the archive command
var archiveCmd = &cobra.Command{
	Use:   "archive",
	Short: "Rename folder and files and add exif",
	Args:  cobra.MatchAll(cobra.MaximumNArgs(1), cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		imagick.Initialize()
		defer imagick.Terminate()
		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		var rollNumber string
		if len(args) == 1 {
			rollNumber = args[0]
		}
		if rollNumber != "" && year != 0 {
			return errors.New("You can only set year or the roll not both")
		}
		root := cfg.ScansPath
		fmt.Printf("Reading rolls from: %s\n", root)
		rolls, err := roll.GetRolls(root)
		rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
			if rollNumber != "" {
				return roll.Metadata.RollNumber == rollNumber
			}
			return year == 0 || (roll.Metadata.ShotAt.Year() == year) ||
				(roll.Metadata.ScannedAt.Year() == year)
		})
		cobra.CheckErr(err)
		archive(rolls)
		return nil
	},
}

func archive(rolls []roll.Roll) {
	var wg sync.WaitGroup
	wg.Add(len(rolls))

	for _, r := range rolls {
		go func(roll roll.Roll) {
			fmt.Println(roll.Metadata.RollNumber)
			// Rename Files
			files, err := ioutil.ReadDir(roll.Folder)
			cobra.CheckErr(err)

			dw := imagick.NewDrawingWand()
			defer dw.Destroy()
			mw := imagick.NewMagickWand()
			defer mw.Destroy()
			wand := imagick.NewPixelWand()
			wand.SetColor("transparent")
			defer wand.Destroy()
			mw.SetBackgroundColor(wand)
			// assume all files are images but the md file
			imagesCount := len(files) - 1
			var imagesWidth, imagesHeight int
			switch {
			case imagesCount < 12:
				imagesWidth, imagesHeight = 4, 3
			case imagesCount < 30:
				imagesWidth, imagesHeight = 5, 6
			case imagesCount < 36:
				imagesWidth, imagesHeight = 6, 6
			case imagesCount > 36:
				imagesWidth, imagesHeight = 6, 7
			}
			for i, file := range files {
				if filepath.Ext(file.Name()) == ".md" {
					continue
				}
				newName := fmt.Sprintf("%s-%s-%02d%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"), i+1, filepath.Ext(file.Name()))

				fmt.Println("Rename File ", file.Name(), " -> ", newName)
				ttmw := imagick.NewMagickWand()
				ttmw.ReadImage(path.Join(roll.Folder, file.Name()))
				tmw := ttmw.Clone()
				ttmw.Destroy()

				tmw.AutoOrientImage()
				tmw.SetBackgroundColor(wand)
				width := tmw.GetImageWidth() / 20
				height := tmw.GetImageHeight() / 20
				tmw.ScaleImage(width, height)
				mw.AddImage(tmw)
				tmw.Destroy()
			}
			// Create sheet
			montage := mw.MontageImage(dw, fmt.Sprintf("%dx%d+0+0", imagesWidth, imagesHeight), "200x200+2+2", imagick.MONTAGE_MODE_CONCATENATE, "0x0+0+0")
			montage.SetBackgroundColor(wand)
			current, err := os.Getwd()
			if err != nil {
				log.Println(err)
			}
			err = montage.WriteImage(path.Join(current, fmt.Sprintf("%s.webp", roll.Metadata.RollNumber)))
			// EXIF
			// Rename Folder
			newFolder := fmt.Sprintf("%s-%s-%s-%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"), roll.Metadata.CameraID, roll.Metadata.FilmID)
			fmt.Println("Rename Folder ", roll.Folder, " -> ", newFolder)
			wg.Done()
		}(r)
	}
	wg.Wait()
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.PersistentFlags().Int("year", 0, "Archive only a year")
}
