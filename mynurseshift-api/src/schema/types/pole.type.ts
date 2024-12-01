import { ObjectType, Field } from "type-graphql";
import { BaseType } from "./common.type";
import { ServiceRef } from "./refs.type";
import { Status } from "@mynurseshift/types";

@ObjectType()
export class Pole extends BaseType {
  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String)
  status!: Status;
}

@ObjectType()
export class PoleWithRelations extends Pole {
  @Field(() => [ServiceRef], { nullable: true })
  services?: ServiceRef[];
}
