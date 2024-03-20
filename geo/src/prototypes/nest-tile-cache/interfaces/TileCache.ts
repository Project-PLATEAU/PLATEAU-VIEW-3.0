import { type Readable } from "stream";

import { type Coordinates, type TileFormat } from "@prototypes/type-helpers";
import { type Sharp } from "sharp";

export interface TileCache {
  get: (
    name: string,
    coords: Coordinates,
    format: TileFormat,
  ) => Promise<Readable | string | undefined>;
  set: (name: string, coords: Coordinates, format: TileFormat, image: Sharp) => Promise<void>;
}
