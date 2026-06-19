import { useState, useCallback, useRef, useEffect } from 'react'

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

function EditModal({ title, defaultValue = '', onSave, onClose }) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = () => {
    const v = value.trim()
    if (v) { onSave(v); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[360px] p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold text-text-primary mb-3">{title}</h3>
        <input
          ref={inputRef}
          className="w-full h-[38px] px-3 border-[1.5px] border-line rounded-[8px] text-[14px] text-text-primary outline-none focus:border-blue transition-colors"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="이름을 입력하세요"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
          >취소</button>
          <button
            onClick={handleSave}
            className="h-9 px-4 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
          >저장</button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ message, onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[360px] p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold text-text-primary mb-2">삭제하시겠습니까?</h3>
        <p className="text-[13px] text-muted leading-[1.5] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
          >취소</button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="h-9 px-4 text-[13px] font-medium text-white bg-red rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
          >삭제</button>
        </div>
      </div>
    </div>
  )
}

export default function ProcessPage({ processes, onUpdateProcesses }) {
  const [openCats, setOpenCats] = useState(new Set())
  const [dropInfo, setDropInfo] = useState(null)
  const [modal, setModal] = useState(null) // { type: 'editCat'|'editStep'|'addCat'|'addStep'|'deleteCat'|'deleteStep', catId?, stepId? }

  const closeModal = useCallback(() => setModal(null), [])

  const toggleCat = useCallback((catId) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }, [])

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

  const getModal = () => {
    if (!modal) return null
    if (modal.type === 'addCat') {
      return (
        <EditModal
          title="프로세스 등록"
          defaultValue=""
          onSave={name => onUpdateProcesses(prev => [...prev, { id: `pc-${Date.now()}`, category: name, steps: [] }])}
          onClose={closeModal}
        />
      )
    }
    if (modal.type === 'editCat') {
      const cat = processes.find(c => c.id === modal.catId)
      if (!cat) return null
      return (
        <EditModal
          title="카테고리 이름 수정"
          defaultValue={cat.category}
          onSave={name => onUpdateProcesses(prev => prev.map(c => c.id === modal.catId ? { ...c, category: name } : c))}
          onClose={closeModal}
        />
      )
    }
    if (modal.type === 'deleteCat') {
      const cat = processes.find(c => c.id === modal.catId)
      if (!cat) return null
      return (
        <DeleteModal
          message={`'${cat.category}' 카테고리를 삭제하면 복구할 수 없습니다.`}
          onConfirm={() => onUpdateProcesses(prev => prev.filter(c => c.id !== modal.catId))}
          onClose={closeModal}
        />
      )
    }
    if (modal.type === 'addStep') {
      return (
        <EditModal
          title="단계 추가"
          defaultValue=""
          onSave={name => onUpdateProcesses(prev => prev.map(c =>
            c.id === modal.catId ? { ...c, steps: [...c.steps, { id: `ps-${modal.catId}-${Date.now()}`, title: name }] } : c
          ))}
          onClose={closeModal}
        />
      )
    }
    if (modal.type === 'editStep') {
      const cat = processes.find(c => c.id === modal.catId)
      const step = cat?.steps.find(s => s.id === modal.stepId)
      if (!step) return null
      return (
        <EditModal
          title="단계 이름 수정"
          defaultValue={step.title}
          onSave={name => onUpdateProcesses(prev => prev.map(c =>
            c.id === modal.catId ? { ...c, steps: c.steps.map(s => s.id === modal.stepId ? { ...s, title: name } : s) } : c
          ))}
          onClose={closeModal}
        />
      )
    }
    if (modal.type === 'deleteStep') {
      const cat = processes.find(c => c.id === modal.catId)
      const step = cat?.steps.find(s => s.id === modal.stepId)
      if (!step) return null
      return (
        <DeleteModal
          message={`'${step.title}' 단계를 삭제하면 복구할 수 없습니다.`}
          onConfirm={() => onUpdateProcesses(prev => prev.map(c =>
            c.id === modal.catId ? { ...c, steps: c.steps.filter(s => s.id !== modal.stepId) } : c
          ))}
          onClose={closeModal}
        />
      )
    }
    return null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      {getModal()}

      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">프로세스 관리</h2>
        <button
          onClick={() => setModal({ type: 'addCat' })}
          className="h-8 px-3.5 rounded-[7px] bg-text-primary text-white text-[12px] font-semibold cursor-pointer hover:opacity-90 flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          프로세스 추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {processes.length === 0 ? (
          <div className="text-[14px] text-muted text-center py-[60px]">등록된 프로세스가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-3 gap-3.5 items-start">
            {processes.map(cat => {
              const isOpen = openCats.has(cat.id)
              return (
                <div key={cat.id} className={`bg-white border-[1.5px] border-line rounded-[10px] overflow-hidden transition-shadow group ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}>
                  {/* Header */}
                  <button
                    className="w-full flex items-center gap-2 px-3.5 py-[13px] cursor-pointer hover:bg-surface-muted transition-colors"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <span className="text-[16px] font-bold text-blue shrink-0 max-w-[120px] truncate">{cat.category}</span>
                    <span className="text-[11px] font-bold text-muted bg-surface-muted min-w-[22px] h-[22px] px-1.5 rounded-full inline-flex items-center justify-center shrink-0">{cat.steps.length}</span>
                    <span className="flex-1" />
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-surface-muted hover:text-text-primary cursor-pointer"
                        title="수정"
                        onClick={e => { e.stopPropagation(); setModal({ type: 'editCat', catId: cat.id }) }}
                      >{EDIT_SVG}</button>
                      <button
                        className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-red/5 hover:text-red cursor-pointer"
                        title="삭제"
                        onClick={e => { e.stopPropagation(); setModal({ type: 'deleteCat', catId: cat.id }) }}
                      >{DEL_SVG}</button>
                    </div>
                    <svg className={`w-4 h-4 text-muted transition-transform shrink-0 ml-0.5 ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div className="border-t border-line flex flex-col" style={{ height: 280, overflowY: 'auto' }}>
                      <div className="flex flex-col">
                        {cat.steps.map((step, idx) => {
                          const isBefore = dropInfo?.stepId === step.id && dropInfo?.catId === cat.id && dropInfo?.position === 'before'
                          const isAfter  = dropInfo?.stepId === step.id && dropInfo?.catId === cat.id && dropInfo?.position === 'after'
                          return (
                            <div key={step.id} className="relative">
                              {isBefore && (
                                <div className="absolute top-0 left-2 right-2 h-[2px] bg-blue/50 rounded-full z-10 pointer-events-none" />
                              )}
                              <div
                                className="flex items-center gap-2.5 px-3.5 py-[9px] border-b border-line/50 last:border-b-0 hover:bg-surface-muted cursor-grab active:cursor-grabbing group/step"
                                draggable
                                onDragStart={e => handleDragStart(e, step.id, cat.id)}
                                onDragOver={e => handleDragOver(e, step.id, cat.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, step.id, cat.id)}
                              >
                                <span className="text-[14px] text-muted font-mono w-[18px] text-right shrink-0">
                                  {String(idx + 1).padStart(2, '0')}.
                                </span>
                                <span className="text-[14px] text-text-primary flex-1">{step.title}</span>
                                <div className="flex gap-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity">
                                  <button
                                    className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-surface-muted hover:text-text-primary cursor-pointer"
                                    title="수정"
                                    onClick={() => setModal({ type: 'editStep', catId: cat.id, stepId: step.id })}
                                  >{EDIT_SVG}</button>
                                  <button
                                    className="w-[26px] h-[26px] grid place-items-center rounded text-muted hover:bg-red/5 hover:text-red cursor-pointer"
                                    title="삭제"
                                    onClick={() => setModal({ type: 'deleteStep', catId: cat.id, stepId: step.id })}
                                  >{DEL_SVG}</button>
                                </div>
                              </div>
                              {isAfter && (
                                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue/50 rounded-full z-10 pointer-events-none" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <button
                        className="flex items-center gap-1.5 px-3.5 h-[42px] text-[14px] text-blue w-full cursor-pointer hover:bg-blue/5 transition-colors shrink-0 mt-auto border-t border-dashed border-line"
                        onClick={() => setModal({ type: 'addStep', catId: cat.id })}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
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
    </div>
  )
}
