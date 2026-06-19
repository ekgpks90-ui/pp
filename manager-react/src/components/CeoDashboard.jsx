import { useMemo } from 'react'
import { TODAY_ISO, MONDAY_ISO, addDays, isDelayed } from '../data/helpers'
import { StatCard, SectionCard } from './CeoUI'

// 대표(어드민) 경영 대시보드.
// 기획 규칙 결정사항 반영(vibe_ceo_ia_conflict_decisions):
//  - 업무항목 "완료" 상태를 만들지 않으므로 지표는 진행 중·지연·시작 전으로만 표현.
//  - Approval은 현재 데이터에 있는 것(업무요청 수락 대기·연차 승인 대기)만 집계.
//  - 매출 등 데이터가 없는 항목은 "예시"로 명시(사실과 혼동 방지).

const STATUS_COLOR = {
  '진행 중': { text: '#2563eb', bg: 'var(--color-blue-soft)' },
  '지연': { text: '#dc2626', bg: 'var(--color-red-soft)' },
  '시작 전': { text: '#72728a', bg: 'var(--color-surface-muted)' },
}

function projectStatus(wi, sessions) {
  if (wi.start > TODAY_ISO) return '시작 전'
  if (isDelayed(wi, TODAY_ISO, sessions)) return '지연'
  return '진행 중'
}

// 작업세션 기반 진행률 — 프로세스가 있으면 "세션이 찍힌 단계 수 / 전체 단계 수",
// 없으면 "완료 세션 / 전체 세션". (날짜 경과가 아니라 실제 작업 기록 기준)
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

// ─── 작은 표현 컴포넌트 ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR['시작 전']
  return (
    <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full whitespace-nowrap"
      style={{ color: c.text, background: c.bg }}>{status}</span>
  )
}

// ─── 메인 ──────────────────────────────────────────────────────────────────
export default function CeoDashboard({
  workItems = [], sessions = [], requests = [], leaves = [],
  teamMembers = [], processes = [], onNavigate,
}) {
  const data = useMemo(() => {
    // 프로젝트 = 회의·고정(반복) 제외한 실제 업무항목
    const projects = workItems
      .filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
      .map(wi => ({
        ...wi,
        status: projectStatus(wi, sessions),
        progress: projectProgress(wi, sessions, processes),
        owner: (wi.participants && wi.participants[0]) || '미배정',
      }))

    const inProgress = projects.filter(p => p.status === '진행 중')
    const delayed = projects.filter(p => p.status === '지연')

    const weekEnd = addDays(MONDAY_ISO, 6)
    const dueThisWeek = projects.filter(p => p.end && p.end >= MONDAY_ISO && p.end <= weekEnd)

    const pendingRequests = requests.filter(r => r.status === '수락 대기')
    const pendingLeaves = leaves.filter(l => l.status === '승인 대기')

    // 팀원 업무량(가동률) — 주간 업무항목 수를 기준 용량(4건=100%)으로 환산
    const CAPACITY = 4
    const workloads = teamMembers.map(m => {
      const total = (m.weekWorkItems || []).length
      return { name: m.name, team: m.team, total, util: Math.round((total / CAPACITY) * 100) }
    })
    const overloaded = workloads.filter(w => w.util > 100).sort((a, b) => b.util - a.util)
    const lightest = [...workloads].sort((a, b) => a.util - b.util)[0]
    const avgUtil = workloads.length
      ? Math.round(workloads.reduce((s, w) => s + w.util, 0) / workloads.length)
      : 0

    return {
      projects: [...projects].sort((a, b) => (a.end || '').localeCompare(b.end || '')),
      inProgress, delayed, dueThisWeek,
      pendingRequests, pendingLeaves,
      avgUtil, overloaded, lightest,
    }
  }, [workItems, sessions, requests, leaves, teamMembers, processes])

  // AI 브리핑(규칙 기반 자동 요약)
  const briefs = []
  if (data.overloaded.length) {
    briefs.push({ tone: 'red', text: `${data.overloaded[0].name}님 업무 과부하 (${data.overloaded[0].util}%)` })
  }
  if (data.delayed.length) {
    briefs.push({ tone: 'orange', text: `지연 프로젝트 ${data.delayed.length}건 — 일정 점검 필요` })
  }
  if (data.dueThisWeek.length) {
    briefs.push({ tone: 'blue', text: `이번 주 납기 ${data.dueThisWeek.length}건 예정` })
  }
  if (data.lightest && data.overloaded.length) {
    briefs.push({ tone: 'green', text: `${data.lightest.name}님 여유 있음 → 업무 분산 추천` })
  }
  if (!briefs.length) briefs.push({ tone: 'green', text: '특이 리스크 없음 — 전 팀 정상 진행 중' })

  const toneColor = { red: '#dc2626', orange: '#d97706', blue: '#2563eb', green: '#0ea874' }

  return (
    <div className="flex-1 overflow-auto px-7 pt-[18px] pb-7">
      {/* Weekly Company — 상단 요약 지표 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard val={data.inProgress.length} label="진행 중 프로젝트" color="#2563eb" bar="bg-blue" />
        <StatCard val={data.delayed.length} label="지연 프로젝트" color="#dc2626" bar="bg-red" />
        <StatCard val={data.dueThisWeek.length} label="이번 주 납기" color="#d97706" bar="bg-orange" />
        <StatCard val={data.pendingRequests.length + data.pendingLeaves.length} label="승인 대기" color="#7c4dff" bar="bg-purple" />
      </div>

      <div className="grid grid-cols-3 gap-4 items-start">
        {/* Project Status */}
        <SectionCard title="Project Status" className="max-h-[calc(100vh-220px)]"
          action={<button onClick={() => onNavigate?.('calendar')} className="text-[11px] text-muted hover:text-blue cursor-pointer">캘린더 →</button>}>
          <div className="overflow-auto p-2.5 flex flex-col gap-1.5">
            {data.projects.length === 0 && (
              <div className="text-[12px] text-soft text-center py-8">진행 중인 프로젝트가 없습니다</div>
            )}
            {data.projects.map(p => (
              <div key={p.id} className="px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[13px] font-medium text-text-sub truncate">{p.title}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-line-soft rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: STATUS_COLOR[p.status].text }} />
                  </div>
                  <span className="text-[11px] font-mono text-muted w-9 text-right">{p.progress}%</span>
                </div>
                <div className="text-[10.5px] text-soft mt-1.5">담당 {p.owner} · 납기 {p.end ? p.end.slice(5).replace('-', '/') : '—'}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* KPI + AI Brief */}
        <div className="flex flex-col gap-4">
          <SectionCard title="KPI">
            <div className="grid grid-cols-2 gap-2 p-[12px_14px_14px]">
              <StatCard val={data.projects.length} label="전체 진행 프로젝트" color="#2563eb" bar="bg-blue" />
              <StatCard val={`${data.avgUtil}%`} label="평균 가동률" color="#0ea874" bar="bg-green" />
              <StatCard val={`${data.delayed.length}`} label="지연 프로젝트" color="#dc2626" bar="bg-red" />
              <StatCard val="2.1억" note="예시" label="이번 달 매출" color="#7c4dff" bar="bg-purple" />
            </div>
          </SectionCard>

          <SectionCard title="AI Brief">
            <div className="p-[12px_16px_16px] flex flex-col gap-2">
              {briefs.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0" style={{ background: toneColor[b.tone] }} />
                  <span className="text-[12.5px] text-text-sub leading-snug">{b.text}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Approval */}
        <SectionCard title="Approval" className="max-h-[calc(100vh-220px)]"
          action={<span className="text-[11px] font-semibold text-purple">{data.pendingRequests.length + data.pendingLeaves.length}건</span>}>
          <div className="overflow-auto p-2.5 flex flex-col gap-3">
            {/* 업무요청 */}
            <div>
              <div className="text-[11px] font-semibold text-muted px-1.5 mb-1.5">업무요청 수락 대기 ({data.pendingRequests.length})</div>
              {data.pendingRequests.length === 0
                ? <div className="text-[11.5px] text-soft px-1.5 py-1">대기 중인 업무요청이 없습니다</div>
                : data.pendingRequests.map(r => (
                  <div key={r.id} className="px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-text-sub truncate">{r.title}</span>
                      {r.priority === '긴급' && <span className="text-[10px] font-semibold text-red bg-red-soft rounded px-1.5 py-[1px] shrink-0">긴급</span>}
                    </div>
                    <div className="text-[10.5px] text-soft mt-0.5">{r.requester} · 납기 {r.end ? r.end.slice(5).replace('-', '/') : '—'}</div>
                  </div>
                ))}
            </div>
            {/* 연차 */}
            <div>
              <button onClick={() => onNavigate?.('leave')} className="text-[11px] font-semibold text-muted hover:text-blue px-1.5 mb-1.5 cursor-pointer block">연차 승인 대기 ({data.pendingLeaves.length}) →</button>
              {data.pendingLeaves.length === 0
                ? <div className="text-[11.5px] text-soft px-1.5 py-1">대기 중인 연차가 없습니다</div>
                : data.pendingLeaves.map(l => (
                  <div key={l.id} className="px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-text-sub truncate">{l.applicantName}</span>
                      <span className="text-[10px] font-semibold text-blue bg-blue-soft rounded px-1.5 py-[1px] shrink-0">{l.type}</span>
                    </div>
                    <div className="text-[10.5px] text-soft mt-0.5">
                      {l.startDate.slice(5).replace('-', '/')}{l.endDate !== l.startDate ? `~${l.endDate.slice(5).replace('-', '/')}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
