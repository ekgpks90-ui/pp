import { useState, useEffect } from 'react'

const TEAMS = ['기획팀', '마케팅팀', 'HR팀', '경영팀', '개발팀']

export default function NewRequestModal({ processes, teamMembers, onSubmit, onClose }) {
  const [title, setTitle] = useState('')
  const [team, setTeam] = useState(TEAMS[0])
  const [priority, setPriority] = useState('일반')
  const [deadline, setDeadline] = useState('')
  const [hours, setHours] = useState('')
  const [processId, setProcessId] = useState(processes[0]?.id || '')
  const [assignees, setAssignees] = useState([])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleAssignee = (name) => {
    setAssignees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return
    onSubmit({
      id: `ar-${Date.now()}`,
      title: title.trim(),
      team,
      hours: Number(hours) || 0,
      deadline,
      priority,
      status: '신규요청',
      assignees: [],
      processId,
      stepAssignees: {},
    })
    onClose()
  }

  const inputCls = 'w-full h-9 px-3 text-[13px] border border-line rounded-[8px] bg-white text-text-primary outline-none focus:border-blue transition-colors'
  const labelCls = 'text-[12px] font-medium text-text-sub mb-1.5 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-[14px] shadow-lg w-[480px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-line flex items-center justify-between shrink-0">
          <h3 className="text-[15px] font-semibold text-text-primary">새 업무요청</h3>
          <button onClick={onClose} className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-muted cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* 제목 */}
          <div>
            <label className={labelCls}>업무 제목 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="업무 제목을 입력하세요"
              className={inputCls}
              autoFocus
            />
          </div>

          {/* 요청 팀 + 우선순위 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>요청 팀</label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={inputCls + ' cursor-pointer'}>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>우선순위</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls + ' cursor-pointer'}>
                <option value="일반">일반</option>
                <option value="긴급">긴급</option>
              </select>
            </div>
          </div>

          {/* 마감일 + 예상 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>마감일 *</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputCls + ' cursor-pointer'} />
            </div>
            <div>
              <label className={labelCls}>예상 소요 시간</label>
              <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="시간" min="0" className={inputCls} />
            </div>
          </div>

          {/* 프로세스 */}
          <div>
            <label className={labelCls}>프로세스</label>
            <select value={processId} onChange={e => setProcessId(e.target.value)} className={inputCls + ' cursor-pointer'}>
              {processes.map(p => <option key={p.id} value={p.id}>{p.category}</option>)}
            </select>
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !deadline}
              className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
