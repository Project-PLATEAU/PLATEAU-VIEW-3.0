import { CustomLegend } from "../../../prototypes/datasets";

export const CUSTOM_LEGEND_SCHEME = "CUSTOM_LEGEND_SCHEME";
export type CustomLegendSchemeValue = {
  type: typeof CUSTOM_LEGEND_SCHEME;
  customLegends: CustomLegend[];
};
