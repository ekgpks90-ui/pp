# Calendar 팀 사이드바 + 월 달력 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 대표(owner) Calendar 전체보기에서 왼쪽 사이드바를 팀 목록으로 바꾸고, 선택한 팀의 프로젝트들을 월 달력(프로젝트행 + 가로 날짜 막대) 위에 보여준다.

**Architecture:** `processId`로 프로젝트의 팀을 런타임 도출(`helpers.js`)하고, `CalendarPage.jsx`의 owner 사이드바를 팀 필터로 교체한다. 본문 전체보기는 기존 `AllProjectsTimeline`(프로젝트행 + 가로 날짜)을 선택 팀으로 필터해 재사용하며, 프로젝트별 모드(단계·담당자 간트) 진입은 본문 프로젝트명 클릭으로 바꾼다.

**Tech Stack:** React 19, Vite, Tailwind (유틸 클래스), 순수 JS 모듈. 테스트 러너 없음 → 검증은 `npm run lint` + `npm run build` + 브라우저(http://localhost:5174).

## Global Constraints

- 작업 위치: 워크트리 `/Users/idahye/Documents/Company/vibe-projects-calendar`, 브랜치 `feat/calendar-react`, 앱 루트 `manager-react/`.
- 변경 대상은 **대표(owner) Calendar 전체보기**뿐. 직원·팀장 화면 및 프로젝트별 모드 내부 로직은 변경하지 않는다.
- 캘린더는 회의·연차·반복 업무를 표시하지 않는다(기존 `projects` 필터 유지).
- 업무항목 완료 상태를 만들지 않는다. 상태는 `시작 전 / 진행 중 / 지연`만 사용(기존 `getWorkItemStatus`).
- 팀 이름·노출 순서는 다음 값을 그대로 사용한다:
  `UI/UX 디자인팀` `브랜드 디자인팀` `콘텐츠 디자인팀` `영상·모션팀` `기타`.
- `workItem`에 `team` 필드를 추가하지 않는다(processId로 도출).
- 모든 검증 명령은 `manager-react/`에서 실행한다.

---

### Task 1: helpers.js — 프로세스→팀 매핑

**Files:**
- Modify: `manager-react/src/data/helpers.js` (파일 끝에 추가)

**Interfaces:**
- Produces:
  - `PROCESS_TEAM: Record<string,string>` — processId→팀명.
  - `ETC_TEAM: string` — 값 `'기타'`.
  - `TEAM_ORDER: string[]` — 사이드바 노출 순서(전체 제외, 기타 포함).
  - `getProjectTeam(workItem: { processId?: string }): string` — 팀명 반환, processId 없으면 `ETC_TEAM`.

- [ ] **Step 1: helpers.js 끝에 매핑/함수 추가**

`manager-react/src/data/helpers.js` 파일 맨 끝(53행 `isDelayed` 함수 다음)에 아래를 추가한다:

```js

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
```

- [ ] **Step 2: lint 통과 확인**

Run: `cd manager-react && npm run lint`
Expected: 에러 없이 종료(exit 0). 기존 경고 외 신규 에러 없음.

- [ ] **Step 3: build 통과 확인**

Run: `cd manager-react && npm run build`
Expected: `built in ...` 출력, 에러 없이 종료.

- [ ] **Step 4: 커밋**

```bash
cd /Users/idahye/Documents/Company/vibe-projects-calendar
git add manager-react/src/data/helpers.js
git commit -m "feat(calendar): processId 기반 프로젝트 팀 매핑 추가"
```

---

### Task 2: CalendarPage — 팀 사이드바 + 필터 + 프로젝트명 클릭 진입

**Files:**
- Modify: `manager-react/src/components/CalendarPage.jsx`

**Interfaces:**
- Consumes: `getProjectTeam`, `TEAM_ORDER`, `ETC_TEAM` (Task 1), 기존 `projects`/`getWorkItemStatus`/`STATUS_COLOR`/`AllProjectsTimeline`.
- Produces: 없음(페이지 컴포넌트).

동작 정의:
- owner 사이드바 = 팀 목록(`전체` + 프로젝트가 1개 이상인 팀만, `TEAM_ORDER` 순서). 각 항목 우측에 프로젝트 수 뱃지.
- 팀 클릭 → `selectedTeam` 설정 + `viewMode='all'`(전체보기로 전환하며 필터).
- 전체보기 본문은 `selectedTeam`으로 필터한 프로젝트만 `AllProjectsTimeline`에 전달.
- 본문 프로젝트명 클릭 → 프로젝트별 모드 진입(`setSelectedProjectId(id)` + `viewMode='project'`).
- 직원·팀장(owner 아님)은 기존 프로젝트 목록 사이드바 그대로.

- [ ] **Step 1: import에 팀 유틸 추가**

`manager-react/src/components/CalendarPage.jsx` 4행:
```js
import { canEditCalendar, ROLES } from '../data/roles'
```
을 아래로 교체:
```js
import { canEditCalendar, ROLES } from '../data/roles'
import { getProjectTeam, TEAM_ORDER } from '../data/helpers'
```
(주의: 2행에서 이미 `TODAY_ISO, isDelayed`를 `../data/helpers`에서 import 중이다. 2행은 그대로 두고 위처럼 별도 import 라인을 추가한다. ESLint `no-duplicate-imports`가 켜져 있으면 대신 2행을 `import { TODAY_ISO, isDelayed, getProjectTeam, TEAM_ORDER } from '../data/helpers'`로 합치고 4행은 roles만 남긴다.)

- [ ] **Step 2: selectedTeam 상태 추가**

128행 `const [viewMode, setViewMode] = useState('all')` 아래에 추가:
```js
  const [selectedTeam, setSelectedTeam] = useState('전체') // 대표 전체보기 팀 필터
```

- [ ] **Step 3: 팀 카운트 + 필터 프로젝트 계산 추가**

143행 `const selectedProject = projects.find(p => p.id === selectedProjectId)` 아래에 추가:
```js

  // 팀별 프로젝트 수(전체보기 사이드바 뱃지). 회의·연차·반복 제외된 projects 기준.
  const teamCounts = useMemo(() => {
    const counts = {}
    for (const p of projects) {
      const t = getProjectTeam(p)
      counts[t] = (counts[t] || 0) + 1
    }
    return counts
  }, [projects])

  // 사이드바에 노출할 팀(프로젝트가 1개 이상인 팀만, 정해진 순서).
  const visibleTeams = useMemo(
    () => TEAM_ORDER.filter(t => (teamCounts[t] || 0) > 0),
    [teamCounts]
  )

  // 선택 팀으로 필터한 전체보기용 프로젝트.
  const teamFilteredProjects = useMemo(
    () => (selectedTeam === '전체' ? projects : projects.filter(p => getProjectTeam(p) === selectedTeam)),
    [projects, selectedTeam]
  )
```

- [ ] **Step 4: owner 사이드바를 팀 목록으로 교체**

214–248행의 `<nav> … </nav>` 블록 전체를 아래로 교체한다. (owner면 팀 목록, 아니면 기존 프로젝트 목록)

```jsx
        {/* Left: Sidebar — 대표는 팀 목록(필터), 그 외는 기존 프로젝트 목록 */}
        <nav className="w-[200px] min-w-[160px] shrink-0 bg-white border border-line rounded-[10px] flex flex-col overflow-y-auto">
          <div className="text-[10.5px] font-semibold text-muted uppercase tracking-[0.06em] px-3.5 pt-3.5 pb-2.5 border-b border-line shrink-0">
            {isOwner ? '팀' : '프로젝트'}
          </div>

          {isOwner ? (
            // 팀 목록: 전체 + 프로젝트 있는 팀만
            [{ name: '전체', count: projects.length }, ...visibleTeams.map(t => ({ name: t, count: teamCounts[t] || 0 }))].map(team => {
              const isActive = selectedTeam === team.name
              return (
                <button key={team.name}
                  onClick={() => { setSelectedTeam(team.name); setViewMode('all') }}
                  className={`flex items-center justify-between px-3.5 py-2.5 border-b border-line text-left w-full transition-colors cursor-pointer
                    ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                  <span className={`text-[12px] font-medium ${isActive ? 'text-blue' : 'text-text-primary'}`}>{team.name}</span>
                  <span className="text-[10px] font-medium text-muted px-1.5 py-0.5 rounded bg-surface-muted">{team.count}</span>
                </button>
              )
            })
          ) : (
            projects.length === 0 ? (
              <div className="px-3.5 py-5 text-[12px] text-muted">프로젝트 없음</div>
            ) : (
              projects.map(wi => {
                const status = getWorkItemStatus(wi, sessions)
                const sc = STATUS_COLOR[status] || STATUS_COLOR['시작 전']
                const isActive = selectedProjectId === wi.id
                return (
                  <button key={wi.id}
                    onClick={() => { setSelectedProjectId(wi.id); setViewMode('project') }}
                    className={`flex flex-col items-start px-3.5 py-2.5 border-b border-line gap-[5px] text-left w-full transition-colors cursor-pointer
                      ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-bg'}`}>
                    <span className="flex items-start gap-1.5 text-[12px] font-medium text-text-primary leading-[1.4]">
                      {wi.type === '고정' ? (
                        <svg className="w-[12px] h-[12px] text-[#6b7280] shrink-0 mt-[2px]" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                        </svg>
                      ) : (
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-[3px] ${wi.type === '긴급' ? 'bg-red' : wi.type === '회의' ? 'bg-orange' : 'bg-soft'}`} />
                      )}
                      <span>{wi.title}</span>
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: sc.bg, color: sc.text }}>
                      {status}
                    </span>
                  </button>
                )
              })
            )
          )}
        </nav>
```

- [ ] **Step 5: 전체보기에 필터된 프로젝트 전달 + 프로젝트명 클릭 동작 변경**

294–301행의 `AllProjectsTimeline` 사용처를 아래로 교체한다(필터 프로젝트 전달 + onNameClick을 프로젝트별 모드 진입으로):

```jsx
            {showAll ? (
              <AllProjectsTimeline
                projects={teamFilteredProjects}
                days={days}
                sessions={sessions}
                onBarClick={(p) => setDetailItem(p)}
                onNameClick={(id) => { setSelectedProjectId(id); setViewMode('project') }}
              />
```

- [ ] **Step 6: lint 통과 확인**

Run: `cd manager-react && npm run lint`
Expected: 신규 에러 없이 종료. (미사용 `editItemId` 관련 경고가 새로 뜨면, 해당 변수/핸들러는 프로젝트별 모드 상단 프로젝트명 클릭에서 여전히 쓰이므로 그대로 둔다 — 267–279행 참조.)

- [ ] **Step 7: build 통과 확인**

Run: `cd manager-react && npm run build`
Expected: `built in ...` 출력, 에러 없이 종료.

- [ ] **Step 8: 브라우저 육안 확인**

http://localhost:5174 접속 → 역할을 **대표**로 전환 → **Calendar** 메뉴.
확인 항목:
1. 왼쪽 사이드바에 팀 목록(전체 / UI/UX 디자인팀 / 브랜드 디자인팀 / 콘텐츠 디자인팀 / 영상·모션팀 / 기타)과 프로젝트 수 뱃지가 보인다.
2. 팀을 클릭하면 본문 달력이 그 팀 프로젝트만 보여준다(전체보기로 전환).
3. 본문 프로젝트명을 클릭하면 프로젝트별(단계·담당자) 모드로 들어간다.
4. 막대 클릭 시 기존 상세 패널이 열린다.
5. 직원/팀장으로 전환하면 사이드바가 기존 프로젝트 목록 그대로다.

- [ ] **Step 9: 커밋**

```bash
cd /Users/idahye/Documents/Company/vibe-projects-calendar
git add manager-react/src/components/CalendarPage.jsx
git commit -m "feat(calendar): 대표 전체보기 팀 사이드바 필터 + 월 달력"
```

---

## Self-Review

**Spec coverage:**
- 팀 분류(processId 매핑, 기타 포함) → Task 1. ✓
- 팀 사이드바(필터, 카운트 뱃지, owner 전용) → Task 2 Step 4. ✓
- 본문 월 달력(프로젝트행 + 가로 날짜) → 기존 `AllProjectsTimeline` 재사용, 필터만 적용 Task 2 Step 5. ✓
- 프로젝트별 모드 진입(프로젝트명 클릭) → Task 2 Step 5. ✓
- 막대 클릭 → CalendarDetailPanel 유지(기존 onBarClick). ✓
- 직원·팀장 화면 불변 → Task 2 Step 4의 `isOwner` 분기. ✓

**Placeholder scan:** 모든 코드 블록은 실제 내용 포함. TODO/TBD 없음. ✓

**Type consistency:** `getProjectTeam`/`TEAM_ORDER`/`ETC_TEAM`는 Task 1에서 정의, Task 2에서 동일 이름으로 사용. `selectedTeam`('전체' 기본), `teamFilteredProjects`, `visibleTeams`, `teamCounts` 이름 일관. `AllProjectsTimeline` props(`projects/days/sessions/onBarClick/onNameClick`)는 기존 시그니처와 일치. ✓

**비고:** 본문 월 달력의 "가로 날짜 격자(주말 음영·오늘 강조)"는 기존 `AllProjectsTimeline`에 이미 구현돼 있어 추가 작업이 없다. 향후 7열 달력 등 다른 형태가 필요하면 별도 계획으로 분리한다.
