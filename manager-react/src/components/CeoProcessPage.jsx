import { useMemo } from 'react'
import { toDate } from '../data/helpers'
import { StatCard, SectionCard, Panel } from './CeoUI'

// 대표(어드민) Process Management — 프로세스 개요·병목 분석·AI 개선 제안.
// 병목은 "각 단계에 찍힌 작업세션(일) 수"를 작업 집중도 지표로 사용(많을수록 시간이 더 든 단계).

export default function CeoProcessPage({
  processes = [], workItems = [], sessions = [], onNavigate,
}) {
  const d = useMemo(() => {
    const stepTitle = (pid, sid) => processes.find(p => p.id === pid)?.steps.find(s => s.id === sid)?.title || sid

    // 프로세스별 병목(작업세션이 가장 많이 몰린 단계)
    const procStats = processes.map(proc => {
      const wiIds = new Set(workItems.filter(w => w.processId === proc.id).map(w => w.id))
      const procSessions = sessions.filter(s => wiIds.has(s.workItemId) && s.stepId)
      const counts = {}
      procSessions.forEach(s => { counts[s.stepId] = (counts[s.stepId] || 0) + 1 })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
      const bottleneck = sorted.length ? { step: stepTitle(proc.id, sorted[0][0]), days: sorted[0][1] } : null
      return { id: proc.id, category: proc.category, stepCount: proc.steps.length, projectCount: wiIds.size, bottleneck }
    })

    // 평균 프로젝트 기간
    const projects = workItems.filter(wi => !wi.recurringDays && wi.start && wi.end && wi.type !== '회의')
    const durations = projects.map(p => Math.round((toDate(p.end) - toDate(p.start)) / 86400000) + 1)
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const target = Math.max(1, Math.round(avgDuration * 0.83))

    const worstBottleneck = procStats
      .filter(p => p.bottleneck)
      .sort((a, b) => b.bottleneck.days - a.bottleneck.days)[0]

    return { procStats, avgDuration, target, worstBottleneck }
  }, [processes, workItems, sessions])

  return (
    <div className="flex-1 overflow-auto px-7 pt-[18px] pb-7">
      <Panel>
        <StatCard val={d.procStats.length} label="등록 프로세스" color="#2563eb" bar="bg-blue" />
        <StatCard val={`${d.avgDuration}일`} label="평균 프로젝트 기간" color="#7c4dff" bar="bg-purple" />
        <StatCard val={d.worstBottleneck ? d.worstBottleneck.bottleneck.step : '—'} label="최대 병목 단계" color="#dc2626" bar="bg-red" />
        <StatCard val={`${d.target}일`} note="AI" label="단축 목표 기간" color="#0ea874" bar="bg-green" />
      </Panel>

      <div className="grid grid-cols-3 gap-4 items-start mt-4">
        {/* 프로세스 목록 */}
        <SectionCard title="프로세스" className="col-span-2"
          action={<button onClick={() => onNavigate?.('process')} className="text-[11px] text-muted hover:text-blue cursor-pointer">프로세스 관리 →</button>}>
          <div className="p-2.5 grid grid-cols-2 gap-1.5">
            {d.procStats.map(p => (
              <div key={p.id} className="px-3.5 py-3 rounded-lg border border-line-soft hover:bg-surface-hover transition-colors">
                <div className="text-[13px] font-semibold text-text-sub truncate">{p.category}</div>
                <div className="text-[11px] text-soft mt-1">{p.stepCount}단계 · 프로젝트 {p.projectCount}건</div>
                {p.bottleneck && (
                  <div className="text-[11px] text-red mt-1.5">병목: {p.bottleneck.step} ({p.bottleneck.days}일)</div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AI 개선 */}
        <SectionCard title="AI 개선">
          <div className="p-[14px_16px_16px] flex flex-col gap-3">
            <div>
              <div className="text-[11.5px] text-muted">현재 평균 프로젝트 기간</div>
              <div className="text-[22px] font-bold font-mono text-text-primary mt-0.5">{d.avgDuration}일</div>
            </div>
            <div className="h-px bg-line-soft" />
            <div className="flex flex-col gap-2">
              {d.worstBottleneck && (
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0 bg-red" />
                  <span className="text-[12.5px] text-text-sub leading-snug">
                    <b>{d.worstBottleneck.category}</b>의 <b>{d.worstBottleneck.bottleneck.step}</b> 단계에 작업이 집중 — 인력 보강·병렬화 검토
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full mt-[6px] shrink-0 bg-green" />
                <span className="text-[12.5px] text-text-sub leading-snug">
                  병목 단계 개선 시 평균 <b>{d.avgDuration}일 → {d.target}일</b>까지 단축 가능
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
