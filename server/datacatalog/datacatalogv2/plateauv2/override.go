package plateauv2

import (
	"path"
	"strings"

	"github.com/eukarya-inc/reearth-plateauview/server/datacatalog/datacatalogv2/datacatalogutil"
	"github.com/mitchellh/mapstructure"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Description struct {
	Desc     string
	Override Override
}

type Override struct {
	Name         string   `mapstructure:"name"`
	SubName      string   `mapstructure:"subname"`
	Type         string   `mapstructure:"type"`
	TypeEn       string   `mapstructure:"type_en"`
	Type2        string   `mapstructure:"type2"`
	Type2En      string   `mapstructure:"type2_en"`
	Area         string   `mapstructure:"area"`
	ItemName     string   `mapstructure:"item_name"`
	Group        string   `mapstructure:"group"`
	Layer        string   `mapstructure:"layer"`
	Layers       []string `mapstructure:"-"`
	Root         bool     `mapstructure:"root"`
	Order        *int     `mapstructure:"order"`
	DatasetOrder *int     `mapstructure:"dataset_order"`
}

func (o Override) Merge(p Override) Override {
	if o.Name == "" {
		o.Name = p.Name
	}
	if o.SubName == "" {
		o.SubName = p.SubName
	}
	if o.Type == "" {
		o.Type = p.Type
	}
	if o.TypeEn == "" {
		o.TypeEn = p.TypeEn
	}
	if o.Type2 == "" {
		o.Type2 = p.Type2
	}
	if o.Type2En == "" {
		o.Type2En = p.Type2En
	}
	if o.Area == "" {
		o.Area = p.Area
	}
	if o.ItemName == "" {
		o.ItemName = p.ItemName
	}
	if o.Group == "" {
		o.Group = p.Group
	}
	if len(o.Layers) == 0 {
		o.Layers = p.Layers
	}
	if !o.Root {
		o.Root = p.Root
	}
	if o.Order == nil {
		o.Order = util.CloneRef(p.Order)
	}
	if o.DatasetOrder == nil {
		o.DatasetOrder = util.CloneRef(p.DatasetOrder)
	}
	return o
}

func (o Override) LayersIfSupported(ty string) []string {
	if datacatalogutil.IsLayerSupported(ty) {
		return o.Layers
	}
	return nil
}

func (o Override) Item() ItemOverride {
	return ItemOverride{
		Name:   o.ItemName,
		Layers: o.Layers,
		Order:  lo.FromPtr(o.DatasetOrder),
	}
}

type ItemOverride struct {
	Name   string
	Layers []string
	Order  int
}

func (o ItemOverride) Merge(p ItemOverride) ItemOverride {
	if o.Name == "" {
		o.Name = p.Name
	}
	if len(o.Layers) == 0 {
		o.Layers = p.Layers
	}
	return o
}

func (o ItemOverride) LayersIfSupported(ty string) []string {
	if datacatalogutil.IsLayerSupported(ty) {
		return o.Layers
	}
	return nil
}

func OverrideFromTags(tags map[string]string) (o Override) {
	d, _ := mapstructure.NewDecoder(&mapstructure.DecoderConfig{
		WeaklyTypedInput: true,
		Result:           &o,
	})
	_ = d.Decode(tags)
	o.Layers = multipleValues(o.Layer)
	return o
}

func DescriptionFrom(d string) Description {
	desc := datacatalogutil.DescriptionFrom(d)
	return Description{
		Desc:     desc.Desc,
		Override: OverrideFromTags(desc.Tags),
	}
}

func descFromAsset(an AssetName, descs []string, single bool) Description {
	if single && len(descs) > 0 {
		return DescriptionFrom(descs[0])
	}

	if len(descs) == 0 {
		return Description{}
	}

	assetName := an.String()
	fn := strings.TrimSuffix(assetName, path.Ext(assetName))
	for _, desc := range descs {
		b, a, ok := strings.Cut(desc, "\n")
		if ok && strings.Contains(b, fn) {
			return DescriptionFrom(a)
		}
	}

	return Description{}
}

func multipleValues(v string) []string {
	vv := strings.Split(v, ",")
	if len(vv) == 0 || len(vv) == 1 && vv[0] == "" {
		return nil
	}
	return util.Map(vv, strings.TrimSpace)
}
