import { useState, useRef, useEffect } from 'react'
import { TODAY_ISO } from '../data/helpers'

function memberColor(name) {
  const palette = ['#53BDCF', '#66B5F8', '#7DDFC3', '#A5AFFB', '#DBA5F5', '#FF647C', '#FFA26B']
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff
  return palette[h % palette.length]
}

export default function ScheduleMeetingModal({ teamMembers, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(TODAY_ISO)
  const [time, setTime] = useState('')
  const [room, setRoom] = useState('회의실 A')
  const [attendees, setAttendees] = useState([])
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!showDropdown) return
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showDropdown])

  const filteredMembers = teamMembers.filter(m =>
    !query || m.name.toLowerCase().includes(query.toLowerCase())
  )

  const toggleAttendee = (member) => {
    setAttendees(prev =>
      prev.find(a => a.id === member.id)
        ? prev.filter(a => a.id !== member.id)
        : [...prev, member]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    onSave({
      title: title.trim(),
      date,
      time,
      room,
      attendeeNames: attendees.map(m => m.name),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-xl w-[440px] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-[15px] font-semibold">회의 등록</h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-text-primary cursor-pointer text-lg">&times;</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">회의 제목</span>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="회의 제목을 입력하세요"
              className="h-9 px-3 text-[14px] border border-line rounded-lg outline-none focus:border-blue"
              autoFocus />
          </label>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">날짜</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] text-muted font-medium">시간</span>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue" />
            </label>
          </div>

          {/* Room */}
          <label className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">회의실</span>
            <select value={room} onChange={e => setRoom(e.target.value)}
              className="h-9 px-3 text-[13px] border border-line rounded-lg outline-none focus:border-blue bg-white">
              <option>회의실 A</option>
              <option>회의실 B</option>
              <option>회의실 C</option>
              <option>온라인 (Zoom)</option>
            </select>
          </label>

          {/* Attendees */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-muted font-medium">참석자</span>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {attendees.map(m => (
                <span key={m.id} className="flex items-center gap-1 px-2 py-0.5 bg-surface-muted rounded-md text-[12px]">
                  {m.name}
                  <button type="button" onClick={() => setAttendees(prev => prev.filter(a => a.id !== m.id))}
                    className="text-muted hover:text-red cursor-pointer text-[10px]">✕</button>
                </span>
              ))}
            </div>
            <div className="relative" ref={dropdownRef}>
              <input value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="참석자 검색..."
                className="w-full h-8 px-3 text-[12px] border border-line rounded-lg outline-none focus:border-blue" />
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
        </div>

        <div className="px-6 py-4 border-t border-line">
          <button type="submit" disabled={!title.trim() || !date}
            className={`w-full h-10 text-[13px] font-semibold rounded-lg transition-all cursor-pointer
              ${title.trim() && date ? 'bg-blue text-white hover:opacity-90' : 'bg-line text-soft cursor-not-allowed'}`}>
            등록하기
          </button>
        </div>
      </form>
    </div>
  )
}
