// 결재 탭 (R-BGZHXA) — 모바일 핵심.
// 세그먼트(업무요청/연차, 기본 업무요청) + 처리됨 보기 토글.
// 업무요청: 수락(수락만)/거절(사유 필수). 연차: 승인(팀장 1차→대표 최종)/반려(사유 필수).
import { useState } from 'react'
import { Card, Badge, ReasonModal, EmptyState } from '../ui'
import { COLOR } from '../theme'
import {
  pendingRequests, pendingLeaves, getProjects, leaveBasis, currentUser,
} from '../derive'

function Segment({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
      style={active
        ? { background: COLOR.primary, color: '#fff' }
        : { background: 'transparent', color: COLOR.muted }}
    >
      {label} {count}
    </button>
  )
}

function RequestCard({ r, onAccept, onReject }) {
  const done = r.status !== '수락 대기'
  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        {r.priority === '긴급' && <Badge tone="danger" soft={false}>긴급</Badge>}
        <span className="text-sm font-bold text-text-primary">{r.title}</span>
      </div>
      <p className="mb-2 text-xs text-muted">{r.detail}</p>
      <div className="mb-3 text-xs text-soft">{r.requester} · {r.start.slice(5)}~{r.end.slice(5)}</div>
      {done ? (
        <Badge tone={r.status === '거절' ? 'danger' : 'success'}>
          {r.status === '거절' ? `거절됨 · ${r.rejectReason || ''}` : '우리 팀 할당'}
        </Badge>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => onAccept(r.id)} className="h-11 flex-1 rounded-xl text-sm font-semibold text-white" style={{ background: COLOR.primary }}>수락</button>
          <button onClick={() => onReject(r.id)} className="h-11 flex-1 rounded-xl border border-line text-sm font-semibold text-text-sub">거절</button>
        </div>
      )}
    </Card>
  )
}

function LeaveCard({ l, basis, onApprove, onReject }) {
  const done = l.status !== '승인 대기'
  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-bold text-text-primary">{l.applicantName}</span>
        <Badge tone={l.type.includes('반차') ? 'primary' : 'muted'}>{l.type}</Badge>
      </div>
      <div className="mb-2 text-xs text-soft">
        {l.startDate.slice(5)}{l.endDate !== l.startDate ? `~${l.endDate.slice(5)}` : ''} · {l.reason}
      </div>
      <div className="mb-3 space-y-1">
        {basis.map((b, i) => (
          <div key={i} className="text-xs" style={{ color: b.tone === 'warn' ? COLOR.danger : COLOR.success }}>
            {b.tone === 'warn' ? '⚠' : '✓'} {b.text}
          </div>
        ))}
      </div>
      {done ? (
        <Badge tone={l.status === '반려' ? 'danger' : 'success'}>
          {l.status === '반려' ? `반려됨 · ${l.rejectedReason || ''}` : '팀장 승인 (대표 최종 대기)'}
        </Badge>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => onApprove(l.id)} className="h-11 flex-1 rounded-xl text-sm font-semibold text-white" style={{ background: COLOR.primary }}>승인</button>
          <button onClick={() => onReject(l.id)} className="h-11 flex-1 rounded-xl border border-line text-sm font-semibold text-text-sub">반려</button>
        </div>
      )}
    </Card>
  )
}

export default function ApprovalTab({
  requests, leaves, workItems, sessions, initialSegment = '업무요청',
  onAcceptRequest, onRejectRequest, onApproveLeave, onRejectLeave,
}) {
  const [segment, setSegment] = useState(initialSegment)
  const [showDone, setShowDone] = useState(false)
  const [modal, setModal] = useState(null) // { kind:'request'|'leave', id }

  const projects = getProjects(workItems, sessions)
  // 본인 연차 제외(팀장은 본인 연차를 결재하지 않음)
  const allLeaves = leaves.filter(l => l.applicantId !== currentUser.id)

  const reqWaiting = pendingRequests(requests)
  const leaveWaiting = pendingLeaves(leaves)
  const reqList = showDone ? requests : reqWaiting
  const leaveList = showDone ? allLeaves : leaveWaiting

  return (
    <div className="pb-6 pt-3">
      <div className="mx-4 mb-3 flex gap-1 rounded-2xl bg-surface-muted p-1">
        <Segment active={segment === '업무요청'} label="업무요청" count={reqWaiting.length} onClick={() => setSegment('업무요청')} />
        <Segment active={segment === '연차'} label="연차" count={leaveWaiting.length} onClick={() => setSegment('연차')} />
      </div>

      <div className="mb-3 flex items-center justify-end px-4">
        <button onClick={() => setShowDone(v => !v)} className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${showDone ? 'justify-end bg-blue' : 'justify-start bg-line'}`}>
            <span className="h-4 w-4 rounded-full bg-white" />
          </span>
          처리됨 보기
        </button>
      </div>

      <div className="space-y-2 px-4">
        {segment === '업무요청' && (
          reqList.length === 0
            ? <EmptyState>{showDone ? '업무요청이 없어요.' : '대기 중인 업무요청이 없어요.'}</EmptyState>
            : reqList.map(r => (
              <RequestCard key={r.id} r={r}
                onAccept={onAcceptRequest}
                onReject={id => setModal({ kind: 'request', id })} />
            ))
        )}
        {segment === '연차' && (
          leaveList.length === 0
            ? <EmptyState>{showDone ? '연차 신청이 없어요.' : '대기 중인 연차가 없어요.'}</EmptyState>
            : leaveList.map(l => (
              <LeaveCard key={l.id} l={l} basis={leaveBasis(l, leaves, projects)}
                onApprove={onApproveLeave}
                onReject={id => setModal({ kind: 'leave', id })} />
            ))
        )}
      </div>

      {modal && (
        <ReasonModal
          title={modal.kind === 'request' ? '업무요청 거절 사유' : '연차 반려 사유'}
          confirmLabel={modal.kind === 'request' ? '거절' : '반려'}
          onClose={() => setModal(null)}
          onSubmit={reason => {
            if (modal.kind === 'request') onRejectRequest(modal.id, reason)
            else onRejectLeave(modal.id, reason)
            setModal(null)
          }}
        />
      )}
    </div>
  )
}
