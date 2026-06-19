import { useState, useEffect } from 'react'

const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16']

function memberColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

export default function AssignModal({ request, teamMembers, onClose, onSubmit }) {
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!request) return
    setSelected([...(request.assignees || [])])
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request, onClose])

  if (!request) return null

  const availableMembers = (teamMembers || []).filter(m => !m.onLeave)

  function toggle(name) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selected.length) return
    onSubmit({ requestId: request.id, assignees: selected })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[460px] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">담당자 배정</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>

        {/* Request info */}
        <div className="bg-surface-muted border border-line rounded-[10px] p-3.5 flex flex-col gap-1.5">
          <div className="text-[14px] font-bold text-text-primary">{request.title}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
            <span>요청팀 · <strong className="text-text-primary">{request.team}</strong></span>
            <span>예상시간 · <strong className="text-text-primary">{request.hours}h</strong></span>
            <span>마감일 · <strong className="text-text-primary">{request.deadline}</strong></span>
            <span>우선순위 · <strong className={request.priority === '긴급' ? 'text-red' : 'text-muted'}>{request.priority}</strong></span>
          </div>
        </div>

        {/* Selected avatars */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selected.map(name => {
              const idx = (teamMembers || []).findIndex(m => m.name === name)
              return (
                <div key={name} className="relative group" title={name}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold"
                    style={{ background: memberColor(idx >= 0 ? idx : 0) }}>
                    {name[0]}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(name)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6b7280] text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >✕</button>
                  <span className="text-[10px] text-muted text-center block mt-0.5">{name}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Member list */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
            {availableMembers.length === 0 && (
              <div className="text-[12px] text-muted text-center py-4">팀원이 없습니다</div>
            )}
            {availableMembers.map((m, i) => {
              const idx = (teamMembers || []).indexOf(m)
              const checked = selected.includes(m.name)
              return (
                <div
                  key={m.id}
                  onClick={() => toggle(m.name)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer transition-colors ${checked ? 'bg-blue/5 border border-blue/30' : 'hover:bg-surface-muted border border-transparent'}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
                    style={{ background: memberColor(idx >= 0 ? idx : i) }}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text-primary">{m.name}</div>
                    <div className="text-[11px] text-muted">{m.role}</div>
                  </div>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue border-blue' : 'border-[#d1d5db]'}`}>
                    {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer"
            >취소</button>
            <button
              type="submit"
              disabled={selected.length === 0}
              className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >배정 완료</button>
          </div>
        </form>
      </div>
    </div>
  )
}
