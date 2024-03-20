package preparegspatialjp

import (
	"archive/zip"
	"bytes"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestZip2zip(t *testing.T) {
	// prepare zips
	srcBuf := bytes.NewBuffer(nil)

	srcWriter := zip.NewWriter(srcBuf)
	f, _ := srcWriter.Create("test1")
	_, _ = f.Write([]byte("test1"))

	_, _ = srcWriter.Create("test/")

	f, _ = srcWriter.Create("test/test2")
	_, _ = f.Write([]byte("test2"))

	f, _ = srcWriter.Create("test/test3")
	_, _ = f.Write([]byte("test3"))
	_ = srcWriter.Close()

	// run
	destBuf := bytes.NewBuffer(nil)
	srcReader, _ := zip.NewReader(bytes.NewReader(srcBuf.Bytes()), int64(srcBuf.Len()))
	destWriter := zip.NewWriter(destBuf)

	zz := NewZip2zip(destWriter)
	err := zz.Run(srcReader, func(f *zip.File) (string, error) {
		name := f.Name
		if name == "test/test2" {
			return "test2/test3/test4", nil
		}
		if name == "test/test3" {
			return "", nil
		}
		return name, nil
	})
	_ = zz.Close()

	// assert
	assert.NoError(t, err)

	destReader, _ := zip.NewReader(bytes.NewReader(destBuf.Bytes()), int64(destBuf.Len()))

	names := lo.Map(destReader.File, func(f *zip.File, _ int) string {
		return f.Name
	})
	assert.Equal(t, []string{
		"test1",
		"test/",
		"test2/",
		"test2/test3/",
		"test2/test3/test4",
	}, names)

	zf, _ := destReader.Open("test1")
	buf := bytes.NewBuffer(nil)
	_, _ = buf.ReadFrom(zf)
	zf.Close()
	assert.Equal(t, "test1", buf.String())

	zf, _ = destReader.Open("test2/test3/test4")
	buf = bytes.NewBuffer(nil)
	_, _ = buf.ReadFrom(zf)
	zf.Close()
	assert.Equal(t, "test2", buf.String())
}
