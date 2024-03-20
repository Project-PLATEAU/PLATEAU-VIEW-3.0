import { isBoolean, isNumber } from "class-validator";
import { atomWithStorageValidation, type AtomValue } from "../../shared-states";
import { atom } from "jotai";
// import { atomWithReset } from "jotai/utils";

export const compassBiasAtom = atomWithStorageValidation({
  key: "compassBias",
  initialValue: 0,
  validate: isNumber,
});

export const fovPiOverAtom = atomWithStorageValidation({
  key: "fovPiOver",
  initialValue: 1,
  validate: isNumber,
});

// export const cesiumLoadedAtom = atomWithReset({
//   key: "cesiumLoaded",
//   initialValue: false,
//   validate: isBoolean,
// });

export const cesiumLoadedAtom = atom(false);
export const arStartedAtom = atom(false);

type Feature = {
  // フィーチャーオブジェクトの型定義
  // 必要なプロパティを追加してください
};
export const selectedFeatureAtom = atomWithStorageValidation<Feature | null>({
  key: "selectedFeature",
  initialValue: null,
  validate: (value: unknown): value is Feature | null => 
  value === null || typeof value === "object",
});