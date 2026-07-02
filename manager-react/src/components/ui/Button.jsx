/**
 * Button — variant × size
 *
 * variant : 'primary' | 'ghost' | 'danger' | 'dark'
 * size    : 'sm' | 'md' | 'lg'
 * full    : boolean (w-full)
 * disabled: boolean (opacity-40, pointer-events-none)
 */

const VARIANT = {
  primary: 'bg-blue text-white hover:bg-blue-hover',
  ghost:   'border border-line bg-transparent text-text-primary hover:bg-surface-muted',
  danger:  'bg-red text-white hover:bg-red-hover',
  dark:    'bg-[#2a3547] text-white hover:bg-[#1e2b3c]',
}

const SIZE = {
  sm: 'h-8  px-3 text-[13px]',
  md: 'h-9  px-3 text-[13px]',
  lg: 'h-10 px-4 text-[14px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-[9px] font-medium transition-colors cursor-pointer',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        full ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

/* ────────────────────────────────────────────────
   Raw / 인라인 / 아이콘 / 특수 버튼
──────────────────────────────────────────────── */

/** 닫기 × (원형, border) */
export function CloseButton({ className = '', ...props }) {
  return (
    <button
      className={`w-6 h-6 flex items-center justify-center rounded-full border border-line text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
      </svg>
    </button>
  )
}

/** + 추가 (원형, border) — hover 시 border-blue text-blue */
export function IconCircleButton({ className = '', children, ...props }) {
  return (
    <button
      className={`w-6 h-6 flex items-center justify-center rounded-full border border-line text-muted hover:border-blue hover:text-blue transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children ?? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="1" x2="5" y2="9" /><line x1="1" y1="5" x2="9" y2="5" />
        </svg>
      )}
    </button>
  )
}

/** 아바타 × 배지 제거 (14×14 원형) */
export function RemoveBadgeButton({ className = '', ...props }) {
  return (
    <button
      className={`w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#5A6A85] text-white hover:bg-[#4a5a75] transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="1" y1="1" x2="6" y2="6" /><line x1="6" y1="1" x2="1" y2="6" />
      </svg>
    </button>
  )
}

/** 참석자 태그 제거 × — text-muted hover:text-red */
export function AttendeeTagRemove({ className = '', ...props }) {
  return (
    <button
      className={`text-muted hover:text-red transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
      </svg>
    </button>
  )
}

/** 액션아이템 제거 × — w-6 h-6 text-muted hover:text-red */
export function ActionItemRemove({ className = '', ...props }) {
  return (
    <button
      className={`w-6 h-6 flex items-center justify-center text-muted hover:text-red transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
      </svg>
    </button>
  )
}

/** 텍스트 링크 — text-blue font-medium, 기본 underline 없음 */
export function TextLink({ className = '', children, ...props }) {
  return (
    <button
      className={`text-blue font-medium text-[13px] hover:underline transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** 업무요청 인라인 버튼 (h-26px) — variant: 'reject' | 'accept' */
export function WorkRequestButton({ variant = 'accept', className = '', children, ...props }) {
  const base = 'h-[26px] px-[10px] text-[11px] rounded-[6px] font-medium transition-colors cursor-pointer'
  const styles = variant === 'accept'
    ? 'bg-blue text-white hover:bg-blue-hover'
    : 'border border-line text-text-primary hover:bg-surface-muted'
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children ?? (variant === 'accept' ? '수락' : '거절')}
    </button>
  )
}

/* ────────────────────────────────────────────────
   Full-width CTA (모달 하단 / 페이지 하단)
──────────────────────────────────────────────── */

/** 저장하기 / 등록하기 — active 여부에 따라 색상 전환 */
export function SaveCTA({ active = true, label = '저장하기', className = '', ...props }) {
  return (
    <button
      disabled={!active}
      className={[
        'w-full h-11 rounded-[9px] text-[14px] font-semibold transition-colors cursor-pointer',
        active
          ? 'bg-blue text-white hover:bg-blue-hover'
          : 'bg-line text-soft cursor-not-allowed',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {label}
    </button>
  )
}

/** Dashed + 업무 추가 */
export function DashedAddCTA({ label = '+ 업무 추가', className = '', ...props }) {
  return (
    <button
      className={`w-full h-10 rounded-[9px] border border-dashed border-line text-[13px] text-muted font-medium hover:border-blue hover:text-blue transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}

/** 회의록 보기 → (outline) */
export function MeetingLogCTA({ label = '회의록 보기 →', className = '', ...props }) {
  return (
    <button
      className={`w-full h-10 rounded-[9px] border border-blue bg-white text-blue text-[13px] font-medium hover:bg-blue-soft transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}

/** 업무 수정 (CalendarPage) */
export function EditCTA({ label = '업무 수정', className = '', ...props }) {
  return (
    <button
      className={`w-full h-10 rounded-[9px] border border-line text-muted text-[13px] font-medium hover:text-blue hover:border-blue transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}

/* ────────────────────────────────────────────────
   헤더 소형 CTA
──────────────────────────────────────────────── */

/** 헤더 소형 CTA — variant: 'primary' | 'ghost' */
export function HeaderSmallCTA({ variant = 'primary', className = '', children, ...props }) {
  const styles = variant === 'primary'
    ? 'bg-blue text-white hover:bg-blue-hover'
    : 'border border-line text-text-primary hover:bg-surface-muted'
  return (
    <button
      className={`h-[28px] px-2.5 text-[11px] font-medium rounded-[7px] inline-flex items-center gap-1 transition-colors cursor-pointer ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
