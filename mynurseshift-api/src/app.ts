import "reflect-metadata";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import { verify } from "jsonwebtoken";
import cors from "cors";
import dotenv from 'dotenv';
import { UserResolver } from "./schema/resolvers/user.resolver";
import { PoleResolver } from "./schema/resolvers/pole.resolver";
import { ServiceResolver } from "./schema/resolvers/service.resolver";
import { DashboardResolver } from "./schema/resolvers/dashboard.resolver";
import { MyContext } from "./types/context.types";
import userRoutes from './routes/userRoutes';
import { User } from "./schema/types/user.type";
import { Role, Status } from "@prisma/client";
import prisma from "./prisma";
import { sendAccountCreatedEmail } from './services/email.service';
import { convertPrismaRoleToUserRole, convertPrismaStatusToUserStatus } from "./utils/type-converters";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

const app = express();

// Configuration CORS détaillée
const corsOptions = {
  origin: [
    'http://localhost:4200',  // Webapp
    'http://localhost:4201',  // Back-office
    // Ajoutez ici les domaines de production quand ils seront disponibles
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware de base
app.use(cors(corsOptions));
app.use(express.json());

// Routes REST
app.use('/api/users', userRoutes);

app.get('/test-email', async (req, res) => {
  try {
    await sendAccountCreatedEmail("limlahi.fawsy@hotmail.fr", {
      firstName: "Fawsy",
      lastName: "Limlahi"
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const getUser = async (token: string): Promise<User | null> => {
  try {
    if (token) {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
      const prismaUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!prismaUser) {
        return null;
      }

      return {
        id: prismaUser.id,
        email: prismaUser.email,
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName,
        phone: prismaUser.phone || undefined,
        role: convertPrismaRoleToUserRole(prismaUser.role),
        status: convertPrismaStatusToUserStatus(prismaUser.status),
        position: prismaUser.position || undefined,
        workingHours: prismaUser.workingHours as Record<string, any>,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

const startApolloServer = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, PoleResolver, ServiceResolver, DashboardResolver],
    authChecker: ({ context }: { context: MyContext }, roles: string[]) => {
      const { user } = context;
      if (!user) {
        return false;
      }
      if (roles.length === 0) {
        return true;
      }
      if (roles.includes(user.role)) {
        return true;
      }
      return false;
    },
  });

  const server = new ApolloServer<MyContext>({
    schema,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      };
    },
  });

  await server.start();

  // Appliquer le middleware GraphQL
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<MyContext> => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = token ? await getUser(token) : undefined;
        return { user, token };
      },
    })
  );

  // Démarrer le serveur Express
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(` Serveur démarré sur le port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
};

// Démarrer le serveur Apollo
startApolloServer().catch(error => {
  console.error('Failed to start Apollo Server:', error);
  process.exit(1);
});

// Middleware de gestion des erreurs
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Une erreur est survenue !',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

export default app;
