import { fmtMoney } from '../data/helpers'
import { ProgressBar } from './CeoUI'

// 대표 홈 Project Status 항목 클릭 시 상세 — 진행률·기간·투입 인원(직급별 단가)·투입/투자·단계 진행.
const STATUS_COLOR = { '진행 중': '#2563eb', '지연': '#dc2626', '시작 전': '#72728a' }
const STATUS_BG = { '진행 중': 'var(--color-blue-soft)', '지연': 'var(--color-red-soft)', '시작 전': 'var(--color-surface-muted)' }

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="text-[14px] text-text-primary">{value}</span>
    </div>
  )
}

export default function CeoProjectDetail({ project, sessions = [], processes = [], teamMembers = [], gradeRates = {}, showMoney = true }) {
  const p = project
  const proc = p.processId ? processes.find(x => x.id === p.processId) : null
  const wiSessions = sessions.filter(s => s.workItemId === p.id)
  const doneStepIds = new Set(wiSessions.map(s => s.stepId).filter(Boolean))
  const members = (p.participants || []).map(name => {
    const m = teamMembers.find(t => t.name === name)
    return { name, grade: m?.grade || '-', rate: m ? (gradeRates[m.grade] || 0) : 0 }
  })

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold px-2 py-0.5 rounded self-start"
          style={{ color: STATUS_COLOR[p.status], background: STATUS_BG[p.status] }}>{p.status}</span>
        {p.status === '지연' && <span className="text-[12px] font-semibold text-red">+{p.od}일 초과</span>}
      </div>

      <div className="text-[18px] font-bold text-text-primary">{p.title}</div>
      {p.description && <p className="text-[13px] text-muted leading-[1.6]">{p.description}</p>}

      {/* 진행률 */}
      <div>
        <div className="flex justify-between text-[12px] text-muted mb-1.5"><span>진행률</span><span className="font-mono">{p.progress}%</span></div>
        <ProgressBar value={p.progress} color={STATUS_COLOR[p.status]} />
      </div>

      {/* 기간 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일" value={p.start || '—'} />
        <Field label="마감일" value={p.end || '—'} />
      </div>

      {/* 투입 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="투입 인원" value={`${p.hc}명`} />
        <Field label="투입 공수" value={`누적 ${p.mdElapsed} / 예상 ${p.mdTotal} 사람·일`} />
      </div>
      {showMoney && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="누적 투자" value={`≈${fmtMoney(p.costElapsed)}`} />
          <Field label="예상 총 투자" value={`≈${fmtMoney(p.costTotal)}`} />
        </div>
      )}
      {p.status === '지연' && showMoney && (
        <div className="px-3 py-2.5 rounded-lg bg-red-soft/50 text-[12px] text-red leading-[1.5]">
          지연 추가비용 발생 — 투입 {fmtMoney(p.baseCost)} + 추가 {fmtMoney(p.addCost)} = <b>{fmtMoney(p.baseCost + p.addCost)}</b>
        </div>
      )}

      {/* 투입 인원 명단 */}
      <div>
        <span className="text-[13px] font-semibold text-text-primary">투입 인원 {showMoney && '(직급별 단가)'}</span>
        <div className="flex flex-col gap-1 mt-2">
          {members.length === 0 && <span className="text-[12px] text-soft">배정된 인원이 없습니다</span>}
          {members.map(m => (
            <div key={m.name} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-muted text-[12px]">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue flex items-center justify-center text-white text-[10px] font-semibold">{m.name[0]}</span>
                {m.name} · {m.grade}
              </span>
              {showMoney && <span className="text-muted font-mono">{fmtMoney(m.rate)}/일</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 단계별 진행 */}
      {proc && (
        <div>
          <span className="text-[13px] font-semibold text-text-primary">단계 진행 ({doneStepIds.size}/{proc.steps.length})</span>
          <div className="flex flex-col gap-1.5 mt-2">
            {proc.steps.map(s => {
              const active = doneStepIds.has(s.id)
              return (
                <div key={s.id} className={`flex items-center gap-2 text-[12px] ${active ? 'text-text-sub' : 'text-soft'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-blue' : 'bg-line'}`} />
                  {s.title}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
