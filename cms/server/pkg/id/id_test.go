package id

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAsset_Type(t *testing.T) {

	as := Asset{}
	assert.Equal(t, "asset", as.Type())

	co := Comment{}
	assert.Equal(t, "comment", co.Type())

	ev := Event{}
	assert.Equal(t, "event", ev.Type())

	fi := Field{}
	assert.Equal(t, "field", fi.Type())

	in := Integration{}
	assert.Equal(t, "integration", in.Type())

	it := Item{}
	assert.Equal(t, "item", it.Type())

	mo := Model{}
	assert.Equal(t, "model", mo.Type())

	pr := Project{}
	assert.Equal(t, "project", pr.Type())

	re := Request{}
	assert.Equal(t, "request", re.Type())

	sc := Schema{}
	assert.Equal(t, "schema", sc.Type())

	ta := Task{}
	assert.Equal(t, "task", ta.Type())

	th := Thread{}
	assert.Equal(t, "thread", th.Type())

	us := User{}
	assert.Equal(t, "user", us.Type())

	we := Webhook{}
	assert.Equal(t, "webhook", we.Type())

	wo := Workspace{}
	assert.Equal(t, "workspace", wo.Type())

	r := Resource{}
	assert.Equal(t, "resource", r.Type())
}
