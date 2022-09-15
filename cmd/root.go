/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>

*/
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var cfgFile string
var cameras []Camera

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "rolls",
	Short: "Rolls allow you to manage your scans",
	Long: `Rolls will allow you to rename folders, files and add EXIF to your
  scans. All that based on a markdown file for definition.`,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/rolls/config.yml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	// 	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		// Search config in home directory with name ".rolls" (without extension).
		path := home + "/.config/rolls"
		err = os.MkdirAll(path, os.ModePerm)
		cobra.CheckErr(err)
		viper.AddConfigPath(home + "/.config/rolls")
		viper.SetConfigType("yaml")
		viper.SetConfigName("config")

		camerasCfg := viper.New()
		camerasCfg.AddConfigPath(home + "/.config/rolls")
		camerasCfg.SetConfigType("yaml")
		camerasCfg.SetConfigName("cameras")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}
