'use client'

/**
 * UsageInsightsScreen — Screen
 * Weekly usage of the assessment agent: KPI cards, the value/ROI inputs with a manual cost vs
 * AI cost comparison (chart or table), and assessments grouped by status.
 * Used in: HomePage
 */

import React, { useState } from 'react'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  Info,
  LineChart,
  List,
  PhoneCall,
  Hash,
} from 'lucide-react'
import {
  aiCost,
  ASSESSMENTS_BY_STATUS,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_WEEK_INDEX,
  formatUsd,
  manualCost,
  USAGE_WEEKS,
  type UsageAssumptions,
} from '@/lib/usageInsights'

const TEAL = '#36c0c9'
const ORANGE = '#ea580c'

const INPUT_ROWS: {
  key: keyof UsageAssumptions
  label: string
  hint?: string
  prefix?: string
  unit: string
  step: string
}[] = [
  {
    key: 'hoursPerAssessment',
    label: 'Hours spent on manual assessments',
    hint: '(per assessment)',
    unit: 'hours',
    step: '1',
  },
  { key: 'costPerHour', label: 'Cost per hour', prefix: '$', unit: 'USD', step: '1' },
  {
    key: 'inputTokenPrice',
    label: 'Input Token Price',
    hint: '(per 1M input tokens)',
    prefix: '$',
    unit: 'USD',
    step: '0.01',
  },
  {
    key: 'outputTokenPrice',
    label: 'Output Token Price',
    hint: '(per 1M output tokens)',
    prefix: '$',
    unit: 'USD',
    step: '0.01',
  },
  {
    key: 'inputVoicePrice',
    label: 'Input Token (Voice)',
    hint: '(per 1M voice tokens)',
    prefix: '$',
    unit: 'USD',
    step: '0.01',
  },
  {
    key: 'outputVoicePrice',
    label: 'Output Token (Voice)',
    hint: '(per 1M voice tokens)',
    prefix: '$',
    unit: 'USD',
    step: '0.01',
  },
]

const KpiCard: React.FC<{
  title: string
  value: string
  caption: string
  icon: React.ReactNode
}> = ({ title, value, caption, icon }) => (
  <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-[0.06em]">
        {title}
      </span>
      <div className="flex items-center justify-center shrink-0">{icon}</div>
    </div>
    <div className="text-4xl font-medium text-[#0d212c] leading-none my-1">{value}</div>
    <div className="h-[1px] bg-slate-100 w-full" />
    <div className="text-xs font-medium text-[#64748b]">{caption}</div>
  </div>
)

const CostChart: React.FC<{
  manual: number[]
  ai: number[]
  selected: number
  labels: string[]
}> = ({ manual, ai, selected, labels }) => {
  const W = 600
  const H = 260
  const left = 44
  const right = 124
  const top = 16
  const bottom = 36
  const max = Math.max(3000, Math.ceil(Math.max(...manual) / 1000) * 1000)
  const x = (i: number) => left + (i * (W - left - right)) / (manual.length - 1)
  const y = (v: number) => top + (1 - v / max) * (H - top - bottom)
  const line = (values: number[]) => values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const ticks = Array.from({ length: max / 1000 + 1 }, (_, i) => i * 1000)
  const last = manual.length - 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Manual cost versus AI cost by week"
      className="w-full h-auto"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="#eef2f6" />
          <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
            {t === 0 ? '$0' : `$${t / 1000}K`}
          </text>
        </g>
      ))}
      <line
        x1={x(selected)}
        x2={x(selected)}
        y1={top}
        y2={H - bottom}
        stroke="#cbd5e1"
        strokeDasharray="3 3"
      />
      <polyline points={line(manual)} fill="none" stroke={TEAL} strokeWidth="2.5" />
      <polyline points={line(ai)} fill="none" stroke={ORANGE} strokeWidth="2.5" />
      {manual.map((v, i) => (
        <circle key={`m${i}`} cx={x(i)} cy={y(v)} r={i === selected ? 5 : 3.5} fill={TEAL} />
      ))}
      {ai.map((v, i) => (
        <circle key={`a${i}`} cx={x(i)} cy={y(v)} r={i === selected ? 5 : 3.5} fill={ORANGE} />
      ))}
      <text x={x(last) + 12} y={y(manual[last]) + 4} fontSize="12" fontWeight="600" fill="#0d212c">
        Manual {formatUsd(manual[last])}
      </text>
      <text x={x(last) + 12} y={y(ai[last]) + 4} fontSize="12" fontWeight="600" fill="#0d212c">
        AI {formatUsd(ai[last])}
      </text>
      {labels.map((label, i) => (
        <text
          key={label}
          x={x(i)}
          y={H - 12}
          textAnchor="middle"
          fontSize="11"
          fontWeight={i === selected ? 700 : 400}
          fill={i === selected ? '#0d212c' : '#94a3b8'}
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

export const UsageInsightsScreen: React.FC = () => {
  const [weekIndex, setWeekIndex] = useState(DEFAULT_WEEK_INDEX)
  const [assumptions, setAssumptions] = useState<UsageAssumptions>(DEFAULT_ASSUMPTIONS)
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [showAll, setShowAll] = useState(false)

  const week = USAGE_WEEKS[weekIndex]
  const manualSeries = USAGE_WEEKS.map((w) => manualCost(w, assumptions))
  const aiSeries = USAGE_WEEKS.map((w) => aiCost(w, assumptions))
  const manual = manualSeries[weekIndex]
  const ai = aiSeries[weekIndex]
  const roi = ai > 0 ? manual / ai : 0

  const setValue = (key: keyof UsageAssumptions, raw: string) =>
    setAssumptions((prev) => ({ ...prev, [key]: raw === '' ? 0 : Math.max(0, Number(raw)) }))

  const shown = showAll ? 6 : 4

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Overview */}
      <section aria-labelledby="usage-overview" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="usage-overview" className="text-lg font-semibold text-[#0d212c]">
            Overview
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous week"
              disabled={weekIndex === 0}
              onClick={() => setWeekIndex((i) => i - 1)}
              className="w-9 h-9 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-[#475569] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <Calendar
                className="w-4 h-4 text-[#36c0c9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                aria-label="Week"
                value={weekIndex}
                onChange={(e) => setWeekIndex(Number(e.target.value))}
                className="h-9 appearance-none pl-9 pr-9 rounded-lg border border-[#e2e8f0] bg-white text-sm font-medium text-[#0d212c] hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2] cursor-pointer"
              >
                {USAGE_WEEKS.map((w, i) => (
                  <option key={w.full} value={i}>
                    {w.full}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              aria-label="Next week"
              disabled={weekIndex === USAGE_WEEKS.length - 1}
              onClick={() => setWeekIndex((i) => i + 1)}
              className="w-9 h-9 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-[#475569] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Output Generated"
            value={String(week.calls)}
            caption={`${week.calls} assessment calls`}
            icon={<PhoneCall className="w-5 h-5 text-[#0284c7] stroke-[2]" />}
          />
          <KpiCard
            title="Tokens Consumed"
            value={`${week.tokensM.toFixed(1)}M`}
            caption={`week of ${week.full}`}
            icon={<Hash className="w-5 h-5 text-[#6366f1] stroke-[2]" />}
          />
          <KpiCard
            title="Estimated AI Cost"
            value={formatUsd(ai)}
            caption={`week of ${week.short}, 2026 · Text & Voice tokens`}
            icon={<Coins className="w-5 h-5 text-[#d97706] stroke-[2]" />}
          />
        </div>
      </section>

      {/* Value / ROI */}
      <section aria-labelledby="usage-roi" className="flex flex-col gap-4">
        <h2 id="usage-roi" className="text-lg font-semibold text-[#0d212c]">
          Value/ROI
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 sm:p-6 flex flex-col">
            <ul className="flex flex-col divide-y divide-[#f1f5f9]">
              {INPUT_ROWS.map((row) => (
                <li
                  key={row.key}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0"
                >
                  <label htmlFor={`usage-${row.key}`} className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#0d212c]">{row.label}</span>
                    {row.hint && <span className="text-xs text-[#94a3b8]">{row.hint}</span>}
                  </label>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      {row.prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8]">
                          {row.prefix}
                        </span>
                      )}
                      <input
                        id={`usage-${row.key}`}
                        type="number"
                        min="0"
                        step={row.step}
                        value={assumptions[row.key]}
                        onChange={(e) => setValue(row.key, e.target.value)}
                        className={`w-28 h-10 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0d212c] text-center shadow-2xs transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2] ${
                          row.prefix ? 'pl-6' : ''
                        }`}
                      />
                    </div>
                    <span className="w-10 text-sm text-[#64748b]">{row.unit}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="pt-4 text-xs text-[#94a3b8]">AI cost includes text + voice tokens</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-base font-semibold text-[#0d212c]">Manual cost vs AI cost</h3>
                {view === 'chart' && (
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5" style={{ backgroundColor: TEAL }} />
                      Manual cost
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5" style={{ backgroundColor: ORANGE }} />
                      AI cost
                    </span>
                  </div>
                )}
              </div>
              <div
                role="group"
                aria-label="Chart view"
                className="flex items-center gap-1 p-1 rounded-lg border border-[#e2e8f0] bg-white"
              >
                {(
                  [
                    { id: 'chart', label: 'Chart', Icon: LineChart },
                    { id: 'table', label: 'Summary', Icon: List },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={view === id}
                    onClick={() => setView(id)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition ${
                      view === id ? 'bg-[#36c0c9] text-white' : 'text-[#64748b] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {view === 'chart' ? (
              <CostChart
                manual={manualSeries}
                ai={aiSeries}
                selected={weekIndex}
                labels={USAGE_WEEKS.map((w) => w.short)}
              />
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold text-[#0d212c] flex items-center gap-1.5">
                    Manual cost
                    <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-3xl font-semibold text-[#0d212c]">{formatUsd(manual)}</dd>
                  <span className="text-xs text-[#64748b]">
                    Total hours {week.calls * assumptions.hoursPerAssessment} | Cost per hour{' '}
                    {formatUsd(assumptions.costPerHour)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold text-[#0d212c] flex items-center gap-1.5">
                    AI cost
                    <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-3xl font-semibold" style={{ color: TEAL }}>
                    {formatUsd(ai)}
                  </dd>
                  <span className="text-xs text-[#64748b]">
                    Total tokens {week.tokensM.toFixed(1)}M · Text & Voice
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold text-[#0d212c] flex items-center gap-1.5">
                    Estimated ROI
                    <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-3xl font-semibold" style={{ color: TEAL }}>
                    {Math.round(roi)}x
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold text-[#0d212c] flex items-center gap-1.5">
                    Estimated savings
                    <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </dt>
                  <dd className="text-3xl font-semibold" style={{ color: TEAL }}>
                    {formatUsd(manual - ai)}
                    <span className="ml-2 text-sm font-normal text-[#64748b]">this week</span>
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Assessments by status */}
      <section aria-labelledby="usage-status" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="usage-status" className="text-lg font-semibold text-[#0d212c]">
            Assessments by Status
          </h2>
          <span className="text-sm text-[#64748b]">Week of {week.full}</span>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-[#f1f5f9]">
            {ASSESSMENTS_BY_STATUS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3 md:first:pl-0 md:pl-6">
                <h3 className="text-base font-semibold text-[#0d212c]">{group.title}</h3>
                <ul aria-label={group.title} className="flex flex-col divide-y divide-[#f1f5f9]">
                  {group.items.slice(0, shown).map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <span className="text-[#0d212c] truncate" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[#36c0c9] font-medium whitespace-nowrap">
                        {item.stage}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="self-center inline-flex items-center gap-1 text-sm font-medium text-[#36c0c9] hover:text-[#2fb0b9] cursor-pointer transition"
          >
            {showAll ? 'See less' : 'See more'}
            {showAll ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </section>
    </div>
  )
}
