// 역할(role) 정의 — 직원/팀장/대표를 하나의 앱에서 분기하기 위한 단일 기준.
// 바닐라 app(직원)/ceo(대표)/manager(팀장) 3벌을 통합하면서,
// "역할마다 다른 부분"은 전부 이 파일을 통해 분기한다. (페이지를 복제하지 않는다)

export const ROLES = {
  MEMBER: 'member', // 직원
  MANAGER: 'manager', // 팀장
  OWNER: 'owner', // 대표
}

export const ROLE_LABELS = {
  [ROLES.MEMBER]: '직원',
  [ROLES.MANAGER]: '팀장',
  [ROLES.OWNER]: '대표',
}

// 화면 전환/스위처에서 쓰는 노출 순서
export const ROLE_ORDER = [ROLES.MEMBER, ROLES.MANAGER, ROLES.OWNER]

// 전체 페이지 id (Sidebar NAV_ITEMS와 동일한 id 사용)
const ALL_PAGES = ['home', 'calendar', 'team-status', 'process', 'meeting-room', 'leave', 'my-page']

// 역할별로 사이드바에 노출되는 페이지 id 목록.
// 근거: 바닐라 3벌 비교 결과 Process Management('process')는 팀장(manager) 앱에만 존재.
//       직원/대표 앱에는 없으므로 두 역할에서 숨긴다.
// 다른 역할별 차이가 추가로 확인되면 여기서 페이지 단위로 조정한다.
export const ROLE_VISIBLE_PAGES = {
  [ROLES.MEMBER]: ALL_PAGES.filter(p => p !== 'process'),
  [ROLES.MANAGER]: ALL_PAGES,
  [ROLES.OWNER]: ALL_PAGES.filter(p => p !== 'process'),
}

/**
 * 해당 역할이 특정 페이지를 볼 수 있는지 여부.
 * @param {string} role - ROLES 중 하나
 * @param {string} pageId - 페이지 id
 * @returns {boolean}
 */
export function canViewPage(role, pageId) {
  const pages = ROLE_VISIBLE_PAGES[role] ?? ROLE_VISIBLE_PAGES[ROLES.MANAGER]
  return pages.includes(pageId)
}

// ─── 회의(Meeting Room) 권한 — rules/role-permission.md 기준 ──────────────────
// 회의 생성: Owner/Manager/Member 모두 가능 (분기 불필요).
// 회의록 조회: 전체 회의록 조회는 Owner만. Manager/Member는 소속 팀 회의만 본다.

/**
 * 모든 팀의 회의를 볼 수 있는지 (Owner만 전체, 나머지는 소속 팀만).
 * @param {string} role
 * @returns {boolean}
 */
export function canViewAllMeetings(role) {
  return role === ROLES.OWNER
}

// 참여자 추가/제거: Owner/Manager 가능, Member 불가 (단, 본인이 만든 회의는 생성자로서 가능).
// → 현재 React 미팅룸에 참여자 관리 UI가 없어 적용 보류. UI 추가 시 이 함수로 분기할 것.
/**
 * @param {string} role
 * @param {{ author?: string }} [meeting]
 * @param {{ name?: string }} [currentUser]
 * @returns {boolean}
 */
export function canManageParticipants(role, meeting, currentUser) {
  if (role === ROLES.OWNER || role === ROLES.MANAGER) return true
  return Boolean(meeting && currentUser && meeting.author === currentUser.name)
}

// ─── 캘린더(Calendar) 권한 — rules/role-permission.md 기준 ────────────────────
// Team(전체)/My 필터 조회: 모든 역할 가능 (분기 불필요).
// Team 일정 수정/삭제: Owner/Manager만, Member 불가.
// → 현재 React 캘린더는 조회 전용(수정/삭제 UI 없음)이라 적용 보류.
//    편집/삭제 UI 추가 시 이 함수로 분기할 것.
/**
 * 캘린더 일정을 수정/삭제할 수 있는지 (Member는 불가).
 * @param {string} role
 * @returns {boolean}
 */
export function canEditCalendar(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER
}
