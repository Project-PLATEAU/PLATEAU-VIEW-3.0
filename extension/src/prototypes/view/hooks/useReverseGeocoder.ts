import { useState, useCallback, useEffect, useRef } from "react";

import { useCameraAreasLazy } from "../../../shared/graphql/hooks/geo";
import { useReEarthEvent } from "../../../shared/reearth/hooks";
import type { Address } from "../../../shared/states/address";

export type ReverseGeocoderResult = Address<true>;

export function useReverseGeocoder(): ReverseGeocoderResult | undefined {
  const [croods, setCroods] = useState<{
    longitude?: number;
    latitude?: number;
  }>({});

  const viewSize = useRef<number>();

  const [getAreas, { data }] = useCameraAreasLazy({
    longitude: croods.longitude ?? 0,
    latitude: croods.latitude ?? 0,
    includeRadii: true,
  });
  const [result, setResult] = useState<ReverseGeocoderResult>();

  useEffect(() => {
    if (data?.areas) {
      const areas = { ...data.areas };
      if (viewSize.current) {
        const threshold = viewSize.current * 0.5;
        areas.areas = areas.areas.filter(area => area.radius > threshold);
      }
      setResult(areas as ReverseGeocoderResult);
    }
  }, [data]);

  useEffect(() => {
    getAreas();
  }, [croods, getAreas]);

  const updateFovInfo = useCallback(() => {
    const fovInfo = window.reearth?.camera?.getFovInfo({ withTerrain: true, calcViewSize: true });
    setCroods({
      longitude: fovInfo?.center?.lng,
      latitude: fovInfo?.center?.lat,
    });
    viewSize.current = fovInfo?.viewSize;
  }, []);

  useReEarthEvent("cameramove", updateFovInfo);

  return result;
}
