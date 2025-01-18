import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create ADMIN role
  await prisma.roles.upsert({
    where: { id: 1 },
    update: { name: 'ADMIN' },
    create: { 
      id: 1,
      name: 'ADMIN'
    }
  })
  
  // Create USER role
  await prisma.roles.upsert({
    where: { id: 2 },
    update: { name: 'USER' },
    create: { 
      id: 2,
      name: 'USER'
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })