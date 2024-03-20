import { PrimitiveAtom, atom } from "jotai";
import { splitAtom } from "jotai/utils";

import { Setting } from "../api/types";

import {
  removeRootLayerBySetting,
  updateRootLayerBySetting,
  updateRootLayerBySettings,
} from "./rootLayer";

export const settingsAtom = atom<Setting[]>([]);
export const settingsAtomsAtom = splitAtom(settingsAtom);

export const addSettingAtom = atom(undefined, (_get, set, setting: Setting) => {
  set(updateRootLayerBySetting, setting);
  set(settingsAtomsAtom, {
    type: "insert",
    value: setting,
  });
});

export const removeSettingAtom = atom(undefined, (get, set, setting: PrimitiveAtom<Setting>) => {
  set(removeRootLayerBySetting, get(setting));
  set(settingsAtomsAtom, {
    type: "remove",
    atom: setting,
  });
});

export const updateSettingAtom = atom(undefined, (get, set, setting: Setting) => {
  set(updateRootLayerBySetting, setting);

  const settings = get(settingsAtomsAtom);
  const settingAtom = settings.find(s => {
    const prevSetting = get(s);
    return prevSetting.datasetId === setting.datasetId && prevSetting.dataId === setting.dataId;
  });
  if (settingAtom) {
    set(settingAtom, setting);
  } else {
    set(addSettingAtom, setting);
  }
});

export const updateAllSettingAtom = atom(undefined, (_get, set, settings: Setting[]) => {
  set(updateRootLayerBySettings, settings);
  set(settingsAtom, settings);
});

export const filterSettingAtom = atom(
  undefined,
  (get, _set, filter: (setting: Setting) => boolean) => {
    return get(settingsAtomsAtom).filter(s => filter(get(s)));
  },
);
