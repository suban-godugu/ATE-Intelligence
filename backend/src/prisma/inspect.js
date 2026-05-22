const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lots = await prisma.lot.findMany({
    include: {
      _count: {
        select: { patterns: true, scanChains: true }
      },
      patterns: { take: 5 },
      scanChains: { take: 5 }
    }
  });

  console.log(JSON.stringify(lots, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
