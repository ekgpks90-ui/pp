import { useEffect } from 'react'

export default function ConfirmModal({ title, message, confirmLabel = '삭제', confirmTone = 'red', onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-[14px] shadow-lg w-[360px] p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-[13px] text-muted leading-[1.5] mb-5">{message}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 text-[13px] font-medium text-white rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer ${confirmTone === 'blue' ? 'bg-blue' : 'bg-red'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
