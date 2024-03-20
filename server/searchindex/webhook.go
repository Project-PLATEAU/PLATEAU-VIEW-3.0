package searchindex

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
)

var errSkipped = errors.New("not decompressed")

func WebhookHandler(conf Config) (cmswebhook.Handler, error) {
	c, err := cms.New(conf.CMSBase, conf.CMSToken)
	if err != nil {
		return nil, err
	}
	return webhookHandler(c, conf), nil
}

func webhookHandler(cms cms.Interface, conf Config) cmswebhook.Handler {
	conf.Default()

	return func(req *http.Request, wp *cmswebhook.Payload) error {
		ctx := req.Context()

		if wp.Type != cmswebhook.EventItemCreate && wp.Type != cmswebhook.EventItemUpdate && wp.Type != cmswebhook.EventAssetDecompress {
			log.Debugfc(ctx, "searchindex webhook: invalid event type: %s", wp.Type)
			return nil
		}

		if wp.Type == cmswebhook.EventItemCreate || wp.Type == cmswebhook.EventItemUpdate {
			if wp.ItemData == nil || wp.ItemData.Item == nil || wp.ItemData.Item.ID == "" || wp.ItemData.Model == nil || wp.ItemData.Model.Key == "" {
				log.Debug("searchindex webhook: invalid payload: no item or model")
				return nil
			}

			if wp.ItemData.Model.Key != conf.CMSModel {
				log.Debugfc(ctx, "searchindex webhook: skipped: model key expected=%s actual=%s", conf.CMSModel, wp.ItemData.Model.Key)
				return nil
			}
		}

		if wp.Type == cmswebhook.EventAssetDecompress && wp.AssetData == nil {
			log.Debug("searchindex webhook: invalid payload: no item or model")
			return nil
		}

		wc := newWebhookContext(cms, conf, wp)
		if wc == nil {
			log.Debugfc(ctx, "searchindex webhook: invalid payload: no project id")
			return nil
		}

		item, si, err := wc.GetItem(ctx)
		if err != nil || item.ID == "" {
			if err != errSkipped {
				log.Errorfc(ctx, "searchindex webhook: failed to get item: %v", err)
			}
			return nil
		}

		if item.SearchIndexStatus != "" && item.SearchIndexStatus != StatusReady {
			log.Debugfc(ctx, "searchindex webhook: skipped: %s", item.SearchIndexStatus)
			return nil
		}

		if len(item.Bldg) == 0 {
			log.Debugfc(ctx, "searchindex webhook: skipped: no bldg assets")
			return nil
		}

		if conf.Delegate {
			log.Infofc(ctx, "searchindex webhook: delegate to %s", conf.DelegateURL)
			if err := wc.Delegate(ctx); err != nil {
				log.Errorfc(ctx, "searchindex webhook: error from delegate: %v", err)
				return nil
			}
			log.Info("searchindex webhook: done to delegate")
			return nil
		}

		if err := wc.RemoveAssetFromStorage(ctx, si); err != nil {
			log.Errorfc(ctx, "searchindex webook: cannot update storage item: %w", err)
			return nil
		}

		log.Infofc(ctx, "searchindex webhook: item: %+v", item)

		assetURLs, err := wc.FindAsset(ctx, item, si.ID)
		if err != nil {
			if err == errSkipped {
				log.Infofc(ctx, "searchindex webhook: skipped: all assets are not decompressed or no lod1 bldg")
			} else {
				log.Errorfc(ctx, "searchindex webhook: failed to find asset: %v", err)
			}
			return nil
		}

		if err := wc.CMS.CommentToItem(ctx, item.ID, "検索インデックスの構築を開始しました。"); err != nil {
			log.Errorfc(ctx, "searchindex webhook: failed to comment: %v", err)
		}

		if _, err := wc.CMS.UpdateItem(ctx, item.ID, Item{
			SearchIndexStatus: StatusProcessing,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "searchindex webhook: failed to update item: %v", err)
		}

		log.Infofc(ctx, "searchindex webhook: start processing")

		result, err := wc.BuildIndexes(ctx, assetURLs)
		if err != nil {
			log.Errorfc(ctx, "searchindex webhook: %v", err)

			if _, err := wc.CMS.UpdateItem(ctx, item.ID, Item{
				SearchIndexStatus: StatusError,
			}.Fields(), nil); err != nil {
				log.Errorfc(ctx, "searchindex webhook: failed to update item: %v", err)
			}

			if err := wc.CMS.CommentToItem(ctx, item.ID, fmt.Sprintf("検索インデックスの構築に失敗しました。%v", err)); err != nil {
				log.Errorfc(ctx, "searchindex webhook: failed to comment: %v", err)
			}
			return nil
		}

		if _, err := wc.CMS.UpdateItem(ctx, item.ID, Item{
			SearchIndexStatus: StatusOK,
			SearchIndex:       result,
		}.Fields(), nil); err != nil {
			log.Errorfc(ctx, "searchindex webhook: failed to update item: %v", err)
		}

		if err := wc.CMS.CommentToItem(ctx, item.ID, "検索インデックスの構築が完了しました。"); err != nil {
			log.Errorfc(ctx, "searchindex webhook: failed to comment: %v", err)
		}

		log.Infofc(ctx, "searchindex webhook: done")
		return nil
	}
}

type webhookContext struct {
	CMS         cms.Interface
	wp          *cmswebhook.Payload
	st          *Storage
	model       string
	Pid         string
	SkipIndexer bool
	debug       bool
	delegateURL string
}

func newWebhookContext(cms cms.Interface, conf Config, wp *cmswebhook.Payload) *webhookContext {
	conf.Default()

	pid := wp.ProjectID()
	if pid == "" {
		return nil
	}

	stprj := conf.CMSStorageProject
	if stprj == "" {
		stprj = pid
	}

	return &webhookContext{
		CMS:         cms,
		wp:          wp,
		st:          NewStorage(cms, stprj, conf.CMSStorageModel),
		model:       conf.CMSModel,
		Pid:         pid,
		SkipIndexer: conf.skipIndexer,
		debug:       conf.Debug,
		delegateURL: conf.DelegateURL,
	}
}

func (wc *webhookContext) GetItem(ctx context.Context) (item Item, si StorageItem, err error) {
	var witem *cms.Item

	if wc.wp.Type == cmswebhook.EventAssetDecompress {
		// when asset was decompressed, find data from storage and get the item
		if wc.wp.AssetData == nil || wc.wp.AssetData.ID == "" {
			log.Debugfc(ctx, "searchindex webhook: invalid event data: %+v", wc.wp.Data)
			return
		}

		aid := wc.wp.AssetData.ID
		if si, err = wc.st.FindByAsset(ctx, aid); err != nil {
			if errors.Is(err, cms.ErrNotFound) {
				log.Debugfc(ctx, "searchindex webhook: skipped: asset not registered")
				err = errSkipped
				return
			}
			err = fmt.Errorf("cannot get data from storage: %v", err)
			return
		} else if si.ID == "" {
			log.Debugfc(ctx, "searchindex webhook: skipped: asset not registered")
			err = errSkipped
			return
		}

		if witem, err = wc.CMS.GetItem(ctx, si.Item, false); err != nil {
			err = fmt.Errorf("cannot get item %s: %v", si.Item, err)
			return
		}
	} else {
		// when item was created or updated
		if wc.wp.ItemData == nil || wc.wp.ItemData.Item == nil || wc.wp.ItemData.Model == nil {
			log.Debugfc(ctx, "searchindex webhook: invalid event data: %+v", wc.wp.Data)
			return
		}

		if wc.wp.ItemData.Model.Key != wc.model {
			log.Debugfc(ctx, "searchindex webhook: invalid model id: %s, key: %s", wc.wp.ItemData.Item.ModelID, wc.wp.ItemData.Model.Key)
			return
		}

		// check stroage
		si, err = wc.st.FindByItem(ctx, wc.wp.ItemData.Item.ID)
		if err != nil && !errors.Is(err, cms.ErrNotFound) {
			err = fmt.Errorf("cannot get data from storage: %v", err)
			return
		} else {
			err = nil
		}

		witem = wc.wp.ItemData.Item
	}

	if witem == nil {
		return
	}

	item = ItemFrom(*witem)
	return
}

func (wc *webhookContext) Delegate(ctx context.Context) error {
	if wc.delegateURL == "" {
		return errors.New("delegate url is empty")
	}
	if wc.wp.Body == nil {
		return errors.New("webhook payload body is nil")
	}

	req, err := http.NewRequestWithContext(ctx, "POST", wc.delegateURL, bytes.NewReader(wc.wp.Body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	if wc.wp.Sig != "" {
		req.Header.Set(cmswebhook.SignatureHeader, wc.wp.Sig)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	defer func() {
		_ = res.Body.Close()
	}()

	if res.StatusCode >= 300 {
		return fmt.Errorf("status code is %d", res.StatusCode)
	}

	return nil
}

func (wc *webhookContext) RemoveAssetFromStorage(ctx context.Context, si StorageItem) error {
	if wc.wp.AssetData == nil || wc.wp.AssetData.ID == "" {
		return nil
	}
	if err := wc.st.Set(ctx, si.RemoveAsset(wc.wp.AssetData.ID)); err != nil {
		return err
	}
	return nil
}

func (wc *webhookContext) FindAsset(ctx context.Context, item Item, siid string) ([]*url.URL, error) {
	var assetNotDecompressed []string
	var urls []*url.URL
	for _, aid := range item.Bldg {
		a, err := wc.CMS.Asset(ctx, aid)
		if err != nil {
			return nil, fmt.Errorf("failed to get an asset (%s): %s", aid, err)
		}

		u, _ := url.Parse(a.URL)
		if u == nil || path.Ext(u.Path) != ".zip" {
			continue
		}

		name := pathFileName(u.Path)
		if !strings.Contains(name, "_lod1") {
			continue
		}

		if a.ArchiveExtractionStatus != cms.AssetArchiveExtractionStatusDone {
			// register asset ID and item ID to storage
			assetNotDecompressed = append(assetNotDecompressed, aid)
			continue
		}

		urls = append(urls, u)
	}

	if len(assetNotDecompressed) > 0 {
		if err := wc.st.Set(ctx, StorageItem{
			ID:    siid,
			Item:  item.ID,
			Asset: assetNotDecompressed,
		}); err != nil {
			return nil, fmt.Errorf("failed to save to storage: %v", err)
		}

		return nil, errSkipped
	}

	if len(urls) == 0 {
		return nil, errSkipped
	}

	return urls, nil
}

func (wc *webhookContext) BuildIndexes(ctx context.Context, u []*url.URL) ([]string, error) {
	var results []string
	for _, u := range u {
		name := pathFileName(u.Path)
		if name == "" {
			continue
		}

		log.Infofc(ctx, "searchindex webhook: start processing for %s", name)
		if wc.SkipIndexer {
			// for unit tests
			results = append(results, name+"_asset")
			continue
		}

		// build indexes
		indexer := NewZipIndexer(wc.CMS, wc.Pid, u, wc.debug)
		aid, err := indexer.BuildIndex(ctx, name)
		if err != nil {
			return nil, fmt.Errorf("「%s」の処理中にエラーが発生しました。%w", name, err)
		}
		results = append(results, aid)
	}
	return results, nil
}

func pathFileName(p string) string {
	return strings.TrimSuffix(path.Base(p), path.Ext(p))
}
