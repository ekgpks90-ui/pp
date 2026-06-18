import { useState, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'

const WORK_ITEM_TYPE_COLOR = {
  '고정': { bg: '#dbeafe', text: '#1d4ed8' },
  '긴급': { bg: '#fee2e2', text: '#dc2626' },
  '일반': { bg: '#f3f4f6', text: '#374151' },
  '회의': { bg: '#fef3c7', text: '#92400e' },
}

const CAT_COLORS = {
  '디자인': 'bg-purple/10 text-purple',
  '기획': 'bg-blue/10 text-blue',
  '개발': 'bg-green/10 text-green',
  '운영': 'bg-orange/10 text-orange',
  '리서치': 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
  '퍼블리싱': 'bg-[#06b6d4]/10 text-[#06b6d4]',
}

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

function getWorkItemStatus(wi) {
  if (wi.type === '고정') return '진행 중'
  if (!wi.end) return '진행 중'
  if (wi.start > TODAY_ISO) return '시작 전'
  if (wi.end < TODAY_ISO) return '완료'
  return '진행 중'
}

export default function CalendarDetailPanel({ item, sessions, onClose }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true))
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 200)
  }

  const status = getWorkItemStatus(item)
  const tc = WORK_ITEM_TYPE_COLOR[item.type] || WORK_ITEM_TYPE_COLOR['일반']
  const statusColors = { '진행 중': '#2563eb', '완료': '#10b981', '시작 전': '#9ca3af', '보류': '#f59e0b' }
  const sc = statusColors[status] || '#6b7280'

  const done = sessions.filter(s => s.done).length
  const total = sessions.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const startFmt = item.start ? item.start.replace(/-/g, '.') : '-'
  const endFmt = item.end ? item.end.replace(/-/g, '.') : item.type === '고정' ? '무기한' : '-'
  const DAY_MAP = ['일', '월', '화', '수', '목', '금', '토']
  const recurStr = item.recurringDays
    ? '매주 ' + item.recurringDays.map(d => DAY_MAP[d] || '').join('·')
    : ''

  // Group sessions by participant
  const participants = item.participants || []
  const groups = participants.map(name => ({
    name,
    sessions: sessions.filter(s => s.authorName === name),
  }))
  sessions.forEach(s => {
    if (!participants.includes(s.authorName) && !groups.find(g => g.name === s.authorName)) {
      groups.push({ name: s.authorName, sessions: sessions.filter(x => x.authorName === s.authorName) })
    }
  })

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[440px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-[15px] font-semibold">업무 상세</h3>
          <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Title */}
          <div className="text-[18px] font-bold text-text-primary">{item.title}</div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold border"
              style={{ background: tc.bg, color: tc.text, borderColor: tc.text + '30' }}>
              {item.type}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold"
              style={{ background: sc + '1a', color: sc }}>
              {status}
            </span>
          </div>

          {/* Project details */}
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-2">프로젝트 상세</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center text-[12.5px]">
                <span className="text-muted w-16 shrink-0">시작일</span>
                <span className="text-text-sub">{startFmt}</span>
              </div>
              <div className="flex items-center text-[12.5px]">
                <span className="text-muted w-16 shrink-0">마감일</span>
                <span className="text-text-sub">{endFmt}</span>
              </div>
              {recurStr && (
                <div className="flex items-center text-[12.5px]">
                  <span className="text-muted w-16 shrink-0">반복</span>
                  <span className="text-text-sub">{recurStr}</span>
                </div>
              )}
              <div className="flex items-center text-[12.5px]">
                <span className="text-muted w-16 shrink-0">참여자</span>
                <span className="text-text-sub">{(item.participants || []).join(', ') || '-'}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-2">진행률</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue to-purple rounded-full transition-all"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[12px] font-semibold text-text-sub">{pct}%</span>
            </div>
          </div>

          {/* Sessions grouped by participant */}
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-2">
              작업세션 <span className="text-muted font-normal">{done}/{total}</span>
            </div>
            {groups.length === 0 ? (
              <p className="text-[12px] text-muted">세션 없음</p>
            ) : (
              <div className="flex flex-col gap-3">
                {groups.map(({ name, sessions: grpSessions }) => (
                  <div key={name}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold"
                        style={{ background: memberColor(name) }}>
                        {name[0]}
                      </span>
                      <span className="text-[12px] font-medium text-text-primary">{name}</span>
                      <span className="text-[10px] text-soft">{grpSessions.length}개</span>
                    </div>
                    {grpSessions.length === 0 ? (
                      <p className="text-[11px] text-muted ml-7">작업 내역 없음</p>
                    ) : (
                      <div className="flex flex-col gap-1 ml-7">
                        {grpSessions.map(s => (
                          <div key={s.id} className="flex items-center gap-2 text-[12px]">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.done ? 'bg-green' : 'bg-line'}`} />
                            <span className={`flex-1 ${s.done ? 'line-through text-muted' : 'text-text-sub'}`}>{s.title}</span>
                            {s.category && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${CAT_COLORS[s.category] || 'bg-surface-muted text-muted'}`}>
                                {s.category}
                              </span>
                            )}
                            {s.startTime && (
                              <span className="text-[10px] text-soft font-mono">{s.startTime}~{s.endTime}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
