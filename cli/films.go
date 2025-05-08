/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"fmt"

	"github.com/gosuri/uitable"
	"github.com/spf13/cobra"
)

// filmsCmd represents the films command
var filmsCmd = &cobra.Command{
	Use:   "films",
	Short: "Manage and list your films",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(RenderTitle("🎞️", "Your Films"))
		
		table := uitable.New()
		table.MaxColWidth = 80
		table.Wrap = true // wrap columns
		for _, film := range cfg.Films {
			table.AddRow("film:", film.NameWithBrand())
		}

		fmt.Println(AccentStyle.Render(table.String()))
	},
}

func init() {
	rootCmd.AddCommand(filmsCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// filmsCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// filmsCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
