package preparegspatialjp

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearthx/log"
)

type CMSWrapper struct {
	CMS         cms.Interface
	ProjectID   string
	DataItemID  string
	CityItemID  string
	SkipCityGML bool
	SkipPlateau bool
	SkipMaxLOD  bool
	SkipIndex   bool
	SkipRelated bool
	WetRun      bool
}

func (c *CMSWrapper) NotifyRunning(ctx context.Context) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: notify running (skipped)")
		return
	}

	c.Comment(ctx, "公開準備処理を開始しました。")

	item := &GspatialjpDataItem{}
	if !c.SkipCityGML {
		item.MergeCityGMLStatus = runningTag
	}
	if !c.SkipPlateau {
		item.MergePlateauStatus = runningTag
	}
	if !c.SkipMaxLOD {
		item.MergeMaxLODStatus = runningTag
	}

	if err := c.UpdateDataItem(ctx, item); err != nil {
		log.Errorfc(ctx, "failed to update data item %s: %v", c.DataItemID, err)
	}
}

func (c *CMSWrapper) NotifyError(ctx context.Context, err error, citygml, plateau, maxlod bool) {
	if c == nil || !c.WetRun || err == nil {
		log.Debugfc(ctx, "cms: notify error (skipped): citygml=%v, plateau=%v, maxlod=%v", citygml, plateau, maxlod)
		return
	}

	c.NotifyErrorMessage(ctx, err.Error(), citygml, plateau, maxlod)
}

func (c *CMSWrapper) NotifyErrorMessage(ctx context.Context, msg string, citygml, plateau, maxlod bool) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: notify error message (skipped): citygml=%v, plateau=%v, maxlod=%v, msg=%s", citygml, plateau, maxlod, msg)
		return
	}

	c.Comment(ctx, "公開準備処理に失敗しました。"+msg)

	item := &GspatialjpDataItem{}
	if citygml {
		item.MergeCityGMLStatus = failedTag
	} else if !c.SkipCityGML {
		item.MergeCityGMLStatus = idleTag
	}
	if plateau {
		item.MergePlateauStatus = failedTag
	} else if !c.SkipPlateau {
		item.MergePlateauStatus = idleTag
	}
	if maxlod {
		item.MergeMaxLODStatus = failedTag
	} else if !c.SkipMaxLOD {
		item.MergeMaxLODStatus = idleTag
	}

	if err := c.UpdateDataItem(ctx, item); err != nil {
		log.Errorfc(ctx, "failed to update data item %s: %v", c.DataItemID, err)
	}
}

func (c *CMSWrapper) GetItem(ctx context.Context, id string, asset bool) (*cms.Item, error) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: get item (skipped): id=%s, asset=%v", id, asset)
		return nil, nil
	}
	return c.CMS.GetItem(ctx, id, asset)
}

func (c *CMSWrapper) UpdateDataItem(ctx context.Context, item *GspatialjpDataItem) error {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: update data item (skipped): item=%s", ppp.Sprint(item))
		return nil
	}

	p := &cms.Item{}
	cms.Marshal(item, p)
	p.ID = c.DataItemID

	if _, err := c.CMS.UpdateItem(ctx, p.ID, p.Fields, p.MetadataFields); err != nil {
		return err
	}

	return nil
}

func (c *CMSWrapper) UploadFile(ctx context.Context, path string) (string, error) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: upload file (skipped): path=%s", path)
		return "", nil
	}

	name := filepath.Base(path)
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}

	defer f.Close()
	return c.Upload(ctx, name, f)
}

func (c *CMSWrapper) Upload(ctx context.Context, name string, body io.Reader) (string, error) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: upload (skipped): name=%s", name)
		return "", nil
	}

	upload, err := c.CMS.CreateAssetUpload(ctx, c.ProjectID, name)
	if err != nil {
		return "", fmt.Errorf("failed to create upload: %w", err)
	}

	log.Debugfc(ctx, "cms: uploading %s to %s", name, upload.URL)

	if err := c.CMS.UploadToAssetUpload(ctx, upload, body); err != nil {
		return "", fmt.Errorf("failed to upload: %w", err)
	}

	log.Debugfc(ctx, "cms: uploaded %s to %s", name, upload.URL)

	a, err := c.CMS.CreateAssetByToken(ctx, c.ProjectID, upload.Token)
	if err != nil {
		return "", fmt.Errorf("failed to create asset: %w", err)
	}

	return a.ID, nil
}

func (c *CMSWrapper) Comment(ctx context.Context, comment string) {
	if c == nil || !c.WetRun {
		log.Debugfc(ctx, "cms: comment (skipped): comment=%s", comment)
		return
	}

	if err := c.CMS.CommentToItem(ctx, c.DataItemID, comment); err != nil {
		log.Errorfc(ctx, "failed to comment to %s: %v", c.DataItemID, err)
	}

	if err := c.CMS.CommentToItem(ctx, c.CityItemID, comment); err != nil {
		log.Errorfc(ctx, "failed to comment to %s: %v", c.CityItemID, err)
	}
}
