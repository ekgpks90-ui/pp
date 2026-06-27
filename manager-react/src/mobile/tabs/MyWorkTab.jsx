// 내 업무 탭 — Figma "my-tasks" 설계도 반영.
// 캘린더 스트립 + 이번 주 업무(목록) + 오늘 할일(체크리스트). 간단 업무 추가 지원.
import { useState } from 'react'
import { COLOR } from '../theme'
import { getProjects, sortProjects, todaySessions, TODAY_ISO } from '../derive'
import { addDays } from '../../data/helpers'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const mmdd = iso => { const [, m, d] = iso.split('-'); return `${+m}/${+d}` }

function rollingDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TODAY_ISO, i)
    const label = i === 0 ? '오늘' : i === 1 ? '내일' : DOW[new Date(date).getDay()]
    return { date, label, day: +date.split('-')[2], isToday: i === 0 }
  })
}

function statusTint(status) {
  if (status === '지연') return { tint: COLOR.dangerSoft, color: COLOR.danger }
  if (status === '진행 중') return { tint: COLOR.primarySoft, color: COLOR.primary }
  return { tint: COLOR.mutedSoft, color: COLOR.muted }
}

function AddSheet({ onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const valid = title.trim().length > 0
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full rounded-t-2xl bg-surface p-5 pb-7" onClick={e => e.stopPropagation()}>
        <h3 className="mb-3 text-base font-bold text-text-primary">할 일 추가</h3>
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="할 일을 입력하세요"
          className="w-full rounded-xl border border-line bg-surface-muted p-3 text-sm outline-none focus:border-blue" />
        <button disabled={!valid} onClick={() => valid && onAdd(title.trim())}
          className="mt-4 h-12 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: COLOR.primary }}>
          추가
        </button>
      </div>
    </div>
  )
}

export default function MyWorkTab({ workItems, sessions, onUpdateSession, onAddSession }) {
  const [adding, setAdding] = useState(false)
  const days = rollingDays()
  const projects = sortProjects(getProjects(workItems, sessions)).slice(0, 5)
  const todos = todaySessions(sessions)
  const dueOf = s => { const wi = workItems.find(w => w.id === s.workItemId); return wi?.end }

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
      {/* 캘린더 스트립 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map(d => (
          <div
            key={d.date}
            className={`flex w-[60px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2.5 ${d.isToday ? '' : 'border border-line bg-surface-muted'}`}
            style={d.isToday ? { background: COLOR.primary } : undefined}
          >
            <span className={`text-xs font-semibold ${d.isToday ? 'text-white' : 'text-text-primary'}`}>{d.label}</span>
            <span className="text-[11px] font-semibold" style={{ color: d.isToday ? 'rgba(255,255,255,0.8)' : COLOR.muted }}>{d.day}</span>
          </div>
        ))}
      </div>

      {/* 이번 주 업무 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">이번 주 업무</h2>
        <div className="flex flex-col gap-2">
          {projects.length === 0 && <div className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">이번 주 업무가 없어요.</div>}
          {projects.map(p => {
            const t = statusTint(p.status)
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: t.tint }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">{p.title}</span>
                </div>
                {p.end && <span className="shrink-0 text-[11px] font-medium text-muted">{p.start ? `${mmdd(p.start)} ~ ${mmdd(p.end)}` : `~ ${mmdd(p.end)}`}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 오늘 할일 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">오늘 할일</h2>
          <button onClick={() => setAdding(true)} className="text-xs font-semibold text-blue">+ 추가</button>
        </div>
        <div className="flex flex-col gap-2">
          {todos.length === 0 && <div className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">오늘 할 일이 없어요.</div>}
          {todos.map(s => {
            const due = dueOf(s)
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <button
                  onClick={() => onUpdateSession(s.id, { done: !s.done })}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] text-white"
                  style={s.done ? { background: COLOR.success, borderColor: COLOR.success } : { borderColor: '#c7d0dd' }}
                >
                  {s.done ? '✓' : ''}
                </button>
                <span className={`min-w-0 flex-1 truncate text-sm ${s.done ? 'text-soft line-through' : 'font-medium text-text-primary'}`}>{s.title}</span>
                {due && <span className="shrink-0 text-[11px] text-soft">~{mmdd(due)}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {adding && <AddSheet onClose={() => setAdding(false)} onAdd={title => { onAddSession(title); setAdding(false) }} />}
    </div>
  )
}
