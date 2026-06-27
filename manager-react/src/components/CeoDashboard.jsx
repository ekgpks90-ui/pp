import { useMemo, useState } from 'react'
import { MONDAY_ISO, addDays, fmtMoney, enrichProject } from '../data/helpers'
import { SectionCard, ProgressBar } from './CeoUI'
import CeoSlideOver from './CeoSlideOver'
import CeoProjectDetail from './CeoProjectDetail'
import CeoApprovalDetail from './CeoApprovalDetail'
import ConfirmModal from './ConfirmModal'

// 대표(어드민) 경영 대시보드 — 홈. (기획서 context/ceo-experience.md 3-1 / 2026-06-20 디벨롭 반영)
// 와이어프레임 ceo-home-wireframe-v4 구조를 프로젝트 디자인 시스템(CeoUI·index.css 토큰)으로 변환:
//  - 상단 KPI 스트립(5지표) + 기간 전환(주간/월간/분기)
//  - 2열(좌2.2 프로젝트 투자현황 / 우1.0 결재함)
//  - 투자=직급별 단가×투입 일수(실데이터). "완료" 토글 안 만듦.
//  - 데이터 미보유 항목(가동률 추이 과거치)은 "예시" 표기. 프로젝트 예상 견적이 없어
//    예상→실제는 정상 기간 기준 투입(예상) → 지연 초과분 가산(실제)으로 산출(정시=0%).

const STATUS = {
  '진행 중': { color: 'var(--color-blue)' },
  '지연': { color: 'var(--color-red)' },
  '시작 전': { color: 'var(--color-soft)' },
}
const STATUS_BADGE = {
  '진행 중': { color: '#2563eb', bg: 'var(--color-blue-soft)' },
  '지연': { color: '#dc2626', bg: 'var(--color-red-soft)' },
  '시작 전': { color: '#72728a', bg: 'var(--color-surface-muted)' },
}
const TYPE_BADGE = {
  '계약 승인': { label: '계약', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  '예산 승인': { label: '예산', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  '프로젝트 착수 승인': { label: '착수', color: '#0ea874', bg: 'rgba(14,168,116,0.12)' },
  '프로젝트 종료 승인': { label: '종료', color: '#7c4dff', bg: 'rgba(124,77,255,0.12)' },
}

const TABS = ['전체', '진행 중', '지연', '이번 주 납기']
const PERIODS = ['주간', '월간', '분기']
const PERIOD_LABEL = { '주간': '이번 주', '월간': '이번 달', '분기': '이번 분기' }

function mmdd(d) { return d ? d.slice(5).replace('-', '/') : '—' }

function StatusBadge({ status }) {
  const c = STATUS_BADGE[status] || STATUS_BADGE['시작 전']
  return (
    <span className="text-[10px] font-semibold px-2 py-[3px] rounded-md whitespace-nowrap shrink-0"
      style={{ color: c.color, background: c.bg }}>{status}</span>
  )
}

function approvalDetail(item) {
  // 결재 요청 시 항목이 선택 입력이라 비어 있을 수 있다 → 값이 있는 조각만 ' · '로 잇는다.
  const money = (v) => (typeof v === 'number' && v > 0 ? fmtMoney(v) : null)
  const join = (parts) => parts.filter(Boolean).join(' · ')
  switch (item.type) {
    case '계약 승인': return join([item.client, money(item.amount), item.period])
    case '예산 승인': return join([money(item.amount), item.purpose])
    case '프로젝트 착수 승인': return join([
      item.plannedHeadcount ? `👤${item.plannedHeadcount}명` : null, item.plannedPeriod, money(item.plannedBudget),
    ])
    case '프로젝트 종료 승인': return item.resultSummary || ''
    default: return ''
  }
}

// 결재 안건에 실데이터로 도출 가능한 판단 근거만 노출(없으면 박스 생략 — 과거거래·수익률 등 미보유 값은 만들지 않음).
function approvalContext(item) {
  const rows = []
  if (item.type === '프로젝트 착수 승인' && item.expectedRevenue && item.plannedBudget) {
    rows.push({ k: '예상 수익', v: `≈${fmtMoney(item.expectedRevenue - item.plannedBudget)}`, tone: 'good' })
    rows.push({ k: '예상 매출', v: `${fmtMoney(item.expectedRevenue)} (예시)` })
  }
  return rows
}

function KpiChip({ label, value, unit, sub, valueColor, highlight }) {
  return (
    <div className={`flex-1 min-w-0 rounded-[10px] px-3.5 py-2.5 flex items-center justify-between border ${highlight ? 'border-transparent' : 'border-line bg-surface'}`}
      style={highlight ? { background: 'linear-gradient(135deg,#5d87ff,#4570ea)' } : undefined}>
      <div className="min-w-0">
        <div className="text-[10px] text-soft mb-[3px] whitespace-nowrap">{label}</div>
        <div className="text-[19px] font-bold font-mono leading-none"
          style={{ color: highlight ? '#fff' : (valueColor || 'var(--color-text-primary)') }}>
          {value}{unit && <span className="text-[11px] font-normal text-soft ml-0.5">{unit}</span>}
        </div>
      </div>
      {sub && <div className="text-[9px] text-soft text-right shrink-0 ml-2 whitespace-nowrap">{sub}</div>}
    </div>
  )
}

export default function CeoDashboard({
  workItems = [], sessions = [], teamMembers = [], processes = [],
  approvalItems = [], gradeRates = {},
  onApproveItem, onRejectItem,
}) {
  const [period, setPeriod] = useState('월간')
  const [tab, setTab] = useState('전체')
  const [showMoney, setShowMoney] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [confirm, setConfirm] = useState(null) // { kind: 'approve'|'reject', item }

  const d = useMemo(() => {
    const weekEnd = addDays(MONDAY_ISO, 6)

    const projects = workItems
      .filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
      .map(wi => enrichProject(wi, sessions, teamMembers, gradeRates, processes))
      .sort((a, b) => (a.end || '').localeCompare(b.end || ''))

    const inProgress = projects.filter(p => p.status === '진행 중')
    const delayed = projects.filter(p => p.status === '지연')
    const dueThisWeek = projects.filter(p => p.end && p.end >= MONDAY_ISO && p.end <= weekEnd)

    const utils = teamMembers.map(m => ({
      name: m.name,
      util: Math.round((((m.weekWorkItems || []).length) / 4) * 100),
    }))
    const avgUtil = utils.length ? Math.round(utils.reduce((s, u) => s + u.util, 0) / utils.length) : 0
    const overloaded = utils.filter(u => u.util > 100).sort((a, b) => b.util - a.util)
    const light = utils.filter(u => u.util < 50).sort((a, b) => a.util - b.util)

    const totalMdElapsed = projects.reduce((s, p) => s + p.mdElapsed, 0)
    const totalCostElapsed = projects.reduce((s, p) => s + p.costElapsed, 0)
    const totalBaseCost = projects.reduce((s, p) => s + p.baseCost, 0)
    const totalAddCost = projects.reduce((s, p) => s + p.addCost, 0)
    const delayAddCost = delayed.reduce((s, p) => s + p.addCost, 0)
    const costDiffPct = totalBaseCost ? Math.round((totalAddCost / totalBaseCost) * 100) : 0

    return {
      projects, inProgress, delayed, dueThisWeek,
      avgUtil, overloaded, light,
      totalMdElapsed, totalCostElapsed, delayAddCost, costDiffPct,
    }
  }, [workItems, sessions, teamMembers, processes, gradeRates])

  const counts = {
    '전체': d.projects.length,
    '진행 중': d.inProgress.length,
    '지연': d.delayed.length,
    '이번 주 납기': d.dueThisWeek.length,
  }
  const list = tab === '진행 중' ? d.inProgress
    : tab === '지연' ? d.delayed
      : tab === '이번 주 납기' ? d.dueThisWeek
        : d.projects

  const pending = approvalItems.filter(a => a.status === '대기')

  return (
    <div className="flex-1 min-h-0 overflow-hidden px-4 py-3 flex flex-col gap-3">

      {/* 기간 전환 (주간/월간/분기) */}
      <div className="flex items-center gap-1 shrink-0">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`text-[11px] px-3 py-1.5 rounded-md cursor-pointer transition-colors
              ${period === p ? 'bg-blue-soft text-blue font-semibold' : 'text-muted hover:text-text-sub'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* KPI 스트립 (5지표) */}
      <div className="flex gap-2.5 shrink-0">
        <KpiChip label="평균 가동률" value={d.avgUtil} unit="%" sub="목표 85%" />
        <KpiChip label="과부하 / 여유" value={d.overloaded.length} unit={`/ ${d.light.length}명`}
          valueColor={d.overloaded.length ? 'var(--color-red)' : undefined}
          sub={d.overloaded.length && d.light.length ? '재배분 가능' : '—'} />
        <KpiChip label="진행 / 지연" value={d.inProgress.length} unit={`/ ${d.delayed.length}건`}
          sub={d.delayed.length ? `지연 ${d.delayed.length}` : '안정'} />
        <KpiChip label="예상 대비 실제" value={`${d.costDiffPct >= 0 ? '+' : ''}${d.costDiffPct}`} unit="%"
          valueColor={d.costDiffPct > 10 ? 'var(--color-red)' : undefined} sub="목표 ±10%" />
        <KpiChip highlight label={`${PERIOD_LABEL[period]} 총 투입`} value={fmtMoney(d.totalCostElapsed)}
          sub={`${d.totalMdElapsed} 사람·일`} />
      </div>

      {/* 2열 */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* 좌: 프로젝트 투자 현황 */}
        <div className="min-w-0 min-h-0 flex" style={{ flex: 2.2 }}>
          <SectionCard title="프로젝트 투자 현황" className="h-full w-full"
            action={
              <button onClick={() => setShowMoney(s => !s)}
                className="text-[11px] font-medium px-2 py-[3px] rounded-full border border-line text-muted hover:text-blue cursor-pointer">
                {showMoney ? '금액' : '공수만'}
              </button>
            }>
            <div className="flex gap-1.5 px-4 py-2.5 flex-wrap shrink-0 border-b border-line-soft">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors
                    ${tab === t ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:text-text-sub'}`}>
                  {t} <span className="opacity-70">{counts[t]}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="px-4 pt-2.5 pb-1 text-[11px] text-soft">
                {tab === '지연'
                  ? <>지연 {d.delayed.length}건{showMoney && ` · 추가비용 ≈${fmtMoney(d.delayAddCost)}`}</>
                  : <>총 {list.length}건{showMoney && ` · 누적 투입 ≈${fmtMoney(d.totalCostElapsed)}`}</>}
              </div>
              <div className="grid grid-cols-[1.8fr_1.1fr_0.8fr_1fr] gap-2.5 px-4 py-1.5 text-[10px] font-semibold text-soft">
                <div>프로젝트 / 진행률</div>
                <div>{showMoney ? '예상 / 실제' : '공수'}</div>
                <div className="text-center">인원</div>
                <div className="text-right">상태</div>
              </div>
              {list.length === 0 && (
                <div className="text-[12px] text-soft text-center py-10">해당 프로젝트가 없습니다</div>
              )}
              {list.map(p => (
                <div key={p.id} onClick={() => setSelectedProject(p)}
                  className="grid grid-cols-[1.8fr_1.1fr_0.8fr_1fr] gap-2.5 items-center px-4 py-3 border-t border-line-soft border-l-[3px] cursor-pointer hover:bg-surface-hover transition-colors"
                  style={{ borderLeftColor: p.status === '지연' ? 'var(--color-red)' : 'transparent' }}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-text-primary truncate mb-1.5">{p.title}</div>
                    <div className="flex items-center gap-1.5">
                      <ProgressBar value={p.progress} color={STATUS[p.status].color} height="h-[5px]" />
                      <span className="text-[10px] font-mono text-soft w-7 text-right">{p.progress}%</span>
                    </div>
                  </div>
                  {showMoney ? (
                    <div className="text-[11px] leading-tight">
                      <div className="text-soft whitespace-nowrap">예상 ≈{fmtMoney(p.baseCost)}</div>
                      <div className="whitespace-nowrap mt-0.5">
                        <span className="text-soft">→ </span>
                        <span className="font-bold text-text-primary">{fmtMoney(p.actualCost)}</span>
                        <span className="text-[10px] font-semibold ml-1" style={{ color: p.addCost > 0 ? 'var(--color-red)' : 'var(--color-soft)' }}>
                          {p.addCost > 0 ? `+${p.diffPct}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted">{p.mdTotal} 사람·일</div>
                  )}
                  <div className="text-[11px] text-muted text-center leading-tight">
                    <span className="text-[13px] font-bold text-text-primary">{p.hc}</span>명
                    <div className="text-[10px] text-soft">{p.days}일</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={p.status} />
                    <div className="text-[10px] text-soft mt-1">{p.status === '지연' ? `+${p.od}일` : mmdd(p.end)}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* 우: 결재함 */}
        <div className="min-w-0 min-h-0 flex" style={{ flex: 1 }}>
          <SectionCard title="결재함" className="h-full w-full"
            action={<span className="text-[11px] font-semibold text-purple bg-purple-soft rounded-full px-2.5 py-0.5">{pending.length}건 대기</span>}>
            <div className="flex-1 min-h-0 overflow-auto p-3 flex flex-col gap-2.5">
              {pending.length === 0 && (
                <div className="text-[12px] text-soft text-center py-10">결재할 안건이 없습니다</div>
              )}
              {pending.map(item => {
                const badge = TYPE_BADGE[item.type] || TYPE_BADGE['계약 승인']
                const ctx = approvalContext(item)
                return (
                  <div key={item.id} className="rounded-[10px] border border-line-soft p-3">
                    <span className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-md mb-1.5"
                      style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>
                    <div className="text-[12.5px] font-semibold text-text-sub mb-1">{item.title}</div>
                    <div className="text-[11px] text-soft mb-1.5">{approvalDetail(item)}</div>
                    {ctx.length > 0 && (
                      <div className="bg-surface-muted rounded-lg px-2.5 py-2 mb-2 flex flex-col gap-1">
                        {ctx.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px] text-muted">
                            <span>{r.k}</span>
                            <span className={r.tone === 'good' ? 'text-green font-semibold' : r.tone === 'warn' ? 'text-orange font-semibold' : ''}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] text-soft mb-2.5">요청 {item.requester} · {mmdd(item.requestedAt)}</div>
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                      <button onClick={() => setConfirm({ kind: 'approve', item })}
                        className="bg-blue text-white text-[11px] font-semibold py-[7px] rounded-md hover:opacity-90 cursor-pointer transition-opacity">승인</button>
                      <button onClick={() => setConfirm({ kind: 'reject', item })}
                        className="bg-surface text-muted text-[11px] py-[7px] rounded-md border border-line hover:text-red hover:border-red cursor-pointer transition-colors">반려</button>
                      <button onClick={() => setSelectedApproval(item)}
                        className="bg-surface text-soft text-[11px] px-2.5 py-[7px] rounded-md border border-line hover:text-blue cursor-pointer transition-colors">상세</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>

      </div>

      {/* Project Status 상세 슬라이드 */}
      {selectedProject && (
        <CeoSlideOver title="프로젝트 상세" onClose={() => setSelectedProject(null)}>
          <CeoProjectDetail project={selectedProject} sessions={sessions} processes={processes}
            teamMembers={teamMembers} gradeRates={gradeRates} showMoney={showMoney} />
        </CeoSlideOver>
      )}

      {/* 결재 안건 상세 슬라이드 (승인/반려 → 확인 모달) */}
      {selectedApproval && (
        <CeoSlideOver title="결재 안건" onClose={() => setSelectedApproval(null)}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirm({ kind: 'reject', item: selectedApproval })}
                className="h-10 text-[13px] font-semibold rounded-lg border border-line text-muted hover:text-red hover:border-red transition-colors cursor-pointer">반려</button>
              <button onClick={() => setConfirm({ kind: 'approve', item: selectedApproval })}
                className="h-10 text-[13px] font-semibold rounded-lg bg-blue text-white hover:opacity-90 transition-opacity cursor-pointer">승인</button>
            </div>
          }>
          <CeoApprovalDetail item={selectedApproval} />
        </CeoSlideOver>
      )}

      {/* 승인/반려 확인 모달 */}
      {confirm && (
        <ConfirmModal
          title={confirm.kind === 'approve' ? '안건 승인' : '안건 반려'}
          message={`'${confirm.item.title}' 안건을 ${confirm.kind === 'approve' ? '승인' : '반려'}하시겠습니까?`}
          confirmLabel={confirm.kind === 'approve' ? '승인' : '반려'}
          confirmTone={confirm.kind === 'approve' ? 'blue' : 'red'}
          onConfirm={() => {
            if (confirm.kind === 'approve') onApproveItem?.(confirm.item.id)
            else onRejectItem?.(confirm.item.id, null)
            setConfirm(null)
            setSelectedApproval(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
