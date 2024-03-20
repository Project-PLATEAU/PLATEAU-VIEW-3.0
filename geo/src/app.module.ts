import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GraphQLAppModule } from "./modules/graphql/app.module";
import { TerrainModule } from "./modules/terrain/app.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLAppModule,
    TerrainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
