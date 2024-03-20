import { useTheme } from "@mui/material";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { LayerType } from "../../prototypes/layers";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { useOptionalPrimitiveAtom } from "../hooks";
import { GeneralProps, GeneralLayer, GENERAL_FEATURE, GTFSLayer } from "../reearth/layers";
import { MVTLayer } from "../reearth/layers/mvt";
import { WMSLayer } from "../reearth/layers/wms";
import { CameraPosition, Data } from "../reearth/types";
import { Properties } from "../reearth/utils";

type MyDataContainerProps = Omit<GeneralProps, "appearances" | "appendData"> & {
  id: string;
  layerIdAtom: PrimitiveAtom<string | null>;
  propertiesAtom: PrimitiveAtom<Properties | null>;
  selections?: ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[];
  hidden: boolean;
  type: LayerType;
  layers?: string[];
  csv?: Data["csv"];
  cameraAtom?: PrimitiveAtom<CameraPosition | undefined>;
};

export const MyDataLayerContainer: FC<MyDataContainerProps> = ({
  id,
  onLoad,
  layerIdAtom,
  propertiesAtom,
  hidden,
  format,
  cameraAtom,
  csv,
  ...props
}) => {
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  const [, setCamera] = useAtom(useOptionalPrimitiveAtom(cameraAtom));

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
      setProperties(new Properties(layerId));

      if (camera) {
        setCamera(camera);
      }
    },
    [onLoad, setProperties, setLayerId, setCamera],
  );

  const appendData: Partial<Data> = useMemo(
    () => ({
      csv,
    }),
    [csv],
  );

  const theme = useTheme();

  if (format === "gtfs") {
    return (
      <GTFSLayer
        {...props}
        onLoad={handleLoad}
        // appearances={generalAppearances}
        visible={!hidden}
      />
    );
  }

  if (format === "mvt") {
    return (
      <MVTLayer
        {...props}
        onLoad={handleLoad}
        // appearances={generalAppearances}
        visible={!hidden}
      />
    );
  }

  if (format === "wms") {
    return (
      <WMSLayer
        {...props}
        onLoad={handleLoad}
        // appearances={generalAppearances}
        visible={!hidden}
      />
    );
  }

  return (
    <GeneralLayer
      {...props}
      appendData={appendData}
      format={format}
      onLoad={handleLoad}
      visible={!hidden}
      selectedFeatureColor={theme.palette.primary.main}
    />
  );
};
