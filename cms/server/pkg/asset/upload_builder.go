package asset

import (
	"time"
)

type UploadBuilder struct {
	u *Upload
}

func NewUpload() *UploadBuilder {
	return &UploadBuilder{
		u: &Upload{},
	}
}

func (b *UploadBuilder) UUID(uuid string) *UploadBuilder {
	b.u.uuid = uuid
	return b
}

func (b *UploadBuilder) Project(project ProjectID) *UploadBuilder {
	b.u.project = project
	return b
}

func (b *UploadBuilder) FileName(fileName string) *UploadBuilder {
	b.u.fileName = fileName
	return b
}

func (b *UploadBuilder) ExpiresAt(expiresAt time.Time) *UploadBuilder {
	b.u.expiresAt = expiresAt
	return b
}

func (b *UploadBuilder) ContentLength(contentLength int64) *UploadBuilder {
	b.u.contentLength = contentLength
	return b
}

func (b *UploadBuilder) Build() *Upload {
	return b.u
}
