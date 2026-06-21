import { useState, useEffect, useRef } from 'react'
import { TODAY_ISO, isDelayed, fmtDeadline } from '../data/helpers'
import { processes, currentUser, teamMembers } from '../data/state'

const WORK_ITEM_TYPE_COLOR = {
  '고정': { bg: '#dbeafe', text: '#1d4ed8' },
  '긴급': { bg: '#fee2e2', text: '#dc2626' },
  '일반': { bg: '#f3f4f6', text: '#374151' },
  '회의': { bg: '#fef3c7', text: '#92400e' },
}

// 업무항목은 "완료 상태"를 만들지 않는다(제품 규칙). 홈과 동일한 지연 판정.
function getWorkItemStatus(wi, sessions) {
  if (wi.start > TODAY_ISO) return '시작 전'
  if (isDelayed(wi, TODAY_ISO, sessions)) return '지연'
  return '진행 중'
}

export default function CalendarDetailPanel({ item, sessions, resources = [], onAddResource, onRemoveResource, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const fileInputRef = useRef(null)

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

  const status = getWorkItemStatus(item, sessions)
  const tc = WORK_ITEM_TYPE_COLOR[item.type] || WORK_ITEM_TYPE_COLOR['일반']
  const statusColors = { '진행 중': '#2563eb', '시작 전': '#9ca3af', '지연': '#dc2626' }
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

  // 프로세스 단계별 참여자 (홈 업무 상세의 '참여자' 섹션과 동일)
  const proc = item.processId ? processes.find(p => p.id === item.processId) : null
  const stepAssignees = item.stepAssignees || {}
  const stepDeadlines = item.stepDeadlines || {}
  // 단계 데드라인: 명시값 없으면 업무 마감일(end)로 파생. 고정 업무는 마감 없음.
  const stepDeadline = (stepId) => stepDeadlines[stepId] ?? (item.type !== '고정' ? (item.end || null) : null)
  const myName = currentUser.name
  const mySteps = proc ? proc.steps.filter(s => (stepAssignees[s.id] || []).includes(myName)) : []
  const stepsToRender = proc ? (showAllSteps ? proc.steps : mySteps) : []
  const itemDelayed = isDelayed(item, TODAY_ISO, sessions)
  const isPersonDelayed = (stepId, name) => {
    if (!itemDelayed) return false
    const member = teamMembers.find(m => m.name === name)
    return !!member && sessions.some(s => s.stepId === stepId && s.authorId === member.id && !s.done)
  }

  // 아웃풋/리소스 핸들러 (본인이 올린 것만 삭제 가능 — 원본과 동일)
  const handleAddLink = () => {
    const name = linkInput.trim()
    if (!name || !onAddResource) return
    onAddResource(item.id, { id: `res-${Date.now()}`, name, type: '링크', uploadedBy: myName })
    setLinkInput('')
  }
  const handleAddFile = () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !onAddResource) return
    onAddResource(item.id, { id: `res-${Date.now()}`, name: file.name, type: '파일', uploadedBy: myName })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

          {/* 프로세스 단계별 참여자 (홈 업무 상세와 동일) */}
          {proc && (
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-text-primary">참여자</span>
              <span className="text-[11px] text-muted">
                {showAllSteps ? `전체 ${proc.steps.length}개 단계` : `내 담당 (${mySteps.length}개)`}
              </span>
              <div className="flex flex-col gap-1.5">
                {stepsToRender.length === 0 ? (
                  <span className="text-[12px] text-soft py-1">담당한 단계가 없습니다.</span>
                ) : (
                  stepsToRender.map(step => {
                    const assignees = stepAssignees[step.id] || []
                    const isMyStep = assignees.includes(myName)
                    const stepDelayed = assignees.some(name => isPersonDelayed(step.id, name))
                    return (
                      <div
                        key={step.id}
                        className={`flex flex-col gap-1 px-2.5 py-2 rounded-lg border ${stepDelayed ? 'border-red/40 bg-red-soft/30' : 'border-line-soft bg-surface-muted'}`}
                      >
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-[12px] ${isMyStep ? 'font-semibold text-blue' : 'text-text-sub'}`}>
                            {step.title}
                          </span>
                          {stepDeadline(step.id) && (
                            <span className="text-[11px] font-semibold text-muted shrink-0" title="단계 데드라인">{fmtDeadline(stepDeadline(step.id))}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {assignees.length === 0 ? (
                            <span className="text-[11px] text-soft">미배정</span>
                          ) : (
                            assignees.map(name => {
                              const personDelayed = isPersonDelayed(step.id, name)
                              return (
                                <div key={name} className={`flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full text-[11px] ${personDelayed ? 'bg-red-soft text-red' : 'bg-white border border-line text-text-sub'}`}>
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-semibold ${personDelayed ? 'bg-red' : 'bg-blue'}`}>{name[0]}</div>
                                  <span>{name}</span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAllSteps(v => !v)}
                className="self-start text-[12px] text-blue hover:underline cursor-pointer"
              >
                {showAllSteps ? '내 담당만 보기' : `전체 ${proc.steps.length}개 단계 보기`}
              </button>
            </div>
          )}

          {/* 아웃풋 / 리소스 */}
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-2">아웃풋 / 리소스</div>
            {resources.length === 0 ? (
              <p className="text-[12px] text-muted mb-2">등록된 리소스가 없습니다</p>
            ) : (
              <div className="flex flex-col gap-1.5 mb-2">
                {resources.map(r => {
                  const canDelete = r.uploadedBy === myName
                  return (
                    <div key={r.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-line-soft bg-surface-muted">
                      <span className="text-[14px] shrink-0">{r.type === '링크' ? '🔗' : '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-text-primary truncate">{r.name}</div>
                        <div className="text-[10px] text-soft">by {r.uploadedBy}</div>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onRemoveResource?.(item.id, r.id)}
                          className="text-soft hover:text-red transition-colors cursor-pointer shrink-0"
                          title="삭제"
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] shrink-0">🔗</span>
                <input
                  type="url"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddLink() }}
                  placeholder="링크 URL 입력"
                  className="flex-1 min-w-0 h-8 px-2.5 text-[12px] border border-line rounded-lg outline-none focus:border-blue"
                />
                <button type="button" onClick={handleAddLink}
                  className="h-8 px-3 text-[12px] font-medium text-white bg-blue rounded-lg hover:opacity-90 transition-opacity cursor-pointer shrink-0">추가</button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] shrink-0">📁</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="flex-1 min-w-0 text-[11px] text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-surface-muted file:text-text-sub"
                />
                <button type="button" onClick={handleAddFile}
                  className="h-8 px-3 text-[12px] font-medium text-white bg-blue rounded-lg hover:opacity-90 transition-opacity cursor-pointer shrink-0">업로드</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
