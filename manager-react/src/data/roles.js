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

// 대표(어드민) 전용 페이지 — Report Center는 owner에게만 노출.
const OWNER_ONLY_PAGES = ['report-center']

// 역할별로 사이드바에 노출되는 페이지 id 목록.
// 근거: rules/role-permission.md — 프로세스 템플릿 조회는 Owner=O, Manager=O, Member=X.
//       따라서 Process('process')는 Member에게만 숨긴다. (Owner/Manager는 노출)
// 대표(Owner)는 연차를 리포트 연차 탭에서 관리하므로 'leave' 메뉴를 숨긴다.
//   (직원·팀장에게는 그대로 노출. 결정: context/ceo-experience.md / 메모리 vibe_ceo_leave_in_report)
// 다른 역할별 차이가 추가로 확인되면 여기서 페이지 단위로 조정한다.
export const ROLE_VISIBLE_PAGES = {
  [ROLES.MEMBER]: ALL_PAGES.filter(p => p !== 'process'),
  [ROLES.MANAGER]: ALL_PAGES,
  [ROLES.OWNER]: [...ALL_PAGES.filter(p => p !== 'leave'), ...OWNER_ONLY_PAGES],
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

// ─── Home / Weekly Tasks · 업무항목 권한 — rules/role-permission.md 기준 ────────
// 업무요청 생성: Owner/Manager만, Member 불가.
// 업무항목 수정/삭제: Owner/Manager는 전체, Member는 본인 생성 업무만.

/**
 * 업무요청을 생성할 수 있는지 (Member는 불가).
 * @param {string} role
 * @returns {boolean}
 */
export function canCreateWorkRequest(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER
}

/**
 * 업무항목을 수정/삭제할 수 있는지. Owner/Manager는 전체, Member는 본인 생성 업무만.
 * @param {string} role
 * @param {{ creatorName?: string, author?: string }} [item]
 * @param {{ name?: string }} [currentUser]
 * @returns {boolean}
 */
export function canEditWorkItem(role, item, currentUser) {
  if (role === ROLES.OWNER || role === ROLES.MANAGER) return true
  const creator = item && (item.creatorName ?? item.author)
  return Boolean(item && currentUser && creator === currentUser.name)
}

// ─── Team Status (팀원 업무 현황) 권한 ────────────────────────────────────────
// 조회: 모든 역할. 타인 데이터 수정: Owner/Manager만, Member 불가.
/**
 * 타인의 데이터를 수정할 수 있는지 (Member는 불가).
 * @param {string} role
 * @returns {boolean}
 */
export function canEditOthersData(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER
}

// ─── Leave Management (연차) 권한 ─────────────────────────────────────────────
// 전체 연차 조회: Owner만. 팀 연차 조회: Owner/Manager. 본인 연차: 모두.
// 연차 승인: Owner/Manager만, Member 불가. 연차 신청/취소: 모두 가능.
/** 전체(모든 팀) 연차를 조회할 수 있는지 — Owner만. */
export function canViewAllLeaves(role) {
  return role === ROLES.OWNER
}
/** 팀 연차를 조회할 수 있는지 — Owner/Manager. (Member는 본인 연차만) */
export function canViewTeamLeaves(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER
}
/** 연차를 승인할 수 있는지 — Owner/Manager만. */
export function canApproveLeave(role) {
  return role === ROLES.OWNER || role === ROLES.MANAGER
}
