import { useState, useCallback, useRef, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'
import MeetingDetailPanel from './MeetingDetailPanel'
import MeetingSaveModal from './MeetingSaveModal'
import ScheduleMeetingModal from './ScheduleMeetingModal'
import ConfirmModal from './ConfirmModal'

const TEAM_TAG_COLORS = {
  '디자인팀': { bg: '#dbeafe', text: '#1d4ed8' },
  '개발팀':   { bg: '#d1fae5', text: '#065f46' },
  '기획팀':   { bg: '#fef3c7', text: '#92400e' },
  '마케팅팀': { bg: '#fce7f3', text: '#9d174d' },
}

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

function recFmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function MeetingRoomPage({
  meetings, teamMembers, workItems,
  onUpdateMeeting, onDeleteMeeting, onAddMeeting,
  onAddWorkItem, onAddNotification,
  searchQuery,
}) {
  const [teamFilter, setTeamFilter] = useState('전체')
  const [detailMeeting, setDetailMeeting] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveDuration, setSaveDuration] = useState('00:00')
  const [showScheduleModal, setShowScheduleModal] = useState(false)

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

  // Team tabs
  const teams = ['전체', ...new Set(meetings.map(m => m.team))]

  // Filtered meetings
  const q = (searchQuery || '').toLowerCase()
  const filtered = meetings.filter(m => {
    if (teamFilter !== '전체' && m.team !== teamFilter) return false
    if (q) {
      const haystack = `${m.title} ${m.type} ${m.summary || ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

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

  const handleScheduleMeeting = ({ title, date, time, room, attendeeNames }) => {
    const attendeeCount = attendeeNames.length || 1
    onAddWorkItem({
      id: `wi-mtg-${Date.now()}`,
      title, start: date, end: date, type: '회의',
      meetingTime: time, room, scheduled: true,
      participants: attendeeNames.length ? attendeeNames : ['Jihye'],
    })
    onAddNotification('회의 등록 완료', `"${title}" 회의가 등록되었습니다. (참석자 ${attendeeCount}명)`)
    setShowScheduleModal(false)
  }

  const handleAddAction = (meetingId, actionItem) => {
    onUpdateMeeting(meetingId, (m) => ({
      ...m,
      actionItems: m.actionItems.map(a =>
        a.id === actionItem.id ? { ...a, addedToWeekly: true } : a
      ),
    }))
    // Add as work item
    const dueDate = actionItem.dueDate || TODAY_ISO
    onAddWorkItem({
      id: `wi-act-${Date.now()}`,
      title: actionItem.text,
      start: dueDate < TODAY_ISO ? dueDate : TODAY_ISO,
      end: dueDate < TODAY_ISO ? TODAY_ISO : dueDate,
      type: '일반',
      participants: ['Jihye'],
    })
    onAddNotification('업무항목 추가', `"${actionItem.text}" 업무항목이 이번 주 업무에 추가되었습니다.`)
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
                  onView={() => setDetailMeeting(m)}
                  onDelete={() => setDeleteConfirm(m)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recorder widget */}
        <div className="w-[260px] shrink-0">
          <RecorderWidget
            status={recStatus}
            seconds={recSeconds}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>
      </div>

      {/* Detail panel */}
      {detailMeeting && (
        <MeetingDetailPanel
          meeting={detailMeeting}
          onClose={() => setDetailMeeting(null)}
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
    </div>
  )
}

// ─── MeetingCard ────────────────────────────────────────────────────────────────

function MeetingCard({ meeting: m, onView, onDelete }) {
  const tc = TEAM_TAG_COLORS[m.team] || { bg: '#f3f4f6', text: '#374151' }
  const date = (m.date || m.startDate || '').replace(/-/g, '.')
  const actionCount = (m.actionItems || []).length

  return (
    <div className="group relative bg-white border border-line rounded-xl p-4 hover:shadow-sm transition-shadow">
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red hover:bg-red-soft opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>

      {/* Top row: tags + meta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: tc.bg, color: tc.text }}>
            {m.team}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-muted text-muted text-[11px] font-medium">
            {m.type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-soft">
          <span>{date}</span>
          <span>{m.author}</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-[14px] font-semibold text-text-primary mb-1.5 pr-6">{m.title}</div>

      {/* Summary */}
      <div className="text-[12.5px] text-text-sub leading-[1.6] mb-3 line-clamp-2">{m.summary}</div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11.5px] text-muted">
          <span>⏱ {m.duration || '--:--'}</span>
          <div className="flex items-center gap-0.5">
            {(m.attendeeNames || []).slice(0, 4).map((name, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold -ml-1 first:ml-0 border border-white"
                style={{ background: memberColor(name), zIndex: 4 - i }}
                title={name}
              >
                {name[0]}
              </span>
            ))}
            {(m.attendeeNames || []).length > 4 && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-surface-muted text-muted text-[9px] font-semibold -ml-1 border border-white">
                +{m.attendeeNames.length - 4}
              </span>
            )}
          </div>
          {actionCount > 0 && <span>✅ 액션 {actionCount}건</span>}
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
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-red/60 rounded-full animate-pulse"
              style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
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
