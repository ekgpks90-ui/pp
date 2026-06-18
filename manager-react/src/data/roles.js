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
