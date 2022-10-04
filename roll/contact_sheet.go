package roll

import (
	"fmt"

	"gopkg.in/gographics/imagick.v3/imagick"
)

type ContactSheet struct {
	dw          *imagick.DrawingWand
	mw          *imagick.MagickWand
	pw          *imagick.PixelWand
	imagesCount int
}

func NewContactSheet() *ContactSheet {
	cs := ContactSheet{
		dw:          imagick.NewDrawingWand(),
		mw:          imagick.NewMagickWand(),
		pw:          imagick.NewPixelWand(),
		imagesCount: 0,
	}
	cs.pw.SetColor("transparent")
	cs.mw.SetBackgroundColor(cs.pw)
	return &cs
}

func (cs *ContactSheet) AddImage(image string) error {
	ttmw := imagick.NewMagickWand()
	defer ttmw.Destroy()
	err := ttmw.ReadImage(image)
	if err != nil {
		return err
	}
	tmw := ttmw.Clone()
	defer tmw.Destroy()

	err = tmw.AutoOrientImage()
	if err != nil {
		return err
	}
	err = tmw.SetBackgroundColor(cs.pw)
	if err != nil {
		return err
	}
	// Assume Mori scans of about 5300x3600
	width := tmw.GetImageWidth() / 20
	height := tmw.GetImageHeight() / 20
	err = tmw.ScaleImage(width, height)
	if err != nil {
		return err
	}
	err = cs.mw.AddImage(tmw)
	if err != nil {
		return err
	}
	cs.imagesCount += 1
	return nil
}

func (cs *ContactSheet) WriteImage(destination string) error {
	var imagesWidth, imagesHeight = cs.dimensions()
	montage := cs.mw.MontageImage(cs.dw, fmt.Sprintf("%dx%d+0+0", imagesWidth, imagesHeight), "200x200+2+2", imagick.MONTAGE_MODE_CONCATENATE, "0x0+0+0")
	montage.SetBackgroundColor(cs.pw)
	return montage.WriteImage(destination)
}

func (cs *ContactSheet) dimensions() (int, int) {
	switch {
	case cs.imagesCount <= 12:
		return 4, 3
	case cs.imagesCount < 30:
		return 5, 6
	case cs.imagesCount <= 36:
		return 6, 6
	case cs.imagesCount > 36:
		return 6, 7
	}
	return 6, 6
}

func (cs *ContactSheet) Destroy() {
	cs.dw.Destroy()
	cs.mw.Destroy()
	cs.pw.Destroy()
}
