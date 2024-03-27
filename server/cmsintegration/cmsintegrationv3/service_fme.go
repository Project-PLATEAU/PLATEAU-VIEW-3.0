package cmsintegrationv3

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"

	"github.com/k0kubun/pp/v3"
	"github.com/oklog/ulid/v2"
	"github.com/reearth/reearth-cms-api/go/cmswebhook"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
	"github.com/spkg/bom"
	"golang.org/x/exp/slices"
)

var ppp *pp.PrettyPrinter

func init() {
	ppp = pp.New()
	ppp.SetColoringEnabled(false)
}

var generateID = func() string {
	return strings.ToLower(ulid.Make().String())
}

func sendRequestToFME(ctx context.Context, s *Services, conf *Config, w *cmswebhook.Payload) error {
	// if event type is "item.create" and payload is metadata, skip it
	if w.Type == cmswebhook.EventItemCreate && (w.ItemData.Item.OriginalItemID != nil || w.ItemData.Item.IsMetadata) {
		return nil
	}

	mainItem, err := s.GetMainItemWithMetadata(ctx, w.ItemData.Item)
	if err != nil {
		return err
	}

	item := FeatureItemFrom(mainItem)

	featureType := strings.TrimPrefix(w.ItemData.Model.Key, modelPrefix)
	if featureType == sampleModel && item.FeatureType != "" {
		if ft := getLastBracketContent(item.FeatureType); ft != "" {
			featureType = ft
			log.Debugfc(ctx, "cmsintegrationv3: sample item: feature type is %s", ft)
		}
	}

	if !slices.Contains(featureTypes, featureType) {
		log.Debugfc(ctx, "cmsintegrationv3: not feature item: %s", featureType)
		return nil
	}

	skipQC, skipConv := isQCAndConvSkipped(item, featureType)
	if skipQC && skipConv {
		log.Debugfc(ctx, "cmsintegrationv3: skip qc and convert")
		return nil
	}

	if item.CityGML == "" || item.City == "" {
		log.Debugfc(ctx, "cmsintegrationv3: no city or no citygml")
		return nil
	}

	ty := fmeTypeQcConv
	if skipQC {
		ty = fmeTypeConv
	} else if skipConv {
		ty = fmeTypeQC
	}

	log.Debugfc(ctx, "cmsintegrationv3: sendRequestToFME: itemID=%s featureType=%s", mainItem.ID, featureType)
	log.Debugfc(ctx, "cmsintegrationv3: sendRequestToFME: raw item: %s", ppp.Sprint(mainItem))
	log.Debugfc(ctx, "cmsintegrationv3: sendRequestToFME: item: %s", ppp.Sprint(item))

	// update convertion status
	err = s.UpdateFeatureItemStatus(ctx, mainItem.ID, ty, ConvertionStatusRunning)
	if err != nil {
		return fmt.Errorf("failed to update item: %w", err)
	}

	// get CityGML asset
	cityGMLAsset, err := s.CMS.Asset(ctx, item.CityGML)
	if err != nil {
		_ = failToConvert(ctx, s, mainItem.ID, ty, "CityGMLが見つかりません。")
		return fmt.Errorf("failed to get citygml asset: %w", err)
	}

	// get city item
	cityItemRaw, err := s.CMS.GetItem(ctx, item.City, false)
	if err != nil {
		_ = failToConvert(ctx, s, mainItem.ID, ty, "都市アイテムが見つかりません。")
		return fmt.Errorf("failed to get city item: %w", err)
	}

	cityItem := CityItemFrom(cityItemRaw)
	if cityItem.CodeLists == "" {
		_ = failToConvert(ctx, s, mainItem.ID, ty, "コードリストが都市アイテムに登録されていないため品質検査・変換を開始できません。")
		return fmt.Errorf("city item has no codelist")
	}

	// get codelist asset
	codelistAsset, err := s.CMS.Asset(ctx, cityItem.CodeLists)
	if err != nil {
		_ = failToConvert(ctx, s, mainItem.ID, ty, "コードリストが見つかりません。")
		return fmt.Errorf("failed to get codelist asset: %w", err)
	}

	// request to fme
	err = s.FME.Request(ctx, fmeRequest{
		ID: fmeID{
			ItemID:      mainItem.ID,
			ProjectID:   w.ProjectID(),
			FeatureType: featureType,
			Type:        string(ty),
		}.String(conf.Secret),
		Target:    cityGMLAsset.URL,
		PRCS:      cityItem.PRCS.EPSGCode(),
		Codelists: codelistAsset.URL,
		ResultURL: resultURL(conf),
		Type:      ty,
	})
	if err != nil {
		_ = failToConvert(ctx, s, mainItem.ID, ty, "FMEへのリクエストに失敗しました。%v", err)
		return fmt.Errorf("failed to request to fme: %w", err)
	}

	// post a comment to the item
	err = s.CMS.CommentToItem(ctx, mainItem.ID, fmt.Sprintf("%sを開始しました。", ty.Title()))
	if err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	log.Infofc(ctx, "cmsintegrationv3: sendRequestToFME: success")
	return nil
}

func receiveResultFromFME(ctx context.Context, s *Services, conf *Config, f fmeResult) error {
	id := f.ParseID(conf.Secret)
	if id.ItemID == "" {
		return fmt.Errorf("invalid id: %s", f.ID)
	}

	log.Infofc(ctx, "cmsintegrationv3: receiveResultFromFME: itemID=%s featureType=%s type=%s", id.ItemID, id.FeatureType, id.Type)

	logmsg := f.Message
	if f.LogURL != "" {
		if logmsg != "" {
			logmsg += " "
		}
		logmsg += "ログ： " + f.LogURL
	}

	// notify
	if f.Type == "notify" {
		log.Debugfc(ctx, "cmsintegrationv3: notify: %s", logmsg)

		if err := s.CMS.CommentToItem(ctx, id.ItemID, logmsg); err != nil {
			return fmt.Errorf("failed to comment: %w", err)
		}

		// upload qc result
		if f.Results != nil {
			if qcResult, ok := f.Results["_qc_result"]; ok {
				if qcResultStr, ok := qcResult.(string); ok {
					log.Debugfc(ctx, "cmsintegrationv3: upload qc result: %s", qcResultStr)
					var err error
					qcResultAsset, err := s.UploadAsset(ctx, id.ProjectID, qcResultStr)
					if err != nil {
						return fmt.Errorf("failed to upload maxlod: %w", err)
					}

					item := (&FeatureItem{
						QCStatus: tagFrom(ConvertionStatusSuccess),
						QCResult: qcResultAsset,
					}).CMSItem()

					_, err = s.CMS.UpdateItem(ctx, id.ItemID, item.Fields, item.MetadataFields)
					if err != nil {
						j1, _ := json.Marshal(item.Fields)
						j2, _ := json.Marshal(item.MetadataFields)
						log.Debugfc(ctx, "cmsintegrationv3: item update for %s: %s, %s", id.ItemID, j1, j2)
						log.Errorfc(ctx, "cmsintegrationv3: failed to update item: %v", err)
						return fmt.Errorf("failed to update item: %w", err)
					}
				}
			}
		}

		return nil
	}

	// handle error
	if f.Status == "error" {
		log.Warnfc(ctx, "cmsintegrationv3: failed to convert: %v", f.LogURL)
		_ = failToConvert(ctx, s, id.ItemID, fmeRequestType(id.Type), "%sに失敗しました。%s", fmeRequestType(id.Type).Title(), logmsg)
		return nil
	}

	// get newitem
	item, err := s.CMS.GetItem(ctx, id.ItemID, false)
	if err != nil {
		log.Errorfc(ctx, "cmsintegrationv3: failed to get item: %v", err)
		return fmt.Errorf("failed to get item: %w", err)
	}

	baseFeatureItem := FeatureItemFrom(item)

	// get url from the result
	assets := f.GetResultURLs(id.FeatureType)

	// upload assets
	log.Infofc(ctx, "cmsintegrationv3: upload assets: %v", assets.Data)
	var dataAssets []string
	dataAssetMap := map[string][]string{}
	if len(assets.DataMap) > 0 {
		dataAssets = make([]string, 0, len(assets.DataMap))
		for _, key := range assets.Keys {
			urls := assets.DataMap[key]
			for _, url := range urls {
				aid, err := s.UploadAsset(ctx, id.ProjectID, url)
				if err != nil {
					log.Errorfc(ctx, "cmsintegrationv3: failed to upload asset (%s): %v", url, err)
					return nil
				}
				dataAssets = append(dataAssets, aid)
				dataAssetMap[key] = append(dataAssetMap[key], aid)
			}
		}
	}
	sort.Strings(dataAssets)

	// read dic
	var dic string
	if assets.Dic != "" {
		var err error
		log.Debugfc(ctx, "cmsintegrationv3: read and upload dic: %s", assets.Dic)
		dic, err = readDic(ctx, assets.Dic)
		if err != nil {
			log.Errorfc(ctx, "cmsintegrationv3: failed to read dic: %v", err)
			return nil
		}
	}

	// upload maxlod
	var maxlodAssetID string
	if assets.MaxLOD != "" {
		log.Debugfc(ctx, "cmsintegrationv3: upload maxlod: %s", assets.MaxLOD)
		var err error
		maxlodAssetID, err = s.UploadAsset(ctx, id.ProjectID, assets.MaxLOD)
		if err != nil {
			return fmt.Errorf("failed to upload maxlod: %w", err)
		}
	}

	// upload qc result
	var qcResult string
	if assets.QCResult != "" {
		log.Debugfc(ctx, "cmsintegrationv3: upload qc result: %s", assets.QCResult)
		var err error
		qcResult, err = s.UploadAsset(ctx, id.ProjectID, assets.QCResult)
		if err != nil {
			return fmt.Errorf("failed to upload qc result: %w", err)
		}
	}

	// update item
	convStatus := ConvertionStatus("")
	qcStatus := ConvertionStatus("")

	if id.Type == string(fmeTypeConv) {
		convStatus = ConvertionStatusSuccess
	} else if id.Type == string(fmeTypeQC) {
		qcStatus = ConvertionStatusSuccess
	} else if id.Type == string(fmeTypeQcConv) {
		convStatus = ConvertionStatusSuccess
		qcStatus = ConvertionStatusSuccess
	}

	// items
	var data []string
	var items []FeatureItemDatum
	if slices.Contains(featureTypesWithItems, id.FeatureType) {
		for _, k := range assets.Keys {
			assets := dataAssetMap[k]
			i, ok := lo.Find(baseFeatureItem.Items, func(i FeatureItemDatum) bool {
				return i.Key == k
			})

			var id string
			if ok {
				id = i.ID
			} else {
				id = generateID()
			}

			items = append(items, FeatureItemDatum{
				ID:   id,
				Data: assets,
				Key:  k,
			})
		}
	} else {
		data = dataAssets
	}

	newitem := (&FeatureItem{
		Data:             data,
		Items:            items,
		Dic:              dic,
		MaxLOD:           maxlodAssetID,
		ConvertionStatus: tagFrom(convStatus),
		QCStatus:         tagFrom(qcStatus),
		QCResult:         qcResult,
	}).CMSItem()

	log.Debugfc(ctx, "cmsintegrationv3: update item: %s", ppp.Sprint(newitem))

	_, err = s.CMS.UpdateItem(ctx, id.ItemID, newitem.Fields, newitem.MetadataFields)
	if err != nil {
		j1, _ := json.Marshal(newitem.Fields)
		j2, _ := json.Marshal(newitem.MetadataFields)
		log.Debugfc(ctx, "cmsintegrationv3: item update for %s: %s, %s", id.ItemID, j1, j2)
		log.Errorfc(ctx, "cmsintegrationv3: failed to update item: %v", err)
		return fmt.Errorf("failed to update item: %w", err)
	}

	// comment to the item
	err = s.CMS.CommentToItem(ctx, id.ItemID, fmt.Sprintf("%sが完了しました。%s", fmeRequestType(id.Type).Title(), logmsg))
	if err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	log.Infofc(ctx, "cmsintegrationv3: receiveResultFromFME: success")
	return nil
}

func failToConvert(ctx context.Context, s *Services, itemID string, convType fmeRequestType, message string, args ...any) error {
	if err := s.UpdateFeatureItemStatus(ctx, itemID, convType, ConvertionStatusError); err != nil {
		return fmt.Errorf("failed to update item: %w", err)
	}

	if err := s.CMS.CommentToItem(ctx, itemID, fmt.Sprintf(message, args...)); err != nil {
		return fmt.Errorf("failed to add comment: %w", err)
	}

	return nil
}

func readDic(ctx context.Context, u string) (string, error) {
	if u == "" {
		return "", nil
	}

	req, err := http.NewRequestWithContext(ctx, "GET", u, nil)
	if err != nil {
		return "", err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer func() {
		_ = res.Body.Close()
	}()
	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("status code is %d", err)
	}
	s, err := io.ReadAll(bom.NewReader(res.Body))
	if err != nil {
		return "", err
	}
	return string(s), nil
}

const (
	skip = "スキップ"
	qc   = "品質検査"
	conv = "変換"
)

var noConvFeatureTypes = []string{"dem"}

func isQCAndConvSkipped(item *FeatureItem, featureType string) (skipQC bool, skipConv bool) {
	if tagIsNot(item.QCStatus, ConvertionStatusNotStarted) {
		skipQC = true
	}
	if tagIsNot(item.ConvertionStatus, ConvertionStatusNotStarted) ||
		slices.Contains(noConvFeatureTypes, featureType) {
		skipConv = true
	}

	if skipQC && skipConv {
		return true, true
	}

	if item.SkipQCConv != nil {
		if n := item.SkipQCConv.Name; strings.Contains(n, skip) {
			qc := strings.Contains(n, qc)
			conv := strings.Contains(n, conv)
			if !qc && !conv {
				skipQC = true
				skipConv = true
			} else {
				skipQC = skipQC || qc
				skipConv = skipConv || conv
			}
		}
	}

	skipQC = skipQC || item.SkipQC
	skipConv = skipConv || item.SkipConvert
	return
}
