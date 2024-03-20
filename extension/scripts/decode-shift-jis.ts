import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import Iconv from "iconv-lite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async (dir: string) => {
  const dirPath = path.resolve(__dirname, dir);
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.resolve(dirPath, file);
    const fileBuf = await fs.readFile(filePath);
    const convertedFile = Iconv.decode(fileBuf, "Shift_JIS");
    await fs.writeFile(filePath, convertedFile);
  }
};

for (const target of ["../public/estat/T001102", "../public/estat/T001109"]) {
  await main(target);
}
