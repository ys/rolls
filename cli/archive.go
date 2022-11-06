/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"errors"
	"fmt"
	"sync"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"golang.org/x/exp/slices"
	"gopkg.in/gographics/imagick.v3/imagick"
)

// archiveCmd represents the archive command
var archiveCmd = &cobra.Command{
	Use:   "archive",
	Short: "Rename folder and files and add exif",
	Args:  cobra.MatchAll(cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		imagick.Initialize()
		defer imagick.Terminate()
		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		if len(args) > 0 && year != 0 {
			return errors.New("You can only set year or the rolls not both")
		}
		root := cfg.ScansPath
		fmt.Printf("Reading rolls from: %s\n", root)
		rolls, err := roll.GetRolls(root)
		rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
			if len(args) > 0 {
				return slices.Contains(args, roll.Metadata.RollNumber)
			}
			return year == 0 || (roll.Metadata.ShotAt.Year() == year) ||
				(roll.Metadata.ScannedAt.Year() == year)
		})
		var wg sync.WaitGroup
		wg.Add(len(rolls))

		for _, r := range rolls {
			go func(roll roll.Roll) {
				err := roll.Archive(cfg)
				if err != nil {
					cobra.CheckErr(err)
				}
				wg.Done()
			}(r)
		}
		wg.Wait()
		return nil
	},
}

func init() {
	rootCmd.AddCommand(archiveCmd)
	archiveCmd.PersistentFlags().Int("year", 0, "Archive only a year")
}
