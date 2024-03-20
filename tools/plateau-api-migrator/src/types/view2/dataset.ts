import type { DataCatalogGroup, DataCatalogItem, DataCatalogTreeItem } from "./core";

// TODO: REFACTOR: CONFUSING REEXPORT
export type { DataCatalogItem, DataCatalogGroup, DataCatalogTreeItem };

export type RawDataCatalogTreeItem = RawDataCatalogGroup | RawDataCatalogItem;

export type RawDataCatalogGroup = {
  id: string;
  name: string;
  desc?: string;
  children: RawDataCatalogTreeItem[];
};

type RawRawDataCatalogItem = {
  id: string;
  itemId?: string;
  name?: string;
  pref: string;
  pref_code?: string;
  pref_code_i: number;
  city?: string;
  city_en?: string;
  city_code?: string;
  city_code_i: number;
  ward?: string;
  ward_en?: string;
  ward_code?: string;
  ward_code_i: number;
  type: string;
  type_en: string;
  type2?: string;
  type2_en?: string;
  format: string;
  layers?: string[] | string;
  layer?: string[] | string;
  url: string;
  desc: string;
  year: number;
  tags?: { type: "type" | "location"; value: string }[];
  openDataUrl?: string;
  config?: {
    data?: {
      name: string;
      type: string;
      url: string;
      layers?: string[] | string;
      layer?: string[] | string;
    }[];
  };
  order?: number;
  group?: string;
  /** force to disable making a folder even if type2 is present */
  root?: boolean;
  /** force to make a folder even if type is not special (included in typesWithFolders) */
  root_type?: boolean;
  /** alias of type that is used as a folder name */
  category?: string;
  infobox?: boolean;

  // bldg only fields
  search_index?: string;

  // internal
  path?: string[];
  code: number;
};

export type DataSource = "plateau" | "custom";

export type RawDataCatalogItem = Omit<RawRawDataCatalogItem, "layers" | "layer" | "config"> & {
  layers?: string[];
  config?: {
    data?: {
      name: string;
      type: string;
      url: string;
      layer?: string[];
    }[];
  };
};
