import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const hashedPassword = await hash('admin123', 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@mynurseshift.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Super Admin créé avec succès:', superAdmin);
  } catch (error) {
    console.error('Erreur lors de la création du Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
