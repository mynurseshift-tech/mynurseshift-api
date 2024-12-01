import { InputType, Field, ID } from "type-graphql";
import { Status } from "@mynurseshift/types";

@InputType()
export class CreatePoleInput {
  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field()
  description!: string;

  @Field(() => String)
  status!: Status;
}

@InputType()
export class UpdatePoleInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  status?: Status;
}
