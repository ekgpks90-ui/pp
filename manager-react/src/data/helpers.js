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

export function isDelayed(item, today) {
  if (item.type === '고정') return false;
  return item.end < today;
}
