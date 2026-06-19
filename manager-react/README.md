# WorkFlow Manager (React)

바닐라 JS로 만든 원본 `manager` 앱을 **React로 다시 구현한 버전**입니다.
디자인 에이전시의 팀 업무를 관리하는 웹앱으로, 직원·팀장·대표 세 역할을
하나의 앱에서 권한별로 분기해 보여줍니다.

> 제품 기획 기준 문서는 상위 폴더(`vibe-projects`)의 `context/`, `rules/`,
> `knowledge/`를 따릅니다. 용어와 권한 정책은 그쪽이 원본입니다.

## 기술 스택

- **React 19** + **Vite** (빌드/개발 서버)
- **Tailwind CSS v4** (`@tailwindcss/vite` 플러그인)
- 상태 관리는 별도 라이브러리 없이 `App.jsx`의 `useState`로 관리

## 실행 방법

```bash
npm install      # 의존성 설치 (최초 1회)
npm run dev      # 개발 서버 실행 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/ 생성)
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 역할(Role) 기반 구조

이 앱의 핵심은 **페이지를 역할별로 복제하지 않는다**는 점입니다.
원본의 직원(app)/대표(ceo)/팀장(manager) 3벌을 하나로 통합하고,
"역할마다 다른 부분"은 전부 `src/data/roles.js`의 권한 함수로 분기합니다.

| 역할 | 값 | 설명 |
|------|------|------|
| 직원 | `member` | Process(프로세스 템플릿) 페이지 미노출 |
| 팀장 | `manager` | 전체 페이지 노출, 팀 단위 관리 권한 |
| 대표 | `owner` | 전체 페이지 + 전체 조회 권한 |

역할은 상단바(Topbar)의 역할 스위처로 전환하며 화면을 확인할 수 있습니다.
권한 판단은 `canViewPage`, `canApproveLeave`, `canCreateWorkRequest` 등
`roles.js`의 함수로만 처리합니다.

## 페이지 구성

| 페이지 | 컴포넌트 | 설명 |
|--------|----------|------|
| 홈 | `HomePage` / `CeoDashboard`(대표) | 직원·팀장은 주간 업무항목·작업세션·KPI·업무요청. 대표는 경영 대시보드(진행/지연/납기 요약·Project Status·KPI·AI Brief·Approval) |
| 캘린더 | `CalendarPage` | **전체 보기**(모든 프로젝트 간트) ↔ **프로젝트별**(단계·담당자 타임라인) 토글, 아웃풋/리소스 (회의·연차 제외). 프로젝트명 클릭 시 업무 상세 패널 — 직원은 조회 전용(`canEditCalendar`), 팀장·대표는 수정 가능 |
| 팀원 현황 | `TeamStatusPage` / `CeoCompanyStatus`(대표) | 직원·팀장은 팀원별 주간 업무·담당자 배정. 대표는 Team KPI·리소스·업무 편중·신규 요청 |
| 프로세스 | `ProcessPage` / `CeoProcessPage`(대표) | 직원 외 조회. 대표는 프로세스 개요·병목 분석·AI 개선 제안 |
| 미팅룸 | `MeetingRoomPage` | 회의록 등록·조회, AI 요약(카드 노출), 액션아이템, 팀 탭 + 검색(회의명·참석자·AI요약). 대표는 전체 회의 조회 |
| 연차 | `LeavePage` | 연차 신청·조회·승인 |
| 리포트 센터 | `CeoReportCenter` | **대표 전용 메뉴.** 매출(예시)·프로젝트·인력·연차·Export 5개 탭 |
| 마이페이지 | `MyPage` | 본인 작업 히스토리 (개인 페이지, 역할 무관) |

> **대표(owner) 전용 화면**: Home·팀원 현황·프로세스는 화면 성격이 완전히 달라 owner일 때
> 별도 컴포넌트(`CeoDashboard`/`CeoCompanyStatus`/`CeoProcessPage`)로 교체되고, Report Center는
> owner에게만 노출됩니다. 데이터는 한 벌(`state.js`)을 공유하며, 카드/섹션 UI는 `CeoUI.jsx`에
> 모았습니다. 기획 규칙상 "완료" 상태는 만들지 않으므로 모든 지표는 진행 중·지연으로 표현하고,
> 매출 등 데이터 없는 항목은 "예시"로 표기합니다.

## 폴더 구조

```
src/
├── App.jsx              # 루트: 페이지 라우팅 + 전역 상태/핸들러
├── main.jsx            # 엔트리
├── index.css           # Tailwind 진입점
├── components/         # 페이지 및 UI 컴포넌트 (24개)
└── data/
    ├── state.js        # 목 데이터 (사용자·업무항목·회의·연차 등)
    ├── roles.js        # 역할 정의 및 권한 판단 함수
    └── helpers.js      # 날짜·시간 유틸 (ISO 변환, 정렬 등)
```

## 용어 (원본 기획 기준)

혼동하기 쉬운 핵심 용어를 정리합니다. 자세한 정의는 상위 폴더
`context/glossary.md`를 따릅니다.

- **업무요청(Work Request)** — 담당자를 배정받는 작업 요청
- **업무항목(Work Item)** — 참여자가 붙는 실제 업무 단위
- **작업세션(Work Session)** — 작성자가 기록하는 개별 작업 (물리 삭제)

업무요청 수락이 곧 업무항목 자동 생성을 의미하지 않으며,
업무항목에는 완료 상태나 타이머 개념이 없습니다.
