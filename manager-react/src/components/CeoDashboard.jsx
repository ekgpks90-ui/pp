import { useMemo, useState } from 'react'
import {
  TODAY_ISO, MONDAY_ISO, addDays, toDate, isDelayed,
  projectDays, elapsedDays, overdueDays, headcount,
  dailyRateSum, fmtMoney,
} from '../data/helpers'
import { StatCard, SectionCard, ProgressBar } from './CeoUI'
import CeoSlideOver from './CeoSlideOver'
import CeoProjectDetail from './CeoProjectDetail'
import CeoApprovalDetail from './CeoApprovalDetail'
import ConfirmModal from './ConfirmModal'

// 대표(어드민) 경영 대시보드 — 홈.
// 기획서(context/ceo-experience.md 3-1) 확정 설계 반영:
//  - 목표 1) 직원들이 일 제대로 하나(가동률·농땡이)  목표 2) 프로젝트=사람×기간=얼마 투자됐나
//  - 3칸(화면 꽉 채움): ① Project Status(탭, 행 클릭 시 우측 상세 슬라이드)
//                       ② KPI(사람) + AI Brief  ③ Approval = 대표 결재함('보기' → 슬라이드 → 승인/반려 → 확인 모달)
//  - 투자=직급별 단가×투입 일수. 공수 메인 + ₩금액 보조(토글). "완료" 토글 안 만듦.

const STATUS = {
  '진행 중': { color: '#2563eb' },
  '지연': { color: '#dc2626' },
  '시작 전': { color: '#72728a' },
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

function mmdd(d) { return d ? d.slice(5).replace('-', '/') : '—' }
function ddayLabel(end) {
  if (!end) return '—'
  const n = Math.round((toDate(end) - toDate(TODAY_ISO)) / 86400000)
  return n >= 0 ? `D-${n}` : `D+${-n}`
}

// 작업세션 기반 진행률 — 프로세스 있으면 세션 찍힌 단계 수/전체 단계 수, 없으면 완료 세션/전체 세션.
function projectProgress(wi, sessions, processes) {
  const wiSessions = sessions.filter(s => s.workItemId === wi.id)
  const proc = wi.processId ? processes.find(p => p.id === wi.processId) : null
  if (proc && proc.steps.length) {
    const stepsWithSession = new Set(wiSessions.map(s => s.stepId).filter(Boolean))
    return Math.round((stepsWithSession.size / proc.steps.length) * 100)
  }
  if (!wiSessions.length) return 0
  return Math.round((wiSessions.filter(s => s.done).length / wiSessions.length) * 100)
}

function StatusBadge({ status }) {
  const c = STATUS_BADGE[status] || STATUS_BADGE['시작 전']
  return (
    <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full whitespace-nowrap shrink-0"
      style={{ color: c.color, background: c.bg }}>{status}</span>
  )
}

function approvalDetail(item) {
  switch (item.type) {
    case '계약 승인': return `${item.client} · ${fmtMoney(item.amount)} · ${item.period}`
    case '예산 승인': return `${fmtMoney(item.amount)} · ${item.purpose}`
    case '프로젝트 착수 승인': return `👤${item.plannedHeadcount}명 · ${item.plannedPeriod} · ${fmtMoney(item.plannedBudget)}`
    case '프로젝트 종료 승인': return item.resultSummary
    default: return ''
  }
}

export default function CeoDashboard({
  workItems = [], sessions = [], teamMembers = [], processes = [],
  approvalItems = [], gradeRates = {},
  onApproveItem, onRejectItem,
}) {
  const [tab, setTab] = useState('전체')
  const [showMoney, setShowMoney] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [confirm, setConfirm] = useState(null) // { kind: 'approve'|'reject', item }

  const d = useMemo(() => {
    const weekEnd = addDays(MONDAY_ISO, 6)

    const projects = workItems
      .filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
      .map(wi => {
        const status = wi.start > TODAY_ISO ? '시작 전' : (isDelayed(wi, TODAY_ISO, sessions) ? '지연' : '진행 중')
        const total = projectDays(wi)
        const elapsed = elapsedDays(wi)
        const od = overdueDays(wi)
        const hc = headcount(wi)
        const rate = dailyRateSum(wi, teamMembers, gradeRates)
        return {
          id: wi.id, title: wi.title, start: wi.start, end: wi.end, status,
          description: wi.description, participants: wi.participants || [], processId: wi.processId,
          progress: projectProgress(wi, sessions, processes),
          hc, od,
          mdTotal: hc * total, mdElapsed: hc * elapsed,
          costTotal: total * rate, costElapsed: elapsed * rate,
          baseCost: total * rate, addCost: od * rate,
          owner: (wi.participants && wi.participants[0]) || '미배정',
        }
      })
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
    const delayAddCost = delayed.reduce((s, p) => s + p.addCost, 0)

    return {
      projects, inProgress, delayed, dueThisWeek,
      avgUtil, overloaded, light, totalMdElapsed, totalCostElapsed, delayAddCost,
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

  const briefs = []
  d.light.forEach(m => briefs.push({ tone: '#dc2626', text: `${m.name}님 가동률 ${m.util}% — 업무 적음 (점검 필요)` }))
  d.overloaded.forEach(m => briefs.push({ tone: '#d97706', text: `${m.name}님 과부하 ${m.util}% — 분산 필요` }))
  if (d.delayed.length) briefs.push({ tone: '#d97706', text: `지연 ${d.delayed.length}건 · 추가비용 ≈${fmtMoney(d.delayAddCost)} 발생 중` })
  if (d.dueThisWeek.length) briefs.push({ tone: '#2563eb', text: `이번 주 납기 ${d.dueThisWeek.length}건 예정` })
  if (d.overloaded.length && d.light.length) briefs.push({ tone: '#0ea874', text: `${d.light[0].name}님 여유 → ${d.overloaded[0].name}님 업무 분산 추천` })
  if (!briefs.length) briefs.push({ tone: '#0ea874', text: '특이 리스크 없음 — 전 팀 정상 진행 중' })

  const pending = approvalItems.filter(a => a.status === '대기')

  function metaMain(p) {
    if (tab === '진행 중') return `${ddayLabel(p.end)} · 👤${p.hc}명 · 누적 ${p.mdElapsed}/예상 ${p.mdTotal} 사람·일`
    if (tab === '지연') return `+${p.od}일 초과 · 담당 ${p.owner} · 👤${p.hc}명`
    if (tab === '이번 주 납기') return `${ddayLabel(p.end)} 마감 · 담당 ${p.owner} · 👤${p.hc}명`
    return `담당 ${p.owner} · 납기 ${mmdd(p.end)} · 👤${p.hc}명 · ${p.mdTotal} 사람·일`
  }
  function metaMoney(p) {
    if (tab === '진행 중') return { text: `≈${fmtMoney(p.costElapsed)} / ${fmtMoney(p.costTotal)}`, color: '#72728a' }
    if (tab === '지연') return { text: `투입 ${fmtMoney(p.baseCost)} + 추가 ${fmtMoney(p.addCost)} = ${fmtMoney(p.baseCost + p.addCost)}`, color: '#dc2626' }
    return { text: `≈${fmtMoney(p.costTotal)}`, color: '#72728a' }
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden px-4 py-4">
      <div className="grid grid-cols-3 gap-4 h-full min-h-0">

        {/* ① Project Status */}
        <SectionCard title="프로젝트 현황" className="h-full"
          action={
            <button onClick={() => setShowMoney(s => !s)}
              className="text-[11px] font-medium px-2 py-[3px] rounded-full border border-line text-muted hover:text-blue cursor-pointer">
              금액 {showMoney ? '표시' : '숨김'}
            </button>
          }>
          <div className="flex gap-1 px-3 pt-2.5 pb-1 flex-wrap shrink-0">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors
                  ${tab === t ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:text-text-sub'}`}>
                {t} {counts[t]}
              </button>
            ))}
          </div>
          <div className="px-4 pt-1 pb-1 text-[11px] text-soft shrink-0">
            {tab === '지연'
              ? <>지연 {d.delayed.length}건{showMoney && ` · 추가비용 ≈${fmtMoney(d.delayAddCost)}`}</>
              : <>총 {list.length}건{showMoney && ` · 누적 투입 ≈${fmtMoney(d.totalCostElapsed)}`}</>}
          </div>
          <div className="flex-1 min-h-0 overflow-auto px-2.5 pb-2.5 flex flex-col">
            {list.length === 0 && (
              <div className="text-[12px] text-soft text-center py-10">해당 프로젝트가 없습니다</div>
            )}
            {list.map(p => {
              const money = metaMoney(p)
              return (
                <div key={p.id} className="px-3 py-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                  onClick={() => setSelectedProject(p)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-text-primary truncate">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={p.progress} color={STATUS[p.status].color} height="h-1.5" />
                    <span className="text-[12px] font-mono text-muted w-9 text-right">{p.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-[11px] text-soft truncate">{metaMain(p)}</span>
                    {showMoney && (
                      <span className="text-[11px] font-medium whitespace-nowrap shrink-0" style={{ color: money.color }}>{money.text}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* ② KPI + AI Brief */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <SectionCard title="핵심 지표" className="shrink-0">
            <div className="grid grid-cols-2 gap-2 p-[12px_14px_14px]">
              <StatCard val={`${d.avgUtil}%`} label="평균 가동률" color="#0ea874" bar="bg-green" />
              <StatCard val={d.overloaded.length} label="과부하 인원" color="#dc2626" bar="bg-red" />
              <StatCard val={d.light.length} label="여유 인원" color="#7c4dff" bar="bg-purple" />
              <StatCard val={`${d.totalMdElapsed}`} note={showMoney ? `≈${fmtMoney(d.totalCostElapsed)}` : '사람·일'} label="이번 달 총투입" color="#2563eb" bar="bg-blue" />
            </div>
          </SectionCard>

          <SectionCard title="AI 브리핑" className="flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-auto p-[12px_16px_16px] flex flex-col gap-2">
              {briefs.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0" style={{ background: b.tone }} />
                  <span className="text-[12.5px] text-text-sub leading-snug">{b.text}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ③ Approval = 대표 결재함 */}
        <SectionCard title="결재함" className="h-full"
          action={<span className="text-[11px] font-semibold text-purple">{pending.length}건 대기</span>}>
          <div className="flex-1 min-h-0 overflow-auto p-2.5 flex flex-col gap-1.5">
            <div className="text-[11px] text-soft px-1.5 pt-0.5 pb-1">대표 결재 안건 (계약·예산·착수·종료)</div>
            {pending.length === 0 && (
              <div className="text-[12px] text-soft text-center py-10">결재할 안건이 없습니다</div>
            )}
            {pending.map(item => {
              const badge = TYPE_BADGE[item.type] || TYPE_BADGE['계약 승인']
              return (
                <div key={item.id} className="px-3 py-2.5 rounded-lg border border-line-soft">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-1.5 py-[2px] rounded whitespace-nowrap shrink-0"
                      style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>
                    <span className="text-[13px] font-medium text-text-sub truncate">{item.title}</span>
                  </div>
                  <div className="text-[11px] text-soft mt-1 truncate">{approvalDetail(item)}</div>
                  <div className="text-[10.5px] text-soft mt-0.5">요청 {item.requester} · {mmdd(item.requestedAt)}</div>
                  <button onClick={() => setSelectedApproval(item)}
                    className="mt-2 w-full text-[12px] font-medium py-1.5 rounded-lg border border-line text-muted hover:text-blue hover:border-blue cursor-pointer transition-colors">
                    보기
                  </button>
                </div>
              )
            })}
          </div>
        </SectionCard>

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
