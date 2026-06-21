import { useState, useEffect } from 'react'
import { processes, currentUser, teamMembers } from '../data/state'
import { isDelayed, TODAY_ISO, fmtDeadline } from '../data/helpers'

const DAY_LABELS = ['월', '화', '수', '목', '금']

export default function DetailPanel({ item, sessions = [], meetings = [], canEdit = true, canEditAssignees = false, lockRequestFields = true, onUpdateAssignees, onNotify, onClose, onSave, onNavigate }) {
  const [draft, setDraft] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)

  // Escape key
  useEffect(() => {
    if (!item) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [item])

  useEffect(() => {
    if (item) {
      setDraft({
        title: item.title,
        type: item.type,
        start: item.start || '',
        end: item.end || '',
        description: item.description || '',
        recurringDays: item.recurringDays ? [...item.recurringDays] : [1],
      })
      setShowAllSteps(false)
      requestAnimationFrame(() => setIsOpen(true))
    } else {
      setIsOpen(false)
    }
  }, [item])

  if (!item || !draft) return null

  const isFromRequest = !!item.sourceRequestId
  // 업무요청 기반 필드 잠금: 홈은 잠금(기본), 캘린더의 팀장·대표는 해제
  const requestLocked = isFromRequest && lockRequestFields
  const isFixed = draft.type === '고정'
  const isMeeting = item.type === '회의'

  const isDirty = draft.title !== item.title
    || draft.type !== item.type
    || draft.start !== (item.start || '')
    || draft.end !== (item.end || '')
    || draft.description !== (item.description || '')
    || JSON.stringify(draft.recurringDays) !== JSON.stringify(item.recurringDays || [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 200)
  }

  const handleSave = () => {
    if (!isDirty) return
    const updates = {
      title: draft.title.trim() || item.title,
      type: draft.type,
      start: draft.start || item.start,
      end: draft.end || (draft.type === '고정' ? null : item.end),
      description: draft.description,
    }
    if (draft.type === '고정' && draft.recurringDays?.length) {
      updates.recurringDays = [...draft.recurringDays]
    }
    onSave(item.id, updates)
    onNotify?.(`'${updates.title}' 업무 정보가 변경되었습니다. 담당자는 확인해 주세요.`)
    handleClose()
  }

  const toggleDay = (dn) => {
    setDraft(prev => {
      const rd = prev.recurringDays || [1]
      if (rd.includes(dn)) {
        if (rd.length <= 1) return prev
        return { ...prev, recurringDays: rd.filter(d => d !== dn) }
      }
      return { ...prev, recurringDays: [...rd, dn].sort() }
    })
  }

  // Meeting type: read-only detail
  if (isMeeting) {
    const meeting = meetings.find(m => m.id === item.sourceMeetingId)
    const hasNotes = !!(meeting && (meeting.summary || (meeting.aiPoints && meeting.aiPoints.length)))
    const meetingType = meeting
      ? meeting.type
      : (item.meetingType ? `${item.meetingType} · 예정` : (item.scheduled ? '예정' : '-'))
    const meetingRoom = (meeting && meeting.room) || item.room || null
    const aiPoints = (meeting && meeting.aiPoints) || []

    return (
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
        <div className={`relative bg-white w-[420px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h3 className="text-[15px] font-semibold">업무 상세</h3>
            <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <span className="text-[12px] font-semibold text-orange bg-orange-soft px-2 py-0.5 rounded self-start">회의</span>
            <div className="text-[18px] font-bold text-text-primary">{item.title}</div>
            <div>
              <span className="text-[12px] text-muted block mb-1">회의 유형</span>
              <span className="text-[14px] text-text-primary">{meetingType}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[12px] text-muted block mb-1">날짜</span>
                <span className="text-[14px] text-text-primary">{item.start}</span>
              </div>
              <div>
                <span className="text-[12px] text-muted block mb-1">시간</span>
                <span className="text-[14px] text-text-primary">{item.meetingTime || '-'}</span>
              </div>
            </div>
            {meetingRoom && (
              <div>
                <span className="text-[12px] text-muted block mb-1">회의실</span>
                <span className="text-[14px] text-text-primary">📍 {meetingRoom}</span>
              </div>
            )}
            {item.participants && (
              <div>
                <span className="text-[12px] text-muted block mb-1">참석자 ({item.participants.length}명)</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.participants.map(name => (
                    <div key={name} className="flex items-center gap-1.5 px-2 py-1 bg-surface-muted rounded-md text-[12px]">
                      <div className="w-5 h-5 rounded-full bg-blue flex items-center justify-center text-white text-[10px] font-semibold">{name[0]}</div>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aiPoints.length > 0 && (
              <div>
                <span className="text-[12px] text-muted block mb-1">AI 핵심 포인트</span>
                <ul className="text-[13px] text-text-primary leading-[1.7] list-disc pl-[18px]">
                  {aiPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {hasNotes && (
              <button
                onClick={() => { handleClose(); onNavigate?.('meeting-room') }}
                className="mt-2 w-full h-9 text-[13px] font-medium text-blue border border-blue rounded-lg hover:bg-blue-soft transition-colors cursor-pointer"
              >
                회의록 보기 →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 업무요청 기반 업무의 프로세스 단계별 참여자 (원본 detail panel '참여자' 섹션)
  const proc = isFromRequest && item.processId ? processes.find(p => p.id === item.processId) : null
  const stepAssignees = item.stepAssignees || {}
  const stepDeadlines = item.stepDeadlines || {}
  // 단계 데드라인: 명시값 없으면 업무 마감일(end)로 파생. 고정 업무는 마감 없음.
  const stepDeadline = (stepId) => stepDeadlines[stepId] ?? (item.type !== '고정' ? (item.end || null) : null)
  const myName = currentUser.name
  const mySteps = proc ? proc.steps.filter(s => (stepAssignees[s.id] || []).includes(myName)) : []
  // 담당자 배치 수정 가능하면 전체 단계를 보여준다(어느 단계든 배정 가능해야 하므로)
  const stepsToRender = proc ? ((showAllSteps || canEditAssignees) ? proc.steps : mySteps) : []
  const itemDelayed = isDelayed(item, TODAY_ISO, sessions)
  const itemSessions = sessions.filter(s => s.workItemId === item.id)
  const isPersonDelayed = (stepId, name) => {
    if (!itemDelayed) return false
    const member = teamMembers.find(m => m.name === name)
    return !!member && itemSessions.some(s => s.stepId === stepId && s.authorId === member.id && !s.done)
  }

  // 담당자 배치 수정 (팀장·대표만) — 즉시 상위로 반영
  const stepTitle = (stepId) => proc?.steps.find(s => s.id === stepId)?.title || ''
  const addAssignee = (stepId, name) => {
    if (!onUpdateAssignees || !name) return
    const cur = stepAssignees[stepId] || []
    if (cur.includes(name)) return
    onUpdateAssignees(item.id, { ...stepAssignees, [stepId]: [...cur, name] })
    onNotify?.(`${name}님이 '${item.title}' - ${stepTitle(stepId)} 단계에 배정되었습니다.`)
  }
  const removeAssignee = (stepId, name) => {
    if (!onUpdateAssignees) return
    const cur = stepAssignees[stepId] || []
    onUpdateAssignees(item.id, { ...stepAssignees, [stepId]: cur.filter(n => n !== name) })
    onNotify?.(`${name}님이 '${item.title}' - ${stepTitle(stepId)} 단계 배정에서 해제되었습니다.`)
  }

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[420px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold">업무 상세</h3>
            {!canEdit && (
              <span className="text-[11px] font-medium text-muted bg-surface-muted px-2 py-0.5 rounded">보기 전용</span>
            )}
          </div>
          <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {itemDelayed && (
            <span className="text-[12px] font-semibold text-red bg-red-soft px-2 py-0.5 rounded self-start">지연중</span>
          )}
          {isFromRequest && (
            <span className="text-[12px] font-semibold text-blue bg-blue-soft px-2 py-0.5 rounded self-start">업무요청</span>
          )}

          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">업무명</span>
            <input
              value={draft.title}
              onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
              disabled={requestLocked || !canEdit || isFixed}
              className={`h-9 px-3 text-[14px] font-semibold border border-line rounded-lg outline-none focus:border-blue ${(requestLocked || !canEdit || isFixed) ? 'opacity-50 cursor-default' : ''}`}
            />
          </label>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">업무유형</span>
            <div className="h-9 px-3 flex items-center text-[14px] border border-line rounded-lg bg-white text-text-primary opacity-50">
              {draft.type || '일반'}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">시작일</span>
              <input
                type="date"
                value={draft.start}
                onChange={e => setDraft(prev => ({ ...prev, start: e.target.value }))}
                disabled={requestLocked || !canEdit}
                className={`h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue ${(requestLocked || !canEdit) ? 'opacity-50 cursor-default' : ''}`}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">
                {isFixed ? '종료일' : '마감일'}
                {isFixed && <span className="text-[10px] text-soft ml-1">미입력 시 무기한</span>}
              </span>
              <input
                type="date"
                value={draft.end}
                onChange={e => setDraft(prev => ({ ...prev, end: e.target.value }))}
                disabled={requestLocked || !canEdit}
                className={`h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue ${(requestLocked || !canEdit) ? 'opacity-50 cursor-default' : ''}`}
              />
            </label>
          </div>

          {/* Recurring days for 고정 */}
          {isFixed && (
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">반복 요일</span>
              <div className="flex gap-1.5 mt-1">
                {DAY_LABELS.map((lbl, idx) => {
                  const dn = idx + 1
                  const active = (draft.recurringDays || []).includes(dn)
                  return (
                    <button
                      key={dn}
                      type="button"
                      onClick={() => toggleDay(dn)}
                      disabled={!canEdit}
                      className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${canEdit ? 'cursor-pointer' : 'cursor-default'}
                        ${active ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:bg-line'}`}
                    >
                      {lbl}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">설명</span>
            <textarea
              value={draft.description}
              onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
              placeholder="업무 설명을 입력하세요"
              rows={4}
              disabled={!canEdit}
              className={`px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none leading-[1.6] ${!canEdit ? 'opacity-50 cursor-default' : ''}`}
            />
          </label>

          {/* 프로세스 단계별 참여자 */}
          {proc && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-text-primary">
                참여자{canEditAssignees && <span className="text-[11px] font-normal text-blue ml-1.5">담당자 배치 수정 가능</span>}
              </span>
              <span className="text-[11px] text-muted">
                {(showAllSteps || canEditAssignees) ? `전체 ${proc.steps.length}개 단계` : `내 담당 (${mySteps.length}개)`}
              </span>
              <div className="flex flex-col gap-1.5">
                {stepsToRender.length === 0 ? (
                  <span className="text-[12px] text-soft py-1">담당한 단계가 없습니다.</span>
                ) : (
                  stepsToRender.map(step => {
                    const assignees = stepAssignees[step.id] || []
                    const isMyStep = assignees.includes(myName)
                    const stepDelayed = assignees.some(name => isPersonDelayed(step.id, name))
                    return (
                      <div
                        key={step.id}
                        className={`flex flex-col gap-1 px-2.5 py-2 rounded-lg border ${stepDelayed ? 'border-red/40 bg-red-soft/30' : 'border-line-soft bg-surface-muted'}`}
                      >
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-[12px] ${isMyStep ? 'font-semibold text-blue' : 'text-text-sub'}`}>
                            {step.title}
                          </span>
                          {stepDeadline(step.id) && (
                            <span className="text-[11px] font-semibold text-muted shrink-0" title="단계 데드라인">{fmtDeadline(stepDeadline(step.id))}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {assignees.length === 0 && !canEditAssignees && (
                            <span className="text-[11px] text-soft">미배정</span>
                          )}
                          {assignees.map(name => {
                            const personDelayed = isPersonDelayed(step.id, name)
                            return (
                              <div key={name} className={`flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full text-[11px] ${personDelayed ? 'bg-red-soft text-red' : 'bg-white border border-line text-text-sub'}`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-semibold ${personDelayed ? 'bg-red' : 'bg-blue'}`}>{name[0]}</div>
                                <span>{name}</span>
                                {canEditAssignees && (
                                  <button
                                    type="button"
                                    onClick={() => removeAssignee(step.id, name)}
                                    className="ml-0.5 text-soft hover:text-red cursor-pointer leading-none text-[13px]"
                                    title="배치 해제"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            )
                          })}
                          {canEditAssignees && (
                            <select
                              value=""
                              onChange={e => { addAssignee(step.id, e.target.value); e.target.value = '' }}
                              className="text-[11px] border border-dashed border-blue/50 rounded-full px-2 py-0.5 bg-white text-blue cursor-pointer outline-none"
                            >
                              <option value="">+ 추가</option>
                              {teamMembers.filter(m => !assignees.includes(m.name)).map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {!canEditAssignees && (
                <button
                  type="button"
                  onClick={() => setShowAllSteps(v => !v)}
                  className="self-start text-[12px] text-blue hover:underline cursor-pointer"
                >
                  {showAllSteps ? '내 담당만 보기' : `전체 ${proc.steps.length}개 단계 보기`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Save button — 수정 권한 있을 때만 (직원은 조회 전용) */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-line">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`w-full h-10 text-[13px] font-semibold rounded-lg transition-all cursor-pointer
                ${isDirty ? 'bg-blue text-white hover:opacity-90' : 'bg-line text-soft cursor-not-allowed'}`}
            >
              저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
