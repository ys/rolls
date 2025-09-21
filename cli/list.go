package cli

import (
	"fmt"
	"strings"
	"time"

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
		fmt.Println(RenderTitle("📚", fmt.Sprintf("Reading rolls from: %s", root)))
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
				fmt.Println(RenderSummary(fmt.Sprintf("%s - %s - %s", r.Metadata.RollNumber, camera.Name(), film.NameWithBrand())))
			}
		} else {
			// Display rolls in a nice card format
			for i, r := range rolls {
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

				// Create a nice card for each roll
				renderRollCard(r, camera, film, i+1, len(rolls))
			}
		}
	},
}

// renderRollCard creates a beautiful card display for a roll
func renderRollCard(r roll.Roll, camera *roll.Camera, film *roll.Film, index, total int) {
	// Card header with roll number and status
	status := "📸"
	statusText := "Ready"
	if !r.Metadata.ProcessedAt.IsZero() {
		status = "✨"
		statusText = "Processed"
	}
	if !r.Metadata.ArchivedAt.IsZero() {
		status = "📦"
		statusText = "Archived"
	}

	// Main card content
	fmt.Printf("\n%s %s\n",
		TitleStyle.Render(fmt.Sprintf("📷 Roll %s", r.Metadata.RollNumber)),
		SummaryStyle.Render(fmt.Sprintf("%s %s", status, statusText)))

	// Equipment info
	fmt.Printf("  %s %s\n",
		AccentStyle.Render("📷 Camera:"),
		SummaryStyle.Render(camera.Name()))
	fmt.Printf("  %s %s\n",
		AccentStyle.Render("🎞️  Film:"),
		SummaryStyle.Render(film.NameWithBrand()))

	// Dates
	fmt.Printf("  %s %s\n",
		AccentStyle.Render("📅 Shot:"),
		SummaryStyle.Render(formatDate(r.Metadata.ShotAt)))
	fmt.Printf("  %s %s\n",
		AccentStyle.Render("🔄 Scanned:"),
		SummaryStyle.Render(formatDate(r.Metadata.ScannedAt)))

	// Tags if any (only show if there are actual tags)
	if len(r.Metadata.Tags) > 0 && r.Metadata.Tags[0] != "" {
		// Filter out empty tags
		nonEmptyTags := make([]string, 0)
		for _, tag := range r.Metadata.Tags {
			if strings.TrimSpace(tag) != "" {
				nonEmptyTags = append(nonEmptyTags, strings.TrimSpace(tag))
			}
		}
		if len(nonEmptyTags) > 0 {
			fmt.Printf("  %s %s\n",
				AccentStyle.Render("🏷️  Tags:"),
				SummaryStyle.Render(strings.Join(nonEmptyTags, ", ")))
		}
	}

	// Album info if uploaded
	if r.Metadata.AlbumName != "" {
		fmt.Printf("  %s %s\n",
			AccentStyle.Render("☁️  Album:"),
			SummaryStyle.Render(r.Metadata.AlbumName))
	}

	// Separator line (except for last item)
	if index < total {
		fmt.Println(AccentStyle.Render("  ─────────────────────────────────────────"))
	}
}

// formatDate formats a date in a nice readable format
func formatDate(t time.Time) string {
	if t.IsZero() {
		return "Not set"
	}
	return t.Format("Jan 2, 2006")
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
