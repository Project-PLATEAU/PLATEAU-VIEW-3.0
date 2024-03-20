import { IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom, type SetStateAction } from "jotai";
import { anchorRef, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { MouseEvent, MouseEventHandler, useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useOptionalAtomValue } from "../../../shared/hooks";
import { flyToCamera, flyToLayerId, lookAtXYZ } from "../../../shared/reearth/utils";
import { findRootLayerAtom, rootLayersAtom } from "../../../shared/states/rootLayer";
import { BuildingSearchPanel } from "../../../shared/view/containers/BuildingSearchPanel";
import { Fields } from "../../../shared/view/fields/Fields";
import { OpenDataLink } from "../../../shared/view/selection/OpenDataLinkSection";
import { SwitchDataset } from "../../../shared/view/selection/SwitchDatasetSection";
import { SwitchGroup } from "../../../shared/view/selection/SwitchGroupSection";
import { BuildingLayerModel, RootLayerConfigForDataset } from "../../../shared/view-layers";
import { ComponentAtom } from "../../../shared/view-layers/component";
import { layerSelectionAtom, removeLayerAtom, type LayerType, LayerModel } from "../../layers";
import {
  AddressIcon,
  InfoIcon,
  InspectorHeader,
  SearchIcon,
  TrashIcon,
  VisibilityOffIcon,
  VisibilityOnIcon,
} from "../../ui-components";
import {
  BUILDING_LAYER,
  PEDESTRIAN_LAYER,
  layerTypeIcons,
  layerTypeNames,
} from "../../view-layers";
import { type LAYER_SELECTION, type SelectionGroup } from "../states/selection";
import { DatasetDialog } from "../ui-containers/DatasetDialog";

import { LayerHeatmapSection } from "./LayerHeatmapSection";
import { LayerHiddenFeaturesSection } from "./LayerHiddenFeaturesSection";
// import { LayerShowWireframeSection } from "./LayerShowWireframeSection";
import { LayerSketchSection } from "./LayerSketchSection";

type SupportedLayerType = Exclude<LayerType, typeof PEDESTRIAN_LAYER>;

export interface LayerContentProps<T extends SupportedLayerType> {
  values: (SelectionGroup & {
    type: typeof LAYER_SELECTION;
    subtype: T;
  })["values"];
}

export function LayerContent<T extends SupportedLayerType>({
  values,
}: LayerContentProps<T>): JSX.Element | null {
  invariant(values.length > 0);
  const buildingLayers = (values as LayerModel[]).filter(
    (v): v is BuildingLayerModel => v.type === BUILDING_LAYER,
  );
  const layer = values[0] as LayerModel<SupportedLayerType>;
  const type = layer.type;
  const findRootLayer = useSetAtom(findRootLayerAtom);
  const rootLayer = findRootLayer(layer.id);

  const rootLayerConfigs = useAtomValue(rootLayersAtom);
  const rootLayerConfig = useMemo(
    () =>
      rootLayerConfigs.find(
        (c): c is RootLayerConfigForDataset => c.type === "dataset" && c.id === layer.id,
      ),
    [rootLayerConfigs, layer],
  );

  const setSelection = useSetAtom(layerSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const hiddenAtom = useMemo(() => {
    const atoms = values.map(value => value.hiddenAtom);
    return atom(
      get => atoms.every(atom => get(atom)),
      (_get, set, value: SetStateAction<boolean>) => {
        atoms.forEach(atom => {
          set(atom, value);
        });
      },
    );
  }, [values]);

  const [hidden, setHidden] = useAtom(hiddenAtom);
  const handleToggleHidden = useCallback(() => {
    setHidden(value => !value);
  }, [setHidden]);

  const layerId = useAtomValue(layer.layerIdAtom);
  const cameraAtom = useMemo(() => ("cameraAtom" in layer ? layer.cameraAtom : undefined), [layer]);
  const layerCamera = useOptionalAtomValue(cameraAtom);
  const boundingSphere = useAtomValue(layer.boundingSphereAtom);
  const handleMove = useCallback(() => {
    const camera = rootLayer?.general?.camera;
    if (camera) {
      return flyToCamera(camera);
    }
    if (layerCamera) {
      return flyToCamera(layerCamera);
    }
    if (boundingSphere) {
      return lookAtXYZ(boundingSphere);
    }
    if (layerId) {
      return flyToLayerId(layerId);
    }
  }, [layerId, layerCamera, rootLayer?.general?.camera, boundingSphere]);

  const remove = useSetAtom(removeLayerAtom);
  const handleRemove = useCallback(() => {
    values.forEach(value => {
      remove(value.id);
    });
  }, [values, remove]);

  const components = useMemo(() => {
    const result: { [K in ComponentAtom["type"]]?: ComponentAtom["atom"][] } = {};
    for (const layer of values) {
      if (!("componentAtoms" in layer)) continue;

      for (const componentAtom of layer.componentAtoms ?? []) {
        if (result[componentAtom.type]) {
          result[componentAtom.type]?.push(componentAtom.atom);
          continue;
        }
        result[componentAtom.type] = [componentAtom.atom];
      }
    }
    return Object.entries(result) as [k: ComponentAtom["type"], v: ComponentAtom["atom"][]][];
  }, [values]);

  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfo = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setInfoOpen(true);
  }, []);
  const handleInfoClose = useCallback(() => {
    setInfoOpen(false);
  }, []);

  const buildingSearchPanelId = "BuildingSearchPanel";
  const buildingSearchPanelState = usePopupState({
    variant: "popover",
    popupId: buildingSearchPanelId,
  });
  const buildingSearchPanelRef = anchorRef(buildingSearchPanelState);
  const handleBuildingSearchPanelClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    _e => {
      buildingSearchPanelState.open();
    },
    [buildingSearchPanelState],
  );

  const layerName = layerTypeNames[type] ?? rootLayer?.layerName;

  return (
    <>
      <List disablePadding>
        <InspectorHeader
          actionsRef={buildingSearchPanelRef}
          title={
            values.length === 1
              ? `${layerName}レイヤー`
              : `${values.length}個の${layerName}レイヤー`
          }
          iconComponent={layerTypeIcons[type] ?? layerTypeIcons.USE_CASE_LAYER}
          actions={
            <>
              <Tooltip title={hidden ? "表示" : "隠す"}>
                <IconButton aria-label={hidden ? "表示" : "隠す"} onClick={handleToggleHidden}>
                  {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="移動">
                <span>
                  <IconButton aria-label="移動" disabled={layerId == null} onClick={handleMove}>
                    <AddressIcon />
                  </IconButton>
                </span>
              </Tooltip>
              {buildingLayers.length !== 0 && (
                <Tooltip title="検索">
                  <IconButton
                    {...bindTrigger(buildingSearchPanelState)}
                    aria-label="検索"
                    onClick={handleBuildingSearchPanelClick}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="出典">
                <span>
                  <IconButton
                    aria-label="出典"
                    onClick={handleInfo}
                    disabled={!rootLayerConfig || values.length !== 1}>
                    <InfoIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="削除">
                <IconButton aria-label="削除" onClick={handleRemove}>
                  <TrashIcon />
                </IconButton>
              </Tooltip>
            </>
          }
          onClose={handleClose}
        />
        <LayerHiddenFeaturesSection layers={values} />
        <OpenDataLink dataset={rootLayerConfig?.rawDataset} />
        <SwitchDataset layers={values} />
        <SwitchGroup layers={values} />
        <LayerHeatmapSection layers={values} />
        {components.map(([type, atoms]) => (
          <Fields key={type} layers={values} type={type} atoms={atoms} />
        ))}
        {/* <InspectorItem> */}
        {/* <LayerShowWireframeSection layers={values} />*/}
        <LayerSketchSection layers={values} />
        {/* </InspectorItem> */}
      </List>
      {rootLayerConfig && (
        <DatasetDialog
          open={infoOpen}
          dataset={rootLayerConfig.rawDataset}
          municipalityCode={rootLayerConfig.areaCode}
          onClose={handleInfoClose}
        />
      )}
      {buildingLayers.length !== 0 && (
        <BuildingSearchPanel
          key={layerId}
          state={buildingSearchPanelState}
          layer={layer}
          layerId={layerId}
        />
      )}
    </>
  );
}
