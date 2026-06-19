import { useState, useMemo, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'
import { canApproveLeave, canViewTeamLeaves } from '../data/roles'

const LEAVE_REJECT_REASONS = ['업무 일정 충돌', '인력 공백 우려', '잔여 연차 부족', '사전 협의 필요', '기타']

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

function calcLeaveDays(lv) {
  if (!lv.startDate || !lv.endDate) return 0
  if (lv.type !== '종일 연차') return 0.5
  const ms = new Date(lv.endDate + 'T00:00:00') - new Date(lv.startDate + 'T00:00:00')
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
}

function LeaveRow({ lv, showActions, currentUser, onCancel }) {
  return (
    <div className="bg-white border border-line rounded-[10px] p-[14px_16px] flex items-start gap-3">
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
      {showActions && (
        <div className="flex flex-col gap-1.5 shrink-0">
          {lv.status === '승인 대기' && lv.applicantId === currentUser?.id && lv.startDate >= TODAY_ISO && (
            <button onClick={() => onCancel?.(lv.id)} className="text-[12px] font-medium text-muted border border-line rounded-[6px] px-3 py-[5px] hover:text-text-sub cursor-pointer whitespace-nowrap">취소</button>
          )}
        </div>
      )}
    </div>
  )
}

export default function LeavePage({ role, currentUser, leaves, totalLeave, teamMembers, onUpdateLeaves }) {
  const canApprove = canApproveLeave(role)
  const canViewTeam = canViewTeamLeaves(role)
  const [tab, setTab] = useState('내 연차')
  const TABS = canViewTeam ? ['내 연차', '팀 연차', '이력'] : ['내 연차', '이력']
  const [rejectingLeave, setRejectingLeave] = useState(null)

  const myLeaves = useMemo(() => leaves.filter(l => l.applicantId === currentUser?.id), [leaves, currentUser])
  const usedDays = useMemo(() => myLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0), [myLeaves])
  const remaining = totalLeave - usedDays

  const pendingAll = useMemo(() => leaves.filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate)), [leaves])

  const handleApprove = (id) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '승인 완료', approverId: currentUser.id, approverName: currentUser.name } : l))
  }
  const handleReject = (id, reason) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '반려', approverId: currentUser.id, approverName: currentUser.name, rejectedReason: reason } : l))
    setRejectingLeave(null)
  }
  const handleCancel = (id) => {
    onUpdateLeaves?.(prev => prev.filter(l => l.id !== id))
  }

  return (
    <>
    <LeaveRejectModal leave={rejectingLeave} onClose={() => setRejectingLeave(null)} onSubmit={handleReject} />
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Leave Management</h2>
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
                    <LeaveRow key={lv.id} lv={lv} showActions currentUser={currentUser} onCancel={handleCancel} />
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
                      <div className="flex gap-2.5">
                        <div className="flex-1 bg-[#f9fafb] border border-line rounded-[10px] px-3.5 py-3">
                          <div className="text-[12px] text-muted">총 연차</div>
                          <div className="text-[28px] font-bold leading-none text-text-primary mt-1.5">{totalLeave}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></div>
                        </div>
                        <div className="flex-1 bg-[#f9fafb] border border-line rounded-[10px] px-3.5 py-3">
                          <div className="text-[12px] text-muted">사용</div>
                          <div className="text-[28px] font-bold leading-none text-text-primary mt-1.5">{mUsed}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></div>
                        </div>
                        <div className="flex-1 bg-[#f9fafb] border border-line rounded-[10px] px-3.5 py-3">
                          <div className="text-[12px] text-muted">잔여</div>
                          <div className="text-[28px] font-bold leading-none text-text-primary mt-1.5">{mRemaining}<span className="text-[14px] font-medium text-muted ml-0.5">일</span></div>
                        </div>
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
                      <button onClick={() => handleApprove(lv.id)}
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
