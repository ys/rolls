/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"io/ioutil"
	"os"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"gopkg.in/yaml.v2"
)

// filmCreateCmd represents the filmCreate command
var filmCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new film and store it",
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),

	Run: func(cmd *cobra.Command, args []string) {
		brand, err := cmd.PersistentFlags().GetString("brand")
		cobra.CheckErr(err)
		name, err := cmd.PersistentFlags().GetString("name")
		cobra.CheckErr(err)
		iso, err := cmd.PersistentFlags().GetInt("iso")
		cobra.CheckErr(err)
		color, err := cmd.PersistentFlags().GetBool("color")
		cobra.CheckErr(err)
		film := roll.Film{
			Brand: brand,
			Name:  name,
			Color: color,
			Iso:   iso,
		}
		cfg.Films[args[0]] = &film
		data, err := yaml.Marshal(&cfg.Films)
		cobra.CheckErr(err)
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)
		err = ioutil.WriteFile(home+"/.config/rolls/films.yml", data, 0)
		cobra.CheckErr(err)
	},
}

func init() {
	filmsCmd.AddCommand(filmCreateCmd)

	// Here you will define your flags and configuration settings.

	filmCreateCmd.PersistentFlags().String("brand", "", "Brand of the film")
	filmCreateCmd.PersistentFlags().String("name", "", "name of the film")
	filmCreateCmd.PersistentFlags().Int("iso", 0, "iso of the film")
	filmCreateCmd.PersistentFlags().Bool("color", true, "Color or B&W")
	filmCreateCmd.MarkPersistentFlagRequired("brand")
	filmCreateCmd.MarkPersistentFlagRequired("name")
	filmCreateCmd.MarkPersistentFlagRequired("iso")
	filmCreateCmd.MarkPersistentFlagRequired("color")

}
