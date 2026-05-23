import { useState, type ReactNode, type ReactElement } from 'react';

/**
 * Single semantic map aligned with the ATE shell + dashboards:
 * - brand: same as Sidebar/Topbar active (#6C63FF) — primary actions, active tab, scheduled/simulated purple UI
 * - success (+ KPI “good” numbers): teal — matches light Test Opt metrics / “Applied” emphasis in screenshots
 * - successBadge: green pill — Applied / Healthy row badges (executive table style)
 * - warning: amber — Pending, Not optimized, Slow first
 * - danger: red mid — destructive buttons, Slowest
 * - info: blue — links / yield callouts where distinct from brand
 * - accentWarm: coral — redundancy / pruning bars (high-signal warning, distinct from amber)
 *
 * Tailwind `ate.*` reference: cyan #00D9FF, violet #7C3AED, emerald #10B981, amber #F59E0B, rose #F43F5E
 * Shell uses #6C63FF for nav active — brand is unified to that value.
 */
const T = {
  brand: 'var(--accent-primary)',
  brandLight: 'rgba(108, 99, 255, 0.12)',
  success: 'var(--accent-teal)',
  successLight: 'rgba(16, 185, 129, 0.12)',
  successBadge: 'var(--accent-teal)',
  successBadgeLight: 'rgba(16, 185, 129, 0.12)',
  warning: 'var(--accent-amber)',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  danger: 'var(--accent-red)',
  dangerMid: 'var(--accent-red)',
  dangerLight: 'rgba(239, 68, 68, 0.12)',
  info: 'var(--accent-cyan)',
  infoLight: 'rgba(0, 200, 215, 0.12)',
  accentWarm: 'var(--accent-rose)',
  accentWarmLight: 'rgba(244, 63, 94, 0.12)',
} as const;

/** Color tokens (aliases onto T — use these in components for one mapping) */
const C = {
  purple: { main: T.brand, light: T.brandLight },
  teal: { main: T.success, light: T.successLight },
  amber: { main: T.warning, light: T.warningLight },
  red: { main: T.danger, mid: T.dangerMid, light: T.dangerLight },
  green: { main: T.successBadge, light: T.successBadgeLight },
  blue: { main: T.info, light: T.infoLight },
  coral: { main: T.accentWarm, light: T.accentWarmLight },
} as const;

/** Design tokens */
const S = {
  bg: { primary: 'var(--bg-card)', secondary: 'var(--bg-base)', tertiary: 'transparent' },
  border: '1px solid var(--border)',
  radius: { md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
  text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)', success: 'var(--accent-teal)' },
} as const;

type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'teal';

const badgeStyle = (tone: BadgeTone): React.CSSProperties => {
  const map: Record<BadgeTone, { bg: string; color: string }> = {
    green: { bg: C.green.light, color: C.green.main },
    amber: { bg: C.amber.light, color: C.amber.main },
    red: { bg: C.red.light, color: C.red.main },
    blue: { bg: C.blue.light, color: C.blue.main },
    purple: { bg: C.purple.light, color: C.purple.main },
    teal: { bg: C.teal.light, color: C.teal.main },
  };
  const t = map[tone];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 500,
    background: t.bg,
    color: t.color,
  };
};

function Badge({ children, color }: { children: ReactNode; color: BadgeTone }) {
  return <span style={badgeStyle(color)}>{children}</span>;
}

const btnBase: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  padding: '8px 14px',
  borderRadius: S.radius.md,
  cursor: 'pointer',
  border: 'none',
  fontFamily: 'inherit',
};

function BtnPrimary({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...btnBase, background: T.brand, color: '#fff' }}>
      {children}
    </button>
  );
}

function BtnSec({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...btnBase,
        background: 'transparent',
        color: S.text.primary,
        border: S.border,
      }}
    >
      {children}
    </button>
  );
}

function BtnDanger({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...btnBase, background: C.red.mid, color: '#fff' }}>
      {children}
    </button>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: S.bg.primary,
        border: S.border,
        borderRadius: S.radius.lg,
        padding: '13px 15px',
        marginBottom: '11px',
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: S.text.primary }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: '11px', color: S.text.secondary, marginTop: '2px' }}>{subtitle}</div>
        ) : null}
      </div>
      {right ? <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{right}</div> : null}
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueColor,
  delta,
  deltaColor,
}: {
  label: string;
  value: ReactNode;
  valueColor?: string;
  delta?: ReactNode;
  /** When set, delta line uses this color (e.g. brand for “Based on N lots”) */
  deltaColor?: string;
}) {
  return (
    <div
      style={{
        background: S.bg.secondary,
        border: S.border,
        borderRadius: S.radius.lg,
        padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: '11px', color: S.text.secondary, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 500, color: valueColor ?? S.text.primary }}>{value}</div>
      {delta != null ? (
        <div style={{ fontSize: '11px', color: deltaColor ?? S.text.secondary, marginTop: '4px' }}>{delta}</div>
      ) : null}
    </div>
  );
}

function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px] mb-[14px]">
      {children}
    </div>
  );
}

function Grid2({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[11px] mb-[11px]">{children}</div>
  );
}

function FieldRow({ label, value, valueColor }: { label: string; value: ReactNode; valueColor?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        padding: '8px 0',
        borderBottom: S.border,
      }}
    >
      <span style={{ color: S.text.secondary }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor ?? S.text.primary }}>{value}</span>
    </div>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table style={{ width: '100%', fontSize: '11px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              style={{
                textAlign: 'left',
                padding: '6px 4px',
                color: S.text.secondary,
                fontWeight: 500,
                borderBottom: S.border,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '8px 4px', borderBottom: S.border, verticalAlign: 'middle' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: '6px', background: S.bg.secondary, borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.2s' }} />
    </div>
  );
}

function MiniBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
        <span style={{ color: S.text.secondary }}>{label}</span>
        <span style={{ fontWeight: 500, color: S.text.primary }}>{pct}%</span>
      </div>
      <ProgressBar pct={pct} color={color} />
    </div>
  );
}

function FlowStep({
  n,
  title,
  detail,
  badge,
  optimized,
}: {
  n: number;
  title: string;
  detail?: string;
  badge?: ReactNode;
  optimized?: boolean;
}) {
  const circleBg = optimized ? C.teal.light : S.bg.secondary;
  const circleColor = optimized ? C.teal.main : S.text.secondary;
  const circleBorder = optimized ? `2px solid ${C.teal.main}` : S.border;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 10px',
        marginBottom: optimized ? '6px' : '0',
        borderBottom: optimized ? 'none' : S.border,
        borderRadius: optimized ? S.radius.md : undefined,
        border: optimized ? `1px solid ${C.teal.main}` : undefined,
        background: optimized ? C.teal.light : undefined,
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: circleBg,
          color: circleColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          border: circleBorder,
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: S.text.primary }}>{title}</div>
        {detail ? <div style={{ fontSize: '11px', color: S.text.secondary, marginTop: '2px' }}>{detail}</div> : null}
      </div>
      {badge}
    </div>
  );
}

function RecRow({
  rank,
  title,
  detail,
  badge,
  action,
}: {
  rank: number;
  title: string;
  detail: string;
  badge: ReactNode;
  action: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: S.border,
      }}
    >
      <div style={{ width: '22px', fontSize: '12px', fontWeight: 600, color: S.text.secondary }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '11px', color: S.text.secondary }}>{detail}</div>
      </div>
      {badge}
      {action}
    </div>
  );
}

function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
        <span style={{ color: S.text.secondary }}>{label}</span>
        <span style={{ fontWeight: 500 }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: T.brand }}
      />
    </div>
  );
}

function AiChip() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: 500,
        color: T.brand,
        background: T.brandLight,
        padding: '4px 10px',
        borderRadius: '999px',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={T.brand} aria-hidden>
        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
      </svg>
      AI recommendations
    </span>
  );
}

function OverviewTab() {
  return (
    <>
      <KpiRow>
        <KpiCard label="Pending optimizations" value={7} valueColor={C.purple.main} />
        <KpiCard
          label="Projected time saving"
          value="48.2%"
          valueColor={C.teal.main}
          delta="+12.4% vs last lot"
        />
        <KpiCard label="Projected cost/die reduction" value="$0.043" valueColor={C.amber.main} />
        <KpiCard label="Confidence score" value="94%" delta="Based on 1,240 lots" deltaColor={T.brand} />
      </KpiRow>
      <Grid2>
        <Card>
          <CardHeader title="Pipeline status" />
          <MiniBar label="Flow optimizer" pct={71} color={C.purple.main} />
          <MiniBar label="Pattern pruning" pct={55} color={C.coral.main} />
          <MiniBar label="Compression" pct={88} color={C.teal.main} />
          <MiniBar label="Yield predictor" pct={62} color={C.amber.main} />
        </Card>
        <Card>
          <CardHeader title="Recent actions" />
          <SimpleTable
            head={['Action', 'Status']}
            rows={[
              ['Flow reorder applied', <Badge key="a" color="green">Applied</Badge>],
              ['PT_041 removed', <Badge key="b" color="green">Applied</Badge>],
              ['64x compression sim', <Badge key="c" color="amber">Pending</Badge>],
              ['Yield threshold adj.', <Badge key="d" color="purple">Simulated</Badge>],
            ]}
          />
        </Card>
      </Grid2>
      <Card>
        <CardHeader title="Top recommendations" right={<AiChip />} />
        <RecRow
          rank={1}
          title="Apply 64x EDT compression"
          detail="Estimated scan-in reduction with low chain risk"
          badge={<Badge color="green">Save 1,240ms</Badge>}
          action={<BtnPrimary>Apply</BtnPrimary>}
        />
        <RecRow
          rank={2}
          title="Remove 4 redundant patterns"
          detail="Zero measured coverage loss on last 3 lots"
          badge={<Badge color="amber">Save $0.021/die</Badge>}
          action={<BtnSec>Review</BtnSec>}
        />
        <RecRow
          rank={3}
          title="Reorder flow MBIST before ATPG"
          detail="Reduces false fails on memory-heavy vectors"
          badge={<Badge color="blue">+1.2% yield</Badge>}
          action={<BtnSec>Review</BtnSec>}
        />
      </Card>
    </>
  );
}

function FlowOptimizerTab() {
  const [objective, setObjective] = useState<'time' | 'yield' | 'cost'>('time');
  const objectiveLabel =
    objective === 'time' ? 'Minimize test time' : objective === 'yield' ? 'Maximize yield' : 'Minimize cost/die';
  return (
    <>
      <KpiRow>
        <KpiCard label="Current test time" value="4,820ms" />
        <KpiCard label="Optimized test time" value="2,502ms" valueColor={C.teal.main} />
        <KpiCard label="Time saving" value="48.1%" valueColor={C.teal.main} />
        <KpiCard label="Objective" value={objectiveLabel} />
      </KpiRow>
      <Grid2>
        <Card>
          <CardHeader title="Current flow order" right={<Badge color="amber">Not optimized</Badge>} />
          <FlowStep n={1} title="ATPG stuck-at" detail="Baseline ordering" badge={<Badge color="amber">Slow first</Badge>} />
          <FlowStep n={2} title="ATPG transition" />
          <FlowStep n={3} title="MBIST" />
          <FlowStep n={4} title="LBIST" />
          <FlowStep n={5} title="Scan chain" badge={<Badge color="red">Slowest</Badge>} />
        </Card>
        <Card>
          <CardHeader title="AI recommended order" right={<AiChip />} />
          <FlowStep n={1} title="MBIST" detail="Early exit" optimized />
          <FlowStep n={2} title="LBIST" optimized />
          <FlowStep n={3} title="ATPG stuck-at" optimized />
          <FlowStep n={4} title="Scan chain 64x" detail="Upgraded" optimized />
          <FlowStep n={5} title="ATPG transition" optimized />
        </Card>
      </Grid2>
      <Card>
        <CardHeader
          title="Optimization objective"
          subtitle="Choose what the flow reorder should prioritize"
          right={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <BtnSec>Simulate first</BtnSec>
              <BtnPrimary>Apply reorder</BtnPrimary>
            </div>
          }
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(
            [
              ['time', 'Minimize test time'],
              ['yield', 'Maximize yield'],
              ['cost', 'Minimize cost/die'],
            ] as const
          ).map(([id, label]) =>
            objective === id ? (
              <BtnPrimary key={id} onClick={() => setObjective(id)}>
                {label}
              </BtnPrimary>
            ) : (
              <BtnSec key={id} onClick={() => setObjective(id)}>
                {label}
              </BtnSec>
            )
          )}
        </div>
      </Card>
    </>
  );
}

function PatternPruningTab() {
  const [checked, setChecked] = useState([true, true, true, false, false]);
  const allChecked = checked.every(Boolean);
  const toggleAll = () => {
    const v = !allChecked;
    setChecked(checked.map(() => v));
  };
  const toggleRow = (i: number) => {
    setChecked((c) => c.map((x, j) => (j === i ? !x : x)));
  };
  const rows = [
    { a: 'PT_038', b: 'PT_012', ov: '94.2%', uv: '3', conf: 'green' as const, imp: 'green' as const, impT: 'None', act: 'Remove' as const },
    { a: 'PT_039', b: 'PT_012', ov: '91.7%', uv: '5', conf: 'green' as const, imp: 'green' as const, impT: 'None', act: 'Remove' as const },
    { a: 'PT_041', b: 'PT_018', ov: '87.3%', uv: '8', conf: 'teal' as const, imp: 'green' as const, impT: 'None', act: 'Remove' as const },
    { a: 'PT_055', b: 'PT_023', ov: '76.1%', uv: '18', conf: 'amber' as const, imp: 'amber' as const, impT: '-0.04%', act: 'Review' as const },
    { a: 'PT_060', b: 'PT_031', ov: '71.8%', uv: '24', conf: 'amber' as const, imp: 'amber' as const, impT: '-0.09%', act: 'Review' as const },
  ];
  return (
    <>
      <KpiRow>
        <KpiCard label="Redundant patterns found" value={12} valueColor={C.coral.main} />
        <KpiCard label="Safe to remove" value={9} valueColor={C.teal.main} delta="Zero coverage loss" />
        <KpiCard label="Coverage impact" value="0.00%" />
        <KpiCard label="Data volume reduction" value="3.2 GB" valueColor={C.teal.main} />
      </KpiRow>
      <Card>
        <CardHeader
          title="Redundancy candidates"
          right={
            <>
              <BtnSec>Simulate all</BtnSec>
              <BtnDanger>Remove 9 patterns</BtnDanger>
            </>
          }
        />
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '36px', padding: '6px', borderBottom: S.border }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
              </th>
              {['Pattern A', 'Pattern B', 'Overlap', 'Unique vec.', 'Confidence', 'Impact', 'Action'].map((h) => (
                <th
                  key={h}
                  style={{ textAlign: 'left', padding: '6px 4px', borderBottom: S.border, color: S.text.secondary }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>
                  <input type="checkbox" checked={checked[i]} onChange={() => toggleRow(i)} />
                </td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>{r.a}</td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>{r.b}</td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>{r.ov}</td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>{r.uv}</td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>
                  <Badge color={r.conf}>{['98%', '96%', '93%', '81%', '78%'][i]}</Badge>
                </td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>
                  <Badge color={r.imp}>{r.impT}</Badge>
                </td>
                <td style={{ padding: '8px 4px', borderBottom: S.border }}>
                  {r.act === 'Remove' ? <BtnDanger>Remove</BtnDanger> : <BtnSec>Review</BtnSec>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Grid2>
        <Card>
          <CardHeader title="Coverage simulation preview" />
          <FieldRow label="Before" value="94.71%" />
          <FieldRow label="After" value="94.71%" valueColor={S.text.success} />
          <FieldRow label="Delta" value="0.00%" />
          <FieldRow label="Rollback token" value={<span style={{ fontFamily: 'monospace' }}>RBK-2026-041</span>} />
        </Card>
        <Card>
          <CardHeader title="Time + cost recovery" />
          <FieldRow label="Test time saved" value="320ms/lot" valueColor={S.text.success} />
          <FieldRow label="Cost/die" value="$0.021" valueColor={S.text.success} />
          <FieldRow label="Data volume" value="3.2 GB" />
          <FieldRow label="Annual saving" value="$48,200" valueColor={S.text.success} />
        </Card>
      </Grid2>
    </>
  );
}

const COMPRESSION_LOOKUP: Record<16 | 32 | 64 | 128, { time: number; cov: string; risk: string }> = {
  16: { time: 1960, cov: '0.0%', risk: 'Very low' },
  32: { time: 2040, cov: '0.0%', risk: 'Low' },
  64: { time: 1060, cov: '<0.3%', risk: 'Low' },
  128: { time: 580, cov: '~1.2%', risk: 'Medium' },
};

function CompressionTunerTab() {
  const [ratio, setRatio] = useState<16 | 32 | 64 | 128>(64);
  const d = COMPRESSION_LOOKUP[ratio];
  const ratios = [16, 32, 64, 128] as const;
  return (
    <>
      <KpiRow>
        <KpiCard label="Current compression" value="32x" />
        <KpiCard label="AI recommended" value="64x" valueColor={C.purple.main} />
        <KpiCard label="Scan-in time reduction" value="48.2%" valueColor={C.teal.main} />
        <KpiCard label="Coverage impact" value="<0.3%" />
      </KpiRow>
      <Grid2>
        <Card>
          <CardHeader title="Compression ratio selector" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {ratios.map((r) =>
              ratio === r ? (
                <BtnPrimary key={r} onClick={() => setRatio(r)}>
                  {r === 32 ? '32x (current)' : r === 64 ? '64x (AI rec.)' : `${r}x`}
                </BtnPrimary>
              ) : (
                <BtnSec key={r} onClick={() => setRatio(r)}>
                  {r === 32 ? '32x (current)' : r === 64 ? '64x (AI rec.)' : `${r}x`}
                </BtnSec>
              )
            )}
          </div>
          <FieldRow label="Selected ratio" value={`${ratio}x`} />
          <FieldRow label="Estimated scan-in time" value={`${d.time}ms`} valueColor={S.text.success} />
          <FieldRow label="Coverage impact" value={d.cov} />
          <FieldRow label="Chain imbalance risk" value={d.risk} />
        </Card>
        <Card>
          <CardHeader title="Chain health summary" />
          <SimpleTable
            head={['Chain', 'Length', 'Balance', 'Status']}
            rows={[
              ['SC_001', '1024', '98.2%', <Badge color="green">Healthy</Badge>],
              ['SC_002', '1018', '96.7%', <Badge color="green">Healthy</Badge>],
              ['SC_003', '1031', '91.1%', <Badge color="amber">Warning</Badge>],
              ['SC_004', '1009', '99.4%', <Badge color="green">Healthy</Badge>],
            ]}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <BtnSec>Simulate</BtnSec>
            <BtnPrimary>Apply {ratio}x upgrade</BtnPrimary>
          </div>
        </Card>
      </Grid2>
    </>
  );
}

function YieldPredictorTab() {
  const [stuckAt, setStuckAt] = useState(94);
  const [transition, setTransition] = useState(89);
  const [iddq, setIddq] = useState(82);
  return (
    <>
      <KpiRow>
        <KpiCard label="Current yield" value="87.4%" />
        <KpiCard label="Predicted yield optimized" value="89.1%" valueColor={C.teal.main} />
        <KpiCard label="Yield delta" value="+1.7%" valueColor={C.teal.main} />
        <KpiCard label="Model confidence" value="94%" />
      </KpiRow>
      <Grid2>
        <Card>
          <CardHeader title="Fault class threshold tuning" />
          <RangeSlider label="Stuck-at coverage" min={80} max={99} value={stuckAt} onChange={setStuckAt} />
          <RangeSlider label="Transition coverage" min={75} max={99} value={transition} onChange={setTransition} />
          <RangeSlider label="IDDQ threshold" min={70} max={99} value={iddq} onChange={setIddq} />
          <BtnPrimary>Predict yield</BtnPrimary>
        </Card>
        <Card>
          <CardHeader title="Predicted outcomes by fab" />
          <SimpleTable
            head={['Fab', 'Before', 'After', 'Delta']}
            rows={[
              ['Fab A', '88.1%', <span style={{ color: S.text.success }}>89.9%</span>, <Badge color="green">+1.8%</Badge>],
              ['Fab B', '86.2%', <span style={{ color: S.text.success }}>87.8%</span>, <Badge color="green">+1.6%</Badge>],
              ['Fab C', '89.4%', <span style={{ color: S.text.success }}>90.1%</span>, <Badge color="green">+0.7%</Badge>],
              ['Fab D', '84.9%', <span style={{ color: S.text.success }}>86.8%</span>, <Badge color="green">+1.9%</Badge>],
            ]}
          />
          <FieldRow label="Correlated fault class" value="Stuck-at dominant" />
          <FieldRow label="Diminishing returns at" value="~850 patterns" />
        </Card>
      </Grid2>
    </>
  );
}

function SavingsDashboardTab() {
  return (
    <>
      <KpiRow>
        <KpiCard label="Total time saved" value="1,560ms" valueColor={C.teal.main} delta="per lot run" />
        <KpiCard label="Cost/die reduction" value="$0.043" valueColor={C.teal.main} delta="applied optimizations" />
        <KpiCard label="Yield improvement" value="+1.7%" valueColor={C.teal.main} delta="avg across fabs" />
        <KpiCard label="Patterns removed" value={9} delta="3.2 GB freed" />
      </KpiRow>
      <Grid2>
        <Card>
          <CardHeader title="Applied vs pending" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: S.text.success }}>5</div>
              <div style={{ fontSize: '11px', color: S.text.secondary }}>Applied</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: C.amber.main }}>3</div>
              <div style={{ fontSize: '11px', color: S.text.secondary }}>Pending</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 500, color: T.brand }}>2</div>
              <div style={{ fontSize: '11px', color: T.brand }}>Simulated</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: S.text.secondary, marginBottom: '6px' }}>5 of 10 optimizations applied</div>
          <ProgressBar pct={50} color={C.teal.main} />
        </Card>
        <Card>
          <CardHeader title="Annual projected savings" />
          <FieldRow label="Cost reduction" value="$124,800" valueColor={S.text.success} />
          <FieldRow label="Test time recovered" value="4,368 hrs" valueColor={S.text.success} />
          <FieldRow label="Yield value gain" value="$89,200" valueColor={S.text.success} />
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: S.border }}>
            <div style={{ fontSize: '11px', color: S.text.secondary }}>Total projected</div>
            <div style={{ fontSize: '26px', fontWeight: 500, color: S.text.success }}>$214,000</div>
          </div>
        </Card>
      </Grid2>
      <Card>
        <CardHeader title="Savings by module" right={<BtnSec>Export report</BtnSec>} />
        <SimpleTable
          head={['Module', 'Optimizations', 'Time saved', 'Cost reduction', 'Yield delta', 'Status']}
          rows={[
            ['Flow optimizer', '12', '620ms', '$0.012', '+0.4%', <Badge color="green">Applied</Badge>],
            ['Pattern pruning', '9', '320ms', '$0.021', '0.0%', <Badge color="green">Applied</Badge>],
            ['Compression tuner', '4', '480ms', '$0.008', '+0.2%', <Badge color="amber">Pending</Badge>],
            ['Yield predictor', '6', '140ms', '$0.002', '+1.7%', <Badge color="purple">Simulated</Badge>],
            ['Schedule optimizer', '3', '—', '—', '—', <Badge color="purple">Scheduled</Badge>],
          ]}
        />
      </Card>
    </>
  );
}

const TABS: { id: string; label: string; Component: () => ReactElement }[] = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'flow', label: 'Flow optimizer', Component: FlowOptimizerTab },
  { id: 'pruning', label: 'Pattern pruning', Component: PatternPruningTab },
  { id: 'compression', label: 'Compression tuner', Component: CompressionTunerTab },
  { id: 'yield', label: 'Yield predictor', Component: YieldPredictorTab },
  { id: 'savings', label: 'Savings dashboard', Component: SavingsDashboardTab },
];

export function TestOptimizationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const Active = TABS.find((t) => t.id === activeTab)?.Component ?? OverviewTab;

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        color: S.text.primary,
        minHeight: '100%',
        background: S.bg.tertiary,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: S.bg.primary,
          borderBottom: S.border,
        }}
      >
        <header
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>⚙ Test optimization</div>
            <div style={{ fontSize: '11px', color: S.text.secondary, marginTop: '2px' }}>
              AI-driven recommendations to reduce cost, time, and maximize yield
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Badge color="teal">AI active</Badge>
            <BtnSec>Export</BtnSec>
          </div>
        </header>

        <nav
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            padding: '0 12px',
            flexWrap: 'nowrap',
            borderTop: S.border,
          }}
        >
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: active ? 500 : 400,
                  color: active ? T.brand : S.text.secondary,
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? `2px solid ${T.brand}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginBottom: '-1px',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <main style={{ padding: '14px', background: S.bg.tertiary }}>
        <Active />
      </main>
    </div>
  );
}

export default TestOptimizationDashboard;
