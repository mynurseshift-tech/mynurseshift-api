import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  ObjectType,
  Field,
} from "type-graphql";
import {
  User,
  UserWithRelations,
  Service,
  Pole,
  AuthPayload,
  LoginInput,
  ResetPasswordInput,
} from "../types/index";
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  loginSchema,
  resetPasswordSchema,
  UserRole,
  UserStatus,
} from "@mynurseshift/types";
import { CreateUserInput, UpdateUserInput } from "../types/user.input";
import { MyContext } from "../../types/context.types";
import prisma from "../../prisma";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { Role } from "@prisma/client";
import * as userController from '../../controllers/userController';

const convertUserRoleToPrismaRole = (role: UserRole): Role => {
  switch (role) {
    case UserRole.USER:
      return Role.USER;
    case UserRole.ADMIN:
      return Role.ADMIN;
    case UserRole.SUPERADMIN:
      return Role.SUPERADMIN;
    default:
      throw new Error("Invalid role");
  }
};

const convertPrismaRoleToUserRole = (role: Role): UserRole => {
  switch (role) {
    case Role.USER:
      return UserRole.USER;
    case Role.ADMIN:
      return UserRole.ADMIN;
    case Role.SUPERADMIN:
      return UserRole.SUPERADMIN;
    default:
      throw new Error("Invalid role");
  }
};

const convertPrismaUserToUser = (prismaUser: any): UserWithRelations => ({
  id: prismaUser.id,
  email: prismaUser.email,
  firstName: prismaUser.firstName,
  lastName: prismaUser.lastName,
  phone: prismaUser.phone,
  role: convertPrismaRoleToUserRole(prismaUser.role),
  status: prismaUser.status,
  position: prismaUser.position,
  workingHours: prismaUser.workingHours,
  serviceId: prismaUser.serviceId,
  service: prismaUser.service,
  supervisorId: prismaUser.supervisorId,
  supervisor: prismaUser.supervisor,
  createdAt: prismaUser.createdAt,
  updatedAt: prismaUser.updatedAt
});

@ObjectType()
class UserResponse {
  @Field(() => UserWithRelations)
  user!: UserWithRelations;

  @Field()
  token!: string;
}

@Resolver()
export class UserResolver {
  @Query(() => [UserWithRelations])
  @Authorized(["ADMIN", "SUPERADMIN"])
  async users(): Promise<UserWithRelations[]> {
    try {
      const prismaUsers = await prisma.user.findMany({
        include: {
          service: true,
          supervisor: true,
        },
      });
      return prismaUsers.map(convertPrismaUserToUser);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération des utilisateurs");
    }
  }

  @Query(() => UserWithRelations)
  @Authorized()
  async me(@Ctx() ctx: MyContext): Promise<UserWithRelations> {
    try {
      if (!ctx.user) {
        throw new GraphQLError("Non authentifié", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const prismaUser = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          service: true,
          supervisor: true,
        },
      });

      if (!prismaUser) {
        throw new GraphQLError("Utilisateur non trouvé");
      }

      return convertPrismaUserToUser(prismaUser);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération de l'utilisateur");
    }
  }

  @Query(() => [UserWithRelations])
  @Authorized(["ADMIN", "SUPERADMIN"])
  async pendingUsers(@Ctx() ctx: MyContext): Promise<UserWithRelations[]> {
    try {
      // Si c'est un ADMIN, on retourne uniquement les utilisateurs en attente de son service
      if (ctx.user?.role === "ADMIN") {
        const adminUser = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          include: { service: true },
        });

        if (!adminUser?.service) {
          throw new GraphQLError("Administrateur non associé à un service", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        const prismaUsers = await prisma.user.findMany({
          where: {
            status: "PENDING",
            serviceId: adminUser.service.id,
          },
          include: {
            service: true,
            supervisor: true,
          },
        });
        return prismaUsers.map(convertPrismaUserToUser);
      }

      // Si c'est un SUPERADMIN, on retourne tous les utilisateurs en attente
      const prismaUsers = await prisma.user.findMany({
        where: {
          status: "PENDING",
        },
        include: {
          service: true,
          supervisor: true,
        },
      });
      return prismaUsers.map(convertPrismaUserToUser);
    } catch (error) {
      throw new GraphQLError(
        "Erreur lors de la récupération des utilisateurs en attente"
      );
    }
  }

  @Mutation(() => UserResponse)
  async login(@Arg("input") input: LoginInput): Promise<UserResponse> {
    try {
      const validatedInput = loginSchema.parse(input);
      const prismaUser = await prisma.user.findUnique({
        where: { email: validatedInput.email },
        include: {
          service: true,
          supervisor: true,
        },
      });

      if (!prismaUser) {
        throw new GraphQLError("Email ou mot de passe incorrect");
      }

      const valid = await compare(validatedInput.password, prismaUser.password);
      if (!valid) {
        throw new GraphQLError("Email ou mot de passe incorrect");
      }

      const token = sign(
        { userId: prismaUser.id },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "1d",
        }
      );

      return {
        user: convertPrismaUserToUser(prismaUser),
        token,
      };
    } catch (error) {
      throw new GraphQLError("Erreur lors de la connexion");
    }
  }

  @Mutation(() => UserWithRelations)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async createUser(
    @Arg("input") input: CreateUserInput
  ): Promise<UserWithRelations> {
    try {
      const validatedInput = createUserSchema.parse(input);
      const hashedPassword = await hash(validatedInput.password, 10);

      const prismaUser = await prisma.user.create({
        data: {
          email: validatedInput.email,
          firstName: validatedInput.firstName,
          lastName: validatedInput.lastName,
          phone: validatedInput.phone,
          password: hashedPassword,
          role: convertUserRoleToPrismaRole(validatedInput.role),
          status: "PENDING",
          position: validatedInput.position,
          workingHours: validatedInput.workingHours,
          serviceId: validatedInput.serviceId,
          supervisorId: validatedInput.supervisorId,
        },
        include: {
          service: true,
          supervisor: true,
        },
      });

      return convertPrismaUserToUser(prismaUser);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la création de l'utilisateur");
    }
  }

  @Mutation(() => UserWithRelations)
  @Authorized()
  async updateUser(
    @Arg("id") id: number,
    @Arg("input") input: UpdateUserInput,
    @Ctx() ctx: MyContext
  ): Promise<UserWithRelations> {
    try {
      const validatedInput = updateUserSchema.parse(input);

      // Vérifier si l'utilisateur est autorisé à modifier cet utilisateur
      if (ctx.user?.role === "USER" && ctx.user.id !== id) {
        throw new GraphQLError("Non autorisé à modifier cet utilisateur");
      }

      // Si c'est un ADMIN, vérifier si l'utilisateur est dans son service
      if (ctx.user?.role === "ADMIN") {
        const adminUser = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          include: { service: true },
        });

        if (!adminUser?.service) {
          throw new GraphQLError("Administrateur non associé à un service");
        }

        const targetUser = await prisma.user.findUnique({
          where: { id },
          include: { service: true },
        });

        if (
          !targetUser ||
          targetUser.service?.id !== adminUser.service.id
        ) {
          throw new GraphQLError(
            "Non autorisé à modifier un utilisateur d'un autre service"
          );
        }
      }

      const updateData: any = {
        email: validatedInput.email,
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        phone: validatedInput.phone,
        position: validatedInput.position,
        workingHours: validatedInput.workingHours,
        serviceId: validatedInput.serviceId,
        supervisorId: validatedInput.supervisorId,
      };

      if (validatedInput.role) {
        updateData.role = convertUserRoleToPrismaRole(validatedInput.role);
      }

      const prismaUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
          supervisor: true,
        },
      });

      return convertPrismaUserToUser(prismaUser);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  @Mutation(() => UserWithRelations)
  async resetPassword(
    @Arg("input") input: ResetPasswordInput
  ): Promise<UserWithRelations> {
    try {
      const validatedInput = resetPasswordSchema.parse(input);
      const hashedPassword = await hash(validatedInput.newPassword, 10);

      const prismaUser = await prisma.user.update({
        where: { email: validatedInput.email },
        data: {
          password: hashedPassword,
        },
        include: {
          service: true,
          supervisor: true,
        },
      });

      return convertPrismaUserToUser(prismaUser);
    } catch (error) {
      throw new GraphQLError(
        "Erreur lors de la réinitialisation du mot de passe"
      );
    }
  }

  @Mutation(() => Boolean)
  async testEmail(): Promise<boolean> {
    try {
      await userController.testEmail();
      return true;
    } catch (error) {
      console.error("Erreur lors du test d'email:", error);
      throw new Error("Échec de l'envoi de l'email de test");
    }
  }

  @Mutation(() => Boolean)
  async testAllEmails(): Promise<boolean> {
    try {
      await userController.testEmails();
      return true;
    } catch (error) {
      console.error("Erreur lors des tests d'emails:", error);
      throw new Error("Échec de l'envoi des emails de test");
    }
  }
}
