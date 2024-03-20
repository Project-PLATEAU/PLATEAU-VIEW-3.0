// import { VectorMapImageryLayer } from "@takram/plateau-datasets";
import { useAtomValue } from "jotai";
import { useMemo, type FC } from "react";

import { GSI_TILE_URL } from "../../../shared/constants";
import { Scene, SceneProps } from "../../../shared/reearth/scene";
import { type ColorMode } from "../../shared-states";
import { enableTerrainLightingAtom } from "../states/app";

// Flat white sky and gray ground
const sphericalHarmonicCoefficients: [x: number, y: number, z: number][] = [
  [0.651181936264038, 0.651181936264038, 0.651181936264038], // L00, irradiance, pre-scaled base
  [0.335859775543213, 0.335859775543213, 0.335859775543213], // L1-1, irradiance, pre-scaled base
  [0.000000874592729, 0.000000874592729, 0.000000874592729], // L10, irradiance, pre-scaled base
  [0.000000027729817, 0.000000027729817, 0.000000027729817], // L11, irradiance, pre-scaled base
  [0.000000014838997, 0.000000014838997, 0.000000014838997], // L2-2, irradiance, pre-scaled base
  [-0.000000005038311, -0.000000005038311, -0.000000005038311], // L2-1, irradiance, pre-scaled base
  [0.000121221753943, 0.000121221753943, 0.000121221753943], // L20, irradiance, pre-scaled base
  [0.000000282587223, 0.000000282587223, 0.000000282587223], // L21, irradiance, pre-scaled base
  [0.000364663166692, 0.000364663166692, 0.000364663166692], // L22, irradiance, pre-scaled base
];

export interface MapEnvironmentProps extends SceneProps {
  colorMode?: ColorMode;
}

export const MapEnvironment: FC<MapEnvironmentProps> = ({
  colorMode = "light",
  tileLabels,
  enterUnderground,
  hideUnderground,
  ...props
}) => {
  // invariant(
  //   process.env.NEXT_PUBLIC_TILES_BASE_URL != null,
  //   "Missing environment variable: NEXT_PUBLIC_TILES_BASE_URL",
  // );
  const enableTerrainLighting = useAtomValue(enableTerrainLightingAtom);

  // const [layer, setLayer] = useState<ImageryLayerHandle | null>(null);
  // useEffect(() => {
  //   layer?.sendToBack();
  // }, [layer]);

  const tiles = useMemo(
    () => [
      colorMode === "light"
        ? {
            id: "gsi_mvt_tile_light",
            tile_type: "url",
            tile_url: `${GSI_TILE_URL}/light-map/{z}/{x}/{y}.png`,
            tile_zoomLevelForURL: [0, 22],
          }
        : {
            id: "gsi_mvt_tile_dark",
            tile_type: "url",
            tile_url: `${GSI_TILE_URL}/dark-map/{z}/{x}/{y}.png`,
            tile_zoomLevelForURL: [undefined, 22],
          },
    ],
    [colorMode],
  );

  return (
    <Scene
      // TODO: Define in theme
      // TODO: Swap background when view is ready
      globeBaseColor={colorMode === "light" ? "#bfbfbf" : "#000000"}
      enableGlobeLighting={enableTerrainLighting}
      lightIntensity={12}
      shadowDarkness={colorMode === "light" ? 0.7 : 0.3}
      imageBasedLightingIntensity={1}
      sphericalHarmonicCoefficients={sphericalHarmonicCoefficients}
      showSkyBox={false}
      atmosphereSaturationShift={-1}
      groundAtmosphereBrightnessShift={2}
      hideUnderground={hideUnderground}
      enterUnderground={enterUnderground}
      // TODO(ReEarth): Use Takram's tile
      // TODO(ReEarth): Support tile brightness
      tiles={tiles}
      tileLabels={tileLabels}
      {...props}
    />
  );
};
