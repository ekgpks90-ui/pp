import { useState, useMemo } from 'react'
import { TODAY_ISO, isDelayed, getProjectTeam, getTeamColor, TEAM_ORDER, enrichProject } from '../data/helpers'
import { processes, teamMembers, gradeRates } from '../data/state'
import { canEditCalendar, ROLES } from '../data/roles'
import CalendarDetailPanel from './CalendarDetailPanel'
import DetailPanel from './DetailPanel'
import MonthCalendar from './MonthCalendar'
import CeoSlideOver from './CeoSlideOver'
import CeoProjectDetail from './CeoProjectDetail'

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

// 월 day 헤더 (전체 보기/프로젝트별 공용)
function DayHeader({ days, leftLabel }) {
  return (
    <div className="flex items-stretch border-b-2 border-line sticky top-0 bg-white z-[2]">
      <div className="w-[220px] min-w-[220px] shrink-0 px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-[0.05em] border-r border-line flex items-center">
        {leftLabel}
      </div>
      <div className="flex-1 flex overflow-hidden">
        {days.map(d => {
          const cls = ['flex-1 text-center text-[10.5px] py-1.5 px-0.5 border-r border-line min-w-[24px]',
            d.isToday && 'text-blue font-bold', d.isWeekend && 'text-[#9ca3af] bg-[#fafafa]',
            !d.isToday && !d.isWeekend && 'text-muted'].filter(Boolean).join(' ')
          return <div key={d.date} className={cls}>{d.day}</div>
        })}
      </div>
    </div>
  )
}

export default function CalendarPage({ role, workItems, sessions, meetings = [], workItemResources = {}, onAddResource, onRemoveResource, onUpdateWorkItem, onAddNotification }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [editItemId, setEditItemId] = useState(null)
  const [ceoDetailId, setCeoDetailId] = useState(null) // 대표 프로젝트 클릭 → 홈식 상세(CeoProjectDetail)
  const [viewMode, setViewMode] = useState('all') // 'all'(전체 보기) | 'project'(프로젝트별)
  const [selectedTeam, setSelectedTeam] = useState('전체') // 대표 전체보기 팀 필터
  // 전체 보기는 대표(owner) 전용. 직원·팀장은 기존처럼 프로젝트별만 사용.
  const isOwner = role === ROLES.OWNER
  const showAll = isOwner && viewMode === 'all'
  // 수정 시 workItems가 갱신되면 패널도 즉시 반영되도록 id로 실시간 참조
  const editItem = editItemId ? workItems.find(w => w.id === editItemId) : null

  // 프로젝트 목록 = 반복 아님 + 시작일 있음. 회의·연차는 캘린더에 표시하지 않는다.
  const projects = useMemo(() =>
    workItems.filter(wi =>
      !wi.recurringDays && wi.start &&
      wi.type !== '회의' && !LEAVE_TYPES.includes(wi.type)
    ),
  [workItems])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // 팀별 프로젝트 수(전체보기 사이드바 뱃지). 회의·연차·반복 제외된 projects 기준.
  const teamCounts = useMemo(() => {
    const counts = {}
    for (const p of projects) {
      const t = getProjectTeam(p)
      counts[t] = (counts[t] || 0) + 1
    }
    return counts
  }, [projects])

  // 사이드바에 노출할 팀(프로젝트가 1개 이상인 팀만, 정해진 순서).
  const visibleTeams = useMemo(
    () => TEAM_ORDER.filter(t => (teamCounts[t] || 0) > 0),
    [teamCounts]
  )

  // 선택 팀으로 필터한 전체보기용 프로젝트.
  const teamFilteredProjects = useMemo(
    () => (selectedTeam === '전체' ? projects : projects.filter(p => getProjectTeam(p) === selectedTeam)),
    [projects, selectedTeam]
  )

  const days = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth])

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  // 타임라인 = 프로세스 단계별 그룹. 각 그룹 아래 담당자를 세로로 나열하고, 사람마다 가로 막대.
  // 막대 범위 = 그 사람의 실제 작업세션 날짜(A). 세션 없으면 막대 없이 행만(배정만 됨).
  const timelineGroups = useMemo(() => {
    if (!selectedProject) return []
    const wiSessions = sessions.filter(s => s.workItemId === selectedProject.id)
    const proc = selectedProject.processId ? processes.find(p => p.id === selectedProject.processId) : null
    const groups = []
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
    // 사람 목록 → 사람별 막대 행
    const buildRows = (people, sessionsOf) => people.map(person => {
      const ps = sessionsOf(person)
      ps.forEach(s => usedSessionIds.add(s.id))
      return { person, ...makeBar(ps) }
    })

    if (proc) {
      // 프로세스 있음 → 정해진 모든 단계를 그룹으로 표시(세션 없어도 단계명은 보임).
      // 단계 아래 담당자는 세션 있는 사람만.
      proc.steps.forEach(step => {
        const stepSessions = wiSessions.filter(s => s.stepId === step.id)
        const people = [...new Set(stepSessions.map(s => s.authorName))] // 실제 작업(세션)한 사람만
        const rows = buildRows(people, p => stepSessions.filter(s => s.authorName === p))
        groups.push({ key: step.id, title: step.title, rows })
      })
    } else {
      // 프로세스 없음 → 프로젝트 한 그룹 + 작업(세션)한 사람만
      const people = [...new Set(wiSessions.map(s => s.authorName))]
      const rows = buildRows(people, p => wiSessions.filter(s => s.authorName === p))
      if (rows.length) groups.push({ key: 'no-proc', title: selectedProject.title, rows })
    }

    // 어디에도 안 잡힌 세션 → '기타 작업' 그룹 (명단엔 없지만 실제 작업한 사람)
    const orphan = wiSessions.filter(s => !usedSessionIds.has(s.id))
    const byAuthor = {}
    orphan.forEach(s => (byAuthor[s.authorName] ||= []).push(s))
    const orphanRows = Object.entries(byAuthor).map(([person, ss]) => ({ person, ...makeBar(ss) }))
    if (orphanRows.length) groups.push({ key: 'orphan', title: '기타 작업', rows: orphanRows })

    return groups
  }, [selectedProject, sessions])

  const monthTitle = `${calYear}년 ${calMonth + 1}월`

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left: Sidebar — 대표는 팀 목록(필터), 그 외는 기존 프로젝트 목록 */}
        <nav className="w-[200px] min-w-[160px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-y-auto">
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[0.06em] px-3.5 pt-3.5 pb-2.5 border-b border-line shrink-0">
            {isOwner ? '팀' : '프로젝트'}
          </div>

          {isOwner ? (
            // 팀 목록: 전체 + 프로젝트 있는 팀만
            [{ name: '전체', count: projects.length }, ...visibleTeams.map(t => ({ name: t, count: teamCounts[t] || 0 }))].map(team => {
              const isActive = selectedTeam === team.name
              return (
                <button key={team.name}
                  onClick={() => { setSelectedTeam(team.name); setViewMode('all') }}
                  className={`flex items-center justify-between px-3.5 py-2.5 border-b border-line text-left w-full transition-colors cursor-pointer
                    ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                  <span className={`text-[12px] font-medium ${isActive ? 'text-blue' : 'text-text-primary'}`}>{team.name}</span>
                  <span className="text-[10px] font-medium text-muted px-1.5 py-0.5 rounded bg-surface-muted">{team.count}</span>
                </button>
              )
            })
          ) : (
            projects.length === 0 ? (
              <div className="px-3.5 py-5 text-[12px] text-muted">프로젝트 없음</div>
            ) : (
              projects.map(wi => {
                const status = getWorkItemStatus(wi, sessions)
                const sc = STATUS_COLOR[status] || STATUS_COLOR['시작 전']
                const isActive = selectedProjectId === wi.id
                return (
                  <button key={wi.id}
                    onClick={() => { setSelectedProjectId(wi.id); setViewMode('project') }}
                    className={`flex flex-col items-start px-3.5 py-2.5 border-b border-line gap-[5px] text-left w-full transition-colors cursor-pointer
                      ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                    <span className="flex items-start gap-1.5 text-[12px] font-medium text-text-primary leading-[1.4]">
                      {wi.type === '고정' ? (
                        <svg className="w-[12px] h-[12px] text-[#6b7280] shrink-0 mt-[2px]" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                        </svg>
                      ) : (
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-[3px] ${wi.type === '긴급' ? 'bg-red' : wi.type === '회의' ? 'bg-orange' : 'bg-soft'}`} />
                      )}
                      <span>{wi.title}</span>
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: sc.bg, color: sc.text }}>
                      {status}
                    </span>
                  </button>
                )
              })
            )
          )}
        </nav>

        {/* Middle: 대표 전용 — 선택 팀의 프로젝트 리스트 (클릭 시 우측 상세 패널) */}
        {isOwner && (
          <nav className="w-[230px] min-w-[190px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5 border-b border-line shrink-0">
              <span className="text-[10.5px] font-semibold text-muted uppercase tracking-[0.06em]">
                {selectedTeam === '전체' ? '전체 프로젝트' : selectedTeam}
              </span>
              <span className="text-[10px] font-medium text-muted px-1.5 py-0.5 rounded bg-surface-muted">{teamFilteredProjects.length}</span>
            </div>
            {teamFilteredProjects.length === 0 ? (
              <div className="px-3.5 py-5 text-[12px] text-muted">프로젝트 없음</div>
            ) : (
              teamFilteredProjects.map(wi => {
                const status = getWorkItemStatus(wi, sessions)
                const sc = STATUS_COLOR[status] || STATUS_COLOR['시작 전']
                const isActive = ceoDetailId === wi.id
                const dot = getTeamColor(getProjectTeam(wi)).text
                return (
                  <button key={wi.id}
                    onClick={() => setCeoDetailId(wi.id)}
                    className={`flex flex-col items-start px-3.5 py-2.5 border-b border-line gap-[5px] text-left w-full transition-colors cursor-pointer
                      ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                    <span className="flex items-start gap-1.5 text-[12px] font-medium text-text-primary leading-[1.4]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-[3px]" style={{ background: dot }} />
                      <span>{wi.title}</span>
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: sc.bg, color: sc.text }}>
                      {status}
                    </span>
                  </button>
                )
              })
            )}
          </nav>
        )}

        {/* Right: Timeline area */}
        <div className="flex-1 min-w-0 flex flex-col bg-white border border-line rounded-[10px] overflow-hidden">
          {/* Topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-line shrink-0">
            <div className="flex items-center gap-3">
              {!showAll && (
                selectedProject ? (
                  <button
                    onClick={() => setEditItemId(selectedProject.id)}
                    className="text-[13px] font-semibold text-text-primary hover:text-blue hover:underline cursor-pointer"
                    title="업무 상세 보기"
                  >
                    {selectedProject.title}
                  </button>
                ) : (
                  <span className="text-[13px] font-semibold text-muted">← 프로젝트 선택</span>
                )
              )}
            </div>
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
            {showAll ? (
              <div className="px-2 py-2 h-full">
                <MonthCalendar
                  projects={teamFilteredProjects}
                  year={calYear}
                  month={calMonth}
                  onEventClick={(p) => setCeoDetailId(p.id)}
                />
              </div>
            ) : !selectedProject ? (
              <div className="px-6 py-[60px] text-center text-[13px] text-muted">
                왼쪽에서 프로젝트를 선택하면 타임라인을 확인할 수 있습니다
              </div>
            ) : (
              <div>
                {/* Timeline header */}
                <DayHeader days={days} leftLabel="단계 · 담당자" />

                {/* Timeline rows */}
                <div>
                  {timelineGroups.length === 0 ? (
                    <div className="px-4 py-6 text-[12px] text-muted">표시할 단계·작업이 없습니다</div>
                  ) : (
                    timelineGroups.map(group => (
                      <div key={group.key}>
                        {/* 단계(프로세스) 그룹 헤더 */}
                        <div className="flex items-stretch border-t border-line bg-surface-muted">
                          <div className="w-[220px] min-w-[220px] shrink-0 px-4 py-1.5 text-[11.5px] font-semibold text-text-primary border-r border-line truncate">
                            {group.title}
                          </div>
                          <div className="flex-1 flex">
                            {days.map(d => (
                              <div key={d.date} className={`flex-1 border-r border-[#f3f4f6] min-w-[24px] ${d.isWeekend ? 'bg-[#fafafa]' : ''}`} />
                            ))}
                          </div>
                        </div>

                        {/* 세션 없는 단계 — 단계명만 표시하고 '아직 작업 없음' */}
                        {group.rows.length === 0 && (
                          <div className="flex items-stretch h-[32px] border-t border-line-soft">
                            <div className="w-[220px] min-w-[220px] shrink-0 pl-8 pr-4 flex items-center border-r border-line">
                              <span className="text-[11px] text-soft">아직 작업 없음</span>
                            </div>
                            <div className="flex-1 relative flex">
                              {days.map(d => (
                                <div key={d.date} className={`flex-1 border-r border-[#f3f4f6] min-w-[24px] ${d.isWeekend ? 'bg-[#fafafa]' : ''} ${d.isToday ? 'bg-[#eff6ff55]' : ''}`} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 담당자 세로 나열 — 각자 가로 막대 */}
                        {group.rows.map(row => (
                          <div key={row.person} className="flex items-stretch h-[38px] border-t border-line-soft">
                            {/* 담당자 (들여쓰기) */}
                            <div className="w-[220px] min-w-[220px] shrink-0 pl-8 pr-4 flex items-center gap-2 border-r border-line">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0"
                                style={{ background: memberColor(row.person) }}>
                                {row.person[0]}
                              </span>
                              <span className="text-[11px] text-text-sub truncate">{row.person}</span>
                              {row.total > 0 && (
                                <span className="text-[9px] text-soft ml-auto shrink-0">{row.done}/{row.total}</span>
                              )}
                            </div>

                            {/* Track */}
                            <div className="flex-1 relative min-h-[38px] flex">
                              <div className="absolute inset-0 flex">
                                {days.map(d => (
                                  <div key={d.date} className={`flex-1 border-r border-[#f3f4f6] min-w-[24px] ${d.isWeekend ? 'bg-[#fafafa]' : ''} ${d.isToday ? 'bg-[#eff6ff55]' : ''}`} />
                                ))}
                              </div>

                              {/* 가로 막대 — 실제 작업세션 날짜가 있을 때만 (A) */}
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
                                  <div className="absolute h-5 top-1/2 -translate-y-1/2 rounded-[5px] overflow-hidden min-w-[6px] cursor-pointer z-[1]"
                                    style={{
                                      left: `calc(${left}% + 2px)`,
                                      width: `calc(${width}% - 4px)`,
                                      background: tc.text,
                                    }}
                                    onClick={() => setDetailItem(selectedProject)}
                                    title={`${row.person} · ${group.title} (${row.done}/${row.total})`} />
                                )
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 대표: 프로젝트 클릭 → 홈식 상세(CeoProjectDetail). 하단 '업무 수정'으로 편집 폼 전환 */}
      {ceoDetailId && (() => {
        const wi = workItems.find(w => w.id === ceoDetailId)
        if (!wi) return null
        const p = enrichProject(wi, sessions, teamMembers, gradeRates, processes)
        return (
          <CeoSlideOver title="프로젝트 상세" onClose={() => setCeoDetailId(null)}
            footer={canEditCalendar(role) && (
              <button
                onClick={() => { setEditItemId(ceoDetailId); setCeoDetailId(null) }}
                className="w-full h-10 text-[13px] font-semibold rounded-lg border border-line text-muted hover:text-blue hover:border-blue transition-colors cursor-pointer">
                업무 수정
              </button>
            )}>
            <CeoProjectDetail project={p} sessions={sessions} processes={processes}
              teamMembers={teamMembers} gradeRates={gradeRates} showMoney />
          </CeoSlideOver>
        )
      })()}

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

      {/* 프로젝트명 클릭 → 업무 상세(홈과 동일). 직원은 조회 전용, 팀장·대표는 수정 가능 */}
      {editItem && (
        <DetailPanel
          item={editItem}
          sessions={sessions}
          meetings={meetings}
          canEdit={canEditCalendar(role)}
          canEditAssignees={canEditCalendar(role)}
          lockRequestFields={false}
          onSave={(id, updates) => onUpdateWorkItem?.(id, updates)}
          onUpdateAssignees={(id, stepAssignees) => onUpdateWorkItem?.(id, { stepAssignees })}
          onNotify={(body) => onAddNotification?.('업무 변경 알림', body)}
          onClose={() => setEditItemId(null)}
        />
      )}
    </div>
  )
}
