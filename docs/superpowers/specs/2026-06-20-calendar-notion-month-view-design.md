# Calendar 대표 화면 — 노션식 월 달력 리뉴얼 (v2)

작성일: 2026-06-20
브랜치: `feat/calendar-react` (워크트리: `vibe-projects-calendar`)
대상: 대표(owner) 전용 Calendar. 직원·팀장 화면은 변경 없음.
선행: [v1 설계](./2026-06-19-calendar-team-month-view-design.md)의 팀 사이드바는 유지하고, 본문만 노션식 월 달력으로 교체한다.

## 배경 / 목적

v1에서 owner 전체보기를 "프로젝트행 + 가로 날짜(간트)"로 만들었으나, 실제로 보니
간트 테이블 느낌이 강하고 한 달 전체 일정 흐름이 직관적이지 않다. 대표 대시보드에
어울리도록 **노션식 월 달력**(7열 주 단위 그리드 + 멀티데이 이벤트 바)으로 바꾼다.

## 변경 요약

1. **owner 상단 "전체보기/프로젝트별" 토글 삭제** — owner는 항상 월 달력. 상단엔 월 이동만.
2. **프로젝트(이벤트) 클릭 → 기존 `DetailPanel` 오른쪽 슬라이드** (대표는 수정 가능).
   v1에서 프로젝트명 클릭을 "프로젝트별 모드 진입"으로 바꿨던 것을 `DetailPanel` 열기로 되돌린다.
3. **본문 간트 → 노션식 월 달력** — 7열 그리드 + 멀티데이 이벤트 바, 팀 색상.

직원·팀장(owner 아님) Calendar는 기존 프로젝트별 단계·담당자 간트를 그대로 유지한다.

## 레이아웃

```
┌─팀 사이드바─┐┌──────────── 본문: 월 달력 ────────────────────┐
│▸전체   (11)││            ◀  2026년 6월  ▶                    │
│ UI/UX  (6) ││ 일   월   화   수   목   금   토               │
│ 브랜드 (2) ││  1    2    3    4    5    6    7                │
│ 콘텐츠 (2) ││ [■ 디자인시스템 정리 ───────────────────       │
│ 영상   (1) ││  8    9   10   11   12   13   14                │
│ 기타   (1) ││  ───] [■모아커머스──] [■테크스타트UI────        │
└────────────┘│ 15   16   17   18   19   20   21                │
              │ ──] [■블루밍헬스───────]                        │
              └────────────────────────────────────────────────┘
```

## 1. 달력 그리드 / 이벤트 레인 — `helpers.js` 유틸

### `getCalendarWeeks(year, month)`
- 그 달이 보이도록 **1일이 속한 주의 일요일 ~ 말일이 속한 주의 토요일**까지 채운 주 배열.
- 반환: `Week[]`, 각 `Week`는 길이 7의 `Day[]`.
- `Day = { date: 'YYYY-MM-DD', day: number, inMonth: boolean, isToday: boolean, isWeekend: boolean }`.
  (`inMonth=false`는 앞뒤 달 날짜 — 흐리게 표시)

### `layoutWeekEvents(projects, week)`
- 한 주(7일)에 걸치는 프로젝트들을 **레인(층)으로 배치**(겹침 방지, 그리디).
- 알고리즘: 프로젝트를 `start` 오름차순(같으면 기간 긴 순) 정렬 → 각 프로젝트를 그 주 내에서
  비어 있는 가장 위 레인에 놓는다(같은 레인에서 컬럼이 겹치지 않을 때만).
- 각 배치 항목 반환:
  `{ project, lane: number, startCol: 0..6, endCol: 0..6, continuesLeft: boolean, continuesRight: boolean }`
  - `startCol = max(프로젝트 시작, 주 시작)`의 요일 인덱스, `endCol = min(프로젝트 끝, 주 끝)`의 요일 인덱스.
  - `continuesLeft/Right` = 프로젝트가 이 주 밖(이전/다음 주)으로 이어지는지 → 바 모서리 둥글기 처리에 사용.
- 프로젝트 기간: `end`가 없으면 `start` 하루로 간주.

## 2. 팀 색상 — `helpers.js`에 `TEAM_COLOR`

```
'UI/UX 디자인팀'  → 파랑 (#2563eb / bg #dbeafe)
'브랜드 디자인팀'  → 보라 (#7c3aed / bg #ede9fe)
'콘텐츠 디자인팀'  → 초록 (#059669 / bg #d1fae5)
'영상·모션팀'      → 주황 (#d97706 / bg #fef3c7)
'기타'             → 회색 (#4b5563 / bg #f3f4f6)
```
- `getTeamColor(teamName)` → `{ text, bg }`. 매핑에 없으면 '기타' 색.

## 3. `MonthCalendar.jsx` (신규 컴포넌트)

- Props: `{ projects, year, month, onEventClick }`.
  - `projects`: 팀 필터가 적용된 프로젝트 배열(`CalendarPage`에서 `teamFilteredProjects` 전달).
  - `onEventClick(project)`: 이벤트 막대 클릭 핸들러.
- 렌더:
  - 요일 헤더(일~토). 주말은 흐린 색.
  - `getCalendarWeeks(year, month)`의 각 주마다 한 행:
    - 날짜 숫자 줄(7칸, `inMonth=false`/주말/오늘 스타일 분기).
    - 그 아래 `layoutWeekEvents` 결과를 레인 순서로 쌓아 이벤트 막대 배치.
      막대는 `startCol`에서 시작해 `(endCol-startCol+1)`칸 너비(7분의 N %), 팀 색 배경, 프로젝트명 라벨.
      `continuesLeft/Right`면 해당 변 모서리를 각지게.
    - 주 행 높이는 그 주 최대 레인 수에 맞춰 가변(숨김 "+N" 없이 전부 노출).
  - 이벤트 클릭 → `onEventClick(project)`.

## 4. `CalendarPage.jsx` 변경

- import에 `getTeamColor`(또는 MonthCalendar 내부에서 사용), `MonthCalendar` 추가.
- owner 상단 토글(전체보기/프로젝트별) 제거. 월 이동 컨트롤은 유지.
- `showAll` 분기 본문을 `AllProjectsTimeline` → `MonthCalendar`로 교체.
  - `onEventClick={(p) => setEditItemId(p.id)}` → 기존 `DetailPanel` 슬라이드 오픈.
- owner는 항상 월 달력이므로 `viewMode`/프로젝트별 토글 관련 owner 경로 정리.
  단, **직원·팀장의 프로젝트별 모드(단계·담당자 간트)는 그대로 유지**한다(`!isOwner` 경로).
- owner 전용이던 `AllProjectsTimeline` 컴포넌트는 더 이상 쓰이지 않으면 제거.
- `selectedTeam`/`teamFilteredProjects`/팀 사이드바(v1)는 유지.

## 영향 범위

- 신규: `src/components/MonthCalendar.jsx`.
- 수정: `src/data/helpers.js`(`getCalendarWeeks`, `layoutWeekEvents`, `TEAM_COLOR`, `getTeamColor`),
  `src/components/CalendarPage.jsx`(토글 제거, 본문 교체, 이벤트 클릭→DetailPanel).

## 유지 / 비변경

- 팀 사이드바 필터, 월 이동, `DetailPanel`/`CalendarDetailPanel`.
- 직원·팀장 Calendar(프로젝트별 단계·담당자 간트).
- 제품 규칙: 회의·연차·반복 업무 미표시, 업무항목 완료 상태 없음, 상태는 시작 전/진행 중/지연.

## 비고

- 노션식 멀티데이 바(주 경계 분할 + 레인 배치)는 새 로직이라 별도 컴포넌트로 격리해 테스트/수정 용이.
- 셀 넘침 "+N개" 접기는 YAGNI로 보류(현재 데이터는 한 주 최대 레인이 화면에 충분히 들어감). 추후 필요 시 별도 작업.
