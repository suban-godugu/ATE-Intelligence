import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess, ApiError } from '../utils/response';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_ANALYSIS || process.env.GROQ_API_KEY,
});

/**
 * POST /api/v1/knowledge/ask
 * ---------------------------
 * RAG-style Q&A: Ask the AI anything about a lot or pattern.
 * The controller fetches relevant context from the DB and sends it to the LLM.
 */
export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, lotId } = req.body;

    if (!question) throw new ApiError(400, 'A "question" field is required.');

    // Fetch context from database to ground the AI response
    let context = '';

    if (lotId) {
      const [lot, patterns, kpis] = await Promise.all([
        prisma.lot.findUnique({ where: { id: lotId } }),
        prisma.pattern.findMany({
          where: { lotId },
          take: 30,
          orderBy: { failRate: 'desc' },
          select: { patternId: true, type: true, failRate: true, faultCoverage: true, testTimeMs: true, costPerDie: true, action: true },
        }),
        prisma.dieResult.aggregate({
          where: { waferRun: { lotId } },
          _avg: { testTimeMs: true },
          _count: { id: true },
        }),
      ]);

      if (lot) {
        const passCount = await prisma.dieResult.count({ where: { waferRun: { lotId }, passed: true } });
        const totalDie  = kpis._count.id || 1;
        const yieldPct  = ((passCount / totalDie) * 100).toFixed(2);

        context = `
Lot Information:
- Lot ID: ${lot.id}
- Lot Number: ${lot.lotNumber}
- Device: ${lot.device}
- Fab: ${lot.fab}
- Overall Yield: ${yieldPct}%
- Total Die Tested: ${totalDie}

Top Failing Patterns (by fail rate):
${patterns.slice(0, 10).map(p =>
  `  • ${p.patternId} | Type: ${p.type} | Fail Rate: ${p.failRate?.toFixed(2)}% | Coverage: ${p.faultCoverage?.toFixed(1)}% | Time: ${p.testTimeMs?.toFixed(1)}ms | Action: ${p.action}`
).join('\n')}
        `.trim();
      }
    }

    const systemPrompt = `You are an expert ATE (Automatic Test Equipment) and semiconductor test engineering AI assistant.
You have access to real-time data from the ATE Intelligence platform.
Answer the engineer's question accurately, technically, and concisely.
If you have lot-specific context, use it. If not, provide general best-practice guidance.
Always provide actionable recommendations.`;

    const userContent = context
      ? `Context:\n${context}\n\nEngineer's Question:\n${question}`
      : `Engineer's Question:\n${question}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const answer = response.choices[0]?.message?.content || 'I was unable to generate an answer.';

    return sendSuccess(res, {
      question,
      answer,
      lotId: lotId || null,
      hasContext: !!context,
      model: 'llama-3.3-70b-versatile',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/knowledge/summary/:lotId
 * --------------------------------------
 * AI-generated executive summary for a lot.
 */
export const getLotSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lotId } = req.params;

    const [lot, patternCount, failingPatterns, dieStats] = await Promise.all([
      prisma.lot.findUnique({ where: { id: lotId } }),
      prisma.pattern.count({ where: { lotId } }),
      prisma.pattern.count({ where: { lotId, failRate: { gt: 5 } } }),
      prisma.dieResult.aggregate({
        where: { waferRun: { lotId } },
        _count: { id: true },
        _avg: { testTimeMs: true },
      }),
    ]);

    if (!lot) throw new ApiError(404, `Lot ${lotId} not found.`);

    const passCount = await prisma.dieResult.count({ where: { waferRun: { lotId }, passed: true } });
    const totalDie  = dieStats._count.id || 1;
    const yieldPct  = ((passCount / totalDie) * 100).toFixed(2);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an ATE test engineering AI. Generate an executive summary for a production lot.
Respond ONLY in JSON: {
  "headline": "one-line status (e.g., 'Good yield with 3 critical patterns requiring review')",
  "summary": "2-3 sentence technical summary",
  "keyRisks": ["risk1", "risk2"],
  "recommendations": ["action1", "action2"],
  "status": "HEALTHY|WARNING|CRITICAL"
}`,
        },
        {
          role: 'user',
          content: `Lot: ${lot.lotNumber} (${lot.device})
Fab: ${lot.fab}
Total Patterns: ${patternCount}
Failing Patterns (>5% fail rate): ${failingPatterns}
Total Die Tested: ${totalDie}
Overall Yield: ${yieldPct}%
Avg Test Time: ${dieStats._avg.testTimeMs?.toFixed(1) || 'N/A'}ms`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return sendSuccess(res, {
      lotId,
      lotNumber: lot.lotNumber,
      device: lot.device,
      yield: `${yieldPct}%`,
      ...result,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/knowledge/explain/:patternId
 * ------------------------------------------
 * Ask the AI to explain why a specific pattern is failing.
 */
export const explainPattern = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patternId } = req.params;
    const { lotId } = req.body;

    const where = lotId ? { patternId, lotId } : { patternId };
    const pattern = await prisma.pattern.findFirst({
      where,
      include: { coverages: true },
    });

    if (!pattern) throw new ApiError(404, `Pattern ${patternId} not found.`);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an ATE test engineering expert. Explain why a test pattern is failing and what actions to take.
Respond ONLY in JSON: {
  "explanation": "technical explanation of the failure",
  "likelyCause": "most probable root cause",
  "impact": "HIGH|MEDIUM|LOW",
  "immediateActions": ["action1", "action2"],
  "longTermFix": "strategic recommendation"
}`,
        },
        {
          role: 'user',
          content: `Pattern: ${pattern.patternId} (${pattern.name || 'Unnamed'})
Type: ${pattern.type}
Domain: ${pattern.domain || 'Unknown'}
Fail Rate: ${pattern.failRate?.toFixed(2)}%
Fault Coverage: ${pattern.faultCoverage?.toFixed(1)}%
Kill Ratio: ${pattern.killRatio?.toFixed(2)}
Test Time: ${pattern.testTimeMs?.toFixed(1)}ms
Current Action: ${pattern.action}
Explain why this pattern is failing and what should be done.`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return sendSuccess(res, {
      patternId,
      patternName: pattern.name,
      type: pattern.type,
      failRate: pattern.failRate,
      ...result,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
