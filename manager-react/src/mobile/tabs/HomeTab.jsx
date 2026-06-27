// 홈 탭 — Figma "모바일 버전(팀장)" home 화면 설계도 반영.
// 결재요청 알림 → 오늘의 요약(할 일/미팅/마감 임박) → 이번 주 업무(캘린더 스트립+목록) → 빠른 실행.
import { COLOR } from '../theme'
import { IconCheckSquare, IconCalendar, IconClock, IconChevronRight, IconFileText, IconSettings } from '../icons'
import {
  homeSummary, todayStats, getProjects, sortProjects,
  pendingRequests, pendingLeaves, TODAY_ISO,
} from '../derive'
import { addDays } from '../../data/helpers'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const fmt = iso => { const [, m, d] = iso.split('-'); return `${+m}/${+d}` }

// 오늘부터 7일 롤링 스트립 (0=오늘, 1=내일, 그 외 요일 글자)
function rollingDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TODAY_ISO, i)
    const label = i === 0 ? '오늘' : i === 1 ? '내일' : DOW[new Date(date).getDay()]
    return { date, label, day: +date.split('-')[2], isToday: i === 0 }
  })
}

function SummaryItem({ icon: Icon, tint, color, label, value }) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl border border-line bg-surface p-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: tint }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-muted">{label}</span>
      <span className="text-lg font-bold" style={{ color: color || undefined }}>{value}</span>
    </div>
  )
}

function statusTint(status) {
  if (status === '지연') return { tint: COLOR.dangerSoft, color: COLOR.danger }
  if (status === '진행 중') return { tint: COLOR.primarySoft, color: COLOR.primary }
  return { tint: COLOR.mutedSoft, color: COLOR.muted }
}

export default function HomeTab({
  workItems, sessions, requests, leaves, meetings = [],
  onGoApproval, onOpenView, onOpenProject,
}) {
  const summary = homeSummary(workItems, sessions, requests, leaves)
  const today = todayStats(sessions)
  const todayMeetings = meetings.filter(m => m.date === TODAY_ISO).length
  const pending = pendingRequests(requests).length + pendingLeaves(leaves).length
  const projects = sortProjects(getProjects(workItems, sessions)).slice(0, 5)
  const days = rollingDays()

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-3">
      {/* 결재 요청 알림 */}
      {pending > 0 && (
        <button
          onClick={() => onGoApproval('업무요청')}
          className="flex items-center justify-between rounded-xl p-4 active:opacity-90"
          style={{ background: COLOR.warningSoft }}
        >
          <span className="text-sm font-semibold" style={{ color: COLOR.warning }}>
            결재 요청 {pending}건 →
          </span>
          <IconChevronRight size={16} style={{ color: COLOR.warning }} />
        </button>
      )}

      {/* 오늘의 요약 위젯 */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-muted p-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-text-primary">오늘의 요약</h2>
          <span className="text-[13px] font-medium text-muted">
            {fmt(TODAY_ISO).replace('/', '월 ')}일 기준
          </span>
        </div>
        <div className="flex gap-3">
          <SummaryItem icon={IconCheckSquare} tint={COLOR.primarySoft} color={COLOR.primary} label="오늘 할 일" value={`${today.total}건`} />
          <SummaryItem icon={IconCalendar} tint={COLOR.warningSoft} color={COLOR.warning} label="미팅" value={`${todayMeetings}건`} />
          <SummaryItem icon={IconClock} tint={COLOR.dangerSoft} color={COLOR.danger} label="마감 임박" value={`${summary.dueSoon}건`} />
        </div>
      </div>

      {/* 이번 주 업무 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">이번 주 업무</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map(d => (
            <div
              key={d.date}
              className={`flex w-[60px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2.5 ${
                d.isToday ? '' : 'border border-line bg-surface-muted'}`}
              style={d.isToday ? { background: COLOR.primary } : undefined}
            >
              <span className={`text-xs font-semibold ${d.isToday ? 'text-white' : 'text-text-primary'}`}>{d.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: d.isToday ? 'rgba(255,255,255,0.8)' : COLOR.muted }}>{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {projects.length === 0 && (
            <div className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">이번 주 업무가 없어요.</div>
          )}
          {projects.map(p => {
            const t = statusTint(p.status)
            return (
              <button
                key={p.id}
                onClick={() => onOpenProject?.(p.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 text-left active:bg-surface-hover"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: t.tint }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">{p.title}</span>
                </div>
                {p.end && (
                  <span className="shrink-0 text-[11px] font-medium text-muted">
                    {p.start ? `${fmt(p.start)} ~ ${fmt(p.end)}` : `~ ${fmt(p.end)}`}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 빠른 실행 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">빠른 실행</h2>
        <div className="flex gap-3">
          {[
            { key: 'calendar', label: '캘린더', icon: IconCalendar },
            { key: 'meeting', label: '회의록', icon: IconFileText },
            { key: 'process', label: '프로세스', icon: IconSettings },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => onOpenView(m.key)}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-surface-muted p-4 active:bg-surface-hover"
            >
              <m.icon size={24} style={{ color: COLOR.primary }} />
              <span className="text-[13px] font-semibold text-text-primary">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
