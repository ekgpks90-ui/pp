import { useState, useRef, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

export default function MeetingSaveModal({ duration, teamMembers, meeting, onClose, onSave }) {
  const isEdit = !!meeting
  const [title, setTitle] = useState(meeting?.title || '')
  const [team, setTeam] = useState(meeting?.team || '디자인팀')
  const [type, setType] = useState(meeting?.type || '주간 회의')
  const [date, setDate] = useState(meeting?.date || TODAY_ISO)
  const [content, setContent] = useState(meeting?.summary || '')
  const [attendees, setAttendees] = useState(() =>
    (meeting?.attendeeNames || []).map(name =>
      teamMembers.find(tm => tm.name === name) || { id: name, name }
    )
  )
  const [attendeeQuery, setAttendeeQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [actionItems, setActionItems] = useState(meeting?.actionItems || [])
  const searchRef = useRef(null)
  const effectiveDuration = isEdit ? (meeting.duration || '') : duration

  // 참석자 드롭다운: 바깥 영역을 클릭하면 닫는다.
  useEffect(() => {
    if (!showDropdown) return
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showDropdown])

  const filteredMembers = teamMembers.filter(m =>
    !attendeeQuery || m.name.toLowerCase().includes(attendeeQuery.toLowerCase())
  )

  const toggleAttendee = (member) => {
    setAttendees(prev =>
      prev.find(a => a.id === member.id)
        ? prev.filter(a => a.id !== member.id)
        : [...prev, member]
    )
  }

  const removeAttendee = (id) => {
    setAttendees(prev => prev.filter(a => a.id !== id))
  }

  const addActionItem = () => {
    setActionItems(prev => [...prev, { id: `new-act-${Date.now()}`, text: '', dueDate: TODAY_ISO, assignee: '' }])
  }

  const updateActionItem = (id, updates) => {
    setActionItems(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const removeActionItem = (id) => {
    setActionItems(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const attendeeNames = attendees.map(m => m.name)
    // 기존 액션아이템은 id·done·addedToWeekly를 보존하고, 새로 추가한 항목만 새 id 부여
    const builtActionItems = actionItems.filter(a => a.text.trim()).map((a, i) => ({
      id: typeof a.id === 'string' && a.id.startsWith('new-act-') ? `act-${Date.now()}-${i}` : a.id,
      text: a.text.trim(),
      dueDate: a.dueDate,
      assignee: a.assignee,
      done: a.done ?? false,
      addedToWeekly: a.addedToWeekly ?? false,
    }))

    if (isEdit) {
      // 폼에 없는 기존 필드(discussions·script·author 등)는 그대로 보존
      onSave({
        ...meeting,
        team, type, title: title.trim(),
        summary: content || meeting.summary || `${type} 회의가 진행되었습니다.`,
        aiPoints: content ? content.split('\n').filter(Boolean) : (meeting.aiPoints || []),
        actionItems: builtActionItems,
        date,
        attendees: attendeeNames.length || 1,
        attendeeNames,
      })
      return
    }

    onSave({
      id: `mr-${Date.now()}`,
      team, type, title: title.trim(),
      summary: content || `${type} 회의가 진행되었습니다.`,
      aiPoints: content ? content.split('\n').filter(Boolean) : [`${title.trim()} 회의 진행 완료`],
      discussions: [],
      script: [],
      actionItems: builtActionItems,
      date, startTime: '', author: 'Jihye',
      duration, attendees: attendeeNames.length || 1, attendeeNames,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-[15px] font-semibold">{isEdit ? '회의록 수정' : '회의록 저장'}</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">회의 제목</span>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="회의 제목을 입력하세요"
              className="h-9 px-3 text-[14px] border border-line rounded-lg outline-none focus:border-blue"
              autoFocus
            />
          </label>

          {/* Team + Type */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">팀</span>
              <select value={team} onChange={e => setTeam(e.target.value)}
                className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue bg-white">
                <option>디자인팀</option>
                <option>개발팀</option>
                <option>기획팀</option>
                <option>마케팅팀</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">유형</span>
              <select value={type} onChange={e => setType(e.target.value)}
                className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue bg-white">
                <option>주간 회의</option>
                <option>회고</option>
                <option>클라이언트 미팅</option>
                <option>타팀 협업회의</option>
                <option>스프린트 기획</option>
                <option>업무 보고</option>
                <option>기술 공유</option>
                <option>워크샵</option>
                <option>긴급 회의</option>
                <option>디자인 리뷰</option>
              </select>
            </label>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">날짜</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isEdit}
                className={`h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">녹음 시간</span>
              <input type="text" value={effectiveDuration} disabled
                className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none opacity-50 font-mono" />
            </label>
          </div>

          {/* Attendees */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">참석자</span>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {attendees.map(m => (
                <span key={m.id} className="flex items-center gap-1 px-2 py-0.5 bg-surface-muted rounded-md text-[12px]">
                  {m.name}
                  <button type="button" onClick={() => removeAttendee(m.id)} className="text-muted hover:text-red cursor-pointer text-[10px]">✕</button>
                </span>
              ))}
            </div>
            <div className="relative" ref={searchRef}>
              <input
                value={attendeeQuery}
                onChange={e => { setAttendeeQuery(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="참석자 검색..."
                className="w-full h-8 px-3 text-[12px] border border-line rounded-lg outline-none focus:border-blue"
              />
              {showDropdown && filteredMembers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredMembers.map(m => {
                    const selected = !!attendees.find(a => a.id === m.id)
                    return (
                      <div key={m.id} onClick={() => toggleAttendee(m)}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${selected ? 'bg-blue-soft' : 'hover:bg-surface-muted'}`}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                          style={{ background: memberColor(m.name) }}>{m.name[0]}</span>
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">{m.name}</div>
                          <div className="text-[10px] text-soft">{m.role}</div>
                        </div>
                        {selected && <span className="text-blue text-[12px] font-semibold">✓</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">회의 내용</span>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="회의 내용을 입력하세요"
              rows={3}
              className="px-3 py-2 text-[13px] border border-line rounded-lg outline-none focus:border-blue resize-none leading-[1.6]" />
          </label>

          {/* Action Items */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted font-medium">액션아이템</span>
              <button type="button" onClick={addActionItem}
                className="text-[11px] text-blue font-medium hover:text-blue/80 cursor-pointer">+ 추가</button>
            </div>
            {actionItems.map(a => (
              <ActionItemRow
                key={a.id}
                item={a}
                teamMembers={teamMembers}
                onUpdate={(updates) => updateActionItem(a.id, updates)}
                onRemove={() => removeActionItem(a.id)}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line">
          <button type="submit" disabled={!title.trim()}
            className={`w-full h-10 text-[13px] font-semibold rounded-lg transition-all cursor-pointer
              ${title.trim() ? 'bg-blue text-white hover:opacity-90' : 'bg-line text-soft cursor-not-allowed'}`}>
            {isEdit ? '수정 완료' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ActionItemRow({ item, teamMembers, onUpdate, onRemove }) {
  const [showAssignee, setShowAssignee] = useState(false)
  const [assigneeQuery, setAssigneeQuery] = useState(item.assignee || '')

  const filtered = teamMembers.filter(m =>
    !assigneeQuery || m.name.toLowerCase().includes(assigneeQuery.toLowerCase())
  )

  return (
    <div className="flex items-center gap-2">
      <input value={item.text} onChange={e => onUpdate({ text: e.target.value })}
        placeholder="할 일"
        className="flex-1 h-8 px-2.5 text-[12px] border border-line rounded-md outline-none focus:border-blue" />
      <input type="date" value={item.dueDate} onChange={e => onUpdate({ dueDate: e.target.value })}
        className="h-8 px-2 text-[11px] border border-line rounded-md outline-none focus:border-blue w-[110px]" />
      <div className="relative w-[100px]">
        <input value={assigneeQuery}
          onChange={e => { setAssigneeQuery(e.target.value); setShowAssignee(true) }}
          onFocus={() => setShowAssignee(true)}
          placeholder="담당자"
          className="w-full h-8 px-2 text-[11px] border border-line rounded-md outline-none focus:border-blue" />
        {showAssignee && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
            {filtered.map(m => (
              <div key={m.id} onClick={() => { onUpdate({ assignee: m.name }); setAssigneeQuery(m.name); setShowAssignee(false) }}
                className="px-2 py-1.5 text-[11px] hover:bg-surface-muted cursor-pointer">{m.name}</div>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center text-muted hover:text-red cursor-pointer text-[12px]">✕</button>
    </div>
  )
}
