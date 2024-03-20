import { join } from "path";

import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { EstatAreasModule } from "@prototypes/nest-estat-areas";
import { FirestoreModule } from "@prototypes/nest-firestore";

import { GraphQLAppController } from "./app.controller";
import { GraphQLAppService } from "./app.service";
import { AreasModule } from "./modules/areas.module";
import { HealthModule } from "./modules/health.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cache: "bounded",
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      include: [HealthModule, AreasModule],
    }),
    HealthModule,
    AreasModule,
    FirestoreModule.forRoot({
      rootPath: "api",
      projectId: process.env.GOOGLE_PROJECT_ID !== "" ? process.env.GOOGLE_PROJECT_ID : undefined,
    }),
    EstatAreasModule.forRoot({}),
  ],
  controllers: [GraphQLAppController],
  providers: [GraphQLAppService],
})
export class GraphQLAppModule {}
