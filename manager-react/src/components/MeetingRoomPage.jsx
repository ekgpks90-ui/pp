import { useState, useCallback, useRef, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'
import MeetingDetailPanel from './MeetingDetailPanel'
import MeetingSaveModal from './MeetingSaveModal'
import ScheduleMeetingModal from './ScheduleMeetingModal'
import ConfirmModal from './ConfirmModal'
import AcceptModal from './AcceptModal'
import { canViewAllMeetings, ROLES } from '../data/roles'

const TEAM_TAG_COLORS = {
  '디자인팀': { bg: '#dbeafe', text: '#1d4ed8' },
  '개발팀':   { bg: '#d1fae5', text: '#065f46' },
  '기획팀':   { bg: '#fef3c7', text: '#92400e' },
  '마케팅팀': { bg: '#fce7f3', text: '#9d174d' },
  '인사팀':   { bg: '#ede9fe', text: '#7c3aed' },
}

function memberColor(name) {
  const palette = ['#6979F8', '#00C48C', '#FFA26B', '#BE52F2', '#FF647C', '#0084F4', '#FFCF5C']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

// 파형 막대 높이(px) — 렌더마다 흔들리지 않도록 고정값 사용. 움직임은 animate-pulse가 담당.
const WAVEFORM_HEIGHTS = [10, 18, 13, 22, 11, 20, 15, 24, 12, 19, 14, 21]

function recFmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function MeetingRoomPage({
  role, currentUser,
  meetings, teamMembers,
  onUpdateMeeting, onDeleteMeeting, onAddMeeting,
  onAddWorkItem, onAddNotification,
  searchQuery,
}) {
  const [teamFilter, setTeamFilter] = useState('전체')
  const [detailMeetingId, setDetailMeetingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveDuration, setSaveDuration] = useState('00:00')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [acceptingAction, setAcceptingAction] = useState(null) // { meetingId, actionItem }
  const [editingMeeting, setEditingMeeting] = useState(null)

  // Recorder state
  const [recStatus, setRecStatus] = useState('idle') // 'idle' | 'recording'
  const [recSeconds, setRecSeconds] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startRecording = useCallback(() => {
    setRecStatus('recording')
    setRecSeconds(0)
    intervalRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
  }, [])

  const stopRecording = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    const duration = recFmtTime(recSeconds)
    setRecStatus('idle')
    setRecSeconds(0)
    setSaveDuration(duration)
    setShowSaveModal(true)
  }, [recSeconds])

  // 검색 확장(참석자·AI 요약 포인트까지)은 대표(owner) 전용. 직원·팀장은 기존 화면 그대로.
  // (회의 목록 카드의 AI 요약 미리보기는 제거됨 — 회의록 상세에서만 확인)
  const isOwner = role === ROLES.OWNER

  // 역할별 노출 범위: 대표(Owner)는 전체 회의, 팀장·직원은 소속 팀 회의만.
  const scopedMeetings = canViewAllMeetings(role)
    ? meetings
    : meetings.filter(m => m.team === currentUser?.team)

  // Team tabs
  const teams = ['전체', ...new Set(scopedMeetings.map(m => m.team))]

  // Filtered meetings
  const q = (searchQuery || '').toLowerCase()
  const filtered = scopedMeetings.filter(m => {
    if (teamFilter !== '전체' && m.team !== teamFilter) return false
    if (q) {
      // 기본 검색: 회의명·유형·요약. 대표만 참석자·AI 요약 포인트까지 확장.
      const base = `${m.title} ${m.type} ${m.summary || ''}`
      const haystack = (isOwner
        ? `${base} ${(m.attendeeNames || []).join(' ')} ${(m.aiPoints || []).join(' ')}`
        : base).toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  // detailMeetingId로 meetings에서 최신 객체를 조회 → updateMeeting 후에도 패널이 즉시 갱신됨.
  const detailMeeting = detailMeetingId != null
    ? meetings.find(m => m.id === detailMeetingId)
    : null

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDeleteMeeting(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleSaveMeeting = (newMeeting) => {
    onAddMeeting(newMeeting)
    setShowSaveModal(false)
  }

  // 회의록 수정: 저장 모달과 동일한 폼으로 기존 회의를 갱신
  const handleUpdateMeeting = (updated) => {
    onUpdateMeeting(updated.id, updated)
    setEditingMeeting(null)
  }

  const handleScheduleMeeting = ({ title, date, time, room, attendeeNames }) => {
    const attendeeCount = attendeeNames.length || 1
    const ts = Date.now()
    onAddMeeting({
      id: `mr-${ts}`,
      title, type: '주간 회의', team: currentUser?.team || '디자인팀',
      agenda: '', discussions: [], aiPoints: [], actionItems: [],
      date, startTime: time, author: currentUser?.name || 'Jihye',
      duration: '', attendees: attendeeCount, attendeeNames,
    })
    onAddWorkItem({
      id: `wi-mtg-${ts}`,
      title, start: date, end: date, type: '회의',
      meetingTime: time, room, scheduled: true,
      participants: attendeeNames.length ? attendeeNames : ['Jihye'],
    })
    onAddNotification('회의 등록 완료', `"${title}" 회의가 등록되었습니다. (참석자 ${attendeeCount}명)`)
    setShowScheduleModal(false)
  }

  // 액션아이템 "→ 추가" 클릭: 업무요청 수락과 동일한 폼(AcceptModal)을 띄운다.
  const handleAddAction = (meetingId, actionItem) => {
    setAcceptingAction({ meetingId, actionItem })
  }

  // 액션아이템을 AcceptModal이 이해하는 request 형태로 변환 (제목·기간·타입).
  const actionAsRequest = acceptingAction
    ? {
        id: acceptingAction.actionItem.id,
        title: acceptingAction.actionItem.text,
        start: acceptingAction.actionItem.dueDate && acceptingAction.actionItem.dueDate < TODAY_ISO
          ? acceptingAction.actionItem.dueDate : TODAY_ISO,
        end: acceptingAction.actionItem.dueDate && acceptingAction.actionItem.dueDate > TODAY_ISO
          ? acceptingAction.actionItem.dueDate : TODAY_ISO,
        priority: '일반',
      }
    : null

  // 모달 확인: 이번 주 업무항목 추가 + 액션아이템 "추가됨" 표시 + 알림.
  const handleSubmitAction = ({ newItem }) => {
    if (!acceptingAction) return
    const { meetingId, actionItem } = acceptingAction
    onAddWorkItem({
      id: newItem.id,
      title: newItem.title,
      start: newItem.start,
      end: newItem.end,
      type: newItem.type,
      participants: newItem.participants,
      sourceMeetingId: meetingId,
      sourceActionId: actionItem.id,
    })
    onUpdateMeeting(meetingId, (m) => ({
      ...m,
      actionItems: m.actionItems.map(a =>
        a.id === actionItem.id ? { ...a, addedToWeekly: true } : a
      ),
    }))
    onAddNotification('업무항목 추가', `"${actionItem.text}" 업무항목이 이번 주 업무에 추가되었습니다.`, actionItem.text)
    setAcceptingAction(null)
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Top bar with team tabs + actions */}
      <div className="flex items-center justify-between px-7 py-3 border-b border-line">
        <div className="flex items-center gap-1.5">
          {teams.map(t => {
            const count = t === '전체' ? meetings.length : meetings.filter(m => m.team === t).length
            const active = teamFilter === t
            return (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`px-3 py-[5px] rounded-[20px] text-[12.5px] font-medium transition-colors cursor-pointer
                  ${active ? 'bg-blue text-white' : 'bg-surface-muted text-muted hover:bg-line'}`}
              >
                {t} <span className={`ml-0.5 ${active ? 'text-white/70' : 'text-soft'}`}>{count}</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="h-8 px-3.5 bg-blue text-white text-[12.5px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          + 회의 등록
        </button>
      </div>

      {/* Main content: meeting list + recorder */}
      <div className="flex-1 overflow-hidden flex gap-5 px-7 py-5">
        {/* Recorder widget + 오늘 회의 */}
        <div className="w-[260px] shrink-0 flex flex-col gap-3">
          <RecorderWidget
            status={recStatus}
            seconds={recSeconds}
            onStart={startRecording}
            onStop={stopRecording}
          />
          {/* 오늘 회의 카드 */}
          <div className="bg-white border border-line rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">오늘 회의</span>
              {(() => {
                const todayMeetings = scopedMeetings.filter(m => m.date === TODAY_ISO)
                return todayMeetings.length > 0
                  ? <span className="text-[11px] font-bold bg-blue/10 text-blue px-1.5 py-0.5 rounded-full">{todayMeetings.length}</span>
                  : null
              })()}
            </div>
            {(() => {
              const todayMeetings = scopedMeetings.filter(m => m.date === TODAY_ISO)
              if (todayMeetings.length === 0) return (
                <p className="text-[12px] text-muted text-center py-3">오늘 예정된 회의가 없습니다</p>
              )
              return todayMeetings.map(m => (
                <div key={m.id} className="flex flex-col gap-1 border-l-2 border-blue pl-2.5">
                  <span className="text-[12px] font-medium text-text-primary leading-snug">{m.title}</span>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    {m.startTime && <span>{m.startTime}</span>}
                    {m.duration && <span>· {m.duration}</span>}
                    {m.attendees && <span>· {m.attendees}명</span>}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Meeting list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!filtered.length ? (
            <div className="flex items-center justify-center h-32 text-muted text-sm">
              해당하는 회의록이 없습니다.
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(m => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onView={() => setDetailMeetingId(m.id)}
                  onEdit={() => setEditingMeeting(m)}
                  onDelete={() => setDeleteConfirm(m)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {detailMeeting && (
        <MeetingDetailPanel
          meeting={detailMeeting}
          currentUserName={currentUser?.name}
          onClose={() => setDetailMeetingId(null)}
          onAddAction={handleAddAction}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="회의록 삭제"
          message={`"${deleteConfirm.title}" 회의록을 삭제하시겠습니까?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Save modal */}
      {showSaveModal && (
        <MeetingSaveModal
          duration={saveDuration}
          teamMembers={teamMembers}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveMeeting}
        />
      )}

      {/* Schedule modal */}
      {showScheduleModal && (
        <ScheduleMeetingModal
          teamMembers={teamMembers}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleScheduleMeeting}
        />
      )}

      {/* 회의록 수정 — 저장 모달과 동일한 폼 */}
      {editingMeeting && (
        <MeetingSaveModal
          meeting={editingMeeting}
          teamMembers={teamMembers}
          onClose={() => setEditingMeeting(null)}
          onSave={handleUpdateMeeting}
        />
      )}

      {/* 액션아이템 추가 — 업무요청 수락과 동일한 폼 */}
      {acceptingAction && (
        <AcceptModal
          request={actionAsRequest}
          onClose={() => setAcceptingAction(null)}
          onSubmit={handleSubmitAction}
        />
      )}
    </div>
  )
}

// ─── MeetingCard ────────────────────────────────────────────────────────────────

function MeetingCard({ meeting: m, onView, onEdit, onDelete }) {
  const tc = TEAM_TAG_COLORS[m.team] || { bg: '#f3f4f6', text: '#374151' }
  const date = (m.date || m.startDate || '').replace(/-/g, '.')
  return (
    <div className="group relative bg-white border border-line rounded-[14px] min-w-[280px] p-4 hover:shadow-sm transition-shadow">
      {/* Edit + Delete buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-blue hover:bg-blue-soft cursor-pointer"
          title="회의록 수정"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red hover:bg-red-soft cursor-pointer"
          title="회의록 삭제"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {/* Top row: tags + avatars */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: tc.bg, color: tc.text }}>
            {m.team}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-muted text-muted text-[11px] font-medium">
            {m.type}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {(m.attendeeNames || []).slice(0, 4).map((name, i) => (
            <span
              key={i}
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[9px] font-semibold -ml-1 first:ml-0 border border-white"
              style={{ background: memberColor(name), zIndex: 4 - i }}
              title={name}
            >
              {name[0]}
            </span>
          ))}
          {(m.attendeeNames || []).length > 4 && (
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center bg-surface-muted text-muted text-[9px] font-semibold -ml-1 border border-white">
              +{m.attendeeNames.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="text-[14px] font-semibold text-text-primary mb-1.5 pr-14">{m.title}</div>

      {/* Summary */}
      <div className="text-[12.5px] text-text-sub leading-[1.6] line-clamp-2 mb-3">{m.summary}</div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[11.5px] text-muted">
          <span>🗓 {date}</span>
          <span>⏱ {m.duration || '--'}</span>
        </div>
        <button
          onClick={onView}
          className="text-[12px] font-medium text-blue hover:text-blue/80 cursor-pointer"
        >
          회의록 보기 →
        </button>
      </div>
    </div>
  )
}

// ─── RecorderWidget ─────────────────────────────────────────────────────────────

function RecorderWidget({ status, seconds, onStart, onStop }) {
  const isRecording = status === 'recording'

  return (
    <div className={`border rounded-xl p-5 flex flex-col items-center gap-4 transition-colors ${isRecording ? 'border-red bg-red-soft/30' : 'border-line bg-white'}`}>
      <div className="text-[13px] font-semibold text-text-primary">
        {isRecording ? '녹음 중...' : '회의 녹음'}
      </div>

      {/* Timer */}
      <div className={`text-[28px] font-mono font-bold tabular-nums ${isRecording ? 'text-red' : 'text-muted'}`}>
        {recFmtTime(seconds)}
      </div>

      {/* Waveform placeholder */}
      {isRecording && (
        <div className="flex items-center gap-[3px] h-6">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="w-[3px] bg-red/60 rounded-full animate-pulse"
              style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Buttons */}
      {!isRecording ? (
        <button
          onClick={onStart}
          className="w-12 h-12 rounded-full bg-red flex items-center justify-center text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="w-12 h-12 rounded-full bg-red flex items-center justify-center text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
        </button>
      )}

      {!isRecording && (
        <div className="text-[11px] text-soft text-center leading-relaxed">
          녹음 버튼을 눌러<br/>회의를 시작하세요
        </div>
      )}
    </div>
  )
}
