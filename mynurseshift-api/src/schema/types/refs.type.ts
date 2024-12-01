import { ObjectType, Field, ID } from "type-graphql";

@ObjectType("GraphQLUserRef")
export class UserRef {
  @Field(() => ID)
  id!: number;
}

@ObjectType("GraphQLPoleRef")
export class PoleRef {
  @Field(() => ID)
  id!: number;
}

@ObjectType("GraphQLServiceRef")
export class ServiceRef {
  @Field(() => ID)
  id!: number;
}
