import { NonEmptyArray } from "type-graphql";
import { UserResolver } from "./user.resolver";
import { PoleResolver } from "./pole.resolver";
import { ServiceResolver } from "./service.resolver";
import { DashboardResolver } from "./dashboard.resolver";

export const resolvers: NonEmptyArray<Function> = [
  UserResolver,
  PoleResolver,
  ServiceResolver,
  DashboardResolver,
];
