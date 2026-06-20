import { useState, useMemo, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'
import { canApproveLeave, canViewTeamLeaves } from '../data/roles'

const LEAVE_REJECT_REASONS = ['업무 일정 충돌', '인력 공백 우려', '잔여 연차 부족', '사전 협의 필요', '기타']

function LeaveApproveModal({ leave, onClose, onConfirm }) {
  useEffect(() => {
    if (!leave) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [leave, onClose])

  if (!leave) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 승인</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>
        <div className="bg-[#f9fafb] rounded-lg p-3 mb-5">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[13px] font-semibold text-text-primary">{leave.applicantName}</span>
            <span className={`text-[11px] font-medium px-2 py-[2px] rounded-[20px] ${TYPE_CLS[leave.type] || ''}`}>{leave.type}</span>
          </div>
          <div className="text-[12px] text-muted">
            {leave.startDate}{leave.endDate !== leave.startDate ? ` ~ ${leave.endDate}` : ''}
          </div>
          {leave.reason && <div className="text-[12px] text-text-sub mt-1">{leave.reason}</div>}
        </div>
        <p className="text-[14px] text-text-primary text-center mb-5">연차 승인처리를 하시겠습니까?</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose}
            className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer">
            취소
          </button>
          <button type="button" onClick={() => onConfirm(leave.id)}
            className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer">
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

function LeaveRejectModal({ leave, onClose, onSubmit }) {
  const [reason, setReason] = useState(LEAVE_REJECT_REASONS[0])
  const [detail, setDetail] = useState('')

  useEffect(() => {
    if (!leave) return
    setReason(LEAVE_REJECT_REASONS[0])
    setDetail('')
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [leave, onClose])

  if (!leave) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (reason === '기타' && !detail.trim()) return
    onSubmit(leave.id, reason === '기타' ? detail.trim() : reason + (detail.trim() ? ` · ${detail.trim()}` : ''))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 반려</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>
        <div className="bg-[#f9fafb] rounded-lg p-3 mb-4">
          <span className="text-[13px] font-semibold text-text-primary">{leave.applicantName}</span>
          <span className="text-[12px] text-muted block mt-1">{leave.type} · {leave.startDate}{leave.endDate !== leave.startDate ? ` ~ ${leave.endDate}` : ''}</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">반려 사유</span>
            <div className="flex flex-col gap-2 mt-1">
              {LEAVE_REJECT_REASONS.map(r => (
                <label key={r} className="flex items-center gap-2 text-[13px] text-text-primary cursor-pointer">
                  <input
                    type="radio"
                    name="leaveRejectReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-red"
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
              placeholder="반려 사유를 상세히 입력하세요"
              rows={3}
              className="px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer">
              취소
            </button>
            <button type="submit" disabled={reason === '기타' && !detail.trim()}
              className="h-9 text-[13px] font-medium text-white bg-red rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40">
              반려
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const TYPE_CLS = { '종일 연차': 'bg-[#1f2937] text-white', '오전 반차': 'bg-[#6b7280] text-white', '오후 반차': 'bg-[#e5e7eb] text-[#374151]' }
const STATUS_CLS = { '승인 대기': 'bg-[#f59e0b]/10 text-[#f59e0b]', '승인 완료': 'bg-green/10 text-green', '반려': 'bg-red/10 text-red' }
const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16']
const LEAVE_TYPES = ['종일 연차', '오전 반차', '오후 반차']

function calcLeaveDays(lv) {
  if (!lv.startDate || !lv.endDate) return 0
  if (lv.type !== '종일 연차') return 0.5
  const ms = new Date(lv.endDate + 'T00:00:00') - new Date(lv.startDate + 'T00:00:00')
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
}

function LeaveRow({ lv, showActions, currentUser, onEdit, onDelete }) {
  const canAct = showActions && lv.status === '승인 대기' && lv.applicantId === currentUser?.id && lv.startDate >= TODAY_ISO
  return (
    <div className={`group bg-white border border-line rounded-[10px] p-[14px_16px] flex items-start gap-3 ${canAct ? 'hover:border-[#d0d0d8]' : ''}`}>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-text-primary">{lv.applicantName}</span>
          <span className={`text-[11px] font-medium px-2 py-[2px] rounded-[20px] ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
          <span className={`text-[11px] font-semibold px-2 py-[2px] rounded ${STATUS_CLS[lv.status] || ''}`}>{lv.status}</span>
        </div>
        <div className="text-[12px] text-muted flex gap-3 flex-wrap">
          <span>신청일 {lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}</span>
          {lv.approverName && <span>처리자 {lv.approverName}</span>}
        </div>
        {lv.reason && <div className="text-[12px] text-text-sub mt-1">{lv.reason}</div>}
        {lv.rejectedReason && <div className="text-[12px] text-red mt-1">반려 사유: {lv.rejectedReason}</div>}
      </div>
      {canAct && (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit?.(lv)} title="수정"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-muted hover:text-blue hover:bg-blue/5 transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={() => onDelete?.(lv)} title="취소"
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-muted hover:text-red hover:bg-red/5 transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function LeaveEditModal({ leave, onClose, onSubmit }) {
  const [type, setType] = useState(leave?.type || '종일 연차')
  const [startDate, setStartDate] = useState(leave?.startDate || '')
  const [endDate, setEndDate] = useState(leave?.endDate || '')
  const [reason, setReason] = useState(leave?.reason || '')

  useEffect(() => {
    if (!leave) return
    setType(leave.type)
    setStartDate(leave.startDate)
    setEndDate(leave.endDate)
    setReason(leave.reason || '')
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [leave, onClose])

  if (!leave) return null

  const isAllDay = type === '종일 연차'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate) return
    onSubmit(leave.id, { type, startDate, endDate: isAllDay ? endDate || startDate : startDate, reason })
  }

  const inputCls = 'w-full h-9 px-3 text-[13px] border border-line rounded-[8px] bg-white outline-none focus:border-blue transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 수정</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-medium text-text-sub mb-1.5 block">연차 유형</label>
            <select value={type} onChange={e => setType(e.target.value)} className={inputCls + ' cursor-pointer'}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={isAllDay ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className="text-[12px] font-medium text-text-sub mb-1.5 block">{isAllDay ? '시작일' : '날짜'} *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls + ' cursor-pointer'} />
            </div>
            {isAllDay && (
              <div>
                <label className="text-[12px] font-medium text-text-sub mb-1.5 block">종료일</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className={inputCls + ' cursor-pointer'} />
              </div>
            )}
          </div>
          <div>
            <label className="text-[12px] font-medium text-text-sub mb-1.5 block">사유</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="연차 사유를 입력하세요" rows={3}
              className="w-full px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer">취소</button>
            <button type="submit" disabled={!startDate}
              className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function calcRequestDays(type, startDate, endDate) {
  if (!startDate) return 0
  if (type !== '종일 연차') return 0.5
  const s = new Date(startDate + 'T00:00:00')
  const e = new Date((endDate || startDate) + 'T00:00:00')
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
}

function LeaveApplyModal({ currentUser, totalLeave, usedDays, remaining, onClose, onSubmit }) {
  const [type, setType] = useState('종일 연차')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const isAllDay = type === '종일 연차'
  const deduct = (startDate) ? calcRequestDays(type, startDate, isAllDay ? endDate : startDate) : 0
  const afterRemaining = remaining - deduct

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate) return
    onSubmit({
      id: `lv-${Date.now()}`,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type,
      startDate,
      endDate: isAllDay ? (endDate || startDate) : startDate,
      reason,
      status: '승인 대기',
    })
    onClose()
  }

  const inputCls = 'w-full h-9 px-3 text-[13px] border border-line rounded-[8px] bg-white outline-none focus:border-blue transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[420px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 신청</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>

        {/* 연차 현황 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-[#f9fafb] rounded-[8px] px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">총 연차</span>
            <span className="text-[18px] font-bold text-text-primary leading-none">{totalLeave}<span className="text-[11px] font-medium text-muted ml-0.5">일</span></span>
          </div>
          <div className="bg-[#f9fafb] rounded-[8px] px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">사용 연차</span>
            <span className="text-[18px] font-bold text-text-primary leading-none">{usedDays}<span className="text-[11px] font-medium text-muted ml-0.5">일</span></span>
          </div>
          <div className="bg-[#f9fafb] rounded-[8px] px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">잔여 연차</span>
            <span className="text-[18px] font-bold text-text-primary leading-none">{remaining}<span className="text-[11px] font-medium text-muted ml-0.5">일</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-medium text-text-sub mb-1.5 block">연차 유형</label>
            <select value={type} onChange={e => { setType(e.target.value); setStartDate(''); setEndDate('') }} className={inputCls + ' cursor-pointer'}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={isAllDay ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className="text-[12px] font-medium text-text-sub mb-1.5 block">{isAllDay ? '시작일' : '날짜'} *</label>
              <input type="date" value={startDate} min={TODAY_ISO} onChange={e => { setStartDate(e.target.value); if (!isAllDay) setEndDate('') }} className={inputCls + ' cursor-pointer'} />
            </div>
            {isAllDay && (
              <div>
                <label className="text-[12px] font-medium text-text-sub mb-1.5 block">종료일</label>
                <input type="date" value={endDate} min={startDate || TODAY_ISO} onChange={e => setEndDate(e.target.value)} className={inputCls + ' cursor-pointer'} />
              </div>
            )}
          </div>

          {/* 차감 미리보기 */}
          {deduct > 0 && (
            <div className={`rounded-[8px] px-4 py-3 flex items-center justify-between text-[13px] ${afterRemaining < 0 ? 'bg-red/5 border border-red/20' : 'bg-blue/5 border border-blue/10'}`}>
              <span className="text-muted">차감 예정 <span className="font-semibold text-text-primary">-{deduct}일</span></span>
              <span className="flex items-center gap-1.5 text-muted">
                신청 후 잔여
                <span className={`font-semibold ${afterRemaining < 0 ? 'text-red' : 'text-text-primary'}`}>{afterRemaining}일</span>
                {afterRemaining < 0 && <span className="text-red font-medium">(잔여 연차 초과)</span>}
              </span>
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-text-sub mb-1.5 block">사유</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="연차 사유를 입력하세요" rows={3}
              className="w-full px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer">취소</button>
            <button type="submit" disabled={!startDate}
              className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40">신청</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LeaveCancelModal({ leave, onClose, onConfirm }) {
  useEffect(() => {
    if (!leave) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [leave, onClose])

  if (!leave) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 취소</h3>
          <button onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg leading-none">&times;</button>
        </div>
        <div className="bg-[#f9fafb] rounded-lg p-3 mb-5">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[11px] font-medium px-2 py-[2px] rounded-[20px] ${TYPE_CLS[leave.type] || ''}`}>{leave.type}</span>
            <span className="text-[11px] font-semibold px-2 py-[2px] rounded bg-[#f59e0b]/10 text-[#f59e0b]">승인 대기</span>
          </div>
          <div className="text-[12px] text-muted mt-1">
            {leave.startDate}{leave.endDate !== leave.startDate ? ` ~ ${leave.endDate}` : ''}
          </div>
          {leave.reason && <div className="text-[12px] text-text-sub mt-1">{leave.reason}</div>}
        </div>
        <p className="text-[14px] text-text-primary text-center mb-5">연차를 취소하시겠습니까?</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose}
            className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] transition-colors cursor-pointer">닫기</button>
          <button type="button" onClick={() => onConfirm(leave.id)}
            className="h-9 text-[13px] font-medium text-white bg-red rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer">취소하기</button>
        </div>
      </div>
    </div>
  )
}

export default function LeavePage({ role, currentUser, leaves, totalLeave, teamMembers, onUpdateLeaves }) {
  const canApprove = canApproveLeave(role)
  const canViewTeam = canViewTeamLeaves(role)
  const [tab, setTab] = useState('내 연차')
  const TABS = canViewTeam ? ['내 연차', '팀 연차', '이력'] : ['내 연차', '이력']
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [rejectingLeave, setRejectingLeave] = useState(null)
  const [approvingLeave, setApprovingLeave] = useState(null)
  const [editingLeave, setEditingLeave] = useState(null)
  const [cancelingLeave, setCancelingLeave] = useState(null)

  const myLeaves = useMemo(() => leaves.filter(l => l.applicantId === currentUser?.id), [leaves, currentUser])
  const usedDays = useMemo(() => myLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0), [myLeaves])
  const remaining = totalLeave - usedDays

  const pendingAll = useMemo(() => leaves.filter(l => l.status === '승인 대기' && l.applicantId !== currentUser?.id).sort((a, b) => a.startDate.localeCompare(b.startDate)), [leaves, currentUser])

  const handleApprove = (id) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '승인 완료', approverId: currentUser.id, approverName: currentUser.name } : l))
    setApprovingLeave(null)
  }
  const handleReject = (id, reason) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '반려', approverId: currentUser.id, approverName: currentUser.name, rejectedReason: reason } : l))
    setRejectingLeave(null)
  }
  const handleCancel = (id) => {
    onUpdateLeaves?.(prev => prev.filter(l => l.id !== id))
    setCancelingLeave(null)
  }
  const handleEdit = (id, updates) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
    setEditingLeave(null)
  }
  const handleApply = (newLeave) => {
    onUpdateLeaves?.(prev => [...prev, newLeave])
  }

  return (
    <>
    {showApplyModal && <LeaveApplyModal currentUser={currentUser} totalLeave={totalLeave} usedDays={usedDays} remaining={remaining} onClose={() => setShowApplyModal(false)} onSubmit={handleApply} />}
    <LeaveApproveModal leave={approvingLeave} onClose={() => setApprovingLeave(null)} onConfirm={handleApprove} />
    <LeaveRejectModal leave={rejectingLeave} onClose={() => setRejectingLeave(null)} onSubmit={handleReject} />
    <LeaveEditModal leave={editingLeave} onClose={() => setEditingLeave(null)} onSubmit={handleEdit} />
    <LeaveCancelModal leave={cancelingLeave} onClose={() => setCancelingLeave(null)} onConfirm={handleCancel} />
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Leave Management</h2>
        <span className="flex-1" />
        <button onClick={() => setShowApplyModal(true)}
          className="h-8 px-3.5 rounded-[7px] bg-text-primary text-white text-[12px] font-semibold cursor-pointer hover:opacity-90 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          연차 신청
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pb-4">
        {/* KPI Row — label on top, value below (원본 스타일) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#f9fafb] border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">총 연차</span>
            <span className="text-[28px] font-bold leading-none text-text-primary">{totalLeave}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></span>
          </div>
          <div className="bg-[#f9fafb] border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">사용 연차</span>
            <span className="text-[28px] font-bold leading-none text-text-primary">{usedDays}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></span>
          </div>
          <div className="bg-[#f9fafb] border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1.5">
            <span className="text-[12px] text-muted">잔여 연차</span>
            <span className="text-[28px] font-bold leading-none text-text-primary">{remaining}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></span>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: tabbed section */}
          <div className="flex-1 bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            <div className="flex border-b border-line shrink-0">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-[13px] font-medium cursor-pointer transition-colors border-b-2 -mb-px ${tab === t ? 'text-text-primary font-bold border-text-primary' : 'text-muted border-transparent hover:text-text-sub'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {tab === '내 연차' && (
                myLeaves.filter(l => l.status === '승인 대기').length > 0
                  ? myLeaves.filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate)).map(lv => (
                    <LeaveRow key={lv.id} lv={lv} showActions currentUser={currentUser} onEdit={setEditingLeave} onDelete={setCancelingLeave} />
                  ))
                  : <div className="text-[14px] text-muted text-center py-10">승인 대기 중인 연차가 없습니다.</div>
              )}
              {tab === '팀 연차' && (
                teamMembers.filter(m => m.id !== currentUser?.id).map((member, idx) => {
                  const memberLeaves = leaves.filter(l => l.applicantId === member.id)
                  const mUsed = memberLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0)
                  const mRemaining = totalLeave - mUsed
                  return (
                    <div key={member.id} className="border-[1.5px] border-line rounded-[10px] p-[18px_20px] flex flex-col gap-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                          style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                          {member.name[0]}
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-text-primary">{member.name}</div>
                          <div className="text-[12px] text-muted mt-0.5">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[13px]">
                        <span className="text-muted">총 연차 <span className="font-semibold text-text-primary">{totalLeave}일</span></span>
                        <span className="text-line">·</span>
                        <span className="text-muted">사용 <span className="font-semibold text-text-primary">{mUsed}일</span></span>
                        <span className="text-line">·</span>
                        <span className="text-muted">잔여 <span className="font-semibold text-text-primary">{mRemaining}일</span></span>
                      </div>
                      {memberLeaves.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {memberLeaves.sort((a, b) => b.startDate.localeCompare(a.startDate)).map(lv => (
                            <div key={lv.id} className="flex items-center gap-2 text-[11px]">
                              <span className={`px-2 py-[2px] rounded-[20px] font-medium ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
                              <span className={`px-2 py-[2px] rounded font-semibold ${STATUS_CLS[lv.status] || ''}`}>{lv.status}</span>
                              <span className="text-muted">신청일 {lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[14px] text-muted text-center py-6">연차 내역이 없습니다.</div>
                      )}
                    </div>
                  )
                })
              )}
              {tab === '이력' && (
                myLeaves.filter(l => l.status === '승인 완료' || l.status === '반려').length > 0
                  ? myLeaves.filter(l => l.status === '승인 완료' || l.status === '반려').sort((a, b) => b.startDate.localeCompare(a.startDate)).map(lv => (
                    <LeaveRow key={lv.id} lv={lv} showActions={false} currentUser={currentUser} />
                  ))
                  : <div className="text-[14px] text-muted text-center py-10">연차 이력이 없습니다.</div>
              )}
            </div>
          </div>

          {/* Right: pending approval */}
          {canApprove && (
          <div className="w-[340px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            <div className="px-5 py-[15px] border-b border-line flex items-center gap-2">
              <span className="text-[14px] font-semibold text-text-primary">승인 대기</span>
              <span className="text-[11px] bg-[#f59e0b]/10 text-[#f59e0b] font-bold px-1.5 py-0.5 rounded-full">{pendingAll.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {pendingAll.length > 0 ? (
                pendingAll.map(lv => (
                  <div key={lv.id} className="border border-line rounded-[10px] p-[14px_16px] flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[14px] font-semibold text-text-primary">{lv.applicantName}</span>
                        <span className={`text-[11px] font-medium px-2 py-[2px] rounded-[20px] ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
                      </div>
                      <div className="text-[12px] text-muted mb-1">
                        신청일 {lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}
                      </div>
                      {lv.reason && <div className="text-[12px] text-text-sub">{lv.reason}</div>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => setApprovingLeave(lv)}
                        className="px-3 py-[5px] rounded-[6px] bg-text-primary text-white text-[12px] font-medium cursor-pointer hover:opacity-90 whitespace-nowrap border border-text-primary">
                        승인
                      </button>
                      <button onClick={() => setRejectingLeave(lv)}
                        className="px-3 py-[5px] rounded-[6px] bg-white text-red text-[12px] font-medium cursor-pointer hover:opacity-90 whitespace-nowrap border border-red/30">
                        반려
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[14px] text-muted text-center py-10">승인 대기 중인 요청이 없습니다.</div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
