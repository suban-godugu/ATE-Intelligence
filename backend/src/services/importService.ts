import { prisma } from '../prisma/client';
import {
  STILReaderOutput,
  LogReaderOutput,
  MBISTReaderOutput,
  LBISTReaderOutput,
  ATPGReaderOutput
} from '@ate/ai-models';

export interface ImportSummary {
  lotId: string;
  lotNumber: string;
  patternsCount: number;
  diesCount: number;
  chainsCount: number;
  mbistCount: number;
  lbistCount: number;
  warnings: string[];
}

/**
 * mergeAndImport: The industrial core for ATE data synchronization.
 * It merges structural (STIL) and behavioral (LOG) data into a unified lot.
 */
export async function mergeAndImport(
  stil?: STILReaderOutput,
  log?: LogReaderOutput,
  mbist?: MBISTReaderOutput,
  lbist?: LBISTReaderOutput,
  atpg?: ATPGReaderOutput,
  fileHash?: string
): Promise<ImportSummary> {
  const warnings: string[] = [];
  const lotNumber = log?.lotId || stil?.metadata?.lotId || 'UNKNOWN_LOT';

  // 1. Check for Duplicate/Existing Lot
  if (fileHash) {
    const existingLot = await prisma.lot.findFirst({
      where: { fileHash } as any,
      include: { _count: { select: { patterns: true } } }
    });

    // If we have a healthy existing lot, don't duplicate the work
    if (existingLot && existingLot._count.patterns > 100) {
      return {
        lotId: existingLot.id,
        lotNumber: existingLot.lotNumber,
        patternsCount: existingLot._count.patterns,
        diesCount: 0, chainsCount: 0, mbistCount: 0, lbistCount: 0,
        warnings: ['Lot already fully synchronized. Skipping duplicate ingestion.']
      };
    }
  }

  return await prisma.$transaction(async (tx) => {
    // 2. Lot Upsert - Preserve metadata across files
    let lot = await tx.lot.findFirst({ where: { lotNumber } });
    const lotData = {
      lotNumber,
      customer: stil?.metadata?.lotId?.split('_')[0] || 'Internal',
      device: stil?.metadata?.productName || 'DUT_GENERIC',
      status: 'ACTIVE',
      product: stil?.metadata?.productName || 'DUT_GENERIC',
      tester: log?.testerType || stil?.metadata?.testerType || 'Industrial_ATE',
      fileHash: fileHash || undefined,
      processNode: (stil?.metadata as any)?.processNode || 'Unknown'
    };

    if (!lot) {
      lot = await tx.lot.create({ data: lotData as any });
    } else {
      lot = await tx.lot.update({ where: { id: lot.id }, data: lotData as any });
    }

    // 3. Pattern Synchronization (STIL + LOG + ATPG)
    const existingPatterns = await tx.pattern.findMany({
      where: { lotId: lot.id },
      select: { id: true, patternId: true }
    });
    const existingPatternMap = new Map(existingPatterns.map(p => [p.patternId, p.id]));

    const stilMap = new Map(stil?.patterns.map(p => [p.patternId, p]));
    const logMap = new Map(log?.patternStats.map(p => [p.patternId, p]));
    const atpgMap = new Map(atpg?.incrementalCoverage.map(p => [p.patternId, p]));

    const allPatternIds = new Set([
      ...stilMap.keys(),
      ...logMap.keys(),
      ...atpgMap.keys()
    ]);

    const patternsToCreate: any[] = [];
    const patternsToUpdate: { id: string; data: any }[] = [];

    for (const pId of allPatternIds) {
      const sPat = stilMap.get(pId);
      const logStat = logMap.get(pId);
      const atpgCov = atpgMap.get(pId);

      const combinedData = {
        lotId: lot.id,
        patternId: pId,
        type: sPat?.patternType ?? 'SCAN',
        domain: sPat?.domain ?? 'UNKNOWN',
        testTimeMs: logStat?.actualTestTimeMs ?? sPat?.estimatedTimeMs ?? 0,
        costPerDie: (logStat?.actualTestTimeMs ?? sPat?.estimatedTimeMs ?? 0) * 0.0001, // Adjusted for typical ATE cost
        faultCoverage: atpgCov?.cumulativeCoverage ?? (sPat as any)?.faultCoverage ?? 0,
        failRate: logStat?.failRate ?? 0,
        detectPower: logStat?.detectPower ?? 'MEDIUM',
        action: (sPat as any)?.action ?? 'KEEP',
      };

      if (!existingPatternMap.has(pId)) {
        patternsToCreate.push(combinedData);
      } else {
        patternsToUpdate.push({ id: existingPatternMap.get(pId)!, data: combinedData });
      }

      // Check for Ghost Patterns
      if (logStat && !sPat) warnings.push(`Pattern '${pId}' found in Log but missing in STIL definition.`);
    }

    // Batch Process Pattern Ingestion
    if (patternsToCreate.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < patternsToCreate.length; i += batchSize) {
        await tx.pattern.createMany({ data: patternsToCreate.slice(i, i + batchSize) });
      }
    }

    // Chunked Updates for high-density pattern sets
    if (patternsToUpdate.length > 0) {
      const updateBatch = 100;
      for (let i = 0; i < patternsToUpdate.length; i += updateBatch) {
        const chunk = patternsToUpdate.slice(i, i + updateBatch);
        await Promise.all(chunk.map(u => tx.pattern.update({ where: { id: u.id }, data: u.data })));
      }
    }

    // 4. Scan Chain Ingestion
    if (stil?.scanChains) {
      await tx.scanChain.deleteMany({ where: { lotId: lot.id } }); // Refresh chains
      await tx.scanChain.createMany({
        data: stil.scanChains.map(chain => ({
          lotId: lot!.id,
          chainId: chain.chainId,
          length: chain.cellCount ?? 0,
          domain: chain.domain ?? 'DEFAULT',
          type: chain.chainType ?? 'FULL',
          balancePercent: 100,
          status: 'HEALTHY'
        })) as any
      });
    }

    // 5. Wafer & Die Ingestion (Spatial Analysis)
    if (log && log.dies.length > 0) {
      let waferRun = await tx.waferRun.findFirst({ where: { lotId: lot.id, waferId: log.waferId || 'W01' } });
      if (!waferRun) {
        waferRun = await tx.waferRun.create({
          data: { lotId: lot.id, waferId: log.waferId || 'W01', startTime: new Date(), endTime: new Date() } as any
        });
      }

      // const xCoords = log.dies.map(d => d.dieX);
      // const yCoords = log.dies.map(d => d.dieY);
      const maxDist = Math.max(...log.dies.map(d => Math.sqrt(d.dieX ** 2 + d.dieY ** 2)), 1);

      // Batch create dies to optimize spatial queries
      const dieBatchSize = 1000;
      for (let i = 0; i < log.dies.length; i += dieBatchSize) {
        const chunk = log.dies.slice(i, i + dieBatchSize).map((d: any) => {
          const dist = Math.sqrt(d.dieX ** 2 + d.dieY ** 2);
          const ratio = dist / maxDist;
          let zone = 'edge';
          if (ratio < 0.4) zone = 'center';
          else if (ratio < 0.8) zone = 'mid-ring';

          return {
            lotId: lot!.id,
            waferRunId: waferRun!.id,
            dieX: d.dieX,
            dieY: d.dieY,
            passed: d.passed,
            testTimeMs: d.testTimeMs,
            binCode: d.binCode,
            zone
          };
        });
        await tx.dieResult.createMany({ data: chunk });
      }
    }

    // 6. BIST & ATPG Redundancy Insights
    if (atpg?.redundancyGroups) {
      await tx.redundancyGroup.deleteMany({ where: { lotId: lot.id } });
      await tx.redundancyGroup.createMany({
        data: atpg.redundancyGroups.map(g => ({
          lotId: lot!.id,
          groupId: g.groupId,
          name: `Group_${g.groupId}`,
          type: 'ATPG_REDUNDANCY',
          patterns: JSON.stringify(g.patternIds),
          overlap: g.overlapPercent,
          keepId: g.keepPatternId,
          coverageImpact: g.overlapPercent
        })) as any
      });
    }

    return {
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      patternsCount: allPatternIds.size,
      diesCount: log?.dies.length || 0,
      chainsCount: stil?.scanChains.length || 0,
      mbistCount: mbist?.instances.length || 0,
      lbistCount: lbist?.instances.length || 0,
      warnings: [...warnings, ...(stil?.warnings || []), ...(log?.warnings || [])]
    };
  });
}
