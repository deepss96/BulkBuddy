const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.whatsAppConnection.deleteMany();
  console.log('Database cleaned successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
