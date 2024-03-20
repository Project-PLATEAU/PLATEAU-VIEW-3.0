//go:build !draco

package indexer

import (
	"errors"

	"github.com/qmuntal/gltf"
)

func readAttrFromDracoMesh(doc *gltf.Document, primitive *gltf.Primitive) (any, any, error) {
	return nil, nil, errors.New("draco is not supported")
}
