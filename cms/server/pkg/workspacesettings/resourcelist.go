package workspacesettings

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type ResourceList struct {
	resources        []*Resource
	selectedResource *ResourceID
	enabled          *bool
}


func (wr *ResourceList) Resources() []*Resource {
	return slices.Clone(wr.resources)
}

func (wr *ResourceList) SelectedResource() *ResourceID {
	return wr.selectedResource
}

func (wr *ResourceList) Enabled() *bool {
	return wr.enabled
}

func (wr *ResourceList) SetResources(r []*Resource) {
	wr.resources = slices.Clone(r)
}

func (wr *ResourceList) SetSelectedResource(rid *ResourceID) {
	wr.selectedResource = rid.CloneRef()
}

func (wr *ResourceList) SetEnabled(s *bool) {
	wr.enabled = util.CloneRef(s)
}

func NewResourceList(resources []*Resource, selectedResource *ResourceID, enabled *bool) *ResourceList {
	return &ResourceList{
		resources:        slices.Clone(resources),
		selectedResource: util.CloneRef(selectedResource),
		enabled:          util.CloneRef(enabled),
	}
}