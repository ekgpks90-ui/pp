// 팀원 상세 (F-JSZPIN / S-ZIHHSJ) — 보기 전용.
// 전체 업무 목록 + 진행률(완료/전체). 가동률·과부하·재배분 안내 없음.
import { Avatar, ProgressBar, Badge, UrgentDot, ViewOnlyNote } from '../ui'
import { COLOR } from '../theme'
import { memberStats } from '../derive'
import { teamMembers } from '../../data/state'

export default function MemberDetail({ memberId }) {
  const member = teamMembers.find(m => m.id === memberId)
  if (!member) return null
  const s = memberStats(member)
  const items = member.weekWorkItems || []

  return (
    <div className="pb-6 pt-3">
      <ViewOnlyNote />
      <div className="mx-4 mb-4 rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} dimmed={s.onLeave} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-text-primary">{member.name}</span>
              {s.onLeave && <Badge tone="muted">{member.leaveType}</Badge>}
            </div>
            <div className="text-xs text-muted">{member.role} · {member.grade}</div>
          </div>
          <span className="text-lg font-extrabold" style={{ color: COLOR.primary }}>{s.progress}%</span>
        </div>
        <div className="mt-3"><ProgressBar pct={s.progress} /></div>
        <div className="mt-1 text-xs text-muted">이번 주 {s.done}/{s.total} 완료</div>
      </div>

      <div className="px-4">
        <h3 className="mb-2 text-sm font-bold text-text-primary">이번 주 업무</h3>
        <div className="space-y-2">
          {items.map((w, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3">
              {w.type === '긴급' && !w.done && <UrgentDot />}
              <span className={`flex-1 text-sm ${w.done ? 'text-soft line-through' : 'text-text-sub'}`}>{w.title}</span>
              <Badge tone={w.done ? 'success' : w.type === '긴급' ? 'danger' : 'muted'}>
                {w.done ? '완료' : w.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
