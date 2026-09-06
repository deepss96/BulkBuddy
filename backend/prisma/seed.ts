import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@bulkbuddy.com' },
    update: {},
    create: {
      email: 'admin@bulkbuddy.com', 
      name: 'Admin User',
      passwordHash,
    },
  });

  console.log('Seed completed. Fake user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
