import { useState, useMemo } from 'react'
import { TODAY_ISO, isDelayed } from '../data/helpers'
import { processes } from '../data/state'
import CalendarDetailPanel from './CalendarDetailPanel'

// 캘린더에서 제외할 연차 유형 (회의 type '회의'는 별도로 제외)
const LEAVE_TYPES = ['종일 연차', '오전 반차', '오후 반차']

const WORK_ITEM_TYPE_COLOR = {
  '고정': { bg: '#dbeafe', text: '#1d4ed8' },
  '긴급': { bg: '#fee2e2', text: '#dc2626' },
  '일반': { bg: '#f3f4f6', text: '#374151' },
  '회의': { bg: '#fef3c7', text: '#92400e' },
}

const STATUS_COLOR = {
  '진행 중': { bg: '#dbeafe', text: '#2563eb' },
  '시작 전': { bg: '#f3f4f6', text: '#9ca3af' },
  '지연': { bg: '#fee2e2', text: '#dc2626' },
}

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

// 업무항목은 "완료 상태"를 만들지 않는다(제품 규칙). 날짜 기준 단계 + 홈과 동일한 지연 판정.
function getWorkItemStatus(wi, sessions) {
  if (wi.start > TODAY_ISO) return '시작 전'
  if (isDelayed(wi, TODAY_ISO, sessions)) return '지연'
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

export default function CalendarPage({ role, workItems, sessions, workItemResources = {}, onAddResource, onRemoveResource }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)

  // 프로젝트 목록 = 반복 아님 + 시작일 있음. 회의·연차는 캘린더에 표시하지 않는다.
  const projects = useMemo(() =>
    workItems.filter(wi =>
      !wi.recurringDays && wi.start &&
      wi.type !== '회의' && !LEAVE_TYPES.includes(wi.type)
    ),
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

  // 타임라인 행 = 프로세스 단계별(D). 막대는 그 단계의 실제 작업세션 날짜만 반영(A).
  // 단계에 안 잡힌 세션은 작성자별로 추가해 누락 방지(B).
  const timelineRows = useMemo(() => {
    if (!selectedProject) return []
    const wiSessions = sessions.filter(s => s.workItemId === selectedProject.id)
    const proc = selectedProject.processId ? processes.find(p => p.id === selectedProject.processId) : null
    const stepAssignees = selectedProject.stepAssignees || {}
    const rows = []
    const usedSessionIds = new Set()

    // 세션 묶음 → 막대 범위(가장 이른~늦은 날짜)와 진행 수치
    const makeBar = (ss) => {
      const dates = ss.map(s => s.date).filter(Boolean).sort()
      return {
        barStart: dates[0] || null,
        barEnd: dates.length ? dates[dates.length - 1] : null,
        done: ss.filter(s => s.done).length,
        total: ss.length,
      }
    }

    if (proc) {
      // 프로세스 있음 → 단계별 행
      proc.steps.forEach(step => {
        const assignees = stepAssignees[step.id] || []
        const stepSessions = wiSessions.filter(s => s.stepId === step.id)
        if (assignees.length === 0 && stepSessions.length === 0) return // 배정·세션 둘 다 없으면 행 제외
        stepSessions.forEach(s => usedSessionIds.add(s.id))
        const people = assignees.length ? assignees : [...new Set(stepSessions.map(s => s.authorName))]
        rows.push({ key: step.id, title: step.title, people, ...makeBar(stepSessions) })
      })
    } else {
      // 프로세스 없음 → 참여자별 행 (팀장이 배정·진행 현황 파악). 세션 없으면 막대 없이 행만.
      ;(selectedProject.participants || []).forEach(name => {
        const pSessions = wiSessions.filter(s => s.authorName === name)
        pSessions.forEach(s => usedSessionIds.add(s.id))
        rows.push({ key: `p-${name}`, title: name, people: [name], ...makeBar(pSessions) })
      })
    }

    // 어디에도 안 잡힌 세션 → 작성자별로 묶어 추가 (명단엔 없지만 실제 작업한 사람)
    const orphan = wiSessions.filter(s => !usedSessionIds.has(s.id))
    const byAuthor = {}
    orphan.forEach(s => (byAuthor[s.authorName] ||= []).push(s))
    Object.entries(byAuthor).forEach(([author, ss]) => {
      rows.push({ key: `author-${author}`, title: author, people: [author], ...makeBar(ss) })
    })

    return rows
  }, [selectedProject, sessions])

  const monthTitle = `${calYear}년 ${calMonth + 1}월`

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left: Project sidebar */}
        <nav className="w-[200px] min-w-[160px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-y-auto">
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[0.06em] px-3.5 pt-3.5 pb-2.5 border-b border-line shrink-0">
            프로젝트
          </div>
          {projects.length === 0 ? (
            <div className="px-3.5 py-5 text-[12px] text-muted">프로젝트 없음</div>
          ) : (
            projects.map(wi => {
              const status = getWorkItemStatus(wi, sessions)
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
                    단계 · 참여자
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
                    <div className="px-4 py-6 text-[12px] text-muted">표시할 단계·작업이 없습니다</div>
                  ) : (
                    timelineRows.map((row, ri) => (
                      <div key={row.key} className={`flex items-stretch h-[44px] ${ri > 0 ? 'border-t border-line' : ''}`}>
                        {/* Info column: 단계 + 참여자 */}
                        <div className="w-[220px] min-w-[220px] shrink-0 px-4 flex items-center gap-2 border-r border-line">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11.5px] font-medium text-text-primary truncate">{row.title}</div>
                            <div className="flex items-center gap-1 mt-[3px]">
                              {row.people.length === 0 ? (
                                <span className="text-[10px] text-soft">미배정</span>
                              ) : (
                                row.people.map(name => (
                                  <span key={name} className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold shrink-0"
                                    style={{ background: memberColor(name) }} title={name}>
                                    {name[0]}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                          {row.total > 0 && (
                            <span className="text-[9px] text-soft shrink-0">{row.done}/{row.total}</span>
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

                          {/* Bar — 실제 작업세션 날짜가 있을 때만 그림 (A) */}
                          {row.barStart && row.barEnd && (() => {
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
                                title={`${row.title} — ${selectedProject.title}`}>
                                <span className="text-[10.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                  {row.total > 0 ? `${row.done}/${row.total}` : ''}
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
          resources={workItemResources[detailItem.id] || []}
          onAddResource={onAddResource}
          onRemoveResource={onRemoveResource}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  )
}
