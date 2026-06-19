// ─── Boot date (real today + Monday of this week, local timezone) ────────────

function _localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const _now        = new Date();
const _todayISO   = _localISO(_now);
const _dow        = _now.getDay(); // 0=Sun
const _mondayOff  = _dow === 0 ? -6 : 1 - _dow;
const _mondayDate = new Date(_now);
_mondayDate.setDate(_mondayDate.getDate() + _mondayOff);
const _mondayISO  = _localISO(_mondayDate);

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  selectedTaskId: 'wi-5',
  selectedRequestId: null,
  selectedActionItem: null,
  pendingDeleteSessionId: null,
  pendingDeleteWorkItemId: null,
  editingSessionId: null,
  editingSessionOriginalTitle: null,
  pendingNewSessionId: null,
  pendingNewSessionSourceId: null,
  editingSessionTimeId: null,
  weekOffset: 0,
  drawerActiveDay: 0,
  drawerDayTasks: null,
  inlineAddItemId: null,
  today: _todayISO,
  dailyViewDate: _todayISO,
  currentPage: 'home',
  calYear: _now.getFullYear(),
  calMonth: _now.getMonth(),
  calViewMode: 'monthly',
  calWeekOffset: 0,
  calMemberFilter: '전체',
  calSelectedEventId: null,
  pendingDeleteResourceId: null,
  pendingDeleteResourceWiId: null,
  workItemResources: {},
  calTeamFilter: '전체',
  calSearchQuery: '',
  recorder: { status: 'idle', seconds: 0 }, // 'idle' | 'recording'
  meetingDetailId: null,
  meetingDetailTab: 'ai', // 'ai' | 'script' | 'actions'
  detailPanelItemId: null,
  detailDraft: null, // { title, type, end, description } — tracks unsaved edits
  detailShowAllSteps: false,
  currentUser: { id: 'u-1', name: 'Jihye', role: 'Member', team: '디자인팀', onLeave: false, joinDate: '2023-04-03' },
  myPageTab: 'history',
  myPageCalYear: _now.getFullYear(),
  myPageCalMonth: _now.getMonth(),
  myPageSelectedDate: null,

  teamMembers: [
    { id: 'u-1', name: 'Jihye',   role: 'UI/UX Designer',   team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: '앱 온보딩 화면 긴급 수정',     type: '긴급', done: true  },
        { title: '이벤트 배너 긴급 제작',        type: '긴급', done: true  },
        { title: '메인 홈 리디자인',             type: '일반', done: false },
        { title: '디자인 리뷰 미팅',             type: '고정', done: true  },
      ]},
    { id: 'u-2', name: '이나경',  role: 'Brand Designer',   team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: '브랜드 가이드라인 갱신',       type: '일반', done: true  },
        { title: '로고 변형안 시안 제작',        type: '일반', done: true  },
        { title: '컬러 팔레트 정리',             type: '고정', done: false },
      ]},
    { id: 'u-3', name: '박서연',  role: 'Motion Designer',  team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: '앱 전환 애니메이션 제작',      type: '긴급', done: false },
        { title: '로딩 인터랙션 개선',           type: '일반', done: false },
      ]},
    { id: 'u-4', name: '김도현',  role: 'UX Researcher',    team: '디자인팀', onLeave: true,  leaveType: '오전 반차',
      weekWorkItems: [
        { title: '사용자 인터뷰 분석',           type: '고정', done: true  },
        { title: '경쟁사 UX 리서치',             type: '일반', done: false },
      ]},
    { id: 'u-5', name: '최유진',  role: 'Product Designer', team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: '신규 서비스 와이어프레임',     type: '일반', done: true  },
        { title: '프로토타입 사용성 검토',       type: '일반', done: true  },
        { title: '플로우 차트 정리',             type: '일반', done: true  },
        { title: '화면 설계서 업데이트',         type: '긴급', done: false },
      ]},
    { id: 'u-6', name: '정하은',  role: 'Visual Designer',  team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: 'SNS 카드뉴스 시리즈 제작',     type: '일반', done: true  },
        { title: '이벤트 페이지 비주얼',         type: '일반', done: true  },
        { title: '일러스트 에셋 정리',           type: '고정', done: true  },
        { title: '브로셔 최종 인쇄본 확인',      type: '일반', done: true  },
      ]},
    { id: 'u-7', name: '장준혁',  role: 'Design Lead',      team: '디자인팀', onLeave: false, leaveType: null,
      weekWorkItems: [
        { title: '주간 디자인 방향 조율',        type: '고정', done: true  },
        { title: '디자인 QA 점검',               type: '일반', done: false },
        { title: '클라이언트 미팅 준비',         type: '긴급', done: false },
      ]},
    { id: 'u-8', name: '윤소이',  role: 'UI Designer',      team: '디자인팀', onLeave: true,  leaveType: '연차',
      weekWorkItems: [
        { title: '컴포넌트 라이브러리 업데이트', type: '고정', done: false },
        { title: '다크모드 시안 작업',           type: '일반', done: false },
        { title: '아이콘 세트 리뉴얼',           type: '일반', done: false },
      ]},
  ],

  workItems: [
    // 회의 업무항목
    { id: 'wi-mtg-1', title: '디자인 QA 체크포인트', start: '2026-06-18', end: '2026-06-18', type: '회의', meetingTime: '14:30', participants: ['Jihye', '최유진', '박서연', '이나경', '장준혁'], sourceMeetingId: 'mr-12' },
    // 고정업무 — recurringDays: 1=월,2=화,3=수,4=목,5=금, end:null=무기한
    { id: 'wi-1',  title: '주간 디자인 싱크 미팅',  description: '매주 월요일 팀 전체 디자인 방향 및 이번 주 업무 우선순위를 공유합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [1],         participants: ['Jihye', '장준혁'] },
    { id: 'wi-2',  title: '일일 작업 기록',          description: '매일 작업 진행 상황을 Figma 및 노션에 기록하고 팀과 공유합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [1,2,3,4,5], participants: ['Jihye'] },
    { id: 'wi-3',  title: '디자인 리뷰 미팅',        description: '화요일·목요일 팀 내 디자인 산출물 리뷰 및 피드백 세션.', start: '2026-06-01', end: null, type: '고정', recurringDays: [2,4],       participants: ['Jihye'] },
    { id: 'wi-4',  title: 'Figma 라이브러리 정리',   description: '매주 금요일 Figma 컴포넌트 및 에셋 라이브러리를 정리·업데이트합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [5],         participants: ['Jihye'] },
    // 긴급업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-5',  title: '(주)모아커머스 앱 리뉴얼',       description: '(주)모아커머스 커머스 앱 전면 리뉴얼. 온보딩 UX 개선 및 인터랙션 흐름 수정 포함.', start: '2026-06-11', end: '2026-06-18', type: '긴급', participants: ['Jihye', '최유진', '박서연', '장준혁'], sourceRequestId: 'wr-r1', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye', '장준혁'], 'ps-1-02': ['박서연'], 'ps-1-03': ['최유진'], 'ps-1-04': ['최유진'], 'ps-1-05': ['Jihye', '최유진', '박서연', '장준혁'], 'ps-1-06': ['최유진'], 'ps-1-07': ['최유진'], 'ps-1-08': ['Jihye', '최유진', '박서연', '장준혁'], 'ps-1-09': ['최유진'], 'ps-1-10': ['최유진'], 'ps-1-11': ['박서연', '최유진'], 'ps-1-12': ['Jihye', '최유진', '박서연', '장준혁'], 'ps-1-13': ['박서연'], 'ps-1-14': ['최유진', '장준혁'] } },
    // 긴급업무 (업무요청 수락) — 디지털 콘텐츠
    { id: 'wi-6',  title: '(주)그린푸드 프로모션 배너',      description: '(주)그린푸드 여름 프로모션 SNS 배너 3종 제작. 인스타·페이스북·유튜브 썸네일.', start: '2026-06-12', end: '2026-06-17', type: '긴급', participants: ['Jihye', '정하은', '이나경'], sourceRequestId: 'wr-r2', processId: 'pc-3',
      stepAssignees: { 'ps-3-01': ['Jihye'], 'ps-3-02': ['정하은', '이나경'], 'ps-3-03': ['정하은'], 'ps-3-04': ['정하은', '이나경'], 'ps-3-05': ['Jihye', '정하은', '이나경'], 'ps-3-06': ['정하은'], 'ps-3-07': ['Jihye', '정하은'], 'ps-3-08': ['정하은'] } },
    // 일반업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-7',  title: '테크스타트 서비스 UI/UX',        description: '테크스타트(주) SaaS 서비스 메인 화면 전면 리디자인. 정보 구조 개선 및 비주얼 아이덴티티 적용.', start: '2026-06-09', end: '2026-06-20', type: '일반', participants: ['Jihye', '최유진', '김도현', '장준혁'], sourceRequestId: 'wr-r3', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye'], 'ps-1-02': ['최유진', '김도현'], 'ps-1-03': ['최유진'], 'ps-1-04': ['최유진'], 'ps-1-05': ['Jihye', '최유진', '김도현', '장준혁'], 'ps-1-06': ['최유진'], 'ps-1-07': ['최유진'], 'ps-1-08': ['Jihye', '최유진', '김도현', '장준혁'], 'ps-1-09': ['최유진'], 'ps-1-10': ['최유진'], 'ps-1-11': ['김도현', '최유진'], 'ps-1-12': ['Jihye', '최유진', '장준혁'], 'ps-1-13': ['최유진'], 'ps-1-14': ['최유진', '장준혁'] } },
    // 일반업무 (직접 추가)
    { id: 'wi-8',  title: '디자인 시스템 컴포넌트 정리', description: '버튼·폼·카드 등 핵심 컴포넌트 Figma 라이브러리 정리 및 스타일 토큰 일원화.', start: '2026-06-02', end: '2026-06-27', type: '일반', participants: ['Jihye'] },
    // 일반업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-9',  title: '스카이벤처스 UX 리서치',         description: '스카이벤처스 신규 서비스 출시 전 사용자 인터뷰 분석 및 페르소나 도출.', start: '2026-06-10', end: '2026-06-20', type: '일반', participants: ['Jihye', '김도현', '최유진', '장준혁'], sourceRequestId: 'wr-r4', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye'], 'ps-1-02': ['김도현'], 'ps-1-03': ['김도현', '최유진'], 'ps-1-04': ['김도현', '최유진'], 'ps-1-05': ['Jihye', '김도현', '최유진', '장준혁'], 'ps-1-06': ['김도현'], 'ps-1-07': ['김도현', '최유진'], 'ps-1-08': ['Jihye', '김도현', '최유진', '장준혁'], 'ps-1-09': ['김도현'], 'ps-1-10': ['김도현', '최유진'], 'ps-1-11': ['김도현'], 'ps-1-12': ['Jihye', '김도현', '장준혁'], 'ps-1-13': ['김도현'], 'ps-1-14': ['김도현', '장준혁'] } },
    // 일반업무 (업무요청 수락) — 브랜드 & 인쇄물
    { id: 'wi-10', title: '블루밍헬스 리브랜딩',             description: '블루밍헬스 리브랜딩 프로젝트. 로고·컬러 시스템·타이포그래피 가이드 제작.', start: '2026-06-09', end: '2026-06-24', type: '일반', participants: ['Jihye', '이나경', '정하은', '장준혁'], sourceRequestId: 'wr-r5', processId: 'pc-2',
      stepAssignees: { 'ps-2-01': ['Jihye'], 'ps-2-02': ['이나경'], 'ps-2-03': ['Jihye', '장준혁'], 'ps-2-04': ['이나경', '정하은'], 'ps-2-05': ['Jihye', '이나경', '정하은', '장준혁'], 'ps-2-06': ['이나경', '정하은'], 'ps-2-07': ['이나경', '정하은'], 'ps-2-08': ['Jihye', '이나경', '정하은', '장준혁'], 'ps-2-09': ['이나경'], 'ps-2-10': ['Jihye', '이나경', '장준혁'], 'ps-2-11': ['이나경'], 'ps-2-12': ['이나경'] } },
    // 일반업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-11', title: '핏라이프 모바일 앱',              description: '핏라이프 모바일 앱 주요 화면 UI 개선. 사용성 및 일관성 향상.', start: '2026-06-13', end: '2026-06-23', type: '일반', participants: ['Jihye', '최유진', '김도현'], sourceRequestId: 'wr-r6', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye'], 'ps-1-03': ['Jihye', '최유진'], 'ps-1-05': ['Jihye', '최유진', '김도현'], 'ps-1-08': ['Jihye', '최유진', '김도현'], 'ps-1-12': ['Jihye', '최유진'] } },
    // 일반업무 (업무요청 수락) — 디지털 콘텐츠
    { id: 'wi-12', title: '핏라이프 랜딩 페이지',            description: '핏라이프 신규 캠페인용 랜딩 페이지 디자인 시안 3종 제작.', start: '2026-06-16', end: '2026-06-24', type: '일반', participants: ['Jihye', '정하은', '이나경'], sourceRequestId: 'wr-r7', processId: 'pc-3',
      stepAssignees: { 'ps-3-01': ['Jihye'], 'ps-3-02': ['Jihye', '이나경'], 'ps-3-03': ['정하은', '이나경'], 'ps-3-04': ['정하은', '이나경'], 'ps-3-05': ['Jihye', '정하은', '이나경'], 'ps-3-06': ['정하은'], 'ps-3-07': ['Jihye', '정하은'], 'ps-3-08': ['정하은'] } },
    // 일반업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-13', title: '(주)모아커머스 아이콘 세트',      description: '(주)모아커머스 앱 내 아이콘 세트 전면 리뉴얼. 90개 아이콘 작업.', start: '2026-06-23', end: '2026-06-30', type: '일반', participants: ['Jihye', '윤소이', '정하은', '장준혁'], sourceRequestId: 'wr-r8', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye'], 'ps-1-02': ['윤소이'], 'ps-1-03': ['윤소이', '정하은'], 'ps-1-04': ['윤소이', '정하은'], 'ps-1-05': ['Jihye', '윤소이', '정하은', '장준혁'], 'ps-1-06': ['윤소이'], 'ps-1-07': ['윤소이', '정하은'], 'ps-1-08': ['Jihye', '윤소이', '정하은', '장준혁'], 'ps-1-09': ['윤소이'], 'ps-1-10': ['윤소이'], 'ps-1-11': ['윤소이'], 'ps-1-12': ['Jihye', '장준혁'], 'ps-1-13': ['윤소이'], 'ps-1-14': ['윤소이', '장준혁'] } },
    // 반복업무 (직접 추가)
    { id: 'wi-14', title: '주간 업무 보고서 작성',    description: '매주 금요일 팀 주간 업무 현황을 정리하여 보고서를 작성합니다.', start: '2026-06-01', end: null, type: '일반', recurringDays: [5], participants: ['Jihye'] },
    // 긴급 반복업무 (업무요청 수락) — UI/UX 디자인
    { id: 'wi-15', title: '(주)모아커머스 QA 지원',          description: '(주)모아커머스 앱 출시 전 QA 기간 디자인 버그 긴급 처리.', start: '2026-06-09', end: '2026-06-20', type: '긴급', recurringDays: [1,2,3,4,5], participants: ['Jihye', '최유진', '장준혁'], sourceRequestId: 'wr-r9', processId: 'pc-1',
      stepAssignees: { 'ps-1-01': ['Jihye'], 'ps-1-02': ['최유진'], 'ps-1-03': ['최유진'], 'ps-1-04': ['최유진'], 'ps-1-05': ['Jihye', '최유진', '장준혁'], 'ps-1-06': ['최유진'], 'ps-1-07': ['최유진'], 'ps-1-08': ['Jihye', '최유진', '장준혁'], 'ps-1-09': ['최유진'], 'ps-1-10': ['최유진'], 'ps-1-11': ['최유진'], 'ps-1-12': ['Jihye', '최유진', '장준혁'], 'ps-1-13': ['최유진'], 'ps-1-14': ['최유진', '장준혁'] } },
    // 일반업무 (업무요청 수락) — 영상 & 모션
    { id: 'wi-16', title: '넥스트에듀 서비스 소개 영상',     description: '넥스트에듀(주) 온라인 교육 플랫폼 서비스 소개 영상 60초. 스토리보드부터 최종 편집까지.', start: '2026-06-15', end: '2026-06-25', type: '일반', participants: ['Jihye', '박서연', '정하은', '장준혁'], sourceRequestId: 'wr-r10', processId: 'pc-4',
      stepAssignees: { 'ps-4-01': ['Jihye'], 'ps-4-02': ['박서연', '정하은'], 'ps-4-03': ['Jihye', '박서연', '정하은', '장준혁'], 'ps-4-04': ['박서연'], 'ps-4-05': ['박서연'], 'ps-4-06': ['박서연'], 'ps-4-07': ['Jihye', '박서연', '정하은', '장준혁'], 'ps-4-08': ['박서연'], 'ps-4-09': ['Jihye', '박서연', '장준혁'], 'ps-4-10': ['박서연'] } },
    // 일반업무 (업무요청 수락) — 브랜드 & 인쇄물
    { id: 'wi-17', title: '하이브뷰티 제품 카탈로그',        description: '하이브뷰티 2026 S/S 제품 카탈로그 32p 디자인. 인쇄 및 PDF 납품.', start: '2026-06-12', end: '2026-06-20', type: '일반', participants: ['Jihye', '이나경', '정하은', '장준혁'], sourceRequestId: 'wr-r11', processId: 'pc-2',
      stepAssignees: { 'ps-2-01': ['Jihye'], 'ps-2-02': ['이나경'], 'ps-2-03': ['Jihye', '장준혁'], 'ps-2-04': ['이나경', '정하은'], 'ps-2-05': ['Jihye', '이나경', '정하은', '장준혁'], 'ps-2-06': ['이나경', '정하은'], 'ps-2-07': ['이나경', '정하은'], 'ps-2-08': ['Jihye', '이나경', '정하은', '장준혁'], 'ps-2-09': ['정하은'], 'ps-2-10': ['Jihye', '장준혁'], 'ps-2-11': ['이나경'], 'ps-2-12': ['정하은'] } },
    // 5월 업무
    { id: 'wi-m1', title: '디자인 시스템 v2 구축',        description: '버튼·폼·카드·모달 등 핵심 컴포넌트 전면 개편. Figma 토큰 일원화 및 다크모드 대응 포함.', start: '2026-05-01', end: '2026-05-23', type: '일반', participants: ['Jihye', '윤소이', '이나경'] },
    { id: 'wi-m2', title: 'Q2 사용자 리서치',             description: '2분기 신규 서비스 출시 전 사용자 인터뷰 12건 진행 및 페르소나 재정립.', start: '2026-05-06', end: '2026-05-16', type: '일반', participants: ['Jihye', '김도현'] },
    { id: 'wi-m3', title: '모바일 앱 리뉴얼 1차 시안',    description: '기존 모바일 앱 전면 리뉴얼. 네비게이션 구조 개선 및 신규 비주얼 아이덴티티 적용 1차 시안 제작.', start: '2026-05-12', end: '2026-05-30', type: '일반', participants: ['Jihye', '최유진'] },
    { id: 'wi-m4', title: '(주)그린푸드 캠페인 소재 제작',  description: '(주)그린푸드 5월 프로모션용 SNS 배너·썸네일·스토리 소재 긴급 제작.', start: '2026-05-19', end: '2026-05-23', type: '긴급', participants: ['Jihye', '정하은'], sourceRequestId: 'wr-m4', processId: 'pc-3',
      stepAssignees: { 'ps-3-01': ['Jihye'], 'ps-3-02': ['Jihye'], 'ps-3-03': ['정하은'], 'ps-3-04': ['정하은'], 'ps-3-05': ['Jihye', '정하은'], 'ps-3-06': ['정하은'], 'ps-3-07': ['Jihye'], 'ps-3-08': ['정하은'] } },
    { id: 'wi-m5', title: '신규 온보딩 플로우 설계',      description: '신규 가입자 온보딩 UX 개선. 단계 축소 및 인터랙션 개선안 설계.', start: '2026-05-26', end: '2026-06-06', type: '일반', participants: ['Jihye', '최유진'] },
  ],

  sessions: [
    // ── 오늘(동적) Jihye 세션 ──────────────────────────────────────────────
    { id: 'ws-1', workItemId: 'wi-9',  stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: _todayISO, category: '기획',   title: '최종 디자인 확정',     startTime: '', endTime: '', done: false },
    { id: 'ws-2', workItemId: 'wi-5',  stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: _todayISO, category: '기획',   title: '최종 디자인 확정',           startTime: '', endTime: '', done: false },
    { id: 'ws-3', workItemId: 'wi-16', stepId: 'ps-4-03', authorId: 'u-1', authorName: 'Jihye', date: _todayISO, category: '기획',   title: '1차 피드백',            startTime: '', endTime: '', done: false },
    { id: 'ws-4', workItemId: 'wi-15', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: _todayISO, category: '기획',   title: '1차 피드백',             startTime: '', endTime: '', done: false },
    // ── 과거 세션 — 히스토리 캘린더용 ──────────────────────────────────────
    // 06/02 (월)
    { id: 'ws-h1',  workItemId: 'wi-1',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '기획',   title: '주간 디자인 싱크 진행',     startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h2',  workItemId: 'wi-8',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '디자인', title: '버튼 컴포넌트 정리',        startTime: '10:30', endTime: '12:30', done: true },
    { id: 'ws-h3',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '기획',   title: '일일 작업 기록',            startTime: '18:00', endTime: '18:30', done: true },
    // 06/03 (화)
    { id: 'ws-h4',  workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-03', category: '디자인', title: '홈 화면 시안 리뷰',         startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h5',  workItemId: 'wi-8',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-03', category: '디자인', title: '폼 컴포넌트 스타일 정리',   startTime: '10:00', endTime: '12:00', done: true },
    // 06/04 (수)
    { id: 'ws-h6',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-04', category: '기획',   title: '일일 작업 기록',            startTime: '17:30', endTime: '18:00', done: true },
    // 06/05 연차 (세션 없음)
    // 06/06 (금)
    { id: 'ws-h7',  workItemId: 'wi-4',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-06', category: '디자인', title: 'Figma 라이브러리 정리',     startTime: '14:00', endTime: '16:00', done: true },
    { id: 'ws-h8',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-06', category: '기획',   title: '일일 작업 기록',            startTime: '17:00', endTime: '17:30', done: true },
    // 06/09 (월)
    { id: 'ws-h9',  workItemId: 'wi-1',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '기획',   title: '주간 디자인 싱크 진행',     startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h10', workItemId: 'wi-7',  stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '기획',   title: '브리핑 & 계약',   startTime: '10:30', endTime: '12:30', done: true },
    { id: 'ws-h11', workItemId: 'wi-10', stepId: 'ps-2-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '기획',   title: '브리핑 & 계약',   startTime: '14:00', endTime: '17:00', done: true },
    // 06/10 (화)
    { id: 'ws-h12', workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '디자인', title: '디자인 리뷰 — 컴포넌트',    startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h13', workItemId: 'wi-9',  stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '기획',   title: '브리핑 & 계약', startTime: '09:00', endTime: '11:30', done: true },
    { id: 'ws-h14', workItemId: 'wi-7',  stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '기획',   title: '1차 피드백',       startTime: '12:00', endTime: '14:00', done: true },
    // 06/11 (수)
    { id: 'ws-h15', workItemId: 'wi-5',  stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '기획',   title: '1차 피드백',            startTime: '09:00', endTime: '10:30', done: true },
    { id: 'ws-h16', workItemId: 'wi-5',  stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '기획',   title: '브리핑 & 계약',    startTime: '12:00', endTime: '13:00', done: true },
    { id: 'ws-h17', workItemId: 'wi-10', stepId: 'ps-2-03', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '기획',   title: '콘셉트 기획',         startTime: '14:00', endTime: '17:00', done: true },
    // 06/12 (목)
    { id: 'ws-h17a', workItemId: 'wi-6', stepId: 'ps-3-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '브리핑 & 계약',         startTime: '08:00', endTime: '09:00', done: true },
    { id: 'ws-h18', workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '디자인', title: '디자인 리뷰 — 앱·브랜딩',   startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h19', workItemId: 'wi-6',  stepId: 'ps-3-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '1차 피드백',      startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h20', workItemId: 'wi-9',  stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '1차 피드백',      startTime: '15:30', endTime: '16:30', done: true },
    { id: 'ws-h20a', workItemId: 'wi-17', stepId: 'ps-2-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '브리핑 & 계약',    startTime: '13:00', endTime: '14:00', done: true },
    // 06/13 (금)
    { id: 'ws-h21', workItemId: 'wi-5', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '2차 피드백',            startTime: '09:00', endTime: '10:30', done: true },
    { id: 'ws-h22', workItemId: 'wi-17', stepId: 'ps-2-03', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '콘셉트 기획',       startTime: '13:00', endTime: '14:00', done: true },
    { id: 'ws-h23', workItemId: 'wi-11', stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '브리핑 & 계약',     startTime: '17:00', endTime: '18:00', done: true },
    // 06/15 (월 — 이번 주)
    { id: 'ws-h24', workItemId: 'wi-1',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '주간 디자인 싱크 진행',     startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h25', workItemId: 'wi-7',  stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '2차 피드백',            startTime: '10:00', endTime: '11:30', done: true },
    { id: 'ws-h26', workItemId: 'wi-16', stepId: 'ps-4-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '브리핑 & 계약',   startTime: '14:30', endTime: '15:30', done: true },
    { id: 'ws-h27', workItemId: 'wi-10', stepId: 'ps-2-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '1차 피드백',          startTime: '16:30', endTime: '18:00', done: true },
    // 06/16 (화)
    { id: 'ws-h28', workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '디자인', title: '디자인 리뷰 — UI·카탈로그',  startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h29', workItemId: 'wi-12', stepId: 'ps-3-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획',   title: '브리핑 & 계약',       startTime: '09:00', endTime: '09:30', done: true },
    { id: 'ws-h30', workItemId: 'wi-12', stepId: 'ps-3-02', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획',   title: '콘셉트 기획',               startTime: '12:00', endTime: '13:00', done: true },
    { id: 'ws-h31', workItemId: 'wi-5',  stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '디자인', title: '2차 피드백',      startTime: '17:00', endTime: '18:00', done: true },
    { id: 'ws-h32', workItemId: 'wi-17', stepId: 'ps-2-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '디자인', title: '1차 피드백',   startTime: '13:30', endTime: '14:00', done: true },
    // 06/17 (수)
    { id: 'ws-h33', workItemId: 'wi-6',  stepId: 'ps-3-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '디자인', title: '최종 디자인 확정',        startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h34', workItemId: 'wi-15', stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '브리핑 & 계약',           startTime: '12:00', endTime: '13:00', done: true },
    { id: 'ws-h35', workItemId: 'wi-15', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '2차 피드백',          startTime: '14:30', endTime: '16:00', done: true },
    { id: 'ws-h36', workItemId: 'wi-15', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '최종 디자인 확정',           startTime: '16:00', endTime: '17:00', done: true },
    // 5월 세션
    // 05-01 (금)
    { id: 'ws-m01', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-01', category: '디자인', title: '디자인 시스템 현황 분석 및 개선 방향 정리', startTime: '09:30', endTime: '12:00', done: true },
    { id: 'ws-m02', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-01', category: '기획',   title: '컴포넌트 인벤토리 작성',                  startTime: '13:00', endTime: '15:30', done: true },
    // 05-04 (월)
    { id: 'ws-m03', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-04', category: '디자인', title: '버튼 컴포넌트 토큰 정의',                  startTime: '09:00', endTime: '11:30', done: true },
    { id: 'ws-m04', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-04', category: '디자인', title: '폼 컴포넌트 스타일 가이드 작성',           startTime: '14:00', endTime: '17:00', done: true },
    // 05-06 (수) — 어린이날(05-05) 다음날
    { id: 'ws-m05', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-06', category: '리서치', title: '사용자 인터뷰 계획 수립',                  startTime: '09:00', endTime: '10:30', done: true },
    { id: 'ws-m06', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-06', category: '디자인', title: '카드 컴포넌트 Figma 작업',                 startTime: '11:00', endTime: '13:00', done: true },
    { id: 'ws-m07', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-06', category: '리서치', title: '인터뷰 대상자 섭외 및 일정 조율',          startTime: '14:00', endTime: '16:00', done: true },
    // 05-07 (목)
    { id: 'ws-m08', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-07', category: '리서치', title: '사용자 인터뷰 1~3차 진행',                 startTime: '10:00', endTime: '13:00', done: true },
    { id: 'ws-m09', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-07', category: '디자인', title: '모달 컴포넌트 다크모드 적용',              startTime: '14:30', endTime: '17:30', done: true },
    // 05-08 (금)
    { id: 'ws-m10', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-08', category: '리서치', title: '인터뷰 결과 1차 정리',                     startTime: '09:00', endTime: '11:00', done: true },
    { id: 'ws-m11', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-08', category: '디자인', title: '주간 디자인 시스템 진행 공유',             startTime: '15:00', endTime: '16:30', done: true },
    // 05-12 (월)
    { id: 'ws-m12', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-12', category: '리서치', title: '사용자 인터뷰 4~7차 진행',                 startTime: '10:00', endTime: '14:00', done: true },
    { id: 'ws-m13', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-12', category: '기획',   title: '모바일 앱 IA 초안 작성',                  startTime: '15:00', endTime: '17:30', done: true },
    // 05-13 (화)
    { id: 'ws-m14', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-13', category: '디자인', title: '네비게이션 구조 개선 와이어프레임',        startTime: '09:30', endTime: '12:30', done: true },
    { id: 'ws-m15', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-13', category: '리서치', title: '인터뷰 결과 종합 분석',                    startTime: '14:00', endTime: '16:30', done: true },
    // 05-14 (수)
    { id: 'ws-m16', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-14', category: '디자인', title: '홈·탐색 화면 1차 시안 제작',              startTime: '09:00', endTime: '13:00', done: true },
    { id: 'ws-m17', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-14', category: '디자인', title: '아이콘 세트 스타일 가이드 정리',           startTime: '14:00', endTime: '16:00', done: true },
    // 05-15 (목)
    { id: 'ws-m18', workItemId: 'wi-m2', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-15', category: '리서치', title: '페르소나 3종 도출 및 공유',                startTime: '10:00', endTime: '12:30', done: true },
    { id: 'ws-m19', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-15', category: '디자인', title: '마이페이지 화면 시안 제작',                startTime: '14:00', endTime: '17:00', done: true },
    // 05-19 (월)
    { id: 'ws-m20', workItemId: 'wi-m4', stepId: 'ps-3-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '기획',   title: '브리핑 & 계약',                    startTime: '09:00', endTime: '10:30', done: true },
    { id: 'ws-m21', workItemId: 'wi-m4', stepId: 'ps-3-02', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '디자인', title: '콘셉트 기획',               startTime: '11:00', endTime: '14:00', done: true },
    { id: 'ws-m22', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '디자인', title: '온보딩 화면 시안 수정',                    startTime: '15:00', endTime: '17:00', done: true },
    // 05-20 (화)
    { id: 'ws-m23', workItemId: 'wi-m4', stepId: 'ps-3-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-20', category: '기획',   title: '1차 피드백',                    startTime: '09:30', endTime: '12:00', done: true },
    { id: 'ws-m24', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-20', category: '디자인', title: '디자인 시스템 QA 검토',                    startTime: '14:00', endTime: '17:00', done: true },
    // 05-21 (수)
    { id: 'ws-m25', workItemId: 'wi-m4', stepId: 'ps-3-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-21', category: '기획',   title: '1차 피드백',                    startTime: '09:00', endTime: '12:30', done: true },
    { id: 'ws-m26', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-21', category: '기획',   title: '앱 화면 흐름도 최종 정리',                startTime: '14:00', endTime: '16:00', done: true },
    // 05-22 (목)
    { id: 'ws-m27', workItemId: 'wi-m4', stepId: 'ps-3-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-22', category: '디자인', title: '최종 디자인 확정',                    startTime: '09:00', endTime: '11:00', done: true },
    { id: 'ws-m28', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-22', category: '디자인', title: '디자인 시스템 Figma 배포',                 startTime: '13:00', endTime: '16:00', done: true },
    // 05-23 (금)
    { id: 'ws-m29', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-23', category: '디자인', title: '모바일 앱 시안 내부 리뷰',                 startTime: '14:00', endTime: '16:00', done: true },
    { id: 'ws-m30', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-23', category: '기획',   title: '5월 주간 업무 보고서 작성',               startTime: '16:30', endTime: '17:30', done: true },
    // 05-26 (월)
    { id: 'ws-m31', workItemId: 'wi-m5', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-26', category: '기획',   title: '온보딩 플로우 현황 분석',                 startTime: '09:00', endTime: '11:00', done: true },
    { id: 'ws-m32', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-26', category: '디자인', title: '앱 시안 클라이언트 피드백 반영',           startTime: '13:00', endTime: '16:30', done: true },
    // 05-27 (화)
    { id: 'ws-m33', workItemId: 'wi-m5', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-27', category: '기획',   title: '온보딩 개선 방향 초안 작성',              startTime: '09:30', endTime: '12:00', done: true },
    { id: 'ws-m34', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-27', category: '디자인', title: '설정·알림 화면 시안 제작',                startTime: '14:00', endTime: '17:30', done: true },
    // 05-28 (수)
    { id: 'ws-m35', workItemId: 'wi-m5', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-28', category: '디자인', title: '온보딩 1~3단계 와이어프레임 작성',        startTime: '10:00', endTime: '13:00', done: true },
    { id: 'ws-m36', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-28', category: '디자인', title: '앱 시안 2차 수정 완료',                   startTime: '14:00', endTime: '17:00', done: true },
    // 05-29 (목)
    { id: 'ws-m37', workItemId: 'wi-m5', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-29', category: '디자인', title: '온보딩 인터랙션 프로토타입 제작',         startTime: '09:00', endTime: '12:30', done: true },
    { id: 'ws-m38', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-29', category: '기획',   title: '리뉴얼 진행 현황 정리 및 공유',           startTime: '14:00', endTime: '15:30', done: true },
    // 05-30 (금) — 오전 반차
    { id: 'ws-m39', workItemId: 'wi-m5', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-30', category: '디자인', title: '온보딩 플로우 팀 리뷰',                   startTime: '14:00', endTime: '16:00', done: true },

    // ─── 팀원 세션 (간트 캘린더용) ─────────────────────────────────────
    // wi-5 (주)모아커머스 앱 리뉴얼 — 최유진, 박서연
    { id: 'ws-t01', workItemId: 'wi-5', stepId: 'ps-1-11', authorId: 'u-5', authorName: '최유진', date: '2026-06-12', category: '리서치', title: '사용성 테스트',        startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t02', workItemId: 'wi-5', stepId: 'ps-1-14', authorId: 'u-5', authorName: '최유진', date: '2026-06-14', category: '디자인', title: '디자인 QA',             startTime: '10:00', endTime: '13:00', done: true },
    { id: 'ws-t03', workItemId: 'wi-5', stepId: 'ps-1-12', authorId: 'u-3', authorName: '박서연', date: '2026-06-13', category: '디자인', title: '최종 디자인 확정',      startTime: '14:00', endTime: '17:00', done: false },
    // wi-5 Jihye 추가 (06/12, 06/14 커버)
    { id: 'ws-t04', workItemId: 'wi-5', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '2차 피드백',             startTime: '10:00', endTime: '11:00', done: true },
    { id: 'ws-t05', workItemId: 'wi-5', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-14', category: '기획',   title: '최종 디자인 확정',            startTime: '09:00', endTime: '10:30', done: true },

    // wi-6 (주)그린푸드 프로모션 배너 — 정하은
    { id: 'ws-t06', workItemId: 'wi-6', stepId: 'ps-3-07', authorId: 'u-6', authorName: '정하은', date: '2026-06-13', category: '디자인', title: '최종 디자인 확정',             startTime: '10:00', endTime: '12:00', done: false },
    { id: 'ws-t07', workItemId: 'wi-6', stepId: 'ps-3-08', authorId: 'u-6', authorName: '정하은', date: '2026-06-13', category: '디자인', title: '파일 납품',             startTime: '14:00', endTime: '16:00', done: false },

    // wi-7 테크스타트 서비스 UI/UX — 최유진 + Jihye 추가
    { id: 'ws-t08', workItemId: 'wi-7', stepId: 'ps-1-02', authorId: 'u-5', authorName: '최유진', date: '2026-06-09', category: '리서치', title: '리서치 (사용자/경쟁사)',             startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t09', workItemId: 'wi-7', stepId: 'ps-1-02', authorId: 'u-5', authorName: '최유진', date: '2026-06-10', category: '리서치', title: '리서치 (사용자/경쟁사)',         startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t10', workItemId: 'wi-7', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '기획',   title: '1차 피드백',       startTime: '10:30', endTime: '12:00', done: true },
    { id: 'ws-t11', workItemId: 'wi-7', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '1차 피드백',             startTime: '11:00', endTime: '12:00', done: true },
    { id: 'ws-t12', workItemId: 'wi-7', stepId: 'ps-1-05', authorId: 'u-5', authorName: '최유진', date: '2026-06-12', category: '기획',   title: '1차 피드백',             startTime: '14:00', endTime: '16:00', done: true },
    { id: 'ws-t14', workItemId: 'wi-7', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '2차 피드백',             startTime: '10:30', endTime: '11:00', done: false },
    { id: 'ws-t17', workItemId: 'wi-7', stepId: 'ps-1-07', authorId: 'u-5', authorName: '최유진', date: '2026-06-14', category: '디자인', title: '1차 UI 디자인',         startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t18', workItemId: 'wi-7', stepId: 'ps-1-07', authorId: 'u-5', authorName: '최유진', date: '2026-06-16', category: '디자인', title: '1차 UI 디자인',       startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t19', workItemId: 'wi-7', stepId: 'ps-1-08', authorId: 'u-5', authorName: '최유진', date: '2026-06-16', category: '기획',   title: '2차 피드백',             startTime: '14:00', endTime: '17:00', done: false },
    { id: 'ws-t20', workItemId: 'wi-7', stepId: 'ps-1-08', authorId: 'u-5', authorName: '최유진', date: '2026-06-17', category: '기획',   title: '2차 피드백',        startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t21', workItemId: 'wi-7', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '2차 피드백',       startTime: '13:00', endTime: '14:30', done: false },
    { id: 'ws-t22', workItemId: 'wi-7', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '기획',   title: '최종 디자인 확정',      startTime: '', endTime: '', done: false },
    { id: 'ws-t24', workItemId: 'wi-7', stepId: 'ps-1-12', authorId: 'u-5', authorName: '최유진', date: '2026-06-19', category: '디자인', title: '최종 디자인 확정',            startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t25', workItemId: 'wi-7', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-19', category: '기획',   title: '최종 디자인 확정',  startTime: '14:00', endTime: '15:00', done: false },
    { id: 'ws-t26', workItemId: 'wi-7', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-20', category: '기획',   title: '최종 디자인 확정', startTime: '09:00', endTime: '10:00', done: false },

    // wi-9 스카이벤처스 UX 리서치 — 김도현 + Jihye 추가
    { id: 'ws-t27', workItemId: 'wi-9', stepId: 'ps-1-02', authorId: 'u-4', authorName: '김도현', date: '2026-06-10', category: '리서치', title: '리서치 (사용자/경쟁사)',          startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t28', workItemId: 'wi-9', stepId: 'ps-1-02', authorId: 'u-4', authorName: '김도현', date: '2026-06-11', category: '리서치', title: '리서치 (사용자/경쟁사)',          startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t29', workItemId: 'wi-9', stepId: 'ps-1-02', authorId: 'u-4', authorName: '김도현', date: '2026-06-12', category: '리서치', title: '리서치 (사용자/경쟁사)',           startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t30', workItemId: 'wi-9', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '1차 피드백',       startTime: '15:00', endTime: '16:00', done: false },
    { id: 'ws-t31', workItemId: 'wi-9', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-14', category: '기획',   title: '1차 피드백',             startTime: '14:30', endTime: '16:00', done: false },
    { id: 'ws-t32', workItemId: 'wi-9', stepId: 'ps-1-05', authorId: 'u-4', authorName: '김도현', date: '2026-06-14', category: '기획',   title: '1차 피드백',             startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t33', workItemId: 'wi-9', stepId: 'ps-1-05', authorId: 'u-4', authorName: '김도현', date: '2026-06-15', category: '기획',   title: '1차 피드백',             startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t34', workItemId: 'wi-9', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '2차 피드백',             startTime: '13:30', endTime: '14:30', done: false },
    { id: 'ws-t35', workItemId: 'wi-9', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '2차 피드백',    startTime: '11:00', endTime: '12:00', done: false },
    { id: 'ws-t35a', workItemId: 'wi-9', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-19', category: '기획',   title: '최종 디자인 확정',      startTime: '09:00', endTime: '10:00', done: false },
    { id: 'ws-t35c', workItemId: 'wi-9', stepId: 'ps-1-12', authorId: 'u-4', authorName: '김도현', date: '2026-06-20', category: '기획',   title: '최종 디자인 확정',              startTime: '09:00', endTime: '12:00', done: false },

    // wi-10 블루밍헬스 리브랜딩 — 이나경 + Jihye 추가
    { id: 'ws-t36', workItemId: 'wi-10', stepId: 'ps-2-02', authorId: 'u-2', authorName: '이나경', date: '2026-06-09', category: '리서치', title: '리서치 (시장/경쟁사)',         startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t37', workItemId: 'wi-10', stepId: 'ps-2-02', authorId: 'u-2', authorName: '이나경', date: '2026-06-11', category: '리서치', title: '리서치 (시장/경쟁사)',         startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t38', workItemId: 'wi-10', stepId: 'ps-2-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '기획',   title: '1차 피드백',       startTime: '12:00', endTime: '13:00', done: true },
    { id: 'ws-t39', workItemId: 'wi-10', stepId: 'ps-2-04', authorId: 'u-2', authorName: '이나경', date: '2026-06-12', category: '디자인', title: '시안 제작',             startTime: '13:00', endTime: '17:00', done: true },
    { id: 'ws-t40', workItemId: 'wi-10', stepId: 'ps-2-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-14', category: '기획',   title: '1차 피드백',            startTime: '10:30', endTime: '12:00', done: true },
    { id: 'ws-t41', workItemId: 'wi-10', stepId: 'ps-2-04', authorId: 'u-2', authorName: '이나경', date: '2026-06-14', category: '디자인', title: '시안 제작',             startTime: '13:00', endTime: '17:00', done: true },
    { id: 'ws-t42', workItemId: 'wi-10', stepId: 'ps-2-05', authorId: 'u-2', authorName: '이나경', date: '2026-06-15', category: '기획',   title: '1차 피드백',             startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t43', workItemId: 'wi-10', stepId: 'ps-2-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획',   title: '2차 피드백',            startTime: '15:30', endTime: '16:30', done: false },
    { id: 'ws-t44', workItemId: 'wi-10', stepId: 'ps-2-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획',   title: '2차 피드백',       startTime: '10:00', endTime: '11:00', done: false },
    { id: 'ws-t46', workItemId: 'wi-10', stepId: 'ps-2-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '기획',   title: '최종 디자인 확정',             startTime: '', endTime: '', done: false },
    { id: 'ws-t47', workItemId: 'wi-10', stepId: 'ps-2-08', authorId: 'u-2', authorName: '이나경', date: '2026-06-18', category: '기획',   title: '2차 피드백',             startTime: '', endTime: '', done: false },
    { id: 'ws-t48', workItemId: 'wi-10', stepId: 'ps-2-08', authorId: 'u-2', authorName: '이나경', date: '2026-06-19', category: '기획',   title: '2차 피드백',        startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t49', workItemId: 'wi-10', stepId: 'ps-2-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-19', category: '기획',   title: '최종 디자인 확정',       startTime: '15:00', endTime: '16:00', done: false },
    { id: 'ws-t50', workItemId: 'wi-10', stepId: 'ps-2-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-20', category: '기획',   title: '최종 디자인 확정',           startTime: '10:00', endTime: '11:00', done: false },
    { id: 'ws-t52', workItemId: 'wi-10', stepId: 'ps-2-10', authorId: 'u-2', authorName: '이나경', date: '2026-06-21', category: '디자인', title: '최종 디자인 확정',             startTime: '09:00', endTime: '12:00', done: false },

    // wi-11 핏라이프 모바일 앱 — Jihye 추가
    { id: 'ws-t53', workItemId: 'wi-11', stepId: 'ps-1-03', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '정보구조도(IA) 설계',                startTime: '16:00', endTime: '17:00', done: false },
    { id: 'ws-t54', workItemId: 'wi-11', stepId: 'ps-1-03', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-14', category: '기획',   title: '정보구조도(IA) 설계',              startTime: '13:00', endTime: '14:30', done: false },
    { id: 'ws-t55', workItemId: 'wi-11', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-14', category: '기획',   title: '1차 피드백',             startTime: '16:00', endTime: '18:00', done: false },
    { id: 'ws-t56', workItemId: 'wi-11', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획',   title: '1차 피드백',             startTime: '11:00', endTime: '12:00', done: false },
    { id: 'ws-t57', workItemId: 'wi-11', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획',   title: '2차 피드백',             startTime: '16:00', endTime: '17:00', done: false },
    { id: 'ws-t58', workItemId: 'wi-11', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '기획',   title: '2차 피드백',             startTime: '', endTime: '', done: false },
    { id: 'ws-t59', workItemId: 'wi-11', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '디자인', title: '최종 디자인 확정',             startTime: '', endTime: '', done: false },
    { id: 'ws-t60', workItemId: 'wi-11', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-19', category: '디자인', title: '최종 디자인 확정',             startTime: '10:00', endTime: '11:00', done: false },
    { id: 'ws-t62', workItemId: 'wi-11', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-20', category: '기획',   title: '최종 디자인 확정',            startTime: '11:00', endTime: '12:00', done: false },

    // wi-12 핏라이프 랜딩 페이지 — 정하은 + Jihye
    { id: 'ws-t65', workItemId: 'wi-12', stepId: 'ps-3-02', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획',   title: '콘셉트 기획',                  startTime: '10:00', endTime: '11:00', done: false },
    { id: 'ws-t66', workItemId: 'wi-12', stepId: 'ps-3-03', authorId: 'u-6', authorName: '정하은', date: '2026-06-17', category: '기획',   title: '카피 & 구성안 작성',            startTime: '13:00', endTime: '17:00', done: false },
    { id: 'ws-t67', workItemId: 'wi-12', stepId: 'ps-3-03', authorId: 'u-6', authorName: '정하은', date: '2026-06-18', category: '기획',   title: '카피 & 구성안 작성',                   startTime: '', endTime: '', done: false },
    { id: 'ws-t68', workItemId: 'wi-12', stepId: 'ps-3-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '기획',   title: '1차 피드백',              startTime: '', endTime: '', done: false },
    { id: 'ws-t69', workItemId: 'wi-12', stepId: 'ps-3-04', authorId: 'u-6', authorName: '정하은', date: '2026-06-19', category: '디자인', title: '시안 제작',              startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t70', workItemId: 'wi-12', stepId: 'ps-3-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-20', category: '기획',   title: '1차 피드백',       startTime: '13:00', endTime: '14:00', done: false },
    { id: 'ws-t71', workItemId: 'wi-12', stepId: 'ps-3-05', authorId: 'u-6', authorName: '정하은', date: '2026-06-20', category: '기획',   title: '1차 피드백',              startTime: '14:00', endTime: '17:00', done: false },
    { id: 'ws-t72', workItemId: 'wi-12', stepId: 'ps-3-05', authorId: 'u-6', authorName: '정하은', date: '2026-06-21', category: '기획',   title: '1차 피드백',              startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t73', workItemId: 'wi-12', stepId: 'ps-3-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-21', category: '기획',   title: '최종 디자인 확정',              startTime: '14:00', endTime: '15:30', done: false },
    { id: 'ws-t74', workItemId: 'wi-12', stepId: 'ps-3-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-22', category: '기획',   title: '최종 디자인 확정',        startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t76', workItemId: 'wi-12', stepId: 'ps-3-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-23', category: '디자인', title: '최종 디자인 확정',                   startTime: '09:00', endTime: '10:00', done: false },
    { id: 'ws-t77', workItemId: 'wi-12', stepId: 'ps-3-08', authorId: 'u-6', authorName: '정하은', date: '2026-06-23', category: '디자인', title: '파일 납품',              startTime: '13:00', endTime: '17:00', done: false },
    { id: 'ws-t78', workItemId: 'wi-12', stepId: 'ps-3-08', authorId: 'u-6', authorName: '정하은', date: '2026-06-24', category: '디자인', title: '파일 납품',                  startTime: '09:00', endTime: '12:00', done: false },

    // wi-13 (주)모아커머스 아이콘 세트 — 윤소이 + Jihye
    { id: 'ws-t79', workItemId: 'wi-13', stepId: 'ps-1-01', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-23', category: '기획',   title: '브리핑 & 계약',                startTime: '10:00', endTime: '10:30', done: false },
    { id: 'ws-t80', workItemId: 'wi-13', stepId: 'ps-1-05', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-23', category: '기획',   title: '1차 피드백',     startTime: '13:00', endTime: '15:00', done: false },
    { id: 'ws-t81', workItemId: 'wi-13', stepId: 'ps-1-07', authorId: 'u-8', authorName: '윤소이', date: '2026-06-24', category: '디자인', title: '1차 UI 디자인',         startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t82', workItemId: 'wi-13', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-25', category: '기획',   title: '2차 피드백',     startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t83', workItemId: 'wi-13', stepId: 'ps-1-07', authorId: 'u-8', authorName: '윤소이', date: '2026-06-26', category: '디자인', title: '1차 UI 디자인',           startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t84', workItemId: 'wi-13', stepId: 'ps-1-08', authorId: 'u-8', authorName: '윤소이', date: '2026-06-26', category: '기획',   title: '2차 피드백',                  startTime: '17:00', endTime: '18:00', done: false },
    { id: 'ws-t85', workItemId: 'wi-13', stepId: 'ps-1-08', authorId: 'u-8', authorName: '윤소이', date: '2026-06-27', category: '기획',   title: '2차 피드백',                  startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t86', workItemId: 'wi-13', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-27', category: '기획',   title: '2차 피드백',       startTime: '14:00', endTime: '17:00', done: false },
    { id: 'ws-t87', workItemId: 'wi-13', stepId: 'ps-1-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-28', category: '기획',   title: '2차 피드백',          startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t88', workItemId: 'wi-13', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-28', category: '디자인', title: '최종 디자인 확정',                   startTime: '14:00', endTime: '17:00', done: false },
    { id: 'ws-t89', workItemId: 'wi-13', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-29', category: '디자인', title: '최종 디자인 확정',                     startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t91', workItemId: 'wi-13', stepId: 'ps-1-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-30', category: '기획',   title: '최종 디자인 확정', startTime: '09:00', endTime: '12:00', done: false },

    // wi-16 넥스트에듀 서비스 소개 영상 — 박서연 (영상 & 모션)
    { id: 'ws-t92', workItemId: 'wi-16', stepId: 'ps-4-02', authorId: 'u-3', authorName: '박서연', date: '2026-06-16', category: '기획',   title: '스토리보드 작성',          startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t93', workItemId: 'wi-16', stepId: 'ps-4-05', authorId: 'u-3', authorName: '박서연', date: '2026-06-18', category: '제작',   title: '스크립트 & 보이스 녹음',              startTime: '', endTime: '', done: false },
    { id: 'ws-t94', workItemId: 'wi-16', stepId: 'ps-4-06', authorId: 'u-3', authorName: '박서연', date: '2026-06-19', category: '제작',   title: '1차 편집',                 startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t95', workItemId: 'wi-16', stepId: 'ps-4-06', authorId: 'u-3', authorName: '박서연', date: '2026-06-20', category: '제작',   title: '1차 편집',               startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t96', workItemId: 'wi-16', stepId: 'ps-4-08', authorId: 'u-3', authorName: '박서연', date: '2026-06-22', category: '제작',   title: '2차 수정',                      startTime: '09:00', endTime: '17:00', done: false },
    { id: 'ws-t97', workItemId: 'wi-16', stepId: 'ps-4-10', authorId: 'u-3', authorName: '박서연', date: '2026-06-25', category: '제작',   title: '파일 납품',                     startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t97a', workItemId: 'wi-16', stepId: 'ps-4-07', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-21', category: '기획',   title: '2차 피드백',              startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t97c', workItemId: 'wi-16', stepId: 'ps-4-07', authorId: 'u-3', authorName: '박서연', date: '2026-06-21', category: '제작',   title: '2차 피드백',              startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t97d', workItemId: 'wi-16', stepId: 'ps-4-09', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-23', category: '기획',   title: '최종 확정',               startTime: '10:30', endTime: '12:00', done: false },
    { id: 'ws-t97e', workItemId: 'wi-16', stepId: 'ps-4-09', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-24', category: '기획',   title: '최종 확정',                     startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t97f', workItemId: 'wi-16', stepId: 'ps-4-09', authorId: 'u-3', authorName: '박서연', date: '2026-06-24', category: '제작',   title: '최종 확정',               startTime: '14:00', endTime: '17:00', done: false },

    // wi-17 하이브뷰티 제품 카탈로그 — 이나경, 정하은 (브랜드 & 인쇄물)
    { id: 'ws-t98',  workItemId: 'wi-17', stepId: 'ps-2-04', authorId: 'u-2', authorName: '이나경', date: '2026-06-13', category: '디자인', title: '시안 제작',        startTime: '09:00', endTime: '13:00', done: true },
    { id: 'ws-t99',  workItemId: 'wi-17', stepId: 'ps-2-04', authorId: 'u-6', authorName: '정하은', date: '2026-06-13', category: '디자인', title: '시안 제작',              startTime: '14:00', endTime: '17:00', done: true },
    { id: 'ws-t100', workItemId: 'wi-17', stepId: 'ps-2-05', authorId: 'u-2', authorName: '이나경', date: '2026-06-16', category: '기획',   title: '1차 피드백',               startTime: '09:00', endTime: '11:00', done: true },
    { id: 'ws-t101', workItemId: 'wi-17', stepId: 'ps-2-06', authorId: 'u-2', authorName: '이나경', date: '2026-06-17', category: '디자인', title: '1차 수정',            startTime: '09:00', endTime: '12:00', done: false },
    { id: 'ws-t102', workItemId: 'wi-17', stepId: 'ps-2-06', authorId: 'u-6', authorName: '정하은', date: '2026-06-17', category: '디자인', title: '1차 수정',              startTime: '13:00', endTime: '17:00', done: false },
    { id: 'ws-t103', workItemId: 'wi-17', stepId: 'ps-2-08', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-18', category: '기획',   title: '2차 피드백',             startTime: '', endTime: '', done: false },
    { id: 'ws-t103a', workItemId: 'wi-17', stepId: 'ps-2-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-19', category: '기획',   title: '최종 디자인 확정',            startTime: '11:00', endTime: '12:00', done: false },
    { id: 'ws-t104', workItemId: 'wi-17', stepId: 'ps-2-11', authorId: 'u-2', authorName: '이나경', date: '2026-06-19', category: '제작',   title: '인쇄 사양 확인',               startTime: '14:00', endTime: '16:00', done: false },
    { id: 'ws-t105', workItemId: 'wi-17', stepId: 'ps-2-12', authorId: 'u-6', authorName: '정하은', date: '2026-06-20', category: '제작',   title: '파일 납품',                    startTime: '09:00', endTime: '12:00', done: false },

    // wi-m4 (주)그린푸드 캠페인 소재 — 정하은
    { id: 'ws-t106', workItemId: 'wi-m4', stepId: 'ps-3-04', authorId: 'u-6', authorName: '정하은', date: '2026-05-20', category: '디자인', title: '시안 제작',         startTime: '09:00', endTime: '17:00', done: true },
    { id: 'ws-t107', workItemId: 'wi-m4', stepId: 'ps-3-04', authorId: 'u-6', authorName: '정하은', date: '2026-05-22', category: '디자인', title: '시안 제작',                   startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-t108', workItemId: 'wi-m4', stepId: 'ps-3-08', authorId: 'u-6', authorName: '정하은', date: '2026-05-23', category: '디자인', title: '파일 납품',                   startTime: '09:00', endTime: '12:00', done: true },
  ],



  requests: [
    { id: 'wr-1', title: '신제품 론칭 SNS 배너', detail: '7월 신제품 론칭에 맞춰 인스타그램·페이스북용 배너 각 2종씩 제작 요청드립니다.', requester: '김지수', requestTeam: '마케팅팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-18', end: '2026-06-23', priority: '긴급', status: '수락 대기', processId: 'pc-3',
      selectedSteps: [
        { stepId: 'ps-3-02', title: '콘셉트 기획', role: '기획' },
        { stepId: 'ps-3-04', title: '시안 제작', role: '디자인' },
      ]
    },
    { id: 'wr-2', title: '채용 공고 포스터 디자인', detail: 'UI 디자이너 채용 공고 포스터 제작 부탁드립니다. 사내 게시 및 SNS 게재용 2가지 사이즈 필요합니다.', requester: '박소현', requestTeam: 'HR팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-18', end: '2026-06-24', priority: '일반', status: '수락 대기', processId: 'pc-2',
      selectedSteps: [
        { stepId: 'ps-2-04', title: '시안 제작', role: '디자인' },
        { stepId: 'ps-2-10', title: '최종 디자인 확정', role: '디자인' },
      ]
    },
    { id: 'wr-3', title: '신규 서비스 인트로 모션', detail: '앱 첫 진입 시 재생되는 15초 인트로 모션 그래픽이 필요합니다. 브랜드 톤에 맞춰 제작해 주세요.', requester: '이준호', requestTeam: '기획팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-19', end: '2026-06-27', priority: '일반', status: '수락 대기', processId: 'pc-4',
      selectedSteps: [
        { stepId: 'ps-4-02', title: '스토리보드 작성', role: '기획' },
      ]
    },
  ],

  assignmentRequests: [
    { id: 'ar-1', title: '신제품 론칭 SNS 배너 제작',       team: '마케팅팀', hours: 12, deadline: '2026-06-23', priority: '긴급', status: '수락대기중',   assignees: ['Jihye', '최유진'], processId: 'pc-3', stepAssignees: { 'ps-3-02': ['Jihye'], 'ps-3-04': ['Jihye', '최유진'], 'ps-3-07': ['최유진'] } },
    { id: 'ar-2', title: '채용 공고 포스터 디자인',          team: 'HR팀',     hours: 6,  deadline: '2026-06-24', priority: '일반', status: '수락대기중',   assignees: ['Jihye'], processId: 'pc-2', stepAssignees: { 'ps-2-04': ['Jihye'], 'ps-2-10': ['Jihye'], 'ps-2-12': ['정하은'] } },
    { id: 'ar-3', title: '신규 서비스 인트로 모션',          team: '기획팀',   hours: 16, deadline: '2026-06-27', priority: '일반', status: '수락대기중',   assignees: ['Jihye', '박서연'], processId: 'pc-4', stepAssignees: { 'ps-4-02': ['Jihye'], 'ps-4-05': ['박서연'], 'ps-4-06': ['박서연'] } },
    { id: 'ar-4', title: '서비스 소개 브로셔 리디자인',      team: '기획팀',   hours: 8,  deadline: '2026-06-25', priority: '일반', status: '재배정',     assignees: [], processId: 'pc-2', stepAssignees: {} },
    { id: 'ar-5', title: '앱 스토어 스크린샷 업데이트',      team: '기획팀',   hours: 4,  deadline: '2026-06-20', priority: '일반', status: '신규요청',   assignees: [], processId: 'pc-3', stepAssignees: {} },
    { id: 'ar-6', title: '브랜드 소개 영상 30초',           team: '마케팅팀', hours: 20, deadline: '2026-06-30', priority: '일반', status: '신규요청',   assignees: [], processId: 'pc-4', stepAssignees: {} },
    { id: 'ar-7', title: '파트너사 공동 이벤트 키비주얼',    team: '마케팅팀', hours: 20, deadline: '2026-06-27', priority: '일반', status: '수락대기중', assignees: ['이나경'], processId: 'pc-3', stepAssignees: {} },
    { id: 'ar-8', title: '분기 성과 인포그래픽 제작',        team: '경영팀',   hours: 10, deadline: '2026-06-28', priority: '일반', status: '수락대기중', assignees: ['박서연', '최유진'], processId: 'pc-3', stepAssignees: {} },
    { id: 'ar-9', title: '모바일 앱 아이콘 세트 리뉴얼',    team: '기획팀',   hours: 14, deadline: '2026-06-30', priority: '일반', status: '배정완료',   assignees: ['정하은', 'Jihye'], processId: 'pc-1', stepAssignees: {} },
  ],

  processes: [
    {
      id: 'pc-1', category: 'UI/UX 디자인',
      steps: [
        { id: 'ps-1-01', title: '브리핑 & 계약' },
        { id: 'ps-1-02', title: '리서치 (사용자/경쟁사)' },
        { id: 'ps-1-03', title: '정보구조도(IA) 설계' },
        { id: 'ps-1-04', title: '와이어프레임 제작' },
        { id: 'ps-1-05', title: '와이어프레임 피드백' },
        { id: 'ps-1-06', title: '1차 UI 디자인' },
        { id: 'ps-1-07', title: '1차 수정' },
        { id: 'ps-1-08', title: '2차 UI 디자인' },
        { id: 'ps-1-09', title: '2차 수정' },
        { id: 'ps-1-10', title: '프로토타입 제작' },
        { id: 'ps-1-11', title: '사용성 테스트' },
        { id: 'ps-1-12', title: '최종 디자인 확정' },
        { id: 'ps-1-13', title: '개발 핸드오프' },
        { id: 'ps-1-14', title: '디자인 QA' },
      ],
    },
    {
      id: 'pc-2', category: '브랜드 & 인쇄물',
      steps: [
        { id: 'ps-2-01', title: '브리핑 & 계약' },
        { id: 'ps-2-02', title: '리서치 (시장/경쟁사)' },
        { id: 'ps-2-03', title: '콘셉트 기획' },
        { id: 'ps-2-04', title: '시안 제작' },
        { id: 'ps-2-05', title: '1차 피드백' },
        { id: 'ps-2-06', title: '1차 수정' },
        { id: 'ps-2-07', title: '2차 시안 제작' },
        { id: 'ps-2-08', title: '2차 피드백' },
        { id: 'ps-2-09', title: '2차 수정' },
        { id: 'ps-2-10', title: '최종 디자인 확정' },
        { id: 'ps-2-11', title: '인쇄 사양 확인' },
        { id: 'ps-2-12', title: '파일 납품' },
      ],
    },
    {
      id: 'pc-3', category: '디지털 콘텐츠',
      steps: [
        { id: 'ps-3-01', title: '브리핑 & 계약' },
        { id: 'ps-3-02', title: '콘셉트 기획' },
        { id: 'ps-3-03', title: '카피 & 구성안 작성' },
        { id: 'ps-3-04', title: '시안 제작' },
        { id: 'ps-3-05', title: '1차 피드백' },
        { id: 'ps-3-06', title: '1차 수정' },
        { id: 'ps-3-07', title: '최종 디자인 확정' },
        { id: 'ps-3-08', title: '파일 납품' },
      ],
    },
    {
      id: 'pc-4', category: '영상 & 모션',
      steps: [
        { id: 'ps-4-01', title: '브리핑 & 계약' },
        { id: 'ps-4-02', title: '스토리보드 작성' },
        { id: 'ps-4-03', title: '스토리보드 피드백' },
        { id: 'ps-4-04', title: '스크립트 & 보이스 녹음' },
        { id: 'ps-4-05', title: '1차 편집' },
        { id: 'ps-4-06', title: '1차 피드백' },
        { id: 'ps-4-07', title: '1차 수정' },
        { id: 'ps-4-08', title: '최종 편집' },
        { id: 'ps-4-09', title: '최종 디자인 확정' },
        { id: 'ps-4-10', title: '파일 납품' },
      ],
    },
  ],

  notifications: [
    { id: 'n-1', title: '업무요청 도착', body: '마케팅팀에서 SNS 배너 제작을 요청했습니다.', requestTitle: '신제품 론칭 SNS 배너', unread: true },
    { id: 'n-2', title: '업무요청 도착', body: '기획팀에서 인트로 모션 그래픽을 요청했습니다.', requestTitle: '신규 서비스 인트로 모션', unread: true },
    { id: 'n-3', title: '연차 승인', body: '박민준 님의 오후 반차(06/10) 신청이 승인되었습니다.', unread: false },
    { id: 'n-4', title: '회의 등록 완료', body: '"모아커머스 앱 리뉴얼 스프린트 회고" 회의가 등록되었습니다. (참석자 4명)', unread: false },
    { id: 'n-5', title: '회의 등록 완료', body: '"디자인 QA 체크포인트" 회의에 참여자로 등록되었습니다. (참석자 5명)', unread: true },
  ],

  meetings: [
    { id: 'mr-1', team: '디자인팀', type: '회고', title: '모아커머스 앱 리뉴얼 스프린트 회고',
    summary: '모아커머스 커머스 앱 리뉴얼 2차 스프린트 회고. 온보딩·상품 상세 화면 디자인 완성도와 디자인-개발 협업 이슈를 점검했습니다.',
    aiPoints: ['모아커머스 온보딩·상품 상세 화면 디자인 100% 완료', '인터랙션 가이드 문서화 90% 진행, 잔여분 다음 스프린트 이월', '디자인-개발 스펙 공유 지연 이슈 식별 → Figma Dev Mode 도입 합의', '다음 스프린트: 마이페이지·결제 플로우 디자인 착수'],
    discussions: ['스펙 공유 지연 원인으로 비동기 문서화 프로세스 부재 지목', '컴포넌트 변경 이력 관리 방식 개선 필요성 공감', '클라이언트 피드백 반영 사이클 단축 방안 논의'],
    script: [
      { time: '00:01', speaker: '장준혁', text: '안녕하세요, 모아커머스 리뉴얼 회고 시작하겠습니다. 이번 스프린트 성과부터 공유해 주세요.' },
      { time: '00:38', speaker: '최유진', text: '온보딩과 상품 상세 화면 디자인 100% 완료했습니다. Figma 인터랙션 가이드도 정리 중이에요.' },
      { time: '01:52', speaker: '박서연', text: '인터랙션 가이드 문서화는 90% 완료했고, 잔여분은 다음 스프린트로 이월했습니다.' },
      { time: '03:10', speaker: '장준혁', text: '디자인-개발 스펙 공유 지연 이슈가 있었는데, 원인이 뭔가요?' },
      { time: '03:45', speaker: 'Jihye', text: '디자인 확정 전에 개발이 먼저 시작되는 경우가 있었습니다. 비동기 문서화 프로세스가 없어서 생긴 문제예요.' },
      { time: '05:20', speaker: '박서연', text: 'Figma Dev Mode를 도입하면 개발팀이 스펙을 바로 확인할 수 있어서 공유 지연이 줄 것 같아요.' },
      { time: '06:40', speaker: '장준혁', text: '좋아요. 박서연님이 다음 주까지 Dev Mode 가이드 정리해 주시고, 최유진님은 마이페이지 와이어프레임 착수해 주세요.' },
    ],
    actionItems: [
      { id: 'act-mr1-1', text: 'Figma Dev Mode 가이드 작성 및 개발팀 공유', dueDate: '2026-06-10', assignee: '박서연', done: false, addedToWeekly: false },
      { id: 'act-mr1-2', text: '모아커머스 마이페이지 와이어프레임 착수', dueDate: '2026-06-13', assignee: '최유진', done: false, addedToWeekly: false },
    ],
    date: '2026-06-03', startTime: '10:00', author: '장준혁', duration: '42:18', attendees: 4, attendeeNames: ['장준혁', '최유진', '박서연', 'Jihye'] },
    { id: 'mr-2', team: '디자인팀', type: '클라이언트 미팅', title: '모아커머스 2차 시안 클라이언트 보고',
    summary: '모아커머스 측에 리뉴얼 2차 시안 발표 및 피드백 수렴. 추가 화면 설계 요청이 접수되었으며 다음 시안 리뷰 일정을 확정하였습니다.',
    aiPoints: ['모아커머스 핵심 화면 5종 시안 발표 완료', '마이페이지·알림센터 화면 2종 추가 설계 요청 접수', '다음 시안 리뷰 전까지 초안 완성 일정 6/10으로 확정', '일정 지연 리스크 대비 버퍼 1주 확보 합의'],
    discussions: ['클라이언트 내부 검토 프로세스 변경으로 피드백 사이클 지연 우려', '화면 추가로 인한 개발 핸드오프 일정 영향도 재산정 필요', '다음 미팅은 시안 리뷰 목적으로 6/12 예정'],
    script: [
      { time: '00:02', speaker: '장준혁', text: '안녕하세요, 모아커머스 2차 시안 보고 시작하겠습니다. 먼저 변경된 요구사항부터 공유드릴게요.' },
      { time: '01:15', speaker: 'Jihye', text: '마이페이지 디자인 방향을 대시보드 형태로 변경 요청이 들어왔습니다. 이나경님과 초안 작업 중입니다.' },
      { time: '03:40', speaker: '이나경', text: '알림센터 화면도 추가 요청이 들어왔어요. 기존 일정에서 약 3일 추가 소요될 것 같습니다.' },
      { time: '06:20', speaker: '장준혁', text: '일정 버퍼를 1주 확보하는 방향으로 클라이언트와 협의하겠습니다. 6/10까지 초안 준비 부탁드립니다.' },
      { time: '08:50', speaker: 'Jihye', text: '네, 6/10 마감으로 진행하겠습니다. 중간 점검은 6/7에 내부적으로 진행할게요.' },
    ],
    actionItems: [
      { id: 'act-mr2-1', text: '마이페이지 대시보드 시안 초안 작성', dueDate: '2026-06-10', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr2-2', text: '알림센터 화면 설계 및 시안 작성', dueDate: '2026-06-10', assignee: '이나경', done: false, addedToWeekly: false },
      { id: 'act-mr2-3', text: '변경된 요구사항 문서 업데이트 및 공유', dueDate: '2026-06-05', assignee: '장준혁', done: false, addedToWeekly: false },
    ],
    date: '2026-06-03', startTime: '14:00', author: '장준혁', duration: '38:54', attendees: 3, attendeeNames: ['장준혁', 'Jihye', '이나경'] },
    { id: 'mr-3', team: '디자인팀', type: '타팀 협업회의', title: '모아커머스 디자인-개발 핸드오프 킥오프',
    summary: '모아커머스 앱 리뉴얼 디자인-개발 핸드오프 프로세스 정립 회의. 협업 채널과 스펙 변경 공지 원칙에 대한 합의가 이루어졌습니다.',
    aiPoints: ['디자인-개발 협업 채널 Slack #moa-design-dev 신설 합의', '스펙 변경 시 48시간 전 사전 공지 원칙 수립', 'Figma 링크 공유 → 개발 착수 프로세스 공식화', '주 1회 핸드오프 싱크 정례화 (매주 화요일 오전 10시)'],
    discussions: ['이전 스프린트에서 디자인 변경이 개발에 사전 공유 없이 반영된 사례 복기', '개발팀 요청: 컴포넌트 변경 시 영향 범위 명시 필요', '디자인팀 요청: 개발 완료 화면 캡처 공유로 검수 프로세스 개선'],
    script: [
      { time: '00:03', speaker: '장준혁', text: '킥오프 시작합니다. 이번 회의 목적은 모아커머스 디자인-개발 핸드오프 프로세스 명확화입니다.' },
      { time: '02:10', speaker: '박민준', text: '지난번에 디자인 변경사항이 늦게 공유돼서 재작업이 발생했어요. 사전 공지 프로세스가 필요합니다.' },
      { time: '05:30', speaker: 'Jihye', text: '스펙 변경 시 48시간 전 공지를 원칙으로 하고, Slack 채널을 만들어서 공유하는 게 좋을 것 같아요.' },
      { time: '08:45', speaker: '박서연', text: '핸드오프 싱크도 주 1회 정례화하면 실시간 이슈를 빠르게 처리할 수 있을 것 같습니다.' },
      { time: '11:20', speaker: '박민준', text: '화요일 오전 10시로 고정하겠습니다. 채널 개설은 제가 맡을게요.' },
    ],
    actionItems: [
      { id: 'act-mr3-1', text: 'Slack #moa-design-dev 채널 생성 및 멤버 초대', dueDate: '2026-06-03', assignee: '박민준', done: true, addedToWeekly: false },
      { id: 'act-mr3-2', text: '핸드오프 프로세스 문서화 및 팀 공유', dueDate: '2026-06-06', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr3-3', text: '주간 핸드오프 싱크 캘린더 초대 발송', dueDate: '2026-06-03', assignee: '박서연', done: true, addedToWeekly: false },
    ],
    date: '2026-06-02', startTime: '11:00', author: '장준혁', duration: '35:42', attendees: 5, attendeeNames: ['장준혁', '박민준', 'Jihye', '박서연', '이수진'] },
    { id: 'mr-4', team: '기획팀', type: '스프린트 기획', title: '2분기 클라이언트 프로젝트 로드맵 수립',
    summary: '2분기 클라이언트 프로젝트 일정·리소스 배분 수립. 모아커머스·블루밍헬스·하이브뷰티 우선순위 조정 및 리소스 할당 논의가 완료되었습니다.',
    aiPoints: ['2분기 핵심 프로젝트: 모아커머스 리뉴얼 / 블루밍헬스 리브랜딩 / 하이브뷰티 카탈로그', '6월: 모아커머스 집중, 7월: 블루밍헬스 착수', '디자인 리소스 부족 구간 외부 프리랜서 1명 추가 검토', '클라이언트별 주간 진척 리포트 양식 통일 필요'],
    discussions: ['6월 디자인팀 과부하 우려 — 우선순위 상위 3개 프로젝트 집중, 나머지 이월', '하이브뷰티 카탈로그는 스프린트 여건상 8월로 이월 검토', '클라이언트별 마일스톤 가시화 필요'],
    script: [
      { time: '00:05', speaker: '최지영', text: '2분기 프로젝트 로드맵 수립 시작합니다. 먼저 1분기 회고 요약부터 공유할게요.' },
      { time: '04:30', speaker: '강지훈', text: '모아커머스 리뉴얼이 가장 우선순위가 높습니다. 6월 집중으로 잡으면 어떨까요?' },
      { time: '10:15', speaker: '장준혁', text: '디자인 리소스가 조금 부족할 것 같아요. 6월은 모아커머스 병행 업무가 많아서요.' },
      { time: '15:40', speaker: '최지영', text: '프리랜서 1명 추가를 검토해 볼게요. 일단 상위 3개 프로젝트에 집중하고 하이브뷰티는 8월로 이월합시다.' },
      { time: '22:00', speaker: 'Jihye', text: '블루밍헬스 리브랜딩은 모아커머스 마무리 후 7월 착수가 현실적일 것 같습니다.' },
    ],
    actionItems: [
      { id: 'act-mr4-1', text: '2분기 클라이언트 프로젝트 로드맵 문서 작성', dueDate: '2026-06-05', assignee: '최지영', done: false, addedToWeekly: false },
      { id: 'act-mr4-2', text: '프리랜서 채용 요건 정리 및 공고 준비', dueDate: '2026-06-08', assignee: '강지훈', done: false, addedToWeekly: false },
      { id: 'act-mr4-3', text: '클라이언트별 주간 진척 리포트 양식 초안 작성', dueDate: '2026-06-06', assignee: '장준혁', done: false, addedToWeekly: false },
    ],
    date: '2026-06-01', startTime: '15:00', author: '최지영', duration: '58:20', attendees: 4, attendeeNames: ['최지영', '강지훈', '장준혁', 'Jihye'] },
    { id: 'mr-5', team: '개발팀', type: '주간 회의', title: '테크스타트 SaaS 개발 주간 공유 #24',
    summary: '테크스타트 SaaS 서비스 개발 주간 현황 공유 및 다음 주 계획 확인. 블로커 이슈 3건이 확인되었으며 디자인 연동 일정이 정리되었습니다.',
    aiPoints: ['이번 주 완료 업무 7건, 진행 중 4건, 미착수 2건', '블로커 3건: 디자인 에셋 미수령 / API 미확정 / 리뷰 지연', '다음 주 우선순위: 메인 대시보드 퍼블리싱 + 내부 QA'],
    discussions: ['에셋 미수령 건은 디자인팀에 재요청 예정 (최유진 담당)', '외부 API 확정 지연으로 관련 화면 목업으로 대체 진행 결정', '이번 주 완료율 63% — 목표 80% 대비 저조, 다음 주 만회 계획 필요'],
    script: [
      { time: '00:02', speaker: '박민준', text: '테크스타트 개발 주간 공유 시작합니다. 이번 주 완료 건부터 돌아가며 공유해 주세요.' },
      { time: '03:20', speaker: '이수진', text: '대시보드 API 연동 완료했습니다. 다만 디자인 에셋 파일은 디자인팀에서 아직 못 받았어요.' },
      { time: '07:10', speaker: '최유진', text: '제가 디자인팀에서 에셋 정리해서 오늘 안에 전달드릴게요. 시안 확정본 기준으로 내보내겠습니다.' },
      { time: '12:45', speaker: '박민준', text: '외부 API가 아직 확정이 안 됐는데, 관련 화면은 목업으로 먼저 진행하는 게 좋을 것 같아요.' },
      { time: '18:30', speaker: '이수진', text: '완료율이 63%라 다음 주에 좀 더 속도를 내야 할 것 같습니다. 각자 블로커 빠르게 해소 부탁드립니다.' },
    ],
    actionItems: [
      { id: 'act-mr5-1', text: '디자인팀 에셋 재요청 및 수령', dueDate: '2026-05-31', assignee: '최유진', done: true, addedToWeekly: false },
      { id: 'act-mr5-2', text: '외부 API 대체 목업 연동', dueDate: '2026-06-02', assignee: '이수진', done: false, addedToWeekly: false },
      { id: 'act-mr5-3', text: '다음 주 완료율 80% 달성 계획 공유', dueDate: '2026-06-01', assignee: '박민준', done: false, addedToWeekly: false },
    ],
    date: '2026-05-29', startTime: '10:00', author: '박민준', duration: '25:10', attendees: 3, attendeeNames: ['박민준', '이수진', '최유진'] },
    { id: 'mr-6', team: '디자인팀', type: '워크샵', title: '스카이벤처스 UX 리서치 워크샵',
    summary: '스카이벤처스 서비스 사용자 인터뷰 결과 공유 및 페르소나 재정립. 주요 사용자 니즈 기반 개선 방향성 설정 합의가 이루어졌습니다.',
    aiPoints: ['스카이벤처스 사용자 인터뷰 18건 분석 완료 — 주요 페인포인트 5가지 도출', '기존 페르소나 3종 → 4종으로 재정립 (신규: 중간관리자형 추가)', '개선 우선순위: 온보딩 플로우 간소화 > 알림 설정 > 검색 기능', '다음 분기 리서치 주제: 모바일 사용 패턴 분석'],
    discussions: ['인터뷰 참여자 중 70%가 온보딩 복잡성을 가장 큰 불편으로 꼽음', '페르소나 4번째 유형(중간관리자) 추가는 전원 합의', 'B2B 고객과 개인 사용자 간 니즈 차이 명확히 구분 필요'],
    script: [
      { time: '00:05', speaker: '장준혁', text: '워크샵 시작합니다. 먼저 김도현님이 스카이벤처스 인터뷰 결과 요약을 공유해 주세요.' },
      { time: '05:30', speaker: '김도현', text: '18건 인터뷰 분석 결과, 가장 많이 나온 페인포인트는 온보딩이었습니다. 전체 70%가 언급했어요.' },
      { time: '18:20', speaker: '박서연', text: '기존 페르소나 3종에서 중간관리자 유형이 빠져 있었는데, 이번에 추가하는 게 좋겠어요.' },
      { time: '35:00', speaker: 'Jihye', text: '개선 우선순위는 온보딩 간소화를 1순위로 하고, 알림 설정과 검색을 그다음으로 잡으면 어떨까요?' },
      { time: '52:40', speaker: '최유진', text: '다음 분기 리서치는 모바일 사용 패턴으로 하면 서비스 방향성 잡는 데 도움이 될 것 같습니다.' },
    ],
    actionItems: [
      { id: 'act-mr6-1', text: '페르소나 4종 문서 업데이트 및 팀 배포', dueDate: '2026-06-06', assignee: '김도현', done: false, addedToWeekly: false },
      { id: 'act-mr6-2', text: '온보딩 플로우 개선안 초안 작성', dueDate: '2026-06-10', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr6-3', text: '다음 분기 리서치 계획서 작성', dueDate: '2026-06-13', assignee: '김도현', done: false, addedToWeekly: false },
    ],
    startDate: '2026-05-30', endDate: '2026-05-30', author: '김도현', duration: '1:24:15', attendees: 6, attendeeNames: ['김도현', '장준혁', '박서연', 'Jihye', '최유진', '정하은'] },
    { id: 'mr-7', team: '마케팅팀', type: '업무 보고', title: '5월 마케팅 캠페인 성과 보고',
    summary: '그린푸드·핏라이프 5월 캠페인 성과 리뷰 및 6월 개선 과제 합의. 디자인-마케팅 콘텐츠 제작 협업 프로세스를 점검했습니다.',
    aiPoints: ['5월 캠페인 노출 목표 대비 92% 달성', '그린푸드 프로모션 배너 CTR 3.4%로 목표 상회', '핏라이프 랜딩 전환율 개선 필요 (현재 1.2%)', '6월 과제: 콘텐츠 제작 리드타임 단축 / 에셋 전달 프로세스 개선'],
    discussions: ['배너 제작 리드타임이 캠페인 일정 압박', '디자인-마케팅 간 에셋 전달 프로세스 개선 필요', '핏라이프 랜딩 A/B 테스트 도입 제안'],
    script: [
      { time: '00:04', speaker: '송예린', text: '5월 캠페인 성과 보고 시작합니다. 전체 노출은 목표 대비 92% 달성했습니다.' },
      { time: '08:15', speaker: '정하은', text: '그린푸드 배너는 CTR 3.4%로 목표를 넘었어요. 다만 제작 리드타임이 빠듯했습니다.' },
      { time: '15:30', speaker: 'Jihye', text: '핏라이프 랜딩 전환율이 1.2%로 아쉬운데, A/B 테스트로 헤드라인·CTA를 검증해보면 좋겠어요.' },
      { time: '28:00', speaker: '송예린', text: '6월은 콘텐츠 제작 리드타임을 단축하는 데 집중하겠습니다. 에셋 전달 시점을 앞당겨 주시면 좋겠어요.' },
      { time: '38:45', speaker: '정하은', text: '에셋 전달 프로세스를 정리해서 캠페인 착수 5일 전에 1차본 공유하는 방향으로 잡을게요.' },
    ],
    actionItems: [
      { id: 'act-mr7-1', text: '콘텐츠 제작 리드타임 단축 방안 문서화', dueDate: '2026-06-03', assignee: '송예린', done: false, addedToWeekly: false },
      { id: 'act-mr7-2', text: '핏라이프 랜딩 A/B 테스트 시안 제작', dueDate: '2026-06-05', assignee: '정하은', done: false, addedToWeekly: false },
      { id: 'act-mr7-3', text: '6월 캠페인 에셋 전달 일정 공유', dueDate: '2026-06-04', assignee: 'Jihye', done: false, addedToWeekly: false },
    ],
    date: '2026-05-28', startTime: '14:00', author: '송예린', duration: '47:33', attendees: 5, attendeeNames: ['송예린', 'Jihye', '정하은', '이나경', '박서연'] },
    { id: 'mr-8', team: '디자인팀', type: '기술 공유', title: 'Figma 컴포넌트 라이브러리 최적화 세션',
    summary: '팀 내 Figma 라이브러리 구조 개선 방안 공유. 클라이언트 프로젝트 전반에 재사용 가능한 컴포넌트 설계 패턴 정립 및 스타일 토큰 일원화 논의가 진행되었습니다.',
    aiPoints: ['현재 Figma 라이브러리 컴포넌트 수 214개 → 중복·미사용 47개 정리 예정', '스타일 토큰 체계 Color/Spacing/Typography 3계층으로 일원화', 'Auto Layout 미적용 컴포넌트 32개 일괄 전환 계획', 'Figma Variables 활용한 다크모드 지원 방안 논의'],
    discussions: ['컴포넌트 네이밍 컨벤션 불일치로 검색 효율 저하 — 네이밍 가이드 수립 필요', '스타일 토큰 일원화 후 기존 프로젝트 화면에 일괄 적용하는 방법론 합의 필요', '다크모드 지원은 현 시점 우선순위에서 제외, 토큰 구조만 준비'],
    script: [
      { time: '00:03', speaker: '윤소이', text: '오늘은 Figma 라이브러리 최적화 방법을 공유할게요. 현재 214개 컴포넌트 중 47개가 중복이에요.' },
      { time: '10:20', speaker: 'Jihye', text: '네이밍이 프로젝트마다 달라서 검색이 너무 힘들어요. 컨벤션 가이드가 꼭 필요할 것 같습니다.' },
      { time: '22:00', speaker: '정하은', text: '스타일 토큰을 Color·Spacing·Typography로 나누면 관리가 훨씬 쉬워질 것 같아요.' },
      { time: '35:10', speaker: '박서연', text: 'Auto Layout 안 된 컴포넌트 32개는 제가 순차적으로 전환 작업할게요.' },
      { time: '44:30', speaker: '윤소이', text: '다크모드는 지금 당장은 우선순위에서 빼고, 토큰 구조만 미리 잡아두는 방향으로 합시다.' },
    ],
    actionItems: [
      { id: 'act-mr8-1', text: '컴포넌트 네이밍 컨벤션 가이드 작성', dueDate: '2026-06-03', assignee: '윤소이', done: false, addedToWeekly: false },
      { id: 'act-mr8-2', text: 'Auto Layout 미적용 컴포넌트 전환', dueDate: '2026-06-10', assignee: '박서연', done: false, addedToWeekly: false },
      { id: 'act-mr8-3', text: '스타일 토큰 일원화 작업 착수', dueDate: '2026-06-07', assignee: '정하은', done: false, addedToWeekly: false },
    ],
    date: '2026-05-27', startTime: '09:30', author: '윤소이', duration: '52:41', attendees: 5, attendeeNames: ['윤소이', 'Jihye', '정하은', '박서연', '최유진'] },
    { id: 'mr-9', team: '디자인팀', type: '주간 회의', title: '디자인팀 주간 싱크 #22',
    summary: '이번 주 진행 업무 공유 및 우선순위 재조정. 모아커머스 온보딩 수정과 그린푸드 배너 제작 현황을 점검했습니다.',
    aiPoints: ['모아커머스 온보딩 화면 수정 3건 이번 주 내 완료 예정', '그린푸드 배너 시안 검토 일정 목요일로 확정', '블루밍헬스 컬러 시스템 시안 다음 주 공유'],
    discussions: ['모아커머스 온보딩 수정 범위 추가 가능성 검토 필요', '그린푸드 배너 사이즈 스펙 마케팅팀과 재확인'],
    script: [],
    actionItems: [],
    date: '2026-06-09', startTime: '10:30', author: 'Jihye', duration: '28:15', attendees: 4, attendeeNames: ['Jihye', '이나경', '정하은', '박서연'] },
    { id: 'mr-10', team: '디자인팀', type: '클라이언트 미팅', title: '블루밍헬스 리브랜딩 1차 시안 발표',
    summary: '블루밍헬스 리브랜딩 로고 1차 시안 3종 발표 및 클라이언트 피드백 수렴. 컬러 방향성은 긍정적이나 서체 변경 요청이 있었습니다.',
    aiPoints: ['로고 시안 B안 방향으로 진행 확정', '서체: 현재 Pretendard → Noto Serif 검토 요청', '다음 미팅 일정: 6월 18일'],
    discussions: ['서체 변경 시 전체 BI 일관성 검토 필요'],
    script: [],
    actionItems: [
      { id: 'act-mr10-1', text: '서체 대안 2종 추가 시안 제작', dueDate: '2026-06-16', assignee: '이나경', done: false, addedToWeekly: false },
    ],
    date: '2026-06-11', startTime: '14:00', author: '이나경', duration: '45:00', attendees: 3, attendeeNames: ['이나경', 'Jihye', '정하은'] },
    { id: 'mr-11', team: '디자인팀', type: '긴급 회의', title: '핏라이프 앱 출시 전 최종 QA 점검',
    summary: '핏라이프 모바일 앱 출시 전 디자인 QA 이슈 현황 공유 및 수정 우선순위 합의. 출시 일정은 예정대로 유지하기로 결정.',
    aiPoints: ['핏라이프 디자인 QA 이슈 총 7건 — 이번 주 내 5건 수정 목표', '나머지 2건은 출시 후 핫픽스로 처리', '출시 일정 6월 20일 유지'],
    discussions: ['출시 일정 연기 여부 논의 — 현행 유지로 합의', '핫픽스 대응 담당자 Jihye·최유진으로 확정'],
    script: [],
    actionItems: [
      { id: 'act-mr11-1', text: '핏라이프 QA 이슈 5건 수정 완료', dueDate: '2026-06-17', assignee: 'Jihye', done: false, addedToWeekly: false },
    ],
    date: '2026-06-17', startTime: '11:00', author: '최유진', duration: '32:00', attendees: 5, attendeeNames: ['Jihye', '최유진', '박서연', '정하은', '이나경'] },
    { id: 'mr-12', team: '디자인팀', type: '디자인 리뷰', title: '디자인 QA 체크포인트',
    summary: '모아커머스 앱 리뉴얼 및 핏라이프 모바일 앱 디자인 QA 진행. 주요 화면별 디자인-개발 간 차이점을 확인하고 수정 사항을 정리하였습니다.',
    aiPoints: ['모아커머스 온보딩 화면 간격·폰트 사이즈 불일치 3건 확인', '핏라이프 앱 탭바 아이콘 컬러 통일 필요', '수정 사항 Figma 코멘트로 전달 완료'],
    discussions: ['디자인 QA 체크리스트 템플릿 도입 검토', 'Figma Dev Mode 활용도 향상 방안 논의'],
    script: [],
    actionItems: [
      { id: 'act-mr12-1', text: '모아커머스 간격·폰트 수정 반영', dueDate: '2026-06-19', assignee: '최유진', done: false, addedToWeekly: false },
      { id: 'act-mr12-2', text: '핏라이프 탭바 아이콘 컬러 수정', dueDate: '2026-06-19', assignee: 'Jihye', done: false, addedToWeekly: false },
    ],
    date: '2026-06-18', startTime: '14:30', author: 'Jihye', duration: '28:15', attendees: 5, attendeeNames: ['Jihye', '최유진', '박서연', '이나경', '장준혁'] },
  ],

  // 연차 데이터 — id, applicantId, applicantName, applicantRole, type, date, reason, status, approverId, approverName, rejectedReason, requestedAt
  leaves: [
    { id: 'lv-1', applicantId: 'u-2', applicantName: '김민준', applicantRole: 'Member', type: '종일 연차', startDate: '2026-06-16', endDate: '2026-06-16', reason: '개인 사정으로 휴가 신청드립니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-10' },
    { id: 'lv-2', applicantId: 'u-3', applicantName: '이수진', applicantRole: 'Member', type: '오전 반차', startDate: '2026-06-13', endDate: '2026-06-13', reason: '병원 예약이 있어 오전 반차 신청합니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-11' },
    { id: 'lv-3', applicantId: 'u-1', applicantName: 'Jihye',  applicantRole: 'Manager', type: '종일 연차', startDate: '2026-06-20', endDate: '2026-06-22', reason: '연차 소진 목적으로 신청합니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-09' },
    { id: 'lv-4', applicantId: 'u-4', applicantName: '박민준', applicantRole: 'Member', type: '오후 반차', startDate: '2026-06-10', endDate: '2026-06-10', reason: '개인 일정이 있습니다.', status: '승인 완료', approverId: 'u-1', approverName: 'Jihye', rejectedReason: null, requestedAt: '2026-06-07' },
    { id: 'lv-5', applicantId: 'u-1', applicantName: 'Jihye',  applicantRole: 'Manager', type: '오전 반차', startDate: '2026-05-30', endDate: '2026-05-30', reason: '개인 사정.', status: '승인 완료', approverId: 'u-0', approverName: '대표', rejectedReason: null, requestedAt: '2026-05-28' },
    { id: 'lv-6', applicantId: 'u-2', applicantName: '김민준', applicantRole: 'Member', type: '종일 연차', startDate: '2026-05-22', endDate: '2026-05-24', reason: '여행 계획이 있습니다.', status: '반려', approverId: 'u-1', approverName: 'Jihye', rejectedReason: '해당 날짜 주요 납품 일정이 있어 반려합니다.', requestedAt: '2026-05-19' },
  ],

  leaveTab: '내 연차',         // '내 연차' | '팀 연차' | '승인 대기' | '이력'
  totalLeave: 15,              // 총 연차 (연간)
};

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_WEEK_START = _mondayISO; // Monday of real current week (computed at load)
const REJECT_REASONS = ['일정 불가', '담당 범위 아님', '리소스 부족', '요청 내용 불명확', '기타'];
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const CAT_CLASS = {
  '디자인': 'cat-design',
  '기획':   'cat-plan',
  '개발':   'cat-dev',
  '운영':   'cat-ops',
  '리서치': 'cat-research',
  '퍼블리싱':'cat-publish',
};

const TEAM_COLORS = {
  '디자인팀':    '#2563eb',
  '디자인팀 02': '#10b981',
  '디자인팀 03': '#f59e0b',
  '디자인팀 04': '#8b5cf6',
  '디자인팀 05': '#ef4444',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);

function toDate(s) { return new Date(`${s}T00:00:00`); }
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(s, n) { const d = toDate(s); d.setDate(d.getDate() + n); return toISO(d); }

function escapeHtml(v) {
  return String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function formatDate(s) {
  const d = toDate(s);
  return `${d.getFullYear()}년 ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}일 ${DAY_LABELS[d.getDay()]}요일`;
}

function calcMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function fmtDuration(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60), min = m % 60;
  if (!h) return `${min}m`;
  return min ? `${h}h ${min}m` : `${h}h`;
}

function visibleSessions() { return state.sessions; }

function memberTodaySessions(memberId) {
  return visibleSessions().filter(s => s.authorId === memberId && s.date === state.today);
}

function memberHasDelayed(member) {
  return state.workItems.some(item => item.participants.includes(member.name) && isDelayed(item));
}

function memberHasUrgent(member) {
  return state.workItems.some(item =>
    item.type === '긴급' &&
    item.participants.includes(member.name) &&
    item.start <= state.today &&
    (item.end === null || item.end >= state.today)
  );
}

function todaySessions() { return visibleSessions().filter(s => s.date === state.today); }

function sessionsByItem(id) { return visibleSessions().filter(s => s.workItemId === id); }

function weekSessions() {
  const start = addDays(BASE_WEEK_START, state.weekOffset * 7);
  const end   = addDays(start, 6);
  return visibleSessions().filter(s => s.date >= start && s.date <= end);
}

function isDelayed(item) {
  if (item.type === '고정') return false;
  return item.end < state.today && visibleSessions().some(s => s.workItemId === item.id && !s.done);
}

function weekItems() {
  const start = addDays(BASE_WEEK_START, state.weekOffset * 7);
  const end   = addDays(start, 6);
  return state.workItems
    .filter(item => {
      if (item.type === '고정') return item.start <= end && (item.end === null || item.end >= start);
      return item.start <= end && item.end >= start;
    })
    .sort(sortByType);
}

function sortByType(a, b) {
  const order = { 회의: 0, 고정: 1, 긴급: 2, 일반: 3 };
  return (order[a.type] - order[b.type]) || a.title.localeCompare(b.title, 'ko');
}

function typeIconClass(type) {
  if (type === '고정') return 'pin';
  if (type === '긴급') return 'red';
  if (type === '회의') return 'orange';
  return 'gray';
}

// ─── Render Functions ─────────────────────────────────────────────────────────

function renderWeekFilter() {
  const start = addDays(BASE_WEEK_START, state.weekOffset * 7);
  const end   = addDays(start, 6);
  const fmt   = s => s.slice(5).replace('-', '.');
  const year  = start.slice(0, 4);
  const isCurrentWeek = state.weekOffset === 0;
  $('#weekRangeLabel').innerHTML =
    `<span class="week-year">${year}</span>` +
    `<span class="week-range">${fmt(start)} ~ ${fmt(end)}</span>` +
    (isCurrentWeek ? `<span class="week-current-badge">이번 주</span>` : '');
}

function renderWeeklyTasks() {
  const query = (($('#searchInput') || {}).value || '').trim().toLowerCase();
  const weekStart = addDays(BASE_WEEK_START, state.weekOffset * 7);
  const DAY_SHORTS = ['월', '화', '수', '목', '금', '토', '일'];
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => ({
    date: addDays(weekStart, i),
    label: DAY_SHORTS[i],
    weekday: i + 1, // 1=월 ~ 7=일
  }));

  const calIcon = `<svg class="period-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>`;
  const pinSvg = `<svg class="type-icon-pin" viewBox="0 0 16 16" fill="currentColor"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>`;

  const renderItem = (item, isLastFixed = false) => {
    const delayed = isDelayed(item);
    
    let period;
    if (item.type === '고정') {
      const rd = item.recurringDays || [1,2,3,4,5];
      period = `매주 ${rd.map(d => DAY_SHORTS[d - 1]).join('·')}`;
    } else if (item.type === '회의') {
      period = `${item.start.slice(5).replace('-', '.')}${item.meetingTime ? ' · ' + item.meetingTime : ''}`;
    } else {
      period = `${item.start.slice(5).replace('-', '.')} ~ ${item.end.slice(5).replace('-', '.')}`;
    }
    const iconHtml = item.type === '고정'
      ? pinSvg
      : `<span class="type-icon ${typeIconClass(item.type)}"></span>`;
    return `
      <div class="task-item${isLastFixed ? ' is-last-fixed' : ''}" data-task-id="${item.id}" role="button" tabindex="0">
        ${iconHtml}
        <span class="task-body">
          <span class="task-name">${escapeHtml(item.title)}</span>
          <span class="task-period">${calIcon}${period}${delayed ? '<span class="badge-delayed">지연중</span>' : ''}</span>
        </span>
        <button type="button" class="task-add-session-btn" data-add-session-task-id="${item.id}" title="작업세션 추가">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        </button>
        <button type="button" class="task-del-btn" data-delete-task-id="${item.id}" title="업무 삭제">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    `;
  };

  $('#weeklyTasks').innerHTML = days.map(day => {
    const items = state.workItems
      .filter(item => {
        if (item.type === '고정') {
          const rd = item.recurringDays || [1,2,3,4,5];
          return rd.includes(day.weekday) && item.start <= day.date && (item.end === null || item.end >= day.date);
        }
        return item.start <= day.date && item.end >= day.date;
      })
      .filter(item => !query || item.title.toLowerCase().includes(query))
      .sort(sortByType);

    const lastFixedIdx = items.reduce((acc, item, i) => item.type === '고정' ? i : acc, -1);
    const isToday = day.date === state.today;
    const innerHtml = items.length
      ? items.map((item, i) => renderItem(item, i === lastFixedIdx && i < items.length - 1)).join('')
      : '<span class="day-empty">업무 없음</span>';

    return `
      <div class="day-card ${isToday ? 'is-today' : ''}">
        <div class="day-card-header">
          <span class="day-label">${day.label}</span>
          <span class="day-date" data-switch-daily-date="${day.date}" role="button" tabindex="0" style="cursor:pointer">${day.date.slice(5).replace('-', '/')}</span>
        </div>
        <div class="day-items">${innerHtml}</div>
      </div>
    `;
  }).join('');
}

// ─── Detail Panel ────────────────────────────────────────────────────────────

const CAT_COLORS = {
  '디자인':    { bg: '#fce7f3', color: '#be185d' },
  '기획':      { bg: '#ede9fe', color: '#6d28d9' },
  '개발':      { bg: '#dbeafe', color: '#1d4ed8' },
  '운영':      { bg: '#dcfce7', color: '#15803d' },
  '리서치':    { bg: '#fef9c3', color: '#854d0e' },
  '퍼블리싱':  { bg: '#ffedd5', color: '#c2410c' },
};

function openDetailPanel(itemId) {
  const item = state.workItems.find(w => w.id === itemId);
  if (!item) return;
  state.detailPanelItemId = itemId;
  state.detailShowAllSteps = false;
  state.detailDraft = { title: item.title, type: item.type, end: item.end || '', description: item.description || '', recurringDays: item.recurringDays ? [...item.recurringDays] : [1] };
  renderDetailPanel();
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeDetailPanel() {
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('open');
  overlay.addEventListener('transitionend', () => {
    overlay.classList.add('hidden');
    state.detailPanelItemId = null;
    state.detailDraft = null;
  }, { once: true });
}

function renderDetailPanel() {
  const item = state.workItems.find(w => w.id === state.detailPanelItemId);
  if (!item || !state.detailDraft) return;

  const draft = state.detailDraft;
  const delayed = isDelayed(item);
  const isFixed = draft.type === '고정';
  const rd = draft.recurringDays || [1];
  const isFromRequest = !!item.sourceRequestId;
  const DAY_LABELS = ['월', '화', '수', '목', '금'];

  const isDirty = draft.title !== item.title
    || draft.type !== item.type
    || draft.end !== (item.end || '')
    || draft.description !== (item.description || '')
    || JSON.stringify(rd) !== JSON.stringify(item.recurringDays || []);

  const disabledAttr = isFromRequest ? 'disabled style="opacity:0.5;cursor:default"' : '';

  const dateRowHtml = isFixed
    ? `<div class="dw-field-2col">
        <label class="dw-field"><span>시작일</span>
          <input type="date" value="${item.start}" ${disabledAttr} />
        </label>
        <label class="dw-field"><span>종료일 <span class="dw-field-optional">미입력 시 무기한</span></span>
          <input type="date" id="detailEndDate" value="${draft.end}" ${disabledAttr} />
        </label>
      </div>
      <div class="dw-field">
        <span>반복 요일</span>
        <div class="dw-day-picker">
          ${DAY_LABELS.map((lbl, idx) => {
            const dn = idx + 1;
            return `<button type="button" class="dw-day-btn${rd.includes(dn) ? ' is-active' : ''}" data-detail-recurring-day="${dn}">${lbl}</button>`;
          }).join('')}
        </div>
      </div>`
    : `<div class="dw-field-2col">
        <label class="dw-field"><span>시작일</span>
          <input type="date" value="${item.start}" ${disabledAttr} />
        </label>
        <label class="dw-field"><span>마감일</span>
          <input type="date" id="detailEndDate" value="${draft.end}" ${disabledAttr} />
        </label>
      </div>`;


  // 회의 타입 전용 상세 패널
  if (item.type === '회의') {
    const meeting = state.meetings.find(m => m.id === item.sourceMeetingId);
    const hasNotes = meeting && (meeting.summary || (meeting.aiPoints && meeting.aiPoints.length));
    const meetingType = meeting ? meeting.type
      : (item.meetingType ? `${item.meetingType} · 예정`
      : (item.scheduled ? '예정' : '-'));
    const meetingRoom = (meeting && meeting.room) || item.room || null;

    let meetingHtml = `<div class="detail-form">
      <span class="badge-meeting" style="align-self:flex-start;background:var(--orange-soft, #fff3e0);color:var(--orange, #f57c00);font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px">회의</span>

      <div class="dw-field" style="margin-top:4px">
        <span style="font-size:18px;font-weight:700">${escapeHtml(item.title)}</span>
      </div>

      <div class="dw-field">
        <span>회의 유형</span>
        <div style="font-size:14px;color:var(--text);padding:6px 0">${escapeHtml(meetingType)}</div>
      </div>

      <div class="dw-field-2col">
        <div class="dw-field">
          <span>날짜</span>
          <div style="font-size:14px;color:var(--text);padding:6px 0">${item.start}</div>
        </div>
        <div class="dw-field">
          <span>시간</span>
          <div style="font-size:14px;color:var(--text);padding:6px 0">${item.meetingTime || '-'}</div>
        </div>
      </div>
      ${meetingRoom ? `<div class="dw-field">
        <span>회의실</span>
        <div style="font-size:14px;color:var(--text);padding:6px 0">📍 ${escapeHtml(meetingRoom)}</div>
      </div>` : ''}

      <div class="dw-field">
        <span>참석자 (${item.participants.length}명)</span>
        <div class="detail-step-chips" style="padding:6px 0">
          ${item.participants.map(name => `<div class="detail-participant-chip"><div class="avatar">${name[0]}</div><span>${escapeHtml(name)}</span></div>`).join('')}
        </div>
      </div>`;

    if (meeting && meeting.aiPoints && meeting.aiPoints.length) {
      meetingHtml += `
      <div class="dw-field" style="margin-top:8px">
        <span>AI 핵심 포인트</span>
        <ul style="font-size:13px;color:var(--text);padding:6px 0 6px 18px;margin:0;line-height:1.7">
          ${meeting.aiPoints.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>`;
    }

    if (hasNotes) {
      meetingHtml += `
      <button type="button" class="detail-meeting-link-btn" data-view-meeting-from-detail="${item.sourceMeetingId}">회의록 보기 →</button>`;
    }

    meetingHtml += `</div>`;
    document.getElementById('detailPanelBody').innerHTML = meetingHtml;
    return;
  }

  document.getElementById('detailPanelBody').innerHTML = `
    <div class="detail-form">
      ${delayed ? '<span class="badge-delayed" style="align-self:flex-start">지연중</span>' : ''}

      ${isFromRequest ? '<span class="badge-request" style="align-self:flex-start;background:var(--blue-soft);color:var(--blue);font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px">업무요청</span>' : ''}

      <label class="dw-field">
        <span>업무명</span>
        <input id="detailTitle" value="${escapeHtml(draft.title)}" placeholder="업무명을 입력하세요" style="font-weight:600${isFromRequest ? ';opacity:0.5;cursor:default' : ''}" ${isFromRequest ? 'disabled' : ''} />
      </label>

      <label class="dw-field">
        <span>업무유형</span>
        <select id="detailType" ${isFromRequest ? 'disabled style="opacity:0.5;cursor:default"' : ''}>
          <option value="일반" ${draft.type === '일반' ? 'selected' : ''}>일반</option>
          <option value="긴급" ${draft.type === '긴급' ? 'selected' : ''}>긴급</option>
          <option value="고정" ${draft.type === '고정' ? 'selected' : ''}>고정</option>
        </select>
      </label>

      ${dateRowHtml}

      <label class="dw-field">
        <span>설명</span>
        <textarea id="detailDescription" placeholder="업무 설명을 입력하세요" rows="4">${escapeHtml(draft.description)}</textarea>
      </label>

      ${isFromRequest && item.processId ? (() => {
        const proc = state.processes.find(p => p.id === item.processId);
        if (!proc) return '';
        const sa = item.stepAssignees || {};
        const myName = state.currentUser.name;
        const mySteps = proc.steps.filter(s => (sa[s.id] || []).includes(myName));
        const showAll = state.detailShowAllSteps;
        const stepsToRender = showAll ? proc.steps : mySteps;

        const allSessions = visibleSessions().filter(s => s.workItemId === item.id);
        const renderRow = (step) => {
          const assignees = sa[step.id] || [];
          const isMyStep = assignees.includes(myName);
          const stepDelayed = delayed && assignees.some(name => {
            const member = state.teamMembers.find(m => m.name === name);
            return member && allSessions.some(s => s.stepId === step.id && s.authorId === member.id && !s.done);
          });
          return `<div class="detail-step-row${stepDelayed ? ' is-delayed' : ''}">
            <span class="detail-step-name${isMyStep ? ' is-mine' : ''}">${escapeHtml(step.title)}${stepDelayed ? '<span class="badge-delayed" style="margin-left:6px;font-size:10px;vertical-align:middle">지연중</span>' : ''}</span>
            <div class="detail-step-chips">
              ${assignees.length
                ? assignees.map(name => {
                    const member = state.teamMembers.find(m => m.name === name);
                    const personDelayed = delayed && member && allSessions.some(s => s.stepId === step.id && s.authorId === member.id && !s.done);
                    return `<div class="detail-participant-chip${personDelayed ? ' is-delayed' : ''}"><div class="avatar">${name[0]}</div><span>${escapeHtml(name)}</span>${personDelayed ? '<span class="badge-delayed-sm">지연</span>' : ''}</div>`;
                  }).join('')
                : '<span style="font-size:12px;color:var(--muted)">미배정</span>'}
            </div>
          </div>`;
        };

        return `<div>
          <p class="detail-section-title">참여자</p>
          <p class="detail-steps-group-label">${showAll ? `▼ 전체 ${proc.steps.length}개 단계` : `▼ 내 담당 (${mySteps.length}개)`}</p>
          <div class="detail-step-assignees">
            ${stepsToRender.map(renderRow).join('')}
          </div>
          <button type="button" class="detail-steps-toggle" data-toggle-all-steps>
            ${showAll ? '▲ 내 담당만 보기' : `▶ 전체 ${proc.steps.length}개 단계 보기`}
          </button>
        </div>`;
      })() : ''}

    </div>

    <button class="dw-save detail-save-btn" id="detailSaveBtn" ${isDirty ? '' : 'disabled'}>저장하기</button>
  `;
}

function isDetailDirty() {
  const item = state.workItems.find(w => w.id === state.detailPanelItemId);
  if (!item || !state.detailDraft) return false;
  const d = state.detailDraft;
  return d.title !== item.title
    || d.type !== item.type
    || d.end !== (item.end || '')
    || d.description !== (item.description || '');
}

function saveDetailDraft() {
  const item = state.workItems.find(w => w.id === state.detailPanelItemId);
  if (!item || !state.detailDraft) return;
  const draft = state.detailDraft;
  item.title = draft.title.trim() || item.title;
  item.type  = draft.type;
  item.end   = draft.end || (draft.type === '고정' ? null : item.end);
  item.description = draft.description;
  if (draft.type === '고정') item.recurringDays = draft.recurringDays && draft.recurringDays.length ? [...draft.recurringDays] : item.recurringDays;
  renderAll();
  closeDetailPanel();
}

function renderDetailPanelIfOpen() {
  if (state.detailPanelItemId) renderDetailPanel();
}

function renderDailyTodo() {
  const viewDate = state.dailyViewDate || state.today;
  const viewWeekday = new Date(viewDate).getDay();

  // 헤더 라벨 업데이트
  const titleEl = $('#dailyTodoTitle');
  if (titleEl) {
    if (viewDate === state.today) {
      titleEl.textContent = '오늘 할 일';
    } else {
      const d = new Date(viewDate);
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      titleEl.textContent = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} (${dayNames[d.getDay()]}) 할 일`;
    }
  }

  // 날짜 피커 동기화
  const picker = $('#dailyTodoDatePicker');
  if (picker) picker.value = viewDate;

  const viewItems = state.workItems.filter(item => {
    if (item.type === '고정') {
      const rd = item.recurringDays || [1,2,3,4,5];
      return rd.includes(viewWeekday) && item.start <= viewDate && (item.end === null || item.end >= viewDate);
    }
    return item.start <= viewDate && item.end >= viewDate;
  });

  // 지연된 업무: 종료일이 지났지만 미완료 세션이 있는 업무항목 추가
  if (viewDate === state.today) {
    state.workItems.forEach(item => {
      if (item.type === '고정') return;
      if (viewItems.some(v => v.id === item.id)) return;
      if (item.end >= state.today) return;
      const hasUndone = visibleSessions().some(s => s.workItemId === item.id && s.authorId === state.currentUser.id && !s.done);
      if (hasUndone) viewItems.push(item);
    });
  }

  if (!viewItems.length) {
    $('#sessionList').innerHTML = '<div class="empty-state">해당하는 업무가 없습니다.</div>';
    $('#progressWrap').style.display = 'none';
    return;
  }

  // 인라인 입력창 — 최상단에 고정
  let inlineTopHtml = '';
  if (state.inlineAddItemId) {
    const inlineItem = state.workItems.find(w => w.id === state.inlineAddItemId);
    inlineTopHtml = `
      <div class="task-inline-add task-inline-top" data-inline-wrap="${state.inlineAddItemId}">
        <span class="task-inline-label">${escapeHtml(inlineItem?.title || '')}</span>
        <div class="task-inline-fields">
          <input class="task-inline-input" type="text"
            placeholder="세부 업무항목 입력 후 Enter"
            data-inline-item="${state.inlineAddItemId}" autocomplete="off" />
        </div>
      </div>`;
  }

  // 세션 수집 후 시작시간 오름차순 정렬 (시간 없는 것은 맨 아래)
  let allSessions = [];
  viewItems.forEach(item => {
    const delayed = item.type !== '고정' && item.end < state.today;
    if (delayed && viewDate === state.today) {
      // 지연 업무: 미완료 세션만 표시
      const sessions = sessionsByItem(item.id).filter(s => s.authorId === state.currentUser.id && !s.done);
      allSessions.push(...sessions);
    } else {
      const sessions = sessionsByItem(item.id).filter(s => s.date === viewDate && s.authorId === state.currentUser.id);
      allSessions.push(...sessions);
    }
  });
  allSessions.sort((a, b) => {
    const hasA = !!a.startTime, hasB = !!b.startTime;
    if (!hasA && !hasB) {
      if (a._cloned && !b._cloned) return 1;
      if (!a._cloned && b._cloned) return -1;
      return 0;
    }
    if (!hasA) return 1;
    if (!hasB) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  // 편집 중인 새 세션은 원본 바로 아래 배치
  if (state.pendingNewSessionId && state.pendingNewSessionSourceId) {
    const newIdx = allSessions.findIndex(s => s.id === state.pendingNewSessionId);
    const srcIdx = allSessions.findIndex(s => s.id === state.pendingNewSessionSourceId);
    if (newIdx !== -1 && srcIdx !== -1 && newIdx !== srcIdx + 1) {
      const [moved] = allSessions.splice(newIdx, 1);
      const insertAt = allSessions.findIndex(s => s.id === state.pendingNewSessionSourceId) + 1;
      allSessions.splice(insertAt, 0, moved);
    }
  }

  const html = allSessions.map(s => renderSessionRow(s)).join('');
  $('#sessionList').innerHTML = inlineTopHtml + html;

  if (state.inlineAddItemId) {
    requestAnimationFrame(() =>
      document.querySelector(`[data-inline-item="${state.inlineAddItemId}"]`)?.focus()
    );
  }

  const done = allSessions.filter(s => s.done).length;
  const total = allSessions.length;
  if (!total) { $('#progressWrap').style.display = 'none'; return; }
  const pct = Math.round((done / total) * 100);
  $('#progressWrap').style.display = '';
  $('#progressWrap').innerHTML = `
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <span class="progress-label">${done}/${total} 완료</span>
  `;
}

function renderSessionRow(s) {
  const catClass = CAT_CLASS[s.category] || 'cat-default';
  const isEditing = state.editingSessionId === s.id;
  const wi = state.workItems.find(w => w.id === s.workItemId);
  const delayed = wi && wi.type !== '고정' && wi.end < state.today;
  const wiLabel = wi ? `<span class="session-work-label">${escapeHtml(wi.title)}${delayed ? '<span class="badge-delayed" style="margin-left:6px;font-size:10px;vertical-align:middle">지연중</span>' : ''}</span>` : '';
  const timeMarkup = `
    <div class="session-time-inputs">
      <input type="text" class="session-time-input time-readonly" placeholder="00:00"
        value="${s.startTime || ''}" data-time-start="${s.id}" readonly />
      <span class="time-sep">~</span>
      <input type="text" class="session-time-input time-readonly" placeholder="00:00"
        value="${s.endTime || ''}" data-time-end="${s.id}" readonly />
    </div>`;
  const titleHtml = isEditing
    ? `<input class="session-title-edit" type="text" value="${escapeHtml(s.title)}" data-edit-session-title="${s.id}" />`
    : `<div class="session-title-text ${s.done ? 'done-text' : ''}" data-start-edit-session="${s.id}">${escapeHtml(s.title)}</div>`;

  return `
    <div class="session-row" data-session-id="${s.id}">
      <button class="check-btn ${s.done ? 'done' : ''}" type="button" data-toggle-session="${s.id}">
        ${s.done ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      </button>
      <div class="session-body">
        ${wiLabel}
        ${titleHtml}
        ${timeMarkup}
      </div>
      <button class="session-add-btn" type="button" data-clone-session="${s.id}">+</button>
      <button class="session-del-btn" type="button" data-delete-session="${s.id}">삭제</button>
    </div>
  `;
}

function renderKpis() {
  const viewDate = state.dailyViewDate;
  const viewWeekday = new Date(viewDate).getDay();
  const viewItems = state.workItems.filter(item => {
    if (item.type === '고정') {
      const rd = item.recurringDays || [1,2,3,4,5];
      return rd.includes(viewWeekday) && item.start <= viewDate && (item.end === null || item.end >= viewDate);
    }
    return item.start <= viewDate && item.end >= viewDate;
  });
  let daySessions = [];
  viewItems.forEach(item => {
    daySessions.push(...sessionsByItem(item.id).filter(s => s.date === viewDate && s.authorId === state.currentUser.id));
  });

  const todayMin = daySessions.filter(s => s.done).reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0);
  const done     = daySessions.filter(s => s.done).length;
  const remaining= daySessions.filter(s => !s.done).length;

  const total = daySessions.length;
  const cells = [
    { val: fmtDuration(todayMin),      lbl: '오늘 작업시간', color: '#2563eb' },
    { val: `${done}/${total}`,          lbl: '완료 세션',     color: '#10b981' },
  ];

  $('#kpiGrid').innerHTML = cells.map(c => `
    <div class="kpi-cell">
      <div class="kpi-val" style="color:${c.color}">${c.val}</div>
      <div class="kpi-lbl">${c.lbl}</div>
    </div>
  `).join('');
}

function renderRequestList() {
  const pending = state.requests.filter(r => r.status === '수락 대기');
  const badge = $('#reqBadge');
  if (pending.length) {
    badge.textContent = pending.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if (!state.requests.length) {
    $('#requestList').innerHTML = '<div class="empty-state">처리할 업무 요청이 없습니다.</div>';
    return;
  }

  // 수락 대기를 위로, 수락됨·거절됨을 아래로
  const sortOrder = { '수락 대기': 0, '수락': 1, '거절': 1 };
  const sorted = [...state.requests].sort((a, b) =>
    (sortOrder[a.status] ?? 1) - (sortOrder[b.status] ?? 1)
  );

  $('#requestList').innerHTML = sorted.map(r => {
    const isRejected = r.status === '거절';
    const isAccepted = r.status === '수락';

    const statusBadge = isRejected
      ? `<span class="req-status rejected">거절됨</span>`
      : isAccepted
        ? `<span class="req-status accepted">수락됨</span>`
        : '';

    const actions = (!isRejected && !isAccepted) ? `
      <div class="req-actions">
        <button class="req-accept" type="button" data-accept-request="${r.id}">수락</button>
        <button class="req-reject" type="button" data-reject-request="${r.id}">거절</button>
      </div>` : '';

    return `
      <div class="req-item ${isRejected ? 'is-rejected' : ''}">
        <div class="req-item-header">
          <span class="req-item-title">${escapeHtml(r.title)}</span>
          ${statusBadge}
        </div>
        <div class="req-desc">${escapeHtml(r.detail)}</div>
        <div class="req-meta">${escapeHtml(r.requester)} · ${r.start.slice(5).replace('-', '/')} ~ ${r.end.slice(5).replace('-', '/')}</div>
        ${actions}
      </div>
    `;
  }).join('');
}

function renderNotifications() {
  const unreadCount = state.notifications.filter(n => n.unread).length;
  const dot = $('#notificationDot');
  dot.classList.toggle('hidden', unreadCount === 0);
  dot.textContent = unreadCount > 99 ? '99+' : unreadCount;

  $('#notificationList').innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-notif-id="${n.id}" style="cursor:pointer">
      <div style="font-size:13px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span>${escapeHtml(n.title)}</span>
        ${n.requestTitle ? `<span style="font-size:11px;font-weight:600;color:#4a66ff;background:#eef1ff;border-radius:4px;padding:2px 7px;flex-shrink:0">${escapeHtml(n.requestTitle)}</span>` : ''}
      </div>
      <div style="font-size:12px;color:#6b7280">${escapeHtml(n.body)}</div>
    </div>
  `).join('');
}

function populateSessionWorkItemSelect() {
  const sel = $('#sessionWorkItem');
  if (!sel) return;
  const items = weekItems();
  sel.innerHTML = items.map(item =>
    `<option value="${item.id}" ${item.id === state.selectedTaskId ? 'selected' : ''}>${escapeHtml(item.title)}</option>`
  ).join('');
}

function renderTeamStatusPage() {
  const body = document.getElementById('teamStatusBody');
  const today = toDate(state.today);
  const dateStr = `${today.getFullYear()}년 ${MONTH_LABELS[today.getMonth()]} ${today.getDate()}일`;
  document.getElementById('tsSubtitle').textContent =
    `${state.currentUser.team} · ${dateStr} 기준`;

  const reqs = state.assignmentRequests || [];

  // ── KPI row ──────────────────────────────────────────────────────────────
  const kpiNew      = reqs.filter(r => r.status === '신규요청').length;
  const kpiReassign = reqs.filter(r => r.status === '재배정').length;
  const kpiPending  = reqs.filter(r => r.status === '수락대기중').length;
  const kpiDone     = reqs.filter(r => r.status === '배정완료').length;

  const kpiHtml = `
    <div class="ts-kpi-row">
      <div class="ts-kpi-card"><div class="ts-kpi-val ts-kpi-blue">${kpiNew}</div><div class="ts-kpi-lbl">신규 요청</div></div>
      <div class="ts-kpi-card"><div class="ts-kpi-val ts-kpi-red">${kpiReassign}</div><div class="ts-kpi-lbl">재배정 필요</div></div>
      <div class="ts-kpi-card"><div class="ts-kpi-val ts-kpi-yellow">${kpiPending}</div><div class="ts-kpi-lbl">수락 대기</div></div>
      <div class="ts-kpi-card"><div class="ts-kpi-val ts-kpi-green">${kpiDone}</div><div class="ts-kpi-lbl">배정 완료</div></div>
    </div>`;

  // ── Assignment request sections ───────────────────────────────────────────
  const AVATAR_BG = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];
  const REQ_GROUPS = [
    { statuses: ['신규요청'], label: '신규 요청',   cls: 'ts-req-new',      showBtn: true,  btnCls: 'ts-req-assign-btn' },
    { statuses: ['재배정'],   label: '재배정',       cls: 'ts-req-reassign', showBtn: true,  btnCls: 'ts-req-assign-btn ts-req-reassign-btn' },
    { statuses: ['수락대기중'], label: '수락 대기 중', cls: 'ts-req-pending',  showBtn: false },
    { statuses: ['배정완료'], label: '배정 완료',    cls: 'ts-req-done',     showBtn: false },
  ];
  const PRI_CLS = { '긴급': 'ts-pri-urgent', '일반': 'ts-pri-normal' };

  function assigneeCellHtml(r, group) {
    if (group.showBtn) {
      return `<button class="${group.btnCls}" type="button" data-open-assign="${escapeHtml(r.id)}">담당자 배정</button>`;
    }
    const names = r.assignees || [];
    if (!names.length) return '<span style="color:var(--soft);font-size:12px">—</span>';
    const visible = names.slice(0, 3);
    const extra   = names.length - visible.length;
    const avatars = visible.map(name => {
      const idx = state.teamMembers.findIndex(m => m.name === name);
      const bg  = AVATAR_BG[(idx >= 0 ? idx : 0) % AVATAR_BG.length];
      return `<div class="ts-assignee-avatar" style="background:${bg}" title="${escapeHtml(name)}">${name[0]}</div>`;
    }).join('');
    const extraEl = extra > 0 ? `<div class="ts-assignee-avatar ts-assignee-extra">+${extra}</div>` : '';
    return `<div class="ts-assignee-avatars">${avatars}${extraEl}</div>`;
  }

  const reqHtml = REQ_GROUPS.map(group => {
    const items = reqs.filter(r => group.statuses.includes(r.status));
    if (!items.length) return '';
    const rows = items.map(r => `
      <div class="ts-req-row">
        <span class="ts-req-status-badge ${group.cls}-badge">${escapeHtml(group.label)}</span>
        <span class="ts-req-title">${escapeHtml(r.title)}</span>
        <span class="ts-req-team">${escapeHtml(r.team)}</span>
        <span class="ts-req-deadline"><span class="ts-req-deadline-lbl">요청일</span> ${escapeHtml(r.deadline)}</span>
        <span class="ts-req-pri ${PRI_CLS[r.priority] || 'ts-pri-normal'}">${escapeHtml(r.priority)}</span>
        <span class="ts-req-assignee">${assigneeCellHtml(r, group)}</span>
      </div>`).join('');
    return `<div class="ts-req-section ${group.cls}">${rows}</div>`;
  }).join('');

  // ── Section divider ───────────────────────────────────────────────────────
  const dividerHtml = `<div class="ts-section-divider"><span>팀 현황</span></div>`;

  // ── Member cards ──────────────────────────────────────────────────────────
  const visibleMembers = state.currentUser.role === 'Owner'
    ? state.teamMembers
    : state.teamMembers.filter(m => m.team === state.currentUser.team);

  const AVATAR_COLORS = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];

  const cardsHtml = visibleMembers.map((member, idx) => {
    const color   = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    const initial = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    if (member.onLeave) {
      return `
        <div class="ts-card ts-card-leave">
          <div class="ts-card-top">
            <div class="ts-avatar" style="background:${color}">${escapeHtml(initial)}</div>
            <div class="ts-member-info">
              <div class="ts-member-name">${escapeHtml(member.name)}</div>
              <div class="ts-member-role">${escapeHtml(member.role)}</div>
            </div>
          </div>
          <div class="ts-leave-badge">${escapeHtml(member.leaveType)}</div>
        </div>`;
    }

    const items    = member.weekWorkItems || [];
    const done     = items.filter(i => i.done).length;
    const total    = items.length;
    const pct      = total > 0 ? Math.round(done / total * 100) : 0;

    const itemsHtml = items.map(item => `
      <div class="ts-wi-row${item.done ? ' ts-wi-done' : ''}">
        <span class="ts-wi-dot ts-wi-${item.type === '긴급' ? 'urgent' : item.type === '고정' ? 'fixed' : 'normal'}"></span>
        <span class="ts-wi-title">${escapeHtml(item.title)}</span>
      </div>`).join('');

    return `
      <div class="ts-card">
        <div class="ts-card-top">
          <div class="ts-avatar" style="background:${color}">${escapeHtml(initial)}</div>
          <div class="ts-member-info">
            <div class="ts-member-name">${escapeHtml(member.name)}</div>
            <div class="ts-member-role">${escapeHtml(member.role)}</div>
          </div>
        </div>
        <div class="ts-wi-list">${itemsHtml}</div>
        <div class="ts-progress-wrap">
          <div class="ts-progress-track"><div class="ts-progress-fill" style="width:${pct}%"></div></div>
          <span class="ts-progress-pct">${pct}%</span>
        </div>
      </div>`;
  }).join('');

  body.innerHTML = kpiHtml +
    `<div class="ts-req-block">${reqHtml}</div>` +
    dividerHtml +
    `<div class="ts-cards-grid">${cardsHtml}</div>`;
}

// ─── My Page ──────────────────────────────────────────────────────────────────

function renderMyPage() {
  const u = state.currentUser;
  const el = document.getElementById('myPage');
  if (!el) return;

  el.innerHTML = `
    <div class="mp-header">
      <h2 class="mp-title">My Page</h2>
    </div>
    <div class="mp-grid">
      <div class="mp-col-left">
        ${_mpProfile(u)}
        ${_mpCharts()}
      </div>
      <div class="mp-col-center">
        ${_mpAI()}
        ${_mpMeetings()}
      </div>
      <div class="mp-col-right">${_mpCalPanel()}</div>
    </div>
  `;
}

function _mpKpiCards() {
  const uid = state.currentUser.id;
  const allSessions = state.sessions.filter(s => s.authorId === uid);
  const monthPrefix = state.today.slice(0,7);
  const monthSessions = allSessions.filter(s => s.date.startsWith(monthPrefix));
  const totalMins = monthSessions.reduce((a, s) => a + _sessionMins(s), 0);
  const avgMins = allSessions.length ? Math.round(allSessions.reduce((a,s)=>a+_sessionMins(s),0)/allSessions.length) : 0;
  const fmtH = m => { const h=Math.floor(m/60),mn=m%60; return h>0?`${h}h ${mn}m`:`${mn}m`; };
  const doneCnt = allSessions.filter(s=>s.done).length;
  const activeWi = state.workItems.filter(wi=>wi.participants&&wi.participants.includes(state.currentUser.name)).length;
  const focusPct = allSessions.length ? Math.round((doneCnt/allSessions.length)*100) : 0;

  const kpis = [
    { icon: '📋', label: '총 세션',      value: allSessions.length, unit: '건' },
    { icon: '⚙️', label: '진행 중 업무',  value: activeWi,           unit: '개' },
    { icon: '⏱️', label: '평균 작업시간', value: fmtH(avgMins),       unit: '' },
    { icon: '📅', label: '이번 달 작업',  value: fmtH(totalMins),    unit: '' },
    { icon: '✅', label: '완료율',        value: focusPct,           unit: '%' },
  ];
  return kpis.map(k => `
    <div class="mp-kpi-card">
      <div class="mp-kpi-icon">${k.icon}</div>
      <div class="mp-kpi-text">
        <div class="mp-kpi-value">${k.value}<span class="mp-kpi-unit">${k.unit}</span></div>
        <div class="mp-kpi-label">${k.label}</div>
      </div>
    </div>`).join('');
}

function _mpProfile(u) {
  return `
    <div class="mp-profile-card">
      <div class="mp-profile-avatar">${u.name.charAt(0)}</div>
      <div class="mp-profile-name">${u.name}</div>
      <div class="mp-profile-role">${u.role}</div>
      <div class="mp-profile-divider"></div>
      <div class="mp-profile-rows">
        <div class="mp-profile-row"><span class="mp-profile-key">팀</span><span class="mp-profile-val">${u.team}</span></div>
        <div class="mp-profile-row"><span class="mp-profile-key">권한</span><span class="mp-profile-val">${u.role}</span></div>
        <div class="mp-profile-row"><span class="mp-profile-key">입사일</span><span class="mp-profile-val">${u.joinDate}</span></div>
      </div>
    </div>
  `;
}

function _mpCharts() {
  const uid = state.currentUser.id;
  const allSessions = state.sessions.filter(s => s.authorId === uid);

  // Category bar chart
  const catMap = {};
  allSessions.forEach(s => { catMap[s.category] = (catMap[s.category]||0) + _sessionMins(s); });
  const catEntries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const catTotal = catEntries.reduce((a,c)=>a+c[1],0)||1;
  const CAT_COLORS = { '기획':'#6C63FF','개발':'#3BAFDA','디자인':'#FF6B6B','운영':'#FF9F43','리서치':'#26de81' };
  const getColor = cat => CAT_COLORS[cat]||'#A29BFE';
  const fmtH = m => { const h=Math.floor(m/60),mn=m%60; return h>0?`${h}h ${mn}m`:`${mn}m`; };

  const barRows = catEntries.map(([cat,mins]) => {
    const pct = Math.round(mins/catTotal*100);
    return `
      <div class="mp-cat-row">
        <span class="mp-cat-name">${cat}</span>
        <div class="mp-cat-bar-track">
          <div class="mp-cat-bar-fill" style="width:${pct}%;background:${getColor(cat)}"></div>
        </div>
        <span class="mp-cat-pct">${pct}%</span>
        <span class="mp-cat-time">${fmtH(mins)}</span>
      </div>`;
  }).join('');

  return `
    <div class="mp-chart-card">
      <div class="mp-chart-title">카테고리별 작업시간</div>
      <div class="mp-cat-bars">${barRows}</div>
    </div>
  `;
}

function _mpCalPanel() {
  const year  = state.myPageCalYear;
  const month = state.myPageCalMonth;
  const today = state.today;
  const uid   = state.currentUser.id;

  const myLeaves = state.leaves.filter(l=>l.applicantId===uid && l.status==='승인 완료');
  const leaveSet = new Set(myLeaves.map(l=>l.date));

  // Dates that have sessions
  const sessionDates = new Set(
    state.sessions.filter(s=>s.authorId===uid).map(s=>s.date)
  );

  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const monthStr = String(month+1).padStart(2,'0');
  const MONTHS=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  let cells = '';
  for(let i=0;i<firstDay;i++) cells+='<div class="mpc-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${year}-${monthStr}-${String(d).padStart(2,'0')}`;
    const isLeave=leaveSet.has(ds), hasSession=sessionDates.has(ds);
    const isToday=ds===today, isSel=ds===state.myPageSelectedDate;
    const cls=['mpc-cell',isLeave?'leave':'',isToday?'today':'',isSel?'selected':''].filter(Boolean).join(' ');
    cells+=`<div class="${cls}" data-mp-date="${ds}">
      <span class="mpc-day">${d}</span>
      ${isLeave?'<span class="mpc-dot leave-dot"></span>':hasSession?'<span class="mpc-dot session-dot"></span>':''}
    </div>`;
  }

  // Session list
  let sessHtml='<div class="mpc-empty">날짜를 선택하세요</div>';
  if(state.myPageSelectedDate){
    const sd=state.myPageSelectedDate;
    const slist=state.sessions.filter(s=>s.authorId===uid&&s.date===sd);
    if(!slist.length){
      sessHtml=`<div class="mpc-empty">${sd} 세션 없음</div>`;
    } else {
      sessHtml=slist.map(s=>{
        const m=_sessionMins(s);
        const dur=m>=60?`${Math.floor(m/60)}h${m%60?m%60+'m':''}`:`${m}m`;
        return `<div class="mpc-sess-row">
          <span class="mpc-sess-cat" data-cat="${s.category}">${s.category}</span>
          <span class="mpc-sess-title">${s.title}</span>
          <span class="mpc-sess-dur">${dur}</span>
        </div>`;
      }).join('');
    }
  }

  return `
    <div class="mp-cal-mini-card">
      <div class="mp-cal-nav">
        <button class="mp-cal-btn" data-mp-cal="prev">&#8249;</button>
        <span class="mp-cal-label">${year}년 ${MONTHS[month]}</span>
        <button class="mp-cal-btn" data-mp-cal="next">&#8250;</button>
      </div>
      <div class="mpc-grid">
        <div class="mpc-dow">일</div><div class="mpc-dow">월</div><div class="mpc-dow">화</div>
        <div class="mpc-dow">수</div><div class="mpc-dow">목</div><div class="mpc-dow">금</div><div class="mpc-dow">토</div>
        ${cells}
      </div>
      <div class="mpc-legend">
        <span><span class="mpc-dot session-dot"></span>작업세션</span>
        <span><span class="mpc-dot leave-dot"></span>연차</span>
      </div>
    </div>
    <div class="mp-sess-card">
      <div class="mp-sess-date-label">${state.myPageSelectedDate||'날짜 미선택'} 작업세션</div>
      ${sessHtml}
    </div>
  `;
}

function _sessionMins(s) {
  const [sh,sm]=s.startTime.split(':').map(Number);
  const [eh,em]=s.endTime.split(':').map(Number);
  return (eh*60+em)-(sh*60+sm);
}

function _mpAI() {
  const uid=state.currentUser.id;
  const monthPrefix=state.today.slice(0,7);
  const ms=state.sessions.filter(s=>s.authorId===uid&&s.date.startsWith(monthPrefix));

  const catCount={};
  ms.forEach(s=>{catCount[s.category]=(catCount[s.category]||0)+1;});
  const topCat=Object.entries(catCount).sort((a,b)=>b[1]-a[1])[0];

  const wiTime={};
  ms.forEach(s=>{wiTime[s.title]=(wiTime[s.title]||0)+_sessionMins(s);});
  const topWi=Object.entries(wiTime).sort((a,b)=>b[1]-a[1])[0];

  const dayMins={};
  ms.forEach(s=>{dayMins[s.date]=(dayMins[s.date]||0)+_sessionMins(s);});
  const sortedDays=Object.entries(dayMins).sort((a,b)=>b[1]-a[1]);
  const bestDay=sortedDays[0], worstDay=sortedDays[sortedDays.length-1];
  const fmtDate=d=>d?`${d.slice(5,7)}/${d.slice(8,10)}`:'-';

  const hourMins={};
  ms.forEach(s=>{const h=s.startTime.split(':')[0];hourMins[h]=(hourMins[h]||0)+_sessionMins(s);});
  const peakHour=Object.entries(hourMins).sort((a,b)=>b[1]-a[1])[0];

  const titleCount={};
  ms.forEach(s=>{titleCount[s.title]=(titleCount[s.title]||0)+1;});
  const repeated=Object.entries(titleCount).filter(([,c])=>c>=2).map(([t])=>t);

  const totalMins=ms.reduce((a,s)=>a+_sessionMins(s),0);
  const fmtH=m=>{const h=Math.floor(m/60),mn=m%60;return h>0?`${h}h ${mn}m`:`${mn}m`;};
  const MONTHS=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const now=new Date(state.today+'T00:00:00');

  const insights=[
    {icon:'📋',label:'가장 많이 수행한 업무',     value:topCat?`${topCat[0]} (${topCat[1]}건)`:'데이터 없음'},
    {icon:'⏱️',label:'가장 많은 시간이 투입된 업무',value:topWi?`${topWi[0]} (${fmtH(topWi[1])})`:'데이터 없음'},
    {icon:'🔁',label:'반복 업무 패턴',            value:repeated.length?repeated.slice(0,2).join(', '):'반복 업무 없음'},
    {icon:'🌟',label:'생산성이 높은 요일',         value:bestDay?`${fmtDate(bestDay[0])} (${fmtH(bestDay[1])})`:'데이터 없음'},
    {icon:'📉',label:'생산성이 낮은 요일',         value:worstDay?`${fmtDate(worstDay[0])} (${fmtH(worstDay[1])})`:'데이터 없음'},
    {icon:'⚡',label:'업무 집중 시간대',           value:peakHour?`${peakHour[0]}:00 ~ ${parseInt(peakHour[0])+1}:00`:'데이터 없음'},
  ];

  return `
    <div class="mp-ai-card">
      <div class="mp-ai-header">
        <span class="mp-ai-badge">AI</span>
        <span class="mp-ai-title">${now.getFullYear()}년 ${MONTHS[now.getMonth()]} 업무 패턴 요약</span>
        <span class="mp-ai-total">${ms.length}건 · ${fmtH(totalMins)}</span>
      </div>
      <div class="mp-ai-body">
        ${insights.map(i=>`
          <div class="mp-ai-row">
            <span class="mp-ai-icon">${i.icon}</span>
            <span class="mp-ai-label">${i.label}</span>
            <span class="mp-ai-value">${i.value}</span>
          </div>`).join('')}
      </div>
    </div>
  `;
}

function _mpMeetings() {
  const myName = state.currentUser.name;
  const meetings = (state.meetings || []).filter(m =>
    Array.isArray(m.attendeeNames) && m.attendeeNames.includes(myName)
  );
  const TYPE_COLOR = {
    '회고': '#7c4dff', '기획': '#4a66ff', '디자인': '#f5a623',
    '전략': '#f04444', '클라이언트 미팅': '#0ea874', '워크샵': '#06b6d4',
    '업무 보고': '#6b7280', '주간 공유': '#ec4899',
  };
  const inner = meetings.length
    ? meetings.map(m => {
        const color = TYPE_COLOR[m.type] || '#6b7280';
        const myActions = (m.actionItems || []).filter(a => a.assignee === myName);
        const actionBadge = myActions.length
          ? `<span class="mp-meeting-action-badge">${myActions.length} 액션</span>`
          : '';
        const avatars = (m.attendeeNames || []).slice(0, 4).map(name =>
          `<span class="mp-meeting-avatar${name === myName ? ' me' : ''}">${name.slice(0,1)}</span>`
        ).join('');
        const more = m.attendeeNames.length > 4
          ? `<span class="mp-meeting-avatar-more">+${m.attendeeNames.length - 4}</span>` : '';
        return `
          <div class="mp-meeting-card" onclick="openMeetingDetail('${m.id}')" role="button" tabindex="0">
            <div class="mp-meeting-card-top">
              <span class="mp-meeting-badge" style="background:${color}">${m.type}</span>
              <span class="mp-meeting-card-title">${escapeHtml(m.title)}</span>
              ${actionBadge}
            </div>
            <div class="mp-meeting-card-summary">${escapeHtml(m.summary)}</div>
            <div class="mp-meeting-card-bottom">
              <div class="mp-meeting-avatars">${avatars}${more}</div>
              <span class="mp-meeting-meta">${m.date}</span>
              <span class="mp-meeting-meta">${m.duration}</span>
            </div>
          </div>`;
      }).join('')
    : `<div class="mp-meetings-empty">참여한 회의가 없습니다.</div>`;
  return `
    <div class="mp-meetings-section">
      <div class="mp-meetings-header">
        <span class="mp-section-label">참여한 회의</span>
        <span class="mp-meetings-count">${meetings.length}건</span>
      </div>
      <div class="mp-meetings-list">${inner}</div>
    </div>
  `;
}

function renderAll() {
  renderWeekFilter();
  renderNotifications();
  if (state.currentPage === 'home') {
    renderWeeklyTasks();
    renderDailyTodo();
    renderKpis();
    renderRequestList();
    if (!$('#taskDrawer').classList.contains('hidden')) renderDrawerBody();
  } else if (state.currentPage === 'meeting-room') {
    renderCalendarPage();
  } else if (state.currentPage === 'calendar') {
    renderCalPage();
  } else if (state.currentPage === 'team-status') {
    renderTeamStatusPage();
  } else if (state.currentPage === 'leave') {
    renderLeavePage();
  } else if (state.currentPage === 'my-page') {
    renderMyPage();
  }
}

// ─── Page Navigation ──────────────────────────────────────────────────────────

function switchPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-item[data-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === page);
  });
  $('#homeGrid').classList.toggle('hidden', page !== 'home');
  $('#meetingRoomPage')?.classList.toggle('hidden', page !== 'meeting-room');
  $('#calPage')?.classList.toggle('hidden', page !== 'calendar');
  $('#teamStatusPage')?.classList.toggle('hidden', page !== 'team-status');
  $('#leavePage')?.classList.toggle('hidden', page !== 'leave');
  $('#myPage')?.classList.toggle('hidden', page !== 'my-page');
  $('#processPage')?.classList.toggle('hidden', page !== 'process');
  if (page === 'process') renderProcessPage();
  else renderAll();
}


// ─── Recorder ─────────────────────────────────────────────────────────────────

let _recorderInterval = null;
let _actionItemCount = 0;
let _selectedAttendees = []; // { id, name } 배열

// ─── Meeting Room Page ────────────────────────────────────────────────────────

const TEAM_TAG_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#fff7ed', text: '#9a3412' },
  { bg: '#fef9c3', text: '#854d0e' },
];

function teamTagColor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  return TEAM_TAG_COLORS[h % TEAM_TAG_COLORS.length];
}

function renderMeetingList() {
  const q = (state.calSearchQuery || '').toLowerCase();
  const filter = state.calTeamFilter || '전체';

  const filtered = state.meetings.filter(m => {
    if (filter !== '전체' && m.team !== filter) return false;
    if (q) {
      const haystack = `${m.title} ${m.type} ${m.summary || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const el = document.getElementById('meetingList');
  if (!el) return;

  if (!filtered.length) {
    el.innerHTML = '<div class="cal-empty">해당하는 회의록이 없습니다.</div>';
    return;
  }

  el.innerHTML = filtered.map(m => {
    const tc = teamTagColor(m.team);
    const date = m.date || m.startDate || '';
    const fmtDate = date ? date.replace(/-/g, '.') : '';
    const actionCount = (m.actionItems || []).length;
    const attendeeNames = m.attendeeNames || [];
    const attendeeDisplay = attendeeNames.length
      ? attendeeNames.map(n => `<span class="meeting-attendee-chip" title="${escapeHtml(n)}">${escapeHtml(n[0])}</span>`).join('')
      : `<span>👥 ${m.attendees || 0}명</span>`;
    return `<div class="meeting-card" data-meeting-id="${m.id}">
      <button class="meeting-delete-btn" type="button" data-delete-meeting="${m.id}" title="삭제">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
      <div class="meeting-card-top">
        <div class="meeting-tags">
          <span class="meeting-team-tag" style="background:${tc.bg};color:${tc.text}">${escapeHtml(m.team)}</span>
          <span class="meeting-type-tag">${escapeHtml(m.type)}</span>
        </div>
        <div class="meeting-meta-right">
          <span>${fmtDate}</span>
          <span>${escapeHtml(m.author)}</span>
        </div>
      </div>
      <div class="meeting-title">${escapeHtml(m.title)}</div>
      <div class="meeting-summary">${escapeHtml(m.summary || '')}</div>
      <div class="meeting-footer">
        <div class="meeting-stats">
          <span>⏱ ${escapeHtml(m.duration || '--:--')}</span>
          <span class="meeting-attendees-row">${attendeeDisplay}</span>
          ${actionCount ? `<span>✅ 액션 ${actionCount}건</span>` : ''}
        </div>
        <button class="meeting-view-btn" type="button" data-view-meeting="${m.id}">회의록 보기 →</button>
      </div>
    </div>`;
  }).join('');
}

function renderMeetingTeamTabs() {
  const teams = ['전체', ...new Set(state.meetings.map(m => m.team))];
  const el = document.getElementById('calTeamTabs');
  if (!el) return;
  el.innerHTML = teams.map(t => {
    const count = t === '전체' ? state.meetings.length : state.meetings.filter(m => m.team === t).length;
    const active = (state.calTeamFilter || '전체') === t;
    return `<button class="cal-team-tab${active ? ' active' : ''}" type="button" data-cal-team="${t}">
      ${escapeHtml(t)} <span class="cal-tab-count">${count}</span>
    </button>`;
  }).join('');
}

function renderCalendarPage() {
  renderMeetingTeamTabs();
  renderMeetingList();
  updateRecorderWidget();
}

function recFmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateRecorderWidget() {
  const widget   = document.getElementById('recorderWidget');
  const micBtn   = document.getElementById('recorderMicBtn');
  const stopBtn  = document.getElementById('recorderStopBtn');
  const waveform = document.getElementById('recorderWaveform');
  const info     = document.getElementById('recorderInfo');
  const status   = document.getElementById('recorderStatus');
  const hint     = document.getElementById('recorderHint');
  const timer    = document.getElementById('recorderTimer');
  if (!widget) return;

  const isRecording = state.recorder.status === 'recording';
  widget.dataset.state = state.recorder.status;
  micBtn.classList.toggle('hidden', isRecording);
  stopBtn.classList.toggle('hidden', !isRecording);
  waveform.classList.toggle('hidden', !isRecording);
  info.classList.toggle('hidden', isRecording);
  timer.classList.toggle('recording', isRecording);
  timer.textContent = recFmtTime(state.recorder.seconds);

  // also update top-bar status badge
  const autoSave = document.getElementById('calAutoSave');
  if (autoSave) autoSave.textContent = isRecording ? '녹음 중' : '자동 저장';
  autoSave?.classList.toggle('recording-badge', isRecording);
}

function startRecording() {
  state.recorder.status = 'recording';
  state.recorder.seconds = 0;
  _recorderInterval = setInterval(() => {
    state.recorder.seconds++;
    updateRecorderWidget();
  }, 1000);
  updateRecorderWidget();
}

function stopRecording() {
  clearInterval(_recorderInterval);
  _recorderInterval = null;
  const duration = recFmtTime(state.recorder.seconds);
  state.recorder.status = 'idle';
  state.recorder.seconds = 0;
  updateRecorderWidget();
  openMeetingSaveModal(duration);
}

// ─── Meeting Save Modal ────────────────────────────────────────────────────────

function openMeetingSaveModal(duration) {
  _actionItemCount = 0;
  _selectedAttendees = [];
  document.getElementById('mSaveDate').value = state.today;
  document.getElementById('mSaveTitle').value = '';
  document.getElementById('mSaveContent').value = '';
  document.getElementById('mSaveActionItems').innerHTML = '';
  document.getElementById('attendeeChips').innerHTML = '';
  document.getElementById('attendeeSearch').value = '';
  document.getElementById('attendeeDropdown').classList.add('hidden');
  document.getElementById('meetingSaveModal').classList.remove('hidden');
  document.getElementById('meetingSaveModal').dataset.duration = duration;
}

function renderAttendeeChips() {
  const chips = document.getElementById('attendeeChips');
  if (!chips) return;
  chips.innerHTML = _selectedAttendees.map(m =>
    `<span class="attendee-chip">${escapeHtml(m.name)}<button type="button" class="attendee-chip-remove" data-remove-attendee="${m.id}">✕</button></span>`
  ).join('');
}

function renderAttendeeDropdown(query) {
  const dropdown = document.getElementById('attendeeDropdown');
  if (!dropdown) return;
  const q = query.toLowerCase();
  const selectedIds = new Set(_selectedAttendees.map(m => m.id));
  const matches = state.teamMembers.filter(m =>
    !selectedIds.has(m.id) && (q === '' || m.name.toLowerCase().includes(q))
  );
  if (!matches.length) { dropdown.classList.add('hidden'); return; }
  dropdown.innerHTML = matches.map(m =>
    `<div class="attendee-option" data-select-attendee="${m.id}" data-name="${escapeHtml(m.name)}">
      <span class="attendee-option-avatar" style="background:${memberColor(m.name)}">${escapeHtml(m.name[0])}</span>
      <div class="attendee-option-info">
        <span class="attendee-option-name">${escapeHtml(m.name)}</span>
        <span class="attendee-option-role">${escapeHtml(m.role)}</span>
      </div>
    </div>`
  ).join('');
  dropdown.classList.remove('hidden');
}

function closeMeetingSaveModal() {
  document.getElementById('meetingSaveModal').classList.add('hidden');
}

// ─── Meeting Delete ────────────────────────────────────────────────────────────

let _pendingDeleteMeetingId = null;

function openDeleteMeetingConfirm(id) {
  _pendingDeleteMeetingId = id;
  document.getElementById('meetingDeleteModal').classList.remove('hidden');
}

function closeDeleteMeetingConfirm() {
  _pendingDeleteMeetingId = null;
  document.getElementById('meetingDeleteModal').classList.add('hidden');
}

function confirmDeleteMeeting() {
  if (!_pendingDeleteMeetingId) return;
  state.meetings = state.meetings.filter(m => m.id !== _pendingDeleteMeetingId);
  closeDeleteMeetingConfirm();
  renderCalendarPage();
}

function addActionItemRow() {
  _actionItemCount++;
  const id = `new-act-${_actionItemCount}`;
  const row = document.createElement('div');
  row.className = 'action-item-input-row';
  row.dataset.actionId = id;
  row.innerHTML = `
    <input class="action-item-text" type="text" placeholder="할 일" />
    <input class="action-item-due" type="date" value="${state.today}" />
    <div class="action-assignee-picker" data-row-id="${id}">
      <input class="action-assignee-search" type="text" placeholder="담당자 검색..." autocomplete="off" />
      <svg class="attendee-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      <div class="action-assignee-dropdown hidden"></div>
    </div>
    <button class="action-item-remove" type="button" data-remove-action="${id}">✕</button>
  `;
  document.getElementById('mSaveActionItems').appendChild(row);
}

function renderActionAssigneeDropdown(picker, query) {
  const dropdown = picker.querySelector('.action-assignee-dropdown');
  if (!dropdown) return;
  const q = (query || '').toLowerCase();
  const matches = state.teamMembers.filter(m =>
    q === '' || m.name.toLowerCase().includes(q)
  );
  if (!matches.length) { dropdown.classList.add('hidden'); return; }
  dropdown.innerHTML = matches.map(m =>
    `<div class="attendee-option" data-pick-assignee="${escapeHtml(m.name)}">
      <span class="attendee-option-avatar" style="background:${memberColor(m.name)}">${escapeHtml(m.name[0])}</span>
      <div class="attendee-option-info">
        <span class="attendee-option-name">${escapeHtml(m.name)}</span>
        <span class="attendee-option-role">${escapeHtml(m.role)}</span>
      </div>
    </div>`
  ).join('');
  dropdown.classList.remove('hidden');
}

function saveMeeting(e) {
  e.preventDefault();
  const title     = document.getElementById('mSaveTitle').value.trim();
  const team      = document.getElementById('mSaveTeam').value;
  const type      = document.getElementById('mSaveType').value;
  const date      = document.getElementById('mSaveDate').value;
  const attendeeNames = _selectedAttendees.map(m => m.name);
  const attendees = attendeeNames.length || 1;
  const content   = document.getElementById('mSaveContent').value.trim();
  const duration  = document.getElementById('meetingSaveModal').dataset.duration || '00:00';
  if (!title) return;

  const actionRows = document.querySelectorAll('.action-item-input-row');
  const actionItems = [...actionRows].map((row, i) => ({
    id: `act-${Date.now()}-${i}`,
    text: row.querySelector('.action-item-text').value.trim(),
    dueDate: row.querySelector('.action-item-due').value,
    assignee: row.querySelector('.action-assignee-picker')?.dataset.selectedAssignee || '',
    done: false,
    addedToWeekly: false,
  })).filter(a => a.text);

  const newMeeting = {
    id: `mr-${Date.now()}`,
    team, type, title,
    summary: content || `${type} 회의가 진행되었습니다.`,
    aiPoints: content ? content.split('\n').filter(Boolean) : [`${title} 회의 진행 완료`],
    discussions: [],
    script: [],
    actionItems,
    date, author: state.currentUser.name,
    duration, attendees, attendeeNames,
  };
  state.meetings.unshift(newMeeting);
  closeMeetingSaveModal();
  renderCalendarPage();
}

// ─── Schedule Meeting Modal (회의 등록) ─────────────────────────────────────────

let _schedAttendees = []; // { id, name } 배열

function openScheduleMeetingModal() {
  _schedAttendees = [];
  document.getElementById('schedMeetTitle').value = '';
  document.getElementById('schedMeetDate').value = state.today;
  document.getElementById('schedMeetTime').value = '';
  document.getElementById('schedMeetType').selectedIndex = 0;
  document.getElementById('schedMeetRoom').selectedIndex = 0;
  document.getElementById('schedAttendeeSearch').value = '';
  document.getElementById('schedAttendeeChips').innerHTML = '';
  document.getElementById('schedAttendeeDropdown').classList.add('hidden');
  document.getElementById('scheduleMeetingModal').classList.remove('hidden');
}

function closeScheduleMeetingModal() {
  document.getElementById('scheduleMeetingModal').classList.add('hidden');
}

function renderSchedAttendeeChips() {
  const chips = document.getElementById('schedAttendeeChips');
  if (!chips) return;
  chips.innerHTML = _schedAttendees.map(m =>
    `<span class="attendee-chip">${escapeHtml(m.name)}<button type="button" class="attendee-chip-remove" data-remove-sched-attendee="${m.id}">✕</button></span>`
  ).join('');
}

function renderSchedAttendeeDropdown(query) {
  const dropdown = document.getElementById('schedAttendeeDropdown');
  if (!dropdown) return;
  const q = (query || '').toLowerCase();
  const selectedIds = new Set(_schedAttendees.map(m => m.id));
  const matches = state.teamMembers.filter(m =>
    !selectedIds.has(m.id) && (q === '' || m.name.toLowerCase().includes(q))
  );
  if (!matches.length) { dropdown.classList.add('hidden'); return; }
  dropdown.innerHTML = matches.map(m =>
    `<div class="attendee-option" data-select-sched-attendee="${m.id}" data-name="${escapeHtml(m.name)}">
      <span class="attendee-option-avatar" style="background:${memberColor(m.name)}">${escapeHtml(m.name[0])}</span>
      <div class="attendee-option-info">
        <span class="attendee-option-name">${escapeHtml(m.name)}</span>
        <span class="attendee-option-role">${escapeHtml(m.role)}</span>
      </div>
    </div>`
  ).join('');
  dropdown.classList.remove('hidden');
}

function saveScheduleMeeting(e) {
  e.preventDefault();
  const title = document.getElementById('schedMeetTitle').value.trim();
  const date  = document.getElementById('schedMeetDate').value;
  const time  = document.getElementById('schedMeetTime').value;
  const type  = document.getElementById('schedMeetType').value;
  const room  = document.getElementById('schedMeetRoom').value;
  if (!title || !date) return;

  const attendeeNames = _schedAttendees.map(m => m.name);
  const attendeeCount = attendeeNames.length || 1;
  // 참여자 = 등록자 + 선택한 참석자 (중복 제거)
  const participants = [state.currentUser.name, ...attendeeNames.filter(n => n !== state.currentUser.name)];

  // 회의 등록은 "예정(요청)" 상태 — 녹음으로 진행된 회의가 아니므로
  // 미팅룸 회의 목록(회의록)에는 추가하지 않는다.

  // 1) 참여자 이번 주 업무항목에 예정 회의 자동 배치
  state.workItems.push({
    id: `wi-mtg-${Date.now()}`,
    title, start: date, end: date, type: '회의',
    meetingType: type, meetingTime: time, room, scheduled: true,
    participants,
  });

  // 2) 참여자 알림 생성 (홈)
  addNotification('중요', '회의 등록 완료', `"${title}" 회의가 등록되었습니다. (참석자 ${attendeeCount}명)`);

  closeScheduleMeetingModal();
  renderWeeklyTasks();
  renderNotifications();
}

// ─── Meeting Detail Panel ──────────────────────────────────────────────────────

function openMeetingDetail(id) {
  state.meetingDetailId = id;
  state.meetingDetailTab = 'ai';
  const m = state.meetings.find(x => x.id === id);
  if (!m) return;
  const overlay = document.getElementById('meetingDetailOverlay');
  const panel   = document.getElementById('meetingDetailModal');
  overlay?.classList.remove('hidden');
  panel?.classList.remove('hidden');
  renderMeetingDetailPanel(m);
}

function closeMeetingDetail() {
  state.meetingDetailId = null;
  document.getElementById('meetingDetailOverlay')?.classList.add('hidden');
  document.getElementById('meetingDetailModal')?.classList.add('hidden');
}

function renderMeetingDetailPanel(m) {
  const tabs = [
    { key: 'ai',      label: 'AI 분석' },
    { key: 'script',  label: '스크립트' },
    { key: 'actions', label: '액션아이템' },
  ];
  const tabBar = document.getElementById('meetingDetailTabs');
  if (tabBar) {
    tabBar.innerHTML = tabs.map(t =>
      `<button class="meeting-detail-tab${state.meetingDetailTab === t.key ? ' active' : ''}"
        type="button" data-detail-tab="${t.key}">${t.label}</button>`
    ).join('');
  }

  const body = document.getElementById('meetingDetailContent');
  if (!body) return;

  if (state.meetingDetailTab === 'ai') {
    const points = (m.aiPoints || []).map(p =>
      `<li class="meeting-detail-list-item">${escapeHtml(p)}</li>`).join('');
    const discussions = (m.discussions || []).map(d =>
      `<li class="meeting-detail-list-item">${escapeHtml(d)}</li>`).join('');
    body.innerHTML = `
      <div class="meeting-detail-section">
        <div class="meeting-detail-section-title">주요 내용</div>
        <ul class="meeting-detail-list">${points || '<li class="meeting-detail-list-item muted">내용 없음</li>'}</ul>
      </div>
      ${discussions ? `<div class="meeting-detail-section">
        <div class="meeting-detail-section-title">주요 논의</div>
        <ul class="meeting-detail-list">${discussions}</ul>
      </div>` : ''}
    `;
  } else if (state.meetingDetailTab === 'script') {
    const lines = (m.script || []).map(s =>
      `<div class="script-line">
        <span class="script-time">${escapeHtml(s.time)}</span>
        <span class="script-speaker">${escapeHtml(s.speaker)}</span>
        <span class="script-text">${escapeHtml(s.text)}</span>
      </div>`
    ).join('');
    body.innerHTML = `<div class="meeting-script">${lines || '<p style="padding:16px;color:var(--muted)">스크립트 없음</p>'}</div>`;
  } else if (state.meetingDetailTab === 'actions') {
    const items = (m.actionItems || []).map(a => {
      const doneClass = a.done ? ' done' : '';
      const addedBadge = a.addedToWeekly ? '<span class="action-added-badge">추가됨</span>' : '';
      const isMyTask = (a.assignee || '') === (state.currentUser?.name || '');
      const addBtn = !a.addedToWeekly && isMyTask
        ? `<button class="action-add-btn" type="button" data-add-action="${a.id}" data-meeting-id="${m.id}">→ 추가</button>`
        : '';
      return `<div class="action-item-row${doneClass}">
        <span class="action-item-text-label">${escapeHtml(a.text)}</span>
        <span class="action-item-meta">${escapeHtml(a.assignee || '')}${a.dueDate ? ' · ' + a.dueDate : ''}</span>
        <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">${addedBadge}${addBtn}</div>
      </div>`;
    }).join('');
    body.innerHTML = `<div class="action-items-list">${items || '<p style="padding:16px;color:var(--muted)">액션아이템 없음</p>'}</div>`;
  }
}

// 내 액션아이템 '추가' → 업무요청 수락과 동일한 모달(업무항목 추가) 오픈
function openAcceptModalForAction(actId, meetingId) {
  const m = state.meetings.find(x => x.id === meetingId);
  if (!m) return;
  const a = (m.actionItems || []).find(x => x.id === actId);
  if (!a || a.addedToWeekly) return;

  state.selectedRequestId = null;
  state.selectedActionItem = { meetingId, actId };

  $('#acceptTitleDisplay').textContent = a.text;
  const typeEl = $('#acceptTypeDisplay');
  typeEl.textContent = '일반';
  typeEl.className = 'accept-info-type type-normal';
  let periodText = state.today;
  if (a.dueDate) {
    const lo = a.dueDate < state.today ? a.dueDate : state.today;
    const hi = a.dueDate < state.today ? state.today : a.dueDate;
    periodText = `${lo} ~ ${hi}`;
  }
  $('#acceptPeriodDisplay').textContent = periodText;
  $('#acceptStepsDisplay').innerHTML = '<span style="color:var(--muted)">—</span>';
  $('#acceptTodoDate').value = a.dueDate && a.dueDate >= state.today ? a.dueDate : state.today;

  $('#acceptModal').classList.remove('hidden');
}

// ─── Monthly Calendar Page ────────────────────────────────────────────────────

const CAL_MEMBER_FILTERS = ['전체', '나'];

const WORK_ITEM_TYPE_COLOR = {
  '고정': { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  '긴급': { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
  '일반': { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
};

const STATUS_COLOR = {
  '시작 전': { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  '진행 중': { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  '완료':    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  '보류':    { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
};

function memberColor(name) {
  const palette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  return palette[h % palette.length];
}

function avatarHtml(participants, max = 3) {
  if (!participants || !participants.length) return '';
  const visible = participants.slice(0, max);
  const overflow = participants.length - max;
  let html = '<div class="cal-avatars">';
  visible.forEach((name, i) => {
    html += `<span class="cal-avatar" style="background:${memberColor(name)};z-index:${max - i}" title="${escapeHtml(name)}">${escapeHtml(name[0])}</span>`;
  });
  if (overflow > 0) html += `<span class="cal-avatar cal-avatar-more">+${overflow}</span>`;
  html += '</div>';
  return html;
}

function getWorkItemStatus(wi) {
  const today = state.today;
  if (wi.type === '고정') return '진행 중';
  if (!wi.end) return '진행 중';
  if (wi.start > today) return '시작 전';
  if (wi.end < today) return '완료';
  return '진행 중';
}

function getWorkItemDates(wi) {
  if (!wi.start) return [];
  const dates = [];
  const end = wi.end || wi.start;
  const cur = new Date(wi.start + 'T00:00:00');
  const endD = new Date(end + 'T00:00:00');
  while (cur <= endD) {
    dates.push(_localISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getEventsForDayMine(dateStr) {
  const myName = state.currentUser.name;
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  const events = [];
  state.workItems.forEach(wi => {
    if (!wi.participants || !wi.participants.includes(myName)) return;
    if (wi.recurringDays) {
      // 반복 업무 (고정·일반·긴급 모두 포함)
      if (wi.recurringDays.includes(dow) && dateStr >= wi.start && (wi.end === null || dateStr <= wi.end)) {
        events.push({ id: wi.id, title: wi.title, type: wi.type, status: getWorkItemStatus(wi) });
      }
    } else {
      if (getWorkItemDates(wi).includes(dateStr)) {
        events.push({ id: wi.id, title: wi.title, type: wi.type, status: getWorkItemStatus(wi) });
      }
    }
  });
  return events;
}

function getEventsForDayAll(dateStr) {
  const events = [];
  state.workItems.forEach(wi => {
    if (wi.recurringDays) return; // 반복 업무 제외 (월간 전체와 동일)
    if (!wi.start) return;
    if (getWorkItemDates(wi).includes(dateStr)) {
      events.push({ id: wi.id, title: wi.title, type: wi.type, status: getWorkItemStatus(wi) });
    }
  });
  return events;
}

function getCalWeekStart() {
  const base = new Date(_now);
  base.setDate(base.getDate() - base.getDay() + state.calWeekOffset * 7);
  return base;
}

const PIN_ICON = `<svg class="cal-recur-pin" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>`;

function calRecurItemIcon(type) {
  if (type === '고정') return PIN_ICON;
  const color = type === '긴급' ? '#ef4444' : '#9ca3af';
  return `<span class="cal-recur-dot" style="background:${color}"></span>`;
}

function renderCalWeekView() {
  const base = getCalWeekStart();
  const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const dateStr = _localISO(d);
    return { dateStr, dow: DOW_KO[i], isToday: dateStr === state.today, isWeekend: i === 0 || i === 6 };
  });

  const weekStart = days[0].dateStr;
  const weekEnd = days[6].dateStr;
  $('#calMonthTitle').textContent = `${weekStart.slice(5,7)}.${weekStart.slice(8)} ~ ${weekEnd.slice(5,7)}.${weekEnd.slice(8)}`;

  // 각 요일 칸에 배치할 이벤트 목록 (인덱스 0~6)
  const eventsPerDay = Array.from({ length: 7 }, () => []);

  if (state.calMemberFilter === '나') {
    // 나: 비고정은 이번 주 첫 등장일 하루만, 고정은 반복 요일마다 표시 (월간 나와 동일)
    const myName = state.currentUser.name;
    // 비반복 업무 (spanning bar)
    state.workItems.forEach(wi => {
      if (wi.recurringDays) return;
      if (!wi.participants || !wi.participants.includes(myName)) return;
      if (!wi.start) return;
      const end = wi.end || wi.start;
      if (wi.start > weekEnd || end < weekStart) return;
      const firstDay = wi.start >= weekStart ? wi.start : weekStart;
      const dayIdx = days.findIndex(d => d.dateStr === firstDay);
      if (dayIdx === -1) return;
      const c = WORK_ITEM_TYPE_COLOR[wi.type] || WORK_ITEM_TYPE_COLOR['일반'];
      eventsPerDay[dayIdx].push({ id: wi.id, title: wi.title, color: c, isRecurring: false });
    });
    // 반복 업무 (dot list) — 고정·일반·긴급 모두 포함
    days.forEach(({ dateStr }, i) => {
      const dow = new Date(dateStr + 'T00:00:00').getDay();
      state.workItems.forEach(wi => {
        if (!wi.recurringDays) return;
        if (!wi.participants || !wi.participants.includes(myName)) return;
        if (wi.recurringDays.includes(dow) && dateStr >= wi.start && (wi.end === null || dateStr <= wi.end)) {
          eventsPerDay[i].push({ id: wi.id, title: wi.title, type: wi.type, isRecurring: true });
        }
      });
    });
  } else {
    // 전체: 비반복 업무만, 이번 주 첫 등장일 하루만 표시
    state.workItems.forEach(wi => {
      if (wi.recurringDays) return;
      if (!wi.start) return;
      const end = wi.end || wi.start;
      if (wi.start > weekEnd || end < weekStart) return;
      const firstDay = wi.start >= weekStart ? wi.start : weekStart;
      const dayIdx = days.findIndex(d => d.dateStr === firstDay);
      if (dayIdx === -1) return;
      const c = STATUS_COLOR[getWorkItemStatus(wi)] || STATUS_COLOR['시작 전'];
      eventsPerDay[dayIdx].push({ id: wi.id, title: wi.title, color: c, isRecurring: false });
    });
  }

  let html = '<div class="cal-week-view">';
  days.forEach(({ dateStr, dow, isToday, isWeekend }, i) => {
    const events = eventsPerDay[i];
    const dateLabel = `${parseInt(dateStr.slice(5,7))}/${parseInt(dateStr.slice(8))}`;
    const colCls = ['cal-wv-col', isWeekend && 'weekend', isToday && 'today'].filter(Boolean).join(' ');
    const dowCls = ['cal-wv-dow', dow === '일' && 'sun', dow === '토' && 'sat'].filter(Boolean).join(' ');
    html += `
      <div class="${colCls}">
        <div class="cal-wv-header">
          <span class="${dowCls}">${dow}</span>
          <span class="cal-wv-date${isToday ? ' today-num' : ''}">${dateLabel}</span>
        </div>
        <div class="cal-wv-events">
          ${events.map(ev => {
            if (ev.isRecurring) {
              const wi = state.workItems.find(w => w.id === ev.id);
              const done = wi && getWorkItemStatus(wi) === '완료';
              return `<div class="cal-recur-item cal-recur-item-wv" title="${escapeHtml(ev.title)}">${calRecurItemIcon(ev.type)}<span class="cal-recur-label${done ? ' done' : ''}">${escapeHtml(ev.title)}</span></div>`;
            }
            return `<div class="cal-wv-event" data-cal-event="${ev.id}" style="background:${ev.color.bg};color:${ev.color.text};border-left:3px solid ${ev.color.text}" title="${escapeHtml(ev.title)}">${escapeHtml(ev.title)}</div>`;
          }).join('')}
        </div>
      </div>`;
  });
  html += '</div>';
  $('#calGridBody').innerHTML = html;
}

function renderCalControls() {
  $('#calStatusTabs').innerHTML = `
    <div class="cal-member-tabs">
      <button class="cal-member-tab${state.calMemberFilter === '전체' ? ' active' : ''}" type="button" data-cal-member="전체">전체</button>
      <button class="cal-member-tab${state.calMemberFilter === '나' ? ' active' : ''}" type="button" data-cal-member="나">나</button>
    </div>
    <div class="cal-view-toggle">
      <button class="cal-view-btn${state.calViewMode === 'monthly' ? ' active' : ''}" type="button" data-cal-view="monthly">월간</button>
      <button class="cal-view-btn${state.calViewMode === 'weekly' ? ' active' : ''}" type="button" data-cal-view="weekly">주간</button>
    </div>`;
}

function buildCalCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ dateStr: _localISO(new Date(year, month, 1 - (firstDow - i))), inMonth: false });
  }
  for (let day = 1; day <= lastDate; day++) {
    cells.push({
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      inMonth: true,
    });
  }
  let extra = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ dateStr: _localISO(new Date(year, month + 1, extra++)), inMonth: false });
  }
  return cells;
}

function renderCalMonthGridAll(cells) {
  const COL_W = 100 / 7;
  const BLOCK_TOP = 30;
  const BLOCK_H = 34;
  const BLOCK_GAP = 3;
  const MAX_LANES = 3;
  let html = '';

  for (let row = 0; row < cells.length / 7; row++) {
    const week = cells.slice(row * 7, row * 7 + 7);
    const weekStart = week[0].dateStr;
    const weekEnd = week[6].dateStr;

    // Gather non-recurring items overlapping this week
    const items = [];
    state.workItems.forEach(wi => {
      if (wi.recurringDays) return;
      if (!wi.start) return;
      const end = wi.end || wi.start;
      if (wi.start > weekEnd || end < weekStart) return;

      let cs = week.findIndex(c => c.dateStr === wi.start);
      let ce = week.findIndex(c => c.dateStr === end);
      if (cs === -1) cs = wi.start < weekStart ? 0 : -1;
      if (ce === -1) ce = end > weekEnd ? 6 : -1;
      if (cs === -1 || ce === -1 || cs > ce) return;
      items.push({ wi, cs, ce, isStart: wi.start >= weekStart, isEnd: end <= weekEnd });
    });

    // Lane assignment (greedy)
    const laneEnds = [];
    const placed = items.map(item => {
      let lane = laneEnds.findIndex(e => e < item.cs);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(item.ce); }
      else laneEnds[lane] = item.ce;
      return { ...item, lane };
    });

    const usedLanes = Math.min(placed.reduce((m, i) => Math.max(m, i.lane + 1), 0), MAX_LANES);
    const rowH = BLOCK_TOP + usedLanes * (BLOCK_H + BLOCK_GAP) + 10;

    html += `<div class="cal-week-row cal-week-row-all" style="min-height:${rowH}px">`;

    // Day cells (background + day number only)
    week.forEach((cell, col) => {
      const isToday = cell.dateStr === state.today;
      const isWeekend = col === 0 || col === 6;
      const dayNum = parseInt(cell.dateStr.slice(8), 10);
      const cls = ['cal-day-cell'];
      if (!cell.inMonth) cls.push('out-month');
      if (isToday) cls.push('today');
      if (isWeekend) cls.push('weekend');
      html += `<div class="${cls.join(' ')}"><span class="cal-day-num${isToday ? ' today-num' : ''}">${dayNum}</span></div>`;
    });

    // Spanning blocks
    placed.forEach(({ wi, cs, ce, isStart, isEnd, lane }) => {
      if (lane >= MAX_LANES) return;
      const left = cs * COL_W;
      const width = (ce - cs + 1) * COL_W;
      const top = BLOCK_TOP + lane * (BLOCK_H + BLOCK_GAP);
      const status = getWorkItemStatus(wi);
      const c = STATUS_COLOR[status] || STATUS_COLOR['시작 전'];
      const br = `${isStart ? '4px' : '0'} ${isEnd ? '4px' : '0'} ${isEnd ? '4px' : '0'} ${isStart ? '4px' : '0'}`;
      const borderL = isStart ? `3px solid ${c.text}` : 'none';
      html += `<div class="cal-span-block" style="left:calc(${left}% + 2px);width:calc(${width}% - 4px);top:${top}px;height:${BLOCK_H}px;background:${c.bg};color:${c.text};border-left:${borderL};border-radius:${br}" data-cal-event="${wi.id}" title="${escapeHtml(wi.title)}">
        <span class="cal-span-title">${escapeHtml(wi.title)}</span>
        ${avatarHtml(wi.participants)}
      </div>`;
    });

    html += '</div>';
  }
  $('#calGridBody').innerHTML = html;
}

function renderCalMonthGridMine(cells) {
  const myName = state.currentUser.name;
  const COL_W = 100 / 7;
  const BLOCK_TOP = 30;
  const BLOCK_H = 22;
  const BLOCK_GAP = 3;
  const MAX_LANES = 3;
  let html = '';

  for (let row = 0; row < cells.length / 7; row++) {
    const week = cells.slice(row * 7, row * 7 + 7);
    const weekStart = week[0].dateStr;
    const weekEnd = week[6].dateStr;

    // Spanning bars for non-recurring items I'm participating in
    const items = [];
    state.workItems.forEach(wi => {
      if (wi.recurringDays) return;
      if (!wi.participants || !wi.participants.includes(myName)) return;
      if (!wi.start) return;
      const end = wi.end || wi.start;
      if (wi.start > weekEnd || end < weekStart) return;

      let cs = week.findIndex(c => c.dateStr === wi.start);
      let ce = week.findIndex(c => c.dateStr === end);
      if (cs === -1) cs = wi.start < weekStart ? 0 : -1;
      if (ce === -1) ce = end > weekEnd ? 6 : -1;
      if (cs === -1 || ce === -1 || cs > ce) return;
      items.push({ wi, cs, ce, isStart: wi.start >= weekStart, isEnd: end <= weekEnd });
    });

    // Lane assignment
    const laneEnds = [];
    const placed = items.map(item => {
      let lane = laneEnds.findIndex(e => e < item.cs);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(item.ce); }
      else laneEnds[lane] = item.ce;
      return { ...item, lane };
    });

    // Recurring dot items per day (고정·일반·긴급 모두)
    const recurByCol = Array.from({ length: 7 }, () => []);
    week.forEach((cell, col) => {
      if (!cell.inMonth) return;
      const dow = new Date(cell.dateStr + 'T00:00:00').getDay();
      state.workItems.forEach(wi => {
        if (!wi.recurringDays) return;
        if (!wi.participants || !wi.participants.includes(myName)) return;
        if (wi.recurringDays.includes(dow) && cell.dateStr >= wi.start && (wi.end === null || cell.dateStr <= wi.end)) {
          recurByCol[col].push(wi);
        }
      });
    });

    const usedLanes = Math.min(placed.reduce((m, i) => Math.max(m, i.lane + 1), 0), MAX_LANES);
    const maxRecur = recurByCol.reduce((m, arr) => Math.max(m, arr.length), 0);
    const rowH = BLOCK_TOP + usedLanes * (BLOCK_H + BLOCK_GAP) + maxRecur * 18 + 10;

    html += `<div class="cal-week-row cal-week-row-all" style="min-height:${rowH}px">`;

    // Day cells
    week.forEach((cell, col) => {
      const isToday = cell.dateStr === state.today;
      const isWeekend = col === 0 || col === 6;
      const dayNum = parseInt(cell.dateStr.slice(8), 10);
      const cls = ['cal-day-cell'];
      if (!cell.inMonth) cls.push('out-month');
      if (isToday) cls.push('today');
      if (isWeekend) cls.push('weekend');
      html += `<div class="${cls.join(' ')}"><span class="cal-day-num${isToday ? ' today-num' : ''}">${dayNum}</span></div>`;
    });

    // Spanning bars
    placed.forEach(({ wi, cs, ce, isStart, isEnd, lane }) => {
      if (lane >= MAX_LANES) return;
      const left = cs * COL_W;
      const width = (ce - cs + 1) * COL_W;
      const top = BLOCK_TOP + lane * (BLOCK_H + BLOCK_GAP);
      const c = WORK_ITEM_TYPE_COLOR[wi.type] || WORK_ITEM_TYPE_COLOR['일반'];
      const br = `${isStart ? '4px' : '0'} ${isEnd ? '4px' : '0'} ${isEnd ? '4px' : '0'} ${isStart ? '4px' : '0'}`;
      const borderL = isStart ? `3px solid ${c.text}` : 'none';
      html += `<div class="cal-span-block" style="left:calc(${left}% + 2px);width:calc(${width}% - 4px);top:${top}px;height:${BLOCK_H}px;background:${c.bg};color:${c.text};border-left:${borderL};border-radius:${br}" data-cal-event="${wi.id}" title="${escapeHtml(wi.title)}">
        <span class="cal-span-title">${escapeHtml(wi.title)}</span>
      </div>`;
    });

    // Recurring items — dot + muted text style (세부항목)
    const recurTop = BLOCK_TOP + usedLanes * (BLOCK_H + BLOCK_GAP) + 4;
    recurByCol.forEach((wis, col) => {
      wis.forEach((wi, idx) => {
        const left = col * COL_W;
        const done = getWorkItemStatus(wi) === '완료';
        html += `<div class="cal-recur-item" style="left:calc(${left}% + 2px);width:calc(${COL_W}% - 4px);top:${recurTop + idx * 18}px" title="${escapeHtml(wi.title)}">${calRecurItemIcon(wi.type)}<span class="cal-recur-label${done ? ' done' : ''}">${escapeHtml(wi.title)}</span></div>`;
      });
    });

    html += '</div>';
  }
  $('#calGridBody').innerHTML = html;
}

function renderCalMonthGrid() {
  const { calYear: year, calMonth: month } = state;
  $('#calMonthTitle').textContent = `${year}년 ${month + 1}월`;
  const cells = buildCalCells(year, month);
  if (state.calMemberFilter === '나') {
    renderCalMonthGridMine(cells);
  } else {
    renderCalMonthGridAll(cells);
  }
}

// renders just the grid body (not controls)
function renderCalGrid() {
  if (state.calViewMode === 'weekly') {
    $('#calDowRow')?.classList.add('hidden');
    $('#calGridBody')?.classList.add('cal-grid-body-weekly');
    renderCalWeekView();
  } else {
    $('#calDowRow')?.classList.remove('hidden');
    $('#calGridBody')?.classList.remove('cal-grid-body-weekly');
    renderCalMonthGrid();
  }
}

function renderCalPage() {
  renderCalControls();
  renderCalGrid();
}

function renderCalDetailBody(workItemId) {
  const wi = state.workItems.find(x => x.id === workItemId);
  if (!wi) return;
  const status = getWorkItemStatus(wi);
  const c = WORK_ITEM_TYPE_COLOR[wi.type] || WORK_ITEM_TYPE_COLOR['일반'];
  const sc = { '진행 중': '#2563eb', '완료': '#10b981', '시작 전': '#9ca3af', '보류': '#f59e0b' }[status] || '#6b7280';
  const wiSessions = state.sessions.filter(s => s.workItemId === workItemId);
  const done = wiSessions.filter(s => s.done).length;
  const total = wiSessions.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const startFmt = wi.start ? `${wi.start.slice(0,4)}.${wi.start.slice(5,7)}.${wi.start.slice(8)}` : '-';
  const endFmt = wi.end
    ? `${wi.end.slice(0,4)}.${wi.end.slice(5,7)}.${wi.end.slice(8)}`
    : wi.type === '고정' ? '무기한' : '-';
  const DAY_MAP = ['일','월','화','수','목','금','토'];
  const recurStr = wi.recurringDays
    ? '매주 ' + wi.recurringDays.map(d => DAY_MAP[d] || '').join('·') : '';

  // ── Sessions grouped by participant ────────────────────────────────────────
  const participants = wi.participants || [];
  const groups = participants.map(name => ({
    name,
    sessions: wiSessions.filter(s => s.authorName === name),
  }));
  // append authors not in participants list
  wiSessions.forEach(s => {
    if (!participants.includes(s.authorName) && !groups.find(g => g.name === s.authorName)) {
      groups.push({ name: s.authorName, sessions: wiSessions.filter(x => x.authorName === s.authorName) });
    }
  });

  const CAT_CLASS_MAP = { '디자인': 'cat-design', '기획': 'cat-plan', '개발': 'cat-dev', '운영': 'cat-ops', '리서치': 'cat-research', '퍼블리싱': 'cat-publish' };

  const sessionsHtml = `
    <div class="cal-detail-section">
      <div class="cal-detail-section-title">작업세션 <span class="cal-section-count">${done}/${total}</span></div>
      ${groups.length === 0 ? '<div class="cal-detail-empty">세션 없음</div>' :
        groups.map(({ name, sessions }) => `
          <div class="cal-participant-group">
            <div class="cal-participant-header">
              <span class="cal-participant-avatar" style="background:${memberColor(name)}">${escapeHtml(name[0])}</span>
              <span class="cal-participant-name">${escapeHtml(name)}</span>
              <span class="cal-participant-count">${sessions.length}개</span>
            </div>
            ${sessions.length === 0
              ? '<div class="cal-participant-empty">작업 내역 없음</div>'
              : sessions.map(s => `
                <div class="cal-detail-session-row">
                  <span class="cal-detail-session-dot${s.done ? ' done' : ''}"></span>
                  <span class="cal-detail-session-title${s.done ? ' done' : ''}">${escapeHtml(s.title)}</span>
                  <span class="session-cat ${CAT_CLASS_MAP[s.category] || ''}">${escapeHtml(s.category)}</span>
                  ${s.startTime ? `<span class="cal-detail-session-time">${s.startTime}~${s.endTime}</span>` : ''}
                </div>`).join('')
            }
          </div>`).join('')
      }
    </div>`;

  // ── Resources ──────────────────────────────────────────────────────────────
  const resources = state.workItemResources[workItemId] || [];
  const myName = state.currentUser.name;

  const resourcesHtml = `
    <div class="cal-detail-section cal-resources-section">
      <div class="cal-detail-section-title">아웃풋 / 리소스</div>
      ${resources.length === 0 ? '<div class="cal-detail-empty">등록된 리소스가 없습니다</div>' : ''}
      ${resources.map(r => {
        const canDelete = r.uploadedBy === myName;
        return `
          <div class="cal-resource-row">
            <span class="cal-resource-icon">${r.type === '링크' ? '🔗' : '📁'}</span>
            <div class="cal-resource-info">
              <span class="cal-resource-name">${escapeHtml(r.name)}</span>
              <span class="cal-resource-uploader">by ${escapeHtml(r.uploadedBy)}</span>
            </div>
            ${canDelete ? `<button class="cal-resource-remove" type="button" data-rm-res="${r.id}" data-wi-id="${workItemId}" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>` : '<span class="cal-resource-remove-placeholder"></span>'}
          </div>`;
      }).join('')}
      <div class="cal-res-inputs">
        <div class="cal-res-input-row">
          <span class="cal-res-input-icon">🔗</span>
          <input class="cal-resource-input" id="calResLinkInput" type="url" placeholder="링크 URL 입력" autocomplete="off" />
          <button class="cal-res-add-btn" type="button" data-add-link="${workItemId}">추가</button>
        </div>
        <div class="cal-res-input-row">
          <span class="cal-res-input-icon">📁</span>
          <input class="cal-resource-file-input" id="calResFileInput" type="file" />
          <button class="cal-res-add-btn" type="button" data-add-file="${workItemId}">업로드</button>
        </div>
      </div>
    </div>`;

  $('#calEventDetailBody').innerHTML = `
    <div class="cal-detail-title">${escapeHtml(wi.title)}</div>
    <div class="cal-detail-tags">
      <span class="cal-detail-tag" style="background:${c.bg};color:${c.text};border:1px solid ${c.border}">${wi.type}</span>
      <span class="cal-detail-tag" style="background:${sc}1a;color:${sc}">${status}</span>
    </div>
    <div class="cal-detail-section">
      <div class="cal-detail-section-title">프로젝트 상세</div>
      <div class="cal-detail-row"><span class="cal-detail-key">시작일</span><span>${startFmt}</span></div>
      <div class="cal-detail-row"><span class="cal-detail-key">마감일</span><span>${endFmt}</span></div>
      ${recurStr ? `<div class="cal-detail-row"><span class="cal-detail-key">반복</span><span>${recurStr}</span></div>` : ''}
      <div class="cal-detail-row"><span class="cal-detail-key">참여자</span><span>${(wi.participants || []).join(', ') || '-'}</span></div>
    </div>
    <div class="cal-detail-section">
      <div class="cal-detail-section-title">진행률</div>
      <div class="cal-detail-progress-row">
        <div class="cal-detail-progress-bar"><div class="cal-detail-progress-fill" style="width:${pct}%"></div></div>
        <span class="cal-detail-progress-pct">${pct}%</span>
      </div>
    </div>
    ${wi.description ? `<div class="cal-detail-section"><div class="cal-detail-section-title">설명</div><div class="cal-detail-desc">${escapeHtml(wi.description)}</div></div>` : ''}
    ${sessionsHtml}
    ${resourcesHtml}
  `;

  if (state.calResourceFormOpen === workItemId) {
    setTimeout(() => document.getElementById('calResName')?.focus(), 50);
  }
}

function openCalEventDetail(workItemId) {
  const wi = state.workItems.find(x => x.id === workItemId);
  if (!wi) return;
  state.calSelectedEventId = workItemId;
  renderCalDetailBody(workItemId);
  $('#calEventDetail').classList.remove('hidden');
}

function closeCalEventDetail() {
  state.calSelectedEventId = null;
  $('#calEventDetail').classList.add('hidden');
}


// ─── Drawer ──────────────────────────────────────────────────────────────────

function getVisibleDays() {
  const start = addDays(BASE_WEEK_START, state.weekOffset * 7);
  return [0, 1, 2, 3, 4].map(i => {
    const date = addDays(start, i);
    return { date, label: '월화수목금'[i] };
  });
}

function createTaskEntry(dayDate, dayIdx = 0) {
  return { id: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`, title: '', start: dayDate, end: dayDate, type: '일반', recurringDays: [dayIdx + 1], memo: '' };
}

function initDrawerTasks() {
  const days = getVisibleDays();
  state.drawerDayTasks = days.map((d, i) => [createTaskEntry(d.date, i)]);
  state.drawerActiveDay = 0;
}

function renderDrawerBody() {
  const days = getVisibleDays();
  const ai = state.drawerActiveDay;
  const tasks = state.drawerDayTasks[ai] || [];
  const trashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`;
  const plusSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>`;

  const tabsHtml = days.map((d, i) =>
    `<button type="button" class="dw-tab${i === ai ? ' is-active' : ''}" data-drawer-day="${i}">${d.label}</button>`
  ).join('');

  const DAY_LABELS = ['월', '화', '수', '목', '금'];
  const entriesHtml = tasks.map((task, ti) => {
    const isFixed = task.type === '고정';
    const rd = task.recurringDays || [ai + 1];
    const datesRowHtml = isFixed
      ? `<div class="dw-field-2col">
          <label class="dw-field"><span>시작일</span>
            <input type="date" data-task-key="${ai}:${ti}" data-task-field="start" value="${task.start}" />
          </label>
          <label class="dw-field"><span>종료일 <span class="dw-field-optional">미입력 시 무기한</span></span>
            <input type="date" data-task-key="${ai}:${ti}" data-task-field="end" value="${task.end || ''}" />
          </label>
        </div>
        <div class="dw-field">
          <span>반복 요일</span>
          <div class="dw-day-picker">
            ${DAY_LABELS.map((lbl, idx) => {
              const dn = idx + 1;
              return `<button type="button" class="dw-day-btn${rd.includes(dn) ? ' is-active' : ''}" data-recurring-day="${ai}:${ti}:${dn}">${lbl}</button>`;
            }).join('')}
          </div>
        </div>`
      : `<div class="dw-field-2col">
          <label class="dw-field"><span>시작일</span>
            <input type="date" data-task-key="${ai}:${ti}" data-task-field="start" value="${task.start}" />
          </label>
          <label class="dw-field"><span>마감일</span>
            <input type="date" data-task-key="${ai}:${ti}" data-task-field="end" value="${task.end}" />
          </label>
        </div>`;
    return `
    <div class="dw-entry">
      <div class="dw-entry-hd">
        <span class="dw-entry-num">#${String(ti + 1).padStart(2, '0')}</span>
        <button type="button" class="dw-entry-del" data-remove-task="${ai}:${ti}" title="삭제">${trashSvg}</button>
      </div>
      <label class="dw-field"><span>프로젝트명</span>
        <input type="text" data-task-key="${ai}:${ti}" data-task-field="title" value="${escapeHtml(task.title)}" placeholder="업무명을 입력하세요" />
      </label>
      ${datesRowHtml}
      <label class="dw-field"><span>업무유형</span>
        <select data-task-key="${ai}:${ti}" data-task-field="type">
          <option value="일반" ${task.type === '일반' ? 'selected' : ''}>일반</option>
          <option value="긴급" ${task.type === '긴급' ? 'selected' : ''}>긴급</option>
          <option value="고정" ${task.type === '고정' ? 'selected' : ''}>고정</option>
        </select>
      </label>
      <label class="dw-field"><span>메모</span>
        <textarea data-task-key="${ai}:${ti}" data-task-field="memo" placeholder="메모를 입력하세요" rows="3">${escapeHtml(task.memo)}</textarea>
      </label>
    </div>
  `;
  }).join('');

  $('#drawerBody').innerHTML = `
    <div class="dw-body">
      <div class="dw-tabs">${tabsHtml}</div>
      <div class="dw-entries">
        ${entriesHtml}
        <button type="button" class="dw-add" data-add-task-day="${ai}">${plusSvg} 업무 추가</button>
      </div>
      <button type="button" class="dw-save" id="saveDrawerBtn">저장하기</button>
    </div>
  `;
}

function openDrawer() {
  initDrawerTasks();
  renderDrawerBody();
  $('#taskDrawer').classList.remove('hidden');
}

function closeDrawer() { $('#taskDrawer').classList.add('hidden'); }

function saveDrawerTasks() {
  const newItems = [];
  state.drawerDayTasks.forEach((tasks, dayIdx) => {
    tasks.forEach(task => {
      if (!task.title.trim()) return;
      const item = {
        id: `wi-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: task.title.trim(),
        description: task.memo.trim(),
        start: task.start,
        end: task.type === '고정' ? (task.end || null) : (task.end || task.start),
        type: task.type,
        participants: [state.currentUser.name],
      };
      if (task.type === '고정') item.recurringDays = task.recurringDays && task.recurringDays.length ? [...task.recurringDays] : [dayIdx + 1];
      newItems.push(item);
    });
  });
  if (!newItems.length) return;
  state.workItems.push(...newItems);
  state.selectedTaskId = newItems[0].id;
  closeDrawer();
  renderAll();
}

function updateTaskField(key, field, value) {
  const [di, ti] = key.split(':').map(Number);
  const task = state.drawerDayTasks?.[di]?.[ti];
  if (task) task[field] = value;
}

function addTaskEntry(dayIdx) {
  const days = getVisibleDays();
  state.drawerDayTasks[dayIdx].push(createTaskEntry(days[dayIdx].date, dayIdx));
  renderDrawerBody();
}

function removeTaskEntry(key) {
  const [di, ti] = key.split(':').map(Number);
  if (state.drawerDayTasks[di].length <= 1) return;
  state.drawerDayTasks[di] = state.drawerDayTasks[di].filter((_, i) => i !== ti);
  renderDrawerBody();
}

// ─── Session Modal ────────────────────────────────────────────────────────────

function openSessionModal() {
  populateSessionWorkItemSelect();
  $('#sessionTitle').value = '';
  $('#sessionModal').classList.remove('hidden');
  setTimeout(() => $('#sessionTitle').focus(), 50);
}

function closeSessionModal() { $('#sessionModal').classList.add('hidden'); }

function createSessionFromModal(e) {
  e.preventDefault();
  const workItemId = $('#sessionWorkItem').value;
  const category  = $('#sessionCategory').value;
  const title     = $('#sessionTitle').value.trim();
  const startTime = $('#sessionStart').value;
  const endTime   = $('#sessionEnd').value;
  if (!workItemId || !title) return;

  state.sessions.push({
    id: `ws-${Date.now()}`,
    workItemId,
    authorId: state.currentUser.id,
    authorName: state.currentUser.name,
    date: state.today,
    category,
    title,
    startTime,
    endTime,
    done: false,
  });

  state.selectedTaskId = workItemId;
  closeSessionModal();
  renderAll();
}

// ─── Request Modal ────────────────────────────────────────────────────────────

function openRequestModal(requestId) {
  const r = state.requests.find(x => x.id === requestId);
  if (!r) return;
  state.selectedRequestId = r.id;
  $('#requestDetail').innerHTML = `
    <div class="form-stack">
      <div>
        <h3 style="font-size:15px;margin-bottom:8px">${escapeHtml(r.title)}</h3>
        <p style="font-size:13px;color:#6b7280;line-height:1.5">${escapeHtml(r.detail)}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:#6b7280">
        <span>요청자: ${escapeHtml(r.requester)} / ${escapeHtml(r.requestTeam)}</span>
        <span>전달팀: ${escapeHtml(r.deliveryTeam)}</span>
        <span>기간: ${r.start} ~ ${r.end}</span>
        <span>상태: ${r.status}</span>
      </div>
      ${r.status === '수락 대기' ? `
        <div class="btn-row">
          <button class="secondary-btn" type="button" data-reject-request="${r.id}">거절</button>
          <button class="dark-btn" type="button" data-accept-request="${r.id}">수락</button>
        </div>` : ''}
    </div>
  `;
  $('#requestModal').classList.remove('hidden');
}

function closeRequestModal() { $('#requestModal').classList.add('hidden'); }

function acceptRequest(id) {
  openAcceptModal(id);
}

function openAcceptModal(requestId) {
  const r = state.requests.find(x => x.id === requestId);
  if (!r) return;
  state.selectedRequestId = requestId;
  state.selectedActionItem = null;

  // 업무항목명 & 유형 & 기간 표시
  $('#acceptTitleDisplay').textContent = r.title;
  const typeEl = $('#acceptTypeDisplay');
  typeEl.textContent = r.priority === '긴급' ? '긴급' : '일반';
  typeEl.className = 'accept-info-type ' + (r.priority === '긴급' ? 'type-urgent' : 'type-normal');
  $('#acceptPeriodDisplay').textContent = `${r.start} ~ ${r.end}`;

  // 작업 단계 표시
  const stepsEl = $('#acceptStepsDisplay');
  if (r.selectedSteps && r.selectedSteps.length) {
    stepsEl.innerHTML = r.selectedSteps.map(s => {
      return `<span class="accept-step-chip">${escapeHtml(s.title)}</span>`;
    }).join('');
  } else {
    stepsEl.innerHTML = '<span style="color:var(--muted)">—</span>';
  }

  // 작업 날짜 기본값: 오늘
  $('#acceptTodoDate').value = state.today;

  $('#acceptModal').classList.remove('hidden');
}

function closeAcceptModal() {
  $('#acceptModal').classList.add('hidden');
}

function submitAcceptForm(e) {
  e.preventDefault();

  // 회의 액션아이템 기반 추가
  if (state.selectedActionItem) {
    const { meetingId, actId } = state.selectedActionItem;
    const m = state.meetings.find(x => x.id === meetingId);
    const a = m && (m.actionItems || []).find(x => x.id === actId);
    if (!a) { closeAcceptModal(); return; }

    const todoDate = $('#acceptTodoDate').value || state.today;
    const start = todoDate;
    const end   = a.dueDate && a.dueDate > todoDate ? a.dueDate : todoDate;

    state.workItems.push({
      id: `wi-act-${Date.now()}`,
      title: a.text,
      description: `[${m.title}] 액션아이템`,
      start, end,
      type: '일반',
      participants: [state.currentUser.name],
      sourceMeetingId: meetingId,
      sourceActionId: actId,
    });
    a.addedToWeekly = true;

    const todayDiff = Math.floor((toDate(state.today) - toDate(BASE_WEEK_START)) / (1000 * 60 * 60 * 24));
    state.weekOffset = Math.floor(todayDiff / 7);

    addNotification('중요', '업무항목 추가', `"${a.text}" 업무항목이 이번 주 업무에 추가되었습니다.`, a.text);
    state.selectedActionItem = null;
    closeAcceptModal();
    renderAll();
    renderMeetingDetailPanel(m);
    return;
  }

  const r = state.requests.find(x => x.id === state.selectedRequestId);
  if (!r) return;

  const title = r.title;
  const type  = r.priority === '긴급' ? '긴급' : '일반';
  const todoDate = $('#acceptTodoDate').value;
  const start = todoDate < r.start ? todoDate : r.start;
  const end   = todoDate > r.end ? todoDate : r.end;

  const arItem = state.assignmentRequests.find(a => a.processId === r.processId && a.title.includes(r.title.split(' ')[0]));

  // assignmentRequest에서 참여자 및 단계별 담당자 가져오기
  const arAssignees = arItem && arItem.assignees ? arItem.assignees : [];
  const allParticipants = [state.currentUser.name, ...arAssignees.filter(a => a !== state.currentUser.name)];
  const arStepAssignees = arItem && arItem.stepAssignees ? arItem.stepAssignees : {};

  const newItem = {
    id: `wi-${Date.now()}`,
    title,
    start,
    end,
    type,
    participants: allParticipants,
    sourceRequestId: r.id,
    processId: r.processId || null,
    stepAssignees: arStepAssignees,
  };

  state.workItems.push(newItem);
  state.selectedTaskId = newItem.id;
  r.status = '수락';

  // 선택된 작업 단계들을 오늘할일(세션)에 자동 추가
  if (r.selectedSteps && r.selectedSteps.length && todoDate) {
    r.selectedSteps.forEach((step, i) => {
      const newSession = {
        id: `ws-${Date.now()}-${i}`,
        workItemId: newItem.id,
        stepId: step.stepId,
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        date: todoDate,
        category: step.role,
        title: step.title,
        startTime: '',
        endTime: '',
        done: false,
      };
      state.sessions.push(newSession);
    });
  }

  // 오늘이 포함된 주로 뷰 유지 (수락한 업무가 이번주에 보이도록)
  const todayDiff = Math.floor((toDate(state.today) - toDate(BASE_WEEK_START)) / (1000 * 60 * 60 * 24));
  state.weekOffset = Math.floor(todayDiff / 7);

  addNotification('중요', '업무항목 추가', `"${title}" 업무항목이 이번 주 업무에 추가되었습니다.`, title);
  closeAcceptModal();
  closeRequestModal();
  renderAll();
}

function openRejectModal(id) {
  state.selectedRequestId = id;
  $('#rejectReasons').innerHTML = REJECT_REASONS.map((reason, i) => `
    <label>
      <input type="radio" name="rejectReason" value="${reason}" ${i === 0 ? 'checked' : ''} />
      ${reason}
    </label>
  `).join('');
  $('#rejectDetail').value = '';
  $('#rejectModal').classList.remove('hidden');
}

function closeRejectModal() { $('#rejectModal').classList.add('hidden'); }

function rejectRequest(reason, detail) {
  const r = state.requests.find(x => x.id === state.selectedRequestId);
  if (!r) return;
  r.status = '거절';
  r.rejectReason = reason;
  r.rejectDetail = detail;
  r.rejectedAt = state.today;
  addNotification('중요', '업무요청 거절', `${r.title} 요청을 거절했습니다.`, r.title);
  closeRejectModal();
  closeRequestModal();
  renderAll();
}

// ─── Session Actions ─────────────────────────────────────────────────────────

function toggleSession(id) {
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;
  s.done = !s.done;
  renderAll();
}

function requestDelete(id) {
  state.pendingDeleteSessionId = id;
  state.pendingDeleteWorkItemId = null;
  $('#deleteModalDesc').textContent = '삭제된 작업세션은 복구할 수 없습니다.';
  $('#deleteModal').classList.remove('hidden');
}

function requestDeleteWorkItem(id) {
  state.pendingDeleteWorkItemId = id;
  state.pendingDeleteSessionId = null;
  $('#deleteModalDesc').textContent = '업무항목과 관련된 모든 세션이 삭제됩니다.';
  $('#deleteModal').classList.remove('hidden');
}

function confirmDelete() {
  if (state.pendingDeleteResourceId) {
    const wiId = state.pendingDeleteResourceWiId;
    if (state.workItemResources[wiId]) {
      state.workItemResources[wiId] = state.workItemResources[wiId].filter(r => r.id !== state.pendingDeleteResourceId);
    }
    state.pendingDeleteResourceId = null;
    state.pendingDeleteResourceWiId = null;
    $('#deleteModal').classList.add('hidden');
    renderCalDetailBody(state.calSelectedEventId);
    return;
  }
  if (state.pendingDeleteWorkItemId) {
    const wid = state.pendingDeleteWorkItemId;
    state.sessions = state.sessions.filter(x => x.workItemId !== wid);
    state.workItems = state.workItems.filter(x => x.id !== wid);
    state.pendingDeleteWorkItemId = null;
  } else {
    state.sessions = state.sessions.filter(x => x.id !== state.pendingDeleteSessionId);
    state.pendingDeleteSessionId = null;
  }
  $('#deleteModal').classList.add('hidden');
  renderAll();
}

function beginTimeEdit(id) {
  state.editingSessionTimeId = id;
  renderAll();
}

function cancelTimeEdit() { state.editingSessionTimeId = null; renderAll(); }

function saveTimeEdit(id) {
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;
  const start = $(`#ts-${id}`)?.value;
  const end   = $(`#te-${id}`)?.value;
  if (!start || !end) return;
  s.startTime = start;
  s.endTime   = end;
  state.editingSessionTimeId = null;
  renderAll();
}

// ─── Notifications ────────────────────────────────────────────────────────────

function addNotification(level, title, body, requestTitle = null) {
  state.notifications.unshift({ id: `n-${Date.now()}`, title, body, ...(requestTitle && { requestTitle }), unread: true });
}

// ─── Drawer Helpers (stubs kept for event binding) ───────────────────────────

// ─── Event Binding ────────────────────────────────────────────────────────────


// ─── Leave Management Page ────────────────────────────────────────────────────

function getMyLeaves() {
  return state.leaves.filter(l => l.applicantId === state.currentUser.id);
}

function calcLeaveDays(lv) {
  if (!lv.startDate || !lv.endDate) return 0;
  if (lv.type !== '종일 연차') return 0.5;
  const ms = toDate(lv.endDate) - toDate(lv.startDate);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

function getUsedLeaveCount() {
  return getMyLeaves()
    .filter(l => l.status === '승인 완료')
    .reduce((sum, l) => sum + calcLeaveDays(l), 0);
}

function renderLeaveKpi() {
  const used = getUsedLeaveCount();
  const remaining = state.totalLeave - used;
  document.getElementById('leaveKpiRow').innerHTML = `
    <div class="leave-kpi-card">
      <div class="leave-kpi-label">총 연차</div>
      <div class="leave-kpi-value">${state.totalLeave}<span class="leave-kpi-unit">일</span></div>
    </div>
    <div class="leave-kpi-card used">
      <div class="leave-kpi-label">사용 연차</div>
      <div class="leave-kpi-value">${used}<span class="leave-kpi-unit">일</span></div>
    </div>
    <div class="leave-kpi-card remaining">
      <div class="leave-kpi-label">잔여 연차</div>
      <div class="leave-kpi-value">${remaining}<span class="leave-kpi-unit">일</span></div>
    </div>
  `;
}

function renderLeaveTabBar() {}

function leaveTypeIcon(type) {
  const cls = { '종일 연차': 'leave-type-full', '오전 반차': 'leave-type-am', '오후 반차': 'leave-type-pm' };
  return `<span class="leave-type-badge ${cls[type] || ''}">${type}</span>`;
}

function leaveStatusBadge(status) {
  const map = {
    '승인 대기': 'badge-pending',
    '승인 완료': 'badge-approved',
    '반려':      'badge-rejected',
  };
  return `<span class="leave-badge ${map[status] || ''}">${status}</span>`;
}

function leaveActionBtns(lv) {
  if (lv.applicantId === state.currentUser.id && lv.status === '승인 대기' && lv.startDate >= state.today) {
    return `<button class="leave-action-btn cancel" data-leave-cancel="${lv.id}">취소</button>`;
  }
  return '';
}

function renderLeaveRows(leaves, hideActions = false) {
  if (!leaves.length) return '<div class="leave-empty">연차 내역이 없습니다.</div>';
  return leaves.map(lv => `
    <div class="leave-row">
      <div class="leave-row-main">
        <div class="leave-row-top">
          <span class="leave-row-name">${lv.applicantName}</span>
          ${leaveTypeIcon(lv.type)}
          ${leaveStatusBadge(lv.status)}
        </div>
        <div class="leave-row-meta">
          <span>신청일 ${lv.startDate}${lv.endDate !== lv.startDate ? ' ~ ' + lv.endDate : ''}</span>
          ${lv.approverName ? `<span>처리자 ${lv.approverName}</span>` : ''}
        </div>
        ${lv.reason ? `<div class="leave-row-reason">${lv.reason}</div>` : ''}
        ${lv.rejectedReason ? `<div class="leave-row-rejected-reason">반려 사유: ${lv.rejectedReason}</div>` : ''}
      </div>
      <div class="leave-row-actions">${hideActions ? '' : leaveActionBtns(lv)}</div>
    </div>
  `).join('');
}

function renderLeaveList() {}

function renderLeavePage() {
  renderLeaveKpi();
  _renderLeaveLeftSection();
  _renderLeavePendingSection();
}

function _renderLeaveLeftSection() {
  const el = document.getElementById('leaveLeftSection');
  if (!el) return;
  const TABS = ['내 연차', '팀 연차', '이력'];
  if (!TABS.includes(state.leaveTab)) state.leaveTab = '내 연차';

  const tabBar = `<div class="leave-tab-bar">${TABS.map(t =>
    `<button class="leave-tab-btn${state.leaveTab === t ? ' active' : ''}" data-leave-tab="${t}">${t}</button>`
  ).join('')}</div>`;

  let content = '';
  if (state.leaveTab === '내 연차') {
    const leaves = getMyLeaves().filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate));
    content = `<div class="leave-list">${renderLeaveRows(leaves)}</div>`;
  } else if (state.leaveTab === '팀 연차') {
    const AVATAR_BG = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];
    const membersHtml = state.teamMembers.filter(m => m.id !== state.currentUser.id).map((member, idx) => {
      const memberLeaves = state.leaves.filter(l => l.applicantId === member.id);
      const usedDays = memberLeaves.filter(l => l.status === '승인 완료').reduce((sum, l) => sum + calcLeaveDays(l), 0);
      const remaining = state.totalLeave - usedDays;
      const color = AVATAR_BG[idx % AVATAR_BG.length];
      const leavesHtml = memberLeaves.length
        ? memberLeaves.sort((a, b) => b.startDate.localeCompare(a.startDate)).map(lv => `
          <div class="leave-row">
            <div class="leave-row-main">
              <div class="leave-row-top">
                ${leaveTypeIcon(lv.type)}
                ${leaveStatusBadge(lv.status)}
              </div>
              <div class="leave-row-meta">
                <span>신청일 ${lv.startDate}${lv.endDate !== lv.startDate ? ' ~ ' + lv.endDate : ''}</span>
              </div>
            </div>
          </div>`).join('')
        : '<div class="leave-empty">연차 내역이 없습니다.</div>';
      return `
        <div class="member-leave-card">
          <div class="member-leave-header">
            <div class="member-leave-avatar" style="background:${color}">${escapeHtml(member.name[0])}</div>
            <div class="member-leave-info">
              <div class="member-leave-name">${escapeHtml(member.name)}</div>
              <div class="member-leave-role">${escapeHtml(member.role)}</div>
            </div>
          </div>
          <div class="member-leave-kpi-row">
            <div class="leave-kpi-card"><div class="leave-kpi-label">총 연차</div><div class="leave-kpi-value">${state.totalLeave}<span class="leave-kpi-unit">일</span></div></div>
            <div class="leave-kpi-card"><div class="leave-kpi-label">사용 연차</div><div class="leave-kpi-value">${usedDays}<span class="leave-kpi-unit">일</span></div></div>
            <div class="leave-kpi-card"><div class="leave-kpi-label">잔여 연차</div><div class="leave-kpi-value">${remaining}<span class="leave-kpi-unit">일</span></div></div>
          </div>
          <div class="member-leave-list">${leavesHtml}</div>
        </div>`;
    }).join('');
    content = `<div class="leave-list">${membersHtml || '<div class="leave-empty">팀원이 없습니다.</div>'}</div>`;
  } else {
    const leaves = getMyLeaves().filter(l => l.status === '승인 완료' || l.status === '반려').sort((a, b) => b.startDate.localeCompare(a.startDate));
    content = `<div class="leave-list">${renderLeaveRows(leaves, true)}</div>`;
  }

  el.innerHTML = tabBar + content;
}

function _renderLeavePendingSection() {
  const el = document.getElementById('leavePendingSection');
  if (!el) return;
  const pending = state.leaves.filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate));
  const rows = pending.length
    ? pending.map(lv => `
      <div class="leave-row">
        <div class="leave-row-main">
          <div class="leave-row-top">
            <span class="leave-row-name">${escapeHtml(lv.applicantName)}</span>
            ${leaveTypeIcon(lv.type)}
          </div>
          <div class="leave-row-meta">
            <span>신청일 ${lv.startDate}${lv.endDate !== lv.startDate ? ' ~ ' + lv.endDate : ''}</span>
          </div>
          ${lv.reason ? `<div class="leave-row-reason">${escapeHtml(lv.reason)}</div>` : ''}
        </div>
        <div class="leave-row-actions">
          <button class="leave-action-btn approve" data-leave-approve="${lv.id}">승인</button>
          <button class="leave-action-btn reject" data-leave-reject="${lv.id}">반려</button>
        </div>
      </div>`).join('')
    : '<div class="leave-empty">승인 대기 중인 요청이 없습니다.</div>';
  el.innerHTML = `
    <div class="leave-island-title">승인 대기 <span class="leave-pending-count">${pending.length}</span></div>
    <div class="leave-list">${rows}</div>`;
}

function openLeaveModal() {
  document.getElementById('leaveForm').reset();
  document.getElementById('leaveStartDate').value = state.today;
  document.getElementById('leaveEndDate').value   = state.today;
  document.getElementById('leaveDaysPreview').textContent = '';
  document.getElementById('leaveModal').classList.remove('hidden');
}

function closeLeaveModal() {
  document.getElementById('leaveModal').classList.add('hidden');
}

function submitLeave(e) {
  e.preventDefault();
  const type = document.querySelector('input[name="leaveType"]:checked').value;
  const startDate = document.getElementById('leaveStartDate').value;
  const endDate   = document.getElementById('leaveEndDate').value;
  const reason    = document.getElementById('leaveReason').value.trim();
  if (!startDate || !endDate || !reason) return;
  if (endDate < startDate) { alert('종료일은 시작일 이후여야 합니다.'); return; }
  if (type !== '종일 연차' && startDate !== endDate) { alert('반차는 하루만 신청 가능합니다.'); return; }
  const user = state.currentUser;
  state.leaves.push({
    id: 'lv-' + Date.now(),
    applicantId: user.id,
    applicantName: user.name,
    applicantRole: user.role,
    type, startDate, endDate, reason,
    status: '승인 대기',
    approverId: null, approverName: null, rejectedReason: null,
    requestedAt: state.today,
  });
  closeLeaveModal();
  renderLeavePage();
}





// ── Assign Modal ─────────────────────────────────────────────────────────────
const ASSIGN_AVATAR_BG = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];
let _assignTargetId = null;
let _assignSelectedMembers = [];
let _assignDraft = [];

function openAssignModal(arId) {
  const req = state.assignmentRequests.find(r => r.id === arId);
  if (!req) return;
  _assignTargetId = arId;
  _assignSelectedMembers = [...(req.assignees || [])];
  _assignDraft = [];

  const PRI_COLOR = { '긴급': 'var(--red)', '일반': 'var(--muted)' };
  document.getElementById('assignRequestInfo').innerHTML = `
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">${escapeHtml(req.title)}</div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--muted)">
      <span>요청팀 · <strong style="color:var(--text)">${escapeHtml(req.team)}</strong></span>
      <span>예상시간 · <strong style="color:var(--text)">${req.hours}h</strong></span>
      <span>마감일 · <strong style="color:var(--text)">${escapeHtml(req.deadline)}</strong></span>
      <span>우선순위 · <strong style="color:${PRI_COLOR[req.priority] || 'var(--muted)'}">${escapeHtml(req.priority)}</strong></span>
    </div>`;

  document.getElementById('submitAssignBtn').disabled = _assignSelectedMembers.length === 0;
  document.getElementById('assignMemberPanel')?.classList.add('hidden');
  renderAssignAvatars();
  document.getElementById('assignModal').classList.remove('hidden');
}

function closeAssignModal() {
  document.getElementById('assignModal').classList.add('hidden');
  _assignTargetId = null;
  _assignSelectedMembers = [];
  _assignDraft = [];
}

function renderAssignAvatars() {
  const el = document.getElementById('assignAvatars');
  if (!el) return;
  el.innerHTML = _assignSelectedMembers.map(name => {
    const idx = state.teamMembers.findIndex(m => m.name === name);
    const bg  = ASSIGN_AVATAR_BG[(idx >= 0 ? idx : 0) % ASSIGN_AVATAR_BG.length];
    return `
      <div class="ap-avatar-wrap" title="${escapeHtml(name)}">
        <div class="ap-avatar" style="background:${bg}">${name[0]}</div>
        <button class="ap-remove" type="button" data-remove-assign="${escapeHtml(name)}" aria-label="${escapeHtml(name)} 제거">✕</button>
      </div>`;
  }).join('');
  const countEl = document.getElementById('assignCount');
  if (countEl) {
    if (_assignSelectedMembers.length) {
      countEl.textContent = `${_assignSelectedMembers.length}명 선택`;
      countEl.classList.remove('hidden');
    } else {
      countEl.classList.add('hidden');
    }
  }
  document.getElementById('submitAssignBtn').disabled = _assignSelectedMembers.length === 0;
}

function renderAssignMemberPanel() {
  const list = document.getElementById('assignMemberList');
  if (!list) return;
  const members = state.teamMembers.filter(m => !m.onLeave);
  if (!members.length) {
    list.innerHTML = '<div style="padding:14px;text-align:center;font-size:12px;color:var(--muted)">팀원이 없습니다</div>';
    return;
  }
  list.innerHTML = members.map(m => {
    const idx     = state.teamMembers.indexOf(m);
    const bg      = ASSIGN_AVATAR_BG[idx % ASSIGN_AVATAR_BG.length];
    const checked = _assignDraft.includes(m.name);
    return `
      <div class="assign-member-option${checked ? ' is-selected' : ''}" data-pick-assign-member="${escapeHtml(m.name)}">
        <div class="assign-member-avatar" style="background:${bg}">${m.name[0]}</div>
        <div>
          <div class="assign-member-name">${escapeHtml(m.name)}</div>
          <div class="assign-member-role">${escapeHtml(m.role)}</div>
        </div>
        <div class="ap-check${checked ? ' checked' : ''}">✓</div>
      </div>`;
  }).join('');
}

function submitAssign() {
  if (!_assignTargetId || !_assignSelectedMembers.length) return;
  const req = state.assignmentRequests.find(r => r.id === _assignTargetId);
  if (!req) return;
  req.assignees = [..._assignSelectedMembers];
  req.status    = '수락대기중';
  closeAssignModal();
  renderTeamStatusPage();
}

// ── Process Management Page ───────────────────────────────────────────────────
let _procOpenCats = new Set();
let _procDragId   = null;
let _procDragCatId = null;
let _procEditCallback = null;
let _procDeleteCallback = null;

const PROC_AVATAR_BG = ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4','#84cc16'];
function procMemberAvatar(name) {
  const idx = state.teamMembers.findIndex(m => m.name === name);
  const bg  = PROC_AVATAR_BG[idx >= 0 ? idx % PROC_AVATAR_BG.length : 0];
  return `<span class="proc-avatar" style="background:${bg}" title="${escapeHtml(name)}">${name[0]}</span>`;
}

function openProcEditModal(title, value, onSave) {
  const modal = document.getElementById('procEditModal');
  const input = document.getElementById('procEditInput');
  const titleEl = document.getElementById('procEditModalTitle');
  if (!modal) return;
  titleEl.textContent = title;
  input.value = value || '';
  _procEditCallback = onSave;
  modal.classList.remove('hidden');
  setTimeout(() => { input.focus(); input.select(); }, 50);
}
function closeProcEditModal() {
  document.getElementById('procEditModal')?.classList.add('hidden');
  _procEditCallback = null;
}
function openProcDeleteModal(desc, onConfirm) {
  const modal = document.getElementById('procDeleteModal');
  if (!modal) return;
  document.getElementById('procDeleteModalDesc').textContent = desc;
  _procDeleteCallback = onConfirm;
  modal.classList.remove('hidden');
}
function closeProcDeleteModal() {
  document.getElementById('procDeleteModal')?.classList.add('hidden');
  _procDeleteCallback = null;
}

function renderProcessPage() {
  const body = document.getElementById('processBody');
  if (!body) return;

  const tabBarEl = document.getElementById('procTabBar');
  if (tabBarEl) {
    tabBarEl.innerHTML = `<button class="proc-tab active" type="button" data-proc-add-cat>+ 프로세스 등록</button>`;
  }

  if (!state.processes.length) {
    body.innerHTML = '<div class="proc-empty">등록된 프로세스가 없습니다.</div>';
    return;
  }

  const EDIT_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const DEL_SVG  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  const CHEV_SVG = `<svg class="proc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  const PLUS_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

  body.innerHTML = `<div class="proc-list">${state.processes.map(cat => {
    const isOpen = _procOpenCats.has(cat.id);
    const steps = cat.steps.map((step, idx) => `
      <div class="proc-step-row" draggable="true" data-drag-step="${step.id}" data-drag-cat="${cat.id}">
        <span class="proc-step-num">${String(idx + 1).padStart(2,'0')}.</span>
        <span class="proc-step-title">${escapeHtml(step.title)}</span>
        <div class="proc-step-actions">
          <button class="proc-icon-btn" type="button" data-edit-step="${step.id}" data-cat-id="${cat.id}" title="수정">${EDIT_SVG}</button>
          <button class="proc-icon-btn proc-icon-btn--danger" type="button" data-delete-step="${step.id}" data-cat-id="${cat.id}" title="삭제">${DEL_SVG}</button>
        </div>
      </div>`).join('');

    return `
      <div class="proc-card${isOpen ? ' is-open' : ''}" data-cat="${cat.id}">
        <div class="proc-card-header" data-toggle-cat="${cat.id}">
          <span class="proc-cat-title">${escapeHtml(cat.category)}</span>
          <span class="proc-step-count">${cat.steps.length}</span>
          <span class="proc-header-spacer"></span>
          <div class="proc-card-actions">
            <button class="proc-icon-btn" type="button" data-edit-cat="${cat.id}" title="수정">${EDIT_SVG}</button>
            <button class="proc-icon-btn proc-icon-btn--danger" type="button" data-delete-cat="${cat.id}" title="삭제">${DEL_SVG}</button>
          </div>
          ${CHEV_SVG}
        </div>
        <div class="proc-body">
          <div class="proc-step-list" data-step-list="${cat.id}">
            ${steps || '<div class="proc-no-steps">등록된 단계가 없습니다.</div>'}
          </div>
          <button class="proc-add-step-btn" type="button" data-add-step="${cat.id}">${PLUS_SVG} 단계 추가</button>
        </div>
      </div>`;
  }).join('')}</div>`;

  // Drag-to-reorder
  body.querySelectorAll('[data-drag-step]').forEach(el => {
    el.addEventListener('dragstart', e => {
      _procDragId = el.dataset.dragStep;
      _procDragCatId = el.dataset.dragCat;
      el.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      _procDragId = null; _procDragCatId = null;
      body.querySelectorAll('.proc-step-row').forEach(r => r.classList.remove('is-dragging','drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      body.querySelectorAll('.proc-step-row').forEach(r => r.classList.remove('drag-over'));
      if (el.dataset.dragCat === _procDragCatId) el.classList.add('drag-over');
    });
    el.addEventListener('drop', e => {
      e.preventDefault();
      const toId = el.dataset.dragStep;
      const toCat = el.dataset.dragCat;
      if (!_procDragId || _procDragId === toId || _procDragCatId !== toCat) return;
      const cat = state.processes.find(p => p.id === toCat);
      if (!cat) return;
      const fi = cat.steps.findIndex(s => s.id === _procDragId);
      const ti = cat.steps.findIndex(s => s.id === toId);
      const [moved] = cat.steps.splice(fi, 1);
      cat.steps.splice(ti, 0, moved);
      renderProcessPage();
    });
  });
}

function cancelLeaveRequest(id) {
  const lv = state.leaves.find(l => l.id === id);
  if (!lv || lv.status !== '승인 대기') return;
  state.leaves = state.leaves.filter(l => l.id !== id);
  renderLeavePage();
}

function bindEvents() {
  // Delegated clicks
  document.addEventListener('click', e => {
    // Detail save
    if (e.target.id === 'detailSaveBtn') { saveDetailDraft(); return; }

    if (e.target.closest('[data-toggle-all-steps]')) {
      state.detailShowAllSteps = !state.detailShowAllSteps;
      renderDetailPanel();
      return;
    }

    // Task delete button
    const delTaskBtn = e.target.closest('[data-delete-task-id]');
    if (delTaskBtn) { requestDeleteWorkItem(delTaskBtn.dataset.deleteTaskId); return; }

    // Task add session button → open inline input
    const addSessionBtn = e.target.closest('[data-add-session-task-id]');
    if (addSessionBtn) {
      const id = addSessionBtn.dataset.addSessionTaskId;
      state.selectedTaskId = id;
      state.inlineAddItemId = state.inlineAddItemId === id ? null : id;
      renderAll();
      return;
    }

    // Close inline input if clicking outside the session panel or task items
    if (state.inlineAddItemId &&
        !e.target.closest('[data-inline-wrap]') &&
        !e.target.closest('[data-task-id]') &&
        !e.target.closest('#sessionList') &&
        !e.target.closest('#progressWrap')) {
      state.inlineAddItemId = null;
      renderAll();
    }

    // Task item → open detail panel
    const taskBtn = e.target.closest('[data-task-id]');
    if (taskBtn && !e.target.closest('[data-add-session-task-id]') && !e.target.closest('[data-delete-task-id]') && !e.target.closest('[data-inline-wrap]')) {
      openDetailPanel(taskBtn.dataset.taskId);
      return;
    }

    // Open request modal
    const openReq = e.target.closest('[data-open-request]');
    if (openReq) { openRequestModal(openReq.dataset.openRequest); return; }

    // Accept request
    const accept = e.target.closest('[data-accept-request]');
    if (accept) { acceptRequest(accept.dataset.acceptRequest); return; }

    // Reject request
    const reject = e.target.closest('[data-reject-request]');
    if (reject) { openRejectModal(reject.dataset.rejectRequest); return; }

    // Toggle session done


    const toggle = e.target.closest('[data-toggle-session]');
    if (toggle) { toggleSession(toggle.dataset.toggleSession); return; }

    // Clone session (+ button)
    const clone = e.target.closest('[data-clone-session]');
    if (clone) {
      const src = state.sessions.find(x => x.id === clone.dataset.cloneSession);
      if (src) {
        const newId = `ws-${Date.now()}`;
        state.sessions.push({
          id: newId,
          workItemId: src.workItemId,
          stepId: src.stepId,
          authorId: src.authorId,
          authorName: src.authorName,
          date: src.date,
          category: src.category,
          title: src.title,
          startTime: '',
          endTime: '',
          done: false,
          _cloned: true,
        });
        state.pendingNewSessionId = newId;
        state.pendingNewSessionSourceId = src.id;
        state.editingSessionId = newId;
        state.editingSessionOriginalTitle = src.title;
        renderDailyTodo();
        requestAnimationFrame(() => {
          const inp = document.querySelector(`[data-edit-session-title="${newId}"]`);
          if (inp) { inp.focus(); inp.select(); }
        });
      }
      return;
    }

    // Delete session
    const del = e.target.closest('[data-delete-session]');
    if (del) { requestDelete(del.dataset.deleteSession); return; }

    // Save time
    const saveTime = e.target.closest('[data-save-time]');
    if (saveTime) { saveTimeEdit(saveTime.dataset.saveTime); return; }

    // Cancel time
    const cancelTime = e.target.closest('[data-cancel-time]');
    if (cancelTime) { cancelTimeEdit(); return; }

    // Drawer day tab
    const drawerDayTab = e.target.closest('[data-drawer-day]');
    if (drawerDayTab) { state.drawerActiveDay = Number(drawerDayTab.dataset.drawerDay); renderDrawerBody(); return; }

    // Add task entry
    const addTaskBtn = e.target.closest('[data-add-task-day]');
    if (addTaskBtn) { addTaskEntry(Number(addTaskBtn.dataset.addTaskDay)); return; }

    // Save drawer
    if (e.target.closest('#saveDrawerBtn')) { saveDrawerTasks(); return; }

    // Remove task entry
    const removeTaskBtn = e.target.closest('[data-remove-task]');
    if (removeTaskBtn) { removeTaskEntry(removeTaskBtn.dataset.removeTask); return; }

    // Calendar: team filter tab
    const calTeamTab = e.target.closest('[data-cal-team]');
    if (calTeamTab) { state.calTeamFilter = calTeamTab.dataset.calTeam; renderCalendarPage(); return; }

    // Calendar: delete meeting
    const deleteMeetingBtn = e.target.closest('[data-delete-meeting]');
    if (deleteMeetingBtn) { openDeleteMeetingConfirm(deleteMeetingBtn.dataset.deleteMeeting); return; }

    // Detail panel: view meeting from detail
    const viewMeetingFromDetail = e.target.closest('[data-view-meeting-from-detail]');
    if (viewMeetingFromDetail) {
      closeDetailPanel();
      switchPage('meeting-room');
      setTimeout(() => openMeetingDetail(viewMeetingFromDetail.dataset.viewMeetingFromDetail), 100);
      return;
    }

    // Calendar: view meeting detail
    const viewMeeting = e.target.closest('[data-view-meeting]');
    if (viewMeeting) { openMeetingDetail(viewMeeting.dataset.viewMeeting); return; }

    // Attendee dropdown select
    const attendeeOpt = e.target.closest('[data-select-attendee]');
    if (attendeeOpt) {
      const id = attendeeOpt.dataset.selectAttendee;
      const name = attendeeOpt.dataset.name;
      if (!_selectedAttendees.find(m => m.id === id)) {
        _selectedAttendees.push({ id, name });
        renderAttendeeChips();
        document.getElementById('attendeeSearch').value = '';
        document.getElementById('attendeeDropdown').classList.add('hidden');
      }
      return;
    }

    // Attendee chip remove
    const removeAttendee = e.target.closest('[data-remove-attendee]');
    if (removeAttendee) {
      const id = removeAttendee.dataset.removeAttendee;
      _selectedAttendees = _selectedAttendees.filter(m => m.id !== id);
      renderAttendeeChips();
      return;
    }

    // Schedule-meeting attendee dropdown select
    const schedAttendeeOpt = e.target.closest('[data-select-sched-attendee]');
    if (schedAttendeeOpt) {
      const id = schedAttendeeOpt.dataset.selectSchedAttendee;
      const name = schedAttendeeOpt.dataset.name;
      if (!_schedAttendees.find(m => m.id === id)) {
        _schedAttendees.push({ id, name });
        renderSchedAttendeeChips();
        document.getElementById('schedAttendeeSearch').value = '';
        document.getElementById('schedAttendeeDropdown').classList.add('hidden');
      }
      return;
    }

    // Schedule-meeting attendee chip remove
    const removeSchedAttendee = e.target.closest('[data-remove-sched-attendee]');
    if (removeSchedAttendee) {
      const id = removeSchedAttendee.dataset.removeSchedAttendee;
      _schedAttendees = _schedAttendees.filter(m => m.id !== id);
      renderSchedAttendeeChips();
      return;
    }

    // Close attendee dropdown on outside click
    const picker = document.getElementById('attendeePicker');
    const dropdown = document.getElementById('attendeeDropdown');
    if (picker && dropdown && !picker.contains(e.target)) {
      dropdown.classList.add('hidden');
    }

    // Close schedule-meeting attendee dropdown on outside click
    const schedPicker = document.getElementById('schedAttendeePicker');
    const schedDropdown = document.getElementById('schedAttendeeDropdown');
    if (schedPicker && schedDropdown && !schedPicker.contains(e.target)) {
      schedDropdown.classList.add('hidden');
    }

    // Calendar: member filter tabs (전체/나)
    const calMemberTab = e.target.closest('[data-cal-member]');
    if (calMemberTab) {
      state.calMemberFilter = calMemberTab.dataset.calMember;
      renderCalPage();
      return;
    }

    // Calendar: view toggle (월간/주간)
    const calViewBtn = e.target.closest('[data-cal-view]');
    if (calViewBtn) {
      state.calViewMode = calViewBtn.dataset.calView;
      renderCalPage();
      return;
    }

    // Monthly calendar: event pill click → detail
    const calEventPill = e.target.closest('[data-cal-event]');
    if (calEventPill) { openCalEventDetail(calEventPill.dataset.calEvent); return; }

    // Monthly calendar: close detail panel
    if (e.target.closest('#calDetailClose')) { closeCalEventDetail(); return; }

    // Resource: add link
    const addLinkBtn = e.target.closest('[data-add-link]');
    if (addLinkBtn) {
      const wiId = addLinkBtn.dataset.addLink;
      const name = document.getElementById('calResLinkInput')?.value.trim();
      if (name) {
        if (!state.workItemResources[wiId]) state.workItemResources[wiId] = [];
        state.workItemResources[wiId].push({ id: `res-${Date.now()}`, name, type: '링크', uploadedBy: state.currentUser.name });
        renderCalDetailBody(state.calSelectedEventId);
      }
      return;
    }

    // Resource: upload file
    const addFileBtn = e.target.closest('[data-add-file]');
    if (addFileBtn) {
      const wiId = addFileBtn.dataset.addFile;
      const fileInput = document.getElementById('calResFileInput');
      const name = fileInput?.files?.[0]?.name || '';
      if (name) {
        if (!state.workItemResources[wiId]) state.workItemResources[wiId] = [];
        state.workItemResources[wiId].push({ id: `res-${Date.now()}`, name, type: '파일', uploadedBy: state.currentUser.name });
        renderCalDetailBody(state.calSelectedEventId);
      }
      return;
    }

    // Resource: delete (open confirm modal)
    const rmResBtn = e.target.closest('[data-rm-res]');
    if (rmResBtn) {
      state.pendingDeleteResourceId = rmResBtn.dataset.rmRes;
      state.pendingDeleteResourceWiId = rmResBtn.dataset.wiId;
      $('#deleteModalDesc').textContent = '삭제된 리소스는 복구할 수 없습니다.';
      $('#deleteModal').classList.remove('hidden');
      return;
    }

    // Process: toggle accordion
    const toggleCatBtn = e.target.closest('[data-toggle-cat]');
    if (toggleCatBtn && !e.target.closest('[data-edit-cat]') && !e.target.closest('[data-delete-cat]')) {
      const catId = toggleCatBtn.dataset.toggleCat;
      if (_procOpenCats.has(catId)) _procOpenCats.delete(catId);
      else _procOpenCats.add(catId);
      const card = document.querySelector(`.proc-card[data-cat="${catId}"]`);
      if (card) card.classList.toggle('is-open', _procOpenCats.has(catId));
      return;
    }

    // Process: add category
    const procAddCatBtn = e.target.closest('[data-proc-add-cat]');
    if (procAddCatBtn) {
      openProcEditModal('프로세스 등록', '', (name) => {
        state.processes.push({ id: `pc-${Date.now()}`, category: name, steps: [] });
        renderProcessPage();
      });
      return;
    }

    // Process: edit category name
    const editCatBtn = e.target.closest('[data-edit-cat]');
    if (editCatBtn) {
      const cat = state.processes.find(c => c.id === editCatBtn.dataset.editCat);
      if (!cat) return;
      openProcEditModal('카테고리 이름 수정', cat.category, (name) => {
        cat.category = name;
        renderProcessPage();
      });
      return;
    }

    // Process: delete category
    const deleteCatBtn = e.target.closest('[data-delete-cat]');
    if (deleteCatBtn) {
      const cat = state.processes.find(c => c.id === deleteCatBtn.dataset.deleteCat);
      if (!cat) return;
      openProcDeleteModal(`'${cat.category}' 카테고리를 삭제하면 복구할 수 없습니다.`, () => {
        state.processes = state.processes.filter(c => c.id !== cat.id);
        renderProcessPage();
      });
      return;
    }

    // Process: edit step
    const editStepBtn = e.target.closest('[data-edit-step]');
    if (editStepBtn) {
      const cat = state.processes.find(c => c.id === editStepBtn.dataset.catId);
      if (!cat) return;
      const step = cat.steps.find(s => s.id === editStepBtn.dataset.editStep);
      if (!step) return;
      openProcEditModal('단계 이름 수정', step.title, (name) => {
        step.title = name;
        renderProcessPage();
      });
      return;
    }

    // Process: delete step
    const deleteStepBtn = e.target.closest('[data-delete-step]');
    if (deleteStepBtn) {
      const cat = state.processes.find(c => c.id === deleteStepBtn.dataset.catId);
      if (!cat) return;
      const step = cat.steps.find(s => s.id === deleteStepBtn.dataset.deleteStep);
      if (!step) return;
      openProcDeleteModal(`'${step.title}' 단계를 삭제하면 복구할 수 없습니다.`, () => {
        cat.steps = cat.steps.filter(s => s.id !== step.id);
        renderProcessPage();
      });
      return;
    }

    // Process: add step
    const addStepBtn = e.target.closest('[data-add-step]');
    if (addStepBtn) {
      const cat = state.processes.find(c => c.id === addStepBtn.dataset.addStep);
      if (!cat) return;
      openProcEditModal('단계 추가', '', (name) => {
        cat.steps.push({ id: `ps-${cat.id}-${Date.now()}`, title: name });
        renderProcessPage();
      });
      return;
    }

    // Open assign modal
    const openAssignBtn = e.target.closest('[data-open-assign]');
    if (openAssignBtn) { openAssignModal(openAssignBtn.dataset.openAssign); return; }

    // Assign modal: + button (toggle member panel)
    if (e.target.closest('#assignAddBtn')) {
      const panel = document.getElementById('assignMemberPanel');
      if (!panel) return;
      if (panel.classList.contains('hidden')) {
        _assignDraft = [..._assignSelectedMembers];
        renderAssignMemberPanel();
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
      return;
    }

    // Assign modal: member list toggle in draft
    const assignMemberOpt = e.target.closest('[data-pick-assign-member]');
    if (assignMemberOpt) {
      const name = assignMemberOpt.dataset.pickAssignMember;
      if (_assignDraft.includes(name)) {
        _assignDraft = _assignDraft.filter(n => n !== name);
      } else {
        _assignDraft.push(name);
      }
      renderAssignMemberPanel();
      return;
    }

    // Assign modal: confirm selection
    if (e.target.closest('#assignConfirmBtn')) {
      _assignSelectedMembers = [..._assignDraft];
      document.getElementById('assignMemberPanel')?.classList.add('hidden');
      renderAssignAvatars();
      return;
    }

    // Assign modal: remove avatar
    const removeAssign = e.target.closest('[data-remove-assign]');
    if (removeAssign) {
      const name = removeAssign.dataset.removeAssign;
      _assignSelectedMembers = _assignSelectedMembers.filter(n => n !== name);
      _assignDraft = _assignDraft.filter(n => n !== name);
      renderAssignAvatars();
      const panel = document.getElementById('assignMemberPanel');
      if (panel && !panel.classList.contains('hidden')) renderAssignMemberPanel();
      return;
    }

    // Close assign member panel on outside click
    const assignPicker = document.getElementById('assignPicker');
    const assignPanel  = document.getElementById('assignMemberPanel');
    if (assignPicker && assignPanel && !assignPicker.contains(e.target)) {
      assignPanel.classList.add('hidden');
    }

    // Close popover on outside click
    const popover = $('#notificationPopover');
    if (!popover.classList.contains('hidden')
        && !popover.contains(e.target)
        && !$('#notificationToggle').contains(e.target)) {
      popover.classList.add('hidden');
    }
  });

  // Inline session input: Enter to create, Escape to close
  document.addEventListener('keydown', e => {
    const inp = e.target.closest('[data-inline-item]');
    if (!inp) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      state.inlineAddItemId = null;
      renderAll();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const itemId = inp.dataset.inlineItem;
      const title = inp.value.trim();
      if (!title) return;
      state.sessions.push({
        id: `ws-${Date.now()}`,
        workItemId: itemId,
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        category: '',
        title,
        date: state.dailyViewDate || state.today,
        startTime: '',
        endTime: '',
        done: false
      });
      state.selectedTaskId = itemId;
      state.inlineAddItemId = null;
      renderAll();
    }
  });

  // Session title edit: double-click to start, Enter to save, Esc/blur to cancel
  document.addEventListener('dblclick', e => {
    const titleEl = e.target.closest('[data-start-edit-session]');
    if (!titleEl) return;
    const id = titleEl.dataset.startEditSession;
    const s = state.sessions.find(x => x.id === id);
    if (!s) return;
    state.editingSessionId = id;
    state.editingSessionOriginalTitle = s.title;
    renderDailyTodo();
    requestAnimationFrame(() => {
      const inp = document.querySelector(`[data-edit-session-title="${id}"]`);
      if (inp) { inp.focus(); inp.select(); }
    });
  });

  document.addEventListener('keydown', e => {
    const inp = e.target.closest('[data-edit-session-title]');
    if (!inp) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      const sid = inp.dataset.editSessionTitle;
      if (state.pendingNewSessionId === sid) {
        state.sessions = state.sessions.filter(x => x.id !== sid);
        state.pendingNewSessionId = null; state.pendingNewSessionSourceId = null;
      } else {
        const s = state.sessions.find(x => x.id === sid);
        if (s && state.editingSessionOriginalTitle !== null) s.title = state.editingSessionOriginalTitle;
      }
      state.editingSessionId = null;
      state.editingSessionOriginalTitle = null;
      renderDailyTodo();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const sid = inp.dataset.editSessionTitle;
      const s = state.sessions.find(x => x.id === sid);
      if (s) { const v = inp.value.trim(); if (v) s.title = v; }
      state.pendingNewSessionId = null; state.pendingNewSessionSourceId = null;
      state.editingSessionId = null;
      state.editingSessionOriginalTitle = null;
      renderDailyTodo();
      renderKpis();
    }
  });

  document.addEventListener('focusout', e => {
    const inp = e.target.closest('[data-edit-session-title]');
    if (!inp) return;
    const sid = inp.dataset.editSessionTitle;
    if (state.pendingNewSessionId === sid) {
      state.sessions = state.sessions.filter(x => x.id !== sid);
      state.pendingNewSessionId = null; state.pendingNewSessionSourceId = null;
    } else {
      const s = state.sessions.find(x => x.id === sid);
      if (s && state.editingSessionOriginalTitle !== null) s.title = state.editingSessionOriginalTitle;
    }
    state.editingSessionId = null;
    state.editingSessionOriginalTitle = null;
    renderDailyTodo();
  });

  // Session time inputs — validation + save
  function toMin(t) {
    if (!t) return -1;
    const [h, m] = t.split(':').map(Number);
    return isNaN(h) || isNaN(m) ? -1 : h * 60 + m;
  }

  // 미래 시간 체크 (오늘 세션만 적용)
  function isPastTime(session, timeStr) {
    if (!timeStr || session.date !== state.today) return true;
    const now = new Date();
    const min = toMin(timeStr);
    if (min < 0) return false;
    return min <= now.getHours() * 60 + now.getMinutes();
  }

  // 겹치는 시간 체크: 다른 세션과 시작~종료 범위가 겹치면 false
  function hasOverlap(session, newStart, newEnd) {
    const s0 = toMin(newStart), e0 = toMin(newEnd);
    if (s0 < 0 || e0 < 0) return false;
    if (s0 >= e0) return true; // 시작 >= 종료는 자체 오류
    return state.sessions.some(other => {
      if (other.id === session.id || other.date !== session.date) return false;
      const s1 = toMin(other.startTime), e1 = toMin(other.endTime);
      if (s1 < 0 || e1 < 0) return false;
      return s0 < e1 && e0 > s1;
    });
  }

  // 시작시간만으로 겹침 체크: 기존 세션 범위 안에 시작시간이 들어오면 true
  function isStartInExistingSession(session, startTime) {
    const s0 = toMin(startTime);
    if (s0 < 0) return false;
    return state.sessions.some(other => {
      if (other.id === session.id || other.date !== session.date) return false;
      const s1 = toMin(other.startTime), e1 = toMin(other.endTime);
      if (s1 < 0 || e1 < 0) return false;
      return s0 >= s1 && s0 < e1;
    });
  }

  // 시각적 오류 툴팁 표시
  function showTimeErrorTooltip(inp, msg) {
    // 기존 툴팁 제거
    const old = inp.parentElement.querySelector('.time-error-tooltip');
    if (old) old.remove();
    const tip = document.createElement('div');
    tip.className = 'time-error-tooltip';
    tip.textContent = msg;
    inp.parentElement.appendChild(tip);
    inp.classList.add('input-error');
    setTimeout(() => {
      tip.remove();
      inp.classList.remove('input-error');
    }, 2000);
  }

  function showTimeError(inp, originalVal) {
    inp.value = originalVal || '';
    inp.classList.add('input-error');
    setTimeout(() => inp.classList.remove('input-error'), 1500);
  }

  // rerender=true 일 때만 renderDailyTodo() 호출 (Tab 이동 시엔 false)
  function saveTimeInput(inp, rerender = false) {
    const isStart = !!inp.dataset.timeStart;
    const id = isStart ? inp.dataset.timeStart : inp.dataset.timeEnd;
    const s = state.sessions.find(x => x.id === id);
    if (!s) return;
    const val = inp.value.trim();
    if (!val) {
      if (isStart) s.startTime = ''; else s.endTime = '';
      if (rerender) renderDailyTodo();
      renderKpis();
      return;
    }
    // 미래 시간 불가
    if (!isPastTime(s, val)) {
      showTimeErrorTooltip(inp, '현재 시각 이후는 입력할 수 없습니다');
      inp.value = (isStart ? s.startTime : s.endTime) || '';
      return;
    }
    // 겹침 체크
    if (isStart) {
      // 시작시간 입력 시: 기존 세션 범위 안에 들어오면 즉시 오류
      if (isStartInExistingSession(s, val)) {
        showTimeErrorTooltip(inp, '다른 세션과 시간이 겹칩니다');
        inp.value = s.startTime || '';
        return;
      }
      // 종료시간도 있으면 전체 범위 겹침 추가 체크
      if (s.endTime && hasOverlap(s, val, s.endTime)) {
        showTimeErrorTooltip(inp, '다른 세션과 시간이 겹칩니다');
        inp.value = s.startTime || '';
        return;
      }
    } else {
      // 종료시간 입력 시: 시작시간 있으면 전체 범위 체크
      if (s.startTime && hasOverlap(s, s.startTime, val)) {
        showTimeErrorTooltip(inp, '다른 세션과 시간이 겹칩니다');
        inp.value = s.endTime || '';
        return;
      }
    }
    if (isStart) s.startTime = val; else s.endTime = val;
    if (rerender) renderDailyTodo(); // Enter 시에만 재정렬
    renderKpis();
  }

  // 시간 입력 자동 포맷 (숫자만 입력 → HH:MM)
  function autoFormatTime(inp) {
    const digits = inp.value.replace(/\D/g, '').slice(0, 4);
    inp.value = digits.length <= 2 ? digits : digits.slice(0, 2) + ':' + digits.slice(2);
    const newPos = digits.length <= 2 ? digits.length : digits.length + 1;
    inp.setSelectionRange(newPos, newPos);
  }

  // 더블클릭으로 시간 입력 활성화
  document.addEventListener('dblclick', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (!timeInp) return;
    if (timeInp.readOnly) {
      timeInp.readOnly = false;
      timeInp.classList.remove('time-readonly');
      // 원래 값 저장 (Esc 복원용)
      timeInp.dataset.originalValue = timeInp.value;
      timeInp.focus();
      timeInp.select();
    }
  });

  document.addEventListener('input', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (!timeInp) return;
    autoFormatTime(timeInp);

    // 시작시간: 5자리 완성(HH:MM)이면 즉시 겹침 체크
    if (timeInp.dataset.timeStart && timeInp.value.length === 5) {
      const s = state.sessions.find(x => x.id === timeInp.dataset.timeStart);
      if (s && isStartInExistingSession(s, timeInp.value)) {
        showTimeErrorTooltip(timeInp, '다른 세션과 시간이 겹칩니다');
      }
    }
  });

  // 시간 입력 readonly 복원 헬퍼
  function restoreTimeReadonly(inp) {
    inp.readOnly = true;
    inp.classList.add('time-readonly');
    delete inp.dataset.originalValue;
  }

  // Enter: 저장 + 재정렬 / Escape: 취소
  document.addEventListener('keydown', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (!timeInp) return;
    if (e.key === 'Tab' && !e.shiftKey && timeInp.dataset.timeStart) {
      e.preventDefault();
      const id = timeInp.dataset.timeStart;
      saveTimeInput(timeInp, false);
      restoreTimeReadonly(timeInp);
      const endInp = document.querySelector(`[data-time-end="${id}"]`);
      if (endInp) {
        endInp.readOnly = false;
        endInp.classList.remove('time-readonly');
        endInp.dataset.originalValue = endInp.value;
        endInp.focus();
        endInp.select();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      saveTimeInput(timeInp, true);
      timeInp.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const isStart = !!timeInp.dataset.timeStart;
      const id = isStart ? timeInp.dataset.timeStart : timeInp.dataset.timeEnd;
      const s = state.sessions.find(x => x.id === id);
      if (s) timeInp.value = (isStart ? s.startTime : s.endTime) || '';
      timeInp.blur();
    }
  });

  // blur: 저장 + readonly 복원
  document.addEventListener('focusout', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (!timeInp) return;
    // change 이벤트 대신 focusout에서 저장 처리
    saveTimeInput(timeInp, false);
    restoreTimeReadonly(timeInp);
  });

  // change 이벤트 제거 — focusout에서 처리
  // (기존 change 리스너는 삭제)

  // Bundle input changes + detail panel inputs
  document.addEventListener('input', e => {
    // Detail panel fields
    if (state.detailDraft) {
      if (e.target.id === 'detailTitle') {
        state.detailDraft.title = e.target.value;
        const btn = document.getElementById('detailSaveBtn');
        if (btn) btn.disabled = !isDetailDirty();
        return;
      }
      if (e.target.id === 'detailDescription') {
        state.detailDraft.description = e.target.value;
        const btn = document.getElementById('detailSaveBtn');
        if (btn) btn.disabled = !isDetailDirty();
        return;
      }
      if (e.target.id === 'detailEndDate') {
        state.detailDraft.end = e.target.value;
        const btn = document.getElementById('detailSaveBtn');
        if (btn) btn.disabled = !isDetailDirty();
        return;
      }
    }

    const taskInput = e.target.closest('[data-task-key]');
    if (taskInput) { updateTaskField(taskInput.dataset.taskKey, taskInput.dataset.taskField, taskInput.value); return; }
  });

  // Detail type change + drawer select change
  document.addEventListener('change', e => {
    if (e.target.id === 'detailType' && state.detailDraft) {
      state.detailDraft.type = e.target.value;
      renderDetailPanel();
      return;
    }
    const taskSel = e.target.closest('[data-task-key]');
    if (taskSel) {
      updateTaskField(taskSel.dataset.taskKey, taskSel.dataset.taskField, taskSel.value);
      // type 변경 시 re-render (고정 <-> 일반/긴급 전환)
      if (taskSel.dataset.taskField === 'type') renderDrawerBody();
      return;
    }
  });

  // Recurring day toggle
  document.addEventListener('click', e => {
    const rdBtn = e.target.closest('[data-recurring-day]');
    if (!rdBtn) return;
    const [di, ti, dn] = rdBtn.dataset.recurringDay.split(':').map(Number);
    const task = state.drawerDayTasks?.[di]?.[ti];
    if (!task) return;
    if (!task.recurringDays) task.recurringDays = [];
    const idx = task.recurringDays.indexOf(dn);
    if (idx === -1) task.recurringDays.push(dn);
    else if (task.recurringDays.length > 1) task.recurringDays.splice(idx, 1); // 최소 1개 유지
    task.recurringDays.sort((a, b) => a - b);
    renderDrawerBody();
  }, true);

  // Detail panel recurring day toggle
  document.addEventListener('click', e => {
    const rdBtn = e.target.closest('[data-detail-recurring-day]');
    if (!rdBtn || !state.detailDraft) return;
    const dn = Number(rdBtn.dataset.detailRecurringDay);
    if (!state.detailDraft.recurringDays) state.detailDraft.recurringDays = [];
    const idx = state.detailDraft.recurringDays.indexOf(dn);
    if (idx === -1) state.detailDraft.recurringDays.push(dn);
    else if (state.detailDraft.recurringDays.length > 1) state.detailDraft.recurringDays.splice(idx, 1);
    state.detailDraft.recurringDays.sort((a, b) => a - b);
    renderDetailPanel();
  }, true);

  // Accept form submit
  $('#acceptForm').addEventListener('submit', submitAcceptForm);
  $('#closeAcceptModal').addEventListener('click', closeAcceptModal);
  $('#cancelAcceptModal').addEventListener('click', closeAcceptModal);

  // Session form submit
  $('#sessionForm').addEventListener('submit', createSessionFromModal);

  // Reject form submit
  $('#rejectForm').addEventListener('submit', e => {
    e.preventDefault();
    const reason = new FormData(e.currentTarget).get('rejectReason');
    const detail = $('#rejectDetail').value.trim();
    if (reason === '기타' && !detail) { $('#rejectDetail').focus(); return; }
    rejectRequest(reason, detail);
  });

  // Detail Panel close
  $('#closeDetailPanel').addEventListener('click', closeDetailPanel);
  $('#detailBackdrop').addEventListener('click', closeDetailPanel);

  // Buttons
  $('#openTaskDrawer').addEventListener('click', openDrawer);
  $('#closeTaskDrawer').addEventListener('click', closeDrawer);
  $('#drawerBackdrop').addEventListener('click', closeDrawer);
  $('#closeSessionModal')?.addEventListener('click', closeSessionModal);
  $('#cancelSessionModal')?.addEventListener('click', closeSessionModal);
  $('#closeRequestModal').addEventListener('click', closeRequestModal);
  $('#closeRejectModal').addEventListener('click', closeRejectModal);
  $('#cancelReject').addEventListener('click', closeRejectModal);
  $('#cancelDelete').addEventListener('click', () => $('#deleteModal').classList.add('hidden'));
  $('#confirmDelete').addEventListener('click', confirmDelete);

  // Process edit modal
  document.getElementById('procEditCancel')?.addEventListener('click', closeProcEditModal);
  document.getElementById('procEditSave')?.addEventListener('click', () => {
    const val = document.getElementById('procEditInput')?.value.trim();
    if (val && _procEditCallback) { _procEditCallback(val); closeProcEditModal(); }
  });
  document.getElementById('procEditInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val && _procEditCallback) { _procEditCallback(val); closeProcEditModal(); }
    } else if (e.key === 'Escape') {
      closeProcEditModal();
    }
  });
  document.getElementById('procEditModal')?.addEventListener('click', e => {
    if (e.target.id === 'procEditModal') closeProcEditModal();
  });

  // Process delete modal
  document.getElementById('procDeleteCancel')?.addEventListener('click', closeProcDeleteModal);
  document.getElementById('procDeleteConfirm')?.addEventListener('click', () => {
    if (_procDeleteCallback) _procDeleteCallback();
    closeProcDeleteModal();
  });
  document.getElementById('procDeleteModal')?.addEventListener('click', e => {
    if (e.target.id === 'procDeleteModal') closeProcDeleteModal();
  });

  // Notifications
  $('#notificationToggle').addEventListener('click', () => {
    $('#notificationPopover').classList.toggle('hidden');
  });
  $('#markAllRead').addEventListener('click', e => {
    e.stopPropagation();
    state.notifications.forEach(n => { n.unread = false; });
    renderNotifications();
  });
  $('#notificationList').addEventListener('click', e => {
    e.stopPropagation();
    const item = e.target.closest('[data-notif-id]');
    if (!item) return;
    const notif = state.notifications.find(n => n.id === item.dataset.notifId);
    if (notif && notif.unread) {
      notif.unread = false;
      renderNotifications();
    }
  });

  $('#searchInput')?.addEventListener('input', renderWeeklyTasks);

  // Daily view date picker
  $('#dailyTodoDatePicker')?.addEventListener('change', e => {
    state.dailyViewDate = e.target.value;
    renderDailyTodo();
    renderKpis();
  });

  // Weekly card date click → switch daily view
  document.addEventListener('click', e => {
    const dateEl = e.target.closest('[data-switch-daily-date]');
    if (!dateEl) return;
    state.dailyViewDate = dateEl.dataset.switchDailyDate;
    renderDailyTodo();
    renderKpis();
  });

  // Week navigation
  $('#prevWeek').addEventListener('click', () => { state.weekOffset -= 1; renderAll(); });
  $('#nextWeek').addEventListener('click', () => { state.weekOffset += 1; renderAll(); });

  // Nav page switching
  document.querySelectorAll('.nav-item[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.nav));
  });

  // Calendar search
  $('#calSearchInput')?.addEventListener('input', e => {
    state.calSearchQuery = e.target.value;
    renderMeetingList();
  });

  // Meeting detail modal
  document.getElementById('closeMeetingDetailModal')?.addEventListener('click', closeMeetingDetail);
  document.getElementById('meetingDetailOverlay')?.addEventListener('click', closeMeetingDetail);

  // Meeting detail tab switching
  document.getElementById('meetingDetailModal')?.addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-detail-tab]');
    if (tabBtn) {
      state.meetingDetailTab = tabBtn.dataset.detailTab;
      const m = state.meetings.find(x => x.id === state.meetingDetailId);
      if (m) renderMeetingDetailPanel(m);
      return;
    }
    const addBtn = e.target.closest('[data-add-action]');
    if (addBtn) { openAcceptModalForAction(addBtn.dataset.addAction, addBtn.dataset.meetingId); return; }
  });

  // Recorder
  document.getElementById('recorderMicBtn')?.addEventListener('click', startRecording);
  document.getElementById('recorderStopBtn')?.addEventListener('click', stopRecording);

  // Meeting save modal
  document.getElementById('closeMeetingSaveModal')?.addEventListener('click', closeMeetingSaveModal);
  document.getElementById('cancelMeetingSave')?.addEventListener('click', closeMeetingSaveModal);
  document.getElementById('meetingSaveForm')?.addEventListener('submit', saveMeeting);
  document.getElementById('addActionItemBtn')?.addEventListener('click', addActionItemRow);
  document.getElementById('mSaveActionItems')?.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-remove-action]');
    if (removeBtn) { removeBtn.closest('.action-item-input-row').remove(); return; }
    const assigneeOpt = e.target.closest('[data-pick-assignee]');
    if (assigneeOpt) {
      const picker = assigneeOpt.closest('.action-assignee-picker');
      const name = assigneeOpt.dataset.pickAssignee;
      picker.dataset.selectedAssignee = name;
      picker.querySelector('.action-assignee-search').value = name;
      picker.querySelector('.action-assignee-dropdown').classList.add('hidden');
      return;
    }
  });
  document.getElementById('mSaveActionItems')?.addEventListener('focusin', e => {
    const search = e.target.closest('.action-assignee-search');
    if (search) {
      const picker = search.closest('.action-assignee-picker');
      renderActionAssigneeDropdown(picker, search.value);
    }
  });
  document.getElementById('mSaveActionItems')?.addEventListener('input', e => {
    const search = e.target.closest('.action-assignee-search');
    if (search) {
      const picker = search.closest('.action-assignee-picker');
      picker.dataset.selectedAssignee = '';
      renderActionAssigneeDropdown(picker, search.value);
    }
  });

  // Meeting delete modal
  document.getElementById('closeMeetingDeleteModal')?.addEventListener('click', closeDeleteMeetingConfirm);
  document.getElementById('cancelMeetingDelete')?.addEventListener('click', closeDeleteMeetingConfirm);
  document.getElementById('confirmMeetingDelete')?.addEventListener('click', confirmDeleteMeeting);

  // Attendee search
  document.getElementById('attendeeSearch')?.addEventListener('input', e => {
    renderAttendeeDropdown(e.target.value);
  });
  document.getElementById('attendeeSearch')?.addEventListener('focus', e => {
    renderAttendeeDropdown(e.target.value);
  });

  // Schedule meeting modal (회의 등록)
  document.getElementById('openScheduleMeetingBtn')?.addEventListener('click', openScheduleMeetingModal);
  document.getElementById('closeScheduleMeetingModal')?.addEventListener('click', closeScheduleMeetingModal);
  document.getElementById('cancelScheduleMeeting')?.addEventListener('click', closeScheduleMeetingModal);
  document.getElementById('scheduleMeetingForm')?.addEventListener('submit', saveScheduleMeeting);
  document.getElementById('schedAttendeeSearch')?.addEventListener('input', e => {
    renderSchedAttendeeDropdown(e.target.value);
  });
  document.getElementById('schedAttendeeSearch')?.addEventListener('focus', e => {
    renderSchedAttendeeDropdown(e.target.value);
  });

  // Assign modal
  document.getElementById('closeAssignModal')?.addEventListener('click', closeAssignModal);
  document.getElementById('cancelAssignModal')?.addEventListener('click', closeAssignModal);
  document.getElementById('assignForm')?.addEventListener('submit', e => { e.preventDefault(); submitAssign(); });

  // Leave Management
  document.getElementById('openLeaveModal')?.addEventListener('click', openLeaveModal);

  // Live days preview on date change
  function updateLeaveDaysPreview() {
    const type  = document.querySelector('input[name="leaveType"]:checked')?.value;
    const start = document.getElementById('leaveStartDate')?.value;
    const end   = document.getElementById('leaveEndDate')?.value;
    const el    = document.getElementById('leaveDaysPreview');
    if (!el || !start || !end || end < start) { if (el) el.textContent = ''; return; }
    const days = type !== '종일 연차' ? 0.5
      : Math.round((toDate(end) - toDate(start)) / (1000*60*60*24)) + 1;
    el.textContent = `총 ${days}일 사용`;
  }
  document.getElementById('leaveStartDate')?.addEventListener('change', updateLeaveDaysPreview);
  document.getElementById('leaveEndDate')?.addEventListener('change', updateLeaveDaysPreview);
  document.querySelectorAll('input[name="leaveType"]').forEach(r =>
    r.addEventListener('change', updateLeaveDaysPreview)
  );
  document.getElementById('closeLeaveModal')?.addEventListener('click', closeLeaveModal);
  document.getElementById('cancelLeaveModal')?.addEventListener('click', closeLeaveModal);
  document.getElementById('leaveForm')?.addEventListener('submit', submitLeave);
  document.getElementById('leaveLeftSection')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-leave-tab]');
    if (btn) { state.leaveTab = btn.dataset.leaveTab; renderLeavePage(); }
    const cancelBtn = e.target.closest('[data-leave-cancel]');
    if (cancelBtn) { state.pendingLeaveCancelId = cancelBtn.dataset.leaveCancel; $('#leaveCancelModal').classList.remove('hidden'); }
  });

  document.getElementById('leaveList')?.addEventListener('click', e => {
    const cancelBtn = e.target.closest('[data-leave-cancel]');
    if (cancelBtn) cancelLeaveRequest(cancelBtn.dataset.leaveCancel);
  });

  // Calendar: prev/next (month or week)
  $('#calPrevMonth').addEventListener('click', () => {
    if (state.calViewMode === 'weekly') {
      state.calWeekOffset -= 1;
    } else {
      if (state.calMonth === 0) { state.calYear -= 1; state.calMonth = 11; }
      else state.calMonth -= 1;
    }
    renderCalGrid();
  });
  $('#calNextMonth').addEventListener('click', () => {
    if (state.calViewMode === 'weekly') {
      state.calWeekOffset += 1;
    } else {
      if (state.calMonth === 11) { state.calYear += 1; state.calMonth = 0; }
      else state.calMonth += 1;
    }
    renderCalGrid();
  });
  // My Page
  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-mp-tab]');
    if (tab && document.getElementById('myPage')?.contains(tab)) {
      state.myPageTab = tab.dataset.mpTab;
      renderMyPage();
      return;
    }
    const calBtn = e.target.closest('[data-mp-cal]');
    if (calBtn) {
      if (calBtn.dataset.mpCal === 'prev') {
        if (state.myPageCalMonth === 0) { state.myPageCalYear -= 1; state.myPageCalMonth = 11; }
        else state.myPageCalMonth -= 1;
      } else {
        if (state.myPageCalMonth === 11) { state.myPageCalYear += 1; state.myPageCalMonth = 0; }
        else state.myPageCalMonth += 1;
      }
      renderMyPage();
      return;
    }
    const dateCell = e.target.closest('[data-mp-date]');
    if (dateCell) {
      state.myPageSelectedDate = dateCell.dataset.mpDate;
      renderMyPage();
      return;
    }
  });

}

// ─── Init ─────────────────────────────────────────────────────────────────────

// 거절 후 7일 지난 항목 자동 제거
function purgeOldRejections() {
  const today = toDate(state.today);
  state.requests = state.requests.filter(r => {
    if (r.status !== '거절' || !r.rejectedAt) return true;
    const diff = (today - toDate(r.rejectedAt)) / (1000 * 60 * 60 * 24);
    return diff < 7;
  });
}

purgeOldRejections();
bindEvents();
renderAll();
