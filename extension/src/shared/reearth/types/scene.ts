import { CameraPosition } from "./camera";
import { ComputedFeature } from "./layer";
import { LUT, LngLatHeight } from "./value";

export type TerrainProperty = {
  terrain?: boolean;
  terrainType?: "cesium" | "arcgis" | "cesiumion"; // default: cesium
  terrainExaggeration?: number; // default: 1
  terrainExaggerationRelativeHeight?: number; // default: 0
  depthTestAgainstTerrain?: boolean;
  terrainCesiumIonAsset?: string;
  terrainCesiumIonAccessToken?: string;
  terrainCesiumIonUrl?: string;
  terrainUrl?: string;
  terrainNormal?: boolean;
  // TODO: Add encode option
  heatmapType?: "custom"; // TODO: Support Cesium's terrain heatmap as built-in: https://sandcastle.cesium.com/?src=Globe%20Materials.html
  heatmapColorLUT?: LUT;
  heatmapMinHeight?: number;
  heatmapMaxHeight?: number;
  heatmapLogarithmic?: boolean;
};

export type Tile = {
  id: string;
  tile_type?: string;
  tile_url?: string;
  tile_maxLevel?: number;
  tile_minLevel?: number;
  tile_opacity?: number;
};

export type TileLabels = {
  id: string;
  labelType: "japan_gsi_optimal_bvmap"; // | "other_map"
  style: Record<string, any>; // Function isn't allowed
};

export type AmbientOcclusion = {
  enabled?: boolean;
  quality?: "low" | "medium" | "high" | "extreme";
  intensity?: number;
  ambientOcclusionOnly?: boolean;
};

export type Antialias = "low" | "medium" | "high" | "extreme";

export type Timeline = {
  animation?: boolean;
  visible?: boolean;
  current?: string;
  start?: string;
  stop?: string;
  stepType?: "rate" | "fixed";
  multiplier?: number;
  step?: number;
  rangeType?: "unbounded" | "clamped" | "bounced";
};

export type SceneProperty = {
  camera?: {
    camera?: CameraPosition;
    allowEnterGround?: boolean;
    fov?: number;
  };
  default?: {
    camera?: Partial<CameraPosition>;
    allowEnterGround?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
    // sceneMode?: SceneMode; // default: scene3d
    vr?: boolean;
  } & TerrainProperty; // compat
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: CameraPosition;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  //   indicator?: {
  //     indicator_type: IndicatorTypes;
  //     indicator_image?: string;
  //     indicator_image_scale?: number;
  //   };
  tiles?: Tile[];
  tileLabels?: TileLabels[];
  terrain?: TerrainProperty;
  atmosphere?: {
    enable_sun?: boolean;
    enableMoon?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    shadowResolution?: 1024 | 2048 | 4096;
    softShadow?: boolean;
    shadowDarkness?: number;
    shadowMaximumDistance?: number;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
    skyboxBrightnessShift?: number;
    skyboxSurturationShift?: number;
    globeShadowDarkness?: number;
    globeImageBasedLighting?: boolean;
    globeBaseColor?: string;
  };
  timeline?: Timeline;
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
  ambientOcclusion?: AmbientOcclusion;
  light?: {
    lightType?: "sunLight" | "directionalLight";
    lightDirectionX?: number;
    lightDirectionY?: number;
    lightDirectionZ?: number;
    lightColor?: string;
    lightIntensity?: number;
    specularEnvironmentMaps?: string;
    sphericalHarmonicCoefficients?: [x: number, y: number, z: number][];
    imageBasedLightIntensity?: number;
  };
  render?: {
    antialias?: Antialias;
    debugFramePerSecond?: boolean;
  };
};

export type PickedFeature = ComputedFeature & { layerId?: string };

export type Scene = {
  readonly inEditor: boolean;
  readonly built: boolean;
  readonly property?: SceneProperty;
  readonly overrideProperty: (property: SceneProperty) => void;
  readonly captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  readonly getLocationFromScreen: (
    x: number,
    y: number,
    withTerrain?: boolean,
  ) => LngLatHeight | undefined;
  readonly sampleTerrainHeight: (lng: number, lat: number) => Promise<number | undefined>;
  readonly computeGlobeHeight: (lng: number, lat: number, height?: number) => number | undefined;
  readonly getGlobeHeight: () => void;
  readonly toXYZ: (
    lng: number,
    lat: number,
    height: number,
    options?: { useGlobeEllipsoid?: boolean },
  ) => [x: number, y: number, z: number] | undefined;
  readonly toLngLatHeight: (
    x: number,
    y: number,
    z: number,
    options?: { useGlobeEllipsoid?: boolean },
  ) => [lng: number, lat: number, height: number] | undefined;
  readonly negativePiToPi: (angle: number | undefined) => void;
  readonly convertScreenToPositionOffset: (
    rawPosition: [x: number, y: number, z: number],
    screenOffset: [x: number, y: number],
  ) => [x: number, y: number, z: number] | undefined;
  isPositionVisible: (position: [x: number, y: number, z: number]) => boolean;
  toWindowPosition: (
    position: [x: number, y: number, z: number],
  ) => [x: number, y: number] | undefined;
  readonly pickManyFromViewport: (
    windowPosition: [x: number, y: number],
    windowWidth: number,
    windowHeight: number,
    // TODO: Get condition as expression for plugin
    condition?: (f: PickedFeature) => boolean,
  ) => PickedFeature[] | undefined;
};
