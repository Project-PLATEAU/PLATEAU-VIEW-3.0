import { PrimitiveAtom, atom } from "jotai";
import { atomWithReset } from "jotai/utils";

import { LayerModel } from "../../prototypes/layers";
import { Setting } from "../api/types";
import { sharedAtom, sharedStoreAtom, sharedStoreAtomWrapper } from "../sharedAtoms";
import { RootLayerConfig } from "../view-layers";

export const CURRENT_COMPONENT_GROUP_ID = "CURRENT_COMPONENT_GROUP_ID";
export const CURRENT_DATA_ID = "CURRENT_DATA_ID";

// ここで追加中のデータセットのリストを持っている? (とは言いつつ不使用っぽい)
export const addedDatasetIdList = sharedStoreAtom(
  sharedAtom<string[]>("ADDED_DATASET_ID_LIST", []),
);

export const rootLayersBaseAtom = atomWithReset<RootLayerConfig[]>([]);
// 追加中のレイヤーの一覧はここで持っているっぽい
// RootLayerConfigの配列となっていて、RootLayerConfigは rawDataset: DatasetFragmentFragment を持っている
// よって、一応ARViewでもrootLayersAtomを利用してあげることもできるが、ARViewではレイヤー機能?は使用しないと思われるので、自前で管理しても良さそうではある
export const rootLayersAtom = sharedStoreAtomWrapper("ROOT_LAYERS", rootLayersBaseAtom);
export const rootLayersLayersAtom = atom<LayerModel[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom);
    return get(rootLayer.layer) as LayerModel;
  });
});
export const rootLayersLayerAtomsAtom = atom<PrimitiveAtom<LayerModel>[]>(get => {
  return get(rootLayersAtom).map(root => {
    const rootLayer = get(root.rootLayerAtom);
    return rootLayer.layer as PrimitiveAtom<LayerModel>;
  });
});

export const updateRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(l => l.id === setting.datasetId);
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
  const layerIds = rootLayers.map(l => l.id);
  const settingsMap = settings.reduce((res, s) => {
    if (layerIds.includes(s.datasetId)) {
      res[s.datasetId] ? res[s.datasetId].push(s) : (res[s.datasetId] = [s]);
    }
    return res;
  }, {} as Record<string, Setting[]>);

  for (const layer of rootLayers) {
    const settings = settingsMap[layer.id];
    if (settings) {
      set(layer.settingsAtom, settings);
    }
  }
});

export const removeRootLayerBySetting = atom(undefined, (get, set, setting: Setting) => {
  const rootLayers = get(rootLayersAtom);
  const layer = rootLayers.find(l => l.id === setting.datasetId);
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
    // Force to recreate each root layer to update templates.
    set(layer.settingsAtom, get(layer.settingsAtom));
  }
});

export const findRootLayerAtom = atom(undefined, (get, _, id: string) => {
  const rootLayers = get(rootLayersAtom);
  const rootLayerConfig = rootLayers.find(r => r.id === id);
  if (!rootLayerConfig) return;
  const rootLayer = get(rootLayerConfig.rootLayerAtom);
  return rootLayer;
});
