package plateauv2

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestDescFromAsset(t *testing.T) {
	a := AssetName{
		CityCode:       "000000",
		CityEn:         "hoge-shi",
		Year:           "2020",
		Format:         "mvt",
		Op:             "op",
		Feature:        "urf",
		UrfFeatureType: "urf",
	}

	desc := descFromAsset(a, []string{
		"bbb.zip\n\nBBB",
		"000000_hoge-shi_2020_mvt_op_urf_urf.zip\n\nAAA",
		"CCC",
	}, false)
	assert.Equal(t, Description{
		Desc: "AAA",
	}, desc)

	desc = descFromAsset(a, []string{
		"bbb.zip\n\nBBB",
		"aaa.zip\n\nAAA",
		"CCC",
	}, false)
	assert.Equal(t, Description{}, desc)

	desc = descFromAsset(a, []string{
		"CCC",
	}, false)
	assert.Equal(t, Description{}, desc)

	desc = descFromAsset(a, []string{
		"000000_hoge-shi_2020_mvt_op_urf_urf.zip\n@name: CCC\n\naaaa\nbbbb",
	}, false)
	assert.Equal(t, Description{
		Override: Override{
			Name: "CCC",
		},
		Desc: "aaaa\nbbbb",
	}, desc)

	desc = descFromAsset(a, []string{
		"000000_hoge-shi_2020_mvt_op_urf_urf.zip\n\n@name: CCC\naaaa\nbbbb",
	}, false)
	assert.Equal(t, Description{
		Override: Override{
			Name: "CCC",
		},
		Desc: "aaaa\nbbbb",
	}, desc)

	desc = descFromAsset(a, []string{
		"000000_hoge-shi_2020_mvt_op_urf_urf.zip\n@name:CCC\n@group:aaaa\n@layer: ccc, ddd\n@root: true\n@dataset_order: -1",
	}, false)
	assert.Equal(t, Description{
		Override: Override{
			Name:         "CCC",
			Group:        "aaaa",
			Layer:        "ccc, ddd",
			Layers:       []string{"ccc", "ddd"},
			Root:         true,
			DatasetOrder: lo.ToPtr(-1),
		},
	}, desc)

	desc = descFromAsset(a, []string{
		"@name: bbb\naaa",
		"@name: aaa\nbbb",
	}, true)
	assert.Equal(t, Description{
		Desc: "aaa",
		Override: Override{
			Name: "bbb",
		},
	}, desc)
}
