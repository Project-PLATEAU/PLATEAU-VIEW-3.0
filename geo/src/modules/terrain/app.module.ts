import { Module } from "@nestjs/common";
import { FirestoreCoreModule } from "@prototypes/nest-firestore/FirestoreCoreModule";
import { TerrainTileModule } from "@prototypes/nest-terrain-tile";
import { TileCacheModule } from "@prototypes/nest-tile-cache";

@Module({
  imports: [
    FirestoreCoreModule.forRoot({
      rootPath: "api",
      projectId: process.env.GOOGLE_PROJECT_ID !== "" ? process.env.GOOGLE_PROJECT_ID : undefined,
    }),
    TileCacheModule.forRootAsync({
      // if you don't use useFactory process.env.TILE_CACHE_ROOT will be undefined.
      // source: https://stackoverflow.com/questions/67482900/nestjs-not-reading-environmental-variables
      useFactory: () => {
        return {
          cacheRoot: process.env.TILE_CACHE_ROOT !== "" ? process.env.TILE_CACHE_ROOT : undefined,
        };
      },
    }),
    TerrainTileModule.forRoot({
      path: "terrain",
      disableCache: process.env.TILE_CACHE_ROOT == null || process.env.TILE_CACHE_ROOT === "",
    }),
  ],
})
export class TerrainModule {}
