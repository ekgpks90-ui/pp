import { useState, useEffect } from 'react'

const DAY_LABELS = ['월', '화', '수', '목', '금']

export default function DetailPanel({ item, onClose, onSave, onNavigate }) {
  const [draft, setDraft] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

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
        end: item.end || '',
        description: item.description || '',
        recurringDays: item.recurringDays ? [...item.recurringDays] : [1],
      })
      requestAnimationFrame(() => setIsOpen(true))
    } else {
      setIsOpen(false)
    }
  }, [item])

  if (!item || !draft) return null

  const isFromRequest = !!item.sourceRequestId
  const isFixed = draft.type === '고정'
  const isMeeting = item.type === '회의'

  const isDirty = draft.title !== item.title
    || draft.type !== item.type
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
      end: draft.end || (draft.type === '고정' ? null : item.end),
      description: draft.description,
    }
    if (draft.type === '고정' && draft.recurringDays?.length) {
      updates.recurringDays = [...draft.recurringDays]
    }
    onSave(item.id, updates)
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
              <span className="text-[12px] text-muted block mb-1">날짜</span>
              <span className="text-[14px] text-text-primary">{item.start}</span>
            </div>
            {item.meetingTime && (
              <div>
                <span className="text-[12px] text-muted block mb-1">시간</span>
                <span className="text-[14px] text-text-primary">{item.meetingTime}</span>
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

            <button
              onClick={() => { handleClose(); onNavigate?.('meeting-room') }}
              className="mt-2 w-full h-9 text-[13px] font-medium text-blue border border-blue rounded-lg hover:bg-blue-soft transition-colors cursor-pointer"
            >
              회의록 보기 →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[420px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-[15px] font-semibold">업무 상세</h3>
          <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {isFromRequest && (
            <span className="text-[12px] font-semibold text-blue bg-blue-soft px-2 py-0.5 rounded self-start">업무요청</span>
          )}

          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">업무명</span>
            <input
              value={draft.title}
              onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
              disabled={isFromRequest}
              className={`h-9 px-3 text-[14px] font-semibold border border-line rounded-lg outline-none focus:border-blue ${isFromRequest ? 'opacity-50 cursor-default' : ''}`}
            />
          </label>

          {/* Type */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">업무유형</span>
            <select
              value={draft.type}
              onChange={e => setDraft(prev => ({ ...prev, type: e.target.value }))}
              disabled={isFromRequest}
              className={`h-9 px-3 text-[14px] border border-line rounded-lg outline-none focus:border-blue bg-white ${isFromRequest ? 'opacity-50 cursor-default' : ''}`}
            >
              <option value="일반">일반</option>
              <option value="긴급">긴급</option>
              <option value="고정">고정</option>
            </select>
          </label>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">{isFixed ? '시작일' : '시작일'}</span>
              <input type="date" value={item.start} disabled className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none opacity-50 cursor-default" />
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
                disabled={isFromRequest}
                className={`h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue ${isFromRequest ? 'opacity-50 cursor-default' : ''}`}
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
                      className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer
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
              className="px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none leading-[1.6]"
            />
          </label>
        </div>

        {/* Save button */}
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
      </div>
    </div>
  )
}
