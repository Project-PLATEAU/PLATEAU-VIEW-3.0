import { useMemo } from "react";

import { useOptionalAtomValue } from "../../hooks";
import { GeneralData } from "../../reearth/layers";
import {
  APPLY_TIME_VALUE_FIELD,
  PRIORITIZE_PERFORMANCE_GEOJSON_FIELD,
} from "../../types/fieldComponents/general";
import { POINT_CONVERT_FROM_CSV } from "../../types/fieldComponents/point";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

export const useEvaluateGeneralData = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  // Time
  const timeProperty = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], APPLY_TIME_VALUE_FIELD),
  );

  // CSV
  const csvProperty = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_CONVERT_FROM_CSV),
  );

  // GeoJSON
  const prioritizePerformanceGeoJSON = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], PRIORITIZE_PERFORMANCE_GEOJSON_FIELD),
  );

  const generalData: GeneralData = useMemo(
    () => ({
      time:
        timeProperty?.value?.timeBasedDisplay && timeProperty?.preset?.propertyName
          ? { property: timeProperty.preset.propertyName, interval: 86400000 }
          : undefined,
      csv: csvProperty?.preset
        ? {
            lngColumn: csvProperty.preset.lngColumn,
            latColumn: csvProperty.preset.latColumn,
            heightColumn: csvProperty.preset.heightColumn,
          }
        : undefined,
      geojson: {
        useAsResource: prioritizePerformanceGeoJSON ? true : undefined,
      },
    }),
    [timeProperty, csvProperty, prioritizePerformanceGeoJSON],
  );

  return generalData;
};
