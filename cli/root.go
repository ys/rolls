package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/cli/roll"
)

var cfgFile string
var cfg *roll.Config
var verbose bool
var envFlag string

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
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/rolls/config.yml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "enable verbose output")
	rootCmd.PersistentFlags().StringVar(&envFlag, "env", "", "environment to use (e.g. prod, local, staging)")
}

func initConfig() {
	var err error
	cfg, err = roll.New(cfgFile)
	cobra.CheckErr(err)
	// --env flag overrides active_env from config for this invocation only
	if envFlag != "" {
		cfg.ActiveEnv = envFlag
	}
}
