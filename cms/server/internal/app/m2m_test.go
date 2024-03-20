package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/aws"
	"github.com/stretchr/testify/assert"
)

func TestM2MAuthMiddleware(t *testing.T) {
	t.Run("aws", func(t *testing.T) {
		m := M2MAuthMiddleware(&Config{
			AWSTask: aws.TaskConfig{
				NotifyToken: "TOKEN",
			},
		})

		e := echo.New()
		r := httptest.NewRequest(http.MethodGet, "/?token=TOKEN", nil)
		w := httptest.NewRecorder()
		c := e.NewContext(r, w)

		err := m(func(c echo.Context) error {
			o := adapter.Operator(c.Request().Context())
			assert.True(t, o.Machine)

			return c.String(200, "ok")
		})(c)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("aws with invalid token", func(t *testing.T) {
		m := M2MAuthMiddleware(&Config{
			AWSTask: aws.TaskConfig{
				NotifyToken: "TOKEN",
			},
		})

		e := echo.New()
		r := httptest.NewRequest(http.MethodGet, "/?token=TOKEN_", nil)
		w := httptest.NewRecorder()
		c := e.NewContext(r, w)

		err := m(func(c echo.Context) error {
			return c.String(200, "ok")
		})(c)

		err2 := err.(*echo.HTTPError)
		assert.Equal(t, http.StatusUnauthorized, err2.Code)
	})
}
