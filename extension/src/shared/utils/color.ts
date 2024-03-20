import { hexToRgb } from "@mui/system";

export const hexToRGBArray = (color: string) =>
  hexToRgb(color).slice("rgb(".length, -")".length).split(/, |,/).map(Number);
