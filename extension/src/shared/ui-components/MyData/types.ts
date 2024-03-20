import {
  AdditionalData,
  DataCatalogItem,
} from "../../../../../tools/plateau-api-migrator/src/types/view2/core";

export type UserDataItem = Partial<DataCatalogItem> & {
  description?: string;
  additionalData?: AdditionalData;
  layers?: string[];
};
