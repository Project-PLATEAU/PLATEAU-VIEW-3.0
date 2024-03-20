import { Module } from "@nestjs/common";

import { HealthResolver } from "../resolvers/health.resolver";

@Module({
  providers: [HealthResolver],
})
export class HealthModule {}
