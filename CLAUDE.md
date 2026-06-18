# Agent Instructions

이 폴더의 기준 문서는 WorkFlow Hub 제품/기획 문서이다.

## 반드시 지킬 기준

- `context/glossary.md`의 용어를 우선한다.
- `rules/policy.md`와 `rules/role-permission.md`의 권한 정책을 우선한다.
- 업무항목과 작업세션을 혼동하지 않는다.
- 업무요청 수락 후 업무항목을 자동 생성하지 않는다.
- 업무요청은 전달 팀으로 수신된 뒤 Manager가 담당자를 배정한다.
- 업무요청은 담당자, 업무항목은 참여자, 작업세션은 작성자 용어를 사용한다.
- 업무항목 완료 상태를 만들지 않는다.
- 타이머 기능을 만들지 않는다.
- 작업세션은 물리 삭제한다.
- MVP 연차 유형은 종일 연차, 오전 반차, 오후 반차만 사용하고 시간차는 제외한다.
- MVP 업무요청 거절 사유는 고정 목록을 사용하고, 거절 사유 관리 화면은 제외한다.
- 업무카테고리 생성/수정/비활성화는 예약 변경으로 저장하고 다음 월 1일에 effective_from 기준으로 반영한다.
- 회의 액션아이템 상태는 회의록 내부 상태이며 업무항목 상태와 별개이다.
- 알림은 화면에 최근 90일만 표시하고 DB에는 1년 보관한다. 사용자는 알림을 삭제할 수 없다.
- Calendar에는 연차, 업무요청, 작업세션을 표시하지 않는다.
- My Page에는 총/사용/잔여 연차 현황을 포함하지 않는다.
- My Page 작업 히스토리 캘린더에는 연차 상태 표시만 허용한다.

## 구현 담당 범위

- CEO(이다혜)가 직접 수정하는 페이지: **Home, Calendar, Meeting Room**
- 나머지 페이지(Team Status, Leave Management, My Page, Process Management)는 협업자 담당
- 담당 외 페이지 수정 요청이 들어오면 반드시 사용자에게 먼저 확인할 것

## 주요 참조 순서

1. `README.md`
2. `context/handoff-summary.md`
3. `context/glossary.md`
4. `rules/policy.md`
5. `rules/role-permission.md`
6. `knowledge/features/`
