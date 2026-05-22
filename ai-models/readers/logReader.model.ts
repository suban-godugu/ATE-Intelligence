import { getGroqClient } from '../utils/groqProvider'
import type { LogReaderInput, LogReaderOutput, DieResultRaw } from '../types/modelTypes'

const client = getGroqClient('LOG')

export async function readATELog(input: LogReaderInput): Promise<LogReaderOutput> {
  const startTime = Date.now()
  const format = detectFormat(input.content)
  

  if (format === 'UNKNOWN_FORMAT') {
    const columnMap = await identifyStructureWithGroq(input.content)
    if (columnMap) {
      const result = parseWithColumnMap(input.content, columnMap)
      logResult(input.fileName, result, 2, startTime, columnMap.format)
      return result
    }
  }

  const structural = parseLogStructurally(input.content, format)
  const finalResult = { ...structural, confidence: 90 }
  logResult(input.fileName, finalResult, 1, startTime, format)
  return finalResult
}

function detectFormat(content: string): string {
  const lines = content.split('\n').slice(0, 5)
  if (lines.some(l => l.startsWith('@LOT:') || l.startsWith('@WAFER:'))) return 'TERADYNE'
  if (content.includes('SMARSITE') || content.includes('SmarTest')) return 'ADVANTEST'
  if (lines[0].includes(',') && lines[0].split(',').length > 3) return 'GENERIC_CSV'
  return 'UNKNOWN_FORMAT'
}

function parseLogStructurally(content: string, format: string): Omit<LogReaderOutput, 'confidence'> {
  const dies: DieResultRaw[] = []
  const lines = content.split('\n')
  let lotId = 'UNKNOWN'
  let waferId = 'UNKNOWN'

  if (format === 'TERADYNE') {
    lotId = content.match(/@LOT:\s*(\S+)/)?.[1] || 'UNKNOWN'
    waferId = content.match(/@WAFER:\s*(\S+)/)?.[1] || 'UNKNOWN'
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 6 && !line.startsWith('@')) {
        dies.push({
          dieX: parseInt(parts[0]),
          dieY: parseInt(parts[1]),
          passed: parts[2].toUpperCase() === 'PASS',
          failPatternId: parts[3],
          testTimeMs: parseFloat(parts[4]),
          binCode: parts[5],
          waferId
        })
      }
    })
  } else {
    // Advantest / Generic CSV logic
    const delimiter = format === 'ADVANTEST' ? '\t' : ','
    const headerRow = lines.find(l => l.toLowerCase().includes('die_x') || l.toLowerCase().includes('x_coord'))
    if (headerRow) {
      const cols = headerRow.split(delimiter).map(c => c.trim().toLowerCase())
      const idx = {
        x: cols.findIndex(c => ['die_x', 'diex', 'x', 'x_coord'].includes(c)),
        y: cols.findIndex(c => ['die_y', 'diey', 'y', 'y_coord'].includes(c)),
        res: cols.findIndex(c => ['result', 'pass_fail', 'status', 'passed'].includes(c)),
        pat: cols.findIndex(c => ['fail_pattern', 'failing_pattern', 'pattern', 'fail_id'].includes(c)),
        time: cols.findIndex(c => ['test_time_ms', 'time', 'duration'].includes(c)),
        bin: cols.findIndex(c => ['bin_code', 'bin', 'bin_num'].includes(c)),
        w: cols.findIndex(c => ['wafer_id', 'wafer'].includes(c))
      }
      
      lines.slice(lines.indexOf(headerRow) + 1).forEach(line => {
        const parts = line.split(delimiter)
        if (parts.length > Math.max(...Object.values(idx))) {
          dies.push({
            dieX: parseInt(parts[idx.x]),
            dieY: parseInt(parts[idx.y]),
            passed: parts[idx.res]?.toUpperCase().includes('PASS') || parts[idx.res] === '1',
            failPatternId: parts[idx.pat],
            testTimeMs: parseFloat(parts[idx.time]),
            binCode: parts[idx.bin],
            waferId: parts[idx.w] || waferId
          })
        }
      })
    }
  }

  return buildOutput(dies, lotId, waferId, format)
}

function buildOutput(dies: DieResultRaw[], lotId: string, waferId: string, testerType: string): Omit<LogReaderOutput, 'confidence'> {
  const patternStats = computePatternStats(dies)
  const zoneStats = computeZoneStats(dies)
  
  return {
    lotId,
    waferId,
    testerType,
    totalDies: dies.length,
    passCount: dies.filter(d => d.passed).length,
    failCount: dies.filter(d => !d.passed).length,
    dies,
    patternStats,
    zoneStats,
    warnings: dies.length === 0 ? ['No die records parsed'] : []
  }
}

function computePatternStats(dies: DieResultRaw[]) {
  const patterns = [...new Set(dies.map(d => d.failPatternId).filter(Boolean))] as string[]
  return patterns.map(pid => {
    const affected = dies.filter(d => d.failPatternId === pid)
    return {
      patternId: pid,
      failRate: (affected.length / dies.length) * 100,
      actualTestTimeMs: affected.reduce((acc, d) => acc + d.testTimeMs, 0) / affected.length,
      killRatio: 100, // Simplified
      detectPower: ((affected.length / dies.length) * 100) > 2 ? 'HIGH' : 'MEDIUM'
    } as any
  })
}

function computeZoneStats(dies: DieResultRaw[]) {
  const radius = Math.max(...dies.map(d => Math.sqrt(d.dieX**2 + d.dieY**2)))
  const zones: any[] = []
  const patterns = [...new Set(dies.map(d => d.failPatternId).filter(Boolean))] as string[]
  
  patterns.forEach(pid => {
    const affected = dies.filter(d => d.failPatternId === pid)
    const center = affected.filter(d => (Math.sqrt(d.dieX**2 + d.dieY**2) / radius) < 0.3).length
    zones.push({ patternId: pid, zone: 'center', failRate: (center / dies.length) * 100 })
  })
  return zones
}

async function identifyStructureWithGroq(content: string) {
  const apiKey = process.env.GROQ_API_KEY
  const isKeyValid = apiKey && apiKey !== 'your_key_here' && !apiKey.startsWith('your_')

  if (!isKeyValid) return null

  try {
    const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an ATE test log file parser.
You receive the first 20 lines of a log file and must identify the column structure.
Respond ONLY in JSON format:
{
  "format": "ADVANTEST|TERADYNE|COHU|GENERIC_CSV|UNKNOWN",
  "delimiter": "tab|comma|space|pipe",
  "columns": {
    "dieX": 0, "dieY": 1, "result": 2, "failPattern": 3, "testTimeMs": 4, "binCode": 5, "waferId": -1
  },
  "lotIdLocation": "header_line_3",
  "waferIdLocation": "column_5"
}`
      },
      { role: 'user', content: content.substring(0, 5000) }
    ]
  })
    const text = response.choices[0]?.message?.content || '{}'
    return JSON.parse(text)
  } catch {
    return null
  }
}

function parseWithColumnMap(content: string, map: any): LogReaderOutput {
  const lines = content.split('\n')
  const dies: DieResultRaw[] = []
  const delim = map.delimiter === 'tab' ? '\t' : (map.delimiter === 'comma' ? ',' : ' ')
  
  lines.forEach(line => {
    const parts = line.trim().split(delim)
    const columns = map?.columns || {};
    if (parts.length > Math.max(...(Object.values(columns) as number[]), -1)) {
      dies.push({
        dieX: parseInt(parts[columns.dieX]),
        dieY: parseInt(parts[columns.dieY]),
        passed: parts[columns.result]?.toUpperCase().includes('PASS'),
        failPatternId: parts[columns.failPattern],
        testTimeMs: parseFloat(parts[columns.testTimeMs]),
        binCode: parts[columns.binCode],
        waferId: 'UNKNOWN'
      })
    }
  })
  return { ...buildOutput(dies, 'UNKNOWN', 'UNKNOWN', map.format), confidence: 80 }
}

function logResult(fileName: string, res: any, phase: number, startTime: number, format: string) {
  const ms = Date.now() - startTime
  console.log(`[LogReader] ${fileName} → ${res.totalDies} dies, ${res.passCount} pass, ${res.failCount} fail — format:${format} phase:${phase} time:${ms}ms`)
}
