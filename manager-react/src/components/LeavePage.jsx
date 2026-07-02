import { useState, useMemo, useEffect } from 'react'
import { TODAY_ISO, getCalendarWeeks } from '../data/helpers'
import { canApproveLeave } from '../data/roles'

const LEAVE_REJECT_REASONS = ['업무 일정 충돌', '인력 공백 우려', '사전 협의 필요', '기타']

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
            className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer">
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

const TYPE_CLS = { '종일 연차': 'bg-blue text-white', '오전 반차': 'bg-[#f2f6fa] text-[#5a6a85]', '오후 반차': 'bg-[#5a6a85] text-white' }
const AVATAR_COLORS = ['#6979F8','#00C48C','#FFA26B','#BE52F2','#FF647C','#0084F4','#FFCF5C']
const LEAVE_TYPES = ['종일 연차', '오전 반차', '오후 반차']

function calcLeaveDays(lv) {
  if (!lv.startDate || !lv.endDate) return 0
  if (lv.type !== '종일 연차') return 0.5
  const ms = new Date(lv.endDate + 'T00:00:00') - new Date(lv.startDate + 'T00:00:00')
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
}


function LeaveEditModal({ leave, totalLeave, usedDays, remaining, onClose, onSubmit }) {
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
  const deduct = startDate ? calcRequestDays(type, startDate, isAllDay ? endDate : startDate) : 0
  const afterRemaining = remaining - deduct

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate) return
    onSubmit(leave.id, { type, startDate, endDate: isAllDay ? endDate || startDate : startDate, reason })
  }

  const inputCls = 'w-full h-9 px-3 text-[13px] border border-line rounded-[8px] bg-white outline-none focus:border-blue transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-[14px] shadow-lg w-[420px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold">연차 수정</h3>
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
              className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40">저장</button>
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
              className="h-9 text-[13px] font-medium text-white bg-blue rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40">신청</button>
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

function LeaveCalendar({ year, month, leaves, teamMembers }) {
  const weeks = getCalendarWeeks(year, month)
  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

  const memberColorMap = useMemo(() => {
    const map = {}
    teamMembers.forEach((m, i) => { map[m.id] = AVATAR_COLORS[i % AVATAR_COLORS.length] })
    return map
  }, [teamMembers])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line shrink-0">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`py-2 text-center text-[11px] font-semibold ${i === 0 ? 'text-red' : i === 6 ? 'text-blue' : 'text-muted'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-line-soft last:border-0" style={{ minHeight: 88 }}>
            {week.map((cell) => {
              const dayLeaves = leaves.filter(l =>
                l.startDate <= cell.date && l.endDate >= cell.date && l.status !== '반려'
              )
              return (
                <div key={cell.date}
                  className={`p-2 border-r border-line-soft last:border-0 flex flex-col gap-1 ${!cell.inMonth ? 'opacity-30' : ''}`}
                  style={cell.isWeekend ? { background: '#fafbfc' } : {}}>
                  <div className={`text-[11px] font-medium leading-none w-5 h-5 flex items-center justify-center rounded-full
                    ${cell.isToday ? 'bg-blue text-white' : cell.isWeekend ? 'text-muted' : 'text-text-sub'}`}>
                    {cell.day}
                  </div>
                  <div className="flex flex-wrap gap-[3px]">
                    {dayLeaves.slice(0, 6).map((l, idx) => {
                      const color = memberColorMap[l.applicantId] || AVATAR_COLORS[0]
                      const bg =
                        l.type === '종일 연차' ? color
                        : l.type === '오전 반차' ? `linear-gradient(to right, ${color} 50%, #ffffff 50%)`
                        : `linear-gradient(to left, ${color} 50%, #ffffff 50%)`
                      const isPending = l.status === '승인 대기'
                      return (
                        <div key={idx}
                          title={`${l.applicantName} · ${l.type}${isPending ? ' (승인 대기)' : ''}`}
                          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${isPending ? 'opacity-50' : ''}`}
                          style={{
                            background: bg,
                            border: l.type !== '종일 연차' ? `1.5px solid ${color}` : 'none',
                          }}>
                          {l.type === '종일 연차' && (
                            <span className="text-white text-[8px] font-bold leading-none select-none">{l.applicantName?.[0]}</span>
                          )}
                        </div>
                      )
                    })}
                    {dayLeaves.length > 6 && (
                      <div className="w-[18px] h-[18px] rounded-full bg-[#f2f6fa] text-muted flex items-center justify-center text-[7px] font-bold leading-none border border-line">
                        +{dayLeaves.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeavePage({ role, currentUser, leaves, totalLeave, teamMembers, onUpdateLeaves }) {
  const canApprove = canApproveLeave(role)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }
  const goToday = () => { const n = new Date(); setCalYear(n.getFullYear()); setCalMonth(n.getMonth()) }
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
    <LeaveEditModal leave={editingLeave} totalLeave={totalLeave} usedDays={usedDays} remaining={remaining} onClose={() => setEditingLeave(null)} onSubmit={handleEdit} />
    <LeaveCancelModal leave={cancelingLeave} onClose={() => setCancelingLeave(null)} onConfirm={handleCancel} />
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Leave Management</h2>
        <span className="flex-1" />
        <button onClick={() => setShowApplyModal(true)}
          className="h-8 px-3.5 rounded-[7px] bg-blue text-white text-[12px] font-semibold cursor-pointer hover:opacity-90 flex items-center gap-1.5">
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
          {/* Left: leave calendar */}
          <div className="flex-1 bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            {/* Month navigation + legend */}
            <div className="px-4 py-3 border-b border-line flex items-center gap-2 shrink-0">
              <button onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer text-[16px] font-bold leading-none">
                ‹
              </button>
              <span className="text-[14px] font-semibold text-text-primary w-[96px] text-center tabular-nums">
                {calYear}년 {calMonth + 1}월
              </span>
              <button onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer text-[16px] font-bold leading-none">
                ›
              </button>
              <button onClick={goToday}
                className="px-2.5 py-1 text-[11px] font-medium text-muted border border-line rounded-[6px] hover:border-[#c8cdd8] transition-colors cursor-pointer ml-0.5">
                오늘
              </button>
              <span className="flex-1" />
              <div className="flex items-center gap-3.5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-[14px] h-[14px] rounded-full inline-block shrink-0 bg-[#6979F8]" />
                  종일 연차
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-[14px] h-[14px] rounded-full inline-block shrink-0" style={{ background: 'linear-gradient(to right, #6979F8 50%, #ffffff 50%)', border: '1.5px solid #6979F8' }} />
                  오전 반차
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-[14px] h-[14px] rounded-full inline-block shrink-0" style={{ background: 'linear-gradient(to left, #6979F8 50%, #ffffff 50%)', border: '1.5px solid #6979F8' }} />
                  오후 반차
                </span>
              </div>
            </div>
            <LeaveCalendar year={calYear} month={calMonth} leaves={leaves} teamMembers={teamMembers} currentUser={currentUser} />
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
                        className="px-3 py-[5px] rounded-[6px] bg-blue text-white text-[12px] font-medium cursor-pointer hover:opacity-90 whitespace-nowrap border border-blue">
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
