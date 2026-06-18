import { useState, useMemo } from 'react'
import { TODAY_ISO } from '../data/helpers'

const TYPE_CLS = { '종일 연차': 'bg-blue/10 text-blue', '오전 반차': 'bg-[#f59e0b]/10 text-[#f59e0b]', '오후 반차': 'bg-purple/10 text-purple' }
const STATUS_CLS = { '승인 대기': 'bg-[#f59e0b]/10 text-[#f59e0b]', '승인 완료': 'bg-green/10 text-green', '반려': 'bg-red/10 text-red' }
const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16']

function calcLeaveDays(lv) {
  if (!lv.startDate || !lv.endDate) return 0
  if (lv.type !== '종일 연차') return 0.5
  const ms = new Date(lv.endDate + 'T00:00:00') - new Date(lv.startDate + 'T00:00:00')
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
}

function LeaveRow({ lv, showActions, currentUser, onApprove, onReject, onCancel }) {
  return (
    <div className="bg-white border border-line rounded-lg p-3 flex items-start gap-3">
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-text-primary">{lv.applicantName}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_CLS[lv.status] || ''}`}>{lv.status}</span>
        </div>
        <div className="text-[11px] text-muted flex gap-3">
          <span>신청일 {lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}</span>
          {lv.approverName && <span>처리자 {lv.approverName}</span>}
        </div>
        {lv.reason && <div className="text-[11px] text-text-sub">{lv.reason}</div>}
        {lv.rejectedReason && <div className="text-[11px] text-red">반려 사유: {lv.rejectedReason}</div>}
      </div>
      {showActions && (
        <div className="flex gap-1.5 shrink-0">
          {lv.status === '승인 대기' && lv.applicantId === currentUser?.id && lv.startDate >= TODAY_ISO && (
            <button onClick={() => onCancel?.(lv.id)} className="text-[11px] text-muted hover:text-red px-2 py-1 rounded border border-line hover:border-red/30 cursor-pointer">취소</button>
          )}
        </div>
      )}
    </div>
  )
}

export default function LeavePage({ role, currentUser, leaves, totalLeave, teamMembers, onUpdateLeaves }) {
  const [tab, setTab] = useState('내 연차')
  const TABS = ['내 연차', '팀 연차', '이력']

  const myLeaves = useMemo(() => leaves.filter(l => l.applicantId === currentUser?.id), [leaves, currentUser])
  const usedDays = useMemo(() => myLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0), [myLeaves])
  const remaining = totalLeave - usedDays

  const pendingAll = useMemo(() => leaves.filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate)), [leaves])

  const handleApprove = (id) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '승인 완료', approverId: currentUser.id, approverName: currentUser.name } : l))
  }
  const handleReject = (id) => {
    onUpdateLeaves?.(prev => prev.map(l => l.id === id ? { ...l, status: '반려', approverId: currentUser.id, approverName: currentUser.name, rejectedReason: '일정 조정이 필요합니다.' } : l))
  }
  const handleCancel = (id) => {
    onUpdateLeaves?.(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg px-7 py-[18px]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <h2 className="text-[16px] font-bold text-text-primary">Leave Management</h2>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pb-4">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1">
            <span className="text-[22px] font-bold font-mono tracking-[-0.03em] text-text-primary">{totalLeave}<span className="text-[13px] font-normal text-muted ml-1">일</span></span>
            <span className="text-[12px] text-muted">총 연차</span>
          </div>
          <div className="bg-white border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1">
            <span className="text-[22px] font-bold font-mono tracking-[-0.03em] text-blue">{usedDays}<span className="text-[13px] font-normal text-muted ml-1">일</span></span>
            <span className="text-[12px] text-muted">사용 연차</span>
          </div>
          <div className="bg-white border border-line rounded-[10px] px-5 py-4 flex flex-col gap-1">
            <span className="text-[22px] font-bold font-mono tracking-[-0.03em] text-green">{remaining}<span className="text-[13px] font-normal text-muted ml-1">일</span></span>
            <span className="text-[12px] text-muted">잔여 연차</span>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: tabbed section */}
          <div className="flex-1 bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            <div className="flex border-b border-line shrink-0">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-3 text-[13px] font-medium cursor-pointer transition-colors ${tab === t ? 'text-blue border-b-2 border-blue' : 'text-muted hover:text-text-sub'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {tab === '내 연차' && (
                myLeaves.filter(l => l.status === '승인 대기').length > 0
                  ? myLeaves.filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate)).map(lv => (
                    <LeaveRow key={lv.id} lv={lv} showActions currentUser={currentUser} onCancel={handleCancel} />
                  ))
                  : <div className="text-[12px] text-muted text-center py-6">승인 대기 중인 연차가 없습니다.</div>
              )}
              {tab === '팀 연차' && (
                teamMembers.filter(m => m.id !== currentUser?.id).map((member, idx) => {
                  const memberLeaves = leaves.filter(l => l.applicantId === member.id)
                  const mUsed = memberLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0)
                  const mRemaining = totalLeave - mUsed
                  return (
                    <div key={member.id} className="border border-line rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                          style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                          {member.name[0]}
                        </span>
                        <div>
                          <div className="text-[12px] font-medium text-text-primary">{member.name}</div>
                          <div className="text-[10px] text-muted">{member.role}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-surface-muted rounded px-2 py-1.5">
                          <div className="text-[10px] text-muted">총 연차</div>
                          <div className="text-[13px] font-bold">{totalLeave}일</div>
                        </div>
                        <div className="bg-surface-muted rounded px-2 py-1.5">
                          <div className="text-[10px] text-muted">사용</div>
                          <div className="text-[13px] font-bold">{mUsed}일</div>
                        </div>
                        <div className="bg-surface-muted rounded px-2 py-1.5">
                          <div className="text-[10px] text-muted">잔여</div>
                          <div className="text-[13px] font-bold">{mRemaining}일</div>
                        </div>
                      </div>
                      {memberLeaves.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {memberLeaves.sort((a, b) => b.startDate.localeCompare(a.startDate)).map(lv => (
                            <div key={lv.id} className="flex items-center gap-2 text-[11px]">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${STATUS_CLS[lv.status] || ''}`}>{lv.status}</span>
                              <span className="text-muted">{lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted">연차 내역 없음</div>
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
                  : <div className="text-[12px] text-muted text-center py-6">연차 이력이 없습니다.</div>
              )}
            </div>
          </div>

          {/* Right: pending approval */}
          <div className="w-[340px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-hidden">
            <div className="px-5 py-[15px] border-b border-line flex items-center gap-2">
              <span className="text-[14px] font-semibold text-text-primary">승인 대기</span>
              <span className="text-[11px] bg-[#f59e0b]/10 text-[#f59e0b] font-bold px-1.5 py-0.5 rounded-full">{pendingAll.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {pendingAll.length > 0 ? (
                pendingAll.map(lv => (
                  <div key={lv.id} className="border border-line rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-text-primary">{lv.applicantName}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_CLS[lv.type] || ''}`}>{lv.type}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {lv.startDate}{lv.endDate !== lv.startDate ? ` ~ ${lv.endDate}` : ''}
                    </div>
                    {lv.reason && <div className="text-[11px] text-text-sub">{lv.reason}</div>}
                    <div className="flex gap-1.5">
                      <button onClick={() => handleApprove(lv.id)}
                        className="flex-1 h-8 rounded-[7px] bg-blue text-white text-[12px] font-medium cursor-pointer hover:bg-blue/90">
                        승인
                      </button>
                      <button onClick={() => handleReject(lv.id)}
                        className="flex-1 h-8 rounded-[7px] border border-line text-[12px] font-medium text-muted hover:text-text-sub cursor-pointer hover:bg-bg">
                        반려
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[12px] text-muted text-center py-6">승인 대기 중인 요청이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
