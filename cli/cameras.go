/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"fmt"

	"github.com/gosuri/uitable"
	"github.com/spf13/cobra"
)

// camerasCmd represents the cameras command
var camerasCmd = &cobra.Command{
	Use:   "cameras",
	Short: "Manage and list your cameras",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(RenderTitle("📷", "Your Cameras"))

		table := uitable.New()
		table.MaxColWidth = 80
		table.Wrap = true // wrap columns
		for _, camera := range cfg.Cameras {
			table.AddRow("camera:", camera.Name())
		}

		fmt.Println(AccentStyle.Render(table.String()))
	},
}

func init() {
	rootCmd.AddCommand(camerasCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// camerasCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// camerasCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
