import { atom, useAtomValue } from "jotai";
import { type FC } from "react";

import { ShadowProps } from "../../../shared/reearth/scene";
import { AmbientOcclusion } from "../../../shared/reearth/types";
import {
  shareableEnvironmentTypeAtom,
  shareableGraphicsQualityAtom,
} from "../../../shared/states/scene";
import { colorModeAtom } from "../../shared-states";
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

export const Environments: FC = () => {
  const environmentType = useAtomValue(shareableEnvironmentTypeAtom);
  const colorMode = useAtomValue(colorModeAtom);
  const debugSphericalHarmonics = useAtomValue(debugSphericalHarmonicsAtom);
  const shadowProps = useAtomValue(shadowMapPropsAtom);
  const ambientOcclusionProps = useAtomValue(ambientOcclusionPropsAtom);
  const graphicsQuality = useAtomValue(shareableGraphicsQualityAtom) || undefined;
  const antialias = graphicsQuality === "ultra" ? "extreme" : graphicsQuality;

  switch (environmentType) {
    case "map":
      return (
        <MapEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          colorMode={colorMode}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
        />
      );
    case "satellite":
      return (
        <SatelliteEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
        />
      );
    case "elevation":
      return (
        <ElevationEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
        />
      );
    case "google-photorealistic":
      return (
        <GooglePhotorealisticEnvironment
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
        />
      );
  }
};
