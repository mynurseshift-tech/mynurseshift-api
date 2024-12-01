import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class BaseType {
  @Field(() => ID)
  id!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
