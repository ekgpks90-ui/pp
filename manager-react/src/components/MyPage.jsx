import { useState, useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'

const CAT_COLORS = { '기획': '#6C63FF', '개발': '#3BAFDA', '디자인': '#FF6B6B', '운영': '#FF9F43', '리서치': '#26de81' }
const TYPE_COLOR = {
  '회고': '#7c4dff', '기획': '#4a66ff', '디자인': '#f5a623', '전략': '#f04444',
  '클라이언트 미팅': '#0ea874', '워크샵': '#06b6d4', '업무 보고': '#6b7280',
  '주간 공유': '#ec4899', '주간 회의': '#ec4899', '기술 공유': '#8b5cf6',
  '타팀 협업회의': '#2563eb', '스프린트 기획': '#4a66ff', '긴급 회의': '#ef4444',
  '디자인 리뷰': '#f5a623',
}

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

export default function MyPage({ currentUser, sessions, workItems, meetings, leaves }) {
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
  const leaveSet = useMemo(() => {
    const approved = (leaves || []).filter(l => l.applicantId === uid && l.status === '승인 완료')
    return new Set(approved.map(l => l.startDate))
  }, [leaves, uid])

  const selectedSessions = useMemo(() =>
    selectedDate ? allSessions.filter(s => s.date === selectedDate) : [],
  [selectedDate, allSessions])

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }

  const now = new Date()

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <h2 className="text-[16px] font-bold text-text-primary mb-4 shrink-0">My Page</h2>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 overflow-y-auto pb-4">
        {/* Left column: Profile + Charts */}
        <div className="flex flex-col gap-4">
          {/* Profile */}
          <div className="bg-white border border-line rounded-[10px] p-5 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center text-white text-[20px] font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="text-[15px] font-bold text-text-primary">{currentUser?.name}</div>
            <div className="text-[12px] text-muted">{currentUser?.role}</div>
            <div className="w-full h-px bg-line" />
            <div className="w-full flex flex-col gap-2 text-[12px]">
              <div className="flex justify-between"><span className="text-muted">팀</span><span className="text-text-sub">{currentUser?.team}</span></div>
              <div className="flex justify-between"><span className="text-muted">권한</span><span className="text-text-sub">{currentUser?.role}</span></div>
              <div className="flex justify-between"><span className="text-muted">입사일</span><span className="text-text-sub">{currentUser?.joinDate}</span></div>
            </div>
          </div>

          {/* Category Chart */}
          <div className="bg-white border border-line rounded-[10px] p-5 flex flex-col gap-3">
            <div className="text-[13px] font-semibold text-text-primary">카테고리별 작업시간</div>
            <div className="flex flex-col gap-2">
              {catData.map(({ cat, mins, pct, color }) => (
                <div key={cat} className="flex items-center gap-2 text-[12px]">
                  <span className="w-12 shrink-0 text-muted">{cat}</span>
                  <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="w-8 text-right text-muted">{pct}%</span>
                  <span className="w-14 text-right text-text-sub font-mono text-[11px]">{fmtDuration(mins)}</span>
                </div>
              ))}
              {catData.length === 0 && <span className="text-[11px] text-muted">데이터 없음</span>}
            </div>
          </div>
        </div>

        {/* Center column: AI + Meetings */}
        <div className="flex flex-col gap-4">
          {/* AI Insights */}
          <div className="bg-white border border-line rounded-[10px] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-gradient-to-r from-blue to-purple text-white px-1.5 py-0.5 rounded">AI</span>
              <span className="text-[13px] font-semibold text-text-primary">{now.getFullYear()}년 {MONTHS[now.getMonth()]} 업무 패턴 요약</span>
              <span className="text-[11px] text-muted ml-auto">{insights.count}건 · {fmtDuration(insights.totalMins)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {insights.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-muted shrink-0 w-[140px]">{item.label}</span>
                  <span className="text-text-sub font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            <div className="px-5 py-[15px] border-b border-line flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">참여한 회의</span>
              <span className="text-[11px] text-muted">{myMeetings.length}건</span>
            </div>
            <div className="flex flex-col gap-2 p-4 max-h-[400px] overflow-y-auto">
              {myMeetings.length > 0 ? myMeetings.map(m => {
                const color = TYPE_COLOR[m.type] || '#6b7280'
                const myActions = (m.actionItems || []).filter(a => a.assignee === myName)
                return (
                  <div key={m.id} className="border border-line rounded-lg p-3 flex flex-col gap-2 cursor-pointer hover:bg-bg/50 transition-colors">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded" style={{ background: color }}>{m.type}</span>
                      <span className="text-[12px] font-medium text-text-primary flex-1 truncate">{m.title}</span>
                      {myActions.length > 0 && (
                        <span className="text-[10px] font-semibold bg-blue/10 text-blue px-1.5 py-0.5 rounded">{myActions.length} 액션</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted line-clamp-2">{m.summary}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {(m.attendeeNames || []).slice(0, 4).map(name => (
                          <span key={name} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold border border-white ${name === myName ? 'bg-blue text-white' : 'bg-[#e5e7eb] text-muted'}`}>
                            {name.slice(0, 1)}
                          </span>
                        ))}
                        {(m.attendeeNames || []).length > 4 && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#e5e7eb] text-[8px] font-semibold text-muted border border-white">
                            +{m.attendeeNames.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted ml-auto">{m.date}</span>
                      <span className="text-[10px] text-muted">{m.duration}</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-[12px] text-muted text-center py-6">참여한 회의가 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Calendar panel */}
        <div className="flex flex-col gap-4">
          {/* Mini Calendar */}
          <div className="bg-white border border-line rounded-[10px] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">‹</button>
              <span className="text-[13px] font-medium text-text-primary">{calYear}년 {MONTHS[calMonth]}</span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">›</button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {['일','월','화','수','목','금','토'].map(d => (
                <div key={d} className="text-[10px] text-muted py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const ds = `${calYear}-${monthStr}-${String(d).padStart(2, '0')}`
                const isToday = ds === TODAY_ISO
                const isSel = ds === selectedDate
                const isLeave = leaveSet.has(ds)
                const hasSession = sessionDates.has(ds)
                return (
                  <button key={d} onClick={() => setSelectedDate(ds)}
                    className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[12px] cursor-pointer transition-colors
                      ${isToday ? 'bg-blue text-white font-bold' : isSel ? 'bg-blue/10 text-blue font-semibold' : 'hover:bg-bg text-text-sub'}
                      ${isLeave ? 'ring-1 ring-[#f59e0b]' : ''}`}>
                    {d}
                    {(isLeave || hasSession) && (
                      <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isLeave ? 'bg-[#f59e0b]' : 'bg-blue'}`} />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue" />작업세션</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />연차</span>
            </div>
          </div>

          {/* Session list */}
          <div className="bg-white border border-line rounded-[10px] p-5 flex flex-col gap-3">
            <div className="text-[13px] font-semibold text-text-primary">
              {selectedDate || '날짜 미선택'} 작업세션
            </div>
            {!selectedDate ? (
              <div className="text-[12px] text-muted">날짜를 선택하세요</div>
            ) : selectedSessions.length === 0 ? (
              <div className="text-[12px] text-muted">{selectedDate} 세션 없음</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedSessions.map(s => {
                  const m = sessionMins(s)
                  const dur = m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? m % 60 + 'm' : ''}` : `${m}m`
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-[12px]">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: (CAT_COLORS[s.category] || '#A29BFE') + '1a', color: CAT_COLORS[s.category] || '#A29BFE' }}>
                        {s.category}
                      </span>
                      <span className="flex-1 text-text-sub truncate">{s.title}</span>
                      {m > 0 && <span className="text-[10px] text-muted font-mono">{dur}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
