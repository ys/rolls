package cmd

import (
	"fmt"

	"github.com/gosuri/uitable"
	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

// listCmd represents the list command
var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all the rolls",
	Long: `List all the rolls that are present at PATH
It will also filter down by year or camera or film
`,
	Run: func(cmd *cobra.Command, args []string) {
		year, err := cmd.Flags().GetInt("year")
		if err != nil {
			panic(err)
		}
		rolls, err := roll.GetRolls("/Users/ys/Library/Mobile Documents/com~apple~CloudDocs/Photos/analog/Scans")
		rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
			return (roll.Metadata.ShotAt.Year() == year) ||
				(roll.Metadata.ScannedAt.Year() == year)
		})
		if err != nil {
			panic(err)
		}
		table := uitable.New()
		table.MaxColWidth = 80
		table.Wrap = true // wrap columns
		for _, roll := range rolls {
			table.AddRow("roll:", roll.Metadata.RollNumber)
			table.AddRow("camera:", roll.Metadata.CameraID)
			table.AddRow("film:", roll.Metadata.FilmID)
			table.AddRow("shot at:", roll.Metadata.ShotAt)
			table.AddRow("---") // blank
		}

		fmt.Println(table)
	},
}

func init() {
	rootCmd.AddCommand(listCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// listCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	listCmd.Flags().Int("year", 2022, "Filter by year")
}
