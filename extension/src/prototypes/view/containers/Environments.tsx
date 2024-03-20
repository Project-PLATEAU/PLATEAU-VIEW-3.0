import { atom, useAtomValue } from "jotai";
import { type FC, useMemo } from "react";

import { ShadowProps } from "../../../shared/reearth/scene";
import { AmbientOcclusion } from "../../../shared/reearth/types";
import type { AnnotationType } from "../../../shared/reearth/types/getAnnotationType";
import { TileLabels } from "../../../shared/reearth/types/scene.ts";
import {
  shareableEnvironmentTypeAtom,
  shareableShowMapLabelAtom,
  shareableGraphicsQualityAtom,
  sharedInitialCameraAtom,
  shareableUndergroundAtom,
  shareableColorMode,
} from "../../../shared/states/scene";
import { type ColorMode } from "../../shared-states";
import { ElevationEnvironment } from "../environments/ElevationEnvironment";
import { GooglePhotorealisticEnvironment } from "../environments/GooglePhotorealisticEnvironment";
import { MapEnvironment } from "../environments/MapEnvironment";
import { SatelliteEnvironment } from "../environments/SatelliteEnvironment";
import { debugSphericalHarmonicsAtom } from "../states/app";
import {
  ambientOcclusionEnabledAtom,
  ambientOcclusionIntensityAtom,
  ambientOcclusionOutputTypeAtom,
  shadowMapEnabledAtom,
  shadowMapSizeAtom,
  shadowMapSoftShadowsAtom,
} from "../states/graphics";
import { AmbientOcclusionOutputType } from "../types/hbao";

export type EnvironmentType = "map" | "satellite" | "elevation" | "google-photorealistic";

const shadowMapPropsAtom = atom(
  (get): ShadowProps => ({
    enabled: get(shadowMapEnabledAtom),
    size: get(shadowMapSizeAtom),
    softShadows: get(shadowMapSoftShadowsAtom),
  }),
);

const ambientOcclusionPropsAtom = atom((get): AmbientOcclusion => {
  const quality = get(shareableGraphicsQualityAtom) || undefined;
  return {
    enabled: get(ambientOcclusionEnabledAtom),
    intensity: get(ambientOcclusionIntensityAtom),
    quality: quality === "ultra" ? "extreme" : quality,
    // TODO(ReEarth): Support other output type
    ambientOcclusionOnly:
      get(ambientOcclusionOutputTypeAtom) === AmbientOcclusionOutputType.Occlusion,
  };
});

const STYLE_OVERRIDES: Record<ColorMode, any> = {
  light: {
    default: {
      fillColor: "#000000",
      outlineColor: "rgba(255, 255, 255, 0.8)",
    },
    towns: {
      fillColor: "rgba(0, 0, 0, 0.6)",
    },
    topography: {
      fillColor: "rgba(0, 0, 0, 0.6)",
    },
  },
  dark: {
    default: {
      fillColor: "#FFFFFF",
      outlineColor: "rgba(0, 0, 0, 0.8)",
    },
    towns: {
      fillColor: "rgba(255, 255, 255, 0.6)",
    },
    topography: {
      fillColor: "rgba(255, 255, 255, 0.6)",
    },
  },
};

export const Environments: FC = () => {
  const environmentType = useAtomValue(shareableEnvironmentTypeAtom);
  const colorMode = useAtomValue(shareableColorMode);
  const showMapLabel = useAtomValue(shareableShowMapLabelAtom);
  const debugSphericalHarmonics = useAtomValue(debugSphericalHarmonicsAtom);
  const shadowProps = useAtomValue(shadowMapPropsAtom);
  const ambientOcclusionProps = useAtomValue(ambientOcclusionPropsAtom);
  const graphicsQuality = useAtomValue(shareableGraphicsQualityAtom) || undefined;
  const antialias = graphicsQuality === "ultra" ? "extreme" : graphicsQuality;
  const initialCamera = useAtomValue(sharedInitialCameraAtom);
  const undergroundSettings = useAtomValue(shareableUndergroundAtom);

  const tileLabels: TileLabels[] = useMemo(() => {
    const styles = Object.entries(showMapLabel).reduce((acc, [key, isVisible]) => {
      acc[key] = isVisible
        ? STYLE_OVERRIDES[colorMode][key as AnnotationType] || STYLE_OVERRIDES[colorMode].default
        : false;
      return acc;
    }, {} as Record<string, any | false>);

    return [
      {
        id: `label`,
        labelType: "japan_gsi_optimal_bvmap",
        style: styles,
      },
    ] as TileLabels[];
  }, [showMapLabel, colorMode]);

  switch (environmentType) {
    case "map":
      return (
        <MapEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          colorMode={colorMode}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          initialCamera={initialCamera.value}
          hideUnderground={undergroundSettings.hideUnderground}
          enterUnderground={undergroundSettings.enterUnderground}
          tileLabels={tileLabels}
        />
      );
    case "satellite":
      return (
        <SatelliteEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          initialCamera={initialCamera.value}
          hideUnderground={undergroundSettings.hideUnderground}
          enterUnderground={undergroundSettings.enterUnderground}
          tileLabels={tileLabels}
        />
      );
    case "elevation":
      return (
        <ElevationEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          initialCamera={initialCamera.value}
          hideUnderground={undergroundSettings.hideUnderground}
          enterUnderground={undergroundSettings.enterUnderground}
          tileLabels={tileLabels}
        />
      );
    case "google-photorealistic":
      return (
        <GooglePhotorealisticEnvironment
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          initialCamera={initialCamera.value}
          hideUnderground={undergroundSettings.hideUnderground}
          enterUnderground={undergroundSettings.enterUnderground}
          tileLabels={tileLabels}
        />
      );
  }
};
