import { useState, useCallback } from 'react'

export default function ProcessPage({ processes, onUpdateProcesses }) {
  const [openCats, setOpenCats] = useState(new Set())

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

  const handleDrop = (e, toStepId, toCatId) => {
    e.preventDefault()
    const fromStepId = e.dataTransfer.getData('stepId')
    const fromCatId = e.dataTransfer.getData('catId')
    if (!fromStepId || fromStepId === toStepId || fromCatId !== toCatId) return
    if (!onUpdateProcesses) return

    onUpdateProcesses(prev => prev.map(cat => {
      if (cat.id !== toCatId) return cat
      const steps = [...cat.steps]
      const fi = steps.findIndex(s => s.id === fromStepId)
      const ti = steps.findIndex(s => s.id === toStepId)
      if (fi === -1 || ti === -1) return cat
      const [moved] = steps.splice(fi, 1)
      steps.splice(ti, 0, moved)
      return { ...cat, steps }
    }))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Process Management</h2>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {processes.length === 0 ? (
          <div className="text-[13px] text-muted text-center py-10">등록된 프로세스가 없습니다.</div>
        ) : (
          processes.map(cat => {
            const isOpen = openCats.has(cat.id)
            return (
              <div key={cat.id} className="bg-white border border-line rounded-[10px] overflow-hidden">
                {/* Header */}
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-bg/50 transition-colors"
                  onClick={() => toggleCat(cat.id)}
                >
                  <span className="text-[14px] font-semibold text-text-primary">{cat.category}</span>
                  <span className="text-[11px] text-muted bg-surface-muted px-2 py-0.5 rounded-full">{cat.steps.length}</span>
                  <span className="flex-1" />
                  <svg className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Body */}
                {isOpen && (
                  <div className="border-t border-line">
                    <div className="flex flex-col">
                      {cat.steps.map((step, idx) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-3 px-5 py-2.5 border-b border-line last:border-b-0 hover:bg-bg/30 cursor-grab active:cursor-grabbing group"
                          draggable
                          onDragStart={e => handleDragStart(e, step.id, cat.id)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => handleDrop(e, step.id, cat.id)}
                        >
                          <span className="text-[12px] text-muted font-mono w-6 shrink-0">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="text-[13px] text-text-primary flex-1">{step.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 rounded hover:bg-surface-muted text-muted hover:text-text-sub cursor-pointer" title="수정">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="p-1 rounded hover:bg-red/5 text-muted hover:text-red cursor-pointer" title="삭제">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 text-[12px] text-muted hover:text-blue w-full cursor-pointer hover:bg-bg/30 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      단계 추가
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
