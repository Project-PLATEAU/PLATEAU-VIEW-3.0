import { Module } from "@nestjs/common";

import { CESIUM } from "./constants";
import { importCesium } from "./helpers";

@Module({
  providers: [
    {
      provide: CESIUM,
      useFactory: async () => await importCesium(),
    },
  ],
  exports: [CESIUM],
})
export class CesiumModule {}
