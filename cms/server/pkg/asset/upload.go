package asset

import (
	"time"
)

type Upload struct {
	uuid          string
	project       ProjectID
	fileName      string
	expiresAt     time.Time
	contentLength int64
}

func (u *Upload) UUID() string {
	return u.uuid
}

func (u *Upload) Project() ProjectID {
	return u.project
}

func (u *Upload) FileName() string {
	return u.fileName
}

func (u *Upload) ExpiresAt() time.Time {
	return u.expiresAt
}

func (u *Upload) Expired(t time.Time) bool {
	return t.After(u.expiresAt)
}

func (u *Upload) ContentLength() int64 {
	return u.contentLength
}
