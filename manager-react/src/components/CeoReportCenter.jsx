import { useMemo, useState } from 'react'
import {
  TODAY_ISO, MONDAY_ISO, addDays, calcMinutes, fmtDuration, fmtMoney,
  isDelayed, projectDays, elapsedDays, overdueDays, headcount, dailyRateSum,
  projectProgress, clientOf,
} from '../data/helpers'
import { StatCard, Panel, ProgressBar } from './CeoUI'

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
  onApproveLeave, onRejectLeave,
}) {
  const [tab, setTab] = useState('profit')

  const ap = useMemo(() => ({
    all: approvalItems,
    pending: approvalItems.filter(a => a.status === '대기').length,
    approved: approvalItems.filter(a => a.status === '승인').length,
    rejected: approvalItems.filter(a => a.status === '반려').length,
    approvedAmount: approvalItems.filter(a => a.status === '승인').reduce((s, a) => s + apAmount(a), 0),
  }), [approvalItems])

  const m = useMemo(() => {
    const weekEnd = addDays(MONDAY_ISO, 6)

    // ── 프로젝트 (홈 Project Status와 동일 계산식 — 투입 원가=직급별 단가×일수)
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
          id: wi.id, title: wi.title, end: wi.end, status, hc,
          client: clientOf(wi),
          progress: projectProgress(wi, sessions, processes),
          mdTotal: hc * total, mdElapsed: hc * elapsed,
          costTotal: total * rate, costElapsed: elapsed * rate,
          addCost: od * rate,
        }
      })
      .sort((a, b) => b.costTotal - a.costTotal)

    const inProgress = projects.filter(p => p.status === '진행 중')
    const delayed = projects.filter(p => p.status === '지연')
    const durations = projects.map(p => projectDays(workItems.find(w => w.id === p.id)))
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
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

    // ── 인력 (이번 주 기준)
    const weekSessions = sessions.filter(s => s.date >= MONDAY_ISO && s.date <= weekEnd && s.done)
    const totalMin = weekSessions.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0)
    const memberCount = teamMembers.length || 1
    const avgWorkMin = Math.round(totalMin / memberCount)
    const CAPACITY = 4
    const utils = teamMembers.map(t => Math.round(((t.weekWorkItems || []).length / CAPACITY) * 100))
    const avgUtil = utils.length ? Math.round(utils.reduce((a, b) => a + b, 0) / utils.length) : 0
    const overloaded = utils.filter(u => u > 100).length

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
      projects, inProgress, delayed, avgDuration, delayRate,
      totalCostTotal, totalCostElapsed, totalMdTotal, clients, clientMax,
      avgWorkMin, avgUtil, overloaded, teams,
      onLeaveToday, leaveThisWeek, pendingLeaves,
    }
  }, [workItems, sessions, leaves, teamMembers, processes, gradeRates])

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

      {/* 수익성 — 투입 원가(실데이터) 메인 + 거래처별 원가 + 매출(예시) */}
      {tab === 'profit' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={fmtMoney(m.totalCostElapsed)} label="누적 투입 원가" color="#2563eb" bar="bg-blue" />
            <StatCard val={fmtMoney(m.totalCostTotal)} label="예상 총 투입 원가" color="#7c4dff" bar="bg-purple" />
            <StatCard val="2.1억" note="예시" label="이번 달 매출" color="#0ea874" bar="bg-green" />
            <StatCard val="34%" note="예시" label="평균 수익률" color="#d97706" bar="bg-orange" />
          </Panel>
          <p className="text-[12px] text-soft -mt-1">
            투입 원가는 직급별 단가 × 투입 일수로 계산한 <b className="text-text-sub">실데이터</b>입니다.
            매출·수익률은 데이터 연동 전이라 예시이며, 연동되면 <b className="text-text-sub">매출 − 원가 = 수익</b>까지 완성됩니다.
          </p>
          <div className="bg-surface border border-line rounded-[14px] shadow-sm">
            <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-text-primary">거래처별 투입 원가</h2>
              <span className="text-[11px] text-soft">전체 ≈{fmtMoney(m.totalCostTotal)}</span>
            </div>
            <div className="p-3 flex flex-col gap-2.5">
              {m.clients.length === 0
                ? <div className="text-[12px] text-soft text-center py-6">집계할 프로젝트가 없습니다</div>
                : m.clients.map(c => (
                  <div key={c.client} className="flex items-center gap-3">
                    <span className="text-[12px] text-text-sub w-24 shrink-0 truncate">{c.client}</span>
                    <div className="flex-1 h-2 bg-line-soft rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue" style={{ width: `${m.clientMax ? Math.round((c.cost / m.clientMax) * 100) : 0}%` }} />
                    </div>
                    <span className="text-[11px] text-soft w-10 text-right shrink-0">{c.count}건</span>
                    <span className="text-[11px] font-mono w-16 text-right shrink-0 text-muted">≈{fmtMoney(c.cost)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 — 지표 + 전체 프로젝트 투자 상세표 */}
      {tab === 'project' && (
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={m.inProgress.length} label="진행 중 프로젝트" color="#2563eb" bar="bg-blue" />
            <StatCard val={m.delayed.length} label="지연 프로젝트" color="#dc2626" bar="bg-red" />
            <StatCard val={`${m.delayRate}%`} label="지연률" color="#d97706" bar="bg-orange" />
            <StatCard val={`${m.avgDuration}일`} label="평균 진행 기간" color="#7c4dff" bar="bg-purple" />
          </Panel>
          <div className="bg-surface border border-line rounded-[14px] shadow-sm overflow-hidden">
            <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-text-primary">전체 프로젝트 투자 상세</h2>
              <span className="text-[11px] text-soft">{m.projects.length}건 · 예상 총 ≈{fmtMoney(m.totalCostTotal)}</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-soft text-[11px] border-b border-line-soft">
                  <th className="text-left font-medium px-5 py-2">프로젝트</th>
                  <th className="text-center font-medium px-2 py-2 w-20">상태</th>
                  <th className="text-left font-medium px-3 py-2 w-28">진행률</th>
                  <th className="text-right font-medium px-2 py-2 w-14">인원</th>
                  <th className="text-right font-medium px-2 py-2 w-20">공수</th>
                  <th className="text-right font-medium px-3 py-2 w-24">투입 원가</th>
                  <th className="text-right font-medium px-5 py-2 w-16">납기</th>
                </tr>
              </thead>
              <tbody>
                {m.projects.map(p => {
                  const sb = STATUS_BADGE[p.status] || STATUS_BADGE['시작 전']
                  return (
                    <tr key={p.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                      <td className="px-5 py-2.5 text-text-sub truncate max-w-0">{p.title}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span className="text-[10px] font-semibold px-1.5 py-[2px] rounded-full whitespace-nowrap"
                          style={{ color: sb.color, background: sb.bg }}>{p.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <ProgressBar value={p.progress} color={sb.color} height="h-1.5" />
                          <span className="font-mono text-soft w-8 text-right shrink-0">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right text-muted">{p.hc}명</td>
                      <td className="px-2 py-2.5 text-right text-muted font-mono">{p.mdTotal}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-text-sub">≈{fmtMoney(p.costTotal)}</td>
                      <td className="px-5 py-2.5 text-right font-mono" style={{ color: p.status === '지연' ? '#dc2626' : '#72728a' }}>{mmdd(p.end)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-line font-semibold text-text-primary">
                  <td className="px-5 py-2.5" colSpan={4}>합계</td>
                  <td className="px-2 py-2.5 text-right font-mono">{m.totalMdTotal}</td>
                  <td className="px-3 py-2.5 text-right font-mono">≈{fmtMoney(m.totalCostTotal)}</td>
                  <td className="px-5 py-2.5" />
                </tr>
              </tfoot>
            </table>
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
            <StatCard val={m.overloaded} label="과부하 인원" color="#dc2626" bar="bg-red" />
            <StatCard val={teamMembers.length} label="전체 인원" color="#7c4dff" bar="bg-purple" />
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
        <div className="flex flex-col gap-4">
          <Panel>
            <StatCard val={m.onLeaveToday.length} label="오늘 연차" color="#2563eb" bar="bg-blue" />
            <StatCard val={m.leaveThisWeek.length} label="이번 주 연차" color="#7c4dff" bar="bg-purple" />
            <StatCard val={m.pendingLeaves.length} label="승인 대기" color="#d97706" bar="bg-orange" />
            <StatCard val={`${totalLeave}일`} label="1인 연차 한도" color="#0ea874" bar="bg-green" />
          </Panel>
          {/* 연차 승인 대기 — 대표가 여기서 승인/반려 (홈 연차 메뉴 제거에 따른 일원화) */}
          <div className="bg-surface border border-line rounded-[14px] shadow-sm">
            <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-text-primary">연차 승인 대기</h2>
              <span className="text-[11px] font-semibold text-orange">{m.pendingLeaves.length}건</span>
            </div>
            <div className="p-2.5 flex flex-col gap-1.5">
              {m.pendingLeaves.length === 0
                ? <div className="text-[12px] text-soft text-center py-6">승인 대기 중인 연차가 없습니다</div>
                : m.pendingLeaves.map(l => (
                  <div key={l.id} className="px-3 py-2.5 rounded-lg border border-line-soft">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-text-sub">
                        {l.applicantName}
                        <span className="text-[11px] text-muted ml-1.5">{l.applicantRole === 'Manager' ? '팀장' : '직원'}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-blue bg-blue-soft rounded px-1.5 py-[1px] shrink-0">{l.type}</span>
                    </div>
                    <div className="text-[11px] text-soft mt-1">
                      {l.startDate.slice(5).replace('-', '/')}{l.endDate !== l.startDate ? `~${l.endDate.slice(5).replace('-', '/')}` : ''}
                      {l.reason ? ` · ${l.reason}` : ''}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => { if (window.confirm(`${l.applicantName}님의 연차를 승인하시겠습니까?`)) onApproveLeave?.(l.id) }}
                        className="flex-1 text-[12px] font-medium py-1.5 rounded-lg bg-blue text-white hover:opacity-90 cursor-pointer">승인</button>
                      <button onClick={() => { const r = window.prompt('반려 사유를 입력하세요', ''); if (r !== null) onRejectLeave?.(l.id, r) }}
                        className="flex-1 text-[12px] font-medium py-1.5 rounded-lg border border-line text-muted hover:text-red cursor-pointer">반려</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
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
