export default function WorkRequests({ requests, onAccept, onReject, onOpenDetail }) {
  const pending = requests.filter(r => r.status === '수락 대기')

  const sortOrder = { '수락 대기': 0, '수락': 1, '거절': 1 }
  const sorted = [...requests].sort((a, b) => (sortOrder[a.status] ?? 1) - (sortOrder[b.status] ?? 1))

  return (
    <div className="bg-surface border border-line rounded-[14px] flex flex-col overflow-hidden flex-1 shadow-sm">
      <div className="flex items-center justify-between px-5 py-[15px] pb-[13px] border-b border-line-soft">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-[-0.02em] flex items-center gap-[7px]">
          업무 요청
          {pending.length > 0 && (
            <span className="min-w-5 h-5 px-[5px] flex items-center justify-center text-[11px] font-bold text-white bg-red rounded-[10px]">
              {pending.length}
            </span>
          )}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto grid gap-2 p-[10px_14px_14px] content-start">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted">처리할 업무 요청이 없습니다.</div>
        ) : (
          sorted.map(r => {
            const isRejected = r.status === '거절'
            const isAccepted = r.status === '수락'
            return (
              <div key={r.id} onClick={() => onOpenDetail?.(r)} className={`bg-white rounded-lg border border-line p-3 hover:border-[#d0d0d8] hover:shadow-xs transition-all cursor-pointer ${isRejected ? 'opacity-55' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-[5px]">
                  <span className={`text-[13px] font-semibold text-text-primary leading-[1.3] tracking-[-0.01em] ${isRejected ? 'line-through' : ''}`}>{r.title}</span>
                  {isRejected && <span className="text-[11px] font-semibold text-red-hover bg-red-soft px-[7px] h-5 inline-flex items-center rounded shrink-0">거절됨</span>}
                  {isAccepted && <span className="text-[11px] font-semibold text-[#0ab87e] bg-green-soft px-[7px] h-5 inline-flex items-center rounded shrink-0">수락됨</span>}
                </div>
                <div className="text-xs text-muted leading-[1.5] mb-1.5">{r.detail}</div>
                <div className="text-[11px] text-soft mb-2.5 tabular-nums">
                  {r.requester} · {r.start.slice(5).replace('-', '/')} ~ {r.end.slice(5).replace('-', '/')}
                </div>
                {!isRejected && !isAccepted && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onAccept(r.id) }}
                      className="h-8 text-[12.5px] font-medium text-white bg-blue rounded-[7px] hover:opacity-[0.88] transition-opacity cursor-pointer tracking-[-0.01em]"
                    >
                      수락
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onReject(r.id) }}
                      className="h-8 text-[12.5px] text-muted border border-line rounded-[7px] bg-white hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
                    >
                      거절
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
