import { useTheme } from "@mui/material";
import { WritableAtom, useAtom, useSetAtom, type SetStateAction } from "jotai";
import { FC, useCallback } from "react";

import { LayerType } from "../../prototypes/layers";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { useOptionalPrimitiveAtom } from "../hooks";
import { GeneralProps, GeneralLayer, GENERAL_FEATURE, GTFSLayer } from "../reearth/layers";
import { MVTLayer } from "../reearth/layers/mvt";
import { WMSLayer } from "../reearth/layers/wms";
import { CameraPosition } from "../reearth/types";
import { Properties } from "../reearth/utils";
import { ComponentAtom } from "../view-layers/component";

import { useEvaluateGeneralAppearance } from "./hooks/useEvaluateGeneralAppearance";
import { useEvaluateGeneralData } from "./hooks/useEvaluateGeneralData";
import { PlateauTilesetProperties } from "../plateau";

type GeneralContainerProps = Omit<GeneralProps, "appearances" | "appendData"> & {
  id: string;
  layerIdAtom: WritableAtom<string, [string], any>;
  propertiesAtom: WritableAtom<PlateauTilesetProperties, [PlateauTilesetProperties], any>;
  selections?: ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[];
  hidden: boolean;
  type: LayerType;
  componentAtoms: ComponentAtom[] | undefined;
  layers?: string[];
  cameraAtom?: WritableAtom<CameraPosition, [SetStateAction<CameraPosition>], any>;
};

export const GeneralLayerContainer: FC<GeneralContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  componentAtoms,
  propertiesAtom,
  hidden,
  format,
  cameraAtom,
  ...props
}) => {
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  const [, setCamera] = useAtom(cameraAtom);

  useScreenSpaceSelectionResponder({
    type: GENERAL_FEATURE,
    convertToSelection: object => {
      return "id" in object &&
        typeof object.id === "string" &&
        layerId &&
        "layerId" in object &&
        object.layerId === layerId
        ? {
            type: GENERAL_FEATURE,
            value: {
              key: object.id,
              layerId,
              layerType: props.type,
              datasetId: id,
              properties: "properties" in object ? object.properties : undefined,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE> => {
      return value.type === GENERAL_FEATURE && !!value.value && value.value.layerId === layerId;
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const setProperties = useSetAtom(propertiesAtom);
  const handleLoad = useCallback(
    (layerId: string, camera?: CameraPosition) => {
      onLoad?.(layerId);
      setLayerId(layerId);
      setProperties(new Properties(layerId) as PlateauTilesetProperties);

      if (camera) {
        setCamera(camera);
      }
    },
    [onLoad, setProperties, setLayerId, setCamera],
  );

  const generalAppearances = useEvaluateGeneralAppearance({ componentAtoms });
  const generalData = useEvaluateGeneralData({ componentAtoms });

  const theme = useTheme();

  if (format === "gtfs") {
    return (
      <GTFSLayer
        {...props}
        onLoad={handleLoad}
        appearances={generalAppearances}
        visible={!hidden}
      />
    );
  }

  if (format === "mvt") {
    return (
      <MVTLayer {...props} onLoad={handleLoad} appearances={generalAppearances} visible={!hidden} />
    );
  }

  if (format === "wms") {
    return (
      <WMSLayer {...props} onLoad={handleLoad} appearances={generalAppearances} visible={!hidden} />
    );
  }

  return (
    <GeneralLayer
      {...props}
      format={format}
      onLoad={handleLoad}
      appearances={generalAppearances}
      appendData={generalData}
      visible={!hidden}
      selectedFeatureColor={theme.palette.primary.main}
    />
  );
};
