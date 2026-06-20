import { useState, useEffect } from 'react'
import { MONDAY_ISO, addDays, DAY_SHORTS } from '../data/helpers'

const TASK_TYPES = ['일반', '긴급', '고정']
const DAY_OPTS = [
  { label: '월', value: 1 },
  { label: '화', value: 2 },
  { label: '수', value: 3 },
  { label: '목', value: 4 },
  { label: '금', value: 5 },
]

function emptyTask(date) {
  return { id: `tmp-${Date.now()}-${Math.random()}`, title: '', type: '일반', start: date, end: date, recurringDays: [1,2,3,4,5] }
}

export default function TaskDrawer({ open, weekOffset, sessions = [], workItems = [], onClose, onSave }) {
  const weekStart = addDays(MONDAY_ISO, weekOffset * 7)
  const days = [0,1,2,3,4,5,6].map(i => ({
    date: addDays(weekStart, i),
    label: DAY_SHORTS[i],
  }))

  const [activeDay, setActiveDay] = useState(days[0].date)
  const [tasks, setTasks] = useState({})
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setActiveDay(days[0].date)
      setTasks({})
      requestAnimationFrame(() => setIsOpen(true))
    } else {
      setIsOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 200)
  }

  const dayTasks = tasks[activeDay] || []

  const addTask = () => {
    setTasks(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), emptyTask(activeDay)],
    }))
  }

  const updateTask = (tmpId, field, value) => {
    setTasks(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).map(t => t.id === tmpId ? { ...t, [field]: value } : t),
    }))
  }

  const removeTask = (tmpId) => {
    setTasks(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).filter(t => t.id !== tmpId),
    }))
  }

  const toggleRecurringDay = (tmpId, dn) => {
    setTasks(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).map(t => {
        if (t.id !== tmpId) return t
        const rd = t.recurringDays || [1,2,3,4,5]
        if (rd.includes(dn)) {
          if (rd.length <= 1) return t
          return { ...t, recurringDays: rd.filter(d => d !== dn) }
        }
        return { ...t, recurringDays: [...rd, dn].sort() }
      }),
    }))
  }

  const saveTask = (t) => {
    onSave({
      id: `wi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: t.title.trim(),
      type: t.type,
      start: t.start,
      end: t.type === '고정' ? null : t.end,
      participants: ['Jihye'],
      ...(t.type === '고정' && { recurringDays: t.recurringDays }),
    })
  }

  const registerTask = (tmpId) => {
    const t = (tasks[activeDay] || []).find(t => t.id === tmpId)
    if (!t || !t.title.trim()) return
    saveTask(t)
    removeTask(tmpId)
  }

  const handleSave = () => {
    const allTasks = Object.values(tasks).flat().filter(t => t.title.trim())
    allTasks.forEach(saveTask)
    handleClose()
  }

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[480px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-[15px] font-semibold">업무 추가</h3>
          <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2">
          {days.map(d => (
            <button
              key={d.date}
              onClick={() => setActiveDay(d.date)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg cursor-pointer transition-colors
                ${activeDay === d.date ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:bg-line'}`}
            >
              {d.label} {d.date.slice(8)}
            </button>
          ))}
        </div>

        {/* 당일 기존 업무 */}
        {(() => {
          const weekday = (new Date(activeDay).getDay() + 6) % 7 + 1
          const typeOrder = { '고정': 0, '긴급': 1 }
          const dayItems = workItems.filter(item => {
            if (item.type === '고정') {
              const rd = item.recurringDays || [1,2,3,4,5]
              return rd.includes(weekday) && item.start <= activeDay && (item.end === null || item.end >= activeDay)
            }
            return item.start <= activeDay && item.end >= activeDay
          }).sort((a, b) => (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2))
          if (!dayItems.length) return null
          return (
            <div className="px-6 pb-2">
              <div className="bg-surface-muted rounded-[10px] p-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-muted mb-0.5">이날 배정된 업무 ({dayItems.length}건)</span>
                {dayItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-[12px]">
                    {item.type === '고정' ? (
                      <svg className="w-[13px] h-[13px] text-[#6b7280] shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                      </svg>
                    ) : (
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.type === '긴급' ? 'bg-red' : item.type === '회의' ? 'bg-orange' : 'bg-soft'}`} />
                    )}
                    <span className="text-text-primary truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-3">
          {dayTasks.map(t => (
            <div key={t.id} className="border border-line rounded-lg p-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <input
                  value={t.title}
                  onChange={e => updateTask(t.id, 'title', e.target.value)}
                  placeholder="업무명 입력"
                  className="flex-1 h-8 px-2.5 text-[13px] border border-line rounded-md outline-none focus:border-blue"
                />
                <button
                  onClick={() => removeTask(t.id)}
                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-red cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={t.type}
                  onChange={e => updateTask(t.id, 'type', e.target.value)}
                  className="h-7 px-2 text-[12px] border border-line rounded-md outline-none focus:border-blue bg-white"
                >
                  {TASK_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
                {t.type !== '고정' && (
                  <>
                    <input
                      type="date"
                      value={t.start}
                      onChange={e => updateTask(t.id, 'start', e.target.value)}
                      className="h-7 px-2 text-[12px] border border-line rounded-md outline-none focus:border-blue"
                    />
                    <span className="text-[11px] text-soft">~</span>
                    <input
                      type="date"
                      value={t.end}
                      onChange={e => updateTask(t.id, 'end', e.target.value)}
                      className="h-7 px-2 text-[12px] border border-line rounded-md outline-none focus:border-blue"
                    />
                  </>
                )}
              </div>
              {t.type === '고정' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted mr-1">반복:</span>
                  {DAY_OPTS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleRecurringDay(t.id, d.value)}
                      className={`w-6 h-6 rounded text-[11px] font-semibold cursor-pointer transition-colors
                        ${(t.recurringDays || []).includes(d.value) ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:bg-line'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => registerTask(t.id)}
                disabled={!t.title.trim()}
                className={`h-8 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer
                  ${t.title.trim() ? 'bg-blue text-white hover:opacity-90' : 'bg-line text-soft cursor-not-allowed'}`}
              >
                등록
              </button>
            </div>
          ))}

          <button
            onClick={addTask}
            className="h-9 border border-dashed border-line rounded-lg text-[13px] text-muted hover:border-blue hover:text-blue transition-colors cursor-pointer"
          >
            + 업무 추가
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line grid grid-cols-2 gap-2">
          <button
            onClick={handleClose}
            className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
