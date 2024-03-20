package value

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
)

const TypeAsset Type = "asset"

type propertyAsset struct{}

type Asset = id.AssetID

func (p *propertyAsset) ToValue(i any) (any, bool) {
	if i == "" {
		return nil, true
	}
	if v, ok := i.(string); ok {
		if u, err := id.AssetIDFrom(v); err == nil {
			return u, true
		}
	} else if v, ok := i.(id.AssetID); ok {
		return v, true
	} else if v, ok := i.(*string); ok && v != nil {
		return p.ToValue(*v)
	} else if v, ok := i.(*id.AssetID); ok && v != nil {
		return p.ToValue(*v)
	}
	return nil, false
}

func (*propertyAsset) ToInterface(v any) (any, bool) {
	return v.(Asset).String(), true
}

func (*propertyAsset) Validate(i any) bool {
	_, ok := i.(Asset)
	return ok
}

func (*propertyAsset) Equal(v, w any) bool {
	var vv, ww Asset
	if v != nil {
		vv = v.(Asset)
	}
	if w != nil {
		ww = w.(Asset)
	}
	return vv == ww
}

func (*propertyAsset) IsEmpty(v any) bool {
	return v.(Asset).IsEmpty()
}

func (v *Value) ValueAsset() (vv Asset, ok bool) {
	if v == nil {
		return
	}
	vv, ok = v.v.(Asset)
	return
}

func (m *Multiple) ValuesAsset() (vv []Asset, ok bool) {
	if m == nil {
		return nil, false
	}
	vv = lo.FilterMap(m.v, func(v *Value, _ int) (Asset, bool) {
		return v.ValueAsset()
	})
	if len(vv) != len(m.v) {
		return nil, false
	}
	return vv, true
}
