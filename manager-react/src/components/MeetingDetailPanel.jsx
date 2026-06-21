import { useState, useEffect, useCallback } from 'react'

function memberColor(name) {
  const palette = ['#53BDCF', '#66B5F8', '#7DDFC3', '#A5AFFB', '#DBA5F5', '#FF647C', '#FFA26B']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

export default function MeetingDetailPanel({ meeting: m, currentUserName, onClose, onAddAction }) {
  const [activeTab, setActiveTab] = useState('ai')
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true))
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  const tabs = [
    { key: 'ai', label: 'AI 분석' },
    { key: 'script', label: '스크립트' },
    { key: 'actions', label: '액션아이템' },
  ]

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className={`relative bg-white w-[480px] h-full shadow-xl flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-line">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold">회의 상세</h3>
            <button onClick={handleClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
          </div>
          {/* Meeting info */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-soft text-blue text-[11px] font-semibold">{m.team}</span>
            <span className="px-2 py-0.5 rounded bg-surface-muted text-muted text-[11px] font-medium">{m.type}</span>
          </div>
          <div className="text-[16px] font-bold text-text-primary mb-2">{m.title}</div>
          <div className="flex items-center gap-3 text-[11.5px] text-soft mb-3">
            <span>{(m.date || '').replace(/-/g, '.')}</span>
            <span>{m.author}</span>
            <span>⏱ {m.duration}</span>
          </div>
          {/* 참여자 — 이름으로 상세 표시 */}
          <div className="flex items-start gap-2">
            <span className="text-[11.5px] text-muted shrink-0 mt-1">
              참여자 {(m.attendeeNames || []).length}명
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(m.attendeeNames || []).map(name => (
                <span
                  key={name}
                  className="flex items-center gap-1 pl-0.5 pr-2 py-0.5 rounded-full bg-surface-muted text-[11.5px] text-text-sub font-medium"
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-semibold"
                    style={{ background: memberColor(name) }}
                  >
                    {name[0]}
                  </span>
                  {name}
                </span>
              ))}
              {!(m.attendeeNames || []).length && (
                <span className="text-[11.5px] text-muted mt-0.5">참여자 정보 없음</span>
              )}
            </div>
          </div>
        </div>

        {/* 회의 내용 — 탭과 무관하게 항상 표시되는 공통 영역 */}
        {m.summary && (
          <div className="px-6 py-4 border-b border-line">
            <div className="text-[12px] font-semibold text-muted mb-1.5">회의 내용</div>
            <p className="text-[13px] text-text-sub leading-[1.7] whitespace-pre-line">{m.summary}</p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b border-line px-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer
                ${activeTab === t.key
                  ? 'border-blue text-blue'
                  : 'border-transparent text-muted hover:text-text-sub'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'ai' && <AiTab meeting={m} />}
          {activeTab === 'script' && <ScriptTab meeting={m} />}
          {activeTab === 'actions' && <ActionsTab meeting={m} currentUserName={currentUserName} onAddAction={onAddAction} />}
        </div>
      </div>
    </div>
  )
}

function AiTab({ meeting: m }) {
  const points = m.aiPoints || []
  const discussions = m.discussions || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-[13px] font-semibold text-text-primary mb-2">주요 내용</div>
        {points.length ? (
          <ul className="flex flex-col gap-2">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-text-sub leading-[1.6]">
                <span className="text-blue shrink-0 mt-0.5">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted">내용 없음</p>
        )}
      </div>
      {discussions.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-text-primary mb-2">주요 논의</div>
          <ul className="flex flex-col gap-2">
            {discussions.map((d, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-text-sub leading-[1.6]">
                <span className="text-orange shrink-0 mt-0.5">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ScriptTab({ meeting: m }) {
  const lines = m.script || []

  if (!lines.length) {
    return <p className="text-[13px] text-muted">스크립트 없음</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {lines.map((s, i) => (
        <div key={i} className="flex gap-3 py-2 border-b border-line-soft last:border-0">
          <span className="text-[11px] text-soft font-mono tabular-nums shrink-0 mt-0.5 w-10">{s.time}</span>
          <span className="text-[12px] font-semibold text-blue shrink-0 w-14 truncate">{s.speaker}</span>
          <span className="text-[13px] text-text-sub leading-[1.6]">{s.text}</span>
        </div>
      ))}
    </div>
  )
}

function ActionsTab({ meeting: m, currentUserName, onAddAction }) {
  const items = m.actionItems || []

  if (!items.length) {
    return <p className="text-[13px] text-muted">액션아이템 없음</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map(a => {
        const isMyTask = a.assignee === currentUserName
        return (
          <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border border-line ${a.done ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className={`text-[13px] font-medium ${a.done ? 'line-through text-muted' : 'text-text-primary'}`}>
                {a.text}
              </div>
              <div className="text-[11px] text-soft mt-1">
                {a.assignee}{a.dueDate ? ` · ${a.dueDate}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {a.addedToWeekly && (
                <span className="px-2 py-0.5 rounded bg-green-soft text-green text-[10px] font-semibold">추가됨</span>
              )}
              {!a.addedToWeekly && isMyTask && (
                <button
                  onClick={() => onAddAction(m.id, a)}
                  className="px-2 py-1 rounded-md bg-blue-soft text-blue text-[11px] font-semibold hover:bg-blue hover:text-white transition-colors cursor-pointer"
                >
                  → 추가
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
