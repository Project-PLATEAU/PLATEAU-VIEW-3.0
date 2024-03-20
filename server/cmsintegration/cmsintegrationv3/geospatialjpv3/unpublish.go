package geospatialjpv3

import (
	"context"
	"fmt"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/ckan"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func (h *handler) Unpublish(ctx context.Context, cityItem *CityItem) (err error) {
	var comment string
	defer func() {
		if err != nil {
			errmsg := err.Error()
			comment = fmt.Sprintf("G空間情報センターのデータセットの非公開化に失敗しました: %s", errmsg)
		}

		if comment != "" {
			if err2 := h.cms.CommentToItem(ctx, cityItem.ID, comment); err2 != nil {
				log.Errorfc(ctx, "geospatialjpv3: failed to comment to city item: %v", err2)
			}

			if err2 := h.cms.CommentToItem(ctx, cityItem.GeospatialjpData, comment); err2 != nil {
				log.Errorfc(ctx, "geospatialjpv3: failed to comment to data item: %v", err2)
			}
		}
	}()

	log.Infofc(ctx, "geospatialjpv3: unpublish")

	if !cityItem.GeospatialjpPrepare {
		return fmt.Errorf("この都市はまだG空間情報センターへの公開準備ができていないようです。データを揃えて「公開準備」をONにしてください。")
	}

	name := PackageNameFrom(cityItem)
	pkg, pkgName, err := h.findPackage(ctx, name)
	if err != nil {
		return fmt.Errorf("failed to find package: %w", err)
	}

	if pkgName == "" || pkg == nil {
		return nil
	}
	if pkg.Private != nil && *pkg.Private {
		comment = fmt.Sprintf("G空間情報センターのデータセットはすでに非公開です。 \n%s", h.packageURL(pkg))
		return nil
	}

	if _, err := h.ckan.PatchPackage(ctx, ckan.Package{
		ID:      pkg.ID,
		Private: lo.ToPtr(true),
	}); err != nil {
		return fmt.Errorf("failed to delete package: %w", err)
	}

	comment = fmt.Sprintf("G空間情報センターのデータセットを非公開にしました。 \n%s", h.packageURL(pkg))
	return nil
}
