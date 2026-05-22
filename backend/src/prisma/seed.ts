import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Implementing Final Industrial Mock Data (20-Step Specification)...');

  // 1. Full Reset
  const models = ['optimizationRun', 'lBISTRun', 'mBISTRun', 'scanChainRun', 'faultCoverage', 'scanChainPattern', 'dieResult', 'redundancyGroup', 'waferRun', 'scanChain', 'pattern', 'lot', 'user'];
  for (const m of models) { 
    try { 
      await (prisma as any)[m].deleteMany(); 
    } catch (e) {
      console.warn(`Could not clear ${m}`);
    } 
  }

  // 2. Users (Step 19)
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'admin@ate.local', passwordHash, name: 'Alex Johnson', role: 'admin' },
      { email: 'eng@ate.local', passwordHash, name: 'Engineer User', role: 'engineer' }
    ]
  });

  // 3. Main Lot (Step 2)
  const lot = await prisma.lot.create({
    data: {
      lotNumber: 'L240519',
      product: 'ATE-X9 Processor',
      fab: 'Fab-12',
      tester: 'Advantest V93000',
      startDate: new Date('2026-05-19'),
      endDate: new Date('2026-05-20'),
      customer: 'Global Silicon Inc.',
      device: 'X9-CORE-V2',
      status: 'ACTIVE'
    }
  });

  // 4. Patterns (Step 3 & 4: 127 total)
  const distribution = [
    { type: 'SCAN', count: 42 },
    { type: 'ATPG', count: 31 },
    { type: 'BIST', count: 14 },
    { type: 'FUNCTIONAL', count: 18 },
    { type: 'IDDQ', count: 12 },
    { type: 'BOUNDARY', count: 10 }
  ];

  let seq = 0;
  for (const item of distribution) {
    for (let i = 1; i <= item.count; i++) {
      const pId = `P${(seq + 101).toString()}`;
      let data = {
        patternId: pId,
        type: item.type,
        domain: i % 2 === 0 ? 'CPU Core' : 'GPU Block',
        testTimeMs: 10 + Math.random() * 15,
        costPerDie: 0.02,
        faultCoverage: 90 + Math.random() * 8,
        failRate: Math.random() * 4,
        killRatio: 5 + Math.random() * 5,
        detectPower: 'MEDIUM',
        action: 'KEEP',
        sequenceIndex: seq++,
        lotId: lot.id
      };

      // Exact records from Step 4
      if (pId === 'P205') { data.type = 'ATPG'; data.domain = 'CPU Core'; data.testTimeMs = 14.2; data.costPerDie = 0.032; data.faultCoverage = 97.4; data.failRate = 3.2; data.killRatio = 8.4; data.detectPower = 'HIGH'; data.action = 'KEEP'; }
      if (pId === 'P118') { data.type = 'SCAN'; data.domain = 'GPU Block'; data.testTimeMs = 8.9; data.costPerDie = 0.018; data.faultCoverage = 89.2; data.failRate = 1.1; data.killRatio = 2.8; data.detectPower = 'MEDIUM'; data.action = 'REVIEW'; }
      if (pId === 'P322') { data.type = 'IDDQ'; data.domain = 'Memory Controller'; data.testTimeMs = 22.1; data.costPerDie = 0.044; data.faultCoverage = 81.3; data.failRate = 0.2; data.killRatio = 0.7; data.detectPower = 'LOW'; data.action = 'REMOVE'; }

      const pattern = await prisma.pattern.create({ data });

      // Step 5: Fault Coverage
      await prisma.faultCoverage.createMany({
        data: ['STUCK_AT', 'TRANSITION', 'PATH_DELAY', 'BRIDGING', 'CELL_AWARE', 'IDDQ', 'FUNCTIONAL'].map(m => ({
          patternId: pattern.id,
          model: m,
          coverage: data.faultCoverage - (Math.random() * 5),
          detected: 1000000,
          undetected: 5000,
          untestable: 1000
        }))
      });
    }
  }

  // 5. Scan Chains (Step 6: 12 chains)
  for (let i = 1; i <= 12; i++) {
    const chainId = `SC-${i.toString().padStart(2, '0')}`;
    let length = 12450;
    let status = 'HEALTHY';
    let balance = 96.2;

    if (i === 7) { length = 22110; status = 'IMBALANCED'; balance = 61.3; }
    if (i === 11) { length = 0; status = 'BROKEN'; balance = 12.0; }

    await prisma.scanChain.create({
      data: { 
        chainId, 
        length, 
        domain: i < 7 ? 'CPU Core' : 'GPU', 
        type: i === 7 ? 'EDT' : 'FULL', 
        balancePercent: balance, 
        status, 
        lotId: lot.id 
      }
    });
  }

  // 6. Die Results (Step 8 & 9: 318 dies)
  const wafer = await prisma.waferRun.create({ data: { waferId: 'WFR-22', lotId: lot.id } });
  const dies = [];
  const totalDies = 318;
  const failCount = Math.floor(totalDies * (1 - 0.9834)); // Target 98.34% yield

  for (let i = 0; i < totalDies; i++) {
    const passed = i >= failCount;
    dies.push({
      waferRunId: wafer.id,
      lotId: lot.id,
      dieX: i % 20,
      dieY: Math.floor(i / 20),
      passed,
      failPattern: passed ? null : 'P205',
      testTimeMs: 42.6, 
      binCode: passed ? '1' : '99',
      zone: i < 100 ? 'center' : (i < 200 ? 'mid-ring' : 'edge')
    });
  }
  await prisma.dieResult.createMany({ data: dies });

  // 7. Redundancy (Step 11)
  await prisma.redundancyGroup.createMany({
    data: [
      { groupId: 'G-001', patterns: JSON.stringify(['P205', 'P208', 'P211']), overlap: 91.2, keepId: 'P205', lotId: lot.id },
      { groupId: 'G-004', patterns: JSON.stringify(['P118', 'P119']), overlap: 77.5, keepId: 'P118', lotId: lot.id }
    ]
  });

  // 8. Optimization Results (Step 15)
  await prisma.optimizationRun.create({
    data: {
      lotId: lot.id,
      maxCostPerWafer: 60,
      yieldTarget: 98.1,
      maxTestTimeMs: 50,
      costReductionPct: 21,
      timeSavingsPct: 24,
      projectedYield: 98.1,
      patternsRemoved: 17,
      totalSavingsUSD: 142000,
      optimizedOrder: JSON.stringify(["P205", "P118", "P322"]),
      createdBy: 'admin@ate.local'
    }
  });

  // 9. BIST Runs
  await prisma.mBISTRun.createMany({
    data: [
      { lotId: lot.id, instanceName: 'MBIST_CPU_L2', memoryType: 'SRAM', domain: 'CPU Core', sizeKb: 512, algorithmUsed: 'MARCH-C', testTimeMs: 4.2, faultsCaught: 142, repairAttempts: 3, repairSuccess: 3, passCount: 315, failCount: 3, coveragePercent: 99.8, status: 'PASS' },
      { lotId: lot.id, instanceName: 'MBIST_GPU_SRAM', memoryType: 'SRAM', domain: 'GPU Block', sizeKb: 1024, algorithmUsed: 'MARCH-LR', testTimeMs: 6.1, faultsCaught: 891, repairAttempts: 0, repairSuccess: 0, passCount: 310, failCount: 8, coveragePercent: 98.5, status: 'FAIL' }
    ]
  });

  await prisma.lBISTRun.createMany({
    data: [
      { lotId: lot.id, instanceName: 'LBIST_CPU_CORE0', domain: 'CPU Core', seedValue: '0xA5A5A5A5', patternCount: 1024, testTimeMs: 3.8, signatureMatch: true, faultsCaught: 67, passCount: 318, failCount: 0, coveragePercent: 99.2, toggleCoverage: 94.2, status: 'PASS' },
      { lotId: lot.id, instanceName: 'LBIST_GPU', domain: 'GPU Block', seedValue: '0x12345678', patternCount: 2048, testTimeMs: 4.1, signatureMatch: false, faultsCaught: 0, passCount: 300, failCount: 18, coveragePercent: 31.1, toggleCoverage: 31.1, status: 'FAIL' }
    ]
  });

  console.log('✅ Industrial Mock Data Successfully Filled!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
