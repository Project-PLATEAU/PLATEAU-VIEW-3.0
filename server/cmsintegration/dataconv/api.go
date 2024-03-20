package dataconv

import (
	"encoding/json"
	"net/http"
	"strings"
)

func Handler(conf Config) (http.Handler, error) {
	s, err := NewService(conf)
	if err != nil || s == nil {
		return nil, err
	}
	return handler(s, conf.APIToken)
}

func handler(s *Service, token string) (http.Handler, error) {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// authorization
		if strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ") != token {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// json from response body
		resp := struct {
			IDs     []string `json:"ids"`
			Project string   `json:"project"`
		}{}

		if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if len(resp.IDs) == 0 {
			http.Error(w, "ids is empty", http.StatusBadRequest)
			return
		}

		if resp.Project == "" {
			http.Error(w, "project is empty", http.StatusBadRequest)
			return
		}

		ctx := r.Context()
		cms := s.CMS()

		results := make([]string, 0, len(resp.IDs))
		erro := false
		for _, id := range resp.IDs {
			cmsitem, err := cms.GetItem(ctx, id, false)
			if err == nil {
				item := Item{}
				cmsitem.Unmarshal(&item)

				item.DataConv = ""
				if len(item.DataOrig) > 0 {
					item.Data = item.DataOrig[0]
				}

				err = s.Convert(ctx, item, resp.Project)
			}

			if err != nil {
				erro = true
				results = append(results, id+": "+err.Error())
				continue
			}

			results = append(results, id)
		}

		if erro {
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			w.WriteHeader(http.StatusOK)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(results)
	}), nil
}
