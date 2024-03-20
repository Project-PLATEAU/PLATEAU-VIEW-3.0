import { createReadStream } from "fs";
import { open } from "fs/promises";
import path from "path";
import { type Readable } from "stream";

import { type TileFormat, type Coordinates } from "@prototypes/type-helpers";
import { mkdirp } from "mkdirp";
import { type Sharp } from "sharp";

import { type TileCache } from "./interfaces/TileCache";

export class FileCache implements TileCache {
  constructor(private readonly cacheRoot: string) {}

  private makePath(name: string, coords: Coordinates, format: TileFormat): string {
    const { x, y, level } = coords;
    return path.resolve(this.cacheRoot, name, `${level}/${x}/${y}.${format}`);
  }

  async get(
    name: string,
    coords: Coordinates,
    format: TileFormat,
  ): Promise<string | Readable | undefined> {
    try {
      return createReadStream("", {
        fd: await open(this.makePath(name, coords, format), "r"),
      });
    } catch (error) {
      console.error(error);
    }
    return undefined;
  }

  async set(name: string, coords: Coordinates, format: TileFormat, image: Sharp): Promise<void> {
    const cachePath = this.makePath(name, coords, format);
    await mkdirp(path.dirname(cachePath));
    await image.toFile(cachePath);
  }
}
