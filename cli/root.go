package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
)

var cfgFile string
var cfg *roll.Config
var verbose bool

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "rolls",
	Short: "Rolls allow you to manage your scans",
	Long: `rolls manages your analog film roll archive.

Workflow:
  backup    — pull roll.md files + cameras/films from the web app
  process   — rename files, write EXIF, generate contact sheet, publish to web
  sync      — write yearly summary notes to your Obsidian vault
  push      — bulk-sync all local metadata to the web app

Config lives in ~/.config/rolls/config.yml`,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/rolls/config.yml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "enable verbose output")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	var err error
	cfg, err = roll.New(cfgFile)
	cobra.CheckErr(err)
}
