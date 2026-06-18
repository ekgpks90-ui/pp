import { useEffect } from 'react'

export default function RequestDetailModal({ request, onClose, onAccept, onReject }) {
  useEffect(() => {
    if (!request) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [request, onClose])

  if (!request) return null

  const isPending = request.status === '수락 대기'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-text-primary">{request.title}</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>

        <p className="text-[13px] text-muted leading-[1.5] mb-4">{request.detail}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-soft mb-5">
          <span>요청자: {request.requester}</span>
          <span>기간: {request.start} ~ {request.end}</span>
          <span>상태: {request.status}</span>
          {request.priority && <span>우선순위: {request.priority}</span>}
        </div>

        {request.rejectReason && (
          <div className="bg-red-soft rounded-lg p-3 mb-4">
            <span className="text-[12px] font-semibold text-red block mb-1">거절 사유</span>
            <span className="text-[13px] text-text-primary">{request.rejectReason}</span>
            {request.rejectDetail && <span className="text-[12px] text-muted block mt-1">{request.rejectDetail}</span>}
          </div>
        )}

        {isPending && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReject(request.id)}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
            >
              거절
            </button>
            <button
              onClick={() => onAccept(request.id)}
              className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              수락
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
