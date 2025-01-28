import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create initial roles
  await prisma.roles.createMany({
    data: [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'USER' },
      { id: 3, name: 'SALES_REPRESENTATIVE' }
    ]
  });

  // Create sample organizations
  await prisma.organization.createMany({
    data: [
      {
        name: 'Tech Innovations Inc.',
        address: '123 Tech Lane, Silicon Valley',
        website: 'www.techinnovations.com',
        salesStage: 'PROSPECT'
      },
      {
        name: 'Global Finance Corp',
        address: '456 Wall Street, New York',
        website: 'www.globalfinance.com',
        salesStage: 'PROSPECT'
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });