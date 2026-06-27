import { useMemo, useState } from 'react'
import {
  TODAY_ISO, MONDAY_ISO, addDays, toDate, calcMinutes, fmtDuration, fmtMoney,
  enrichProject, clientOf,
} from '../data/helpers'
import { StatCard, Panel, ProgressBar } from './CeoUI'
import CeoSlideOver from './CeoSlideOver'
import CeoProjectDetail from './CeoProjectDetail'
import CeoApprovalDetail from './CeoApprovalDetail'

// 대표(어드민) Report Center — 6탭(수익성·프로젝트·결재·인력·연차·Export).
// 성격: 대표가 경영을 깊이 들여다보는 분석 보고서(홈은 한눈에, 리포트는 자세히).
// 기획서 context/ceo-experience.md 3-4. 결정 요지:
//  - 실데이터(투입 원가·공수·진행률·가동률·과부하·거래처별 원가·결재 금액)와 예시(매출·수익률)를 명확히 구분.
//  - "완료" 상태를 만들지 않으므로(CLAUDE.md) 완료율·재작업률은 만들지 않고 진행률·진행 중/지연으로 표현.
//  - 야근 비율(근무시간 데이터 없음)은 과부하 인원(가동률 100% 초과)으로 대체.

const AP_TYPE = {
  '계약 승인': { label: '계약', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  '예산 승인': { label: '예산', color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  '프로젝트 착수 승인': { label: '착수', color: '#0ea874', bg: 'rgba(14,168,116,0.12)' },
  '프로젝트 종료 승인': { label: '종료', color: '#7c4dff', bg: 'rgba(124,77,255,0.12)' },
}
const AP_STATUS = {
  '대기': { color: '#d97706', bg: 'var(--color-orange-soft)' },
  '승인': { color: '#0ea874', bg: 'var(--color-green-soft)' },
  '반려': { color: '#dc2626', bg: 'var(--color-red-soft)' },
}
function apAmount(it) {
  if (it.amount) return it.amount
  if (it.plannedBudget) return it.plannedBudget
  if (it.actualInput) return it.actualInput.cost
  return 0
}

const STATUS_BADGE = {
  '진행 중': { color: '#2563eb', bg: 'var(--color-blue-soft)' },
  '지연': { color: '#dc2626', bg: 'var(--color-red-soft)' },
  '시작 전': { color: '#72728a', bg: 'var(--color-surface-muted)' },
}
function mmdd(d) { return d ? d.slice(5).replace('-', '/') : '—' }
// 부호 있는 금액(마진은 음수 가능): -340만 / 1,090만
function fmtSigned(won) { return (won < 0 ? '-' : '') + fmtMoney(Math.abs(won)) }
// 마진율 → 색 (적자 빨강 / 박함 주황 / 양호 초록)
function marginColor(pct) { return pct < 0 ? '#dc2626' : pct < 25 ? '#d97706' : '#0ea874' }
const PROFIT_TAG = {
  real: { label: '실데이터', color: '#2563eb', bg: 'var(--color-blue-soft)' },
  calc: { label: '계산', color: '#0ea874', bg: 'var(--color-green-soft)' },
  coming: { label: '연동 예정', color: '#a8a8be', bg: 'var(--color-surface-muted)' },
}

const TABS = [
  { id: 'profit', label: '수익성' },
  { id: 'project', label: '프로젝트' },
  { id: 'approval', label: '결재' },
  { id: 'people', label: '인력' },
  { id: 'leave', label: '연차' },
  { id: 'export', label: 'Export' },
]

export default function CeoReportCenter({
  workItems = [], sessions = [], leaves = [], teamMembers = [], totalLeave = 15, approvalItems = [], processes = [], gradeRates = {},
  onApproveLeave, onRejectLeave, onApproveItem, onRejectItem,
}) {
  const [tab, setTab] = useState('profit')
  const [selectedClient, setSelectedClient] = useState(null) // 수익성 거래처 슬라이드
  const [selectedProject, setSelectedProject] = useState(null) // 프로젝트 상세 슬라이드
  const [projFilter, setProjFilter] = useState('전체') // 전체·진행 중·지연·예산초과
  const [projSort, setProjSort] = useState('risk') // risk·cost·over·progress·due
  const [projQuery, setProjQuery] = useState('')
  const [selectedApproval, setSelectedApproval] = useState(null) // 결재 안건 슬라이드
  const [apStatus, setApStatus] = useState('전체') // 전체·대기·승인·반려
  const [apType, setApType] = useState('전체') // 전체·계약·예산·착수·종료
  const [exportSel, setExportSel] = useState({ profit: true, project: true }) // Export 리포트 선택
  const [exportFormat, setExportFormat] = useState('PDF')
  const [exportPeriod, setExportPeriod] = useState('month')

  const ap = useMemo(() => ({
    all: approvalItems,
    pending: approvalItems.filter(a => a.status === '대기').length,
    approved: approvalItems.filter(a => a.status === '승인').length,
    rejected: approvalItems.filter(a => a.status === '반려').length,
    approvedAmount: approvalItems.filter(a => a.status === '승인').reduce((s, a) => s + apAmount(a), 0),
  }), [approvalItems])

  const m = useMemo(() => {
    const weekEnd = addDays(MONDAY_ISO, 6)

    // ── 프로젝트 (홈·캘린더와 동일 계산 — enrichProject 공유) + 거래처
    const projects = workItems
      .filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
      .map(wi => ({ ...enrichProject(wi, sessions, teamMembers, gradeRates, processes), client: clientOf(wi) }))
      .sort((a, b) => b.costTotal - a.costTotal)

    const inProgress = projects.filter(p => p.status === '진행 중')
    const delayed = projects.filter(p => p.status === '지연')
    const overBudget = projects.filter(p => p.addCost > 0) // 지연 초과분이 있는(예산 초과) 프로젝트
    const riskCount = projects.filter(p => p.status === '지연' || p.diffPct > 10).length
    const avgDuration = projects.length ? Math.round(projects.reduce((a, p) => a + p.days, 0) / projects.length) : 0
    const delayRate = projects.length ? Math.round((delayed.length / projects.length) * 100) : 0
    const totalCostTotal = projects.reduce((s, p) => s + p.costTotal, 0)
    const totalCostElapsed = projects.reduce((s, p) => s + p.costElapsed, 0)
    const totalMdTotal = projects.reduce((s, p) => s + p.mdTotal, 0)

    // ── 거래처별 투입 원가 비중 (실데이터)
    const clientMap = {}
    projects.forEach(p => {
      if (!clientMap[p.client]) clientMap[p.client] = { client: p.client, count: 0, cost: 0 }
      clientMap[p.client].count += 1
      clientMap[p.client].cost += p.costTotal
    })
    const clients = Object.values(clientMap).sort((a, b) => b.cost - a.cost)
    const clientMax = clients.length ? clients[0].cost : 0

    // ── 거래처별 마진 (계약금 − 투입 원가). 계약금 = 승인된 '계약 승인' 결재(실데이터).
    const normClient = (s) => (s || '').replace(/^\(주\)/, '').replace(/\(주\)$/, '').trim()
    const contractByClient = {}
    approvalItems
      .filter(a => a.type === '계약 승인' && a.status === '승인')
      .forEach(a => { const c = normClient(a.client); contractByClient[c] = (contractByClient[c] || 0) + (a.amount || 0) })

    // 거래처별 원가는 지연 초과분(addCost)까지 포함해 실제 지출을 반영(예산초과 거래처가 정직하게 박해짐).
    const clientAgg = {}
    projects.forEach(p => {
      if (!clientAgg[p.client]) clientAgg[p.client] = { costElapsed: 0, costTotal: 0, progSum: 0, n: 0 }
      const g = clientAgg[p.client]
      g.costElapsed += p.costElapsed + p.addCost; g.costTotal += p.costTotal + p.addCost; g.progSum += p.progress; g.n += 1
    })

    const marginRows = Object.keys(contractByClient).map(c => {
      const g = clientAgg[c] || { costElapsed: 0, costTotal: 0, progSum: 0, n: 1 }
      const contract = contractByClient[c]
      const curMargin = contract - g.costElapsed
      const projMargin = contract - g.costTotal
      return {
        client: c, contract,
        costElapsed: g.costElapsed, costTotal: g.costTotal,
        remainCost: Math.max(0, g.costTotal - g.costElapsed),
        progress: g.n ? Math.round(g.progSum / g.n) : 0,
        curMargin, curPct: contract ? Math.round((curMargin / contract) * 100) : 0,
        projMargin, projPct: contract ? Math.round((projMargin / contract) * 100) : 0,
      }
    }).sort((a, b) => b.contract - a.contract)

    const contractTotal = Object.values(contractByClient).reduce((a, b) => a + b, 0)
    const contractedCostTotal = marginRows.reduce((s, r) => s + r.costTotal, 0)
    const projMarginTotal = contractTotal - contractedCostTotal
    const avgMarginPct = marginRows.length ? Math.round(marginRows.reduce((s, r) => s + r.projPct, 0) / marginRows.length) : 0

    // ── 인력 (이번 주 기준)
    const weekSessions = sessions.filter(s => s.date >= MONDAY_ISO && s.date <= weekEnd && s.done)
    const totalMin = weekSessions.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0)
    const memberCount = teamMembers.length || 1
    const avgWorkMin = Math.round(totalMin / memberCount)
    const CAPACITY = 4
    const memberUtils = teamMembers
      .map(t => ({ name: t.name, team: t.team || '기타', util: Math.round(((t.weekWorkItems || []).length / CAPACITY) * 100) }))
      .sort((a, b) => b.util - a.util)
    const utils = memberUtils.map(u => u.util)
    const avgUtil = utils.length ? Math.round(utils.reduce((a, b) => a + b, 0) / utils.length) : 0
    const overloadedMembers = memberUtils.filter(u => u.util > 100)
    const lightMembers = [...memberUtils].filter(u => u.util < 50).sort((a, b) => a.util - b.util)
    const overloaded = overloadedMembers.length

    // 팀별 리소스
    const teamMap = {}
    teamMembers.forEach(t => {
      const team = t.team || '기타'
      if (!teamMap[team]) teamMap[team] = { team, count: 0, items: 0 }
      teamMap[team].count += 1
      teamMap[team].items += (t.weekWorkItems || []).length
    })
    const teams = Object.values(teamMap).map(t => ({
      ...t, util: Math.round((t.items / (t.count * CAPACITY)) * 100),
    })).sort((a, b) => b.util - a.util)

    // ── 연차 (승인 완료 기준 회사 현황)
    const approved = leaves.filter(l => l.status === '승인 완료')
    const onLeaveToday = approved.filter(l => l.startDate <= TODAY_ISO && l.endDate >= TODAY_ISO)
    const leaveThisWeek = approved.filter(l => l.startDate <= weekEnd && l.endDate >= MONDAY_ISO)
    const pendingLeaves = leaves.filter(l => l.status === '승인 대기')

    return {
      projects, inProgress, delayed, overBudget, riskCount, avgDuration, delayRate,
      totalCostTotal, totalCostElapsed, totalMdTotal, clients, clientMax,
      marginRows, contractTotal, contractedCostTotal, projMarginTotal, avgMarginPct,
      avgWorkMin, avgUtil, overloaded, teams, memberUtils, overloadedMembers, lightMembers,
      onLeaveToday, leaveThisWeek, pendingLeaves,
    }
  }, [workItems, sessions, leaves, teamMembers, processes, gradeRates, approvalItems])

  // 프로젝트 탭 — 필터·검색·정렬 적용
  const projFiltered = m.projects.filter(p => {
    if (projFilter === '진행 중' && p.status !== '진행 중') return false
    if (projFilter === '지연' && p.status !== '지연') return false
    if (projFilter === '예산초과' && !(p.addCost > 0)) return false
    if (projQuery && !`${p.title} ${p.client}`.toLowerCase().includes(projQuery.toLowerCase())) return false
    return true
  })
  const riskScore = p => (p.status === '지연' ? 1000 : 0) + p.diffPct
  const projSorted = [...projFiltered].sort((a, b) => {
    if (projSort === 'cost') return b.actualCost - a.actualCost
    if (projSort === 'over') return b.diffPct - a.diffPct
    if (projSort === 'progress') return a.progress - b.progress
    if (projSort === 'due') return (a.end || '9999').localeCompare(b.end || '9999')
    return riskScore(b) - riskScore(a)
  })
  const projCounts = { '전체': m.projects.length, '진행 중': m.inProgress.length, '지연': m.delayed.length, '예산초과': m.overBudget.length }
  const totalActual = m.projects.reduce((s, p) => s + p.actualCost, 0)
  const totalDiffPct = m.totalCostTotal ? Math.round(((totalActual - m.totalCostTotal) / m.totalCostTotal) * 100) : 0

  // 결재 탭 — 상태·유형 필터
  const AP_TYPE_KEY = { '계약': '계약 승인', '예산': '예산 승인', '착수': '프로젝트 착수 승인', '종료': '프로젝트 종료 승인' }
  const apFiltered = ap.all.filter(it => {
    if (apStatus !== '전체' && it.status !== apStatus) return false
    if (apType !== '전체' && it.type !== AP_TYPE_KEY[apType]) return false
    return true
  })
  const apCounts = { '전체': ap.all.length, '대기': ap.pending, '승인': ap.approved, '반려': ap.rejected }

  // 연차 탭 — 팀 매핑·판단 근거·주간 현황·잔여
  const teamOf = (l) => (teamMembers.find(t => t.id === l.applicantId || t.name === l.applicantName)?.team) || ''
  const leaveDayCount = (l) => (l.type && l.type.includes('반차'))
    ? 0.5
    : Math.max(1, Math.round((toDate(l.endDate || l.startDate) - toDate(l.startDate)) / 86400000) + 1)
  const approvedLeaves = leaves.filter(l => l.status === '승인 완료')
  const leaveContext = (l) => {
    const team = teamOf(l)
    const end = l.endDate || l.startDate
    const overlaps = approvedLeaves.filter(a => team && teamOf(a) === team && a.startDate <= end && (a.endDate || a.startDate) >= l.startDate)
    return overlaps.length
      ? { warn: true, text: `⚠ 같은 기간 ${team} 연차 ${overlaps.length}명 — 마감 영향 확인 권장` }
      : { warn: false, text: '✓ 같은 기간 팀 내 연차 없음 · 진행 프로젝트 영향 적음' }
  }
  const weekLeaveDays = Array.from({ length: 7 }).map((_, i) => {
    const ds = addDays(MONDAY_ISO, i)
    const items = approvedLeaves.filter(l => l.startDate <= ds && (l.endDate || l.startDate) >= ds)
    return { ds, dow: ['월', '화', '수', '목', '금', '토', '일'][i], items }
  })
  const quotas = teamMembers
    .map(t => {
      const used = approvedLeaves.filter(l => l.applicantId === t.id || l.applicantName === t.name).reduce((s, l) => s + leaveDayCount(l), 0)
      return { name: t.name, used }
    })
    .sort((a, b) => b.used - a.used)

  return (
    <div className="flex-1 overflow-auto px-7 pt-[18px] pb-7">
      {/* 탭 */}
      <div className="flex gap-1 mb-4 border-b border-line">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-medium tracking-[-0.01em] border-b-2 -mb-px transition-colors cursor-pointer
              ${tab === t.id ? 'border-blue text-blue' : 'border-transparent text-muted hover:text-text-sub'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 수익성 — 마진(계약금−원가) 중심. 계약금=승인된 계약 결재(실데이터), 매출=연동 예정 */}
      {tab === 'profit' && (
        <div className="flex flex-col gap-4">
          {/* 안내 배너 */}
          <div className="bg-purple-soft/60 border border-purple/15 rounded-[10px] px-3.5 py-2.5 text-[11.5px] text-purple leading-relaxed">
            💡 <b>현재 마진</b>은 지금까지 쌓인 원가 기준, <b>완료 시 예상</b>은 남은 작업 원가까지 추정한 값이에요.
            진행 초기 프로젝트는 둘 차이가 크니 <b>완료 시 예상</b>으로 판단하세요. 계약금·원가는 실데이터입니다.
          </div>

          {/* 상단 요약 5카드 */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: '누적 투입 원가', tag: 'real', value: fmtMoney(m.totalCostElapsed), sub: `이번 달 ${m.projects.length}개 프로젝트`, bar: '#5d87ff' },
              { label: '계약금 합계', tag: 'real', value: fmtMoney(m.contractTotal), sub: '승인된 계약 기준', bar: '#5d87ff' },
              { label: '완료 시 예상 마진', tag: 'calc', value: `≈${fmtSigned(m.projMarginTotal)}`, sub: '남은 작업 원가까지 추정', bar: '#0ea874', valColor: m.projMarginTotal < 0 ? '#dc2626' : '#0ea874' },
              { label: '평균 마진율', tag: 'calc', value: `${m.avgMarginPct}%`, sub: `거래처 ${m.marginRows.length}곳 평균`, bar: '#0ea874', valColor: '#0ea874' },
              { label: '실수금 매출', tag: 'coming', value: '2.1억', sub: '매출 데이터 연동 시', bar: '#d4d4d8', valColor: '#a8a8be' },
            ].map(c => {
              const tg = PROFIT_TAG[c.tag]
              return (
                <div key={c.label} className="relative bg-surface border border-line rounded-[12px] p-4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: c.bar }} />
                  <div className="flex items-center gap-1.5 mb-2 whitespace-nowrap">
                    <span className="text-[10px] text-soft">{c.label}</span>
                    <span className="text-[8px] font-bold px-1 py-[1px] rounded" style={{ color: tg.color, background: tg.bg }}>{tg.label}</span>
                  </div>
                  <div className="text-[21px] font-bold font-mono leading-none" style={{ color: c.valColor || 'var(--color-text-primary)' }}>{c.value}</div>
                  <div className="text-[10px] text-soft mt-1.5">{c.sub}</div>
                </div>
              )
            })}
          </div>

          {/* 수익 공식 띠 */}
          <div className="bg-surface border border-line rounded-[12px] py-3.5 flex items-center justify-center gap-5">
            <div className="text-center">
              <div className="text-[10px] text-soft mb-1">계약금 (실데이터)</div>
              <div className="text-[16px] font-bold text-blue">{fmtMoney(m.contractTotal)}</div>
            </div>
            <span className="text-[18px] text-soft font-light">−</span>
            <div className="text-center">
              <div className="text-[10px] text-soft mb-1">투입 원가 (완료 시·실데이터)</div>
              <div className="text-[16px] font-bold text-blue">{fmtMoney(m.contractedCostTotal)}</div>
            </div>
            <span className="text-[18px] text-soft font-light">=</span>
            <div className="text-center">
              <div className="text-[10px] text-soft mb-1">완료 시 예상 마진</div>
              <div className="text-[16px] font-bold" style={{ color: m.projMarginTotal < 0 ? '#dc2626' : '#0ea874' }}>
                ≈{fmtSigned(m.projMarginTotal)} ({m.avgMarginPct}%)
              </div>
            </div>
          </div>

          {/* 2단: 거래처별 마진 + 추이 */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4">
            {/* 거래처별 마진 */}
            <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
              <div className="px-5 py-[13px] border-b border-line-soft">
                <h2 className="text-[13px] font-semibold text-text-primary">거래처별 마진<span className="text-[11px] text-soft font-normal ml-1.5">계약금 − 원가 · 클릭 시 상세</span></h2>
              </div>
              <div className="grid grid-cols-[1.1fr_0.85fr_0.95fr_1fr_1fr] gap-2 px-5 py-2 text-[10px] font-semibold text-soft">
                <div>거래처</div><div className="text-right">계약금</div><div className="text-right">현재원가</div><div className="text-right">현재 마진</div><div className="text-right">완료 시 예상</div>
              </div>
              {m.marginRows.length === 0
                ? <div className="text-[12px] text-soft text-center py-8">계약이 등록된 거래처가 없습니다</div>
                : m.marginRows.map(r => (
                  <div key={r.client} onClick={() => setSelectedClient(r)}
                    className="grid grid-cols-[1.1fr_0.85fr_0.95fr_1fr_1fr] gap-2 px-5 py-3 items-center border-t border-line-soft cursor-pointer hover:bg-surface-hover">
                    <div className="text-[12px] font-semibold text-text-sub flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{r.client}</span>
                      {r.projMargin < 0 && <span className="text-[9px] font-bold text-orange bg-orange-soft rounded px-1 py-[1px] shrink-0">초과 빈번</span>}
                    </div>
                    <div className="text-[11px] text-right text-muted font-mono">{fmtMoney(r.contract)}</div>
                    <div className="text-[11px] text-right text-muted font-mono">
                      {fmtMoney(r.costElapsed)}<span className="block text-[9px] text-soft">진행 {r.progress}%</span>
                    </div>
                    <div className="text-[11px] text-right font-mono font-bold" style={{ color: marginColor(r.curPct) }}>
                      {fmtSigned(r.curMargin)}<span className="block text-[9px] text-soft font-normal">현재 {r.curPct}%</span>
                    </div>
                    <div className="text-[11px] text-right font-mono font-bold" style={{ color: marginColor(r.projPct) }}>
                      ≈{fmtSigned(r.projMargin)}<span className="block text-[9px] text-soft font-normal">예상 {r.projPct}%</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* 원가·마진 추이 (과거치 미추적 → 예시) */}
            <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-text-primary">원가·마진 추이<span className="text-[11px] text-soft font-normal ml-1.5">월별</span></h2>
                <span className="text-[10px] font-semibold text-soft border border-line rounded px-1.5 py-[1px]">예시</span>
              </div>
              <div className="px-5 pt-3 pb-2 flex-1 flex flex-col justify-end">
                <div className="flex items-end gap-2.5 mb-2">
                  {(() => {
                    const bars = [{ m: '2월', c: 45, g: 30 }, { m: '3월', c: 50, g: 35 }, { m: '4월', c: 55, g: 40 }, { m: '5월', c: 60, g: 38 }, { m: '6월', c: 62, g: 48 }]
                    const maxTotal = Math.max(...bars.map(b => b.c + b.g))
                    const MAX_H = 180
                    return bars.map(b => {
                      const cH = Math.round((b.c / maxTotal) * MAX_H)
                      const gH = Math.round((b.g / maxTotal) * MAX_H)
                      return (
                        <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
                          <div className="text-[9px] font-semibold text-text-primary text-center leading-tight">
                            <div style={{ color: 'var(--color-blue)' }}>{b.c}%</div>
                            <div style={{ color: '#0ea874' }}>{b.g}%</div>
                          </div>
                          <div className="w-full flex flex-col">
                            <div className="w-full rounded-t-[3px]" style={{ height: `${cH}px`, background: 'var(--color-blue)' }} />
                            <div className="w-full rounded-b-[3px]" style={{ height: `${gH}px`, background: '#a5d8c0' }} />
                          </div>
                          <span className="text-[9px] text-soft">{b.m}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
                <div className="flex gap-3.5 justify-center text-[10px] text-soft">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue inline-block" />투입 원가</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#a5d8c0' }} />마진</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 — 지표 + 위험 강조 + 필터/정렬 + 예상→실제 테이블 + 단계별 슬라이드 */}
      {tab === 'project' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={m.inProgress.length} note={`전체 ${m.projects.length}`} label="진행 중 프로젝트" color="#2563eb" bar="bg-blue" />
            <StatCard val={m.delayed.length} label="지연 건수" color="#dc2626" bar="bg-red" />
            <StatCard val={`${m.delayRate}%`} label="지연률" color="#d97706" bar="bg-orange" />
            <StatCard val={`${m.avgDuration}일`} label="평균 진행 기간" color="#7c4dff" bar="bg-purple" />
          </Panel>

          {m.riskCount > 0 && (
            <div className="bg-red-soft border border-red/20 rounded-[10px] px-3.5 py-2.5 text-[12px] text-red leading-relaxed">
              🚨 <b>주의가 필요한 프로젝트 {m.riskCount}건</b> — 진행률 대비 원가 소진이 빠르거나 예산을 초과했어요. 아래 표에서 <span className="text-[10px] font-bold bg-red/10 rounded px-1 py-[1px]">위험</span> 표시를 확인하세요.
            </div>
          )}

          {/* 필터 바 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {['전체', '진행 중', '지연', '예산초과'].map(f => (
                <button key={f} onClick={() => setProjFilter(f)}
                  className={`px-3 py-1.5 text-[12px] rounded-lg border transition-colors cursor-pointer
                    ${projFilter === f ? 'bg-blue text-white border-blue font-semibold' : 'bg-surface text-muted border-line hover:text-text-sub'}`}>
                  {f} {projCounts[f]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={projQuery} onChange={e => setProjQuery(e.target.value)} placeholder="🔍 프로젝트·거래처 검색"
                className="text-[12px] border border-line rounded-lg px-3 py-1.5 w-44 bg-surface text-text-sub placeholder:text-soft outline-none focus:border-blue" />
              <select value={projSort} onChange={e => setProjSort(e.target.value)}
                className="text-[12px] border border-line rounded-lg px-2.5 py-1.5 bg-surface text-muted cursor-pointer outline-none">
                <option value="risk">정렬: 위험도 높은순</option>
                <option value="cost">투입원가 높은순</option>
                <option value="over">예상 대비 초과순</option>
                <option value="progress">진행률 낮은순</option>
                <option value="due">납기 임박순</option>
              </select>
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.9fr_1fr_0.8fr_1.3fr_0.9fr] gap-2.5 px-5 py-2.5 text-[10px] font-bold text-soft bg-surface-muted border-b border-line-soft">
              <div>프로젝트 / 거래처</div><div>진행률</div><div className="text-right">인원·공수</div><div className="text-right">예상 → 실제 원가</div><div className="text-right">상태</div>
            </div>
            {projSorted.length === 0
              ? <div className="text-[12px] text-soft text-center py-10">해당 프로젝트가 없습니다</div>
              : projSorted.map(p => {
                const isRisk = p.status === '지연' || p.diffPct > 10
                const badge = p.status === '지연'
                  ? { label: '지연', color: '#dc2626', bg: 'var(--color-red-soft)' }
                  : p.addCost > 0
                    ? { label: '예산초과', color: '#d97706', bg: 'var(--color-orange-soft)' }
                    : STATUS_BADGE[p.status] && { label: p.status, ...STATUS_BADGE[p.status] }
                const barColor = p.status === '지연' ? '#dc2626' : p.addCost > 0 ? '#d97706' : 'transparent'
                return (
                  <div key={p.id} onClick={() => setSelectedProject(p)}
                    className={`grid grid-cols-[1.9fr_1fr_0.8fr_1.3fr_0.9fr] gap-2.5 px-5 py-3.5 items-center border-b border-line-soft last:border-0 border-l-[3px] cursor-pointer hover:bg-surface-hover ${isRisk ? 'bg-red-soft/30' : ''}`}
                    style={{ borderLeftColor: barColor }}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-text-sub truncate">
                        {p.title}
                        {isRisk && <span className="text-[9px] font-bold text-red bg-red-soft rounded px-1.5 py-[1px] ml-1.5">위험</span>}
                      </div>
                      <div className="text-[10px] text-soft mt-0.5">{p.client}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ProgressBar value={p.progress} color={p.status === '지연' ? '#dc2626' : 'var(--color-blue)'} height="h-1.5" />
                      <span className="text-[10px] font-mono text-soft w-7 text-right">{p.progress}%</span>
                    </div>
                    <div className="text-[11px] text-right text-muted">{p.hc}명 · {p.days}일</div>
                    <div className="text-[11px] text-right">
                      <div><span className="text-soft text-[10px]">{fmtMoney(p.costTotal)}</span> → <span className="font-bold text-text-sub">{fmtMoney(p.actualCost)}</span></div>
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: p.addCost > 0 ? '#dc2626' : '#a8a8be' }}>
                        {p.addCost > 0 ? `+${p.diffPct}% 초과` : '0% 정상'}
                      </div>
                    </div>
                    <div className="text-right">
                      {badge && <span className="text-[10px] font-bold px-2 py-[3px] rounded whitespace-nowrap" style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>}
                      <div className="text-[10px] text-soft mt-1">{p.status === '지연' ? `+${p.od}일` : mmdd(p.end)}</div>
                    </div>
                  </div>
                )
              })}
            <div className="grid grid-cols-[1.9fr_1fr_0.8fr_1.3fr_0.9fr] gap-2.5 px-5 py-3.5 items-center bg-surface-muted border-t-2 border-line text-[11px] font-bold">
              <div>합계 {m.projects.length}개 프로젝트</div>
              <div />
              <div className="text-right">{m.totalMdTotal} 사람·일</div>
              <div className="text-right">{fmtMoney(m.totalCostTotal)} → {fmtMoney(totalActual)} ({totalDiffPct >= 0 ? '+' : ''}{totalDiffPct}%)</div>
              <div />
            </div>
          </div>
        </div>
      )}

      {/* 결재 — 전체 이력(상태·유형 필터) + 통계 + 슬라이드(상세·타임라인·승인/반려) */}
      {tab === 'approval' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={ap.pending} label="대기 중" color="#d97706" bar="bg-orange" />
            <StatCard val={ap.approved} label="승인" color="#0ea874" bar="bg-green" />
            <StatCard val={ap.rejected} label="반려" color="#dc2626" bar="bg-red" />
            <StatCard val={fmtMoney(ap.approvedAmount)} label="승인 금액 합계" color="#2563eb" bar="bg-blue" />
          </Panel>

          {/* 필터 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {['전체', '대기', '승인', '반려'].map(s => (
                <button key={s} onClick={() => setApStatus(s)}
                  className={`px-3 py-1.5 text-[12px] rounded-lg border transition-colors cursor-pointer
                    ${apStatus === s ? 'bg-blue text-white border-blue font-semibold' : 'bg-surface text-muted border-line hover:text-text-sub'}`}>
                  {s} {apCounts[s]}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {['전체', '계약', '예산', '착수', '종료'].map(t => (
                <button key={t} onClick={() => setApType(t)}
                  className={`px-2.5 py-1.5 text-[11px] rounded-lg border transition-colors cursor-pointer
                    ${apType === t ? 'bg-blue-soft text-blue border-blue-mid font-semibold' : 'bg-surface text-muted border-line hover:text-text-sub'}`}>
                  {t === '전체' ? '전체 유형' : t}
                </button>
              ))}
            </div>
          </div>

          {/* 이력 테이블 */}
          <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
            <div className="grid grid-cols-[0.6fr_2fr_1fr_0.9fr_0.8fr_0.8fr] gap-2.5 px-5 py-2.5 text-[10px] font-bold text-soft bg-surface-muted border-b border-line-soft">
              <div>유형</div><div>안건</div><div className="text-right">금액/규모</div><div>요청자</div><div>요청일</div><div className="text-right">상태</div>
            </div>
            {apFiltered.length === 0
              ? <div className="text-[12px] text-soft text-center py-10">해당 안건이 없습니다</div>
              : apFiltered.map(it => {
                const tb = AP_TYPE[it.type] || AP_TYPE['계약 승인']
                const sb = AP_STATUS[it.status] || AP_STATUS['대기']
                const amt = apAmount(it)
                return (
                  <div key={it.id} onClick={() => setSelectedApproval(it)}
                    className="grid grid-cols-[0.6fr_2fr_1fr_0.9fr_0.8fr_0.8fr] gap-2.5 px-5 py-3.5 items-center border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-hover">
                    <div><span className="text-[10px] font-bold px-2 py-[3px] rounded whitespace-nowrap" style={{ color: tb.color, background: tb.bg }}>{tb.label}</span></div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-text-sub truncate">{it.title}</div>
                      <div className="text-[10px] text-soft mt-0.5 truncate">{it.client || it.purpose || it.projectName || ''}</div>
                    </div>
                    <div className="text-[11px] text-right font-mono text-muted">{amt ? fmtMoney(amt) : '—'}</div>
                    <div className="text-[11px] text-muted">{it.requester}</div>
                    <div className="text-[11px] text-soft">{mmdd(it.requestedAt)}</div>
                    <div className="text-right"><span className="text-[10px] font-bold px-2 py-[3px] rounded whitespace-nowrap" style={{ color: sb.color, background: sb.bg }}>{it.status}</span></div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* 인력 — 톤 배너 + 지표 + 재배분 추천 + 팀별/개인별 가동률 */}
      {tab === 'people' && (
        <div className="flex flex-col gap-4">
          <div className="bg-blue-soft/60 border border-blue/15 rounded-[10px] px-3.5 py-2.5 text-[11.5px] text-blue leading-relaxed">
            ℹ️ 이 데이터는 <b>업무 배분 최적화</b>를 위한 것으로, 개인 평가용이 아니에요. 과부하·여유를 매칭해 일을 고르게 나누는 데 쓰세요.
          </div>
          <Panel>
            <StatCard val={teamMembers.length} label="전체 인원" color="#7c4dff" bar="bg-purple" />
            <StatCard val={`${m.avgUtil}%`} label="평균 가동률" color="#0ea874" bar="bg-green" />
            <StatCard val={m.overloaded} label="과부하 인원" color="#dc2626" bar="bg-red" />
            <StatCard val={fmtDuration(m.avgWorkMin)} label="1인 평균 작업시간(주)" color="#2563eb" bar="bg-blue" />
          </Panel>

          {/* 업무 재배분 추천 */}
          {m.overloadedMembers.length > 0 && m.lightMembers.length > 0 && (
            <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
              <div className="px-5 py-[13px] border-b border-line-soft flex items-center gap-2">
                <span className="text-[10px] font-bold text-white rounded px-1.5 py-[2px]" style={{ background: 'linear-gradient(135deg,#7c4dff,#a78bff)' }}>AI</span>
                <h2 className="text-[13px] font-semibold text-text-primary">업무 재배분 추천</h2>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {m.overloadedMembers.slice(0, 3).map((ov, i) => {
                  const lt = m.lightMembers[i] || m.lightMembers[0]
                  return (
                    <div key={ov.name} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-surface-muted">
                      <div className="text-[12px] text-text-sub">
                        <b className="text-red">{ov.name}</b>(과부하 {ov.util}%) → <b className="text-orange">{lt.name}</b>(여유 {lt.util}%)에게 업무 일부 이관 시 양쪽 가동률이 균형에 가까워져요.
                      </div>
                      <button title="실행 연계는 준비 중입니다"
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-blue text-white hover:opacity-90 cursor-pointer shrink-0">재배분</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 팀별 가동률 */}
            <div className="bg-surface border border-line rounded-[14px] shadow-sm">
              <div className="px-5 py-[13px] border-b border-line-soft"><h2 className="text-[13px] font-semibold text-text-primary">팀별 가동률</h2></div>
              <div className="p-3 flex flex-col gap-2.5">
                {m.teams.map(t => (
                  <div key={t.team} className="flex items-center gap-3">
                    <span className="text-[12px] text-text-sub w-20 shrink-0 truncate">{t.team}</span>
                    <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(t.util, 100)}%`, background: t.util > 100 ? '#dc2626' : t.util < 50 ? '#d97706' : '#0ea874' }} />
                    </div>
                    <span className="text-[11px] font-mono w-12 text-right" style={{ color: t.util > 100 ? '#dc2626' : '#72728a' }}>{t.util}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* 개인별 가동률 */}
            <div className="bg-surface border border-line rounded-[14px] shadow-sm">
              <div className="px-5 py-[13px] border-b border-line-soft"><h2 className="text-[13px] font-semibold text-text-primary">개인별 가동률<span className="text-[11px] text-soft font-normal ml-1.5">높은순</span></h2></div>
              <div className="p-3 flex flex-col gap-2.5 max-h-[260px] overflow-auto">
                {m.memberUtils.map(u => (
                  <div key={u.name} className="flex items-center gap-3">
                    <span className="text-[12px] text-text-sub w-16 shrink-0 truncate">{u.name}</span>
                    <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(u.util, 100)}%`, background: u.util > 100 ? '#dc2626' : u.util < 50 ? '#d97706' : '#0ea874' }} />
                    </div>
                    <span className="text-[11px] font-mono w-14 text-right" style={{ color: u.util > 100 ? '#dc2626' : u.util < 50 ? '#d97706' : '#72728a' }}>
                      {u.util}%{u.util > 100 ? ' ⚠' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 연차 */}
      {tab === 'leave' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={m.onLeaveToday.length} label="오늘 연차" color="#2563eb" bar="bg-blue" />
            <StatCard val={m.leaveThisWeek.length} label="이번 주 연차" color="#7c4dff" bar="bg-purple" />
            <StatCard val={m.pendingLeaves.length} label="승인 대기" color="#d97706" bar="bg-orange" />
            <StatCard val={`${totalLeave}일`} label="1인 연차 한도" color="#0ea874" bar="bg-green" />
          </Panel>
          <div className="grid grid-cols-[1fr_1.2fr] gap-4">
            {/* 승인 대기 (판단 근거 + 승인/반려) */}
            <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
              <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-text-primary">승인 대기</h2>
                <span className="text-[11px] font-semibold text-white bg-orange rounded-full px-2.5 py-0.5">{m.pendingLeaves.length}건</span>
              </div>
              <div className="p-3 flex flex-col gap-2.5">
                {m.pendingLeaves.length === 0
                  ? <div className="text-[12px] text-soft text-center py-8">승인 대기 중인 연차가 없습니다</div>
                  : m.pendingLeaves.map(l => {
                    const ctx = leaveContext(l)
                    const isHalf = l.type && l.type.includes('반차')
                    return (
                      <div key={l.id} className="rounded-[10px] border border-line-soft p-3">
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ background: 'var(--color-purple)' }}>{l.applicantName?.charAt(0)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-text-sub">{l.applicantName}</div>
                            <div className="text-[10px] text-soft">{teamOf(l) || (l.applicantRole === 'Manager' ? '팀장' : '직원')}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-[3px] rounded shrink-0" style={isHalf ? { color: '#d97706', background: 'var(--color-orange-soft)' } : { color: '#2563eb', background: 'var(--color-blue-soft)' }}>{l.type}</span>
                        </div>
                        <div className="text-[11px] text-muted mb-1.5">
                          {l.startDate.slice(5).replace('-', '/')}{l.endDate && l.endDate !== l.startDate ? ` ~ ${l.endDate.slice(5).replace('-', '/')}` : ''} · {leaveDayCount(l)}일{l.reason ? ` · ${l.reason}` : ''}
                        </div>
                        <div className="text-[10.5px] mb-2.5 leading-snug" style={{ color: ctx.warn ? '#dc2626' : '#0ea874' }}>{ctx.text}</div>
                        <div className="flex gap-1.5">
                          <button onClick={() => { if (window.confirm(`${l.applicantName}님의 연차를 승인하시겠습니까?`)) onApproveLeave?.(l.id) }}
                            className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-blue text-white hover:opacity-90 cursor-pointer">승인</button>
                          <button onClick={() => { const r = window.prompt('반려 사유를 입력하세요', ''); if (r !== null) onRejectLeave?.(l.id, r) }}
                            className="text-[12px] font-medium px-4 py-1.5 rounded-lg border border-line text-muted hover:text-red hover:border-red cursor-pointer">반려</button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* 이번 주 연차 현황 + 잔여 연차 */}
            <div className="flex flex-col gap-4">
              <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
                <div className="px-5 py-[13px] border-b border-line-soft">
                  <h2 className="text-[13px] font-semibold text-text-primary">이번 주 연차 현황<span className="text-[11px] text-soft font-normal ml-1.5">{MONDAY_ISO.slice(5).replace('-', '.')} ~ {addDays(MONDAY_ISO, 6).slice(5).replace('-', '.')}</span></h2>
                </div>
                <div className="p-3 grid grid-cols-7 gap-1.5">
                  {weekLeaveDays.map(d => (
                    <div key={d.ds} className={`border rounded-lg p-1.5 min-h-[68px] ${d.ds === TODAY_ISO ? 'bg-blue-soft/50 border-blue-mid' : 'border-line-soft'}`}>
                      <div className="text-[10px] text-soft text-center mb-1">{d.dow} {d.ds.slice(8)}</div>
                      {d.items.length === 0
                        ? <div className="text-[9px] text-line text-center mt-2">·</div>
                        : d.items.map(l => (
                          <div key={l.id} className="text-[9px] rounded px-1 py-[2px] mb-[3px] truncate text-center" style={l.type && l.type.includes('반차') ? { color: '#d97706', background: 'var(--color-orange-soft)' } : { color: '#2563eb', background: 'var(--color-blue-soft)' }}>
                            {l.applicantName}{l.type && l.type.includes('반차') ? ' 반차' : ''}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
                <div className="px-5 py-[13px] border-b border-line-soft">
                  <h2 className="text-[13px] font-semibold text-text-primary">잔여 연차<span className="text-[11px] text-soft font-normal ml-1.5">사용 / 한도 {totalLeave}일</span></h2>
                </div>
                <div className="p-3 flex flex-col gap-2 max-h-[200px] overflow-auto">
                  {quotas.map(q => {
                    const pct = Math.min(Math.round((q.used / totalLeave) * 100), 100)
                    const low = totalLeave - q.used <= 4
                    return (
                      <div key={q.name} className="flex items-center gap-3">
                        <span className="text-[12px] text-text-sub w-14 shrink-0 truncate">{q.name}</span>
                        <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: low ? '#d97706' : 'var(--color-purple)' }} />
                        </div>
                        <span className="text-[11px] text-muted w-12 text-right shrink-0"><b className="text-text-primary">{q.used}</b>/{totalLeave}일</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export — 4단계 흐름(준비 중). 선택 UI는 동작, 실제 내보내기/이메일/자동발송은 2차 */}
      {tab === 'export' && (() => {
        const REPORTS = [
          { key: 'profit', icon: '💰', name: '수익성 리포트', desc: '거래처별 마진, 투입 원가, 예산 초과 패턴' },
          { key: 'project', icon: '📊', name: '프로젝트 리포트', desc: '전체 프로젝트 투자 현황, 예상 대비 실제' },
          { key: 'approval', icon: '📋', name: '결재 리포트', desc: '결재 이력, 승인 금액 통계' },
          { key: 'people', icon: '👥', name: '인력 리포트', desc: '팀별·개인별 가동률, 과부하 현황' },
          { key: 'leave', icon: '🌴', name: '연차 리포트', desc: '연차 사용 현황, 잔여 연차' },
          { key: 'all', icon: '📑', name: '통합 경영 보고서', desc: '전체 리포트를 하나로 묶은 월간 보고서' },
        ]
        const FORMATS = [{ k: 'PDF', icon: '📕', sub: '보고서용', ext: 'pdf' }, { k: 'Excel', icon: '📗', sub: '데이터 분석용', ext: 'xlsx' }, { k: 'CSV', icon: '📄', sub: '원본 데이터', ext: 'csv' }]
        const PERIODS = [{ k: 'month', label: '이번 달 (2026년 6월)' }, { k: 'quarter', label: '이번 분기 (2026 Q2)' }, { k: 'custom', label: '기간 직접 선택' }]
        const selectedNames = REPORTS.filter(r => exportSel[r.key]).map(r => r.name.replace(' 리포트', ''))
        const ext = FORMATS.find(f => f.k === exportFormat)?.ext || 'pdf'
        return (
          <div className="flex flex-col gap-4">
            <div className="bg-orange-soft/70 border border-orange/20 rounded-[10px] px-3.5 py-2.5 text-[11.5px] text-orange leading-relaxed">
              🚧 <b>Export 기능은 준비 중이에요.</b> 아래는 완성 시 모습이에요 — 원하는 리포트를 골라 PDF·Excel로 내보내거나 매월 초 자동 발송을 설정할 수 있게 됩니다.
            </div>

            <div>
              <div className="text-[13px] font-bold text-text-primary mb-3">1. 내보낼 리포트 선택</div>
              <div className="grid grid-cols-3 gap-3">
                {REPORTS.map(r => {
                  const on = !!exportSel[r.key]
                  return (
                    <button key={r.key} onClick={() => setExportSel(s => ({ ...s, [r.key]: !s[r.key] }))}
                      className={`relative text-left bg-surface border-[1.5px] rounded-[12px] p-4 cursor-pointer transition-colors ${on ? 'border-purple bg-purple-soft/30' : 'border-line hover:border-purple/40'}`}>
                      <span className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-md flex items-center justify-center text-[12px] ${on ? 'bg-purple text-white' : 'border-2 border-line'}`}>{on ? '✓' : ''}</span>
                      <div className="text-[22px] mb-2">{r.icon}</div>
                      <div className="text-[13px] font-bold text-text-primary mb-1">{r.name}</div>
                      <div className="text-[11px] text-soft leading-snug">{r.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-line rounded-[12px] p-4">
                <div className="text-[12px] font-bold text-text-primary mb-3">2. 파일 형식</div>
                <div className="flex gap-2">
                  {FORMATS.map(f => (
                    <button key={f.k} onClick={() => setExportFormat(f.k)}
                      className={`flex-1 border-[1.5px] rounded-[9px] p-3 text-center cursor-pointer transition-colors ${exportFormat === f.k ? 'border-purple bg-purple-soft/30' : 'border-line hover:border-purple/40'}`}>
                      <div className="text-[20px] mb-1">{f.icon}</div>
                      <div className="text-[12px] font-bold text-text-primary">{f.k}</div>
                      <div className="text-[10px] text-soft mt-0.5">{f.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-surface border border-line rounded-[12px] p-4">
                <div className="text-[12px] font-bold text-text-primary mb-3">3. 기간</div>
                <div className="flex flex-col gap-2">
                  {PERIODS.map(p => (
                    <button key={p.k} onClick={() => setExportPeriod(p.k)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-lg text-[12px] text-left cursor-pointer transition-colors ${exportPeriod === p.k ? 'border-purple bg-purple-soft/30 text-text-primary' : 'border-line-soft text-muted hover:border-purple/40'}`}>
                      <span className={`w-4 h-4 rounded-full shrink-0 ${exportPeriod === p.k ? 'border-[5px] border-purple' : 'border-2 border-line'}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-line rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[13px] font-bold text-text-primary">4. 내보내기 미리보기</span>
                <span className="text-[10px] font-bold text-orange bg-orange-soft rounded px-1.5 py-[2px]">준비 중</span>
              </div>
              <div className="bg-surface-muted rounded-[10px] p-4 flex flex-col mb-4">
                <div className="flex justify-between py-1.5 text-[12px]"><span className="text-muted">선택한 리포트</span><span className="font-semibold">{selectedNames.length ? `${selectedNames.join(', ')} (${selectedNames.length}종)` : '없음'}</span></div>
                <div className="flex justify-between py-1.5 text-[12px]"><span className="text-muted">형식</span><span className="font-semibold">{exportFormat}</span></div>
                <div className="flex justify-between py-1.5 text-[12px]"><span className="text-muted">기간</span><span className="font-semibold">{PERIODS.find(p => p.k === exportPeriod)?.label}</span></div>
                <div className="flex justify-between py-1.5 text-[12px]"><span className="text-muted">예상 파일명</span><span className="font-semibold font-mono text-[11px]">WorkFlow_경영리포트_2026-06.{ext}</span></div>
              </div>
              <div className="flex gap-2.5">
                <button disabled title="준비 중인 기능입니다" className="flex-1 bg-blue text-white rounded-[9px] py-3 text-[13px] font-bold opacity-50 cursor-not-allowed">⬇ 다운로드</button>
                <button disabled title="준비 중인 기능입니다" className="bg-surface text-purple border-[1.5px] border-purple/40 rounded-[9px] px-5 py-3 text-[13px] font-semibold opacity-60 cursor-not-allowed">📧 이메일로 받기</button>
              </div>
            </div>

            <div className="bg-surface border border-dashed border-line rounded-[12px] p-4">
              <div className="text-[13px] font-bold text-text-primary mb-1.5 flex items-center gap-2">⏰ 자동 보고서 발송 <span className="text-[10px] font-bold text-orange bg-orange-soft rounded px-1.5 py-[2px]">예정</span></div>
              <div className="text-[11px] text-soft leading-relaxed">매월 1일 아침, 지난달 경영 리포트를 자동으로 만들어 대표 이메일로 보내드려요. 매번 직접 내보내지 않아도 월초 회의 준비가 끝나 있어요. (설정에서 수신 이메일·발송 주기·포함 리포트를 지정)</div>
            </div>
          </div>
        )
      })()}

      {/* 프로젝트 상세 슬라이드 (홈과 동일 CeoProjectDetail — 진행률·투입·단계 진행) */}
      {selectedProject && (
        <CeoSlideOver title="프로젝트 상세" onClose={() => setSelectedProject(null)}>
          <CeoProjectDetail project={selectedProject} sessions={sessions} processes={processes}
            teamMembers={teamMembers} gradeRates={gradeRates} showMoney />
        </CeoSlideOver>
      )}

      {/* 결재 안건 상세 슬라이드 (상세 + 진행 타임라인 + 승인/반려) */}
      {selectedApproval && (() => {
        const it = selectedApproval
        const wait = it.status === '대기'
        return (
          <CeoSlideOver title="결재 안건" onClose={() => setSelectedApproval(null)}
            footer={wait && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { const r = window.prompt('반려 사유를 입력하세요', ''); if (r !== null) { onRejectItem?.(it.id, r); setSelectedApproval(null) } }}
                  className="h-10 text-[13px] font-semibold rounded-lg border border-line text-muted hover:text-red hover:border-red transition-colors cursor-pointer">반려</button>
                <button onClick={() => { if (window.confirm(`'${it.title}' 안건을 승인하시겠습니까?`)) { onApproveItem?.(it.id); setSelectedApproval(null) } }}
                  className="h-10 text-[13px] font-semibold rounded-lg bg-blue text-white hover:opacity-90 transition-opacity cursor-pointer">승인</button>
              </div>
            )}>
            <CeoApprovalDetail item={it} />
            <div>
              <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.3px] mb-2.5">결재 진행</div>
              <div className="flex flex-col">
                <div className="flex gap-2.5 py-1.5">
                  <span className="w-2 h-2 rounded-full mt-1 shrink-0 bg-green" />
                  <div><div className="text-[12px] text-text-sub">요청 등록</div><div className="text-[10px] text-soft">{it.requester} · {it.requestedAt}</div></div>
                </div>
                <div className="flex gap-2.5 py-1.5">
                  <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: wait ? '#f59e0b' : it.status === '반려' ? '#dc2626' : '#0ea874' }} />
                  <div>
                    <div className="text-[12px] text-text-sub">{wait ? '대표 결재 대기' : `대표 ${it.status}`}</div>
                    <div className="text-[10px] text-soft">{wait ? '현재' : '처리 완료'}{it.rejectReason ? ` · 사유: ${it.rejectReason}` : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </CeoSlideOver>
        )
      })()}

      {/* 수익성 거래처 상세 슬라이드 */}
      {selectedClient && (() => {
        const r = selectedClient
        const clientProjects = m.projects.filter(p => p.client === r.client)
        const pat = r.projMargin < 0
          ? `⚠️ 진행률 ${r.progress}%인데 완료 시 약 ${fmtMoney(Math.abs(r.projMargin))} 적자가 예상돼요. 견적 단가가 실제 작업량보다 낮게 책정되는 패턴 — 다음 계약 시 단가 상향 또는 작업 범위 축소를 검토하세요.`
          : r.progress < 30
            ? `ℹ️ 진행률 ${r.progress}%로 초기 단계예요. 현재 마진(${r.curPct}%)보다 완료 시 예상(${r.projPct}%)으로 판단하는 게 정확해요.`
            : null
        return (
          <CeoSlideOver title={r.client} badge={<span className="text-[11px] text-soft">거래처 수익성 상세</span>} onClose={() => setSelectedClient(null)}>
            <div>
              <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.3px] mb-2.5">수익성 요약</div>
              <div className="bg-surface-muted rounded-[10px] p-3.5 flex flex-col">
                <div className="flex items-center justify-between py-1.5 text-[12px]"><span className="text-muted">계약금 합계</span><span className="font-semibold">{fmtMoney(r.contract)}</span></div>
                <div className="flex items-center justify-between py-1.5 text-[12px]"><span className="text-muted">현재까지 투입 원가</span><span className="font-semibold">− {fmtMoney(r.costElapsed)}</span></div>
                <div className="flex items-center justify-between py-1.5 text-[12px]"><span className="text-soft">현재 마진</span><span className="font-semibold" style={{ color: marginColor(r.curPct) }}>{fmtSigned(r.curMargin)} ({r.curPct}%)</span></div>
                <div className="flex items-center justify-between py-1.5 text-[12px]"><span className="text-soft">남은 작업 예상 원가</span><span className="text-soft">− {fmtMoney(r.remainCost)}</span></div>
                <div className="flex items-center justify-between pt-2.5 mt-1.5 border-t border-line text-[12px] font-bold">
                  <span>완료 시 예상 마진</span>
                  <span className="text-[16px]" style={{ color: r.projMargin < 0 ? '#dc2626' : '#0ea874' }}>≈{fmtSigned(r.projMargin)} ({r.projPct}%)</span>
                </div>
              </div>

              {pat && (
                <div className="mt-4 rounded-[9px] px-3.5 py-3 text-[11.5px] leading-relaxed"
                  style={{ background: r.projMargin < 0 ? 'var(--color-orange-soft)' : 'var(--color-blue-soft)', color: r.projMargin < 0 ? '#b45309' : '#2563eb' }}>
                  {pat}
                </div>
              )}

              <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.3px] mt-5 mb-2.5">프로젝트 이력</div>
              {clientProjects.length === 0
                ? <div className="text-[12px] text-soft">프로젝트가 없습니다</div>
                : clientProjects.map(p => {
                  const sb = STATUS_BADGE[p.status] || STATUS_BADGE['시작 전']
                  return (
                    <div key={p.id} className="py-3 border-b border-line-soft last:border-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-text-sub truncate">{p.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-[2px] rounded shrink-0" style={{ color: sb.color, background: sb.bg }}>{p.status}</span>
                      </div>
                      <div className="text-[11px] text-soft">{p.hc}명 · {p.mdTotal} 사람·일 · 투입 ≈{fmtMoney(p.costTotal)}</div>
                    </div>
                  )
                })}
            </div>
          </CeoSlideOver>
        )
      })()}
    </div>
  )
}
