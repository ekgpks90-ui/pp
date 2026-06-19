import { useState, useRef, useEffect } from 'react'

const EDIT_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const DEL_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

const PLUS_SVG = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

function AutoFocusInput({ value, onChange, onCommit, onCancel, className }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])
  return (
    <input
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); onCommit() }
        if (e.key === 'Escape') { e.preventDefault(); onCancel() }
      }}
      className={className}
    />
  )
}

export default function ProcessPage({ processes, onUpdateProcesses }) {
  const [openCats, setOpenCats] = useState(new Set())
  const [dropInfo, setDropInfo] = useState(null)

  // editingId: null | 'new-cat' | 'cat:{catId}' | 'new-step:{catId}' | 'step:{catId}:{stepId}'
  const [editingId, setEditingId] = useState(null)
  const [editingVal, setEditingVal] = useState('')

  // deleteTarget: null | { type:'cat'|'step', catId, stepId?, label }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const startEdit = (id, currentVal) => {
    setEditingId(id)
    setEditingVal(currentVal)
  }

  const commitEdit = () => {
    const val = editingVal.trim()
    if (val && editingId) {
      if (editingId === 'new-cat') {
        onUpdateProcesses(prev => [
          ...prev,
          { id: `pc-${Date.now()}`, category: val, steps: [] }
        ])
      } else if (editingId.startsWith('cat:')) {
        const catId = editingId.slice(4)
        onUpdateProcesses(prev =>
          prev.map(c => c.id === catId ? { ...c, category: val } : c)
        )
      } else if (editingId.startsWith('new-step:')) {
        const catId = editingId.slice(9)
        onUpdateProcesses(prev =>
          prev.map(c => c.id === catId
            ? { ...c, steps: [...c.steps, { id: `ps-${catId}-${Date.now()}`, title: val }] }
            : c
          )
        )
      } else if (editingId.startsWith('step:')) {
        const [, catId, stepId] = editingId.split(':')
        onUpdateProcesses(prev =>
          prev.map(c => c.id === catId
            ? { ...c, steps: c.steps.map(s => s.id === stepId ? { ...s, title: val } : s) }
            : c
          )
        )
      }
    }
    setEditingId(null)
    setEditingVal('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingVal('')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'cat') {
      onUpdateProcesses(prev => prev.filter(c => c.id !== deleteTarget.catId))
    } else {
      onUpdateProcesses(prev =>
        prev.map(c => c.id === deleteTarget.catId
          ? { ...c, steps: c.steps.filter(s => s.id !== deleteTarget.stepId) }
          : c
        )
      )
    }
    setDeleteTarget(null)
  }

  const toggleCat = (catId) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  const handleDragStart = (e, stepId, catId) => {
    e.dataTransfer.setData('stepId', stepId)
    e.dataTransfer.setData('catId', catId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, stepId, catId) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
    setDropInfo(prev =>
      prev?.stepId === stepId && prev?.position === position ? prev : { stepId, catId, position }
    )
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropInfo(null)
  }

  const handleDrop = (e, toStepId, toCatId) => {
    e.preventDefault()
    const fromStepId = e.dataTransfer.getData('stepId')
    const fromCatId = e.dataTransfer.getData('catId')
    setDropInfo(null)
    if (!fromStepId || fromStepId === toStepId || fromCatId !== toCatId) return
    if (!onUpdateProcesses) return
    const position = dropInfo?.position || 'after'
    onUpdateProcesses(prev => prev.map(cat => {
      if (cat.id !== toCatId) return cat
      const steps = [...cat.steps]
      const fi = steps.findIndex(s => s.id === fromStepId)
      let ti = steps.findIndex(s => s.id === toStepId)
      if (fi === -1 || ti === -1) return cat
      const [moved] = steps.splice(fi, 1)
      ti = steps.findIndex(s => s.id === toStepId)
      steps.splice(position === 'before' ? ti : ti + 1, 0, moved)
      return { ...cat, steps }
    }))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">프로세스 관리</h2>
        {editingId === 'new-cat' ? (
          <AutoFocusInput
            value={editingVal}
            onChange={setEditingVal}
            onCommit={commitEdit}
            onCancel={cancelEdit}
            className="h-8 px-3 rounded-[7px] border border-blue text-[13px] outline-none w-48 bg-white"
          />
        ) : (
          <button
            onClick={() => startEdit('new-cat', '')}
            className="h-8 px-3.5 rounded-[7px] bg-text-primary text-white text-[12px] font-semibold cursor-pointer hover:opacity-90 flex items-center gap-1.5"
          >
            {PLUS_SVG}
            프로세스 추가
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {processes.length === 0 ? (
          <div className="text-[14px] text-muted text-center py-[60px]">등록된 프로세스가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5 items-start">
            {processes.map(cat => {
              const isOpen = openCats.has(cat.id)
              const isEditingCat = editingId === `cat:${cat.id}`
              return (
                <div key={cat.id} className={`bg-white border-[1.5px] border-line rounded-[10px] overflow-hidden transition-shadow ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}>
                  {/* Category header */}
                  <div
                    className="w-full flex items-center gap-2 px-3.5 py-[13px] cursor-pointer hover:bg-surface-muted transition-colors group"
                    onClick={() => { if (!isEditingCat) toggleCat(cat.id) }}
                  >
                    {isEditingCat ? (
                      <AutoFocusInput
                        value={editingVal}
                        onChange={setEditingVal}
                        onCommit={commitEdit}
                        onCancel={cancelEdit}
                        className="text-[15px] font-bold text-blue bg-transparent border-b border-blue outline-none w-[130px] px-0.5"
                      />
                    ) : (
                      <span className="text-[16px] font-bold text-blue shrink-0 max-w-[120px] truncate">{cat.category}</span>
                    )}
                    <span className="text-[11px] font-bold text-white bg-blue min-w-[22px] h-[22px] px-1.5 rounded-full inline-flex items-center justify-center shrink-0">{cat.steps.length}</span>
                    <span className="flex-1" />
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-surface-muted hover:text-text-primary cursor-pointer"
                        title="수정"
                        onClick={() => startEdit(`cat:${cat.id}`, cat.category)}
                      >
                        {EDIT_SVG}
                      </button>
                      <button
                        className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-red/5 hover:text-red cursor-pointer"
                        title="삭제"
                        onClick={() => setDeleteTarget({ type: 'cat', catId: cat.id, label: cat.category })}
                      >
                        {DEL_SVG}
                      </button>
                    </div>
                    <svg
                      className={`w-4 h-4 text-muted transition-transform shrink-0 ml-0.5 ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Category body */}
                  {isOpen && (
                    <div className="border-t border-line flex flex-col" style={{ maxHeight: 280, overflowY: 'auto' }}>
                      <div className="flex flex-col">
                        {cat.steps.map((step, idx) => {
                          const isBefore = dropInfo?.stepId === step.id && dropInfo?.catId === cat.id && dropInfo?.position === 'before'
                          const isAfter  = dropInfo?.stepId === step.id && dropInfo?.catId === cat.id && dropInfo?.position === 'after'
                          const isEditingStep = editingId === `step:${cat.id}:${step.id}`
                          return (
                            <div key={step.id} className="relative">
                              {isBefore && <div className="absolute top-0 left-2 right-2 h-[2px] bg-blue/40 rounded-full z-10 pointer-events-none" />}
                              <div
                                className="flex items-center gap-2.5 px-3.5 py-[9px] border-b border-line/50 last:border-b-0 hover:bg-surface-muted cursor-grab active:cursor-grabbing group/step"
                                draggable={!isEditingStep}
                                onDragStart={e => handleDragStart(e, step.id, cat.id)}
                                onDragOver={e => handleDragOver(e, step.id, cat.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, step.id, cat.id)}
                              >
                                <span className="text-[13px] text-muted font-mono w-[18px] text-right shrink-0">
                                  {String(idx + 1).padStart(2, '0')}.
                                </span>
                                {isEditingStep ? (
                                  <AutoFocusInput
                                    value={editingVal}
                                    onChange={setEditingVal}
                                    onCommit={commitEdit}
                                    onCancel={cancelEdit}
                                    className="text-[14px] text-text-primary bg-transparent border-b border-text-primary outline-none flex-1 px-0.5"
                                  />
                                ) : (
                                  <span className="text-[14px] text-text-primary flex-1">{step.title}</span>
                                )}
                                <div className="flex gap-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity">
                                  <button
                                    className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-surface-muted hover:text-text-primary cursor-pointer"
                                    title="수정"
                                    onClick={() => startEdit(`step:${cat.id}:${step.id}`, step.title)}
                                  >
                                    {EDIT_SVG}
                                  </button>
                                  <button
                                    className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-red/5 hover:text-red cursor-pointer"
                                    title="삭제"
                                    onClick={() => setDeleteTarget({ type: 'step', catId: cat.id, stepId: step.id, label: step.title })}
                                  >
                                    {DEL_SVG}
                                  </button>
                                </div>
                              </div>
                              {isAfter && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue/40 rounded-full z-10 pointer-events-none" />}
                            </div>
                          )
                        })}

                        {/* Inline new step input */}
                        {editingId === `new-step:${cat.id}` && (
                          <div className="flex items-center gap-2.5 px-3.5 py-[9px] border-b border-line/50 bg-blue/5">
                            <span className="text-[13px] text-muted font-mono w-[18px] text-right shrink-0">
                              {String(cat.steps.length + 1).padStart(2, '0')}.
                            </span>
                            <AutoFocusInput
                              value={editingVal}
                              onChange={setEditingVal}
                              onCommit={commitEdit}
                              onCancel={cancelEdit}
                              className="text-[14px] text-text-primary bg-transparent border-b border-blue outline-none flex-1 px-0.5"
                            />
                          </div>
                        )}
                      </div>

                      {/* Add step button */}
                      <button
                        className="flex items-center gap-1.5 px-3.5 h-[42px] text-[14px] text-blue w-full cursor-pointer hover:bg-blue/5 transition-colors shrink-0 mt-auto border-t border-dashed border-line"
                        onClick={() => startEdit(`new-step:${cat.id}`, '')}
                      >
                        {PLUS_SVG}
                        단계 추가
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center p-5 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[12px] border border-line shadow-xl w-[340px] p-6">
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">삭제하시겠습니까?</h3>
            <p className="text-[13px] text-muted mb-5">
              '{deleteTarget.label}'을(를) 삭제하면 복구할 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-4 rounded-[7px] border border-line text-[13px] text-text-primary hover:bg-surface-muted cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="h-9 px-4 rounded-[7px] bg-red text-white text-[13px] font-semibold hover:opacity-88 cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
