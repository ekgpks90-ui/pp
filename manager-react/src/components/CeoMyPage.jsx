import { useState, useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'
import { teamMembers } from '../data/state'

// 대표 전용 My Page (개인 대시보드). 5섹션: 프로필 · 계정 설정 / AI 브리핑 · 최근 일정 / 미니 캘린더.
// 모두 본인(currentUser) 실데이터 기반. 데이터 없는 항목(연락처·출장·계정설정 동작)은 정직하게 비활성/미등록 처리.
// 규칙: My Page에는 총/사용/잔여 연차 숫자를 넣지 않는다. 미니 캘린더엔 연차 "상태 표시(점)"만.
// 직원·팀장은 기존 MyPage를 사용(App.jsx에서 role로 분기).

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const WEEK = ['일','월','화','수','목','금','토']

// 일정 종류별 색 (출장은 데이터 없음 → 미사용)
const KIND = {
  '회의': { dot: '#8b5cf6', label: '회의' },
  '일정': { dot: 'var(--color-blue)', label: '일정' },
  '연차': { dot: '#f59e0b', label: '연차' },
}

function mmdd(d) { return d ? `${d.slice(5, 7)}/${d.slice(8, 10)}` : '' }

export default function CeoMyPage({ currentUser, sessions = [], meetings = [], leaves = [], requests = [] }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const uid = currentUser?.id
  const myName = currentUser?.name
  const me = teamMembers.find(t => t.id === uid)
  const grade = me?.grade || currentUser?.role

  const mySessions = useMemo(() => sessions.filter(s => s.authorId === uid), [sessions, uid])
  const myMeetings = useMemo(
    () => meetings.filter(m => Array.isArray(m.attendeeNames) && m.attendeeNames.includes(myName)),
    [meetings, myName]
  )

  // AI 브리핑 수치 (실데이터)
  const todaySessions = useMemo(() => mySessions.filter(s => s.date === TODAY_ISO), [mySessions])
  const todayMeetings = useMemo(() => myMeetings.filter(m => m.date === TODAY_ISO), [myMeetings])
  const pendingReq = useMemo(() => (requests || []).filter(r => r.status === '수락 대기'), [requests])

  // 캘린더 점 표시용 날짜 집합
  const sessionDates = useMemo(() => new Set(mySessions.map(s => s.date)), [mySessions])
  const meetingDates = useMemo(() => new Set(myMeetings.map(m => m.date)), [myMeetings])
  const leaveSet = useMemo(() => new Set(
    (leaves || []).filter(l => l.applicantId === uid && l.status === '승인 완료').map(l => l.startDate)
  ), [leaves, uid])

  // 특정 날짜의 일정(회의+세션)을 시간순으로
  const scheduleOf = (date) => {
    const ms = myMeetings.filter(m => m.date === date).map(m => ({ time: m.startTime || '', title: m.title, kind: '회의' }))
    const ss = mySessions.filter(s => s.date === date).map(s => ({ time: s.startTime || '', title: s.title, kind: '일정' }))
    return [...ms, ...ss].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  }

  // 다가오는 회의(오늘 이후) — 오늘 일정이 비었을 때의 기본 노출용
  const upcoming = useMemo(
    () => myMeetings.filter(m => m.date >= TODAY_ISO)
      .sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || '')))
      .slice(0, 6)
      .map(m => ({ time: m.startTime || '', title: m.title, kind: '회의', date: m.date })),
    [myMeetings]
  )

  // 최근 일정: 날짜 선택 시 그 날, 미선택 시 오늘(없으면 다가오는 일정)
  const recent = selectedDate ? scheduleOf(selectedDate)
    : (scheduleOf(TODAY_ISO).length ? scheduleOf(TODAY_ISO) : upcoming)
  const recentTitle = selectedDate ? `${mmdd(selectedDate)} 일정` : (scheduleOf(TODAY_ISO).length ? '오늘 일정' : '다가오는 일정')

  // AI 추천사항 (규칙 기반)
  const tips = []
  if (todaySessions.length >= 4) tips.push('오늘 일정이 많아요. 오전 집중 시간에 우선순위 높은 업무부터 처리하세요.')
  if (pendingReq.length) tips.push(`수락 대기 중인 업무요청 ${pendingReq.length}건이 있어요. 확인이 필요합니다.`)
  if (todayMeetings.length) tips.push(`오늘 회의 ${todayMeetings.length}건 — 시작 전 안건을 미리 점검하세요.`)
  if (!tips.length) tips.push('오늘은 일정이 여유로워요. 밀린 업무를 정리하기 좋은 날입니다.')

  // 미니 캘린더 그리드
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthStr = String(calMonth + 1).padStart(2, '0')
  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }

  // 계정 설정 (백엔드/인증 없음 → 비활성 placeholder, '권한 확인'만 값 노출)
  const settings = [
    { label: '알림 설정' },
    { label: '권한 확인', value: currentUser?.role },
    { label: '프로필 수정' },
    { label: '비밀번호 변경' },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <h2 className="text-[16px] font-bold text-text-primary mb-4 shrink-0">My Page</h2>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2.5 overflow-y-auto pb-4">

        {/* ── 좌: 프로필 + 계정 설정 ── */}
        <div className="flex flex-col gap-2.5">
          <div className="bg-white border border-line rounded-[10px] p-4 flex flex-col items-center gap-2.5">
            <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center text-white text-[20px] font-bold">
              {currentUser?.name?.charAt(0)}
            </div>
            <div className="text-[14px] font-bold text-text-primary">{currentUser?.name}</div>
            <div className="text-[11px] text-text-sub">{grade} · {me?.role || currentUser?.role}</div>
            <div className="w-full h-px bg-line my-1" />
            <div className="w-full flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-text-sub">직책</span><span className="text-text-primary font-medium">{grade || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">조직</span><span className="text-text-primary font-medium">{currentUser?.team || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-sub">연락처</span><span className="text-soft">미등록</span></div>
              <div className="flex justify-between"><span className="text-text-sub">입사일</span><span className="text-text-primary font-medium">{currentUser?.joinDate || '—'}</span></div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-[10px] p-4 flex flex-col gap-2.5">
            <div className="text-[13px] font-semibold text-text-primary">계정 설정</div>
            <div className="flex flex-col gap-1">
              {settings.map(s => (
                <button key={s.label} title="준비 중"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-surface-muted text-left cursor-pointer transition-colors">
                  <span className="text-[12px] text-text-primary">{s.label}</span>
                  {s.value
                    ? <span className="text-[11px] text-muted">{s.value}</span>
                    : <span className="text-[10px] text-soft border border-line rounded px-1 py-[1px]">준비 중</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 중: 미니 캘린더 ── */}
        <div className="flex flex-col gap-2.5">
          <div className="bg-white border border-line rounded-[10px] p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">‹</button>
              <span className="text-[13px] font-semibold text-text-primary">{calYear}년 {MONTHS[calMonth]}</span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer text-muted">›</button>
            </div>
            <div className="grid grid-cols-7 gap-[3px] text-center">
              {WEEK.map(d => <div key={d} className="text-[11px] font-semibold text-text-sub py-1">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const ds = `${calYear}-${monthStr}-${String(d).padStart(2, '0')}`
                const isToday = ds === TODAY_ISO
                const isSel = ds === selectedDate
                const isLeave = leaveSet.has(ds)
                const hasSession = sessionDates.has(ds)
                const hasMeeting = meetingDates.has(ds)
                const hasDot = hasSession || hasMeeting || isLeave
                return (
                  <button key={d} onClick={() => setSelectedDate(isSel ? null : ds)}
                    className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-[12px] cursor-pointer transition-colors
                      ${isSel ? 'bg-blue/10 border border-blue' : isLeave ? 'bg-[#ff9f43]/[0.08]' : 'hover:bg-surface-muted'}
                      ${isToday ? 'text-blue font-bold' : 'text-text-primary'}`}>
                    {d}
                    {hasDot && (
                      <div className="absolute bottom-0.5 flex gap-[2px]">
                        {hasMeeting && <span className="w-1 h-1 rounded-full bg-[#8b5cf6]" />}
                        {hasSession && <span className="w-1 h-1 rounded-full bg-blue" />}
                        {isLeave && <span className="w-1 h-1 rounded-full bg-[#f59e0b]" />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 text-[10px] text-text-sub mt-1">
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-[#8b5cf6] inline-block" />회의</span>
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-blue inline-block" />일정</span>
              <span className="flex items-center gap-[3px]"><span className="w-1 h-1 rounded-full bg-[#f59e0b] inline-block" />연차</span>
            </div>
          </div>
        </div>

        {/* ── 우: 오늘 일정 ── */}
        <div className="flex flex-col gap-2.5">
          <div className="bg-white border border-line rounded-[10px] p-4 flex flex-col gap-2.5">
            <div className="text-[13px] font-semibold text-text-primary">{recentTitle}</div>
            {recent.length === 0 ? (
              <div className="text-[12px] text-text-sub text-center py-6">예정된 일정이 없습니다</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recent.map((it, i) => {
                  const k = KIND[it.kind] || KIND['일정']
                  return (
                    <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-muted">
                      <span className="text-[11px] font-mono text-blue w-9 shrink-0">{it.time || '—'}</span>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: k.dot }} />
                      <span className="text-[12px] text-text-primary flex-1 truncate">{it.title}</span>
                      <span className="text-[10px] text-soft shrink-0">{it.date && it.date !== TODAY_ISO ? mmdd(it.date) : k.label}</span>
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
