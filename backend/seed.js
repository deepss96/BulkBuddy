const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@bulkbuddy.com' },
    update: {}, // Do nothing if it already exists
    create: {
      email: 'admin@bulkbuddy.com',
      name: 'Admin',
      passwordHash,
    },
  });
  
  console.log('Admin user created successfully:');
  console.log('Email: admin@bulkbuddy.com');
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
