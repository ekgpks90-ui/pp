import { useMemo, useState } from 'react'
import { TODAY_ISO, MONDAY_ISO, addDays, calcMinutes, fmtDuration, toDate, fmtMoney } from '../data/helpers'
import { StatCard, Panel } from './CeoUI'

// 결재 안건 유형·상태 표기 + 대표 금액 산출 (홈 결재함과 동일 데이터, 여기선 전체 이력 조회)
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

// 대표(어드민) Report Center.
// 결정사항(vibe_ceo_ia_conflict_decisions): 업무항목 "완료" 상태를 만들지 않으므로
// 프로젝트 지표는 진행/지연·평균 진행기간으로 표현. 매출 등 데이터 없는 항목은 "예시"로 명시.
// 연차 현황은 My Page가 아니라 회사 전체 리포트이므로 잔여/사용 표시 허용.

const TABS = [
  { id: 'sales', label: '매출' },
  { id: 'project', label: '프로젝트' },
  { id: 'approval', label: '결재' },
  { id: 'people', label: '인력' },
  { id: 'leave', label: '연차' },
  { id: 'export', label: 'Export' },
]

export default function CeoReportCenter({
  workItems = [], sessions = [], leaves = [], teamMembers = [], totalLeave = 15, approvalItems = [],
}) {
  const [tab, setTab] = useState('project')

  const ap = useMemo(() => ({
    all: approvalItems,
    pending: approvalItems.filter(a => a.status === '대기').length,
    approved: approvalItems.filter(a => a.status === '승인').length,
    rejected: approvalItems.filter(a => a.status === '반려').length,
    approvedAmount: approvalItems.filter(a => a.status === '승인').reduce((s, a) => s + apAmount(a), 0),
  }), [approvalItems])

  const m = useMemo(() => {
    const weekEnd = addDays(MONDAY_ISO, 6)

    // ── 프로젝트
    const projects = workItems.filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
    const delayed = projects.filter(p => p.type !== '고정' && p.end && p.end < TODAY_ISO
      && sessions.some(s => s.workItemId === p.id && !s.done))
    const durations = projects
      .filter(p => p.start && p.end)
      .map(p => Math.round((toDate(p.end) - toDate(p.start)) / 86400000) + 1)
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const delayRate = projects.length ? Math.round((delayed.length / projects.length) * 100) : 0

    // ── 인력 (이번 주 기준)
    const weekSessions = sessions.filter(s => s.date >= MONDAY_ISO && s.date <= weekEnd && s.done)
    const totalMin = weekSessions.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0)
    const memberCount = teamMembers.length || 1
    const avgWorkMin = Math.round(totalMin / memberCount)
    const CAPACITY = 4
    const utils = teamMembers.map(t => Math.round(((t.weekWorkItems || []).length / CAPACITY) * 100))
    const avgUtil = utils.length ? Math.round(utils.reduce((a, b) => a + b, 0) / utils.length) : 0

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
      projects, delayed, avgDuration, delayRate, inProgress: projects.length - delayed.length,
      avgWorkMin, avgUtil, teams,
      onLeaveToday, leaveThisWeek, pendingLeaves, approvedCount: approved.length,
    }
  }, [workItems, sessions, leaves, teamMembers])

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

      {/* 매출 */}
      {tab === 'sales' && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-soft">매출 데이터는 아직 연동 전이라 전부 예시 값입니다.</p>
          <Panel>
            <StatCard val="2.1억" note="예시" label="이번 달 매출" color="#2563eb" bar="bg-blue" />
            <StatCard val="2.6억" note="예시" label="예상 매출" color="#7c4dff" bar="bg-purple" />
            <StatCard val="34%" note="예시" label="프로젝트 평균 수익률" color="#0ea874" bar="bg-green" />
            <StatCard val="3건" note="예시" label="이번 달 신규 계약" color="#d97706" bar="bg-orange" />
          </Panel>
        </div>
      )}

      {/* 프로젝트 */}
      {tab === 'project' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={m.inProgress} label="진행 중 프로젝트" color="#2563eb" bar="bg-blue" />
            <StatCard val={m.delayed.length} label="지연 프로젝트" color="#dc2626" bar="bg-red" />
            <StatCard val={`${m.delayRate}%`} label="지연률" color="#d97706" bar="bg-orange" />
            <StatCard val={`${m.avgDuration}일`} label="평균 진행 기간" color="#7c4dff" bar="bg-purple" />
          </Panel>
          <div className="bg-surface border border-line rounded-[14px] shadow-sm">
            <div className="px-5 py-[13px] border-b border-line-soft">
              <h2 className="text-[13px] font-semibold text-text-primary">지연 프로젝트 목록</h2>
            </div>
            <div className="p-2.5 flex flex-col gap-1">
              {m.delayed.length === 0
                ? <div className="text-[12px] text-soft text-center py-6">지연 중인 프로젝트가 없습니다</div>
                : m.delayed.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover">
                    <span className="text-[12.5px] text-text-sub truncate">{p.title}</span>
                    <span className="text-[11px] font-mono text-red shrink-0">납기 {p.end?.slice(5).replace('-', '/')}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 결재 — 홈 결재함과 같은 데이터를 전체 이력으로 조회 (대기·승인·반려) */}
      {tab === 'approval' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={ap.pending} label="결재 대기" color="#d97706" bar="bg-orange" />
            <StatCard val={ap.approved} label="승인 완료" color="#0ea874" bar="bg-green" />
            <StatCard val={ap.rejected} label="반려" color="#dc2626" bar="bg-red" />
            <StatCard val={fmtMoney(ap.approvedAmount)} label="승인 금액 합계" color="#2563eb" bar="bg-blue" />
          </Panel>
          <div className="bg-surface border border-line rounded-[14px] shadow-sm">
            <div className="px-5 py-[13px] border-b border-line-soft">
              <h2 className="text-[13px] font-semibold text-text-primary">결재 안건 전체</h2>
            </div>
            <div className="p-2.5 flex flex-col gap-1">
              {ap.all.length === 0
                ? <div className="text-[12px] text-soft text-center py-6">결재 안건이 없습니다</div>
                : ap.all.map(it => {
                  const tb = AP_TYPE[it.type] || AP_TYPE['계약 승인']
                  const sb = AP_STATUS[it.status] || AP_STATUS['대기']
                  return (
                    <div key={it.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-semibold px-1.5 py-[2px] rounded whitespace-nowrap shrink-0"
                          style={{ color: tb.color, background: tb.bg }}>{tb.label}</span>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-medium text-text-sub truncate">{it.title}</div>
                          <div className="text-[10.5px] text-soft mt-0.5">요청 {it.requester} · {it.requestedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-muted">{fmtMoney(apAmount(it))}</span>
                        <span className="text-[10px] font-semibold px-2 py-[3px] rounded-full whitespace-nowrap"
                          style={{ color: sb.color, background: sb.bg }}>{it.status}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* 인력 */}
      {tab === 'people' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={fmtDuration(m.avgWorkMin)} label="1인 평균 작업시간(주)" color="#2563eb" bar="bg-blue" />
            <StatCard val={`${m.avgUtil}%`} label="평균 가동률" color="#0ea874" bar="bg-green" />
            <StatCard val={teamMembers.length} label="전체 인원" color="#7c4dff" bar="bg-purple" />
            <StatCard val="12%" note="예시" label="야근 비율" color="#d97706" bar="bg-orange" />
          </Panel>
          <div className="bg-surface border border-line rounded-[14px] shadow-sm">
            <div className="px-5 py-[13px] border-b border-line-soft">
              <h2 className="text-[13px] font-semibold text-text-primary">팀별 가동률</h2>
            </div>
            <div className="p-3 flex flex-col gap-2.5">
              {m.teams.map(t => (
                <div key={t.team} className="flex items-center gap-3">
                  <span className="text-[12px] text-text-sub w-20 shrink-0">{t.team}</span>
                  <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(t.util, 100)}%`, background: t.util > 100 ? '#dc2626' : '#0ea874' }} />
                  </div>
                  <span className="text-[11px] font-mono w-14 text-right" style={{ color: t.util > 100 ? '#dc2626' : '#72728a' }}>
                    {t.util}%{t.util > 100 ? ' ⚠' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 연차 */}
      {tab === 'leave' && (
        <Panel>
          <StatCard val={m.onLeaveToday.length} label="오늘 연차" color="#2563eb" bar="bg-blue" />
          <StatCard val={m.leaveThisWeek.length} label="이번 주 연차" color="#7c4dff" bar="bg-purple" />
          <StatCard val={m.pendingLeaves.length} label="승인 대기" color="#d97706" bar="bg-orange" />
          <StatCard val={`${totalLeave}일`} label="1인 연차 한도" color="#0ea874" bar="bg-green" />
        </Panel>
      )}

      {/* Export */}
      {tab === 'export' && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-soft">리포트 다운로드 — 내보내기 기능은 준비 중입니다.</p>
          <div className="flex flex-wrap gap-2.5">
            {['Weekly Report', 'Monthly Report', 'PDF', 'Excel', 'CSV'].map(fmt => (
              <button key={fmt} title="준비 중인 기능입니다" disabled
                className="px-4 py-2.5 text-[12.5px] font-medium text-muted bg-surface border border-line rounded-lg opacity-60 cursor-not-allowed">
                {fmt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
