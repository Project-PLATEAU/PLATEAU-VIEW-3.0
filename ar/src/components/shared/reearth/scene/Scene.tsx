/** Correspond to https://github.com/takram-design-engineering/plateau-view/blob/main/libs/cesium/src/Environment.tsx */

import { FC, useEffect } from "react";

import { AmbientOcclusion, Antialias, Tile } from "../types";

// nx = red
// ny = green
// nz = blue
// px = cyan
// py = magenta
// pz = yellow
const debugSphericalHarmonicCoefficients: [x: number, y: number, z: number][] = [
  [0.499745965003967, 0.499196201562881, 0.500154078006744], // L00, irradiance, pre-scaled base
  [0.265826553106308, -0.266099184751511, 0.265922993421555], // L1-1, irradiance, pre-scaled base
  [0.243236944079399, 0.266723394393921, -0.265380442142487], // L10, irradiance, pre-scaled base
  [-0.266895800828934, 0.265416264533997, 0.266921550035477], // L11, irradiance, pre-scaled base
  [0.000195000306121, -0.000644546060357, -0.000383183418307], // L2-2, irradiance, pre-scaled base
  [-0.000396036746679, -0.000622032093816, 0.000262127199676], // L2-1, irradiance, pre-scaled base
  [-0.000214280473301, 0.00004872302452, -0.000059724134189], // L20, irradiance, pre-scaled base
  [0.000107143961941, -0.000126510843984, -0.000425444566645], // L21, irradiance, pre-scaled base
  [-0.000069071611506, 0.000134039684781, -0.000119135256682], // L22, irradiance, pre-scaled base
];

export type EnvironmentProps = {
  backgroundColor?: string;
  globeBaseColor?: string;
  showGlobe?: boolean;
  enableGlobeLighting?: boolean;
  globeImageBasedLightingFactor?: number;
  terrainHeatmap?: boolean;
  lightColor?: string;
  lightIntensity?: number;
  shadowDarkness?: number;
  imageBasedLightingIntensity?: number;
  sphericalHarmonicCoefficients?: [x: number, y: number, z: number][];
  debugSphericalHarmonics?: boolean;
  showSun?: boolean;
  showMoon?: boolean;
  showSkyBox?: boolean;
  enableFog?: boolean;
  fogDensity?: number;
  showSkyAtmosphere?: boolean;
  showGroundAtmosphere?: boolean;
  atmosphereSaturationShift?: number;
  atmosphereBrightnessShift?: number;
  skyAtmosphereSaturationShift?: number;
  skyAtmosphereBrightnessShift?: number;
  groundAtmosphereSaturationShift?: number;
  groundAtmosphereBrightnessShift?: number;
};

export type ShadowProps = { enabled?: boolean; size?: 1024 | 2048 | 4096; softShadows?: boolean };

export type SceneProps = EnvironmentProps & {
  ambientOcclusion?: AmbientOcclusion;
  tiles?: Tile[];
  shadows?: ShadowProps;
  antialias?: Antialias;
  terrainNormal?: boolean;
};

export const Scene: FC<SceneProps> = ({
  backgroundColor = "black",
  globeBaseColor = "black",
  // showGlobe = true,
  enableGlobeLighting = false,
  globeImageBasedLightingFactor = 0.3,
  // TODO(ReEarth): Support terrain heat-map
  // terrainHeatmap = false,
  lightColor = "white",
  lightIntensity = 2,
  shadowDarkness = 0.3,
  imageBasedLightingIntensity = 1,
  sphericalHarmonicCoefficients,
  debugSphericalHarmonics = false,
  showSun = true,
  showMoon = false,
  showSkyBox = true,
  enableFog = true,
  fogDensity = 0.0002,
  showSkyAtmosphere = true,
  showGroundAtmosphere = true,
  atmosphereSaturationShift = 0,
  atmosphereBrightnessShift = 0,
  skyAtmosphereSaturationShift,
  skyAtmosphereBrightnessShift,
  groundAtmosphereSaturationShift,
  groundAtmosphereBrightnessShift,
  tiles,
  ambientOcclusion,
  shadows,
  antialias,
}) => {
  useEffect(() => {
    window.reearth?.scene?.overrideProperty({
      default: {
        camera: {
          lng: 139.755,
          lat: 35.675,
          height: 1000,
          heading: Math.PI * 0.4,
          pitch: -Math.PI * 0.2,
        },
        bgcolor: backgroundColor,
        skybox: showSkyBox,
      },
      atmosphere: {
        // Globe
        enable_lighting: enableGlobeLighting,
        globeImageBasedLighting: enableGlobeLighting,
        globeShadowDarkness: globeImageBasedLightingFactor,
        globeBaseColor,

        // Shadow
        shadowDarkness,
        shadows: shadows?.enabled,
        shadowResolution: shadows?.size,
        softShadow: shadows?.softShadows,
        shadowMaximumDistance: 10000,

        // Camera
        fog: enableFog,
        fog_density: fogDensity,

        // Sun
        enable_sun: showSkyBox && showSun,

        // Moon
        enableMoon: showSkyBox && showMoon,

        // Sky
        sky_atmosphere: showSkyAtmosphere,
        skyboxSurturationShift: skyAtmosphereSaturationShift ?? atmosphereSaturationShift,
        skyboxBrightnessShift: skyAtmosphereBrightnessShift ?? atmosphereBrightnessShift,

        // Ground
        ground_atmosphere: showGroundAtmosphere,
        surturation_shift: groundAtmosphereSaturationShift ?? atmosphereSaturationShift,
        brightness_shift: groundAtmosphereBrightnessShift ?? atmosphereBrightnessShift,
      },
      ambientOcclusion,
      light: {
        lightColor,
        lightIntensity: debugSphericalHarmonics ? 0.5 : lightIntensity,

        // Spherical harmonic
        sphericalHarmonicCoefficients: debugSphericalHarmonics
          ? debugSphericalHarmonicCoefficients
          : sphericalHarmonicCoefficients,
        imageBasedLightIntensity: imageBasedLightingIntensity,
      },
      tiles,
      terrain: {
        terrain: true,
        terrainType: "cesiumion",
        terrainCesiumIonAccessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE",
        terrainCesiumIonAsset: "770371",
        terrainNormal: true,
      },
      render: {
        antialias,
      },
    });
  }, [
    antialias,
    ambientOcclusion,
    atmosphereBrightnessShift,
    atmosphereSaturationShift,
    backgroundColor,
    debugSphericalHarmonics,
    enableFog,
    enableGlobeLighting,
    fogDensity,
    globeImageBasedLightingFactor,
    groundAtmosphereBrightnessShift,
    groundAtmosphereSaturationShift,
    imageBasedLightingIntensity,
    lightColor,
    lightIntensity,
    shadowDarkness,
    showGroundAtmosphere,
    showSkyAtmosphere,
    showSkyBox,
    showSun,
    showMoon,
    sphericalHarmonicCoefficients,
    tiles,
    shadows,
    globeBaseColor,
    skyAtmosphereBrightnessShift,
    skyAtmosphereSaturationShift,
  ]);

  return null;
};
