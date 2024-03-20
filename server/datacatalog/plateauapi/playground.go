package plateauapi

import (
	"html/template"
	"net/http"
	"net/url"
)

var config = map[string]any{
	"reactVersion":          "18",
	"graphiqlVersion":       "3.0.6",
	"pluginExplorerVersion": "0.3.5",
	// get SRI at https://www.srihash.org/
	// https://unpkg.com/react/umd/react.production.min.js
	"reactSRI": "sha256-S0lp+k7zWUMk2ixteM6HZvu8L9Eh//OVrt+ZfbCpmgY=",
	// https://unpkg.com/react-dom/umd/react-dom.production.min.js
	"reactDOMSRI": "sha256-IXWO0ITNDjfnNXIu5POVfqlgYoop36bDzhodR6LW5Pc=",
	// https://unpkg.com/graphiql/graphiql.min.js
	"graphiqlJSSRI": "sha256-eNxH+Ah7Z9up9aJYTQycgyNuy953zYZwE9Rqf5rH+r4=",
	// https://unpkg.com/graphiql/graphiql.min.css
	"graphiqlCSSSRI": "sha256-wTzfn13a+pLMB5rMeysPPR1hO7x0SwSeQI+cnw7VdbE=",
	// https://unpkg.com/@graphiql/plugin-explorer/dist/index.umd.js
	"pluginExplorerJSSRI": "sha256-CD435QHT45IKYOYnuCGRrwVgCRJNzoKjMuisdNtso4s=",
	// https://unpkg.com/@graphiql/plugin-explorer/dist/style.css
	"pluginExplorerCSSSRI": "sha256-dihQy2mHNADQqxc3xhWK7pH1w4GVvEow7gKjxdWvTgE=",
}

var page = template.Must(template.New("graphiql").Parse(`<!DOCTYPE html>
<html>
  <head>
		<meta charset="utf-8" />
    <title>{{.title}}</title>
    <link
		rel="stylesheet"
		href="https://unpkg.com/graphiql@{{.graphiqlVersion}}/graphiql.min.css"
		integrity="{{.graphiqlCSSSRI}}"
		crossorigin="anonymous"
	/>
	<link
		rel="stylesheet"
		href="https://unpkg.com/@graphiql/plugin-explorer@{{.pluginExplorerVersion}}/dist/style.css"
		integrity="{{.pluginExplorerCSSSRI}}"
		crossorigin="anonymous"
		/>
  </head>
  <body style="margin: 0; width: 100%; height: 100%; overflow: hidden;">
		<div id="graphiql" style="height: 100vh;">Loading...</div>
		<script
			src="https://unpkg.com/react@{{.reactVersion}}/umd/react.production.min.js"
			integrity="{{.reactSRI}}"
			crossorigin="anonymous"
		></script>
		<script
			src="https://unpkg.com/react-dom@{{.reactVersion}}/umd/react-dom.production.min.js"
			integrity="{{.reactDOMSRI}}"
			crossorigin="anonymous"
		></script>
		<script
			src="https://unpkg.com/graphiql@{{.graphiqlVersion}}/graphiql.min.js"
			integrity="{{.graphiqlJSSRI}}"
			crossorigin="anonymous"
		></script>
		<script
			src="https://unpkg.com/@graphiql/plugin-explorer@{{.pluginExplorerVersion}}/dist/index.umd.js"
			integrity="{{.pluginExplorerJSSRI}}"
			crossorigin="anonymous"
		></script>
		<script>
	{{- if .endpointIsAbsolute}}
			const url = {{.endpoint}};
			const subscriptionUrl = {{.subscriptionEndpoint}};
	{{- else}}
			const url = location.protocol + '//' + location.host + {{.endpoint}};
			const wsProto = location.protocol == 'https:' ? 'wss:' : 'ws:';
			const subscriptionUrl = wsProto + '//' + location.host + {{.endpoint}};
	{{- end}}

			const root = ReactDOM.createRoot(document.getElementById('graphiql'));
			const fetcher = GraphiQL.createFetcher({ url, subscriptionUrl });
			const explorerPlugin = GraphiQLPluginExplorer.explorerPlugin();
			root.render(
				React.createElement(GraphiQL, {
					fetcher,
					defaultEditorToolsVisibility: true,
					plugins: [explorerPlugin],
					shouldPersistHeaders: true
				})
			);
		</script>
  </body>
</html>
`))

// PlaygroundHandler responsible for setting up the playground
func PlaygroundHandler(title string, endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "text/html")
		err := page.Execute(w, mergeMaps(config, map[string]any{
			"title":                title,
			"endpoint":             endpoint,
			"endpointIsAbsolute":   endpointHasScheme(endpoint),
			"subscriptionEndpoint": getSubscriptionEndpoint(endpoint),
		}))
		if err != nil {
			panic(err)
		}
	}
}

// endpointHasScheme checks if the endpoint has a scheme.
func endpointHasScheme(endpoint string) bool {
	u, err := url.Parse(endpoint)
	return err == nil && u.Scheme != ""
}

// getSubscriptionEndpoint returns the subscription endpoint for the given
// endpoint if it is parsable as a URL, or an empty string.
func getSubscriptionEndpoint(endpoint string) string {
	u, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}

	switch u.Scheme {
	case "https":
		u.Scheme = "wss"
	default:
		u.Scheme = "ws"
	}

	return u.String()
}

func mergeMaps(a, b map[string]any) map[string]any {
	result := make(map[string]any)
	for k, v := range a {
		result[k] = v
	}
	for k, v := range b {
		result[k] = v
	}
	return result
}
