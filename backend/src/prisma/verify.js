const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count(model) {
  return model.count();
}

async function main() {
  console.log('=== Database Verification ===');
  console.log('Users:', await count(prisma.user));
  console.log('Lots:', await count(prisma.lot));
  console.log('Patterns:', await count(prisma.pattern));
  console.log('ScanChains:', await count(prisma.scanChain));
  console.log('ScanChainRuns:', await count(prisma.scanChainRun));
  console.log('MBISTRuns:', await count(prisma.mBISTRun));
  console.log('LBISTRuns:', await count(prisma.lBISTRun));
  console.log('WaferRuns:', await count(prisma.waferRun));
  console.log('DieResults:', await count(prisma.dieResult));
  console.log('FaultCoverage rows:', await count(prisma.faultCoverage));
  console.log('RedundancyGroups:', await count(prisma.redundancyGroup));
  console.log('OptimizationRuns:', await count(prisma.optimizationRun));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
