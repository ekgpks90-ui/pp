// 팀원 탭 — Figma "팀원 업무 현황" 설계도 반영. 멤버 카드(아바타+업무목록+진행률바).
// 보기 전용. 긴급→업무량 순 정렬. 가동률·과부하 표시 없음.
import { Avatar, ProgressBar, Badge } from '../ui'
import { COLOR, avatarColor } from '../theme'
import { teamList, sortMembers, memberStats } from '../derive'

const mmdd = iso => { const [, m, d] = iso.split('-'); return `${+m}/${+d}` }

function MemberCard({ member, color, onOpen }) {
  const s = memberStats(member)
  const tasks = s.active.slice(0, 4)
  return (
    <button
      onClick={() => onOpen(member.id)}
      className={`w-full rounded-xl border border-line bg-surface p-4 text-left active:bg-surface-hover ${s.onLeave ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={member.name} color={color} dimmed={s.onLeave} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-text-primary">{member.name}</span>
            {s.hasUrgent && <Badge tone="danger" soft={false}>긴급</Badge>}
            {s.onLeave && <Badge tone="muted">{member.leaveType}</Badge>}
          </div>
          <div className="truncate text-xs text-muted">{member.role}</div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {tasks.length === 0 && <div className="text-xs text-green">이번 주 업무 모두 완료</div>}
        {tasks.map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: w.type === '긴급' ? COLOR.danger : COLOR.muted }} />
              <span className="truncate text-text-sub">{w.title}</span>
            </div>
            {w.end && <span className="shrink-0 text-soft">~{mmdd(w.end)}</span>}
          </div>
        ))}
        {s.active.length > 4 && <div className="text-xs text-soft">외 {s.active.length - 4}건</div>}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted">진행률</span>
          <span className="font-bold text-text-sub">{s.progress}%</span>
        </div>
        <ProgressBar pct={s.progress} />
      </div>
    </button>
  )
}

export default function TeamTab({ onOpenMember }) {
  const members = sortMembers(teamList())
  const onLeaveCount = members.filter(m => m.onLeave).length

  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
      <p className="text-xs font-medium text-muted">
        전체 {members.length}명 · 연차/반차 {onLeaveCount}명
      </p>
      {members.map((m, i) => (
        <MemberCard key={m.id} member={m} color={avatarColor(i)} onOpen={onOpenMember} />
      ))}
    </div>
  )
}
