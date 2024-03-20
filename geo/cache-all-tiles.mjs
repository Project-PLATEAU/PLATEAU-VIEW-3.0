import fs from "fs";

import csv from "csv-parser";

const parseCSV = () =>
  new Promise(resolve => {
    const results = [];
    fs.createReadStream("all-tiles.csv")
      .pipe(csv({ headers: false }))
      .on("data", data => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });

const wait = n => new Promise(resolve => setTimeout(resolve, n));

const FROM = Number(process.env.FROM) || 0;

const MAP_STYLES = ["light-map", "dark-map"];

/**
 * USEAGE
 * 1. Download file(70MB) https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/mokuroku.csv.gz
 * 2. Rename the file to all-tiles.csv
 * 3. Run `PORT=8083 yarn start`
 * 4. Run `node cache-all-tiles.mjs`
 */
const main = async () => {
  console.log("===== START =====");
  const allTiles = await parseCSV();
  console.log("===== PARSED CSV =====");
  const pendings = [];
  let total = FROM;
  const tiles = allTiles.slice(FROM);
  console.log(tiles.length, allTiles.length - FROM, total);
  for (const tile of tiles) {
    const path = tile?.["0"]?.slice(0, -4);
    if (!path) continue;
    if (pendings.length >= 100) {
      console.log(`===== FETCHING ${pendings.length} tiles =====`);
      await Promise.all(pendings);
      await wait(10);
      total += pendings.length / MAP_STYLES.length;
      console.log(`===== FETCHED: ${total}/${allTiles.length}  =====`);
      pendings.length = 0;
    }
    MAP_STYLES.forEach(m =>
      pendings.push(fetch(`http://localhost:8083/${m}/${path}.png`).then(r => r.arrayBuffer())),
    );
  }
  await Promise.all(pendings);
  console.log(`===== COMPLETED: ${total + pendings.length}/${allTiles.length} =====`);
};

main();
