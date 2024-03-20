import { RGBA } from "../types";

export const string = (v: string) => {
  return `"${v}"`;
};

export const color = (v: string, alpha: number) => {
  return `color("${v}", ${alpha})`;
};

export const number = (v: number) => {
  return `${v}`;
};

export const numberOrString = (v: number | string) => {
  return typeof v === "number" ? number(v) : string(v);
};

export const variable = (v: string) => {
  return `\${${v}}`;
};

export const defaultConditionalNumber = (prop: string, defaultValue?: number) =>
  `((${variable(prop)} === "" || ${variable(prop)} === null || isNaN(Number(${variable(
    prop,
  )}))) ? ${defaultValue || 1} : Number(${variable(prop)}))`;

export const condition = (cond: string, v: string, el: string) => {
  return `((${cond}) ? ${v} : ${el})`;
};

export const rgba = (rgba: RGBA) => {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};
