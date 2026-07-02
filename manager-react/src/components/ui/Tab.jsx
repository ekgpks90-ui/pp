/**
 * Tab / Toggle 컴포넌트
 *
 * DayPillTab    — TaskDrawer 날짜 탭 (h-30, pill, bg-blue on)
 * UnderlineTab  — MeetingDetailPanel 탭 (border-b-2, blue on)
 * DayToggle     — TaskDrawer/DetailPanel 요일 토글 (32×32, rounded-8)
 * TeamFilterPill — MeetingRoomPage 팀 필터 (rounded-20, pill)
 */

/* ────────────────────────────────────────────────
   DayPillTab (TaskDrawer)
   h-[30px] px-3 rounded-[6px]
   on : bg-blue text-white
   off: bg-surface-muted text-muted
──────────────────────────────────────────────── */
export function DayPillTab({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const active = tab.value === activeTab
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={[
              'h-[30px] px-3 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer flex flex-col items-center justify-center leading-tight',
              active
                ? 'bg-blue text-white'
                : 'bg-surface-muted text-muted hover:bg-line',
            ].join(' ')}
          >
            <span className="text-[11px] font-normal opacity-80">{tab.day}</span>
            <span>{tab.date}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────
   UnderlineTab (MeetingDetailPanel)
   border-b-2
   on : border-blue text-blue font-semibold
   off: border-transparent text-muted
──────────────────────────────────────────────── */
export function UnderlineTab({ tabs = [], activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex items-center border-b border-line ${className}`}>
      {tabs.map((tab) => {
        const active = tab.value === activeTab
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={[
              'pb-2.5 px-1 mr-5 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer',
              active
                ? 'border-blue text-blue font-semibold'
                : 'border-transparent text-muted hover:text-text-sub',
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────
   DayToggle (TaskDrawer / DetailPanel)
   w-[32px] h-[32px] rounded-[8px]
   on : bg-blue text-white
   off: bg-surface-muted text-muted
──────────────────────────────────────────────── */
export function DayToggle({ days = [], activeDay, onDayChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {days.map((day) => {
        const active = day.value === activeDay
        return (
          <button
            key={day.value}
            onClick={() => onDayChange(day.value)}
            className={[
              'w-[32px] h-[32px] rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer',
              active
                ? 'bg-blue text-white'
                : 'bg-surface-muted text-muted hover:bg-line',
            ].join(' ')}
          >
            {day.label}
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────
   TeamFilterPill (MeetingRoomPage)
   rounded-[20px] h-[28px] px-3
   on : bg-blue text-white
   off: bg-surface-muted text-muted
──────────────────────────────────────────────── */
export function TeamFilterPill({ options = [], activeOption, onOptionChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === activeOption
        return (
          <button
            key={opt.value}
            onClick={() => onOptionChange(opt.value)}
            className={[
              'h-[28px] px-3 rounded-[20px] text-[12px] font-medium transition-colors cursor-pointer',
              active
                ? 'bg-blue text-white'
                : 'bg-surface-muted text-muted hover:bg-line',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
