package plateauv2

import (
	"strings"

	"github.com/samber/lo"
)

type Dic map[string][]DicEntry

type DicEntry struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Admin       string `json:"admin"`
	Scale       string `json:"scale"`
}

func (d Dic) WardName(code string) string {
	e := d.findByCode("admin", code)
	if e == nil {
		return ""
	}

	_, b, ok := strings.Cut(e.Description, " ")
	if ok {
		return b
	}

	return e.Description
}

var fldAdminJa = map[string]string{
	"natl": "国",
	"pref": "都道府県",
}

func (d Dic) FindByAsset(an AssetName) *DicEntry {
	if an.Feature == "fld" {
		if catja := fldAdminJa[an.FldAdmin]; catja != "" {
			return d.findByNameAndAdmin(an.Feature, an.FldNameAndScale(), catja)
		}
	}
	return d.findByName(an.Feature, an.FldName)
}

func (d Dic) findByName(key, name string) *DicEntry {
	entries, ok := d[key]
	if !ok {
		return nil
	}

	e, ok := lo.Find(entries, func(e DicEntry) bool {
		return e.Name == name
	})
	if !ok {
		return nil
	}
	return &e
}

func (d Dic) findByNameAndAdmin(key, name, admin string) *DicEntry {
	entries, ok := d[key]
	if !ok {
		return nil
	}

	e, ok := lo.Find(entries, func(e DicEntry) bool {
		return e.Name == name && e.Admin == admin
	})
	if !ok {
		return nil
	}
	return &e
}

func (d Dic) findByCode(key, code string) *DicEntry {
	entries, ok := d[key]
	if !ok {
		return nil
	}

	e, ok := lo.Find(entries, func(e DicEntry) bool {
		return e.Code == code
	})
	if !ok {
		return nil
	}
	return &e
}
