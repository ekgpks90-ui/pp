import { useState, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'

export default function AcceptModal({ request, onClose, onSubmit }) {
  const [todoDate, setTodoDate] = useState(TODAY_ISO)

  useEffect(() => {
    if (!request) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request, onClose])

  if (!request) return null

  const type = request.priority === '긴급' ? '긴급' : '일반'

  const handleSubmit = (e) => {
    e.preventDefault()
    const start = todoDate < request.start ? todoDate : request.start
    const end = todoDate > request.end ? todoDate : request.end
    onSubmit({
      request,
      newItem: {
        id: `wi-${Date.now()}`,
        title: request.title,
        start,
        end,
        type,
        participants: ['Jihye'],
        sourceRequestId: request.id,
      },
      todoDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[420px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">업무 요청 수락</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Info display */}
          <div className="bg-surface-muted rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">{request.title}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${type === '긴급' ? 'text-red bg-red-soft' : 'text-blue bg-blue-soft'}`}>
                {type}
              </span>
            </div>
            <span className="text-[12px] text-muted">{request.start} ~ {request.end}</span>
          </div>

          {/* Todo date */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">작업 시작 날짜</span>
            <input
              type="date"
              value={todoDate}
              onChange={e => setTodoDate(e.target.value)}
              className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue"
            />
          </label>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              수락
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
