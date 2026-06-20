import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { TODAY_ISO, fmtDeadline } from '../data/helpers'
import { currentUser } from '../data/state'
import ConfirmModal from './ConfirmModal'

function formatTimeInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function isValidTime(val) {
  if (!val) return true
  const m = val.match(/^(\d{2}):(\d{2})$/)
  if (!m) return false
  return parseInt(m[1], 10) <= 23 && parseInt(m[2], 10) <= 59
}

function toMin(t) {
  if (!t) return -1
  const [h, m] = t.split(':').map(Number)
  return isNaN(h) || isNaN(m) ? -1 : h * 60 + m
}

export default function DailyTodo({
  viewDate: externalViewDate, onViewDateChange,
  workItems, sessions,
  onToggleSession, onUpdateSession, onDeleteSession, onCloneSession, onAddSession,
  addingSessionForItem, onClearAddingSession,
}) {
  const [internalViewDate, setInternalViewDate] = useState(TODAY_ISO)
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editingTitleVal, setEditingTitleVal] = useState('')
  const [isNewSession, setIsNewSession] = useState(false)
  const [editingTimeId, setEditingTimeId] = useState(null)
  const [editingTimeField, setEditingTimeField] = useState(null)
  const [addingTitle, setAddingTitle] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [timeError, setTimeError] = useState(null)
  const titleInputRef = useRef(null)
  const addInputRef = useRef(null)

  const viewDate = externalViewDate ?? internalViewDate
  const setViewDate = (d) => {
    setInternalViewDate(d)
    onViewDateChange?.(d)
  }

  const viewWeekday = new Date(viewDate + 'T00:00:00').getDay()

  const viewItems = useMemo(() => {
    const items = workItems.filter(item => {
      if (item.type === '고정') {
        const rd = item.recurringDays || [1,2,3,4,5]
        return rd.includes(viewWeekday) && item.start <= viewDate && (item.end === null || item.end >= viewDate)
      }
      return item.start <= viewDate && item.end >= viewDate
    })
    // 지연 업무: 종료일 지났지만 미완료 세션 있는 업무 (오늘 보기만)
    if (viewDate === TODAY_ISO) {
      workItems.forEach(item => {
        if (item.type === '고정') return
        if (items.some(v => v.id === item.id)) return
        if (!item.end || item.end >= TODAY_ISO) return
        const hasUndone = sessions.some(s => s.workItemId === item.id && s.authorId === currentUser.id && !s.done)
        if (hasUndone) items.push(item)
      })
    }
    return items
  }, [viewDate, viewWeekday, workItems, sessions])

  const daySessions = useMemo(() => {
    const result = []
    viewItems.forEach(item => {
      const delayed = item.type !== '고정' && item.end && item.end < TODAY_ISO
      if (delayed && viewDate === TODAY_ISO) {
        result.push(...sessions.filter(s => s.workItemId === item.id && s.authorId === currentUser.id && !s.done))
      } else {
        result.push(...sessions.filter(s => s.date === viewDate && s.authorId === currentUser.id && s.workItemId === item.id))
      }
    })
    result.sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0
      if (!a.startTime) return 1
      if (!b.startTime) return -1
      return a.startTime.localeCompare(b.startTime)
    })
    return result
  }, [viewDate, viewItems, sessions])

  const done = daySessions.filter(s => s.done).length
  const total = daySessions.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const headerLabel = viewDate === TODAY_ISO
    ? '오늘 할 일'
    : (() => {
        const d = new Date(viewDate + 'T00:00:00')
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} (${dayNames[d.getDay()]}) 할 일`
      })()

  // --- Title editing ---
  const startEditTitle = (s, isNew = false) => {
    setEditingTitleId(s.id)
    setEditingTitleVal(s.title)
    setIsNewSession(isNew)
  }

  const commitTitle = useCallback(() => {
    if (!editingTitleId) return
    if (editingTitleVal.trim()) {
      onUpdateSession(editingTitleId, { title: editingTitleVal.trim() })
    } else if (isNewSession) {
      onDeleteSession(editingTitleId)
    }
    setEditingTitleId(null)
    setIsNewSession(false)
  }, [editingTitleId, editingTitleVal, isNewSession, onUpdateSession, onDeleteSession])

  const cancelTitle = useCallback(() => {
    if (isNewSession && editingTitleId) {
      onDeleteSession(editingTitleId)
    }
    setEditingTitleId(null)
    setIsNewSession(false)
  }, [isNewSession, editingTitleId, onDeleteSession])

  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitleId])

  // --- Clone with auto-edit ---
  const handleClone = (sessionId) => {
    const newId = onCloneSession(sessionId)
    if (newId) {
      const src = sessions.find(s => s.id === sessionId)
      if (src) {
        setTimeout(() => {
          setEditingTitleId(newId)
          setEditingTitleVal(src.title)
          setIsNewSession(true)
        }, 50)
      }
    }
  }

  // --- Time validation ---
  const isPastTime = (session, timeStr) => {
    if (!timeStr || session.date !== TODAY_ISO) return true
    const now = new Date()
    const min = toMin(timeStr)
    if (min < 0) return false
    return min <= now.getHours() * 60 + now.getMinutes()
  }

  const isStartInExistingSession = (session, startTime) => {
    const s0 = toMin(startTime)
    if (s0 < 0) return false
    return sessions.some(other => {
      if (other.id === session.id || other.date !== session.date) return false
      const s1 = toMin(other.startTime), e1 = toMin(other.endTime)
      if (s1 < 0 || e1 < 0) return false
      return s0 >= s1 && s0 < e1
    })
  }

  const hasOverlap = (session, newStart, newEnd) => {
    const s0 = toMin(newStart), e0 = toMin(newEnd)
    if (s0 < 0 || e0 < 0) return false
    if (s0 >= e0) return true
    return sessions.some(other => {
      if (other.id === session.id || other.date !== session.date) return false
      const s1 = toMin(other.startTime), e1 = toMin(other.endTime)
      if (s1 < 0 || e1 < 0) return false
      return s0 < e1 && e0 > s1
    })
  }

  const showTimeError = (msg) => {
    setTimeError(msg)
    setTimeout(() => setTimeError(null), 2000)
  }

  const startEditTime = (sessionId, field) => {
    setEditingTimeId(sessionId)
    setEditingTimeField(field)
  }

  const commitTime = (sessionId, field, value) => {
    const formatted = formatTimeInput(value)
    if (!formatted) {
      onUpdateSession(sessionId, { [field]: '' })
      setEditingTimeId(null)
      setEditingTimeField(null)
      return
    }
    if (!isValidTime(formatted)) {
      showTimeError('올바른 시간 형식이 아닙니다')
      setEditingTimeId(null)
      setEditingTimeField(null)
      return
    }
    const s = sessions.find(x => x.id === sessionId)
    if (!s) return

    // Future time check
    if (!isPastTime(s, formatted)) {
      showTimeError('현재 시각 이후는 입력할 수 없습니다')
      setEditingTimeId(null)
      setEditingTimeField(null)
      return
    }

    // Overlap check
    if (field === 'startTime') {
      if (isStartInExistingSession(s, formatted)) {
        showTimeError('다른 세션과 시간이 겹칩니다')
        setEditingTimeId(null)
        setEditingTimeField(null)
        return
      }
      if (s.endTime && hasOverlap(s, formatted, s.endTime)) {
        showTimeError('다른 세션과 시간이 겹칩니다')
        setEditingTimeId(null)
        setEditingTimeField(null)
        return
      }
    } else {
      if (s.startTime && hasOverlap(s, s.startTime, formatted)) {
        showTimeError('다른 세션과 시간이 겹칩니다')
        setEditingTimeId(null)
        setEditingTimeField(null)
        return
      }
    }

    onUpdateSession(sessionId, { [field]: formatted })
    setEditingTimeId(null)
    setEditingTimeField(null)
  }

  // --- Inline add session ---
  const isAdding = addingSessionForItem !== null

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus()
    }
  }, [isAdding])

  const commitAdd = () => {
    if (addingSessionForItem && addingTitle.trim()) {
      onAddSession(addingSessionForItem.workItemId, addingSessionForItem.date, addingTitle.trim())
    }
    setAddingTitle('')
    onClearAddingSession?.()
  }

  const cancelAdd = () => {
    setAddingTitle('')
    onClearAddingSession?.()
  }

  return (
    <div className="bg-surface border border-line rounded-[14px] flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[15px] pb-[13px] border-b border-line-soft">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-[-0.02em]">{headerLabel}</h2>
        <input
          type="date"
          value={viewDate}
          onChange={e => setViewDate(e.target.value)}
          className="text-[11px] text-muted bg-transparent border border-line rounded-md px-2 py-1 outline-none focus:border-blue cursor-pointer"
        />
      </div>

      {/* Time error toast */}
      {timeError && (
        <div className="mx-3.5 mt-2 px-3 py-2 bg-red-soft text-red text-[12px] font-semibold rounded-lg animate-pulse">
          {timeError}
        </div>
      )}

      {/* Session list */}
      <div className="flex-1 overflow-y-auto grid gap-3 p-[10px_14px_10px] content-start">
        {/* Inline add at top */}
        {isAdding && (
          <div className="flex flex-col gap-1.5 p-[10px_12px] border border-blue border-dashed rounded-lg bg-blue-soft/30">
            <span className="text-[11px] text-blue font-medium truncate">
              {workItems.find(w => w.id === addingSessionForItem?.workItemId)?.title}
            </span>
            <div className="flex items-center gap-2">
              <input
                ref={addInputRef}
                value={addingTitle}
                onChange={e => setAddingTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitAdd()
                  if (e.key === 'Escape') cancelAdd()
                }}
                onBlur={() => { addingTitle.trim() ? commitAdd() : cancelAdd() }}
                placeholder="세부 업무항목 입력 후 Enter"
                className="flex-1 text-[13px] font-medium text-text-primary bg-transparent outline-none placeholder:text-muted"
              />
            </div>
          </div>
        )}

        {daySessions.length === 0 && !isAdding ? (
          <div className="px-4 py-8 text-center text-xs text-muted">해당하는 업무가 없습니다.</div>
        ) : (
          daySessions.map(s => {
            const isDone = s.done
            const wi = workItems.find(w => w.id === s.workItemId)
            // 데드라인은 단일 기준으로 파생: 단계 데드라인 → 세션 데드라인 → 업무 마감일(고정 업무는 없음)
            const effectiveDeadline = wi?.stepDeadlines?.[s.stepId]
              ?? s.deadline
              ?? (wi && wi.type !== '고정' ? (wi.end || null) : null)
            const isEditingTitle = editingTitleId === s.id
            const isEditingStart = editingTimeId === s.id && editingTimeField === 'startTime'
            const isEditingEnd = editingTimeId === s.id && editingTimeField === 'endTime'
            const isDelayed = wi && wi.type !== '고정' && wi.end && wi.end < TODAY_ISO

            return (
              <div key={s.id} className={`flex items-start gap-2.5 p-[10px_12px] border rounded-lg bg-white hover:border-[#d0d0d8] hover:shadow-xs transition-all group ${isDelayed ? 'border-red/30' : 'border-line'}`}>
                {/* Checkbox */}
                <button
                  onClick={() => onToggleSession(s.id)}
                  className={`mt-0.5 w-[20px] h-[20px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer
                    ${isDone ? 'bg-blue border-blue' : 'border-line hover:border-blue hover:scale-105'}`}
                >
                  {isDone && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  {wi && (
                    <span className="text-[11px] text-muted block mb-0.5 truncate">
                      {wi.title}
                      {isDelayed && <span className="inline-flex items-center h-[14px] px-[4px] rounded bg-red-soft text-red text-[9px] font-semibold ml-1">지연중</span>}
                    </span>
                  )}
                  {isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      value={editingTitleVal}
                      onChange={e => setEditingTitleVal(e.target.value)}
                      onBlur={cancelTitle}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); commitTitle() }
                        if (e.key === 'Escape') { e.preventDefault(); cancelTitle() }
                      }}
                      className="text-[13px] font-medium text-text-primary w-full outline-none border-b border-blue bg-transparent py-0.5 tracking-[-0.01em]"
                    />
                  ) : (
                    <span className="flex items-baseline gap-1.5 flex-wrap">
                      <span
                        onDoubleClick={() => startEditTitle(s)}
                        className={`text-[13px] font-medium leading-[1.35] tracking-[-0.01em] cursor-text ${isDone ? 'line-through text-soft' : 'text-text-primary'}`}
                      >
                        {s.title}
                      </span>
                      {effectiveDeadline ? (
                        <span className="text-[11px] font-semibold text-muted shrink-0" title="데드라인">{fmtDeadline(effectiveDeadline)}</span>
                      ) : (
                        <span className="text-[11px] text-soft shrink-0" title="마감일 없음">마감 없음</span>
                      )}
                    </span>
                  )}
                  {/* Time inputs */}
                  <div className="flex items-center gap-1 mt-1">
                    {isEditingStart ? (
                      <TimeInput
                        defaultValue={s.startTime}
                        onCommit={(val) => commitTime(s.id, 'startTime', val)}
                        onCancel={() => { setEditingTimeId(null); setEditingTimeField(null) }}
                        onTab={() => { commitTime(s.id, 'startTime', ''); startEditTime(s.id, 'endTime') }}
                        sessions={sessions}
                        session={s}
                        field="startTime"
                        onError={showTimeError}
                        isStartInExistingSession={isStartInExistingSession}
                      />
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={s.startTime || ''}
                        placeholder="00:00"
                        onDoubleClick={() => startEditTime(s.id, 'startTime')}
                        className="w-16 h-6 text-center text-[11px] text-muted font-mono tabular-nums bg-transparent border-transparent rounded outline-none cursor-pointer hover:border-line hover:bg-surface-muted transition-colors"
                      />
                    )}
                    <span className="text-[11px] text-soft">~</span>
                    {isEditingEnd ? (
                      <TimeInput
                        defaultValue={s.endTime}
                        onCommit={(val) => commitTime(s.id, 'endTime', val)}
                        onCancel={() => { setEditingTimeId(null); setEditingTimeField(null) }}
                      />
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={s.endTime || ''}
                        placeholder="00:00"
                        onDoubleClick={() => startEditTime(s.id, 'endTime')}
                        className="w-16 h-6 text-center text-[11px] text-muted font-mono tabular-nums bg-transparent border-transparent rounded outline-none cursor-pointer hover:border-line hover:bg-surface-muted transition-colors"
                      />
                    )}
                  </div>
                </div>
                {/* Hover actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                  <button
                    onClick={() => handleClone(s.id)}
                    className="h-6 px-1.5 border border-line rounded-md bg-white text-muted text-[14px] font-semibold hover:border-[#d0d0d8] hover:text-text-primary transition-colors cursor-pointer"
                    title="복제"
                  >+</button>
                  <button
                    onClick={() => setDeleteConfirm(s.id)}
                    className="h-6 px-2 border border-line rounded-md bg-white text-muted text-[11px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer whitespace-nowrap"
                  >삭제</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="flex items-center gap-2.5 px-[18px] py-[12px] border-t border-line-soft">
          <div className="flex-1 h-1 bg-line rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue to-purple rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11.5px] text-muted whitespace-nowrap">{done}/{total} 완료</span>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmModal
          title="작업세션 삭제"
          message="삭제된 작업세션은 복구할 수 없습니다."
          onConfirm={() => { onDeleteSession(deleteConfirm); setDeleteConfirm(null) }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}

function TimeInput({ defaultValue, onCommit, onCancel, onTab, sessions, session, field, onError, isStartInExistingSession }) {
  const [val, setVal] = useState(defaultValue || '')
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [])

  const handleChange = (e) => {
    const formatted = formatTimeInput(e.target.value)
    setVal(formatted)

    // Real-time overlap check for start time
    if (field === 'startTime' && formatted.length === 5 && session && isStartInExistingSession) {
      if (isStartInExistingSession(session, formatted)) {
        onError?.('다른 세션과 시간이 겹칩니다')
      }
    }
  }

  return (
    <input
      ref={ref}
      type="text"
      value={val}
      onChange={handleChange}
      onBlur={() => onCommit(val)}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); onCommit(val) }
        if (e.key === 'Escape') { e.preventDefault(); onCancel() }
        if (e.key === 'Tab' && onTab) {
          e.preventDefault()
          onCommit(val)
          onTab()
        }
      }}
      placeholder="00:00"
      maxLength={5}
      className="w-16 h-6 text-center text-[11px] text-text-primary font-mono tabular-nums bg-white border border-blue rounded outline-none"
    />
  )
}
