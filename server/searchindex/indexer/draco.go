//go:build draco

package indexer

import (
	"fmt"

	"github.com/qmuntal/draco-go/gltf/draco"
	"github.com/qmuntal/gltf"
)

func readAttrFromDracoMesh(doc *gltf.Document, primitive *gltf.Primitive) (any, any, error) {
	primitiveExt := primitive.Extensions[draco.ExtensionName].(*draco.PrimitiveExt)
	bv := doc.BufferViews[primitiveExt.BufferView]
	pd, err := draco.UnmarshalMesh(doc, bv)
	if err != nil {
		return nil, nil, fmt.Errorf("error while unmarshalling mesh: %w", err)
	}

	bi, err := pd.ReadAttr(primitive, "_BATCHID", nil)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read batchIds: %w", err)
	}

	pos, err := pd.ReadAttr(primitive, "POSITION", nil)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read positions: %v", err)
	}

	return bi, pos, nil
}
