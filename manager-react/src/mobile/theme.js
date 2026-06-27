// 팀장 모바일 색/상태 토큰.
// 기획서 §2-4 색 규칙을 index.css의 @theme 토큰에 매핑한다.
//   지연·긴급 = red / 진행 = blue / 완료·여유 = green / 시작 전 = muted
// "확실한 사실만 표시" 원칙에 따라 가동률·과부하 색은 정의하지 않는다.

// Modernize 라이트 어드민 팔레트에 매핑 (웹 index.css @theme 토큰과 동일 값)
export const COLOR = {
  danger: '#fa896b',
  dangerSoft: '#fdede8',
  primary: '#5d87ff',
  primarySoft: '#ecf2ff',
  success: '#13deb9',
  successSoft: '#e6fffa',
  warning: '#ffae1f',
  warningSoft: '#fef5e5',
  muted: '#7c8fac',
  mutedSoft: '#f2f6fa',
}

// 팀원 아바타 색 팔레트 (멤버 index로 순환) — Figma 목업의 컬러 아바타 재현
export const AVATAR = ['#5d87ff', '#13deb9', '#ffae1f', '#7c4dff', '#49beff', '#fa896b', '#53bdcf']
export function avatarColor(i) { return AVATAR[i % AVATAR.length] }

// 프로젝트 상태 배지 색 (enrichProject status: 시작 전 / 진행 중 / 지연)
export const PROJECT_STATUS = {
  '지연': { color: COLOR.danger, bg: COLOR.dangerSoft },
  '진행 중': { color: COLOR.primary, bg: COLOR.primarySoft },
  '시작 전': { color: COLOR.muted, bg: COLOR.mutedSoft },
}

// 진행률 막대 색 — 100%면 완료(green), 그 외 진행(blue).
export function progressColor(pct) {
  return pct >= 100 ? COLOR.success : COLOR.primary
}
