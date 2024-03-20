package plateauv2

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDic(t *testing.T) {
	d := Dic{
		"admin": []DicEntry{
			{
				Code:        "11111",
				Description: "A県 A市",
			},
		},
		"fld": []DicEntry{
			{
				Name:        "aaa",
				Admin:       "都道府県",
				Description: "xxx",
			},
			{
				Name:        "aaa",
				Admin:       "国",
				Description: "xxx",
			},
		},
		"htd": []DicEntry{
			{
				Name:        "bbb",
				Description: "xxx",
			},
		},
	}

	assert.Equal(t, "A市", d.WardName("11111"))
	assert.Empty(t, d.WardName("11110"))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "aaa",
		Description: "xxx",
		Admin:       "都道府県",
		Scale:       "",
	}, d.FindByAsset(AssetName{
		Feature:  "fld",
		FldName:  "aaa",
		FldAdmin: "pref",
	}))
	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "aaa",
		Description: "xxx",
		Admin:       "国",
		Scale:       "",
	}, d.FindByAsset(AssetName{
		Feature:  "fld",
		FldName:  "aaa",
		FldAdmin: "natl",
	}))
	assert.Nil(t, d.FindByAsset(AssetName{
		Feature:  "fld",
		FldName:  "bbb",
		FldAdmin: "pref",
	}))

	assert.Equal(t, &DicEntry{
		Code:        "",
		Name:        "bbb",
		Description: "xxx",
		Admin:       "",
		Scale:       "",
	}, d.FindByAsset(AssetName{
		Feature: "htd",
		FldName: "bbb",
	}))
	assert.Nil(t, d.FindByAsset(AssetName{
		Feature:  "htd",
		FldName:  "aaa",
		FldAdmin: "pref",
	}))
}
