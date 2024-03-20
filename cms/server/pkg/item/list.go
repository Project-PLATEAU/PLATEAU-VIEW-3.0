package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

type List []*Item

func (l List) ItemsByField(fid id.FieldID, value any) List {
	return lo.Filter(l, func(i *Item, _ int) bool {
		return i.HasField(fid, value)
	})
}

func (l List) FilterFields(lids id.FieldIDList) List {
	return lo.Map(l, func(i *Item, _ int) *Item {
		return i.FilterFields(lids)
	})
}

func (l List) Item(iID id.ItemID) (*Item, bool) {
	return lo.Find(l, func(i *Item) bool {
		return i.ID() == iID
	})
}

type VersionedList []Versioned

func (l VersionedList) FilterFields(fields id.FieldIDList) VersionedList {
	return lo.Map(l, func(a Versioned, _ int) Versioned {
		return version.ValueFrom(a, a.Value().FilterFields(fields))
	})
}

func (l VersionedList) Unwrap() List {
	if l == nil {
		return nil
	}
	return version.UnwrapValues(l)
}

func (l VersionedList) Item(iid id.ItemID) Versioned {
	if l == nil {
		return nil
	}
	for _, versioned := range l {
		if versioned.Value().ID() == iid {
			return versioned
		}
	}
	return nil
}
