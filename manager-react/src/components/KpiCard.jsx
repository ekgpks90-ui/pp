import { useMemo } from 'react'
import { TODAY_ISO, calcMinutes, fmtDuration } from '../data/helpers'
import { currentUser } from '../data/state'

export default function KpiCard({ workItems, sessions, viewDate = TODAY_ISO }) {
  const viewWeekday = new Date(viewDate + 'T00:00:00').getDay()

  const stats = useMemo(() => {
    const viewItems = workItems.filter(item => {
      if (item.type === '고정') {
        const rd = item.recurringDays || [1,2,3,4,5]
        return rd.includes(viewWeekday) && item.start <= viewDate && (item.end === null || item.end >= viewDate)
      }
      return item.start <= viewDate && item.end >= viewDate
    })

    const daySessions = []
    viewItems.forEach(item => {
      daySessions.push(...sessions.filter(s => s.date === viewDate && s.authorId === currentUser.id && s.workItemId === item.id))
    })

    const todayMin = daySessions.filter(s => s.done).reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0)
    const done = daySessions.filter(s => s.done).length
    const total = daySessions.length

    return [
      { val: fmtDuration(todayMin), lbl: '오늘 작업시간', color: '#2563eb', bar: 'bg-blue' },
      { val: `${done}/${total}`, lbl: '완료 세션', color: '#10b981', bar: 'bg-green' },
    ]
  }, [viewDate, viewWeekday, workItems, sessions])

  return (
    <div className="bg-surface border border-line rounded-[14px] overflow-hidden shadow-sm">
      <div className="px-5 py-[15px] pb-[13px] border-b border-line-soft">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-[-0.02em]">
          {viewDate === TODAY_ISO ? '오늘의 현황' : `${viewDate.slice(5).replace('-', '/')} 현황`}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 p-[12px_14px_14px]">
        {stats.map((s, i) => (
          <div key={i} className="relative bg-surface-muted border border-line-soft rounded-lg p-[12px_14px] overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-[3px_0_0_3px] ${s.bar}`} />
            <div className="text-[22px] font-bold font-mono tracking-[-0.03em] leading-[1.1] mb-[5px]" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[11px] text-muted tracking-[-0.01em]">{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
