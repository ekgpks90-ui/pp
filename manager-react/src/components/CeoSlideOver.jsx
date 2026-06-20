import { useCallback, useEffect, useState } from 'react'

// 대표 홈 공용 우측 슬라이드 패널 셸 — Project Status 상세 / 결재 안건 상세에서 공유.
// DetailPanel과 동일한 애니메이션·오버레이 패턴.
export default function CeoSlideOver({ title, badge, footer, onClose, children }) {
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true))
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[440px] h-full shadow-xl flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold">{title}</h3>
            {badge}
          </div>
          <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
