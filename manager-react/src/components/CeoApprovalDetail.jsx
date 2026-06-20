import { fmtMoney } from '../data/helpers'

// 대표 결재함 '보기' 클릭 시 상세 — 배경·핵심 금액 강조·유형별 상세 필드.
const TYPE_BADGE = {
  '계약 승인': { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  '예산 승인': { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  '프로젝트 착수 승인': { color: '#0ea874', bg: 'rgba(14,168,116,0.12)' },
  '프로젝트 종료 승인': { color: '#7c4dff', bg: 'rgba(124,77,255,0.12)' },
}

function buildDetail(item) {
  switch (item.type) {
    case '계약 승인':
      return {
        highlight: { label: '계약 금액', value: fmtMoney(item.amount), sub: item.contractType },
        rows: [
          ['거래처', item.client],
          ['계약 기간', item.period],
          ['결제 조건', item.paymentTerms],
          ['작업 범위', item.scope],
        ],
      }
    case '예산 승인':
      return {
        highlight: { label: '신청 금액', value: fmtMoney(item.amount), sub: item.timing },
        rows: [
          ['용도', item.purpose],
          ['관련 프로젝트', item.projectName || item.projectId],
          ['산출 내역', item.breakdown],
          ['외주처', item.vendor],
        ],
      }
    case '프로젝트 착수 승인': {
      const profit = (item.expectedRevenue || 0) - (item.plannedBudget || 0)
      return {
        highlight: {
          label: '예상 이익',
          value: fmtMoney(profit),
          sub: `예상 매출 ${fmtMoney(item.expectedRevenue)} − 투입 원가 ${fmtMoney(item.plannedBudget)}`,
        },
        rows: [
          ['클라이언트', item.client],
          ['예상 기간', item.plannedPeriod],
          ['예상 인원', `${item.plannedHeadcount}명${item.plannedMembers ? ` · ${item.plannedMembers.join(', ')}` : ''}`],
          ['투입 원가(예상)', fmtMoney(item.plannedBudget)],
          ['예상 매출', fmtMoney(item.expectedRevenue)],
        ],
      }
    }
    case '프로젝트 종료 승인':
      return {
        highlight: item.actualInput
          ? { label: '실제 투입', value: fmtMoney(item.actualInput.cost), sub: `${item.actualInput.manDays} 사람·일` }
          : null,
        rows: [
          ['대상 프로젝트', item.projectName || item.projectId],
          ['수행 기간', item.period],
          ['결과 요약', item.resultSummary],
          ['산출물', item.outputs],
          ['클라이언트 피드백', item.clientFeedback],
        ],
      }
    default:
      return { highlight: null, rows: [] }
  }
}

export default function CeoApprovalDetail({ item }) {
  const badge = TYPE_BADGE[item.type] || TYPE_BADGE['계약 승인']
  const { highlight, rows } = buildDetail(item)

  return (
    <>
      <span className="text-[12px] font-semibold px-2 py-0.5 rounded self-start"
        style={{ color: badge.color, background: badge.bg }}>{item.type}</span>
      <div className="text-[18px] font-bold text-text-primary leading-snug">{item.title}</div>
      <div className="text-[12px] text-muted">요청 {item.requester} · {item.requestedAt}</div>

      {item.background && (
        <p className="text-[13px] text-text-sub leading-[1.6] bg-surface-muted rounded-lg px-3.5 py-3">{item.background}</p>
      )}

      {highlight && (
        <div className="rounded-[12px] border border-line px-4 py-3.5">
          <div className="text-[12px] text-muted">{highlight.label}</div>
          <div className="text-[24px] font-bold font-mono tracking-[-0.02em] text-text-primary mt-0.5">{highlight.value}</div>
          {highlight.sub && <div className="text-[11px] text-soft mt-1">{highlight.sub}</div>}
        </div>
      )}

      <div className="h-px bg-line-soft" />

      <div className="flex flex-col gap-3.5">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5">
            <span className="text-[12px] text-muted">{k}</span>
            <span className="text-[14px] text-text-primary leading-[1.55]">{v}</span>
          </div>
        ))}
      </div>
    </>
  )
}
