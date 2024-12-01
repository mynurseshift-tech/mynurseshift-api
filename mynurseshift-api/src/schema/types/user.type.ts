import { ObjectType, Field, ID } from "type-graphql";
import { BaseUserFields } from "./common.type";
import { ServiceRef, UserRef } from "./refs.type";

@ObjectType()
export class User extends BaseUserFields {}

@ObjectType()
export class UserWithRelations extends BaseUserFields {
  @Field(() => ID, { nullable: true })
  serviceId?: number;

  @Field(() => ServiceRef, { nullable: true })
  service?: ServiceRef;

  @Field(() => ID, { nullable: true })
  supervisorId?: number;

  @Field(() => UserRef, { nullable: true })
  supervisor?: UserRef;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}
