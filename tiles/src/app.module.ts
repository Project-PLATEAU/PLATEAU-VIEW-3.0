import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";


import { TileAppModule } from "./modules/tiles/app.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TileAppModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
