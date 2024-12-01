import { Field, ObjectType, ID, registerEnumType } from "type-graphql";

export enum UserRole {
  ADMIN = "ADMIN",        // Cadre de santé
  SUPERADMIN = "SUPERADMIN", // Administration
  USER = "USER",          // Infirmier
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "Rôle de l'utilisateur",
});

registerEnumType(UserStatus, {
  name: "UserStatus",
  description: "Statut de l'utilisateur",
});

@ObjectType()
export class Service {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  capacity: number;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => String, { nullable: true })
  position?: string;

  @Field(() => Service, { nullable: true })
  service?: Service;

  @Field(() => User, { nullable: true })
  supervisor?: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class Pole {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Service], { nullable: true })
  services?: Service[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class DashboardStats {
  @Field()
  totalUsers: number;

  @Field()
  totalPoles: number;

  @Field()
  totalServices: number;

  @Field()
  pendingValidations: number;

  @Field(() => [User])
  recentUsers: User[];

  @Field(() => [ValidationRecord])
  recentValidations: ValidationRecord[];
}

@ObjectType()
export class ValidationRecord {
  @Field(() => ID)
  id: number;

  @Field(() => User)
  user: User;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => Date)
  createdAt: Date;
}
