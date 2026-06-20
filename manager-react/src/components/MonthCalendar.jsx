import { getCalendarWeeks, layoutWeekEvents, getProjectTeam, getTeamColor } from '../data/helpers'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const LANE_H = 22 // 이벤트 막대 한 층 높이(px)
const DATE_ROW_H = 24 // 날짜 숫자 줄 높이(px)

export default function MonthCalendar({ projects, year, month, onEventClick }) {
  const weeks = getCalendarWeeks(year, month)

  return (
    <div className="flex flex-col h-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-line bg-white z-[2] shrink-0">
        {DOW.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-semibold py-2 ${i === 0 || i === 6 ? 'text-[#9ca3af]' : 'text-muted'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 주별 행 — 남은 높이를 균등 분배(콘텐츠 많은 주는 minHeight 보장) */}
      {weeks.map((week, wi) => {
        const events = layoutWeekEvents(projects, week)
        const laneCount = events.reduce((m, e) => Math.max(m, e.lane + 1), 0)
        const rowH = DATE_ROW_H + laneCount * LANE_H + 6
        return (
          <div key={wi} className="relative border-b border-line last:border-b-0 flex-1" style={{ minHeight: rowH }}>
            {/* 날짜 칸 배경(7열) */}
            <div className="grid grid-cols-7 h-full">
              {week.map(d => (
                <div key={d.date} className={`border-r border-line-soft last:border-r-0 ${d.isWeekend ? 'bg-[#fafafa]' : ''} ${d.isToday ? 'bg-[#eff6ff55]' : ''}`}>
                  <div className={`text-[11px] px-1.5 pt-1 ${!d.inMonth ? 'text-[#d1d5db]' : d.isToday ? 'text-blue font-bold' : d.isWeekend ? 'text-[#9ca3af]' : 'text-text-sub'}`}>
                    {d.day}
                  </div>
                </div>
              ))}
            </div>

            {/* 이벤트 막대(절대 배치) */}
            {events.map(ev => {
              const team = getProjectTeam(ev.project)
              const c = getTeamColor(team)
              const left = (ev.startCol / 7) * 100
              const width = ((ev.endCol - ev.startCol + 1) / 7) * 100
              const top = DATE_ROW_H + ev.lane * LANE_H
              const radius = `${ev.continuesLeft ? '0' : '5px'} ${ev.continuesRight ? '0' : '5px'} ${ev.continuesRight ? '0' : '5px'} ${ev.continuesLeft ? '0' : '5px'}`
              return (
                <button
                  key={ev.project.id}
                  onClick={() => onEventClick(ev.project)}
                  title={`${ev.project.title} (${ev.project.start} ~ ${ev.project.end || ev.project.start})`}
                  className="absolute h-[18px] flex items-center px-1.5 overflow-hidden cursor-pointer hover:brightness-95"
                  style={{
                    left: `calc(${left}% + 3px)`,
                    width: `calc(${width}% - 6px)`,
                    top,
                    background: c.bg,
                    borderLeft: `3px solid ${c.text}`,
                    borderRadius: radius,
                  }}
                >
                  <span className="text-[10.5px] font-medium truncate" style={{ color: c.text }}>{ev.project.title}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
