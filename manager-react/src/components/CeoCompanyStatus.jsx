import { useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'
import { StatCard, SectionCard, Panel, ProgressBar } from './CeoUI'

// 대표(어드민) Company Status — 팀 KPI·리소스·업무 편중·신규 요청.
// 결정사항(vibe_ceo_ia_conflict_decisions): "완료" 상태를 만들지 않으므로
// 프로젝트 현황은 진행 중·지연·시작 전으로만 표현.

const CAPACITY = 4 // 1인 주간 적정 업무량(건) 기준

const REQ_STATUS = {
  '신규요청': { label: '미배정', color: '#dc2626', bg: 'var(--color-red-soft)' },
  '재배정': { label: '재배정', color: '#d97706', bg: 'var(--color-orange-soft)' },
  '수락대기중': { label: '수락 대기', color: '#2563eb', bg: 'var(--color-blue-soft)' },
  '배정완료': { label: '배정 완료', color: '#0ea874', bg: 'var(--color-green-soft)' },
}

function utilColor(util) {
  if (util > 100) return '#dc2626'
  if (util >= 50) return '#0ea874'
  return '#7c4dff'
}

export default function CeoCompanyStatus({
  workItems = [], sessions = [], assignmentRequests = [], teamMembers = [], onNavigate,
}) {
  const d = useMemo(() => {
    const projects = workItems.filter(wi => !wi.recurringDays && wi.start && wi.type !== '회의')
    const delayed = projects.filter(p => p.type !== '고정' && p.end && p.end < TODAY_ISO
      && sessions.some(s => s.workItemId === p.id && !s.done))
    const notStarted = projects.filter(p => p.start > TODAY_ISO)
    const inProgress = projects.length - delayed.length - notStarted.length

    // 팀원 가동률
    const members = teamMembers.map(m => {
      const items = (m.weekWorkItems || []).length
      return { name: m.name, team: m.team || '기타', role: m.role, items, util: Math.round((items / CAPACITY) * 100) }
    }).sort((a, b) => b.util - a.util)

    const overloaded = members.filter(m => m.util > 100)
    const balanced = members.filter(m => m.util >= 50 && m.util <= 100)
    const light = members.filter(m => m.util < 50)
    const lightest = members[members.length - 1]

    // 팀별 KPI
    const teamMap = {}
    members.forEach(m => {
      if (!teamMap[m.team]) teamMap[m.team] = { team: m.team, count: 0, items: 0 }
      teamMap[m.team].count += 1
      teamMap[m.team].items += m.items
    })
    const teams = Object.values(teamMap)
      .map(t => ({ ...t, util: Math.round((t.items / (t.count * CAPACITY)) * 100) }))
      .sort((a, b) => b.util - a.util)

    // 신규 요청
    const unassigned = assignmentRequests.filter(r => r.status === '신규요청' || (r.assignees || []).length === 0)
    const reassign = assignmentRequests.filter(r => r.status === '재배정')
    const waiting = assignmentRequests.filter(r => r.status === '수락대기중')
    const pendingReqs = assignmentRequests.filter(r => r.status !== '배정완료')

    return {
      projectCount: projects.length, inProgress, delayed: delayed.length, notStarted: notStarted.length,
      members, overloaded, balanced, light, lightest, teams,
      unassigned, reassign, waiting, pendingReqs,
    }
  }, [workItems, sessions, assignmentRequests, teamMembers])

  return (
    <div className="flex-1 overflow-auto px-7 pt-[18px] pb-7">
      {/* 상단 요약 */}
      <Panel>
        <StatCard val={d.inProgress} label="진행 중 프로젝트" color="#2563eb" bar="bg-blue" />
        <StatCard val={d.delayed} label="지연 프로젝트" color="#dc2626" bar="bg-red" />
        <StatCard val={d.overloaded.length} label="과부하 인원" color="#d97706" bar="bg-orange" />
        <StatCard val={d.unassigned.length} label="미배정 요청" color="#7c4dff" bar="bg-purple" />
      </Panel>

      <div className="grid grid-cols-3 gap-4 items-start mt-4">
        {/* Team KPI */}
        <SectionCard title="Team KPI">
          <div className="p-3.5 flex flex-col gap-3">
            {d.teams.length === 0 && <div className="text-[12px] text-soft text-center py-4">팀 데이터 없음</div>}
            {d.teams.map(t => (
              <div key={t.team} className="flex items-center gap-3">
                <span className="text-[12px] text-text-sub w-20 shrink-0 truncate">{t.team}</span>
                <ProgressBar value={t.util} color={utilColor(t.util)} />
                <span className="text-[11px] font-mono w-14 text-right" style={{ color: utilColor(t.util) }}>
                  {t.util}%{t.util > 100 ? ' ⚠' : ''}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 리소스 */}
        <SectionCard title="리소스 현황">
          <div className="p-[12px_14px_14px]">
            <Panel cols={3}>
              <StatCard compact val={d.overloaded.length} label="과부하" color="#dc2626" bar="bg-red" />
              <StatCard compact val={d.balanced.length} label="적정" color="#0ea874" bar="bg-green" />
              <StatCard compact val={d.light.length} label="여유" color="#7c4dff" bar="bg-purple" />
            </Panel>
          </div>
        </SectionCard>

        {/* 업무 편중 */}
        <SectionCard title="업무 편중">
          <div className="p-3 flex flex-col gap-1.5">
            {d.overloaded.length === 0 && (
              <div className="text-[12px] text-soft text-center py-4">과부하 인원이 없습니다 👍</div>
            )}
            {d.overloaded.map(m => (
              <div key={m.name} className="px-3 py-2 rounded-lg bg-red-soft/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-text-sub">{m.name}</span>
                  <span className="text-[12px] font-mono font-semibold text-red">{m.util}%</span>
                </div>
                {d.lightest && d.lightest.name !== m.name && (
                  <div className="text-[10.5px] text-muted mt-1">→ {d.lightest.name}님에게 업무 분산 추천</div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* 신규 요청 */}
      <SectionCard title="신규 요청" className="mt-4"
        action={<button onClick={() => onNavigate?.('team-status')} className="text-[11px] text-muted hover:text-blue cursor-pointer">팀원 현황 →</button>}>
        <div className="p-2.5">
          {d.pendingReqs.length === 0
            ? <div className="text-[12px] text-soft text-center py-6">처리 대기 중인 요청이 없습니다</div>
            : (
              <div className="grid grid-cols-2 gap-1.5">
                {d.pendingReqs.map(r => {
                  const st = REQ_STATUS[r.status] || REQ_STATUS['수락대기중']
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-surface-hover">
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-text-sub truncate">{r.title}</div>
                        <div className="text-[10.5px] text-soft mt-0.5">{r.team} · {r.hours}h · 납기 {r.deadline?.slice(5).replace('-', '/')}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-[3px] rounded-full whitespace-nowrap shrink-0"
                        style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
        </div>
      </SectionCard>
    </div>
  )
}
