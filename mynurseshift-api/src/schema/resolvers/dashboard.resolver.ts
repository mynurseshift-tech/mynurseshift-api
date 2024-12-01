import { Resolver, Query, Ctx, Authorized } from "type-graphql";
import { DashboardStats } from "../types/index";
import { MyContext } from "../../types/context.types";
import prisma from "../../prisma";
import { GraphQLError } from "graphql";
import { Status } from "@mynurseshift/types";

@Resolver()
export class DashboardResolver {
  @Query(() => DashboardStats)
  @Authorized(["ADMIN", "SUPERADMIN"])
  async dashboardStats(@Ctx() ctx: MyContext): Promise<DashboardStats> {
    try {
      if (!ctx.user) {
        throw new GraphQLError("Non authentifié", {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Si c'est un ADMIN, on retourne uniquement les stats de son service
      if (ctx.user.role === "ADMIN") {
        const adminUser = await prisma.user.findUnique({
          where: { id: ctx.user.id },
          include: { service: true }
        });

        if (!adminUser?.service) {
          throw new GraphQLError("Administrateur non associé à un service", {
            extensions: { code: 'FORBIDDEN' }
          });
        }

        const [totalUsers, pendingUsers, activeUsers] = await Promise.all([
          prisma.user.count({
            where: { serviceId: adminUser.service.id }
          }),
          prisma.user.count({
            where: { 
              serviceId: adminUser.service.id,
              status: Status.PENDING
            }
          }),
          prisma.user.count({
            where: { 
              serviceId: adminUser.service.id,
              status: Status.ACTIVE
            }
          })
        ]);

        const stats: DashboardStats = {
          totalUsers,
          pendingUsers,
          activeUsers,
          totalServices: 1,
          totalPoles: 1
        };

        return stats;
      }

      // Si c'est un SUPERADMIN, on retourne toutes les stats
      const [totalUsers, pendingUsers, activeUsers, totalServices, totalPoles] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { status: Status.PENDING }
        }),
        prisma.user.count({
          where: { status: Status.ACTIVE }
        }),
        prisma.service.count(),
        prisma.pole.count()
      ]);

      const stats: DashboardStats = {
        totalUsers,
        pendingUsers,
        activeUsers,
        totalServices,
        totalPoles
      };

      return stats;
    } catch (error) {
      throw new GraphQLError("Erreur lors de la récupération des statistiques");
    }
  }
}
