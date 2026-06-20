function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const now = new Date();
export const TODAY_ISO = localISO(now);
const dow = now.getDay();
const mondayOff = dow === 0 ? -6 : 1 - dow;
const mondayDate = new Date(now);
mondayDate.setDate(mondayDate.getDate() + mondayOff);
export const MONDAY_ISO = localISO(mondayDate);

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
export const DAY_SHORTS = ['월', '화', '수', '목', '금', '토', '일'];
export const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export function toDate(s) { return new Date(`${s}T00:00:00`); }

export function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(s, n) {
  const d = toDate(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function calcMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function fmtDuration(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), min = m % 60;
  if (!h) return `${min}m`;
  return min ? `${h}h ${min}m` : `${h}h`;
}

export function sortByType(a, b) {
  const order = { '회의': 0, '고정': 1, '긴급': 2, '일반': 3 };
  return (order[a.type] - order[b.type]) || a.title.localeCompare(b.title, 'ko');
}

// 원본 app.js의 isDelayed와 동일: 고정 아님 && 마감일 지남 && 미완료 세션이 하나라도 있음
export function isDelayed(item, today, sessions = []) {
  if (item.type === '고정') return false;
  return item.end < today && sessions.some(s => s.workItemId === item.id && !s.done);
}

// ─── 프로세스 카테고리(processId) → 팀 매핑 ──────────────────────────────────
// 대표 Calendar 전체보기에서 팀별 그룹/필터에 사용. workItem에 team 필드를 두지 않고
// processId로 도출한다(데이터 이중화·동기화 버그 방지). 1 프로젝트 = 1 프로세스 전제.
export const PROCESS_TEAM = {
  'pc-1': 'UI/UX 디자인팀',
  'pc-2': '브랜드 디자인팀',
  'pc-3': '콘텐츠 디자인팀',
  'pc-4': '영상·모션팀',
};

// processId가 없는 프로젝트(예: 내부 디자인 시스템 정리)를 묶는 팀.
export const ETC_TEAM = '기타';

// 사이드바 팀 노출 순서(맨 위 '전체'는 컴포넌트에서 별도 추가).
export const TEAM_ORDER = ['UI/UX 디자인팀', '브랜드 디자인팀', '콘텐츠 디자인팀', '영상·모션팀', ETC_TEAM];

// 프로젝트(업무항목)가 속한 팀명. processId가 없거나 매핑에 없으면 '기타'.
export function getProjectTeam(workItem) {
  return PROCESS_TEAM[workItem?.processId] ?? ETC_TEAM;
}

// ─── 팀 색상 (노션식 달력 이벤트 막대) ───────────────────────────────────────
export const TEAM_COLOR = {
  'UI/UX 디자인팀': { text: '#2563eb', bg: '#dbeafe' },
  '브랜드 디자인팀': { text: '#7c3aed', bg: '#ede9fe' },
  '콘텐츠 디자인팀': { text: '#059669', bg: '#d1fae5' },
  '영상·모션팀': { text: '#d97706', bg: '#fef3c7' },
  '기타': { text: '#4b5563', bg: '#f3f4f6' },
};

// 팀명 → 색. 매핑에 없으면 '기타' 색.
export function getTeamColor(teamName) {
  return TEAM_COLOR[teamName] || TEAM_COLOR['기타'];
}

// ─── 노션식 월 달력 그리드 ───────────────────────────────────────────────────
// 1일이 속한 주의 일요일 ~ 말일이 속한 주의 토요일까지를 7일씩 묶어 반환.
export function getCalendarWeeks(year, month) {
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay()); // 그 주 일요일
  const last = new Date(year, month + 1, 0);
  const gridEnd = new Date(year, month, last.getDate() + (6 - last.getDay())); // 그 주 토요일

  const weeks = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = toISO(cur);
      const dow = cur.getDay();
      week.push({
        date,
        day: cur.getDate(),
        inMonth: cur.getMonth() === month,
        isToday: date === TODAY_ISO,
        isWeekend: dow === 0 || dow === 6,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// 한 주(7일)에 걸치는 프로젝트를 레인(층)으로 배치(겹침 방지, 그리디).
// 반환 항목: { project, lane, startCol(0~6), endCol(0~6), continuesLeft, continuesRight }
export function layoutWeekEvents(projects, week) {
  const weekStart = week[0].date;
  const weekEnd = week[6].date;

  const items = projects
    .map(p => ({ p, start: p.start, end: p.end || p.start }))
    .filter(it => it.start <= weekEnd && it.end >= weekStart)
    .sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end));

  const laneEnds = []; // laneEnds[i] = 그 레인에 마지막 배치된 endCol
  const result = [];
  for (const it of items) {
    const startCol = it.start <= weekStart ? 0 : week.findIndex(d => d.date === it.start);
    const endCol = it.end >= weekEnd ? 6 : week.findIndex(d => d.date === it.end);

    let lane = 0;
    while (lane < laneEnds.length && laneEnds[lane] >= startCol) lane++;
    laneEnds[lane] = endCol;

    result.push({
      project: it.p,
      lane,
      startCol,
      endCol,
      continuesLeft: it.start < weekStart,
      continuesRight: it.end > weekEnd,
    });
  }
  return result;
}

// ── 대표 홈: 프로젝트 투자(공수·비용) 계산 ─────────────────────────────────
// "프로젝트=사람×기간=투자". 개인 월급 대신 직급별 단가(gradeRates)를 사용한다.

// 프로젝트 전체 기간(일): 시작~마감 캘린더 일수. 마감 없으면 1.
export function projectDays(wi) {
  if (!wi.start || !wi.end) return 1;
  return Math.max(1, Math.round((toDate(wi.end) - toDate(wi.start)) / 86400000) + 1);
}

// 경과 일수(시작~오늘, 마감 넘으면 마감까지로 캡): 누적 투입 산출용.
export function elapsedDays(wi, today = TODAY_ISO) {
  if (!wi.start) return 0;
  const endCap = wi.end && wi.end < today ? wi.end : today;
  if (endCap < wi.start) return 0;
  return Math.max(0, Math.round((toDate(endCap) - toDate(wi.start)) / 86400000) + 1);
}

// 마감 초과 일수(지연 프로젝트): 마감 다음날부터 오늘까지.
export function overdueDays(wi, today = TODAY_ISO) {
  if (!wi.end || wi.end >= today) return 0;
  return Math.round((toDate(today) - toDate(wi.end)) / 86400000);
}

// 투입 인원 수
export function headcount(wi) {
  return (wi.participants || []).length;
}

// 공수(사람·일) = 인원 × 일수
export function manDays(wi, days) {
  return headcount(wi) * days;
}

// 투입 인원의 직급별 1일 단가 합계(원/일)
export function dailyRateSum(wi, teamMembers = [], gradeRates = {}) {
  return (wi.participants || []).reduce((sum, name) => {
    const m = teamMembers.find(t => t.name === name);
    return sum + (m ? (gradeRates[m.grade] || 0) : 0);
  }, 0);
}

// 프로젝트 투자 비용(원) = 일수 × 직급단가합
export function projectCost(wi, days, teamMembers, gradeRates) {
  return days * dailyRateSum(wi, teamMembers, gradeRates);
}

// 원화 요약 표기: 1.2억 / 488만 / 5,000원
export function fmtMoney(won) {
  if (!won) return '0원';
  if (won >= 1e8) {
    const v = Math.round((won / 1e8) * 10) / 10;
    return `${v}억`;
  }
  if (won >= 1e4) return `${Math.round(won / 1e4).toLocaleString()}만`;
  return `${won.toLocaleString()}원`;
}

// 작업세션 기반 진행률(%) — 프로세스가 있으면 세션이 찍힌 단계 수 / 전체 단계 수,
// 없으면 완료 세션 수 / 전체 세션 수. (홈 Project Status·리포트 프로젝트 탭 공통)
export function projectProgress(wi, sessions = [], processes = []) {
  const wiSessions = sessions.filter(s => s.workItemId === wi.id);
  const proc = wi.processId ? processes.find(p => p.id === wi.processId) : null;
  if (proc && proc.steps.length) {
    const stepsWithSession = new Set(wiSessions.map(s => s.stepId).filter(Boolean));
    return Math.round((stepsWithSession.size / proc.steps.length) * 100);
  }
  if (!wiSessions.length) return 0;
  return Math.round((wiSessions.filter(s => s.done).length / wiSessions.length) * 100);
}

// 프로젝트(업무항목) 제목에서 거래처명 도출. 사내(외부 의뢰 아님) 프로젝트는 '사내'로 묶는다.
// 외부 의뢰는 sourceRequestId가 있고, 제목 첫 단어가 거래처명((주) 접두 제거).
export function clientOf(wi) {
  if (!wi.sourceRequestId) return '사내';
  const first = (wi.title || '').trim().split(/\s+/)[0] || '사내';
  return first.replace(/^\(주\)/, '').replace(/\(주\)$/, '') || '사내';
}
