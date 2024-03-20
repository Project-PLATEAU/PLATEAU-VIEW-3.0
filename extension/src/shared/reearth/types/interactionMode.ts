export type InteractionModeType = "default" | "move" | "selection" | "sketch";

export type InteractionMode = {
  override?: (mode: InteractionModeType) => void;
  mode: InteractionModeType;
};
