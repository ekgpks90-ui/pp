// 팀장 모바일 파생 계산 — 전부 "확정 가능한 사실"만 사용한다.
//  - 지연: 마감일 경과 + 미완료 세션 (helpers.isDelayed / enrichProject)
//  - 진행률: 완료 단계(또는 세션) / 전체 (helpers.projectProgress)
//  - 마감 임박: 오늘~+7일 내 납기
//  - 팀원 진행률: 이번 주 업무 완료/전체 (weekWorkItems)
// 가동률(주간 업무 수 ÷ 임의 기준)·과부하/여유 분류는 의도적으로 계산하지 않는다.

import {
  TODAY_ISO, MONDAY_ISO, addDays,
  enrichProject, calcMinutes,
} from '../data/helpers'
import { currentUser, gradeRates, teamMembers } from '../data/state'

// ─── 주차 네비 ────────────────────────────────────────────────────────────────
export function weekStart(offset = 0) { return addDays(MONDAY_ISO, offset * 7) }

function mmdd(iso) {
  const [, m, d] = iso.split('-')
  return `${m}.${d}`
}

export function weekRangeLabel(offset = 0) {
  const s = weekStart(offset)
  return `${mmdd(s)} ~ ${mmdd(addDays(s, 6))}`
}

// 월~금 날짜 배열 (요일 라벨 포함)
export function weekdays(offset = 0) {
  const s = weekStart(offset)
  const labels = ['월', '화', '수', '목', '금']
  return labels.map((label, i) => {
    const date = addDays(s, i)
    return { label, date, isToday: date === TODAY_ISO }
  })
}

// ─── 프로젝트 ─────────────────────────────────────────────────────────────────
// 우리 팀 프로젝트 = 회의·고정 제외 + 마감일 있는 업무항목.
export function getProjects(workItems, sessions) {
  return workItems
    .filter(w => w.type !== '회의' && w.type !== '고정' && w.end)
    .map(w => enrichProject(w, sessions, teamMembers, gradeRates, undefined))
}

const STATUS_ORDER = { '지연': 0, '진행 중': 1, '시작 전': 2 }

// 지연 → 진행 중 → 시작 전, 그다음 납기 빠른 순.
export function sortProjects(projects) {
  return [...projects].sort((a, b) =>
    (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) ||
    (a.end || '').localeCompare(b.end || ''))
}

// 프로젝트 상세 단계 상태 — 세션이 없으면 대기, 모두 done이면 완료, 그 외 진행.
export function stepState(wiId, stepId, sessions) {
  const ss = sessions.filter(s => s.workItemId === wiId && s.stepId === stepId)
  if (!ss.length) return '대기'
  return ss.every(s => s.done) ? '완료' : '진행'
}

// ─── 팀원 ─────────────────────────────────────────────────────────────────────
// 본인(currentUser)은 팀원 목록에서 제외한다(팀장이 팀원을 보는 화면).
export function teamList() {
  return teamMembers.filter(m => m.id !== currentUser.id)
}

// 팀원 1명의 확실한 사실 지표.
export function memberStats(member) {
  const items = member.weekWorkItems || []
  const total = items.length
  const done = items.filter(w => w.done).length
  const active = items.filter(w => !w.done)
  const hasUrgent = active.some(w => w.type === '긴급')
  return {
    total,
    done,
    progress: total ? Math.round((done / total) * 100) : 0,
    active,
    hasUrgent,
    onLeave: member.onLeave,
    leaveType: member.leaveType,
  }
}

// 긴급 업무 보유 → 진행 중 업무 많은 순 → 이름순. (가동률·과부하 순 아님)
export function sortMembers(members) {
  return [...members].sort((a, b) => {
    const sa = memberStats(a), sb = memberStats(b)
    if (sa.hasUrgent !== sb.hasUrgent) return sa.hasUrgent ? -1 : 1
    if (sb.active.length !== sa.active.length) return sb.active.length - sa.active.length
    return a.name.localeCompare(b.name, 'ko')
  })
}

// ─── 결재: 대기 목록 (본인 연차는 제외) ─────────────────────────────────────────
export function pendingRequests(requests) {
  return requests.filter(r => r.status === '수락 대기')
}

export function urgentPendingRequests(requests) {
  return pendingRequests(requests).filter(r => r.priority === '긴급')
}

export function pendingLeaves(leaves) {
  return leaves.filter(l => l.status === '승인 대기' && l.applicantId !== currentUser.id)
}

// 연차 판단 근거 — 사실 기반만. (추정/평가 표현 금지)
//  1) 같은 기간 팀 내 다른 연차 유무
//  2) 연차 기간 중/직후(+1일)에 납기가 걸린 프로젝트
export function leaveBasis(leave, leaves, projects) {
  const out = []
  const overlap = leaves.find(l =>
    l.id !== leave.id &&
    (l.status === '승인 대기' || l.status === '승인 완료' || l.status === '팀장 승인') &&
    l.startDate <= leave.endDate && l.endDate >= leave.startDate)
  out.push(overlap
    ? { tone: 'warn', text: `같은 기간 ${overlap.applicantName} 연차와 겹침` }
    : { tone: 'ok', text: '같은 기간 팀 내 다른 연차 없음' })

  const dueEnd = addDays(leave.endDate, 1)
  const dueProj = projects.find(p => p.end && p.end >= leave.startDate && p.end <= dueEnd)
  if (dueProj) out.push({ tone: 'warn', text: `연차 기간 중 '${dueProj.title}' 납기(${dueProj.end.slice(5)})` })
  return out
}

// ─── 홈 요약: 확실한 사실 3종 ───────────────────────────────────────────────────
export function homeSummary(workItems, sessions, requests, leaves) {
  const projects = getProjects(workItems, sessions)
  const delayed = projects.filter(p => p.status === '지연').length
  const dueSoonMax = addDays(TODAY_ISO, 7)
  const dueSoon = projects.filter(p =>
    p.status !== '지연' && p.end >= TODAY_ISO && p.end <= dueSoonMax).length
  const pending = pendingRequests(requests).length + pendingLeaves(leaves).length
  return { delayed, dueSoon, pending }
}

// ─── 내 업무 (currentUser 기준) ─────────────────────────────────────────────────
export function todaySessions(sessions) {
  return sessions.filter(s => s.authorId === currentUser.id && s.date === TODAY_ISO)
}

export function todayStats(sessions) {
  const mine = todaySessions(sessions)
  const minutes = mine.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0)
  const doneCount = mine.filter(s => s.done).length
  return { minutes, doneCount, total: mine.length }
}

// 이번 주 월~금, 요일별 내 세션.
export function weekSessionsByDay(sessions, offset = 0) {
  return weekdays(offset).map(day => ({
    ...day,
    sessions: sessions.filter(s => s.authorId === currentUser.id && s.date === day.date),
  }))
}

export { TODAY_ISO, currentUser }
