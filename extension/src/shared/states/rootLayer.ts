import { PrimitiveAtom, atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { LayerModel } from "../../prototypes/layers";
import { Setting } from "../api/types";
import { sharedAtom, sharedStoreAtom } from "../sharedAtoms";
import { RootLayerAtom, RootLayerConfig, RootLayerConfigForDataset } from "../view-layers";

export const CURRENT_COMPONENT_GROUP_ID = "CURRENT_COMPONENT_GROUP_ID";
export const CURRENT_DATA_ID = "CURRENT_DATA_ID";

export const addedDatasetIdList = sharedStoreAtom(
  sharedAtom<string[]>("ADDED_DATASET_ID_LIST", []),
);

export const rootLayersAtom = atomWithReset<RootLayerConfig[]>([]);
export const rootLayersLayersAtom = atom<LayerModel[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom as RootLayerAtom);
    return get(rootLayer.layer) as LayerModel;
  });
});
export const rootLayersLayerAtomsAtom = atom<PrimitiveAtom<LayerModel>[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom as RootLayerAtom);
    return rootLayer.layer as PrimitiveAtom<LayerModel>;
  });
});

export const updateRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(
    (l): l is RootLayerConfigForDataset => l.type === "dataset" && l.id === setting.datasetId,
  );
  if (!layer) {
    return;
  }
  const currentSettings = [...get(layer.settingsAtom)];
  const settingIndex = currentSettings.findIndex(c => c.id === setting.id);
  if (settingIndex === -1) {
    currentSettings.push(setting);
  } else {
    currentSettings[settingIndex] = setting;
  }
  set(layer.settingsAtom, currentSettings);
});

export const updateRootLayerBySettings = atom(undefined, (get, set, settings: Setting[]) => {
  const rootLayers = get(rootLayersAtom);
  const layerIds = rootLayers.map(l => l.type === "dataset" && l.id);
  const settingsMap = settings.reduce((res, s) => {
    if (layerIds.includes(s.datasetId)) {
      res[s.datasetId] ? res[s.datasetId].push(s) : (res[s.datasetId] = [s]);
    }
    return res;
  }, {} as Record<string, Setting[]>);

  for (const layer of rootLayers) {
    if (layer.type !== "dataset") continue;
    const settings = settingsMap[layer.id];
    if (settings) {
      set(layer.settingsAtom, settings);
    }
  }
});

export const removeRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(
    (l): l is RootLayerConfigForDataset => l.type === "dataset" && l.id === setting.datasetId,
  );
  if (!layer) {
    return;
  }
  set(
    layer.settingsAtom,
    get(layer.settingsAtom).filter(s => s.id !== setting.id),
  );
});

export const forceUpdateRootLayer = atom(undefined, (get, set) => {
  const rootLayers = get(rootLayersAtom);
  for (const layer of rootLayers) {
    if (layer.type !== "dataset") continue;
    // Force to recreate each root layer to update templates.
    set(layer.settingsAtom, get(layer.settingsAtom));
  }
});

export const findRootLayerAtom = atom(undefined, (get, _, id: string) => {
  const rootLayers = get(rootLayersAtom);
  const rootLayerConfig = rootLayers.find(
    (r): r is RootLayerConfigForDataset =>
      (r.type === "dataset" && r.id === id) ||
      (r.type === "layer" && get(get(r.rootLayerAtom).layer).type === "MY_DATA_LAYER"),
  );
  if (!rootLayerConfig) return;
  const rootLayer = get(rootLayerConfig.rootLayerAtom);
  return rootLayer;
});
