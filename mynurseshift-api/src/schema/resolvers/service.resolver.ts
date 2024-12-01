import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import {
  Service,
  ServiceWithRelations,
  CreateServiceInput,
  UpdateServiceInput
} from "../types/index";
import {
  serviceSchema,
  createServiceSchema,
  updateServiceSchema,
} from "@mynurseshift/types";
import prisma from "../../prisma";
import { GraphQLError } from "graphql";

const convertPrismaServiceToGraphQL = (prismaService: any): ServiceWithRelations => ({
  id: prismaService.id,
  name: prismaService.name,
  description: prismaService.description,
  capacity: prismaService.capacity,
  status: prismaService.status,
  poleId: prismaService.poleId,
  pole: prismaService.pole,
  users: prismaService.users || [],
  createdAt: prismaService.createdAt,
  updatedAt: prismaService.updatedAt,
});

@Resolver()
export class ServiceResolver {
  @Query(() => [ServiceWithRelations])
  @Authorized()
  async services(): Promise<ServiceWithRelations[]> {
    try {
      const services = await prisma.service.findMany({
        include: {
          pole: true,
          users: true,
        },
      });
      return services.map(convertPrismaServiceToGraphQL);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération des services");
    }
  }

  @Query(() => ServiceWithRelations)
  @Authorized()
  async service(@Arg("id") id: number): Promise<ServiceWithRelations> {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          pole: true,
          users: true,
        },
      });

      if (!service) {
        throw new GraphQLError("Service non trouvé");
      }

      return convertPrismaServiceToGraphQL(service);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération du service");
    }
  }

  @Mutation(() => ServiceWithRelations)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async createService(@Arg("input") input: CreateServiceInput): Promise<ServiceWithRelations> {
    try {
      const validatedInput = createServiceSchema.parse(input);

      const service = await prisma.service.create({
        data: {
          name: validatedInput.name,
          description: validatedInput.description,
          capacity: validatedInput.capacity,
          status: validatedInput.status,
          poleId: validatedInput.poleId,
        },
        include: {
          pole: true,
          users: true,
        },
      });

      return convertPrismaServiceToGraphQL(service);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la création du service");
    }
  }

  @Mutation(() => ServiceWithRelations)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async updateService(
    @Arg("id") id: number,
    @Arg("input") input: UpdateServiceInput
  ): Promise<ServiceWithRelations> {
    try {
      const validatedInput = updateServiceSchema.parse(input);

      const service = await prisma.service.update({
        where: { id },
        data: {
          name: validatedInput.name,
          description: validatedInput.description,
          capacity: validatedInput.capacity,
          status: validatedInput.status,
          poleId: validatedInput.poleId,
        },
        include: {
          pole: true,
          users: true,
        },
      });

      return convertPrismaServiceToGraphQL(service);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la mise à jour du service");
    }
  }

  @Mutation(() => ServiceWithRelations)
  @Authorized(["SUPERADMIN"])
  async deleteService(@Arg("id") id: number): Promise<ServiceWithRelations> {
    try {
      const service = await prisma.service.delete({
        where: { id },
        include: {
          pole: true,
          users: true,
        },
      });

      return convertPrismaServiceToGraphQL(service);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la suppression du service");
    }
  }
}
