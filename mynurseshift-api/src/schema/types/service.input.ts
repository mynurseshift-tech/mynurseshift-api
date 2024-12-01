import { InputType, Field, ID } from "type-graphql";
import { Status } from "@mynurseshift/types";

@InputType()
export class CreateServiceInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  capacity!: number;

  @Field(() => String)
  status!: Status;

  @Field(() => ID)
  poleId!: number;
}

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  capacity?: number;

  @Field(() => String, { nullable: true })
  status?: Status;

  @Field(() => ID, { nullable: true })
  poleId?: number;
}
