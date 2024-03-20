import { writeFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parseAreasCSV } from "./parse-areas-csv.mjs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async () => {
  const codes = await parseAreasCSV();
  const pendings: Promise<{ buf: ArrayBuffer; code: string }>[] = [];
  const saveDownloadedFiles = async (threashold = 0) => {
    if (pendings.length < threashold) return;
    const datas = await Promise.all(pendings);
    pendings.length = 0;
    await Promise.all(
      datas.map(async ({ buf, code }) =>
        writeFile(path.resolve(__dirname, `../data/estatAreas/${code}.zip`), Buffer.from(buf)),
      ),
    );
  };

  const total = codes.length;
  let current = 0;
  for (const { code } of codes) {
    await saveDownloadedFiles(10);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      pendings.push(
        fetch(
          `https://www.e-stat.go.jp/gis/statmap-search/data?dlserveyId=B002005212020&code=${code}&coordSys=1&format=shape&downloadType=5&datum=2011`,
        )
          .then(r => r.arrayBuffer())
          .then(buf => ({
            buf,
            code,
          })),
      );
    } catch (e) {
      console.log(`${code} was failed: ${e}`);
    }

    current++;
    console.log(`${current} / ${total}`);
  }

  await saveDownloadedFiles();
};

main();
