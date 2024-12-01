import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Créer un admin par défaut
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mynurseshift.com' },
    update: {},
    create: {
      email: 'admin@mynurseshift.com',
      firstName: 'Admin',
      lastName: 'System',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
