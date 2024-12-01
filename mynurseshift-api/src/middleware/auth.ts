import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import prisma from "../prisma";
import { User } from "../schema/types";

interface JwtPayload {
  userId: number;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Compte inactif" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    next();
  };
};

export const isAuthenticated = ({ context }: { context: any }) => {
  if (!context.user) {
    throw new GraphQLError("Non authentifié", {
      extensions: { code: "UNAUTHENTICATED" }
    });
  }
  return true;
};

export const hasRole = (roles: string[]) => {
  return ({ context }: { context: any }) => {
    if (!context.user) {
      throw new GraphQLError("Non authentifié", {
        extensions: { code: "UNAUTHENTICATED" }
      });
    }

    if (!roles.includes(context.user.role)) {
      throw new GraphQLError("Non autorisé", {
        extensions: { code: "FORBIDDEN" }
      });
    }

    return true;
  };
};
