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
