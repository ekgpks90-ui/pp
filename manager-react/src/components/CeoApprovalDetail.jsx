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
        highlight: item.amount > 0 ? { label: '계약 금액', value: fmtMoney(item.amount), sub: item.contractType } : null,
        rows: [
          ['거래처', item.client],
          ['계약 기간', item.period],
          ['결제 조건', item.paymentTerms],
          ['작업 범위', item.scope],
        ],
      }
    case '예산 승인':
      return {
        highlight: item.amount > 0 ? { label: '신청 금액', value: fmtMoney(item.amount), sub: item.timing } : null,
        rows: [
          ['용도', item.purpose],
          ['관련 프로젝트', item.projectName || item.projectId],
          ['산출 내역', item.breakdown],
          ['외주처', item.vendor],
        ],
      }
    case '프로젝트 착수 승인': {
      const hasMoney = item.expectedRevenue > 0 || item.plannedBudget > 0
      const profit = (item.expectedRevenue || 0) - (item.plannedBudget || 0)
      return {
        highlight: hasMoney ? {
          label: '예상 이익',
          value: fmtMoney(profit),
          sub: `예상 매출 ${fmtMoney(item.expectedRevenue)} − 투입 원가 ${fmtMoney(item.plannedBudget)}`,
        } : null,
        rows: [
          ['클라이언트', item.client],
          ['예상 기간', item.plannedPeriod],
          ['예상 인원', item.plannedHeadcount
            ? `${item.plannedHeadcount}명${item.plannedMembers ? ` · ${item.plannedMembers.join(', ')}` : ''}`
            : null],
          ['투입 원가(예상)', item.plannedBudget > 0 ? fmtMoney(item.plannedBudget) : null],
          ['예상 매출', item.expectedRevenue > 0 ? fmtMoney(item.expectedRevenue) : null],
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

      {item.attachments?.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[12px] text-muted">첨부파일</span>
          {item.attachments.map((f, i) => {
            // 팀장이 결재 요청 시 올린 파일. 다운로드 가능한 소스(url/dataUrl)가 있으면 실제 내려받기 링크로 노출.
            const src = f.url || f.dataUrl || f.href || null
            return (
              <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-surface-muted rounded-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="flex-1 text-[13px] text-text-primary truncate">{f.name}</span>
                {typeof f.size === 'number' && (
                  <span className="text-[11px] text-muted shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                )}
                {src ? (
                  <a href={src} download={f.name}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-blue px-2 py-1 rounded-md border border-line hover:bg-blue-soft transition-colors"
                    title={`${f.name} 다운로드`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    다운로드
                  </a>
                ) : (
                  <span className="shrink-0 text-[11px] text-soft cursor-not-allowed"
                    title="파일 데이터가 저장되지 않아 내려받을 수 없습니다">다운로드 불가</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
