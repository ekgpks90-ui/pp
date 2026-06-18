import { useState, useEffect } from 'react'

const REJECT_REASONS = ['일정 불가', '담당 범위 아님', '리소스 부족', '요청 내용 불명확', '기타']

export default function RejectModal({ request, onClose, onSubmit }) {
  const [reason, setReason] = useState(REJECT_REASONS[0])
  const [detail, setDetail] = useState('')

  useEffect(() => {
    if (!request) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request, onClose])

  if (!request) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (reason === '기타' && !detail.trim()) return
    onSubmit({ requestId: request.id, reason, detail: detail.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">업무 요청 거절</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>

        <div className="bg-surface-muted rounded-lg p-3 mb-4">
          <span className="text-[13px] font-semibold text-text-primary">{request.title}</span>
          <span className="text-[12px] text-muted block mt-1">{request.requester} · {request.start} ~ {request.end}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">거절 사유</span>
            <div className="flex flex-col gap-2 mt-1">
              {REJECT_REASONS.map(r => (
                <label key={r} className="flex items-center gap-2 text-[13px] text-text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-blue"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">추가 설명 {reason === '기타' && <span className="text-red">*</span>}</span>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="거절 사유를 상세히 입력하세요"
              rows={3}
              className="px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-9 text-[13px] font-medium text-white bg-red rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              거절
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
