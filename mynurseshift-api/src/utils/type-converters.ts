import { Role as PrismaRole, Status as PrismaStatus } from "@prisma/client";
import { UserRole, UserStatus } from "@mynurseshift/types";

export const convertPrismaRoleToUserRole = (role: PrismaRole): UserRole => {
  const roleMap: Record<PrismaRole, UserRole> = {
    ADMIN: UserRole.ADMIN,
    SUPERADMIN: UserRole.SUPERADMIN,
    USER: UserRole.USER,
  };
  return roleMap[role];
};

export const convertPrismaStatusToUserStatus = (status: PrismaStatus): UserStatus => {
  const statusMap: Record<PrismaStatus, UserStatus> = {
    ACTIVE: UserStatus.ACTIVE,
    PENDING: UserStatus.PENDING,
    INACTIVE: UserStatus.INACTIVE,
    REJECTED: UserStatus.INACTIVE, // Map REJECTED to INACTIVE since it's not in shared types
  };
  return statusMap[status];
};
