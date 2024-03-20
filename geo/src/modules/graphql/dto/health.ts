import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Health {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;
}
