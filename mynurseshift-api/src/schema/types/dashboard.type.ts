import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class DashboardStats {
  @Field()
  totalUsers!: number;

  @Field()
  pendingUsers!: number;

  @Field()
  activeUsers!: number;

  @Field()
  totalServices!: number;

  @Field()
  totalPoles!: number;
}
