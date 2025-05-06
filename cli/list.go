package cli

import (
	"fmt"
	"strings"

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
		cobra.CheckErr(err)

		root := cfg.ScansPath
		fmt.Printf("Reading rolls from: %s\n", root)
		rolls, err := roll.GetRolls(root)
		rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
			return year == 0 || (roll.Metadata.ShotAt.Year() == year) ||
				(roll.Metadata.ScannedAt.Year() == year)
		})
		cobra.CheckErr(err)
		compact, err := cmd.Flags().GetBool("compact")
		cobra.CheckErr(err)
		if compact {
			for _, r := range rolls {
				camera := cfg.Cameras[r.Metadata.CameraID]
				film := cfg.Films[r.Metadata.FilmID]
				if camera == nil {
					splitted := strings.SplitN(r.Metadata.CameraID, " ", 2)
					camera = &roll.Camera{
						Brand: splitted[0],
						Model: splitted[1],
					}
				}
				if film == nil {
					film = &roll.Film{
						Nickname: r.Metadata.FilmID,
						ShowIso:  false,
					}
				}
				fmt.Printf("%s - %s - %s\n", r.Metadata.RollNumber, camera.Name(), film.NameWithBrand())
			}
		} else {
			table := uitable.New()
			table.MaxColWidth = 80
			table.Wrap = true // wrap columns
			for _, r := range rolls {
				camera := cfg.Cameras[r.Metadata.CameraID]
				film := cfg.Films[r.Metadata.FilmID]
				if camera == nil {
					splitted := strings.SplitN(r.Metadata.CameraID, " ", 2)
					if len(splitted) == 2 {
						camera = &roll.Camera{
							Brand: splitted[0],
							Model: splitted[1],
						}
					} else {
						camera = &roll.Camera{
							Brand: splitted[0],
							Model: "Unknown",
						}
					}
				}
				if film == nil {
					film = &roll.Film{
						Nickname: r.Metadata.FilmID,
						ShowIso:  false,
					}
				}
				table.AddRow("roll:", r.Metadata.RollNumber)
				table.AddRow("camera:", camera.Name())
				table.AddRow("film:", film.NameWithBrand())
				table.AddRow("shot at:", r.Metadata.ShotAt)
				table.AddRow("---") // blank
			}

			fmt.Println(table)
		}
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
	listCmd.Flags().Int("year", 0, "Filter by year")
	listCmd.Flags().Bool("compact", false, "One per line")
}
