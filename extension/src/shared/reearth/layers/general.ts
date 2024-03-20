import { FC, useMemo } from "react";

import { LayerType } from "../../../prototypes/layers";
import { useLayer } from "../hooks";
import { LayerAppearanceTypes, Events } from "../types";
import { Data, DataType } from "../types/layer";

export const GENERAL_FEATURE = "GENERAL_FEATURE";
declare module "../../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [GENERAL_FEATURE]: {
      key: string;
      layerId: string;
      layerType: LayerType;
      datasetId: string;
      properties: any | undefined;
    };
  }
}

export type General = {};
export type GeneralFeature<P> = {
  properties: P;
};

export type GeneralAppearances = Partial<LayerAppearanceTypes>;
export type GeneralData = Partial<Data>;

export type GeneralProps = {
  url: string;
  format: DataType;
  onLoad?: (layerId: string) => void;
  visible?: boolean;
  selectedFeatureColor?: string;
  appearances?: GeneralAppearances;
  appendData?: GeneralData;
  updateInterval?: number;
  events?: Events;
};

const DEFAULT_APPEARNACES: Partial<LayerAppearanceTypes> = {
  resource: {
    clampToGround: true,
  },
  marker: {
    heightReference: "clamp",
  },
  polyline: {
    clampToGround: true,
  },
  polygon: {
    heightReference: "clamp",
  },
};

export const GeneralLayer: FC<GeneralProps> = ({
  url,
  format,
  onLoad,
  visible,
  appearances,
  appendData,
  updateInterval,
  events,
  selectedFeatureColor,
}) => {
  const mergedAppearances: Partial<LayerAppearanceTypes> | undefined = useMemo(
    () => ({
      ...appearances,
      resource: {
        ...DEFAULT_APPEARNACES.resource,
        ...(appearances?.resource ?? {}),
        hideIndicator: true,
      },
      marker: {
        ...DEFAULT_APPEARNACES.marker,
        ...(appearances?.marker ?? {}),
        hideIndicator: true,
      },
      polyline: {
        ...DEFAULT_APPEARNACES.polyline,
        ...(appearances?.polyline ?? {}),
        hideIndicator: true,
      },
      polygon: {
        ...DEFAULT_APPEARNACES.polygon,
        ...(appearances?.polygon ?? {}),
        hideIndicator: true,
      },
      "3dtiles": {
        selectedFeatureColor,
        ...(appearances?.["3dtiles"] ?? {}),
      },
    }),
    [appearances, selectedFeatureColor],
  );

  const data: Data = useMemo(
    () => ({
      type: format,
      url,
      updateInterval,
      ...(appendData ?? {}),
    }),
    [url, updateInterval, format, appendData],
  );

  const memoedEvents = useMemo(() => events ?? {}, [events]);

  useLayer({
    data,
    visible,
    events: memoedEvents,
    appearances: mergedAppearances,
    onLoad,
  });

  return null;
};
