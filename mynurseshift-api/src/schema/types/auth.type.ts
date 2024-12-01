import { InputType, Field } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  email!: string;

  @Field()
  newPassword!: string;

  @Field()
  token!: string;
}
