import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import { Pole, PoleWithRelations, CreatePoleInput, UpdatePoleInput } from "../types/index";
import { poleSchema, createPoleSchema, updatePoleSchema } from "@mynurseshift/types";
import prisma from "../../prisma";
import { GraphQLError } from "graphql";
import { Status } from "@prisma/client";

const convertPrismaPoleToGraphQL = (prismaPole: any): PoleWithRelations => ({
  id: prismaPole.id,
  name: prismaPole.name,
  code: prismaPole.code,
  description: prismaPole.description,
  status: prismaPole.status,
  services: prismaPole.services || [],
  createdAt: prismaPole.createdAt,
  updatedAt: prismaPole.updatedAt,
});

@Resolver()
export class PoleResolver {
  @Query(() => [PoleWithRelations])
  @Authorized()
  async poles(): Promise<PoleWithRelations[]> {
    try {
      const poles = await prisma.pole.findMany({
        include: {
          services: true,
        },
      });
      return poles.map(convertPrismaPoleToGraphQL);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération des pôles");
    }
  }

  @Query(() => PoleWithRelations)
  @Authorized()
  async pole(@Arg("id") id: number): Promise<PoleWithRelations> {
    try {
      const pole = await prisma.pole.findUnique({
        where: { id },
        include: {
          services: true,
        },
      });

      if (!pole) {
        throw new GraphQLError("Pôle non trouvé");
      }

      return convertPrismaPoleToGraphQL(pole);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération du pôle");
    }
  }

  @Mutation(() => PoleWithRelations)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async createPole(@Arg("input") input: CreatePoleInput): Promise<PoleWithRelations> {
    try {
      const validatedInput = createPoleSchema.parse(input);

      const pole = await prisma.pole.create({
        data: {
          name: validatedInput.name,
          code: validatedInput.code,
          description: validatedInput.description,
          status: Status.ACTIVE,
        },
        include: {
          services: true,
        },
      });

      return convertPrismaPoleToGraphQL(pole);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la création du pôle");
    }
  }

  @Mutation(() => PoleWithRelations)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async updatePole(
    @Arg("id") id: number,
    @Arg("input") input: UpdatePoleInput
  ): Promise<PoleWithRelations> {
    try {
      const validatedInput = updatePoleSchema.parse(input);

      const pole = await prisma.pole.update({
        where: { id },
        data: {
          name: validatedInput.name,
          code: validatedInput.code,
          description: validatedInput.description,
          status: validatedInput.status,
        },
        include: {
          services: true,
        },
      });

      return convertPrismaPoleToGraphQL(pole);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la mise à jour du pôle");
    }
  }

  @Mutation(() => PoleWithRelations)
  @Authorized(["SUPERADMIN"])
  async deletePole(@Arg("id") id: number): Promise<PoleWithRelations> {
    try {
      const pole = await prisma.pole.delete({
        where: { id },
        include: {
          services: true,
        },
      });

      return convertPrismaPoleToGraphQL(pole);
    } catch (error) {
      throw new GraphQLError("Erreur lors de la suppression du pôle");
    }
  }
}
