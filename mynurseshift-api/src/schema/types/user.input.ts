import { InputType, Field, ID } from "type-graphql";
import { UserRole } from "@mynurseshift/types";

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  password!: string;

  @Field(() => String)
  role!: UserRole;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  position?: string;

  @Field(() => String, { nullable: true })
  workingHours?: Record<string, any>;

  @Field(() => ID, { nullable: true })
  serviceId?: number;

  @Field(() => ID, { nullable: true })
  supervisorId?: number;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  role?: UserRole;

  @Field({ nullable: true })
  position?: string;

  @Field(() => String, { nullable: true })
  workingHours?: Record<string, any>;

  @Field(() => ID, { nullable: true })
  serviceId?: number;

  @Field(() => ID, { nullable: true })
  supervisorId?: number;
}
