import { atom, type SetStateAction } from "jotai";

import { type ReverseGeocoderResult } from "../../prototypes/view/hooks/useReverseGeocoder";

export interface Address<R extends boolean = boolean> {
  areas: Array<Area<R>>;
  address?: string;
}

export interface AreaCodes {
  prefectures: Record<string, string>;
  municipalities: Record<string, string | [string, string] | [string, string[]]>;
}

export type AreaRadii = Record<string, number>;

export type AreaType = "prefecture" | "municipality";

export interface Area<R extends boolean = boolean> {
  type: AreaType;
  code: string;
  name: string;
  radius: R extends true ? number : number | undefined;
}

export type PrefectureArea<R extends boolean = boolean> = Area<R> & {
  type: "prefecture";
};

export type MunicipalityArea<R extends boolean = boolean> = Area<R> & {
  type: "municipality";
};

const addressPrimitiveAtom = atom<ReverseGeocoderResult, [SetStateAction<ReverseGeocoderResult>], unknown>(null, null);

export const addressAtom = atom(
  get => get(addressPrimitiveAtom),
  (get, set, value: SetStateAction<ReverseGeocoderResult | null>) => {
    set(addressPrimitiveAtom, value);

    // Propagate changes to municipality and prefecture.
    const address = get(addressPrimitiveAtom) as ReverseGeocoderResult | null;
    set(areasPrimitiveAtom, prevValue =>
      address != null
        ? address.areas[0]?.code !== prevValue?.[0]?.code
          ? address.areas
          : prevValue
        : null,
    );
    set(prefecturePrimitiveAtom, prevValue =>
      address != null
        ? address.areas[address.areas.length - 1]?.code !== prevValue?.code
          ? address.areas.find(
              (area: Area): area is PrefectureArea => area.type === "prefecture",
            ) ?? null
          : prevValue
        : null,
    );
  },
);

const areasPrimitiveAtom = atom<Area<boolean>[], unknown[], unknown>(null, null);
export const areasAtom = atom(get => get(areasPrimitiveAtom));

const prefecturePrimitiveAtom = atom<PrefectureArea<boolean>, unknown[], unknown>(null, null);
export const prefectureAtom = atom(get => get(prefecturePrimitiveAtom));
