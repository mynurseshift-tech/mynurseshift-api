import { Request, Response } from "express";
import { User, UserWithRelations } from "../schema/types/user.type";
import { LoginInput, ResetPasswordInput } from "../schema/types/auth.type";
import { CreateUserInput, UpdateUserInput } from "../schema/types/user.input";
import { Role, Status } from "@prisma/client";
import prisma from "../prisma";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import {
  sendAccountCreatedEmail,
  sendAccountActivatedEmail,
  sendAccountRejectedEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
} from "../services/email.service";
import {
  convertPrismaRoleToUserRole,
  convertPrismaStatusToUserStatus,
} from "../utils/type-converters";

const convertPrismaUserToUser = (prismaUser: any): UserWithRelations => {
  const user: UserWithRelations = {
    id: prismaUser.id,
    email: prismaUser.email,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    role: convertPrismaRoleToUserRole(prismaUser.role),
    status: convertPrismaStatusToUserStatus(prismaUser.status),
    phone: prismaUser.phone,
    position: prismaUser.position,
    workingHours: prismaUser.workingHours as Record<string, any>,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
    serviceId: prismaUser.serviceId,
    supervisorId: prismaUser.supervisorId,
    service: prismaUser.service,
    supervisor: prismaUser.supervisor,
  };
  return user;
};

export const userController = {
  // Récupérer tous les utilisateurs
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          service: true,
          supervisor: true,
        },
      });

      const formattedUsers = users.map(convertPrismaUserToUser);
      res.json(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          service: true,
          supervisor: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const formattedUser = convertPrismaUserToUser(user);
      res.json(formattedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
  },

  // Approuver un utilisateur
  approveUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approved, approverName } = req.body;

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          status: approved ? Status.ACTIVE : Status.REJECTED,
        },
        include: {
          service: true,
          supervisor: true,
        },
      });

      // Envoi de l'email approprié selon la décision
      if (approved) {
        await sendAccountActivatedEmail(user.email, {
          firstName: user.firstName,
          lastName: user.lastName,
          approverName,
        });
      } else {
        await sendAccountRejectedEmail(user.email, {
          firstName: user.firstName,
          lastName: user.lastName,
          approverName,
        });
      }

      const formattedUser = convertPrismaUserToUser(user);
      res.json(formattedUser);
    } catch (error) {
      console.error("Error approving user:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de l'approbation de l'utilisateur" });
    }
  },

  // Créer un nouvel utilisateur
  createUser: async (req: Request, res: Response) => {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
        phone,
        position,
        workingHours,
        serviceId,
        supervisorId,
      } = req.body;
      const hashedPassword = await hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          phone,
          position,
          workingHours,
          status: Status.PENDING,
          role: Role.USER,
          ...(serviceId && {
            service: {
              connect: { id: serviceId },
            },
          }),
          ...(supervisorId && {
            supervisor: {
              connect: { id: supervisorId },
            },
          }),
        },
        include: {
          service: true,
          supervisor: true,
        },
      });

      await sendAccountCreatedEmail(user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
      });

      const formattedUser = convertPrismaUserToUser(user);
      res.status(201).json(formattedUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la création de l'utilisateur" });
    }
  },

  // Connexion utilisateur
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      if (user.status !== Status.ACTIVE) {
        return res.status(403).json({ error: "Votre compte n'est pas actif" });
      }

      const token = sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      const formattedUser = convertPrismaUserToUser(user);
      res.json({
        token,
        user: formattedUser,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Erreur lors de la connexion" });
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        email,
        firstName,
        lastName,
        phone,
        position,
        workingHours,
        serviceId,
        supervisorId,
      } = req.body;

      const updateData: any = {
        email,
        firstName,
        lastName,
        phone,
        position,
        workingHours,
        ...(serviceId && {
          service: {
            connect: { id: serviceId },
          },
        }),
        ...(supervisorId && {
          supervisor: {
            connect: { id: supervisorId },
          },
        }),
      };

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          service: true,
          supervisor: true,
        },
      });

      const formattedUser = convertPrismaUserToUser(user);
      res.json(formattedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
  },
};

// Test des différents emails
export const testEmails = async () => {
  try {
    const testEmail = "limlahi.fawsy@hotmail.fr";

    // Test email création de compte
    await sendAccountCreatedEmail(testEmail, {
      firstName: "Fawsy",
      lastName: "Limlahi",
    });
    console.log("Email de création envoyé");

    // Attendre 5 secondes entre chaque email
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test email activation de compte
    await sendAccountActivatedEmail(testEmail, {
      firstName: "Fawsy",
      lastName: "Limlahi",
      approverName: "John Admin",
    });
    console.log("Email d'activation envoyé");

    // Attendre 5 secondes
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test email refus de compte
    await sendAccountRejectedEmail(testEmail, {
      firstName: "Fawsy",
      lastName: "Limlahi",
      approverName: "John Admin",
    });
    console.log("Email de refus envoyé");

    // Attendre 5 secondes
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test email reset password
    await sendPasswordResetEmail(testEmail, {
      firstName: "Fawsy",
      lastName: "Limlahi",
      resetToken: "test-token-123",
    });
    console.log("Email de réinitialisation envoyé");

    // Attendre 5 secondes
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test email notification
    await sendNotificationEmail(testEmail, {
      firstName: "Fawsy",
      lastName: "Limlahi",
      notificationType: "Nouveau message",
      notificationDetails:
        "Vous avez reçu un nouveau message de l'équipe MyNurseShift.",
    });
    console.log("Email de notification envoyé");

    return true;
  } catch (error) {
    console.error("Erreur lors des tests d'emails:", error);
    return false;
  }
};

// Test d'envoi d'email simple
export const testEmail = async () => {
  try {
    await sendAccountCreatedEmail("limlahi.fawsy@hotmail.fr", {
      firstName: "Fawsy",
      lastName: "Limlahi",
    });
    console.log("Email de test envoyé avec succès !");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error);
    return false;
  }
};
