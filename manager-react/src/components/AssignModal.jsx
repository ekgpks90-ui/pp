import { useState, useEffect, useRef } from 'react'

const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16']

function memberColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

function Avatar({ name, idx, size = 6 }) {
  return (
    <span
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      style={{ background: memberColor(idx >= 0 ? idx : 0), fontSize: size === 6 ? 11 : 10 }}
      title={name}
    >
      {name[0]}
    </span>
  )
}

export default function AssignModal({ request, teamMembers, processes, onClose, onSubmit }) {
  const [selectedProcessId, setSelectedProcessId] = useState(request?.processId || processes?.[0]?.id || '')

  const selectedProcess = processes?.find(p => p.id === selectedProcessId)
  const steps = selectedProcess?.steps || []

  const initStepAssignees = (proc) => {
    const sa = {}
    const s = proc?.steps || []
    s.forEach(step => { sa[step.id] = [...(request?.stepAssignees?.[step.id] || [])] })
    return sa
  }

  const [stepAssignees, setStepAssignees] = useState(() => initStepAssignees(selectedProcess))
  const [openStepId, setOpenStepId] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!request) return
    const proc = processes?.find(p => p.id === (request?.processId || processes?.[0]?.id))
    setSelectedProcessId(proc?.id || '')
    setStepAssignees(initStepAssignees(proc))
    setOpenStepId(null)
    const onKey = (e) => { if (e.key === 'Escape') { setOpenStepId(null); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request])

  const handleProcessChange = (newId) => {
    setSelectedProcessId(newId)
    const proc = processes?.find(p => p.id === newId)
    setStepAssignees(initStepAssignees(proc))
    setOpenStepId(null)
  }

  useEffect(() => {
    if (!openStepId) return
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpenStepId(null)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [openStepId])

  if (!request) return null

  const availableMembers = (teamMembers || []).filter(m => !m.onLeave)

  function toggleMember(stepId, name) {
    setStepAssignees(prev => {
      const curr = prev[stepId] || []
      return {
        ...prev,
        [stepId]: curr.includes(name) ? curr.filter(n => n !== name) : [...curr, name]
      }
    })
  }

  function removeMember(stepId, name) {
    setStepAssignees(prev => ({
      ...prev,
      [stepId]: (prev[stepId] || []).filter(n => n !== name)
    }))
  }

  const allAssignees = [...new Set(Object.values(stepAssignees).flat())]
  const hasAny = allAssignees.length > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!hasAny) return
    onSubmit({
      requestId: request.id,
      processId: selectedProcessId,
      assignees: allAssignees,
      stepAssignees,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-[14px] shadow-lg w-[520px] max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-line flex items-center justify-between shrink-0">
          <h3 className="text-[15px] font-semibold">담당자 배정</h3>
          <button onClick={onClose} className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-muted cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Request info */}
          <div className="bg-surface-muted border border-line rounded-[10px] px-4 py-3 flex flex-col gap-1.5">
            <div className="text-[14px] font-bold text-text-primary">{request.title}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-muted">
              <span>요청팀 · <strong className="text-text-primary">{request.team}</strong></span>
<span>마감일 · <strong className="text-text-primary">{request.deadline}</strong></span>
              <span>우선순위 · <strong className={request.priority === '긴급' ? 'text-red' : 'text-muted'}>{request.priority}</strong></span>
            </div>
          </div>

          {/* Process selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted shrink-0">프로세스</span>
            <select
              value={selectedProcessId}
              onChange={e => handleProcessChange(e.target.value)}
              className="flex-1 text-[12px] font-medium text-text-primary border border-line rounded-[6px] px-2 py-1 bg-white outline-none focus:border-blue cursor-pointer"
            >
              {(processes || []).length === 0 && (
                <option value="">등록된 프로세스 없음</option>
              )}
              {(processes || []).map(p => (
                <option key={p.id} value={p.id}>{p.category}</option>
              ))}
            </select>
          </div>

          {/* Steps */}
          {steps.length === 0 ? (
            <div className="text-[13px] text-muted text-center py-6">연결된 프로세스 단계가 없습니다.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {steps.map((step, si) => {
                const assigned = stepAssignees[step.id] || []
                const rejectedNames = request.status === '재배정' ? (request.rejectedStepAssignees?.[step.id] || []) : []
                const isOpen = openStepId === step.id
                return (
                  <div key={step.id} className="relative">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] border transition-colors ${rejectedNames.length > 0 ? 'border-red/20 bg-red/5' : isOpen ? 'border-blue/40 bg-blue/5' : 'border-transparent hover:bg-surface-muted'}`}>
                      {/* Step number */}
                      <span className="w-5 h-5 rounded-full bg-line text-[10px] font-bold text-muted flex items-center justify-center shrink-0">
                        {si + 1}
                      </span>
                      {/* Step title + rejected names */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] text-text-primary">{step.title}</span>
                        {rejectedNames.length > 0 && (
                          <div className="text-[11px] text-red mt-0.5">거절: {rejectedNames.join(', ')}</div>
                        )}
                      </div>
                      {/* Assigned avatars */}
                      <div className="flex items-center">
                        {assigned.map((name, ai) => {
                          const mIdx = (teamMembers || []).findIndex(m => m.name === name)
                          return (
                            <div key={name} className="relative group" style={{ marginLeft: ai > 0 ? -6 : 0 }}>
                              <Avatar name={name} idx={mIdx} size={6} />
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removeMember(step.id, name) }}
                                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6b7280] text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                              >✕</button>
                            </div>
                          )
                        })}
                      </div>
                      {/* Add button */}
                      <button
                        type="button"
                        onClick={() => setOpenStepId(isOpen ? null : step.id)}
                        className="w-6 h-6 rounded-full border border-line bg-white flex items-center justify-center text-muted hover:border-blue hover:text-blue transition-colors cursor-pointer shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>

                    {/* Member picker dropdown */}
                    {isOpen && (
                      <div
                        ref={panelRef}
                        className="absolute right-0 top-[calc(100%+4px)] z-20 bg-white border border-line rounded-[10px] shadow-lg w-[220px] py-1 max-h-[200px] overflow-y-auto"
                      >
                        {availableMembers.length === 0 && (
                          <div className="px-3 py-3 text-[12px] text-muted text-center">팀원이 없습니다</div>
                        )}
                        {availableMembers.map((m, i) => {
                          const mIdx = (teamMembers || []).indexOf(m)
                          const checked = assigned.includes(m.name)
                          return (
                            <div
                              key={m.id}
                              onClick={() => toggleMember(step.id, m.name)}
                              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-blue/5' : 'hover:bg-surface-muted'}`}
                            >
                              <Avatar name={m.name} idx={mIdx >= 0 ? mIdx : i} size={6} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-medium text-text-primary">{m.name}</div>
                                <div className="text-[10px] text-muted">{m.role}</div>
                              </div>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue border-blue' : 'border-[#d1d5db]'}`}>
                                {checked && (
                                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Total assignees summary */}
          {hasAny && (
            <div className="flex items-center gap-2 pt-1 border-t border-line">
              <span className="text-[12px] text-muted shrink-0">총 배정 인원</span>
              <div className="flex items-center gap-1 flex-wrap">
                {allAssignees.map(name => {
                  const mIdx = (teamMembers || []).findIndex(m => m.name === name)
                  return (
                    <div key={name} className="flex items-center gap-1 bg-surface-muted rounded-full pl-0.5 pr-2 py-0.5">
                      <Avatar name={name} idx={mIdx} size={5} />
                      <span className="text-[11px] text-text-primary">{name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-line grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer"
          >취소</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAny}
            className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >배정 완료</button>
        </div>
      </div>
    </div>
  )
}
