import { useState, useEffect, useRef } from 'react'
import { TEAM_ORDER, ETC_TEAM, TODAY_ISO } from '../data/helpers'

const AVATAR_COLORS = ['#53BDCF','#66B5F8','#7DDFC3','#A5AFFB','#DBA5F5','#FF647C','#FFA26B','#A5AFFB']

function memberColor(idx) { return AVATAR_COLORS[idx % AVATAR_COLORS.length] }

// 요청 팀 드롭다운에서 '대표님(결재 요청)'을 나타내는 특수 값.
const CEO_TARGET = '__ceo__'

// 대표 결재 유형 — 대표 결재함(approvalItems)·CeoApprovalDetail과 동일한 유형 사용.
const APPROVAL_TYPES = ['계약 승인', '프로젝트 착수 승인', '예산 승인', '프로젝트 종료 승인']

// 결재 유형별 추가 입력 필드 — CeoApprovalDetail이 읽는 키와 동일하게 맞춘다.
const APPROVAL_FIELDS = {
  '계약 승인': [
    { key: 'client', label: '거래처', type: 'text' },
    { key: 'contractType', label: '계약 형태', type: 'text', placeholder: '예: 신규 (연간)' },
    { key: 'amount', label: '계약 금액(원)', type: 'number' },
    { key: 'period', label: '계약 기간', type: 'text', placeholder: '예: 2026-07-01 ~ 2026-12-31' },
    { key: 'paymentTerms', label: '결제 조건', type: 'text', placeholder: '예: 착수금 30% · 잔금 70%' },
    { key: 'scope', label: '작업 범위', type: 'textarea' },
  ],
  '프로젝트 착수 승인': [
    { key: 'client', label: '클라이언트', type: 'text' },
    { key: 'projectName', label: '프로젝트명', type: 'text' },
    { key: 'plannedPeriod', label: '예상 기간', type: 'text', placeholder: '예: 2026-07-01 ~ 2026-09-30 (3개월)' },
    { key: 'plannedHeadcount', label: '예상 인원(명)', type: 'number' },
    { key: 'plannedMembers', label: '예상 투입 인원(쉼표로 구분)', type: 'text', placeholder: '예: 장준혁, 최유진' },
    { key: 'plannedBudget', label: '투입 원가 예상(원)', type: 'number' },
    { key: 'expectedRevenue', label: '예상 매출(원)', type: 'number' },
  ],
  '예산 승인': [
    { key: 'amount', label: '신청 금액(원)', type: 'number' },
    { key: 'purpose', label: '용도', type: 'text' },
    { key: 'projectName', label: '관련 프로젝트', type: 'text' },
    { key: 'breakdown', label: '산출 내역', type: 'textarea' },
    { key: 'vendor', label: '외주처', type: 'text' },
    { key: 'timing', label: '집행 시점', type: 'text', placeholder: '예: 6월 4주차 집행' },
  ],
  '프로젝트 종료 승인': [
    { key: 'projectName', label: '대상 프로젝트', type: 'text' },
    { key: 'period', label: '수행 기간', type: 'text' },
    { key: 'resultSummary', label: '결과 요약', type: 'textarea' },
    { key: 'outputs', label: '산출물', type: 'textarea' },
    { key: 'clientFeedback', label: '클라이언트 피드백', type: 'textarea' },
    { key: 'actualCost', label: '실제 투입 비용(원)', type: 'number' },
    { key: 'actualManDays', label: '실제 투입(사람·일)', type: 'number' },
  ],
}

export default function NewRequestModal({ processes, teamMembers, currentUser, onSubmit, onSubmitApproval, onClose }) {
  // 요청 팀 옵션 = 내 팀 + 다른 팀(TEAM_ORDER, '기타' 제외). 중복 제거.
  const teamOptions = [...new Set(
    [currentUser?.team, ...TEAM_ORDER.filter(t => t !== ETC_TEAM)].filter(Boolean)
  )]

  const [requestTarget, setRequestTarget] = useState(currentUser?.team || teamOptions[0] || '')
  const isCeoMode = requestTarget === CEO_TARGET

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('일반')
  const [deadline, setDeadline] = useState('')
  const [selectedProcessId, setSelectedProcessId] = useState(processes[0]?.id || '')
  const [stepAssignees, setStepAssignees] = useState({})
  const [stepDeadlines, setStepDeadlines] = useState({}) // { stepId: 'YYYY-MM-DD' }
  const [openStepId, setOpenStepId] = useState(null)
  const panelRef = useRef(null)

  // 대표 결재 폼 상태
  const [apprType, setApprType] = useState(APPROVAL_TYPES[0])
  const [background, setBackground] = useState('')
  const [apprFields, setApprFields] = useState({})
  const [attachments, setAttachments] = useState([]) // 첨부파일 [{ name, size }]

  const setApprField = (key, value) => setApprFields(prev => ({ ...prev, [key]: value }))

  const addFiles = (fileList) => {
    const picked = Array.from(fileList || []).map(f => ({ name: f.name, size: f.size }))
    if (picked.length) setAttachments(prev => [...prev, ...picked])
  }
  const removeFile = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))

  const selectedProcess = processes?.find(p => p.id === selectedProcessId)
  const steps = selectedProcess?.steps || []

  useEffect(() => {
    const sa = {}
    ;(selectedProcess?.steps || []).forEach(s => { sa[s.id] = [] })
    setStepAssignees(sa)
    setStepDeadlines({})
    setOpenStepId(null)
  }, [selectedProcessId])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpenStepId(null); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!openStepId) return
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpenStepId(null)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [openStepId])

  const availableMembers = (teamMembers || []).filter(m => !m.onLeave)

  function toggleMember(stepId, name) {
    setStepAssignees(prev => {
      const curr = prev[stepId] || []
      return { ...prev, [stepId]: curr.includes(name) ? curr.filter(n => n !== name) : [...curr, name] }
    })
  }

  function removeMember(stepId, name) {
    setStepAssignees(prev => ({ ...prev, [stepId]: (prev[stepId] || []).filter(n => n !== name) }))
  }

  const allAssignees = [...new Set(Object.values(stepAssignees).flat())]

  // 숫자 필드 파싱 — 빈 값은 undefined로 떨궈서 결재 상세에서 0원 표기를 피한다.
  const numOrUndef = (v) => {
    if (v === '' || v == null) return undefined
    const n = Number(String(v).replace(/[, ]/g, ''))
    return Number.isFinite(n) ? n : undefined
  }
  const textOrUndef = (v) => (v && v.trim() ? v.trim() : undefined)

  // 폼 유효성 — 팀 모드는 제목만 필수(마감일 선택), 결재 모드는 필수 항목 없음.
  const canSubmit = isCeoMode ? true : Boolean(title.trim())

  const buildApprovalItem = () => {
    const base = {
      id: `ap-${Date.now()}`,
      type: apprType,
      title: title.trim() || '(제목 없음)',
      requester: currentUser?.name || '',
      requestedAt: TODAY_ISO,
      status: '대기',
      background: textOrUndef(background),
      attachments: attachments.length ? attachments : undefined,
    }
    const f = apprFields
    switch (apprType) {
      case '계약 승인':
        return { ...base, client: textOrUndef(f.client), contractType: textOrUndef(f.contractType),
          amount: numOrUndef(f.amount), period: textOrUndef(f.period),
          paymentTerms: textOrUndef(f.paymentTerms), scope: textOrUndef(f.scope) }
      case '프로젝트 착수 승인':
        return { ...base, client: textOrUndef(f.client), projectName: textOrUndef(f.projectName),
          plannedPeriod: textOrUndef(f.plannedPeriod), plannedHeadcount: numOrUndef(f.plannedHeadcount),
          plannedMembers: f.plannedMembers && f.plannedMembers.trim()
            ? f.plannedMembers.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          plannedBudget: numOrUndef(f.plannedBudget), expectedRevenue: numOrUndef(f.expectedRevenue) }
      case '예산 승인':
        return { ...base, amount: numOrUndef(f.amount), purpose: textOrUndef(f.purpose),
          projectName: textOrUndef(f.projectName), breakdown: textOrUndef(f.breakdown),
          vendor: textOrUndef(f.vendor), timing: textOrUndef(f.timing) }
      case '프로젝트 종료 승인': {
        const cost = numOrUndef(f.actualCost)
        const manDays = numOrUndef(f.actualManDays)
        return { ...base, projectName: textOrUndef(f.projectName), period: textOrUndef(f.period),
          resultSummary: textOrUndef(f.resultSummary), outputs: textOrUndef(f.outputs),
          clientFeedback: textOrUndef(f.clientFeedback),
          actualInput: (cost != null || manDays != null) ? { cost, manDays } : undefined }
      }
      default:
        return base
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return

    if (isCeoMode) {
      onSubmitApproval?.(buildApprovalItem())
      onClose()
      return
    }

    onSubmit({
      id: `ar-${Date.now()}`,
      title: title.trim(),
      team: requestTarget,
      hours: 0,
      deadline,
      priority,
      status: '신규요청',
      assignees: allAssignees,
      processId: selectedProcessId,
      stepAssignees,
      stepDeadlines,
    })
    onClose()
  }

  const inputCls = 'w-full h-9 px-3 text-[13px] border border-line rounded-[8px] bg-white text-text-primary outline-none focus:border-blue transition-colors'
  const labelCls = 'text-[12px] font-medium text-text-sub mb-1.5 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-[14px] shadow-lg w-[520px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-line flex items-center justify-between shrink-0">
          <h3 className="text-[15px] font-semibold text-text-primary">{isCeoMode ? '대표 결재 요청' : '새 업무요청'}</h3>
          <button onClick={onClose} className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-muted cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* 제목 */}
          <div>
            <label className={labelCls}>{isCeoMode ? '결재 제목' : '업무 제목 *'}</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isCeoMode ? '결재 제목을 입력하세요' : '업무 제목을 입력하세요'}
              className={inputCls}
              autoFocus
            />
          </div>

          {/* 요청 팀 — 드롭다운(내 팀 + 다른 팀 + 대표님). 대표님 선택 시 결재 폼으로 전환 */}
          <div>
            <label className={labelCls}>요청 팀</label>
            <select
              value={requestTarget}
              onChange={e => setRequestTarget(e.target.value)}
              className={inputCls + ' cursor-pointer'}
            >
              <optgroup label="팀">
                {teamOptions.map(t => (
                  <option key={t} value={t}>{t === currentUser?.team ? `${t} (내 팀)` : t}</option>
                ))}
              </optgroup>
              <optgroup label="결재">
                <option value={CEO_TARGET}>👤 대표님 (결재 요청)</option>
              </optgroup>
            </select>
          </div>

          {isCeoMode ? (
            <>
              {/* 결재 유형 */}
              <div>
                <label className={labelCls}>결재 유형</label>
                <select value={apprType} onChange={e => setApprType(e.target.value)} className={inputCls + ' cursor-pointer'}>
                  {APPROVAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* 요청 사유 */}
              <div>
                <label className={labelCls}>요청 사유</label>
                <textarea
                  value={background}
                  onChange={e => setBackground(e.target.value)}
                  placeholder="결재가 필요한 배경·사유를 입력하세요"
                  rows={3}
                  className={inputCls + ' h-auto py-2 resize-y leading-[1.5]'}
                />
              </div>

              {/* 유형별 상세 필드 */}
              <div className="grid grid-cols-2 gap-3">
                {(APPROVAL_FIELDS[apprType] || []).map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                    <label className={labelCls}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={apprFields[field.key] || ''}
                        onChange={e => setApprField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={2}
                        className={inputCls + ' h-auto py-2 resize-y leading-[1.5]'}
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={apprFields[field.key] || ''}
                        onChange={e => setApprField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={inputCls}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 첨부파일 — 사업계획서·견적서 등 문서 업로드(선택) */}
              <div>
                <label className={labelCls}>첨부파일</label>
                <label className="flex items-center justify-center gap-2 h-[72px] border border-dashed border-line rounded-[8px] text-[12px] text-muted cursor-pointer hover:border-blue hover:text-blue transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>사업계획서·견적서 등 파일 추가</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => { addFiles(e.target.files); e.target.value = '' }}
                  />
                </label>
                {attachments.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {attachments.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-surface-muted rounded-[8px]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="flex-1 text-[12px] text-text-primary truncate">{f.name}</span>
                        <span className="text-[10px] text-muted shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="w-4 h-4 grid place-items-center rounded-full text-muted hover:text-red cursor-pointer shrink-0"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
          <>
          {/* 우선순위 + 마감일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>우선순위</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls + ' cursor-pointer'}>
                <option value="일반">일반</option>
                <option value="긴급">긴급</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>마감일</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputCls + ' cursor-pointer'} />
            </div>
          </div>

          {/* 프로세스 selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted shrink-0">프로세스</span>
            <select
              value={selectedProcessId}
              onChange={e => setSelectedProcessId(e.target.value)}
              className="flex-1 text-[12px] font-medium text-text-primary border border-line rounded-[6px] px-2 py-1 bg-white outline-none focus:border-blue cursor-pointer"
            >
              {(processes || []).map(p => (
                <option key={p.id} value={p.id}>{p.category}</option>
              ))}
            </select>
          </div>

          {/* Steps */}
          {steps.length === 0 ? (
            <div className="text-[13px] text-muted text-center py-4">연결된 프로세스 단계가 없습니다.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {steps.map((step, si) => {
                const assigned = stepAssignees[step.id] || []
                const isOpen = openStepId === step.id
                return (
                  <div key={step.id} className="relative">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] border transition-colors ${isOpen ? 'border-blue/40 bg-blue/5' : 'border-transparent hover:bg-surface-muted'}`}>
                      <span className="w-5 h-5 rounded-full bg-line text-[10px] font-bold text-muted flex items-center justify-center shrink-0">
                        {si + 1}
                      </span>
                      <span className="flex-1 text-[13px] text-text-primary">{step.title}</span>
                      <div className="flex items-center">
                        {assigned.map((name, ai) => {
                          const mIdx = (teamMembers || []).findIndex(m => m.name === name)
                          return (
                            <div key={name} className="relative group" style={{ marginLeft: ai > 0 ? -6 : 0 }}>
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                                style={{ background: memberColor(mIdx >= 0 ? mIdx : 0) }}
                                title={name}
                              >{name[0]}</span>
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removeMember(step.id, name) }}
                                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6b7280] text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                              >✕</button>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenStepId(isOpen ? null : step.id)}
                        className="w-6 h-6 rounded-full border border-line bg-white flex items-center justify-center text-muted hover:border-blue hover:text-blue transition-colors cursor-pointer shrink-0"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>

                    {/* 단계별 데드라인 — 팀장이 최소한의 마감일을 설정해 요청 */}
                    <div className="flex items-center gap-1.5 pl-8 mt-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span className="text-[11px] text-muted shrink-0">데드라인</span>
                      <input
                        type="date"
                        value={stepDeadlines[step.id] || ''}
                        onChange={e => setStepDeadlines(prev => ({ ...prev, [step.id]: e.target.value }))}
                        className="h-7 px-2 text-[11px] border border-line rounded-[6px] bg-white text-text-primary outline-none focus:border-blue cursor-pointer"
                      />
                    </div>

                    {isOpen && (
                      <div
                        ref={panelRef}
                        className="absolute right-0 top-[calc(100%+4px)] z-20 bg-white border border-line rounded-[10px] shadow-lg w-[220px] py-1 max-h-[200px] overflow-y-auto"
                      >
                        {availableMembers.length === 0 && (
                          <div className="px-3 py-3 text-[12px] text-muted text-center">팀원이 없습니다</div>
                        )}
                        {availableMembers.map((m, i) => {
                          const mIdx = (teamMembers || []).indexOf(m)
                          const checked = assigned.includes(m.name)
                          return (
                            <div
                              key={m.id}
                              onClick={() => toggleMember(step.id, m.name)}
                              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-blue/5' : 'hover:bg-surface-muted'}`}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                                style={{ background: memberColor(mIdx >= 0 ? mIdx : i) }}
                              >{m.name[0]}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-medium text-text-primary">{m.name}</div>
                                <div className="text-[10px] text-muted">{m.role}</div>
                              </div>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue border-blue' : 'border-[#d1d5db]'}`}>
                                {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 총 배정 인원 */}
          {allAssignees.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-line">
              <span className="text-[12px] text-muted shrink-0">총 배정 인원</span>
              <div className="flex items-center gap-1 flex-wrap">
                {allAssignees.map(name => {
                  const mIdx = (teamMembers || []).findIndex(m => m.name === name)
                  return (
                    <div key={name} className="flex items-center gap-1 bg-surface-muted rounded-full pl-0.5 pr-2 py-0.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                        style={{ background: memberColor(mIdx >= 0 ? mIdx : 0) }}
                      >{name[0]}</span>
                      <span className="text-[11px] text-text-primary">{name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          </>
          )}

          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 text-[13px] font-medium text-muted border border-line rounded-[8px] hover:border-[#d0d0d8] hover:text-text-sub transition-colors cursor-pointer"
            >취소</button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-9 text-[13px] font-medium text-white bg-text-primary rounded-[8px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >{isCeoMode ? '결재 요청' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
