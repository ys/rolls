/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cli

import (
	"errors"
	"fmt"
	"os"
	"path"
	"sync"

	"github.com/spf13/cobra"
	"github.com/ys/rolls/roll"
	"golang.org/x/exp/slices"
	"gopkg.in/gographics/imagick.v3/imagick"
)

// archiveCmd represents the archive command
var contactSheetCmd = &cobra.Command{
	Use:   "contactsheet",
	Short: "Generate contact sheet images for rolls",
	Long: `Generates a .webp contact sheet image for each roll using ImageMagick.
Output is written to {contact_sheet_path}/images/{roll_number}.webp.

Accepts roll numbers as arguments, or use --year to process all rolls from a year.`,
	Args: cobra.MatchAll(cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		imagick.Initialize()
		defer imagick.Terminate()
		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		if len(args) > 0 && year != 0 {
			return errors.New("You can only set year or the rolls not both")
		}
		root := cfg.ScansPath
		fmt.Println(RenderTitle("📚", fmt.Sprintf("Reading rolls from: %s", root)))
		rolls, err := roll.GetRolls(root)
		rolls = roll.Filter(rolls, func(roll roll.Roll) bool {
			if len(args) > 0 {
				return slices.Contains(args, roll.Metadata.RollNumber)
			}
			return year == 0 || (roll.Metadata.ShotAt.Year() == year) ||
				(roll.Metadata.ScannedAt.Year() == year)
		})
		var wg sync.WaitGroup
		wg.Add(len(rolls))

		for _, r := range rolls {
			go func(roll roll.Roll) {
				fmt.Println(RenderTitle("🖼️", fmt.Sprintf("Generating contact sheet for %s", roll.Metadata.RollNumber)))
				err := roll.GenerateNewContactSheet(cfg)
				if err != nil {
					cobra.CheckErr(err)
				}
				fmt.Println(RenderSuccess(fmt.Sprintf("Contact sheet generated for %s", roll.Metadata.RollNumber)))
				wg.Done()
			}(r)
		}
		wg.Wait()
		return nil
	},
}

func init() {
	rootCmd.AddCommand(contactSheetCmd)
	contactSheetCmd.PersistentFlags().Int("year", 0, "Archive only a year")

	// contactsheet:pdf - generate printable PDFs with header + contact sheet image
	rootCmd.AddCommand(contactSheetPdfCmd)
	contactSheetPdfCmd.PersistentFlags().Int("year", 0, "Generate PDFs only for a year")

}

// contactsheet:pdf command
var contactSheetPdfCmd = &cobra.Command{
	Use:   "contactsheet:pdf",
	Short: "Generate printable contact sheet PDFs",
	Args:  cobra.MatchAll(cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		imagick.Initialize()
		defer imagick.Terminate()

		year, err := cmd.PersistentFlags().GetInt("year")
		cobra.CheckErr(err)
		if len(args) > 0 && year != 0 {
			return errors.New("You can only set year or the rolls not both")
		}

		root := cfg.ScansPath
		fmt.Println(RenderTitle("📚", fmt.Sprintf("Reading rolls from: %s", root)))
		rolls, err := roll.GetRolls(root)
		if err != nil {
			return err
		}
		rolls = roll.Filter(rolls, func(r roll.Roll) bool {
			if len(args) > 0 {
				return slices.Contains(args, r.Metadata.RollNumber)
			}
			return year == 0 || (r.Metadata.ShotAt.Year() == year) || (r.Metadata.ScannedAt.Year() == year)
		})

		// Ensure output directory exists
		outDir := path.Join(cfg.ContactSheetPath, "pdfs")
		if err := os.MkdirAll(outDir, 0755); err != nil {
			return err
		}

		for _, r := range rolls {
			// Ensure contact sheet image exists; generate if missing
			imgPath := path.Join(cfg.ContactSheetPath, "images", fmt.Sprintf("%s.webp", r.Metadata.RollNumber))
			if _, err := os.Stat(imgPath); os.IsNotExist(err) {
				fmt.Println(RenderTitle("🖼️", fmt.Sprintf("Generating contact sheet for %s", r.Metadata.RollNumber)))
				if err := r.GenerateNewContactSheet(cfg); err != nil {
					return err
				}
			}

			// Compose a PDF page (A4 at 300dpi ~ 2480x3508)
			const pageW = 2480
			const pageH = 3508
			const margin = 160 // Increased from 120 for more X-axis margin
			const headerGap = 40

			bg := imagick.NewPixelWand()
			bg.SetColor("white")

			mw := imagick.NewMagickWand()
			mw.NewImage(pageW, pageH, bg)
			mw.SetImageColorspace(imagick.COLORSPACE_SRGB)

			// Draw header text (we'll use this for both left and right side text)
			dw := imagick.NewDrawingWand()
			pw := imagick.NewPixelWand()
			pw.SetColor("black")
			dw.SetFillColor(pw)
			dw.SetFontFamily("Berkeley Mono")

			// Define right text position first (we'll align left side to match)
			rightX := float64(pageW - margin)
			headerY := float64(margin + 80) // Increased from margin + 40 for more top margin

			// Header lines (needed for text positioning)
			camera := cfg.Cameras[r.Metadata.CameraID]
			film := cfg.Films[r.Metadata.FilmID]
			cameraName := r.Metadata.CameraID
			filmName := r.Metadata.FilmID
			if camera != nil {
				cameraName = camera.Name()
			}
			if film != nil {
				filmName = film.NameWithBrand()
			}

			// Brand name and author name setup
			brandName := cfg.BrandName
			if brandName == "" {
				brandName = "BONJOUR"
			}
			authorName := cfg.AuthorName
			if authorName == "" {
				authorName = "Yannick Schutz"
			}

			// Calculate text positioning for proper alignment
			// Using golden ratio (1.618) for typographic scale
			// Scale: 89pt -> 55pt -> 34pt (each divided by golden ratio)
			brandFontSize := 89.0
			authorFontSize := 55.0
			detailFontSize := 34.0
			brandAscender := brandFontSize * 0.75

			// Calculate roll number top (baseline - ascender)
			// Right side roll number uses headerY as baseline, so top is headerY - ascender
			rollNumberTop := headerY - brandAscender

			// Brand name baseline: use same top position, then add ascender to get baseline
			brandBaseline := rollNumberTop + brandAscender

			// Author name baseline: align with Camera line on right side (70px below roll number)
			// This creates visual balance between left and right sides
			authorBaseline := brandBaseline + 70

			// Total text block height
			textBlockTop := rollNumberTop
			textBlockBottom := authorBaseline + (authorFontSize * 0.25) // Add descender space
			textBlockHeight := textBlockBottom - textBlockTop
			textBlockCenter := textBlockTop + textBlockHeight/2

			// Load and place logo, centered with text block
			logoPath := "logo.svg"
			logoX := float64(margin)
			logoW := uint(0)
			logoH := uint(0)
			if _, err := os.Stat(logoPath); err == nil {
				logo := imagick.NewMagickWand()
				if err := logo.ReadImage(logoPath); err == nil {
					// Resize logo to a small size (max 200px on longest side)
					logoW = logo.GetImageWidth()
					logoH = logo.GetImageHeight()
					const maxLogoSize = 200
					var scale float64
					if logoW > logoH {
						if logoW > maxLogoSize {
							scale = float64(maxLogoSize) / float64(logoW)
						} else {
							scale = 1.0
						}
					} else {
						if logoH > maxLogoSize {
							scale = float64(maxLogoSize) / float64(logoH)
						} else {
							scale = 1.0
						}
					}
					if scale < 1.0 {
						newW := uint(float64(logoW) * scale)
						newH := uint(float64(logoH) * scale)
						logo.ResizeImage(newW, newH, imagick.FILTER_LANCZOS)
						logoW = newW
						logoH = newH
					}
					// Center logo vertically with text block
					logoY := textBlockCenter - float64(logoH)/2
					// Place in top-left
					if err := mw.CompositeImage(logo, imagick.COMPOSITE_OP_OVER, false, int(logoX), int(logoY)); err == nil {
						// Logo placed successfully
					}
					logo.Destroy()
				}
			}

			// Draw brand name and author name next to logo
			dw.SetTextAlignment(imagick.ALIGN_LEFT)
			textX := logoX + float64(logoW) + 20 // 20px gap after logo

			// Brand name - align top with roll number top
			dw.SetFontSize(brandFontSize)
			dw.SetFontWeight(600) // Semi-bold
			dw.Annotation(textX, brandBaseline, brandName)

			// Author name - positioned below brand name
			dw.SetFontSize(authorFontSize)
			dw.SetFontWeight(400) // Normal weight
			dw.Annotation(textX, authorBaseline, authorName)

			// Draw header text on the right
			dw.SetTextAlignment(imagick.ALIGN_RIGHT)

			// Roll number in bold and large - use same baseline as brand name for top alignment
			rollNumberBaseline := rollNumberTop + brandAscender
			dw.SetFontSize(brandFontSize)
			dw.SetFontWeight(700)
			dw.Annotation(rightX, rollNumberBaseline, fmt.Sprintf("Roll %s", r.Metadata.RollNumber))
			dw.SetFontWeight(400) // Reset to normal weight
			dw.SetFontSize(detailFontSize)
			headerY += 70
			dw.Annotation(rightX, headerY, fmt.Sprintf("Camera: %s", cameraName))
			headerY += 55
			dw.Annotation(rightX, headerY, fmt.Sprintf("Film: %s", filmName))
			headerY += 55
			if !r.Metadata.ShotAt.IsZero() {
				dw.Annotation(rightX, headerY, fmt.Sprintf("Shot: %s", r.Metadata.ShotAt.Format("2006-01-02")))
				headerY += 55
			}

			// Load and place the contact sheet image
			cs := imagick.NewMagickWand()
			if err := cs.ReadImage(imgPath); err != nil {
				dw.Destroy()
				pw.Destroy()
				mw.Destroy()
				bg.Destroy()
				cs.Destroy()
				return err
			}

			// Fit image within content area
			contentTop := int(headerY) + headerGap
			contentW := pageW - 2*margin
			contentH := pageH - contentTop - margin
			iw := int(cs.GetImageWidth())
			ih := int(cs.GetImageHeight())
			scale := float64(contentW) / float64(iw)
			if int(float64(ih)*scale) > contentH {
				scale = float64(contentH) / float64(ih)
			}
			newW := uint(float64(iw) * scale)
			newH := uint(float64(ih) * scale)
			if err := cs.ResizeImage(newW, newH, imagick.FILTER_LANCZOS); err != nil {
				dw.Destroy()
				pw.Destroy()
				mw.Destroy()
				bg.Destroy()
				cs.Destroy()
				return err
			}

			// Composite centered
			x := margin + (contentW-int(newW))/2
			y := contentTop + (contentH-int(newH))/2
			if err := mw.CompositeImage(cs, imagick.COMPOSITE_OP_OVER, false, x, y); err != nil {
				dw.Destroy()
				pw.Destroy()
				mw.Destroy()
				bg.Destroy()
				cs.Destroy()
				return err
			}

			// Apply drawings
			mw.DrawImage(dw)

			// Write PDF
			outPath := path.Join(outDir, fmt.Sprintf("%s.pdf", r.Metadata.RollNumber))
			mw.SetImageFormat("pdf")
			if err := mw.WriteImage(outPath); err != nil {
				dw.Destroy()
				pw.Destroy()
				mw.Destroy()
				bg.Destroy()
				cs.Destroy()
				return err
			}

			dw.Destroy()
			pw.Destroy()
			mw.Destroy()
			bg.Destroy()
			cs.Destroy()
			fmt.Println(RenderSuccess(fmt.Sprintf("📄 Saved PDF to %s", outPath)))
		}

		return nil
	},
}
