/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"

	"github.com/gosuri/uitable"
	"github.com/spf13/cobra"
)

// filmsCmd represents the films command
var filmsCmd = &cobra.Command{
	Use:   "films",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		table := uitable.New()
		table.MaxColWidth = 80
		table.Wrap = true // wrap columns
		for _, film := range cfg.Films {

			table.AddRow("film:", film.NameWithBrand())
		}

		fmt.Println(table)
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
