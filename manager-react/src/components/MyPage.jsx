import { useState, useMemo, useCallback } from 'react'
import { TODAY_ISO } from '../data/helpers'

const CAT_COLORS = { '기획': '#6C63FF', '개발': '#3BAFDA', '디자인': '#FF6B6B', '운영': '#FF9F43', '리서치': '#26de81' }

function sessionMins(s) {
  if (!s.startTime || !s.endTime) return 0
  const [sh, sm] = s.startTime.split(':').map(Number)
  const [eh, em] = s.endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function fmtDuration(m) {
  const h = Math.floor(m / 60), mn = m % 60
  return h > 0 ? `${h}h ${mn}m` : `${mn}m`
}

function MeetingCard({ meeting: m, myName }) {
  const [open, setOpen] = useState(false)
  const aiPoints = m.aiPoints || []
  const discussions = m.discussions || []

  const toggle = useCallback(() => setOpen(v => !v), [])

  return (
    <div className="border border-line rounded-lg overflow-hidden">
      <div
        className="flex flex-col gap-1 p-2.5 cursor-pointer hover:bg-surface-muted transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-[7px]">
          <span className="text-[12px] font-medium text-text-primary flex-1 truncate">{m.title}</span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-sub">
          <span>{m.date}</span>
          {m.duration && <span>· {m.duration}</span>}
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-surface-muted px-3 py-2.5 flex flex-col gap-4">
          {(m.attendeeNames || []).length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-text-primary mb-1.5">참여자</div>
              <div className="flex flex-wrap gap-1.5">
                {(m.attendeeNames || []).map(name => (
                  <span key={name} className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${name === myName ? 'bg-blue/10 text-blue' : 'bg-white border border-line text-text-sub'}`}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {aiPoints.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-text-primary mb-1.5">주요 내용</div>
              <ul className="flex flex-col gap-1.5">
                {aiPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-text-sub leading-[1.6]">
                    <span className="text-blue shrink-0 mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {discussions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-text-primary mb-1.5">주요 논의</div>
              <ul className="flex flex-col gap-1.5">
                {discussions.map((d, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-text-sub leading-[1.6]">
                    <span className="text-orange shrink-0 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!aiPoints.length && !discussions.length && (
            <p className="text-[12px] text-muted">AI 요약 없음</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyPage({ currentUser, sessions, meetings, leaves }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const uid = currentUser?.id
  const myName = currentUser?.name

  const allSessions = useMemo(() => sessions.filter(s => s.authorId === uid), [sessions, uid])
  const monthPrefix = TODAY_ISO.slice(0, 7)
  const monthSessions = useMemo(() => allSessions.filter(s => s.date.startsWith(monthPrefix)), [allSessions, monthPrefix])

  // Category chart
  const catData = useMemo(() => {
    const map = {}
    allSessions.forEach(s => { map[s.category] = (map[s.category] || 0) + sessionMins(s) })
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
    const total = entries.reduce((a, c) => a + c[1], 0) || 1
    return entries.map(([cat, mins]) => ({ cat, mins, pct: Math.round(mins / total * 100), color: CAT_COLORS[cat] || '#A29BFE' }))
  }, [allSessions])

  // AI Insights
  const insights = useMemo(() => {
    const ms = monthSessions
    const catCount = {}
    ms.forEach(s => { catCount[s.category] = (catCount[s.category] || 0) + 1 })
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]

    const wiTime = {}
    ms.forEach(s => { wiTime[s.title] = (wiTime[s.title] || 0) + sessionMins(s) })
    const topWi = Object.entries(wiTime).sort((a, b) => b[1] - a[1])[0]

    const dayMins = {}
    ms.forEach(s => { dayMins[s.date] = (dayMins[s.date] || 0) + sessionMins(s) })
    const sortedDays = Object.entries(dayMins).sort((a, b) => b[1] - a[1])
    const bestDay = sortedDays[0], worstDay = sortedDays[sortedDays.length - 1]
    const fmtDate = d => d ? `${d.slice(5, 7)}/${d.slice(8, 10)}` : '-'

    const hourMins = {}
    ms.forEach(s => { const h = s.startTime?.split(':')[0]; if (h) hourMins[h] = (hourMins[h] || 0) + sessionMins(s) })
    const peakHour = Object.entries(hourMins).sort((a, b) => b[1] - a[1])[0]

    const titleCount = {}
    ms.forEach(s => { titleCount[s.title] = (titleCount[s.title] || 0) + 1 })
    const repeated = Object.entries(titleCount).filter(([, c]) => c >= 2).map(([t]) => t)

    const totalMins = ms.reduce((a, s) => a + sessionMins(s), 0)

    return {
      items: [
        { icon: '📋', label: '가장 많이 수행한 업무', value: topCat ? `${topCat[0]} (${topCat[1]}건)` : '데이터 없음' },
        { icon: '⏱️', label: '가장 많은 시간이 투입된 업무', value: topWi ? `${topWi[0]} (${fmtDuration(topWi[1])})` : '데이터 없음' },
        { icon: '🔁', label: '반복 업무 패턴', value: repeated.length ? repeated.slice(0, 2).join(', ') : '반복 업무 없음' },
        { icon: '🌟', label: '생산성이 높은 요일', value: bestDay ? `${fmtDate(bestDay[0])} (${fmtDuration(bestDay[1])})` : '데이터 없음' },
        { icon: '📉', label: '생산성이 낮은 요일', value: worstDay ? `${fmtDate(worstDay[0])} (${fmtDuration(worstDay[1])})` : '데이터 없음' },
        { icon: '⚡', label: '업무 집중 시간대', value: peakHour ? `${peakHour[0]}:00 ~ ${parseInt(peakHour[0]) + 1}:00` : '데이터 없음' },
      ],
      count: ms.length,
      totalMins,
    }
  }, [monthSessions])

  // My meetings
  const myMeetings = useMemo(() =>
    (meetings || []).filter(m => Array.isArray(m.attendeeNames) && m.attendeeNames.includes(myName)),
  [meetings, myName])

  // Mini calendar
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthStr = String(calMonth + 1).padStart(2, '0')
  const sessionDates = useMemo(() => new Set(allSessions.map(s => s.date)), [allSessions])
  const meetingDates = useMemo(() => new Set(myMeetings.map(m => m.date)), [myMeetings])
  const leaveSet = useMemo(() => {
    const approved = (leaves || []).filter(l => l.applicantId === uid && l.status === '승인 완료')
    return new Set(approved.map(l => l.startDate))
  }, [leaves, uid])

  const selectedSessions = useMemo(() =>
    selectedDate ? allSessions.filter(s => s.date === selectedDate) : [],
  [selectedDate, allSessions])

  const selectedMeetings = useMemo(() =>
    selectedDate ? myMeetings.filter(m => m.date === selectedDate) : [],
  [selectedDate, myMeetings])

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }

  const now = new Date()

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <h2 className="text-[16px] font-bold text-text-primary mb-4 shrink-0">My Page</h2>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2.5 overflow-y-auto pb-4">
        {/* Left column: Profile + Charts */}
        <div className="flex flex-col gap-2.5">
          {/* Profile */}
          <div className="bg-white border border-line rounded-[10px] p-4 flex flex-col items-center gap-2.5">
            <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center text-white text-[20px] font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="text-[14px] font-bold text-text-primary">{currentUser?.name}</div>
            <div className="text-[11px] text-text-sub">{currentUser?.role}</div>
            <div className="w-full h-px bg-line my-1" />
            <div className="w-full flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-text-sub">팀</span><span className="text-text-primary font-medium">{currentUser?.team}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">권한</span><span className="text-text-primary font-medium">{currentUser?.role}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">입사일</span><span className="text-text-primary font-medium">{currentUser?.joinDate}</span></div>
            </div>
          </div>

        </div>

        {/* Right column: Calendar panel */}
        <div className="flex flex-col gap-2.5">
          {/* Mini Calendar */}
          <div className="bg-white border border-line rounded-[10px] p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">‹</button>
              <span className="text-[13px] font-semibold text-text-primary">{calYear}년 {MONTHS[calMonth]}</span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">›</button>
            </div>
            <div className="grid grid-cols-7 gap-[3px] text-center">
              {['일','월','화','수','목','금','토'].map(d => (
                <div key={d} className="text-[11px] font-semibold text-text-sub py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const ds = `${calYear}-${monthStr}-${String(d).padStart(2, '0')}`
                const isToday = ds === TODAY_ISO
                const isSel = ds === selectedDate
                const isLeave = leaveSet.has(ds)
                const hasSession = sessionDates.has(ds)
                const hasMeeting = meetingDates.has(ds)
                const dotCount = [hasSession, hasMeeting, isLeave].filter(Boolean).length
                return (
                  <button key={d} onClick={() => setSelectedDate(ds)}
                    className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[12px] cursor-pointer transition-colors
                      ${isSel ? 'bg-blue/10 border border-blue' : isLeave ? 'bg-[#ff9f43]/[0.08]' : 'hover:bg-surface-muted'}
                      ${isToday ? 'text-blue font-bold' : 'text-text-primary'}`}>
                    {d}
                    {dotCount > 0 && (
                      <div className="absolute bottom-0.5 flex gap-[2px] items-center justify-center">
                        {hasSession && <span className="w-1 h-1 rounded-full bg-blue" />}
                        {hasMeeting && <span className="w-1 h-1 rounded-full bg-[#8b5cf6]" />}
                        {isLeave && <span className="w-1 h-1 rounded-full bg-[#f59e0b]" />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 text-[10px] text-text-sub mt-1">
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-blue inline-block" />작업세션</span>
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-[#8b5cf6] inline-block" />회의</span>
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-[#f59e0b] inline-block" />연차</span>
            </div>
          </div>

          {/* Session list */}
          <div className="bg-white border border-line rounded-[10px] p-[10px_12px] flex flex-col gap-[7px]">
            <div className="text-[11px] font-semibold text-text-sub tracking-[0.3px]">
              {selectedDate || '날짜 미선택'} 작업세션
            </div>
            {!selectedDate ? (
              <div className="text-[12px] text-text-sub text-center py-3.5">날짜를 선택하세요</div>
            ) : selectedSessions.length === 0 ? (
              <div className="text-[12px] text-text-sub text-center py-3.5">{selectedDate} 세션 없음</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedSessions.map(s => {
                  const m = sessionMins(s)
                  const dur = m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? m % 60 + 'm' : ''}` : `${m}m`
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-[12px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue shrink-0" />
                      <span className="flex-1 text-text-primary truncate">{s.title}</span>
                      {m > 0 && <span className="text-[12px] text-blue font-semibold text-right">{dur}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Meeting list */}
          <div className="bg-white border border-line rounded-[10px] p-[10px_12px] flex flex-col gap-[7px]">
            <div className="text-[11px] font-semibold text-text-sub tracking-[0.3px]">
              {selectedDate || '날짜 미선택'} 회의
            </div>
            {!selectedDate ? (
              <div className="text-[12px] text-text-sub text-center py-3.5">날짜를 선택하세요</div>
            ) : selectedMeetings.length === 0 ? (
              <div className="text-[12px] text-text-sub text-center py-3.5">{selectedDate} 회의 없음</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedMeetings.map(m => (
                  <MeetingCard key={m.id} meeting={m} myName={myName} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
