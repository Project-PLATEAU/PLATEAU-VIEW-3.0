import { Module } from "@nestjs/common";

import { AreasResolver } from "../resolvers/areas.resolver";

@Module({
  providers: [AreasResolver],
})
export class AreasModule {}
