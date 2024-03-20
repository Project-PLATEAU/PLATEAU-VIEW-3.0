export type EmphasisProperty = {
  id: string;
  displayName: string;
  jsonPath: string;
  process?: string;
  visible?: boolean;
};

export type EmphasisPropertyTemplate = {
  id: string;
  type: "emphasis";
  name: string;
  properties: EmphasisProperty[];
};
