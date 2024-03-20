package geospatialjpv3

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func (h *handler) Publish(ctx context.Context, cityItem *CityItem) (err error) {
	cms := h.cms

	defer func() {
		if err != nil {
			errmsg := err.Error()
			comment := fmt.Sprintf("G空間情報センターのデータセットの公開に失敗しました: %s", errmsg)

			if err2 := cms.CommentToItem(ctx, cityItem.ID, comment); err2 != nil {
				log.Errorfc(ctx, "geospatialjpv3: failed to comment to city item: %v", err2)
			}

			if err2 := cms.CommentToItem(ctx, cityItem.GeospatialjpData, comment); err2 != nil {
				log.Errorfc(ctx, "geospatialjpv3: failed to comment to data item: %v", err2)
			}
		}
	}()

	log.Infofc(ctx, "geospatialjpv3: publish")

	seed, err := getSeed(ctx, cms, cityItem, h.ckanOrg)
	if err != nil {
		return fmt.Errorf("failed to get seed: %w", err)
	}

	log.Debugfc(ctx, "geospatialjpv3: seed: %s", ppp.Sprint(seed))
	if !seed.Valid() {
		return fmt.Errorf("アップロード可能なアイテムがありません。")
	}

	pkgSeed := PackageSeedFrom(cityItem, seed)

	pkg, pkgCreated, err := h.createOrUpdatePackage(ctx, pkgSeed)
	if err != nil {
		return fmt.Errorf("G空間情報センターでパッケージの検索・作成に失敗しました: %w", err)
	}

	log.Debugfc(ctx, "geospatialjpv3: pkg: %s", ppp.Sprint(pkg))
	resources := []ckan.Resource{}

	if seed.Index != "" {
		log.Debugfc(ctx, "geospatialjpv3: index: %s", seed.Index)
		r, err := h.createOrUpdateResource(ctx, pkg, ResourceInfo{
			Name:        fmt.Sprintf("データ目録（v%d）", seed.V),
			URL:         seed.IndexURL,
			Description: seed.Index,
		})
		if err != nil {
			return fmt.Errorf("failed to create or update resource (index): %w", err)
		}
		resources = append(resources, r)
	}

	if seed.CityGML != "" {
		log.Debugfc(ctx, "geospatialjpv3: citygml: %s", seed.CityGML)
		r, err := h.createOrUpdateResource(ctx, pkg, ResourceInfo{
			Name:        fmt.Sprintf("CityGML（v%d）", seed.V),
			URL:         seed.CityGML,
			Description: seed.CityGMLDescription,
		})
		if err != nil {
			return fmt.Errorf("G空間情報センターでリソースの作成に失敗しました（CityGML）: %w", err)
		}
		resources = append(resources, r)
	}

	if seed.Plateau != "" {
		log.Debugfc(ctx, "geospatialjpv3: plateau: %s", seed.Plateau)
		r, err := h.createOrUpdateResource(ctx, pkg, ResourceInfo{
			Name:        fmt.Sprintf("3D Tiles, MVT（v%d）", seed.V),
			URL:         seed.Plateau,
			Description: seed.PlateauDescription,
		})
		if err != nil {
			return fmt.Errorf("G空間情報センターでリソースの作成に失敗しました（3D Tiles,MVT）: %w", err)
		}
		resources = append(resources, r)
	}

	if seed.Related != "" {
		log.Debugfc(ctx, "geospatialjpv3: related: %s", seed.Related)
		r, err := h.createOrUpdateResource(ctx, pkg, ResourceInfo{
			Name:        fmt.Sprintf(("関連データセット（v%d）"), seed.V),
			URL:         seed.Related,
			Description: seed.RelatedDescription,
		})
		if err != nil {
			return fmt.Errorf("G空間情報センターでリソースの作成に失敗しました（関連データセット）: %w", err)
		}
		resources = append(resources, r)
	}

	if seed.Generics != nil {
		log.Debugfc(ctx, "geospatialjpv3: generics: %s", ppp.Sprint(seed.Generics))
		for _, g := range seed.Generics {
			if g.Name == "" || g.Asset == nil {
				return fmt.Errorf("その他データセットのアセットURLを正しく取得できませんでした。アセットが存在していません。: %v", g)
			}

			url := valueToAssetURL(g.Asset)
			if url == "" {
				return fmt.Errorf("その他データセットのアセットURLを正しく取得できませんでした。アセットが存在していません。: %v", g)
			}

			size := valueToAssetSize(g.Asset)
			if size == 0 {
				return fmt.Errorf("その他データセットのアセットサイズを正しく取得できませんでした。: %v", g)
			}

			r, err := h.createOrUpdateResource(ctx, pkg, ResourceInfo{
				Name:        g.Name,
				URL:         url,
				Description: replaceSize(g.Desc, uint64(size)),
			})
			if err != nil {
				return fmt.Errorf("G空間情報センターでリソースの作成に失敗しました（その他データセット）: %w", err)
			}
			resources = append(resources, r)
		}
	}

	if (seed.CityGML != "" || seed.Plateau != "" || seed.Related != "" || seed.Generics != nil) && shouldReorder(pkg, seed.V) {
		log.Debugfc(ctx, "geospatialjpv3: reorder: %v", resources)
		resourceIDs := lo.Map(resources, func(r ckan.Resource, _ int) string {
			return r.ID
		})

		if err := h.reorderResources(ctx, pkg.ID, resourceIDs); err != nil {
			return fmt.Errorf("G空間情報センターでリソースの並び替えに失敗しました（登録更新は既にできています）: %w", err)
		}
	}

	var comment string
	if pkgCreated {
		comment = fmt.Sprintf("G空間情報センターにデータセットを新規作成しました。 \n%s", h.packageURL(pkg))
	} else {
		comment = fmt.Sprintf("G空間情報センターのデータセットを更新しました。 \n%s", h.packageURL(pkg))
	}

	if err := h.cms.CommentToItem(ctx, seed.GspatialjpDataItemID, comment); err != nil {
		log.Errorfc(ctx, "geospatialjpv3: failed to comment to data item: %v", err)
	}

	if err := h.cms.CommentToItem(ctx, cityItem.ID, comment); err != nil {
		log.Errorfc(ctx, "geospatialjpv3: failed to comment to city item: %v", err)
	}

	return nil
}

func (h *handler) packageURL(pkg *ckan.Package) string {
	return fmt.Sprintf("%s/dataset/%s", strings.TrimSuffix(h.ckanBase, "/"), pkg.Name)
}

func shouldReorder(pkg *ckan.Package, currentVersion int) bool {
	for _, res := range pkg.Resources {
		// if there is already a resource with a higher version, we should not reorder
		v := extractVersionFromResourceName(res.Name)
		if v != nil && *v > currentVersion {
			return false
		}
	}
	return true
}

var reResourceVersion = regexp.MustCompile(`(?:\(|（)v(\d+)(?:\)|）)$`)

func extractVersionFromResourceName(name string) *int {
	m := reResourceVersion.FindStringSubmatch(name)
	if len(m) < 2 {
		return nil
	}

	i, err := strconv.Atoi(m[1])
	if err != nil {
		return nil
	}

	return &i
}

var reSize = regexp.MustCompile(`\${{.*_?SIZE *}}`)

func replaceSize(s string, size uint64) string {
	return reSize.ReplaceAllString(s, humanize.Bytes(size))
}
