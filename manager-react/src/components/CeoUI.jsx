// 대표(어드민) 화면 공용 UI 프리미티브 — 카드/섹션/지표 카드.
// CeoDashboard·CeoReportCenter·CeoCompanyStatus·CeoProcessPage에서 공유.

export function StatCard({ val, label, color, bar, note, compact = false }) {
  return (
    <div className={`relative bg-surface-muted border border-line-soft rounded-lg overflow-hidden ${compact ? 'p-[14px_16px]' : 'p-[16px_18px]'}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${bar}`} />
      <div className="flex items-baseline gap-1.5">
        <div className={`font-bold font-mono tracking-[-0.03em] leading-none ${compact ? 'text-[24px]' : 'text-[26px]'}`} style={{ color }}>{val}</div>
        {note && <span className="text-[10px] font-semibold text-soft border border-line rounded px-1 py-[1px]">{note}</span>}
      </div>
      <div className={`text-muted tracking-[-0.01em] ${compact ? 'text-[11px] mt-[7px]' : 'text-[11.5px] mt-2'}`}>{label}</div>
    </div>
  )
}

export function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`bg-surface border border-line rounded-[14px] shadow-sm flex flex-col min-h-0 ${className}`}>
      <div className="px-5 py-[13px] border-b border-line-soft flex items-center justify-between shrink-0">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-[-0.02em]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export function Panel({ children, cols = 4 }) {
  return <div className={`grid gap-3 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>{children}</div>
}

export function ProgressBar({ value, color, height = 'h-2' }) {
  return (
    <div className={`flex-1 ${height} bg-line-soft rounded-full overflow-hidden`}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  )
}
