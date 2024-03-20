import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./components/prototypes/ui-components";
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader";
import ARView from "./ARView";
import AROverlayView from "./AROverlayView";
import { Provider } from "jotai";
import { ApolloProvider } from "@apollo/client";
import { createCatalogClient, createGeoClient } from "./components/shared/graphql/clients";

function App() {
  const catalogUrl = 'https://api.plateau.reearth.io/datacatalog/graphql';
  const geoUrl = 'https://geo.plateau.reearth.io/';

  return (
    <BrowserRouter>
      <ApolloProvider client={createCatalogClient(catalogUrl)}>
        <ApolloProvider client={createGeoClient(geoUrl)}>
          <ThemeProvider theme={darkTheme}>
            <main className="flex flex-col">
              <Provider>
                <AppHeader />
                <ARView className="relative w-full h-full" />
                <AROverlayView className="absolute top-12 left-0 w-full" />
              </Provider>
            </main>
          </ThemeProvider>
        </ApolloProvider>
      </ApolloProvider>
    </BrowserRouter>
  )
}

export default App
