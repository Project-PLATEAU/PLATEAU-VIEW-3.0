import { useEffect, useRef, useState } from "react";

import { Events, LayerAppearanceTypes, LayerLoadEvent } from "../types";
import { Data } from "../types/layer";

export type LayerHookOptions = {
  data: Data;
  appearances: Partial<LayerAppearanceTypes>;
  visible?: boolean;
  events?: Events;
  onLoad?: (layerId: string) => void;
  loading?: boolean;
  useLayerLoadEvent?: boolean;
};

export const useLayer = ({
  data,
  appearances,
  visible,
  events,
  onLoad,
  loading,
  useLayerLoadEvent,
}: LayerHookOptions) => {
  const layerIdRef = useRef<string>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;

    const layerId = window.reearth?.layers?.add?.({
      type: "simple",
      data: data,
      events,
    });

    layerIdRef.current = layerId;

    return () => {
      if (!layerId) return;
      window.reearth?.layers?.delete?.(layerId);
    };
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId || !loaded) return;

    window.reearth?.layers?.override?.(layerId, {
      data: data,
      visible,
      events,
      ...appearances,
    });
  }, [appearances, visible, data, events, loaded]);

  useEffect(() => {
    const layerId = layerIdRef.current;
    if (!layerId) return;
    if (useLayerLoadEvent) {
      const load = ({ layerId: actualLayerId }: LayerLoadEvent) => {
        if (!actualLayerId || layerId !== actualLayerId) return;
        onLoad?.(layerId);
        setLoaded(true);
      };
      window.reearth?.on?.("layerload", load);
      return () => window.reearth?.off?.("layerload", load);
    } else {
      setTimeout(() => {
        if (layerId) {
          onLoad?.(layerId);
        }
        setLoaded(true);
      }, 300);
    }
  }, [onLoad, data.url, useLayerLoadEvent]);
};
