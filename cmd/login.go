/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"log"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/ys/rolls/lightroom"
)

// loginCmd represents the login command
var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to Adobe",
	Run: func(cmd *cobra.Command, args []string) {
		token, err := lightroom.Login(cfg)
		cobra.CheckErr(err)

		log.Printf("You got a valid token until %s", token.Expiry)
		cfg.AccessToken = token.AccessToken
		viper.Set("access_token", cfg.AccessToken)
		viper.WriteConfig()
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// loginCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// loginCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
