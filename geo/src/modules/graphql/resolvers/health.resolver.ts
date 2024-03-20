import { Args, ID, Query, Resolver } from "@nestjs/graphql";

import { Health } from "../dto/health";

@Resolver(() => Health)
export class HealthResolver {
  @Query(() => Health)
  async health(@Args("id", { type: () => ID }) id: string): Promise<Health> {
    return {
      id,
      date: new Date(),
    };
  }
}
