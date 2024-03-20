package plateauapi

import (
	"fmt"
	"strconv"
	"strings"
)

type Type string

const (
	TypeDataset     Type = "d"
	TypeDatasetItem Type = "di"
	TypeDatasetType Type = "dt"
	TypePrefecture  Type = "p"
	TypeCity        Type = "c"
	TypeWard        Type = "w"
	TypePlateauSpec Type = "ps"
	TypeCityGML     Type = "cg"
)

func to[T Node](n Node, err error) (t T, _ error) {
	if err != nil {
		return t, err
	}
	u, ok := n.(T)
	if !ok {
		return t, nil
	}
	return u, nil
}

type ID string

func NewID(id string, ty Type) ID {
	idstr := fmt.Sprintf("%s_%s", ty, id)
	return ID(idstr)
}

func (i ID) String() string {
	return string(i)
}

func (i ID) ID() string {
	id, _ := i.Unwrap()
	return id
}

func (i ID) Type() Type {
	_, t := i.Unwrap()
	return t
}

func (i ID) Unwrap() (string, Type) {
	idstr := string(i)
	ty, id, _ := strings.Cut(idstr, "_")
	return id, Type(ty)
}

type AreaCode string

func (a AreaCode) String() string {
	return string(a)
}

func (a AreaCode) Int() int {
	i, _ := strconv.Atoi(string(a))
	return i
}

func (a AreaCode) PrefectureCode() string {
	if len(a) < 2 {
		return ""
	}
	return string(a)[0:2]
}

func (a AreaCode) PrefectureCodeInt() int {
	i, _ := strconv.Atoi(a.PrefectureCode())
	return i
}

func (a AreaCode) IsPrefectureCode() bool {
	return len(a) == 2
}
