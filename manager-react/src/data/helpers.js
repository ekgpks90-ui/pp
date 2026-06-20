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
