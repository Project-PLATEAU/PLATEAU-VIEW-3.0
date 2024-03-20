import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Area {
  @Field()
  type: "prefecture" | "municipality";

  @Field()
  code: string;

  @Field()
  name: string;

  @Field()
  radius: number;
}

@ObjectType()
export class Areas {
  @Field(() => [Area])
  areas: Area[];

  @Field()
  address: string;
}
