import { Json } from "./json";

function walkForDate(obj: any) {
  if (!obj || typeof obj !== "object") return;
  for (const key in obj) {
    if (obj[key] === "0001-01-01") {
      obj[key] = "不明";
      continue;
    }
    if (typeof obj[key] === "object" && obj[key] !== null) {
      walkForDate(obj[key]);
    }
  }
  return obj;
}

export function replaceUnknownDate(attributes: Json): Json {
  if (!attributes) return attributes;
  return walkForDate(attributes);
}
