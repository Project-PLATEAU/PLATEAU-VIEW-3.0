package cmsintegrationv2

import (
	"testing"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration/cmsintegrationcommon"
	cms "github.com/reearth/reearth-cms-api/go"
	"github.com/stretchr/testify/assert"
)

var item = Item{
	ID:                 "xxx",
	Specification:      "第2.0版",
	CityGML:            "citygml_assetid",
	ConversionEnabled:  ConversionEnabled,
	PRCS:               "第1系",
	QualityCheckParams: "qcp_assetid",
	DevideODC:          "分割する",
	Bldg:               []string{"bldg_assetid", "bldg_assetid2"},
	Tran:               []string{"tran_assetid"},
	Frn:                []string{"frn_assetid"},
	Veg:                []string{"veg_assetid"},
	Luse:               []string{"luse_assetid"},
	Lsld:               []string{"lsld_assetid"},
	Urf:                []string{"urf_assetid"},
	Fld:                []string{"fld_assetid", "fld_assetid2"},
	Tnm:                []string{"tnm_assetid", "tnm_assetid2"},
	Htd:                []string{"htd_assetid", "htd_assetid2"},
	Ifld:               []string{"ifld_assetid", "ifld_assetid2"},
	All:                "all_assetid",
	Dictionary:         "dictionary_assetid",
	ConversionStatus:   StatusProcessing,
	MaxLOD:             "maxlod_assetid",
	MaxLODStatus:       StatusReady,
	SDKPublication:     "公開する",
}

var cmsitem = cms.Item{
	ID: "xxx",
	Fields: []*cms.Field{
		{Key: "specification", Type: "select", Value: "第2.0版"},
		{Key: "citygml", Type: "asset", Value: "citygml_assetid"},
		{Key: "conversion_enabled", Type: "select", Value: "変換する"},
		{Key: "prcs", Type: "select", Value: "第1系"},
		{Key: "quality_check_params", Type: "asset", Value: "qcp_assetid"},
		{Key: "devide_odc", Type: "select", Value: "分割する"},
		{Key: "bldg", Type: "asset", Value: []string{"bldg_assetid", "bldg_assetid2"}},
		{Key: "tran", Type: "asset", Value: []string{"tran_assetid"}},
		{Key: "frn", Type: "asset", Value: []string{"frn_assetid"}},
		{Key: "veg", Type: "asset", Value: []string{"veg_assetid"}},
		{Key: "luse", Type: "asset", Value: []string{"luse_assetid"}},
		{Key: "lsld", Type: "asset", Value: []string{"lsld_assetid"}},
		{Key: "urf", Type: "asset", Value: []string{"urf_assetid"}},
		{Key: "fld", Type: "asset", Value: []string{"fld_assetid", "fld_assetid2"}},
		{Key: "tnm", Type: "asset", Value: []string{"tnm_assetid", "tnm_assetid2"}},
		{Key: "htd", Type: "asset", Value: []string{"htd_assetid", "htd_assetid2"}},
		{Key: "ifld", Type: "asset", Value: []string{"ifld_assetid", "ifld_assetid2"}},
		{Key: "all", Type: "asset", Value: "all_assetid"},
		{Key: "dictionary", Type: "asset", Value: "dictionary_assetid"},
		{Key: "conversion_status", Type: "select", Value: "実行中"},
		{Key: "max_lod", Type: "asset", Value: "maxlod_assetid"},
		{Key: "max_lod_status", Type: "select", Value: "未実行"},
		{Key: "sdk_publication", Type: "select", Value: "公開する"},
	},
}

var cmsitem2 = cms.Item{
	ID: "xxx",
	Fields: []*cms.Field{
		{Key: "specification", Type: "select", Value: "第2.0版"},
		{Key: "citygml", Type: "asset", Value: "citygml_assetid"},
		{Key: "conversion_enabled", Type: "select", Value: ConversionEnabled},
		{Key: "prcs", Type: "select", Value: cmsintegrationcommon.PRCS("第1系")},
		{Key: "quality_check_params", Type: "asset", Value: "qcp_assetid"},
		{Key: "devide_odc", Type: "select", Value: Separation("分割する")},
		{Key: "bldg", Type: "asset", Value: []string{"bldg_assetid", "bldg_assetid2"}},
		{Key: "tran", Type: "asset", Value: []string{"tran_assetid"}},
		{Key: "frn", Type: "asset", Value: []string{"frn_assetid"}},
		{Key: "veg", Type: "asset", Value: []string{"veg_assetid"}},
		{Key: "luse", Type: "asset", Value: []string{"luse_assetid"}},
		{Key: "lsld", Type: "asset", Value: []string{"lsld_assetid"}},
		{Key: "urf", Type: "asset", Value: []string{"urf_assetid"}},
		{Key: "fld", Type: "asset", Value: []string{"fld_assetid", "fld_assetid2"}},
		{Key: "tnm", Type: "asset", Value: []string{"tnm_assetid", "tnm_assetid2"}},
		{Key: "htd", Type: "asset", Value: []string{"htd_assetid", "htd_assetid2"}},
		{Key: "ifld", Type: "asset", Value: []string{"ifld_assetid", "ifld_assetid2"}},
		{Key: "all", Type: "asset", Value: "all_assetid"},
		{Key: "dictionary", Type: "asset", Value: "dictionary_assetid"},
		{Key: "conversion_status", Type: "select", Value: StatusProcessing},
		{Key: "max_lod", Type: "asset", Value: "maxlod_assetid"},
		{Key: "max_lod_status", Type: "select", Value: StatusReady},
		{Key: "sdk_publication", Type: "select", Value: "公開する"},
	},
}

func TestItem(t *testing.T) {
	assert.Equal(t, item, ItemFrom(cmsitem))
	assert.Equal(t, Item{}, ItemFrom(cms.Item{}))
	assert.Equal(t, cmsitem2.Fields, item.Fields())
	assert.Equal(t, []*cms.Field(nil), Item{}.Fields())
}
