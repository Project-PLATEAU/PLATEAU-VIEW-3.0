package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

func AreItemsReferenced(i1, i2 *Item, s1, s2 *schema.Schema) (*id.FieldID, *id.FieldID) {
	if i1 == nil || i2 == nil || s1 == nil || s2 == nil {
		return nil, nil
	}

	for _, if1 := range i1.Fields() {
		if if1.Type() != value.TypeReference {
			continue
		}
		for _, if2 := range i2.Fields() {
			if if2.Type() != value.TypeReference {
				continue
			}
			sf1 := s1.Field(if1.FieldID())
			sf2 := s2.Field(if2.FieldID())
			if sf1 == nil || sf2 == nil {
				continue
			}
			fr2, ok := schema.FieldReferenceFromTypeProperty(sf2.TypeProperty())
			if !ok {
				continue
			}
			if fr2.CorrespondingFieldID() != nil && sf1.ID() == *fr2.CorrespondingFieldID() {
				return sf1.ID().Ref(), sf2.ID().Ref()
			}
		}
	}

	return nil, nil
}
