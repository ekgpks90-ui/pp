// 빠른 메뉴 진입 — 회의록 / 캘린더 / 프로세스. 모두 보기 전용 (F-TNAZWP / S-GLZDMI).
// 녹음·생성·편집 버튼을 일절 노출하지 않는다.
import { useState } from 'react'
import { Card, Badge, ViewOnlyNote } from '../ui'
import { COLOR } from '../theme'
import { meetings, processes, currentUser } from '../../data/state'
import { getProjects } from '../derive'

// ─── 회의록 ───────────────────────────────────────────────────────────────────
export function MeetingView() {
  const [selected, setSelected] = useState(null)
  const teamMeetings = meetings.filter(m => m.team === currentUser.team)

  if (selected) {
    const m = teamMeetings.find(x => x.id === selected)
    return (
      <div className="pb-6 pt-3">
        <ViewOnlyNote />
        <div className="px-4">
          <button onClick={() => setSelected(null)} className="mb-3 text-xs font-semibold text-blue">‹ 회의록 목록</button>
          <h2 className="text-base font-bold text-text-primary">{m.title}</h2>
          <div className="mb-3 mt-1 text-xs text-muted">{m.type} · {m.date} · 참여 {m.attendees}명</div>
          {m.summary && <p className="mb-4 rounded-xl bg-surface-muted p-3 text-sm text-text-sub">{m.summary}</p>}
          {m.aiPoints?.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-bold text-text-primary">AI 요약</h3>
              <ul className="space-y-1">
                {m.aiPoints.map((p, i) => <li key={i} className="text-xs text-text-sub">• {p}</li>)}
              </ul>
            </div>
          )}
          {m.actionItems?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-text-primary">액션 아이템</h3>
              <div className="space-y-1">
                {m.actionItems.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                    <span className="text-text-sub">{a.text}</span>
                    <span className="text-soft">{a.assignee}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6 pt-3">
      <ViewOnlyNote />
      <div className="space-y-2 px-4">
        {teamMeetings.map(m => (
          <Card key={m.id} onClick={() => setSelected(m.id)}>
            <div className="mb-1 flex items-center gap-2">
              <Badge tone="primary">{m.type}</Badge>
              <span className="text-xs text-soft">{m.date}</span>
            </div>
            <div className="text-sm font-bold text-text-primary">{m.title}</div>
            {m.summary && <p className="mt-1 line-clamp-1 text-xs text-muted">{m.summary}</p>}
            <div className="mt-2 text-xs text-soft">참여 {m.attendees}명 · 액션 {m.actionItems?.length || 0}건</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── 캘린더 (보기 전용: 납기 목록) ──────────────────────────────────────────────
export function CalendarView({ workItems, sessions }) {
  const projects = getProjects(workItems, sessions)
    .filter(p => p.end)
    .sort((a, b) => a.end.localeCompare(b.end))
  return (
    <div className="pb-6 pt-3">
      <ViewOnlyNote />
      <div className="px-4">
        <h3 className="mb-2 text-sm font-bold text-text-primary">프로젝트 납기 일정</h3>
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
              <span className="truncate text-sm text-text-sub">{p.title}</span>
              <span className="text-xs font-semibold" style={{ color: p.status === '지연' ? COLOR.danger : COLOR.muted }}>
                {p.end.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 프로세스 (보기 전용: 템플릿 단계) ──────────────────────────────────────────
export function ProcessView() {
  return (
    <div className="pb-6 pt-3">
      <ViewOnlyNote />
      <div className="space-y-3 px-4">
        {processes.map(proc => (
          <div key={proc.id} className="rounded-[14px] border border-line bg-surface p-4">
            <h3 className="mb-2 text-sm font-bold text-text-primary">{proc.category}</h3>
            <div className="flex flex-wrap gap-1.5">
              {proc.steps.map((s, i) => (
                <span key={s.id} className="rounded-lg bg-surface-muted px-2 py-1 text-xs text-text-sub">
                  {i + 1}. {s.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
