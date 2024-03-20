import { readFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

export const parseAreasCSV = async () => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const { csvParseRows } = await import("d3");
  // Download all_area_codes from here: https://www.stat.go.jp/data/mesh/csv/13.csv
  const data = await readFile(path.resolve(__dirname, "../data/all_area_codes.csv"), {
    encoding: "utf-8",
  });
  const codes: { code: string; CSS_NAME: string }[] = [];
  csvParseRows(data, (row, index): undefined => {
    if (index <= 1) return;
    const code = row[2].padStart(5, "0");
    const CSS_NAME = row[6];
    if (!code) {
      throw new Error(`Code is invalid: ${code}`);
    }
    const hasWard = !!row[6];
    if (!hasWard) return;
    codes.push({ code, CSS_NAME });
  });
  return codes;
};
