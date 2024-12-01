import { Field, ID, ObjectType } from "type-graphql";
import { UserRole, UserStatus } from "@mynurseshift/types";

@ObjectType()
export class BaseType {
  @Field(() => ID)
  id!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class BaseUserFields extends BaseType {
  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => String)
  role!: UserRole;

  @Field(() => String)
  status!: UserStatus;

  @Field({ nullable: true })
  position?: string;

  @Field(() => String, { nullable: true })
  workingHours?: Record<string, any>;
}
