import { useAtomValue } from "jotai";
import { useMemo, type FC } from "react";

// import { TerrainElevationImageryLayer, VertexTerrainElevationMaterial } from "../../datasets";
import { GEO_API_URL } from "../../../shared/constants";
import { Scene, SceneProps } from "../../../shared/reearth/scene";
import {
  shareableLogarithmicTerrainElevationAtom,
  shareableTerrainElevationHeightRangeAtom,
} from "../../../shared/states/scene";
import {
  enableTerrainLightingAtom,
  // logarithmicTerrainElevationAtom,
  // terrainElevationHeightRangeAtom,
} from "../states/app";

const sphericalHarmonicCoefficients: [x: number, y: number, z: number][] = [
  [0.82368016242981, 0.89996325969696, 1.057950735092163], // L00, irradiance, pre-scaled base
  [0.95617014169693, 1.087422609329224, 1.246641397476196], // L1-1, irradiance, pre-scaled base
  [0.460439652204514, 0.642218351364136, 0.81517082452774], // L10, irradiance, pre-scaled base
  [-0.000934832380153, 0.014073264785111, 0.01713084615767], // L11, irradiance, pre-scaled base
  [-0.064062088727951, -0.072207100689411, -0.074556961655617], // L2-2, irradiance, pre-scaled base
  [0.508748233318329, 0.619970560073853, 0.730030000209808], // L2-1, irradiance, pre-scaled base
  [-0.031152218580246, -0.053586609661579, -0.066098868846893], // L20, irradiance, pre-scaled base
  [0.014958278276026, -0.027591468766332, -0.043796796351671], // L21, irradiance, pre-scaled base
  [-0.192780449986458, -0.223674207925797, -0.249334931373596], // L22, irradiance, pre-scaled base
];

export const ElevationEnvironment: FC<SceneProps> = ({ tileLabels, ...props }) => {
  const terrainElevationHeightRange = useAtomValue(shareableTerrainElevationHeightRangeAtom);
  const logarithmicTerrainElevation = useAtomValue(shareableLogarithmicTerrainElevationAtom);

  const enableTerrainLighting = useAtomValue(enableTerrainLightingAtom);

  // const [layer, setLayer] = useState<ImageryLayerHandle | null>(null);
  // useEffect(() => {
  //   layer?.sendToBack();
  // }, [layer]);

  const tiles = useMemo(
    () => [
      {
        id: "elevation-heatmap",
        tile_type: "url",
        tile_url: `${GEO_API_URL}/terrain/{z}/{x}/{y}.png`,
        heatmap: true,
        tile_maxLevel: 15,
      },
    ],
    [],
  );

  return (
    <Scene
      tiles={tiles}
      enableGlobeLighting={enableTerrainLighting}
      lightIntensity={10}
      shadowDarkness={0.5}
      imageBasedLightingIntensity={1}
      sphericalHarmonicCoefficients={sphericalHarmonicCoefficients}
      showSkyBox={false}
      atmosphereSaturationShift={-1}
      groundAtmosphereBrightnessShift={2}
      terrainHeatmap={true}
      terrainHeatmapLogarithmic={logarithmicTerrainElevation}
      terrainHeatmapMinHeight={terrainElevationHeightRange[0]}
      terrainHeatmapMaxHeight={terrainElevationHeightRange[1]}
      tileLabels={tileLabels}
      {...props}
    />
  );
};
