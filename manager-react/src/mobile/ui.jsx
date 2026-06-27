// 팀장 모바일 공통 UI 조각. 터치 타겟 44px, 카드 좌우 16px 여백 가이드 준수(§11).
import { useState } from 'react'
import { COLOR, progressColor } from './theme'

export function Avatar({ name, dimmed = false, color, size = 36 }) {
  const initial = (name || '?').slice(0, 1)
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4, background: dimmed ? '#c7c7d1' : (color || COLOR.primary) }}
    >
      {initial}
    </div>
  )
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, pct)}%`, background: progressColor(pct) }}
      />
    </div>
  )
}

// 상태/유형 배지. tone: danger | primary | success | muted
export function Badge({ children, tone = 'muted', soft = true }) {
  const map = {
    danger: { color: COLOR.danger, bg: COLOR.dangerSoft },
    primary: { color: COLOR.primary, bg: COLOR.primarySoft },
    success: { color: COLOR.success, bg: COLOR.successSoft },
    muted: { color: COLOR.muted, bg: COLOR.mutedSoft },
  }
  const s = map[tone] || map.muted
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={soft ? { color: s.color, background: s.bg } : { color: '#fff', background: s.color }}
    >
      {children}
    </span>
  )
}

// 긴급 표시용 빨강 점
export function UrgentDot() {
  return <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: COLOR.danger }} />
}

export function SectionTitle({ children, right }) {
  return (
    <div className="mb-2 flex items-center justify-between px-4">
      <h2 className="text-sm font-bold text-text-primary">{children}</h2>
      {right}
    </div>
  )
}

export function Card({ children, onClick, className = '' }) {
  const base = 'rounded-[14px] border border-line bg-surface p-4'
  if (onClick) {
    return (
      <button onClick={onClick} className={`w-full text-left active:bg-surface-hover ${base} ${className}`}>
        {children}
      </button>
    )
  }
  return <div className={`${base} ${className}`}>{children}</div>
}

export function EmptyState({ children }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-muted">{children}</div>
  )
}

// 거절/반려 사유 입력 모달 (§3-3, §6-3, §6-4 — 사유 필수)
export function ReasonModal({ title, confirmLabel = '제출', onSubmit, onClose }) {
  const [reason, setReason] = useState('')
  const valid = reason.trim().length > 0
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-surface p-5 pb-7"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-3 text-base font-bold text-text-primary">{title}</h3>
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="사유를 입력하세요 (필수)"
          className="h-28 w-full resize-none rounded-xl border border-line bg-surface-muted p-3 text-sm outline-none focus:border-blue"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="h-12 flex-1 rounded-xl bg-surface-hover text-sm font-semibold text-text-sub"
          >
            취소
          </button>
          <button
            disabled={!valid}
            onClick={() => valid && onSubmit(reason.trim())}
            className="h-12 flex-1 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: COLOR.danger }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// 보기 전용 화면 안내 띠
export function ViewOnlyNote() {
  return (
    <div className="mx-4 mb-3 rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted">
      보기 전용 화면입니다. 편집·생성은 데스크탑에서 하세요.
    </div>
  )
}
