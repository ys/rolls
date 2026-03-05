package cli

import "github.com/spf13/cobra"

var lrCmd = &cobra.Command{
	Use:   "lr",
	Short: "Lightroom commands (upload, check, albums, link, login)",
}

func init() {
	rootCmd.AddCommand(lrCmd)
}
