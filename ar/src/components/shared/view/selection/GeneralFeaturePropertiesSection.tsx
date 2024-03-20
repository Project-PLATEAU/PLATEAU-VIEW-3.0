import { useAtomValue, useSetAtom } from "jotai";
import { uniqBy } from "lodash-es";
import { useMemo, type FC } from "react";

import { useFindLayer, LayerModel } from "../../../prototypes/layers";
import { ParameterList, PropertyParameterItem } from "../../../prototypes/ui-components";
import {
  type SCREEN_SPACE_SELECTION,
  type SelectionGroup,
} from "../../../prototypes/view/states/selection";
import { makePropertyForFeatureInspector } from "../../plateau/featureInspector";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Feature } from "../../reearth/types/layer";
import { findRootLayerAtom, rootLayersLayersAtom } from "../../states/rootLayer";
import { RootLayer } from "../../view-layers";

export interface GeneralFeaturePropertiesSectionProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof GENERAL_FEATURE;
  })["values"];
}

// TODO(reearth): Support CZML description HTML
export const GeneralFeaturePropertiesSection: FC<GeneralFeaturePropertiesSectionProps> = ({
  values,
}) => {
  const findRootLayer = useSetAtom(findRootLayerAtom);
  const rootLayersLayers = useAtomValue(rootLayersLayersAtom);
  const findLayer = useFindLayer();
  const layers = useMemo(() => {
    const layersMap = values.reduce((res, v) => {
      if (!res[v.layerId]) {
        res[v.layerId] = [];
      }
      res[v.layerId].push({ featureId: v.key, properties: v.properties });
      return res;
    }, {} as { [layerId: string]: { featureId: string; properties: any }[] });
    return Object.keys(layersMap).reduce((res, layerId) => {
      const datasetId = values.find(v => v.layerId === layerId)?.datasetId;
      const mapValues = layersMap[layerId];
      const hasProperties = mapValues.every(v => !!v.properties);
      const features = hasProperties
        ? mapValues
        : uniqBy(
            window.reearth?.layers?.findFeaturesByIds?.(
              layerId,
              mapValues.map(v => v.featureId),
            ) ?? [],
            "id",
          );

      const layer = findLayer(rootLayersLayers, l => l.id === datasetId);
      const rootLayer = findRootLayer(datasetId ?? "");

      res.push({ features: features ?? [], rootLayer, layer });
      return res;
    }, [] as { features: Pick<Feature, "properties">[]; layer?: LayerModel; rootLayer: RootLayer | undefined }[]);
  }, [values, findLayer, findRootLayer, rootLayersLayers]);

  const properties = useMemo(() => {
    // TODO: Replace properties by JSONPath
    return layers.reduce((res, { features, rootLayer, layer }) => {
      return res.concat(
        ...makePropertyForFeatureInspector({
          features,
          layer,
          featureInspector: rootLayer?.featureInspector,
        }),
      );
    }, [] as Feature["properties"][]);
  }, [layers]);

  return (
    <ParameterList>
      <PropertyParameterItem properties={properties} />
    </ParameterList>
  );
};
