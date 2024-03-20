package interactor

import (
	"context"
	"errors"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type Asset struct {
	repos       *repo.Container
	gateways    *gateway.Container
	ignoreEvent bool
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
	}
}

func (i *Asset) FindByID(ctx context.Context, aid id.AssetID, _ *usecase.Operator) (*asset.Asset, error) {
	return i.repos.Asset.FindByID(ctx, aid)
}

func (i *Asset) FindByIDs(ctx context.Context, assets []id.AssetID, _ *usecase.Operator) (asset.List, error) {
	return i.repos.Asset.FindByIDs(ctx, assets)
}

func (i *Asset) FindByProject(ctx context.Context, pid id.ProjectID, filter interfaces.AssetFilter, _ *usecase.Operator) (asset.List, *usecasex.PageInfo, error) {
	return i.repos.Asset.FindByProject(ctx, pid, repo.AssetFilter{
		Sort:       filter.Sort,
		Keyword:    filter.Keyword,
		Pagination: filter.Pagination,
	})
}

func (i *Asset) FindFileByID(ctx context.Context, aid id.AssetID, _ *usecase.Operator) (*asset.File, error) {
	_, err := i.repos.Asset.FindByID(ctx, aid)
	if err != nil {
		return nil, err
	}

	files, err := i.repos.AssetFile.FindByID(ctx, aid)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (i *Asset) GetURL(a *asset.Asset) string {
	return i.gateways.File.GetURL(a)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, op *usecase.Operator) (result *asset.Asset, afile *asset.File, err error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, nil, interfaces.ErrInvalidOperator
	}

	if inp.File == nil && inp.Token == "" {
		return nil, nil, interfaces.ErrFileNotIncluded
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, nil, err
	}

	if !op.IsWritableWorkspace(prj.Workspace()) {
		return nil, nil, interfaces.ErrOperationDenied
	}

	var uuid string
	var file *file.File
	if inp.File != nil {
		var size int64
		file = inp.File
		uuid, size, err = i.gateways.File.UploadAsset(ctx, inp.File)
		if err != nil {
			return nil, nil, err
		}
		file.Size = size
	}

	a, f, err := Run2[*asset.Asset, *asset.File](
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, *asset.File, error) {
			if inp.Token != "" {
				uuid = inp.Token
				u, err := i.repos.AssetUpload.FindByID(ctx, uuid)
				if err != nil {
					return nil, nil, err
				}
				if u.Expired(time.Now()) {
					return nil, nil, rerror.ErrInternalBy(fmt.Errorf("expired upload token: %s", uuid))
				}
				file, err = i.gateways.File.UploadedAsset(ctx, u)
				if err != nil {
					return nil, nil, err
				}
			}
			th, err := thread.New().NewID().Workspace(prj.Workspace()).Build()
			if err != nil {
				return nil, nil, err
			}
			if err := i.repos.Thread.Save(ctx, th); err != nil {
				return nil, nil, err
			}

			needDecompress := false
			if ext := strings.ToLower(path.Ext(file.Name)); ext == ".zip" || ext == ".7z" {
				needDecompress = true
			}

			es := lo.ToPtr(asset.ArchiveExtractionStatusDone)
			if needDecompress {
				if inp.SkipDecompression {
					es = lo.ToPtr(asset.ArchiveExtractionStatusSkipped)
				} else {
					es = lo.ToPtr(asset.ArchiveExtractionStatusPending)
				}
			}

			ab := asset.New().
				NewID().
				Project(inp.ProjectID).
				FileName(path.Base(file.Name)).
				Size(uint64(file.Size)).
				Type(asset.PreviewTypeFromContentType(file.ContentType)).
				UUID(uuid).
				Thread(th.ID()).
				ArchiveExtractionStatus(es)

			if op.AcOperator.User != nil {
				ab.CreatedByUser(*op.AcOperator.User)
			}
			if op.Integration != nil {
				ab.CreatedByIntegration(*op.Integration)
			}

			a, err := ab.Build()
			if err != nil {
				return nil, nil, err
			}

			f := asset.NewFile().
				Name(file.Name).
				Path(file.Name).
				Size(uint64(file.Size)).
				GuessContentType().
				Build()

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, nil, err
			}

			if err := i.repos.AssetFile.Save(ctx, a.ID(), f); err != nil {
				return nil, nil, err
			}

			if needDecompress && !inp.SkipDecompression {
				if err := i.triggerDecompressEvent(ctx, a, f); err != nil {
					return nil, nil, err
				}
			}
			return a, f, nil
		})

	if err != nil {
		return nil, nil, err
	}

	// In AWS, extraction is done in very short time when a zip file is small, so it often results in an error because an asset is not saved yet in MongoDB. So an event should be created after commtting the transaction.
	if err := i.event(ctx, Event{
		Project:   prj,
		Workspace: prj.Workspace(),
		Type:      event.AssetCreate,
		Object:    a,
		Operator:  op.Operator(),
	}); err != nil {
		return nil, nil, err
	}

	return a, f, nil
}

func (i *Asset) DecompressByID(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, aId)
			if err != nil {
				return nil, err
			}

			if !operator.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
			}

			f, err := i.repos.AssetFile.FindByID(ctx, aId)
			if err != nil {
				return nil, err
			}

			if err := i.triggerDecompressEvent(ctx, a, f); err != nil {
				return nil, err
			}

			a.UpdateArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusPending))

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		},
	)
}

type wrappedUploadCursor struct {
	UUID   string
	Cursor string
}

func (c wrappedUploadCursor) String() string {
	return c.UUID + "_" + c.Cursor
}

func parseWrappedUploadCursor(c string) (*wrappedUploadCursor, error) {
	uuid, cursor, found := strings.Cut(c, "_")
	if !found {
		return nil, fmt.Errorf("separator not found")
	}
	return &wrappedUploadCursor{
		UUID:   uuid,
		Cursor: cursor,
	}, nil
}

func wrapUploadCursor(uuid, cursor string) string {
	if cursor == "" {
		return ""
	}
	return wrappedUploadCursor{UUID: uuid, Cursor: cursor}.String()
}

func (i *Asset) CreateUpload(ctx context.Context, inp interfaces.CreateAssetUploadParam, op *usecase.Operator) (*interfaces.AssetUpload, error) {
	if op.AcOperator.User == nil && op.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	var param *gateway.IssueUploadAssetParam
	if inp.Cursor == "" {
		if inp.Filename == "" {
			// TODO: Change to the appropriate error
			return nil, interfaces.ErrFileNotIncluded
		}

		const week = 7 * 24 * time.Hour
		expiresAt := time.Now().Add(1 * week)
		param = &gateway.IssueUploadAssetParam{
			UUID:          uuid.New().String(),
			Filename:      inp.Filename,
			ContentLength: inp.ContentLength,
			ExpiresAt:     expiresAt,
			Cursor:        "",
		}
	} else {
		wrapped, err := parseWrappedUploadCursor(inp.Cursor)
		if err != nil {
			return nil, fmt.Errorf("parse cursor(%s): %w", inp.Cursor, err)
		}
		au, err := i.repos.AssetUpload.FindByID(ctx, wrapped.UUID)
		if err != nil {
			return nil, fmt.Errorf("find asset upload(uuid=%s): %w", wrapped.UUID, err)
		}
		if inp.ProjectID.Compare(au.Project()) != 0 {
			return nil, fmt.Errorf("unmatched project id(in=%s,db=%s)", inp.ProjectID, au.Project())
		}
		param = &gateway.IssueUploadAssetParam{
			UUID:          wrapped.UUID,
			Filename:      au.FileName(),
			ContentLength: au.ContentLength(),
			ExpiresAt:     au.ExpiresAt(),
			Cursor:        wrapped.Cursor,
		}
	}

	prj, err := i.repos.Project.FindByID(ctx, inp.ProjectID)
	if err != nil {
		return nil, err
	}
	if !op.IsWritableWorkspace(prj.Workspace()) {
		return nil, interfaces.ErrOperationDenied
	}

	uploadLink, err := i.gateways.File.IssueUploadAssetLink(ctx, *param)
	if errors.Is(err, gateway.ErrUnsupportedOperation) {
		return nil, rerror.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if inp.Cursor == "" {
		u := asset.NewUpload().
			UUID(param.UUID).
			Project(prj.ID()).
			FileName(param.Filename).
			ExpiresAt(param.ExpiresAt).
			ContentLength(param.ContentLength).
			Build()
		if err := i.repos.AssetUpload.Save(ctx, u); err != nil {
			return nil, err
		}
	}
	return &interfaces.AssetUpload{
		URL:           uploadLink.URL,
		UUID:          param.UUID,
		ContentType:   uploadLink.ContentType,
		ContentLength: uploadLink.ContentLength,
		Next:          wrapUploadCursor(param.UUID, uploadLink.Next),
	}, nil
}

func (i *Asset) triggerDecompressEvent(ctx context.Context, a *asset.Asset, f *asset.File) error {
	if i.gateways.TaskRunner == nil {
		log.Infof("asset: decompression of asset %s was skipped because task runner is not configured", a.ID())
		return nil
	}

	taskPayload := task.DecompressAssetPayload{
		AssetID: a.ID().String(),
		Path:    f.RootPath(a.UUID()),
	}
	if err := i.gateways.TaskRunner.Run(ctx, taskPayload.Payload()); err != nil {
		return err
	}

	a.UpdateArchiveExtractionStatus(lo.ToPtr(asset.ArchiveExtractionStatusInProgress))
	if err := i.repos.Asset.Save(ctx, a); err != nil {
		return err
	}

	return nil
}

func (i *Asset) Update(ctx context.Context, inp interfaces.UpdateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, inp.AssetID)
			if err != nil {
				return nil, err
			}

			if !operator.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
			}

			if inp.PreviewType != nil {
				a.UpdatePreviewType(inp.PreviewType)
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		},
	)
}

func (i *Asset) UpdateFiles(ctx context.Context, aid id.AssetID, s *asset.ArchiveExtractionStatus, op *usecase.Operator) (*asset.Asset, error) {
	if op.AcOperator.User == nil && op.Integration == nil && !op.Machine {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, op, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (*asset.Asset, error) {
			a, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				if err == rerror.ErrNotFound {
					return nil, err
				}
				return nil, fmt.Errorf("failed to find an asset: %v", err)
			}

			if !op.CanUpdate(a) {
				return nil, interfaces.ErrOperationDenied
			}

			if shouldSkipUpdate(a.ArchiveExtractionStatus(), s) {
				return a, nil
			}

			prj, err := i.repos.Project.FindByID(ctx, a.Project())
			if err != nil {
				return nil, fmt.Errorf("failed to find a project: %v", err)
			}

			srcfile, err := i.repos.AssetFile.FindByID(ctx, aid)
			if err != nil {
				return nil, fmt.Errorf("failed to find an asset file: %v", err)
			}

			files, err := i.gateways.File.GetAssetFiles(ctx, a.UUID())
			if err != nil {
				if err == gateway.ErrFileNotFound {
					return nil, err
				}
				return nil, fmt.Errorf("failed to get asset files: %v", err)
			}

			a.UpdateArchiveExtractionStatus(s)
			if previewType := detectPreviewType(files); previewType != nil {
				a.UpdatePreviewType(previewType)
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, fmt.Errorf("failed to save an asset: %v", err)
			}

			srcPath := srcfile.Path()
			assetFiles := lo.FilterMap(files, func(f gateway.FileEntry, _ int) (*asset.File, bool) {
				if srcPath == f.Name {
					return nil, false
				}
				return asset.NewFile().
					Name(path.Base(f.Name)).
					Path(f.Name).
					GuessContentType().
					Build(), true
			})

			if err := i.repos.AssetFile.SaveFlat(ctx, a.ID(), srcfile, assetFiles); err != nil {
				return nil, fmt.Errorf("failed to save asset files: %v", err)
			}

			if err := i.event(ctx, Event{
				Project:   prj,
				Workspace: prj.Workspace(),
				Type:      event.AssetDecompress,
				Object:    a,
				Operator:  op.Operator(),
			}); err != nil {
				return nil, fmt.Errorf("failed to create an event: %v", err)
			}

			return a, nil
		},
	)
}

func detectPreviewType(files []gateway.FileEntry) *asset.PreviewType {
	for _, entry := range files {
		if path.Base(entry.Name) == "tileset.json" {
			return lo.ToPtr(asset.PreviewTypeGeo3dTiles)
		}
		if path.Ext(entry.Name) == ".mvt" {
			return lo.ToPtr(asset.PreviewTypeGeoMvt)
		}
	}
	return nil
}

func shouldSkipUpdate(from, to *asset.ArchiveExtractionStatus) bool {
	if from.String() == asset.ArchiveExtractionStatusDone.String() {
		return true
	}
	return from.String() == to.String()
}

func (i *Asset) Delete(ctx context.Context, aId id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	if operator.AcOperator.User == nil && operator.Integration == nil {
		return aId, interfaces.ErrInvalidOperator
	}

	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func(ctx context.Context) (id.AssetID, error) {
			a, err := i.repos.Asset.FindByID(ctx, aId)
			if err != nil {
				return aId, err
			}

			if !operator.CanUpdate(a) {
				return aId, interfaces.ErrOperationDenied
			}

			uuid := a.UUID()
			filename := a.FileName()
			if uuid != "" && filename != "" {
				if err := i.gateways.File.DeleteAsset(ctx, uuid, filename); err != nil {
					return aId, err
				}
			}

			err = i.repos.Asset.Delete(ctx, aId)
			if err != nil {
				return aId, err
			}

			p, err := i.repos.Project.FindByID(ctx, a.Project())
			if err != nil {
				return aId, err
			}

			if err := i.event(ctx, Event{
				Project:   p,
				Workspace: p.Workspace(),
				Type:      event.AssetDelete,
				Object:    a,
				Operator:  operator.Operator(),
			}); err != nil {
				return aId, err
			}

			return aId, nil
		},
	)
}

func (i *Asset) event(ctx context.Context, e Event) error {
	if i.ignoreEvent {
		return nil
	}

	_, err := createEvent(ctx, i.repos, i.gateways, e)
	return err
}

func (i *Asset) RetryDecompression(ctx context.Context, id string) error {
	return i.gateways.TaskRunner.Retry(ctx, id)
}
