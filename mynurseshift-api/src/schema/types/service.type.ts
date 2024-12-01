import { ObjectType, Field, ID } from "type-graphql";
import { BaseType } from "./common.type";
import { PoleRef, UserRef } from "./refs.type";
import { Status } from "@mynurseshift/types";

@ObjectType()
export class Service extends BaseType {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  capacity!: number;

  @Field(() => String)
  status!: Status;
}

@ObjectType()
export class ServiceWithRelations extends Service {
  @Field(() => ID)
  poleId!: number;

  @Field(() => PoleRef)
  pole!: PoleRef;

  @Field(() => [UserRef])
  users!: UserRef[];
}
