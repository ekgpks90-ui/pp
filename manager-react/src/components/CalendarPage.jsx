import { useState, useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'
import CalendarDetailPanel from './CalendarDetailPanel'

const WORK_ITEM_TYPE_COLOR = {
  '고정': { bg: '#dbeafe', text: '#1d4ed8' },
  '긴급': { bg: '#fee2e2', text: '#dc2626' },
  '일반': { bg: '#f3f4f6', text: '#374151' },
  '회의': { bg: '#fef3c7', text: '#92400e' },
}

const STATUS_COLOR = {
  '진행 중': { bg: '#dbeafe', text: '#2563eb' },
  '완료': { bg: '#d1fae5', text: '#065f46' },
  '시작 전': { bg: '#f3f4f6', text: '#9ca3af' },
  '보류': { bg: '#fef3c7', text: '#92400e' },
}

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

function getWorkItemStatus(wi) {
  if (wi.type === '고정') return '진행 중'
  if (!wi.end) return '진행 중'
  if (wi.start > TODAY_ISO) return '시작 전'
  if (wi.end < TODAY_ISO) return '완료'
  return '진행 중'
}

function getMonthDays(year, month) {
  const total = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let d = 1; d <= total; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(year, month, d).getDay()
    days.push({ date: dateStr, day: d, dow, isToday: dateStr === TODAY_ISO, isWeekend: dow === 0 || dow === 6 })
  }
  return days
}

export default function CalendarPage({ role, workItems, sessions }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)

  // Non-recurring work items (projects)
  const projects = useMemo(() =>
    workItems.filter(wi => !wi.recurringDays && wi.start),
  [workItems])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const days = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth])

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  // Build timeline rows for the selected project
  const timelineRows = useMemo(() => {
    if (!selectedProject) return []
    const participants = selectedProject.participants || []
    const wiSessions = sessions.filter(s => s.workItemId === selectedProject.id)

    return participants.map(name => {
      const pSessions = wiSessions.filter(s => s.authorName === name)
      // Compute date range for this participant's work
      const sessionDates = pSessions.map(s => s.date).filter(Boolean).sort()
      const barStart = sessionDates.length > 0 ? sessionDates[0] : selectedProject.start
      const barEnd = sessionDates.length > 0 ? sessionDates[sessionDates.length - 1] : (selectedProject.end || selectedProject.start)
      const done = pSessions.filter(s => s.done).length
      const total = pSessions.length
      return { name, barStart, barEnd, done, total, sessions: pSessions }
    })
  }, [selectedProject, sessions])

  const monthTitle = `${calYear}년 ${calMonth + 1}월`

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left: Project sidebar */}
        <nav className="w-[200px] min-w-[160px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-y-auto">
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[0.06em] px-3.5 pt-3.5 pb-2.5 border-b border-line shrink-0">
            진행 중 프로젝트
          </div>
          {projects.length === 0 ? (
            <div className="px-3.5 py-5 text-[12px] text-muted">프로젝트 없음</div>
          ) : (
            projects.map(wi => {
              const status = getWorkItemStatus(wi)
              const sc = STATUS_COLOR[status] || STATUS_COLOR['시작 전']
              const isActive = selectedProjectId === wi.id
              return (
                <button key={wi.id}
                  onClick={() => setSelectedProjectId(wi.id)}
                  className={`flex flex-col items-start px-3.5 py-2.5 border-b border-line gap-[5px] text-left w-full transition-colors cursor-pointer
                    ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                  <span className="text-[12px] font-medium text-text-primary leading-[1.4]">{wi.title}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: sc.bg, color: sc.text }}>
                    {status}
                  </span>
                </button>
              )
            })
          )}
        </nav>

        {/* Right: Timeline area */}
        <div className="flex-1 min-w-0 flex flex-col bg-white border border-line rounded-[10px] overflow-hidden">
          {/* Topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
            <span className="text-[13px] font-semibold text-text-primary">
              {selectedProject ? selectedProject.title : '← 프로젝트 선택'}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-muted cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-[13px] font-medium text-text-primary min-w-[100px] text-center">{monthTitle}</span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-muted cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* Timeline body */}
          <div className="flex-1 min-h-0 overflow-auto">
            {!selectedProject ? (
              <div className="px-6 py-[60px] text-center text-[13px] text-muted">
                왼쪽에서 프로젝트를 선택하면 타임라인을 확인할 수 있습니다
              </div>
            ) : (
              <div>
                {/* Timeline header */}
                <div className="flex items-stretch border-b-2 border-line sticky top-0 bg-white z-[2]">
                  <div className="w-[220px] min-w-[220px] shrink-0 px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-[0.05em] border-r border-line flex items-center">
                    참여자
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                    {days.map(d => {
                      const cls = [
                        'flex-1 text-center text-[10.5px] py-1.5 px-0.5 border-r border-line min-w-[24px]',
                        d.isToday && 'text-blue font-bold',
                        d.isWeekend && 'text-[#9ca3af] bg-[#fafafa]',
                        !d.isToday && !d.isWeekend && 'text-muted',
                      ].filter(Boolean).join(' ')
                      return <div key={d.date} className={cls}>{d.day}</div>
                    })}
                  </div>
                </div>

                {/* Timeline rows */}
                <div>
                  {timelineRows.length === 0 ? (
                    <div className="px-4 py-6 text-[12px] text-muted">참여자 정보 없음</div>
                  ) : (
                    timelineRows.map((row, ri) => (
                      <div key={row.name} className={`flex items-stretch h-[44px] ${ri > 0 ? 'border-t border-line' : ''}`}>
                        {/* Info column */}
                        <div className="w-[220px] min-w-[220px] shrink-0 px-4 flex items-center gap-2 border-r border-line">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
                            style={{ background: memberColor(row.name) }}>
                            {row.name[0]}
                          </span>
                          <span className="text-[11px] text-muted truncate">{row.name}</span>
                          {row.total > 0 && (
                            <span className="text-[9px] text-soft ml-auto shrink-0">{row.done}/{row.total}</span>
                          )}
                        </div>

                        {/* Track */}
                        <div className="flex-1 relative min-h-[44px] flex">
                          {/* Grid cells */}
                          <div className="absolute inset-0 flex">
                            {days.map(d => (
                              <div key={d.date} className={`flex-1 border-r border-[#f3f4f6] min-w-[24px] ${d.isWeekend ? 'bg-[#fafafa]' : ''} ${d.isToday ? 'bg-[#eff6ff55]' : ''}`} />
                            ))}
                          </div>

                          {/* Bar */}
                          {row.barStart && (() => {
                            const startIdx = days.findIndex(d => d.date === row.barStart)
                            const endIdx = days.findIndex(d => d.date === row.barEnd)

                            const cs = startIdx >= 0 ? startIdx : (row.barStart < days[0].date ? 0 : -1)
                            const ce = endIdx >= 0 ? endIdx : (row.barEnd > days[days.length - 1].date ? days.length - 1 : -1)
                            if (cs === -1 || ce === -1 || cs > ce) return null

                            const colW = 100 / days.length
                            const left = cs * colW
                            const width = (ce - cs + 1) * colW
                            const tc = WORK_ITEM_TYPE_COLOR[selectedProject.type] || WORK_ITEM_TYPE_COLOR['일반']

                            return (
                              <div className="absolute h-6 top-1/2 -translate-y-1/2 rounded-[5px] flex items-center px-2 overflow-hidden min-w-[4px] cursor-pointer z-[1]"
                                style={{
                                  left: `calc(${left}% + 2px)`,
                                  width: `calc(${width}% - 4px)`,
                                  background: tc.bg,
                                  color: tc.text,
                                }}
                                onClick={() => setDetailItem(selectedProject)}
                                title={`${row.name} — ${selectedProject.title}`}>
                                <span className="text-[10.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                  {row.total > 0 ? `${row.done}/${row.total} 완료` : row.name}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {detailItem && (
        <CalendarDetailPanel
          item={detailItem}
          sessions={sessions.filter(s => s.workItemId === detailItem.id)}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  )
}
