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
	for _, roll := range rolls {
		fmt.Println(roll.Metadata.RollNumber)
		// Rename Files
		files, err := ioutil.ReadDir(roll.Folder)
		cobra.CheckErr(err)

		imagick.Initialize()
		defer imagick.Terminate()
		dw := imagick.NewDrawingWand()
		defer dw.Destroy()
		mw := imagick.NewMagickWand()
		defer mw.Destroy()
		wand := imagick.NewPixelWand()
		wand.SetColor("transparent")
		defer wand.Destroy()
		mw.SetBackgroundColor(wand)
		for i, file := range files {
			if filepath.Ext(file.Name()) == ".md" {
				continue
			}
			newName := fmt.Sprintf("%s-%s-%02d%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"), i+1, filepath.Ext(file.Name()))

			fmt.Println("Rename File ", file.Name(), " -> ", newName)
			tmw := imagick.NewMagickWand()
			defer tmw.Destroy()
			tmw.ReadImage(path.Join(roll.Folder, file.Name()))
			tmw = tmw.Clone()
			tmw.AutoOrientImage()
			tmw.SetBackgroundColor(wand)
			width := tmw.GetImageWidth() / 20
			height := tmw.GetImageHeight() / 20
			tmw.ScaleImage(width, height)
			mw.AddImage(tmw)
		}
		montage := mw.MontageImage(dw, "6x7+0+0", "200x200+2+2", imagick.MONTAGE_MODE_CONCATENATE, "0x0+0+0")
		montage.SetBackgroundColor(wand)
		current, err := os.Getwd()
		if err != nil {
			log.Println(err)
		}
		err = montage.WriteImage(path.Join(current, fmt.Sprintf("%s.png", roll.Metadata.RollNumber)))
		// EXIF
		// Create sheet
		// montage
		//  montage = MiniMagick::Tool::Montage.new
		// montage.fill("gray")
		// montage.background("#fff")
		// montage.define("jpeg:size=200x200")
		// montage.geometry("200x200+2+2")
		// montage.auto_orient
		// montage << "#{roll.dir}/*.jpg"
		// montage << "#{destination}/#{roll.roll_number}.jpg"
		// montage.call
		// Rename Folder
		newFolder := fmt.Sprintf("%s-%s-%s-%s", roll.Metadata.RollNumber, roll.Metadata.ShotAt.Format("0102"), roll.Metadata.CameraID, roll.Metadata.FilmID)
		fmt.Println("Rename Folder ", roll.Folder, " -> ", newFolder)
	}
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.PersistentFlags().Int("year", 0, "Archive only a year")
}
