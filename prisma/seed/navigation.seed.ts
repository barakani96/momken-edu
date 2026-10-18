import { PrismaClient } from '@prisma/client';
import { seedNavigation } from '../../src/modules/navigation/navigation.seed';

const prisma = new PrismaClient();

async function main() {
  await seedNavigation(prisma);
}

main()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
