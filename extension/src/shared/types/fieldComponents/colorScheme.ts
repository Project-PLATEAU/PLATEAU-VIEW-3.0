export const VALUE_COLOR_SCHEME = "VALUE_COLOR_SCHEME";
export type ValueColorSchemeValue = {
  type: typeof VALUE_COLOR_SCHEME;
  color: string | undefined;
  strokeColor?: string;
};

export const CONDITIONAL_COLOR_SCHEME = "CONDITIONAL_COLOR_SCHEME";
export type ConditionalColorSchemeValue = {
  type: typeof CONDITIONAL_COLOR_SCHEME;
  currentRuleId: string | undefined;
  overrideRules: {
    ruleId: string;
    conditionId: string;
    color: string;
    strokeColor?: string;
  }[];
  useDefault: boolean; // Whether use first rule as default rule or not. Otherwise default will be "none".
};

export const FLOOD_COLOR_SCHEME = "FLOOD_COLOR_SCHEME";
export type FloodColorSchemeValue = {
  type: typeof FLOOD_COLOR_SCHEME;
  overrideConditions: {
    conditionId: string;
    color: string;
  }[];
};

export const GRADIENT_COLOR_SCHEME = "GRADIENT_COLOR_SCHEME";
export type GradientColorSchemeValue = {
  type: typeof GRADIENT_COLOR_SCHEME;
  currentRuleId: string | undefined;
  currentColorMapName: string | undefined;
  currentMin: number | undefined;
  currentMax: number | undefined;
  useDefault: boolean; // Whether use first rule as default rule or not. Otherwise default will be "none".
};
