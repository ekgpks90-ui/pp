import { useState } from 'react'
import { MONDAY_ISO, addDays } from '../data/helpers'

export default function Topbar({
  weekOffset, onPrevWeek, onNextWeek, onGoCurrentWeek,
  searchQuery, onSearchChange,
  notifications, onMarkNotifRead, onMarkAllNotifsRead,
}) {
  const [showNotif, setShowNotif] = useState(false)
  const start = addDays(MONDAY_ISO, weekOffset * 7)
  const end = addDays(start, 6)
  const fmt = s => s.slice(5).replace('-', '.')
  const year = start.slice(0, 4)
  const isCurrentWeek = weekOffset === 0
  const unreadCount = notifications.filter(n => n.unread).length

  const handleNotifClick = (n) => {
    if (n.unread) onMarkNotifRead(n.id)
  }

  return (
    <header className="h-[58px] shrink-0 flex items-center justify-between px-7 border-b border-line bg-surface relative z-20">
      {/* Week filter */}
      <div className="flex items-center gap-1">
        <button onClick={onPrevWeek} className="w-[26px] h-[26px] flex items-center justify-center border border-line rounded-[6px] bg-transparent hover:bg-surface-muted hover:border-[#d0d0d8] hover:text-text-primary text-muted transition-colors cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-text-primary min-w-[185px] justify-center tracking-[-0.01em]">
          <span className="text-muted font-normal text-[13px]">{year}</span>
          <span className="font-semibold">{fmt(start)} ~ {fmt(end)}</span>
          {isCurrentWeek ? (
            <span className="ml-1 px-[7px] py-[2px] text-[10.5px] font-semibold bg-blue-soft text-blue rounded-[20px] tracking-[0.01em]">이번 주</span>
          ) : (
            <button
              onClick={onGoCurrentWeek}
              className="ml-1 px-[7px] py-[2px] text-[10.5px] font-semibold bg-surface-muted text-muted rounded-[20px] tracking-[0.01em] hover:bg-blue-soft hover:text-blue transition-colors cursor-pointer"
            >이번 주</button>
          )}
        </span>
        <button onClick={onNextWeek} className="w-[26px] h-[26px] flex items-center justify-center border border-line rounded-[6px] bg-transparent hover:bg-surface-muted hover:border-[#d0d0d8] hover:text-text-primary text-muted transition-colors cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="search"
            placeholder="업무명 검색..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="h-8 pl-8 pr-7 text-[13px] bg-surface-muted border border-line rounded-lg outline-none focus:border-blue focus:bg-white focus:w-[250px] focus:shadow-[0_0_0_3px_rgba(74,102,255,0.08)] transition-all w-[190px]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-muted hover:text-text-primary cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red rounded-full border-[1.5px] border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white text-[11px] font-semibold">J</div>
          <span className="text-xs font-medium text-text-sub">Jihye</span>
        </div>
      </div>

      {/* Notification popover */}
      {showNotif && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
          <div className="absolute right-6 top-[56px] w-[340px] bg-surface border border-line rounded-[14px] shadow-md z-50 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[14px] font-semibold">알림</span>
              <button
                onClick={onMarkAllNotifsRead}
                className="text-xs text-blue font-medium cursor-pointer hover:underline"
              >
                전체 읽음
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${n.unread ? 'bg-blue-soft hover:bg-blue-soft/70' : 'bg-surface-muted hover:bg-surface-muted/70'}`}
                >
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold mb-1 flex-wrap">
                    <span>{n.title}</span>
                    {n.requestTitle && (
                      <span className="text-[11px] font-semibold text-blue bg-blue-soft rounded px-[7px] py-[2px] shrink-0">{n.requestTitle}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted">{n.body}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
