/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"errors"
	"fmt"
	"io/ioutil"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/ys/rolls/roll"
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
		root := viper.GetString("scansPath")
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

		for _, file := range files {
			if filepath.Ext(file.Name()) == ".md" {
				continue
			}
			fmt.Println("-> ", file.Name())
		}
		// EXIF
		// Create sheet
		// Rename Folder
	}
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.PersistentFlags().Int("year", 0, "Archive only a year")
}
