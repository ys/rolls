/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"github.com/spf13/cobra"
	"github.com/ys/rolls/lightroom"
)

// albumsCmd represents the albums command
var albumsCmd = &cobra.Command{
	Use:   "albums",
	Short: "A brief description of your command",
	Run: func(cmd *cobra.Command, args []string) {
		api := lightroom.New(config.ClientID, config.AccessToken)
		api.Albums()
	},
}

func init() {
	rootCmd.AddCommand(albumsCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// albumsCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// albumsCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}