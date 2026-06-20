# Calendar 노션식 월 달력 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 대표(owner) Calendar 본문을 간트에서 노션식 월 달력(7열 그리드 + 멀티데이 이벤트 바, 팀 색상)으로 바꾸고, 토글을 없애고, 이벤트 클릭 시 기존 `DetailPanel` 슬라이드를 연다.

**Architecture:** 달력 그리드·주별 이벤트 레인 배치·팀 색상을 `helpers.js`의 순수 함수로 두고, 노션식 렌더를 신규 `MonthCalendar.jsx`에 격리한다. `CalendarPage.jsx`는 owner 분기에서 토글을 제거하고 본문을 `MonthCalendar`로 교체하며, 이벤트 클릭을 `DetailPanel` 오픈에 연결한다. 직원·팀장 경로는 건드리지 않는다.

**Tech Stack:** React 19, Vite, Tailwind 유틸 클래스, 순수 JS. 테스트 러너 없음 → 순수 함수는 `node -e`로 검증, 컴포넌트는 `npm run lint` + `npm run build` + 브라우저(http://localhost:5174).

## Global Constraints

- 작업 위치: 워크트리 `/Users/idahye/Documents/Company/vibe-projects-calendar`, 브랜치 `feat/calendar-react`, 앱 루트 `manager-react/`. 모든 명령은 `manager-react/`에서 실행.
- 변경 대상은 **대표(owner) Calendar**뿐. 직원·팀장 화면(프로젝트별 단계·담당자 간트)은 변경하지 않는다.
- 캘린더는 회의·연차·반복 업무를 표시하지 않는다(기존 `projects` 필터 유지).
- 상태는 `시작 전 / 진행 중 / 지연`만. 업무항목 완료 상태를 만들지 않는다.
- 팀 이름·순서는 v1과 동일: `UI/UX 디자인팀` `브랜드 디자인팀` `콘텐츠 디자인팀` `영상·모션팀` `기타`.
- 팀 색상(정확값):
  `UI/UX 디자인팀` text `#2563eb` bg `#dbeafe` /
  `브랜드 디자인팀` text `#7c3aed` bg `#ede9fe` /
  `콘텐츠 디자인팀` text `#059669` bg `#d1fae5` /
  `영상·모션팀` text `#d97706` bg `#fef3c7` /
  `기타` text `#4b5563` bg `#f3f4f6`.
- 프로젝트 기간: `end`가 없으면 `start` 하루로 간주.

---

### Task 1: helpers.js — 달력 그리드·이벤트 레인·팀 색상

**Files:**
- Modify: `manager-react/src/data/helpers.js` (파일 끝, Task의 v1 팀 매핑 다음에 추가)

**Interfaces:**
- Consumes: 기존 `TODAY_ISO`(같은 파일), v1의 `getProjectTeam`(같은 파일).
- Produces:
  - `TEAM_COLOR: Record<string,{text:string,bg:string}>`
  - `getTeamColor(teamName: string): {text:string,bg:string}` — 매핑 없으면 '기타' 색.
  - `getCalendarWeeks(year:number, month:number): Day[][]` —
    `Day = { date:'YYYY-MM-DD', day:number, inMonth:boolean, isToday:boolean, isWeekend:boolean }`.
    1일이 속한 주의 일요일 ~ 말일이 속한 주의 토요일까지.
  - `layoutWeekEvents(projects:Array<{id,start,end?,...}>, week:Day[]): Array<{project,lane:number,startCol:number,endCol:number,continuesLeft:boolean,continuesRight:boolean}>`.

- [ ] **Step 1: helpers.js 끝에 함수 추가**

`manager-react/src/data/helpers.js` 맨 끝(v1에서 추가한 `getProjectTeam` 함수 다음)에 아래를 추가한다:

```js

// ─── 팀 색상 (노션식 달력 이벤트 막대) ───────────────────────────────────────
export const TEAM_COLOR = {
  'UI/UX 디자인팀': { text: '#2563eb', bg: '#dbeafe' },
  '브랜드 디자인팀': { text: '#7c3aed', bg: '#ede9fe' },
  '콘텐츠 디자인팀': { text: '#059669', bg: '#d1fae5' },
  '영상·모션팀': { text: '#d97706', bg: '#fef3c7' },
  '기타': { text: '#4b5563', bg: '#f3f4f6' },
};

// 팀명 → 색. 매핑에 없으면 '기타' 색.
export function getTeamColor(teamName) {
  return TEAM_COLOR[teamName] || TEAM_COLOR['기타'];
}

// ─── 노션식 월 달력 그리드 ───────────────────────────────────────────────────
// 1일이 속한 주의 일요일 ~ 말일이 속한 주의 토요일까지를 7일씩 묶어 반환.
export function getCalendarWeeks(year, month) {
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay()); // 그 주 일요일
  const last = new Date(year, month + 1, 0);
  const gridEnd = new Date(year, month, last.getDate() + (6 - last.getDay())); // 그 주 토요일

  const weeks = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = toISO(cur);
      const dow = cur.getDay();
      week.push({
        date,
        day: cur.getDate(),
        inMonth: cur.getMonth() === month,
        isToday: date === TODAY_ISO,
        isWeekend: dow === 0 || dow === 6,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// 한 주(7일)에 걸치는 프로젝트를 레인(층)으로 배치(겹침 방지, 그리디).
// 반환 항목: { project, lane, startCol(0~6), endCol(0~6), continuesLeft, continuesRight }
export function layoutWeekEvents(projects, week) {
  const weekStart = week[0].date;
  const weekEnd = week[6].date;

  const items = projects
    .map(p => ({ p, start: p.start, end: p.end || p.start }))
    .filter(it => it.start <= weekEnd && it.end >= weekStart)
    .sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end));

  const laneEnds = []; // laneEnds[i] = 그 레인에 마지막 배치된 endCol
  const result = [];
  for (const it of items) {
    const startCol = it.start <= weekStart ? 0 : week.findIndex(d => d.date === it.start);
    const endCol = it.end >= weekEnd ? 6 : week.findIndex(d => d.date === it.end);

    let lane = 0;
    while (lane < laneEnds.length && laneEnds[lane] >= startCol) lane++;
    laneEnds[lane] = endCol;

    result.push({
      project: it.p,
      lane,
      startCol,
      endCol,
      continuesLeft: it.start < weekStart,
      continuesRight: it.end > weekEnd,
    });
  }
  return result;
}
```

- [ ] **Step 2: node로 그리드/레인 로직 빠른 검증**

Run:
```bash
cd manager-react && node --input-type=module -e "
import { getCalendarWeeks, layoutWeekEvents } from './src/data/helpers.js';
const weeks = getCalendarWeeks(2026, 5); // 6월(0-base)
console.log('weeks:', weeks.length, 'first:', weeks[0][0].date, 'last:', weeks.at(-1).at(-1).date);
const projects = [
  { id:'a', start:'2026-06-11', end:'2026-06-18' },
  { id:'b', start:'2026-06-12', end:'2026-06-17' },
  { id:'c', start:'2026-06-02', end:'2026-06-27' },
];
const wk = weeks.find(w => w.some(d => d.date==='2026-06-14'));
console.log(layoutWeekEvents(projects, wk).map(e => [e.project.id, e.lane, e.startCol, e.endCol, e.continuesLeft, e.continuesRight]));
"
```
Expected: `weeks: 5 first: 2026-05-31 last: 2026-07-04`, 그리고 a/b/c가 서로 다른 lane(0/1/2 중)으로, c는 `continuesLeft=true continuesRight=true`로 출력된다. (겹치는 a·b가 같은 lane이 아니어야 함)

- [ ] **Step 3: lint 통과 확인**

Run: `cd manager-react && npx eslint src/data/helpers.js`
Expected: exit 0(에러 없음).

- [ ] **Step 4: build 통과 확인**

Run: `cd manager-react && npm run build`
Expected: `built in ...`, 에러 없음.

- [ ] **Step 5: 커밋**

```bash
cd /Users/idahye/Documents/Company/vibe-projects-calendar
git add manager-react/src/data/helpers.js
git commit -m "feat(calendar): 노션식 월 달력 그리드/레인/팀색상 유틸"
```

---

### Task 2: MonthCalendar.jsx — 노션식 월 달력 컴포넌트

**Files:**
- Create: `manager-react/src/components/MonthCalendar.jsx`

**Interfaces:**
- Consumes: `getCalendarWeeks`, `layoutWeekEvents`(Task 1), `getProjectTeam`, `getTeamColor`(helpers).
- Produces: `export default function MonthCalendar({ projects, year, month, onEventClick })`.
  - `projects`: 팀 필터 적용된 프로젝트 배열.
  - `onEventClick(project)`: 이벤트 막대 클릭 콜백.

- [ ] **Step 1: MonthCalendar.jsx 생성**

`manager-react/src/components/MonthCalendar.jsx`:

```jsx
import { getCalendarWeeks, layoutWeekEvents, getProjectTeam, getTeamColor } from '../data/helpers'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const LANE_H = 22 // 이벤트 막대 한 층 높이(px)
const DATE_ROW_H = 24 // 날짜 숫자 줄 높이(px)

export default function MonthCalendar({ projects, year, month, onEventClick }) {
  const weeks = getCalendarWeeks(year, month)

  return (
    <div className="flex flex-col">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-line sticky top-0 bg-white z-[2]">
        {DOW.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-semibold py-2 ${i === 0 || i === 6 ? 'text-[#9ca3af]' : 'text-muted'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 주별 행 */}
      {weeks.map((week, wi) => {
        const events = layoutWeekEvents(projects, week)
        const laneCount = events.reduce((m, e) => Math.max(m, e.lane + 1), 0)
        const rowH = DATE_ROW_H + laneCount * LANE_H + 6
        return (
          <div key={wi} className="relative border-b border-line" style={{ height: rowH }}>
            {/* 날짜 칸 배경(7열) */}
            <div className="grid grid-cols-7 h-full">
              {week.map(d => (
                <div key={d.date} className={`border-r border-line-soft last:border-r-0 ${d.isWeekend ? 'bg-[#fafafa]' : ''} ${d.isToday ? 'bg-[#eff6ff55]' : ''}`}>
                  <div className={`text-[11px] px-1.5 pt-1 ${!d.inMonth ? 'text-[#d1d5db]' : d.isToday ? 'text-blue font-bold' : d.isWeekend ? 'text-[#9ca3af]' : 'text-text-sub'}`}>
                    {d.day}
                  </div>
                </div>
              ))}
            </div>

            {/* 이벤트 막대(절대 배치) */}
            {events.map(ev => {
              const team = getProjectTeam(ev.project)
              const c = getTeamColor(team)
              const left = (ev.startCol / 7) * 100
              const width = ((ev.endCol - ev.startCol + 1) / 7) * 100
              const top = DATE_ROW_H + ev.lane * LANE_H
              const radius = `${ev.continuesLeft ? '0' : '5px'} ${ev.continuesRight ? '0' : '5px'} ${ev.continuesRight ? '0' : '5px'} ${ev.continuesLeft ? '0' : '5px'}`
              return (
                <button
                  key={ev.project.id}
                  onClick={() => onEventClick(ev.project)}
                  title={`${ev.project.title} (${ev.project.start} ~ ${ev.project.end || ev.project.start})`}
                  className="absolute h-[18px] flex items-center px-1.5 overflow-hidden cursor-pointer hover:brightness-95"
                  style={{
                    left: `calc(${left}% + 3px)`,
                    width: `calc(${width}% - 6px)`,
                    top,
                    background: c.bg,
                    borderLeft: `3px solid ${c.text}`,
                    borderRadius: radius,
                  }}
                >
                  <span className="text-[10.5px] font-medium truncate" style={{ color: c.text }}>{ev.project.title}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: lint 통과 확인**

Run: `cd manager-react && npx eslint src/components/MonthCalendar.jsx`
Expected: exit 0.

- [ ] **Step 3: build 통과 확인**

Run: `cd manager-react && npm run build`
Expected: `built in ...`, 에러 없음. (아직 화면에 연결 전이라 빌드만 확인)

- [ ] **Step 4: 커밋**

```bash
cd /Users/idahye/Documents/Company/vibe-projects-calendar
git add manager-react/src/components/MonthCalendar.jsx
git commit -m "feat(calendar): 노션식 월 달력 MonthCalendar 컴포넌트"
```

---

### Task 3: CalendarPage 통합 — 토글 제거 + 본문 교체 + 이벤트 클릭→DetailPanel

**Files:**
- Modify: `manager-react/src/components/CalendarPage.jsx`

**Interfaces:**
- Consumes: `MonthCalendar`(Task 2), 기존 `teamFilteredProjects`/`calYear`/`calMonth`/`setEditItemId`/`DetailPanel`.

- [ ] **Step 1: MonthCalendar import 추가**

5–6행의 import 블록에 한 줄 추가(예: `DetailPanel` import 다음 줄):
```jsx
import MonthCalendar from './MonthCalendar'
```

- [ ] **Step 2: owner 상단 토글 제거**

다음 블록(전체 보기/프로젝트별 토글, `{isOwner && ( ... )}`)을 통째로 삭제한다:

```jsx
              {isOwner && (
                <div className="flex gap-1 bg-surface-muted rounded-lg p-0.5">
                  <button onClick={() => setViewMode('all')}
                    className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors cursor-pointer ${viewMode === 'all' ? 'bg-white text-blue shadow-sm' : 'text-muted hover:text-text-sub'}`}>
                    전체 보기
                  </button>
                  <button onClick={() => selectedProject && setViewMode('project')} disabled={!selectedProject}
                    className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${viewMode === 'project' ? 'bg-white text-blue shadow-sm' : 'text-muted hover:text-text-sub'} ${!selectedProject ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    프로젝트별
                  </button>
                </div>
              )}
```

(삭제 후 그 자리에는 아무것도 넣지 않는다. 같은 `<div className="flex items-center gap-3">` 안의 `{!showAll && (...)}` 블록은 그대로 둔다 — 직원·팀장의 프로젝트명/안내 표시용.)

- [ ] **Step 3: showAll 본문을 MonthCalendar로 교체**

다음 블록:
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
을 아래로 교체:
```jsx
            {showAll ? (
              <div className="px-2 py-2">
                <MonthCalendar
                  projects={teamFilteredProjects}
                  year={calYear}
                  month={calMonth}
                  onEventClick={(p) => setEditItemId(p.id)}
                />
              </div>
```

- [ ] **Step 4: 미사용 AllProjectsTimeline / barPosition 제거**

`AllProjectsTimeline` 함수 정의(주석 `// 전체 보기 — 모든 프로젝트를 한 화면에 ...` 부터 그 함수 끝 `}`까지)와, 그 위의 `barPosition` 함수 정의(주석 `// 월 그리드에서 start~end ISO 구간을 ...` 부터 함수 끝까지)를 삭제한다. (둘 다 owner 전체보기 전용이었고 이제 미사용. `DayHeader`·`getWorkItemStatus`·`memberColor`는 프로젝트별 모드에서 계속 쓰므로 남긴다.)

- [ ] **Step 5: lint로 미사용 변수 정리 확인**

Run: `cd manager-react && npx eslint src/components/CalendarPage.jsx`
Expected: exit 0. 만약 `days`/`setDetailItem`/`detailItem`/`viewMode`/`setViewMode` 등에 미사용 경고가 뜨면 아래 기준으로 처리:
- `detailItem`/`setDetailItem`: `CalendarDetailPanel`(막대→세션 상세)에서 여전히 쓰이면 유지. showAll 본문에서 더 이상 `setDetailItem`을 호출하지 않으므로, `CalendarDetailPanel` 사용처(파일 하단)와 프로젝트별 간트의 `onClick={() => setDetailItem(selectedProject)}`가 남아 있는지 확인하고, 남아 있으면 유지(정상).
- `days`: 프로젝트별 모드(`DayHeader`·간트 셀)에서 계속 사용하므로 유지.
- `viewMode`/`setViewMode`: 직원·팀장 프로젝트별 진입(사이드바 클릭 `setViewMode('project')`)과 `showAll` 계산에서 사용하므로 유지.
실제로 신규 미사용이 생긴 경우에만 해당 선언/사용을 제거한다.

- [ ] **Step 6: build 통과 확인**

Run: `cd manager-react && npm run build`
Expected: `built in ...`, 에러 없음.

- [ ] **Step 7: 브라우저 육안 확인**

http://localhost:5174 → 역할 **대표** → **Calendar**.
확인:
1. 상단에 "전체 보기/프로젝트별" 토글이 **없고** 월 이동(◀ 2026년 6월 ▶)만 있다.
2. 본문이 **7열 월 달력**(일~토)이고, 프로젝트가 멀티데이 가로 막대로 기간만큼 표시된다.
3. 막대 색이 **팀 색상**(UI/UX 파랑, 브랜드 보라, 콘텐츠 초록, 영상 주황, 기타 회색)이다.
4. 막대 클릭 시 **오른쪽 슬라이드(DetailPanel)** 상세가 열린다.
5. 왼쪽 팀 사이드바에서 팀을 고르면 그 팀 프로젝트만 달력에 남는다.
6. 직원/팀장으로 전환하면 기존 프로젝트별 단계·담당자 간트 화면이 그대로다.

- [ ] **Step 8: 커밋**

```bash
cd /Users/idahye/Documents/Company/vibe-projects-calendar
git add manager-react/src/components/CalendarPage.jsx
git commit -m "feat(calendar): 대표 본문을 노션식 월 달력으로 교체, 토글 제거, 이벤트→상세 슬라이드"
```

---

## Self-Review

**Spec coverage:**
- 토글 삭제 → Task 3 Step 2. ✓
- 프로젝트 클릭 → DetailPanel → Task 3 Step 3(`onEventClick → setEditItemId`). ✓
- 노션식 월 달력(7열 + 멀티데이 바 + 레인) → Task 1(유틸) + Task 2(렌더). ✓
- 팀 색상 → Task 1 `TEAM_COLOR`/`getTeamColor`, Task 2 적용. ✓
- 직원·팀장 화면 유지 → Task 3에서 `!isOwner`/프로젝트별 경로·`DayHeader`·간트 보존. ✓
- AllProjectsTimeline 제거 → Task 3 Step 4. ✓
- 팀 사이드바 필터 유지 → 변경 안 함(teamFilteredProjects 그대로 사용). ✓

**Placeholder scan:** 모든 코드/명령 실제 내용 포함. TODO/TBD 없음. ✓

**Type consistency:** `getCalendarWeeks`/`layoutWeekEvents`/`getTeamColor`/`getProjectTeam`는 Task 1 정의, Task 2에서 동일 이름 사용. `layoutWeekEvents` 반환 필드(`project/lane/startCol/endCol/continuesLeft/continuesRight`)를 Task 2가 그대로 소비. `MonthCalendar` props(`projects/year/month/onEventClick`)를 Task 3가 동일하게 전달. ✓

**비고:** `toISO`는 helpers에 이미 존재(Task 1에서 재사용). 셀 넘침 "+N개" 접기는 spec대로 보류(YAGNI).
