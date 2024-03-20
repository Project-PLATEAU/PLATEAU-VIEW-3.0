import type {
  LineString,
  Point,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from "geojson";

import { Undefinable, WrappedRef } from "../utils";

import type { AppearanceTypes, LayerAppearanceTypes } from "./appearance";
import type { Infobox, Block, Tag } from "./compat";
import type { Events } from "./layerEvent";

export type Layers = Undefinable<
  Omit<
    WrappedRef<LayersRef>,
    | "layers"
    | "isLayer"
    | "add"
    | "select"
    | "addAll"
    | "deleteLayer"
    | "selectedLayer"
    | "selectedFeature"
    | "overriddenLayers"
  > & {
    readonly layersInViewport?: () => LazyLayer[] | undefined;
    readonly overriddenProperties?: { [id: string]: any };
    readonly overrideProperty?: (properties: LayerSimple["properties"] | undefined) => void;
    readonly overridden?: OverriddenLayer[];
    readonly add?: (layer: NaiveLayer) => string | undefined;
    readonly delete?: WrappedRef<LayersRef>["deleteLayer"];
    readonly select?: (
      layerId: string | undefined,
      reason?: LayerSelectionReason | undefined,
    ) => void;
    findFeatureById?: (layerId: string, featureId: string) => Feature | undefined;
    findFeaturesByIds?: (layerId: string, featureId: string[]) => Feature[] | undefined;
    selectFeatures?: (layers: { layerId: string; featureId: string[] }[]) => void;
    selectionReason?: LayerSelectionReason;
    bringToFront: (layerId: string) => void;
    sendToBack: (layerId: string) => void;
    // For compat
    overriddenInfobox?: LayerSelectionReason["defaultInfobox"];
    defaultInfobox?: LayerSelectionReason["defaultInfobox"];
    tags?: Tag[];
    layers?: LazyLayer[];
    isLayer?: boolean;
    selected?: ComputedLayer;
    selectedFeature?: ComputedFeature;
  }
>;

export type LazyLayer = Readonly<Layer> & {
  computed?: Readonly<ComputedLayer>;
  // compat
  pluginId?: string;
  extensionId?: string;
  property?: any;
  propertyId?: string;
  isVisible?: boolean;
};

export type LayersRef = {
  findById: (id: string) => LazyLayer | undefined;
  findByIds: (...ids: string[]) => (LazyLayer | undefined)[];
  add: (layer: NaiveLayer) => LazyLayer | undefined;
  addAll: (...layers: NaiveLayer[]) => (LazyLayer | undefined)[];
  replace: (...layers: Layer[]) => void;
  override: (id: string, layer?: (Partial<Layer> & { property?: any }) | null) => void;
  deleteLayer: (...ids: string[]) => void;
  isLayer: (obj: any) => obj is LazyLayer;
  layers: () => LazyLayer[];
  walk: <T>(
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => T | void,
  ) => T | undefined;
  find: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer | undefined;
  findAll: (fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) => LazyLayer[];
  findByTags: (...tagIds: string[]) => LazyLayer[];
  findByTagLabels: (...tagLabels: string[]) => LazyLayer[];
  hide: (...layers: string[]) => void;
  show: (...layers: string[]) => void;
  select: (
    layerId: string | undefined,
    featureId?: string,
    reason?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  selectedLayer: () => LazyLayer | undefined;
  overriddenLayers: () => OverriddenLayer[];
};

export type OverriddenLayer = Omit<Layer, "type" | "children">;

export type DefaultInfobox = {
  title?: string;
  content:
    | {
        type: "table";
        value: { key: string; value: string }[];
      }
    | { type: "html"; value: string };
};

export type LayerSelectionReason = {
  reason?: string;
  defaultInfobox?: DefaultInfobox;
};

export type FeatureSelectionReason = {
  reason?: string;
  defaultInfobox?: DefaultInfobox;
};

// Layer

export type Layer = LayerSimple | LayerGroup;

export type LayerSimple = {
  type: "simple";
  data?: Data;
  properties?: any;
  defines?: Record<string, string>;
  events?: Events;
} & Partial<LayerAppearanceTypes> &
  LayerCommon;

export type LayerGroup = {
  type: "group";
  children: Layer[];
} & LayerCommon;

export type LayerCommon = {
  id: string;
  title?: string;
  /** default is true */
  visible?: boolean;
  infobox?: Infobox;
  tags?: Tag[];
  creator?: string;
  compat?: LayerCompat;
};

export type LayerCompat = { extensionId?: string; property?: any; propertyId?: string };

/** Same as a Layer, but its ID is unknown. */
export type NaiveLayer = NaiveLayerSimple | NaiveLayerGroup;
export type NaiveLayerSimple = Omit<LayerSimple, "id" | "infobox"> & { infobox?: NaiveInfobox };
export type NaiveLayerGroup = Omit<LayerGroup, "id" | "children" | "infobox"> & {
  infobox?: NaiveInfobox;
  children?: NaiveLayer[];
};
export type NaiveInfobox = Omit<Infobox, "id" | "blocks"> & { blocks?: NaiveBlock[] };
export type NaiveBlock<P = any> = Omit<Block<P>, "id">;

export type SelectedFeatureInfo = {
  feature?: ComputedFeature;
};

// Data

export type Data = {
  type: DataType;
  url?: string;
  value?: any;
  layers?: string | string[];
  jsonProperties?: string[];
  updateInterval?: number; // milliseconds
  parameters?: Record<string, any>;
  idProperty?: string;
  time?: {
    property?: string;
    interval?: number; // milliseconds
    updateClockOnLoad?: boolean;
  };
  csv?: {
    idColumn?: string | number;
    latColumn?: string | number;
    lngColumn?: string | number;
    heightColumn?: string | number;
    noHeader?: boolean;
    disableTypeConversion?: boolean;
  };
};

export type DataRange = {
  x: number;
  y: number;
  z: number;
};

export type DataType =
  | "geojson"
  | "3dtiles"
  | "osm-buildings"
  | "google-photorealistic"
  | "czml"
  | "csv"
  | "wms"
  | "mvt"
  | "kml"
  | "gpx"
  | "shapefile"
  | "gtfs"
  | "gml"
  | "georss"
  | "gltf"
  | "tiles"
  | "tms"
  | "heatMap";

export type TimeInterval = [start: Date, end?: Date];

// Feature
export type CommonFeature<T extends "feature" | "computedFeature"> = {
  type: T;
  id: string;
  geometry?: Geometry;
  interval?: TimeInterval;
  properties?: any;
  metaData?: {
    description?: string;
  };
  range?: DataRange;
};

export type Feature = CommonFeature<"feature">;

export type Geometry = Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon;

export type ComputedLayerStatus = "fetching" | "ready";

// Computed

export type ComputedLayer = {
  id: string;
  status: ComputedLayerStatus;
  layer: Layer;
  originalFeatures: Feature[];
  features: ComputedFeature[];
  properties?: any;
} & Partial<AppearanceTypes>;

export type ComputedFeature = CommonFeature<"computedFeature"> & Partial<AppearanceTypes>;
