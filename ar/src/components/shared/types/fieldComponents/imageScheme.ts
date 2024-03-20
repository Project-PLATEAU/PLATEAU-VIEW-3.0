export const VALUE_IMAGE_SCHEME = "VALUE_IMAGE_SCHEME";
export type ValueImageSchemeValue = {
  type: typeof VALUE_IMAGE_SCHEME;
  imageURL: string | undefined;
  imageColor: string | undefined;
};

export const CONDITIONAL_IMAGE_SCHEME = "CONDITIONAL_IMAGE_SCHEME";
export type ConditionalImageSchemeValue = {
  type: typeof CONDITIONAL_IMAGE_SCHEME;
  currentRuleId: string | undefined;
  overrideRules: {
    ruleId: string;
    conditionId: string;
    imageURL: string;
    imageColor: string;
  }[];
};
