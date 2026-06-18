import { useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'

const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16']

function memberColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

const PRI_CLS = { '긴급': 'text-red', '일반': 'text-muted' }

const REQ_GROUPS = [
  { statuses: ['신규요청'], label: '신규 요청', badgeCls: 'bg-blue/10 text-blue', showBtn: true },
  { statuses: ['재배정'], label: '재배정', badgeCls: 'bg-red/10 text-red', showBtn: true },
  { statuses: ['수락대기중'], label: '수락 대기 중', badgeCls: 'bg-[#f59e0b]/10 text-[#f59e0b]', showBtn: false },
  { statuses: ['배정완료'], label: '배정 완료', badgeCls: 'bg-green/10 text-green', showBtn: false },
]

export default function TeamStatusPage({ role, assignmentRequests, teamMembers, workItems, sessions, currentUser }) {
  const today = new Date()
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`

  const reqs = assignmentRequests || []
  const kpiNew = reqs.filter(r => r.status === '신규요청').length
  const kpiReassign = reqs.filter(r => r.status === '재배정').length
  const kpiPending = reqs.filter(r => r.status === '수락대기중').length
  const kpiDone = reqs.filter(r => r.status === '배정완료').length

  const kpis = [
    { label: '신규 요청', value: kpiNew, color: '#2563eb' },
    { label: '재배정 필요', value: kpiReassign, color: '#ef4444' },
    { label: '수락 대기', value: kpiPending, color: '#f59e0b' },
    { label: '배정 완료', value: kpiDone, color: '#10b981' },
  ]

  const memberCards = useMemo(() => {
    return teamMembers.map((member, idx) => {
      if (member.onLeave) {
        return { ...member, idx, isLeave: true }
      }
      const memberWi = workItems.filter(wi => wi.participants?.includes(member.name))
      const memberSessions = sessions.filter(s => s.authorName === member.name && s.date === TODAY_ISO)
      const done = memberSessions.filter(s => s.done).length
      const total = memberSessions.length
      const pct = total > 0 ? Math.round(done / total * 100) : 0
      return { ...member, idx, isLeave: false, workItems: memberWi, done, total, pct, todaySessions: memberSessions }
    })
  }, [teamMembers, workItems, sessions])

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Team Status</h2>
        <span className="text-[12px] text-muted">{currentUser?.team} · {dateStr} 기준</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-5">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-white border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1">
              <span className="text-[22px] font-bold font-mono tracking-[-0.03em]" style={{ color: k.color }}>{k.value}</span>
              <span className="text-[12px] text-muted">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Assignment Requests */}
        <div className="bg-white border border-line rounded-[10px] overflow-hidden">
          <div className="px-5 py-[15px] border-b border-line">
            <h3 className="text-[14px] font-semibold text-text-primary">배정 요청</h3>
          </div>
          <div className="flex flex-col">
            {REQ_GROUPS.map(group => {
              const items = reqs.filter(r => group.statuses.includes(r.status))
              if (!items.length) return null
              return items.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3 border-b border-line last:border-b-0 text-[12px]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${group.badgeCls} shrink-0`}>
                    {group.label}
                  </span>
                  <span className="flex-1 text-text-primary font-medium truncate">{r.title}</span>
                  <span className="text-muted shrink-0">{r.team}</span>
                  <span className="text-muted shrink-0">마감 {r.deadline}</span>
                  <span className={`shrink-0 font-medium ${PRI_CLS[r.priority] || 'text-muted'}`}>{r.priority}</span>
                  <span className="w-[100px] shrink-0 flex justify-end">
                    {group.showBtn ? (
                      <button className="text-[11px] text-blue font-medium px-2.5 py-1 rounded-[7px] border border-blue/30 hover:bg-blue/5 cursor-pointer">
                        담당자 배정
                      </button>
                    ) : (
                      <div className="flex -space-x-1.5">
                        {(r.assignees || []).slice(0, 3).map(name => {
                          const mIdx = teamMembers.findIndex(m => m.name === name)
                          return (
                            <span key={name} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold border-2 border-white"
                              style={{ background: memberColor(mIdx >= 0 ? mIdx : 0) }} title={name}>
                              {name[0]}
                            </span>
                          )
                        })}
                        {(r.assignees || []).length > 3 && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e5e7eb] text-[8px] font-semibold text-muted border-2 border-white">
                            +{r.assignees.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </span>
                </div>
              ))
            })}
            {reqs.length === 0 && (
              <div className="px-5 py-6 text-[12px] text-muted text-center">배정 요청이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-line" />
          <span className="text-[12px] font-semibold text-muted">팀 현황</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Member Cards */}
        <div className="grid grid-cols-3 gap-3 pb-4">
          {memberCards.map(member => (
            <div key={member.id} className={`bg-white border border-line rounded-[10px] p-4 flex flex-col gap-3 ${member.isLeave ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
                  style={{ background: memberColor(member.idx) }}>
                  {member.name[0]}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-text-primary">{member.name}</div>
                  <div className="text-[11px] text-muted">{member.role}</div>
                </div>
              </div>
              {member.isLeave ? (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] font-medium self-start">
                  {member.leaveType}
                </span>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    {(member.todaySessions || []).slice(0, 4).map(s => (
                      <div key={s.id} className={`flex items-center gap-2 text-[11px] ${s.done ? 'line-through text-muted' : 'text-text-sub'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.done ? 'bg-green' : 'bg-line'}`} />
                        <span className="truncate">{s.title}</span>
                      </div>
                    ))}
                    {(!member.todaySessions || member.todaySessions.length === 0) && (
                      <span className="text-[11px] text-muted">오늘 작업 없음</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue to-purple rounded-full" style={{ width: `${member.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted">{member.pct}%</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
