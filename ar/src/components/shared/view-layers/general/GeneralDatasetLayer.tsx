import { WritableAtom, atom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo } from "react";

import type { LayerProps } from "../../../prototypes/layers";
import { ScreenSpaceSelectionEntry } from "../../../prototypes/screen-space-selection";
import { createViewLayerModel, ConfigurableLayerModel } from "../../../prototypes/view-layers";
import { GeneralLayerContainer } from "../../layerContainers/general";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Events } from "../../reearth/types";
import { Properties } from "../../reearth/utils";
import { findRootLayerAtom } from "../../states/rootLayer";
import { LayerModel, LayerModelParams } from "../model";

import { GENERAL_FORMAT } from "./format";
import { GeneralLayerType } from "./types";
import { PlateauTilesetProperties } from "../../plateau";

export interface GeneralLayerModelParams extends LayerModelParams {
  title: string;
  municipalityCode: string;
  type: GeneralLayerType;
}

export interface GeneralLayerModel extends LayerModel {
  municipalityCode: string;
  title: string;
  propertiesAtom: WritableAtom<PlateauTilesetProperties | null, [PlateauTilesetProperties | null], any>;
}

export function createGeneralDatasetLayer(
  params: GeneralLayerModelParams,
): ConfigurableLayerModel<GeneralLayerModel> {
  return {
    ...createViewLayerModel(params),
    type: params.type,
    municipalityCode: params.municipalityCode,
    title: params.title,
    propertiesAtom: atom<PlateauTilesetProperties | null, any[], unknown>(null, null),
  };
}

export const GeneralDatasetLayer: FC<LayerProps<GeneralLayerType>> = ({
  id,
  format,
  url,
  type,
  title,
  layers,
  titleAtom,
  hiddenAtom,
  layerIdAtom,
  selections,
  propertiesAtom,
  componentAtoms,
  cameraAtom,
  // showWireframeAtom,
}) => {
  const hidden = useAtomValue(hiddenAtom);

  const setLayerId = useSetAtom(layerIdAtom);
  const handleLoad = useCallback(
    (layerId: string) => {
      setLayerId(layerId);
    },
    [setLayerId],
  );

  const setTitle = useSetAtom(titleAtom);
  useEffect(() => {
    setTitle(title ?? null);
  }, [title, setTitle]);

  const findRootLayer = useSetAtom(findRootLayerAtom);
  const rootLayer = findRootLayer(id);
  const general = rootLayer?.general;
  const events: Events | undefined = useMemo(
    () =>
      general?.featureClickEvent?.eventType === "openNewTab"
        ? {
            select: {
              openUrl: {
                ...(general.featureClickEvent.urlType === "manual"
                  ? { url: general.featureClickEvent.websiteURL }
                  : { urlKey: general.featureClickEvent.fieldName }),
              },
            },
          }
        : undefined,
    [general?.featureClickEvent],
  );
  const updateInterval = useMemo(
    () =>
      general?.dataFetching?.enabled
        ? (general?.dataFetching?.timeInterval ?? 0) * 1000
        : undefined,
    [general?.dataFetching],
  );

  // useEffect(() => {
  //   if (datum == null) {
  //     return;
  //   }
  //   setVersion(datum.version);
  //   setLod(datum.lod);
  //   setTextured(datum.textured);
  // }, [setVersion, setLod, setTextured, datum]);

  // TODO(ReEarth): Need a wireframe API
  // const showWireframe = useAtomValue(showWireframeAtom);

  if (!url) {
    return null;
  }
  if (format && GENERAL_FORMAT.includes(format)) {
    return (
      <GeneralLayerContainer
        id={id}
        url={url}
        format={format}
        layers={layers}
        type={type}
        onLoad={handleLoad}
        layerIdAtom={layerIdAtom}
        cameraAtom={cameraAtom}
        hidden={hidden}
        // component={PlateauBuildingTileset}
        // hiddenFeaturesAtom={hiddenFeaturesAtom}
        propertiesAtom={propertiesAtom}
        selections={selections as ScreenSpaceSelectionEntry<typeof GENERAL_FEATURE>[]}
        componentAtoms={componentAtoms}
        events={events}
        updateInterval={updateInterval}
        // showWireframe={showWireframe}
      />
    );
  }
  return null;
};
