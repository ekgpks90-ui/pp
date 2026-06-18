import { useMemo } from 'react'
import { MONDAY_ISO, TODAY_ISO, DAY_SHORTS, addDays, sortByType, isDelayed } from '../data/helpers'

export default function WeeklyTasks({ weekOffset, searchQuery, workItems, onDateClick, onAddSession, onDeleteWorkItem, onOpenDetail, onOpenTaskDrawer }) {
  const weekStart = addDays(MONDAY_ISO, weekOffset * 7)

  const days = useMemo(() => {
    return [0,1,2,3,4,5,6].map(i => ({
      date: addDays(weekStart, i),
      label: DAY_SHORTS[i],
      weekday: i + 1,
    }))
  }, [weekStart])

  const dayData = useMemo(() => {
    const q = searchQuery?.toLowerCase().trim() || ''
    return days.map(day => {
      const items = workItems
        .filter(item => {
          if (q && !item.title.toLowerCase().includes(q)) return false
          if (item.type === '고정') {
            const rd = item.recurringDays || [1,2,3,4,5]
            return rd.includes(day.weekday) && item.start <= day.date && (item.end === null || item.end >= day.date)
          }
          return item.start <= day.date && item.end >= day.date
        })
        .sort(sortByType)
      return { ...day, items }
    })
  }, [days, workItems, searchQuery])

  return (
    <div className="bg-surface border border-line rounded-[14px] flex flex-col overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-[15px] pb-[13px] border-b border-line-soft">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-[-0.02em]">이번 주 업무</h2>
        <button
          onClick={onOpenTaskDrawer}
          className="h-7 px-3 text-[11px] font-semibold text-white bg-blue rounded-lg hover:bg-blue/90 transition-colors cursor-pointer"
        >
          + 업무 추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-[10px_14px_14px]">
        {dayData.map(day => {
          const isToday = day.date === TODAY_ISO
          const lastFixedIdx = day.items.reduce((acc, item, i) => item.type === '고정' ? i : acc, -1)

          return (
            <div key={day.date} className={`rounded-[10px] shrink-0 ${isToday ? 'bg-blue-soft border border-blue-mid' : 'bg-surface-muted border border-line-soft'}`}>
              {/* Day header */}
              <div className="flex items-baseline gap-[7px] px-[14px] pt-3 pb-2">
                <span className={`text-[13.5px] font-bold tracking-[-0.02em] ${isToday ? 'text-blue' : 'text-text-primary'}`}>{day.label}</span>
                <span
                  className={`text-[12px] cursor-pointer hover:underline ${isToday ? 'text-blue' : 'text-soft'}`}
                  onClick={() => onDateClick?.(day.date)}
                  role="button"
                  tabIndex={0}
                >
                  {day.date.slice(5).replace('-', '/')}
                </span>
              </div>

              {/* Items */}
              <div className="pb-2">
                {day.items.length === 0 ? (
                  <span className="text-[12px] text-soft pl-4 pb-1 block">업무 없음</span>
                ) : (
                  day.items.map((item, idx) => {
                    const delayed = isDelayed(item, TODAY_ISO)
                    const isLastFixed = idx === lastFixedIdx && idx < day.items.length - 1
                    const period = item.type === '고정'
                      ? `매주 ${(item.recurringDays || [1,2,3,4,5]).map(d => DAY_SHORTS[d - 1]).join('·')}`
                      : item.type === '회의'
                        ? `${item.start.slice(5).replace('-', '.')}${item.meetingTime ? ' · ' + item.meetingTime : ''}`
                        : `${item.start.slice(5).replace('-', '.')} ~ ${item.end.slice(5).replace('-', '.')}`

                    return (
                      <div
                        key={item.id}
                        onClick={() => onOpenDetail?.(item)}
                        className={`flex items-start gap-[9px] px-[14px] py-[9px] rounded-[6px] hover:bg-black/[0.04] transition-colors cursor-pointer group
                          ${isLastFixed ? `border-b ${isToday ? 'border-blue-mid' : 'border-line-soft'}` : ''}`}
                      >
                        {item.type === '고정' ? (
                          <svg className="w-[13px] h-[13px] text-[#6b7280] shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                          </svg>
                        ) : (
                          <span className={`w-3 h-3 rounded-full shrink-0 mt-[3px] ${
                            item.type === '긴급' ? 'bg-red' : item.type === '회의' ? 'bg-orange' : 'bg-soft'
                          }`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-text-primary block truncate">{item.title}</span>
                          <span className="text-[11px] text-soft flex items-center gap-1 mt-0.5">
                            <svg className="w-[11px] h-[11px]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            {period}
                            {delayed && <span className="inline-flex items-center h-[15px] px-[5px] rounded bg-red-soft text-red text-[10px] font-semibold ml-1">지연중</span>}
                          </span>
                        </div>
                        {/* Hover actions */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onAddSession?.(item.id, day.date) }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-transparent text-soft hover:text-blue hover:bg-blue-soft transition-colors cursor-pointer"
                            title="세션 추가"
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteWorkItem?.(item) }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-transparent text-soft hover:text-red hover:bg-red-soft transition-colors cursor-pointer"
                            title="업무 삭제"
                          >
                            <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
