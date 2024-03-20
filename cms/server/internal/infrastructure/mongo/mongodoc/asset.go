package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type AssetDocument struct {
	ID                      string
	Project                 string
	CreatedAt               time.Time
	User                    *string
	Integration             *string
	FileName                string
	Size                    uint64
	PreviewType             string
	UUID                    string
	Thread                  string
	ArchiveExtractionStatus string
	FlatFiles               bool
}

type AssetAndFileDocument struct {
	ID        string
	File      *AssetFileDocument
	FlatFiles bool
}

type AssetFileDocument struct {
	Name        string
	Size        uint64
	ContentType string
	Path        string
	Children    []*AssetFileDocument
}

type AssetConsumer = mongox.SliceFuncConsumer[*AssetDocument, *asset.Asset]
type AssetAndFileConsumer = mongox.SliceConsumer[*AssetAndFileDocument]

func NewAssetConsumer() *AssetConsumer {
	return NewConsumer[*AssetDocument, *asset.Asset]()
}

func NewAsset(a *asset.Asset) (*AssetDocument, string) {
	aid := a.ID().String()

	previewType := ""
	if pt := a.PreviewType(); pt != nil {
		previewType = pt.String()
	}

	archiveExtractionStatus := ""
	if s := a.ArchiveExtractionStatus(); s != nil {
		archiveExtractionStatus = s.String()
	}

	var uid, iid *string
	if a.User() != nil {
		uid = a.User().StringRef()
	}
	if a.Integration() != nil {
		iid = a.Integration().StringRef()
	}

	ad, id := &AssetDocument{
		ID:                      aid,
		Project:                 a.Project().String(),
		CreatedAt:               a.CreatedAt(),
		User:                    uid,
		Integration:             iid,
		FileName:                a.FileName(),
		Size:                    a.Size(),
		PreviewType:             previewType,
		UUID:                    a.UUID(),
		Thread:                  a.Thread().String(),
		ArchiveExtractionStatus: archiveExtractionStatus,
		FlatFiles:               a.FlatFiles(),
	}, aid

	return ad, id
}

func (d *AssetDocument) Model() (*asset.Asset, error) {
	aid, err := id.AssetIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	thid, err := id.ThreadIDFrom(d.Thread)
	if err != nil {
		return nil, err
	}

	ab := asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(d.CreatedAt).
		FileName(d.FileName).
		Size(d.Size).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(d.PreviewType))).
		UUID(d.UUID).
		Thread(thid).
		ArchiveExtractionStatus(asset.ArchiveExtractionStatusFromRef(lo.ToPtr(d.ArchiveExtractionStatus))).
		FlatFiles(d.FlatFiles)

	if d.User != nil {
		uid, err := accountdomain.UserIDFrom(*d.User)
		if err != nil {
			return nil, err
		}
		ab = ab.CreatedByUser(uid)
	}

	if d.Integration != nil {
		iid, err := id.IntegrationIDFrom(*d.Integration)
		if err != nil {
			return nil, err
		}
		ab = ab.CreatedByIntegration(iid)
	}

	return ab.Build()
}

func NewFile(f *asset.File) *AssetFileDocument {
	if f == nil {
		return nil
	}

	c := []*AssetFileDocument{}
	if len(f.Children()) > 0 {
		for _, v := range f.Children() {
			c = append(c, NewFile(v))
		}
	}

	return &AssetFileDocument{
		Name:        f.Name(),
		Size:        f.Size(),
		ContentType: f.ContentType(),
		Path:        f.Path(),
		Children:    c,
	}
}

func (f *AssetFileDocument) Model() *asset.File {
	if f == nil {
		return nil
	}

	var c []*asset.File
	if f.Children != nil && len(f.Children) > 0 {
		for _, v := range f.Children {
			f := v.Model()
			c = append(c, f)
		}
	}

	af := asset.NewFile().
		Name(f.Name).
		Size(f.Size).
		ContentType(f.ContentType).
		Path(f.Path).
		Children(c).
		Build()

	return af
}

type AssetFilesDocument []*AssetFilesPageDocument

func (d AssetFilesDocument) totalFiles() int {
	size := 0
	for _, page := range d {
		size += len(page.Files)
	}
	return size
}

func (d AssetFilesDocument) Model() []*asset.File {
	files := make([]*asset.File, 0, d.totalFiles())
	for _, page := range d {
		files = append(files, lo.Map(page.Files, func(f *AssetFileDocument, _ int) *asset.File {
			return f.Model()
		})...)
	}
	return files
}

type AssetFilesPageDocument struct {
	AssetID string
	Page    int
	Files   []*AssetFileDocument
}

const assetFilesPageSize = 1000

func NewFiles(assetID id.AssetID, fs []*asset.File) AssetFilesDocument {
	pageCount := (len(fs) + assetFilesPageSize - 1) / assetFilesPageSize
	pages := make([]*AssetFilesPageDocument, 0, pageCount)
	for i := 0; i < pageCount; i++ {
		offset := i * assetFilesPageSize
		chunk := fs[offset:]
		if len(chunk) > assetFilesPageSize {
			chunk = chunk[:assetFilesPageSize]
		}
		pages = append(pages, &AssetFilesPageDocument{
			AssetID: assetID.String(),
			Page:    i,
			Files: lo.Map(chunk, func(f *asset.File, _ int) *AssetFileDocument {
				return NewFile(f)
			}),
		})
	}
	return pages
}

type AssetFilesConsumer struct {
	c mongox.SliceConsumer[*AssetFilesPageDocument]
}

func (a *AssetFilesConsumer) Consume(raw bson.Raw) error {
	return a.c.Consume(raw)
}

func (a *AssetFilesConsumer) Result() AssetFilesDocument {
	return a.c.Result
}
