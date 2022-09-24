/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"io/ioutil"
	"os"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"gopkg.in/yaml.v2"
)

// cameraCreateCmd represents the cameraCreate command
var cameraCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new camera and store it",
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),

	Run: func(cmd *cobra.Command, args []string) {
		brand, err := cmd.PersistentFlags().GetString("brand")
		cobra.CheckErr(err)
		model, err := cmd.PersistentFlags().GetString("model")
		cobra.CheckErr(err)
		format, err := cmd.PersistentFlags().GetInt("format")
		cobra.CheckErr(err)
		nickname, err := cmd.PersistentFlags().GetString("nickname")
		cobra.CheckErr(err)
		camera := roll.Camera{
			Brand:    brand,
			Model:    model,
			Format:   format,
			Nickname: nickname,
		}
		cameras := roll.GetCameras()
		cameras[args[0]] = &camera
		data, err := yaml.Marshal(&cameras)
		cobra.CheckErr(err)
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)
		err = ioutil.WriteFile(home+"/.config/rolls/cameras.yml", data, 0)
		cobra.CheckErr(err)
	},
}

func init() {
	camerasCmd.AddCommand(cameraCreateCmd)

	// Here you will define your flags and configuration settings.

	cameraCreateCmd.PersistentFlags().String("brand", "", "Brand of the camera")
	cameraCreateCmd.PersistentFlags().String("model", "", "Model of the camera")
	cameraCreateCmd.PersistentFlags().String("nickname", "", "NickName of the camera")
	cameraCreateCmd.PersistentFlags().Int("format", 135, "135 or 120")
	cameraCreateCmd.MarkPersistentFlagRequired("brand")
	cameraCreateCmd.MarkPersistentFlagRequired("model")

}
