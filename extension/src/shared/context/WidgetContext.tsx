import { ApolloProvider } from "@apollo/client";
import { Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { merge } from "lodash-es";
import { SnackbarProvider } from "notistack";
import { FC, PropsWithChildren, useEffect, useState } from "react";

import { lightTheme, lightThemeOptions } from "../../prototypes/ui-components";
import {
  createSettingClient,
  settingClient,
  createTemplateClient,
  templateClient,
} from "../api/clients";
import {
  GEO_API_URL,
  GOOGLE_STREET_VIEW_API_KEY,
  GSI_TILE_URL,
  LOGO,
  PLATEAU_API_URL,
  PROJECT_ID,
  PRIMARY_COLOR,
  setGISTileURL,
  setGeoApiUrl,
  setGoogleStreetViewAPIKey,
  setLogo,
  setPlateauApiUrl,
  setProjectId,
  setPrimaryColor,
  SITE_URL,
  setSiteURL,
  CITY_NAME,
  setCityName,
  INITIAL_PEDESTRIAN_COORDINATES,
  setInitialPededstrianCoordinates,
  PLATEAU_GEOJSON_URL,
  setPlateauGeojsonUrl,
} from "../constants";
import { geoClient, createGeoClient, catalogClient, createCatalogClient } from "../graphql/clients";
import { CameraPosition } from "../reearth/types";

type Props = {
  inEditor?: boolean;
  // Default settings
  geoUrl?: string;
  gsiTileURL?: string;
  plateauUrl?: string;
  projectId?: string;
  plateauToken?: string;
  catalogUrl?: string;
  catalogURLForAdmin?: string;
  googleStreetViewAPIKey?: string;
  geojsonURL?: string;
  // Custom settings
  cityName?: string;
  customPrimaryColor?: string;
  customLogo?: string;
  customPedestrian?: CameraPosition;
  customSiteUrl?: string;
};

export const WidgetContext: FC<PropsWithChildren<Props>> = ({
  geoUrl,
  gsiTileURL,
  plateauUrl,
  projectId,
  plateauToken,
  catalogUrl,
  catalogURLForAdmin,
  googleStreetViewAPIKey,
  children,
  inEditor,
  cityName,
  customPrimaryColor,
  customLogo,
  customPedestrian,
  customSiteUrl,
  geojsonURL,
}) => {
  useEffect(() => {
    if (!PLATEAU_API_URL && plateauUrl) {
      setPlateauApiUrl(plateauUrl);
    }
  }, [plateauUrl]);

  useEffect(() => {
    if (!PROJECT_ID && projectId) {
      setProjectId(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!GEO_API_URL && geoUrl) {
      setGeoApiUrl(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    if (!GSI_TILE_URL && gsiTileURL) {
      setGISTileURL(gsiTileURL);
    }
  }, [gsiTileURL]);

  useEffect(() => {
    if (!GOOGLE_STREET_VIEW_API_KEY && googleStreetViewAPIKey) {
      setGoogleStreetViewAPIKey(googleStreetViewAPIKey);
    }
  }, [googleStreetViewAPIKey]);

  useEffect(() => {
    if (!geoClient && geoUrl) {
      createGeoClient(geoUrl);
    }
  }, [geoUrl]);

  useEffect(() => {
    const url = inEditor ? catalogURLForAdmin || catalogUrl : catalogUrl;
    if (url) {
      createCatalogClient(url, inEditor ? plateauToken : undefined);
    }
  }, [catalogUrl, catalogURLForAdmin, plateauToken, inEditor]);

  useEffect(() => {
    if (!settingClient && !templateClient && plateauUrl && projectId && plateauToken) {
      const sidebar = `${plateauUrl}/sidebar`;
      createSettingClient(projectId, sidebar, plateauToken);
      createTemplateClient(projectId, sidebar, plateauToken);
    }
  }, [projectId, plateauUrl, plateauToken]);

  useEffect(() => {
    if (cityName && (!CITY_NAME || CITY_NAME !== cityName)) {
      setCityName(cityName);
    }
  }, [cityName]);

  useEffect(() => {
    if (customSiteUrl && (!SITE_URL || SITE_URL !== customSiteUrl)) {
      setSiteURL(customSiteUrl);
    }
  }, [customSiteUrl]);

  useEffect(() => {
    if (customLogo && (!LOGO || LOGO !== customLogo)) {
      setLogo(customLogo);
    }
  }, [customLogo]);

  useEffect(() => {
    if (
      customPedestrian &&
      (!INITIAL_PEDESTRIAN_COORDINATES || INITIAL_PEDESTRIAN_COORDINATES !== customPedestrian)
    ) {
      setInitialPededstrianCoordinates(customPedestrian);
    }
  }, [customPedestrian]);

  useEffect(() => {
    if (!PLATEAU_GEOJSON_URL && geojsonURL) {
      setPlateauGeojsonUrl(geojsonURL);
    }
  }, [geojsonURL]);

  useEffect(() => {
    if (customPrimaryColor && (!PRIMARY_COLOR || PRIMARY_COLOR !== customPrimaryColor)) {
      setPrimaryColor(customPrimaryColor);
    }
  }, [customPrimaryColor]);

  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if (!customTheme && PRIMARY_COLOR) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, lightThemeOptions, {
            palette: {
              primary: {
                main: PRIMARY_COLOR,
              },
            },
          }),
        ),
      );
    }
  }, [customTheme]);

  if (!PLATEAU_API_URL || !geoClient || !catalogClient || !GEO_API_URL || !GSI_TILE_URL) {
    return null;
  }

  return (
    <ApolloProvider client={catalogClient}>
      <ApolloProvider client={geoClient}>
        <ThemeProvider theme={customTheme ?? lightTheme}>
          <SnackbarProvider maxSnack={1}>{children}</SnackbarProvider>
        </ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
};
