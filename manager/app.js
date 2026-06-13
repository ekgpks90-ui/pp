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
  pendingDeleteSessionId: null,
  pendingDeleteWorkItemId: null,
  editingSessionId: null,
  editingSessionOriginalTitle: null,
  editingSessionTimeId: null,
  weekOffset: 0,
  drawerActiveDay: 0,
  drawerDayTasks: null,
  inlineAddItemId: null,
  today: _todayISO,
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
    // 고정업무 — recurringDays: 1=월,2=화,3=수,4=목,5=금, end:null=무기한
    { id: 'wi-1',  title: '주간 디자인 싱크 미팅',  description: '매주 월요일 팀 전체 디자인 방향 및 이번 주 업무 우선순위를 공유합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [1],         participants: ['Jihye', '장준혁'] },
    { id: 'wi-2',  title: '일일 작업 기록',          description: '매일 작업 진행 상황을 Figma 및 노션에 기록하고 팀과 공유합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [1,2,3,4,5], participants: ['Jihye'] },
    { id: 'wi-3',  title: '디자인 리뷰 미팅',        description: '화요일·목요일 팀 내 디자인 산출물 리뷰 및 피드백 세션.', start: '2026-06-01', end: null, type: '고정', recurringDays: [2,4],       participants: ['Jihye', '장준혁', '최유진'] },
    { id: 'wi-4',  title: 'Figma 라이브러리 정리',   description: '매주 금요일 Figma 컴포넌트 및 에셋 라이브러리를 정리·업데이트합니다.', start: '2026-06-01', end: null, type: '고정', recurringDays: [5],         participants: ['Jihye', '윤소이'] },
    // 긴급업무
    { id: 'wi-5',  title: '앱 온보딩 화면 긴급 수정',  description: '출시 전 QA에서 발견된 온보딩 UX 문제를 긴급 수정합니다. 인터랙션 흐름 및 카피 오류 포함.', start: '2026-06-11', end: '2026-06-14', type: '긴급', participants: ['Jihye', '최유진', '박서연'] },
    { id: 'wi-6',  title: '이벤트 배너 긴급 제작',     description: '마케팅팀 요청으로 주말 프로모션 배너 3종을 긴급 제작합니다.', start: '2026-06-12', end: '2026-06-13', type: '긴급', participants: ['Jihye', '정하은'] },
    // 일반업무
    { id: 'wi-7',  title: '메인 홈 화면 리디자인',    description: '앱 메인 홈 화면 전면 리디자인. 정보 구조 개선 및 신규 비주얼 아이덴티티 적용.', start: '2026-06-09', end: '2026-06-20', type: '일반', participants: ['Jihye', '최유진'] },
    { id: 'wi-8',  title: '디자인 시스템 컴포넌트 정리', description: '버튼·폼·카드 등 핵심 컴포넌트 Figma 라이브러리 정리 및 스타일 토큰 일원화.', start: '2026-06-02', end: '2026-06-27', type: '일반', participants: ['Jihye', '윤소이', '이나경'] },
    { id: 'wi-9',  title: '신규 서비스 UX 리서치',    description: '신규 서비스 출시 전 사용자 인터뷰 분석 및 페르소나 도출, 개선 방향 정리.', start: '2026-06-10', end: '2026-06-17', type: '일반', participants: ['Jihye', '김도현'] },
    { id: 'wi-10', title: '고객사 A 브랜딩 작업',     description: '고객사 A의 리브랜딩 프로젝트. 로고·컬러 시스템·타이포그래피 가이드 제작.', start: '2026-06-09', end: '2026-06-21', type: '일반', participants: ['Jihye', '이나경'] },
    { id: 'wi-11', title: '모바일 앱 UI 개선',        description: '기존 모바일 앱의 주요 화면 UI를 개선하여 사용성 및 일관성을 높입니다.', start: '2026-06-13', end: '2026-06-20', type: '일반', participants: ['Jihye'] },
    { id: 'wi-12', title: '마케팅 랜딩 페이지 시안',  description: '신규 마케팅 캠페인용 랜딩 페이지 디자인 시안 3종 제작.', start: '2026-06-16', end: '2026-06-24', type: '일반', participants: ['Jihye', '정하은'] },
    { id: 'wi-13', title: '제품 아이콘 리뉴얼',       description: '앱 내 아이콘 세트 전면 리뉴얼. 일관된 스타일 가이드 기반으로 90개 아이콘 작업.', start: '2026-06-23', end: '2026-06-30', type: '일반', participants: ['Jihye', '윤소이'] },
    // 반복 일반·긴급 예시 (세부항목 아이콘 테스트용)
    { id: 'wi-14', title: '주간 업무 보고서 작성',    description: '매주 금요일 팀 주간 업무 현황을 정리하여 보고서를 작성합니다.', start: '2026-06-01', end: null, type: '일반', recurringDays: [5], participants: ['Jihye'] },
    { id: 'wi-15', title: 'QA 긴급 버그 처리',       description: '출시 전 QA 기간 중 발생하는 긴급 버그를 신속히 처리합니다.', start: '2026-06-09', end: '2026-06-20', type: '긴급', recurringDays: [1,2,3,4,5], participants: ['Jihye', '최유진'] },
    // 5월 업무
    { id: 'wi-m1', title: '디자인 시스템 v2 구축',        description: '버튼·폼·카드·모달 등 핵심 컴포넌트 전면 개편. Figma 토큰 일원화 및 다크모드 대응 포함.', start: '2026-05-01', end: '2026-05-23', type: '일반', participants: ['Jihye', '윤소이', '이나경'] },
    { id: 'wi-m2', title: 'Q2 사용자 리서치',             description: '2분기 신규 서비스 출시 전 사용자 인터뷰 12건 진행 및 페르소나 재정립.', start: '2026-05-06', end: '2026-05-16', type: '일반', participants: ['Jihye', '김도현'] },
    { id: 'wi-m3', title: '모바일 앱 리뉴얼 1차 시안',    description: '기존 모바일 앱 전면 리뉴얼. 네비게이션 구조 개선 및 신규 비주얼 아이덴티티 적용 1차 시안 제작.', start: '2026-05-12', end: '2026-05-30', type: '일반', participants: ['Jihye', '최유진'] },
    { id: 'wi-m4', title: '5월 브랜드 캠페인 소재 제작',  description: '5월 가정의 달 캠페인용 SNS 배너·썸네일·스토리 소재 긴급 제작.', start: '2026-05-19', end: '2026-05-23', type: '긴급', participants: ['Jihye', '정하은'] },
    { id: 'wi-m5', title: '신규 온보딩 플로우 설계',      description: '신규 가입자 온보딩 UX 개선. 단계 축소 및 인터랙션 개선안 설계.', start: '2026-05-26', end: '2026-06-06', type: '일반', participants: ['Jihye', '최유진'] },
  ],

  sessions: [
    // 오늘(2026-06-13 토) 세션
    { id: 'ws-1', workItemId: 'wi-5',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '디자인', title: '인터랙션 흐름 수정',         startTime: '', endTime: '', done: false },
    { id: 'ws-2', workItemId: 'wi-5',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '리서치', title: '사용성 테스트 시나리오 정리', startTime: '', endTime: '', done: false },
    { id: 'ws-3', workItemId: 'wi-6',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '디자인', title: '배너 최종 시안 완성',         startTime: '', endTime: '', done: false },
    { id: 'ws-4', workItemId: 'wi-6',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '디자인', title: '클라이언트 피드백 반영',      startTime: '', endTime: '', done: false },
    { id: 'ws-5', workItemId: 'wi-11', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-13', category: '기획',   title: '초기 와이어프레임 스케치',    startTime: '', endTime: '', done: false },
    // 과거 세션 — 히스토리 캘린더용
    { id: 'ws-h1',  workItemId: 'wi-1',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '기획',   title: '주간 디자인 싱크 진행',     startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h2',  workItemId: 'wi-8',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '디자인', title: '버튼 컴포넌트 정리',        startTime: '10:30', endTime: '12:30', done: true },
    { id: 'ws-h3',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-02', category: '기획',   title: '일일 작업 기록',            startTime: '18:00', endTime: '18:30', done: true },
    { id: 'ws-h4',  workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-03', category: '디자인', title: '홈 화면 시안 리뷰',         startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h5',  workItemId: 'wi-8',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-03', category: '디자인', title: '폼 컴포넌트 스타일 정리',   startTime: '10:00', endTime: '12:00', done: true },
    { id: 'ws-h6',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-04', category: '기획',   title: '일일 작업 기록',            startTime: '17:30', endTime: '18:00', done: true },
    // 2026-06-05 연차 (세션 없음)
    { id: 'ws-h7',  workItemId: 'wi-4',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-06', category: '디자인', title: 'Figma 라이브러리 정리',     startTime: '14:00', endTime: '16:00', done: true },
    { id: 'ws-h8',  workItemId: 'wi-2',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-06', category: '기획',   title: '일일 작업 기록',            startTime: '17:00', endTime: '17:30', done: true },
    { id: 'ws-h9',  workItemId: 'wi-1',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '기획',   title: '주간 디자인 싱크 진행',     startTime: '09:00', endTime: '10:00', done: true },
    { id: 'ws-h10', workItemId: 'wi-7',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '디자인', title: '홈 화면 IA 검토',           startTime: '10:30', endTime: '12:30', done: true },
    { id: 'ws-h11', workItemId: 'wi-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-09', category: '디자인', title: '로고 1차 시안 작업',        startTime: '14:00', endTime: '17:00', done: true },
    { id: 'ws-h12', workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '디자인', title: '카드 컴포넌트 리뷰',        startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h13', workItemId: 'wi-9',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '리서치', title: '사용자 인터뷰 녹취 분석',   startTime: '09:00', endTime: '11:30', done: true },
    { id: 'ws-h14', workItemId: 'wi-7',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-10', category: '디자인', title: '홈 화면 2차 시안 작업',     startTime: '13:00', endTime: '16:00', done: true },
    { id: 'ws-h15', workItemId: 'wi-5',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '디자인', title: '온보딩 1단계 화면 수정',    startTime: '09:00', endTime: '11:00', done: true },
    { id: 'ws-h16', workItemId: 'wi-5',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '기획',   title: '수정 범위 정리 및 공유',    startTime: '11:30', endTime: '13:00', done: true },
    { id: 'ws-h17', workItemId: 'wi-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-11', category: '디자인', title: '컬러 시스템 시안 제작',     startTime: '14:00', endTime: '17:00', done: true },
    { id: 'ws-h18', workItemId: 'wi-3',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '디자인', title: '디자인 리뷰 — 홈·온보딩',   startTime: '14:00', endTime: '15:30', done: true },
    { id: 'ws-h19', workItemId: 'wi-6',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '디자인', title: '배너 초안 3종 제작',        startTime: '09:00', endTime: '12:00', done: true },
    { id: 'ws-h20', workItemId: 'wi-9',  authorId: 'u-1', authorName: 'Jihye', date: '2026-06-12', category: '리서치', title: '페르소나 초안 작성',        startTime: '16:00', endTime: '17:30', done: true },
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
    { id: 'ws-m20', workItemId: 'wi-m4', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '기획',   title: '캠페인 소재 컨셉 기획',                    startTime: '09:00', endTime: '10:30', done: true },
    { id: 'ws-m21', workItemId: 'wi-m4', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '디자인', title: 'SNS 배너 1차 시안 3종 제작',               startTime: '11:00', endTime: '14:00', done: true },
    { id: 'ws-m22', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-19', category: '디자인', title: '온보딩 화면 시안 수정',                    startTime: '15:00', endTime: '17:00', done: true },
    // 05-20 (화)
    { id: 'ws-m23', workItemId: 'wi-m4', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-20', category: '디자인', title: '배너 피드백 반영 및 2차 수정',             startTime: '09:30', endTime: '12:00', done: true },
    { id: 'ws-m24', workItemId: 'wi-m1', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-20', category: '디자인', title: '디자인 시스템 QA 검토',                    startTime: '14:00', endTime: '17:00', done: true },
    // 05-21 (수)
    { id: 'ws-m25', workItemId: 'wi-m4', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-21', category: '디자인', title: '스토리·썸네일 소재 제작',                  startTime: '09:00', endTime: '12:30', done: true },
    { id: 'ws-m26', workItemId: 'wi-m3', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-21', category: '기획',   title: '앱 화면 흐름도 최종 정리',                startTime: '14:00', endTime: '16:00', done: true },
    // 05-22 (목)
    { id: 'ws-m27', workItemId: 'wi-m4', authorId: 'u-1', authorName: 'Jihye', date: '2026-05-22', category: '디자인', title: '캠페인 소재 최종 납품',                    startTime: '09:00', endTime: '11:00', done: true },
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
  ],



  requests: [
    { id: 'wr-1', title: '신제품 론칭 SNS 배너', detail: '7월 신제품 론칭에 맞춰 인스타그램·페이스북용 배너 각 2종씩 제작 요청드립니다.', requester: '김지수', requestTeam: '마케팅팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-13', end: '2026-06-18', priority: '긴급', status: '수락 대기' },
    { id: 'wr-2', title: '채용 공고 포스터 디자인', detail: 'UI 디자이너 채용 공고 포스터 제작 부탁드립니다. 사내 게시 및 SNS 게재용 2가지 사이즈 필요합니다.', requester: '박소현', requestTeam: 'HR팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-16', end: '2026-06-20', priority: '일반', status: '수락 대기' },
    { id: 'wr-3', title: 'B2B 제안서 템플릿 제작', detail: '영업팀 PT용 B2B 제안서 PPT 템플릿 디자인이 필요합니다. 브랜드 가이드라인 기반으로 제작해 주세요.', requester: '이준호', requestTeam: '영업팀', deliveryTeam: '디자인팀', assignee: null, start: '2026-06-17', end: '2026-06-23', priority: '일반', status: '수락 대기' },
  ],

  assignmentRequests: [
    { id: 'ar-1', title: '신제품 론칭 SNS 배너 제작',       team: '마케팅팀', hours: 12, deadline: '2026-06-18', priority: '긴급', status: '신규요청',   assignees: [] },
    { id: 'ar-2', title: '채용 공고 포스터 디자인',          team: 'HR팀',     hours: 6,  deadline: '2026-06-20', priority: '일반', status: '신규요청',   assignees: [] },
    { id: 'ar-3', title: 'B2B 제안서 PPT 템플릿',           team: '영업팀',   hours: 10, deadline: '2026-06-23', priority: '일반', status: '재배정',     assignees: [] },
    { id: 'ar-4', title: '서비스 소개 브로셔 리디자인',      team: '기획팀',   hours: 8,  deadline: '2026-06-21', priority: '높음', status: '재배정',     assignees: [] },
    { id: 'ar-5', title: '앱 스토어 스크린샷 업데이트',      team: '기획팀',   hours: 4,  deadline: '2026-06-19', priority: '일반', status: '신규요청',   assignees: [] },
    { id: 'ar-6', title: '사내 온보딩 가이드 시각화',        team: 'HR팀',     hours: 16, deadline: '2026-06-25', priority: '일반', status: '신규요청',   assignees: [] },
    { id: 'ar-7', title: '파트너사 공동 이벤트 키비주얼',    team: '마케팅팀', hours: 20, deadline: '2026-06-27', priority: '높음', status: '수락대기중', assignees: ['이나경'] },
    { id: 'ar-8', title: '분기 성과 인포그래픽 제작',        team: '경영팀',   hours: 10, deadline: '2026-06-28', priority: '일반', status: '수락대기중', assignees: ['박서연', '최유진'] },
    { id: 'ar-9', title: '모바일 앱 아이콘 세트 리뉴얼',    team: '기획팀',   hours: 14, deadline: '2026-06-24', priority: '일반', status: '배정완료',   assignees: ['정하은', 'Jihye'] },
  ],

  notifications: [
    { id: 'n-1', title: '업무요청 도착', body: '마케팅팀에서 업무를 요청했습니다.', requestTitle: '신제품 론칭 SNS 배너', unread: true },
    { id: 'n-2', title: '디자인 리뷰 피드백', body: '장준혁 님이 홈 화면 시안에 코멘트를 남겼습니다.', unread: true },
    { id: 'n-3', title: '회의 일정 변경', body: '오늘 디자인 리뷰 미팅이 오후 3시로 변경되었습니다.', unread: false },
  ],

  meetings: [
    { id: 'mr-1', team: '디자인팀', type: '회고', title: '스프린트 회고 #12',
    summary: '디자인 시스템 컴포넌트 23개 완성 및 API 연동 90% 달성 확인. 디자인-개발 스펙 공유 지연 이슈가 식별되었으며 Slack 연동 자동 알림 도입이 제안되었습니다.',
    aiPoints: ['디자인 시스템 컴포넌트 23개 완성 (목표 대비 115%)', 'API 연동 90% 달성, 잔여 10% 다음 스프린트로 이월', '디자인-개발 스펙 공유 지연 이슈 식별 및 개선안 논의', 'Figma Slack 연동 자동 알림 도입 제안 → 다음 주까지 설정 완료 예정'],
    discussions: ['스펙 공유 지연의 원인으로 비동기 문서화 프로세스 부재 지목', '컴포넌트 라이브러리 버전 관리 방식 개선 필요성 공감', 'AI 기반 디자인 검토 도구 도입 가능성 검토 결정'],
    script: [
      { time: '00:01', speaker: '김민준', text: '안녕하세요, 스프린트 회고 시작하겠습니다. 이번 스프린트 성과부터 공유해 주세요.' },
      { time: '00:38', speaker: '이수진', text: '디자인 시스템 컴포넌트 목표 20개 대비 23개 완성했습니다. Figma 라이브러리도 정리됐어요.' },
      { time: '01:52', speaker: '박민준', text: 'API 연동은 90% 완료했고, 잔여 결제 모듈은 다음 스프린트로 이월했습니다.' },
      { time: '03:10', speaker: '김민준', text: '스펙 공유 지연 이슈가 있었는데, 원인이 뭔가요?' },
      { time: '03:45', speaker: '이수진', text: '디자인 확정 전에 개발이 먼저 시작되는 경우가 있었습니다. 비동기 프로세스가 없어서 생긴 문제예요.' },
      { time: '05:20', speaker: '박민준', text: 'Figma Slack 알림 설정하면 컴포넌트 업데이트 시 자동으로 개발팀에 공유할 수 있을 것 같아요.' },
      { time: '06:40', speaker: '김민준', text: '좋아요. 이수진님이 다음 주까지 Figma Slack 알림 설정해 주시고, AI 학습 일정도 공유해 주세요.' },
    ],
    actionItems: [
      { id: 'act-mr1-1', text: 'Figma Slack 알림 설정', dueDate: '2026-06-10', assignee: '이수진', done: false, addedToWeekly: false },
      { id: 'act-mr1-2', text: 'AI 디자인 검토 도구 조사 및 보고', dueDate: '2026-06-13', assignee: '박민준', done: false, addedToWeekly: false },
    ],
    date: '2026-06-03', author: '김민준', duration: '42:18', attendees: 4, attendeeNames: ['김민준', '이수진', '박민준', 'Jihye'] },
    { id: 'mr-2', team: '디자인팀', type: '클라이언트 미팅', title: '클라이언트 A사 중간 보고',
    summary: '클라이언트 요구사항 변경 사항 정리 및 일정 재조정. 추가 화면 설계 요청이 접수되었으며 다음 회의까지 시안 완성 일정을 확정하였습니다.',
    aiPoints: ['클라이언트 요구사항 3건 변경 확인 및 문서화 완료', '추가 화면 2종(마이페이지·알림센터) 설계 요청 접수', '다음 회의 전까지 시안 초안 완성 일정 6/10으로 확정', '일정 지연 리스크 대비 버퍼 1주 확보 합의'],
    discussions: ['클라이언트 측 내부 검토 프로세스 변경으로 피드백 사이클 지연 우려', '화면 추가로 인한 개발 일정 영향도 재산정 필요', '다음 미팅은 시안 리뷰 목적으로 6/12 예정'],
    script: [
      { time: '00:02', speaker: '김민준', text: '안녕하세요, 중간 보고 시작하겠습니다. 먼저 변경된 요구사항부터 공유드릴게요.' },
      { time: '01:15', speaker: 'Jihye', text: '마이페이지 디자인 방향을 대시보드 형태로 변경 요청이 들어왔습니다. 이나경님과 초안 작업 중입니다.' },
      { time: '03:40', speaker: '이나경', text: '알림센터 화면도 추가 요청이 들어왔어요. 기존 일정에서 약 3일 추가 소요될 것 같습니다.' },
      { time: '06:20', speaker: '김민준', text: '일정 버퍼를 1주 확보하는 방향으로 클라이언트와 협의하겠습니다. 6/10까지 초안 준비 부탁드립니다.' },
      { time: '08:50', speaker: 'Jihye', text: '네, 6/10 마감으로 진행하겠습니다. 중간 점검은 6/7에 내부적으로 진행할게요.' },
    ],
    actionItems: [
      { id: 'act-mr2-1', text: '마이페이지 대시보드 시안 초안 작성', dueDate: '2026-06-10', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr2-2', text: '알림센터 화면 설계 및 시안 작성', dueDate: '2026-06-10', assignee: '이나경', done: false, addedToWeekly: false },
      { id: 'act-mr2-3', text: '변경된 요구사항 문서 업데이트 및 공유', dueDate: '2026-06-05', assignee: '김민준', done: false, addedToWeekly: false },
    ],
    date: '2026-06-03', author: '김민준', duration: '38:54', attendees: 3, attendeeNames: ['김민준', 'Jihye', '이나경'] },
    { id: 'mr-3', team: '디자인팀', type: '타팀 협업회의', title: '타팀 협업 킥오프',
    summary: '디자인-개발팀 간 협업 프로세스 정립 회의. 주요 업무 연결 포인트 확인 및 공유 채널 설정에 대한 합의가 이루어졌습니다.',
    aiPoints: ['디자인-개발 협업 채널 Slack #design-dev 신설 합의', '스펙 변경 시 48시간 전 사전 공지 원칙 수립', 'Figma 링크 공유 → 개발 착수 프로세스 공식화', '주 1회 싱크업 미팅 정례화 (매주 화요일 오전 10시)'],
    discussions: ['이전 스프린트에서 디자인 변경이 개발에 사전 공유 없이 반영된 사례 복기', '개발팀 요청: 컴포넌트 변경 시 영향 범위 명시 필요', '디자인팀 요청: 개발 완료 화면 캡처 공유로 검수 프로세스 개선'],
    script: [
      { time: '00:03', speaker: '이수진', text: '킥오프 시작합니다. 이번 회의 목적은 협업 프로세스 명확화입니다.' },
      { time: '02:10', speaker: '김도현', text: '지난번에 디자인 변경사항이 늦게 공유돼서 재작업이 발생했어요. 사전 공지 프로세스가 필요합니다.' },
      { time: '05:30', speaker: 'Jihye', text: '스펙 변경 시 48시간 전 공지를 원칙으로 하고, Slack 채널을 만들어서 공유하는 게 좋을 것 같아요.' },
      { time: '08:45', speaker: '박서연', text: '싱크업 미팅도 주 1회 정례화하면 실시간 이슈를 빠르게 처리할 수 있을 것 같습니다.' },
      { time: '11:20', speaker: '이수진', text: '화요일 오전 10시로 고정하겠습니다. 이수진이 퍼실리테이터 맡을게요.' },
    ],
    actionItems: [
      { id: 'act-mr3-1', text: 'Slack #design-dev 채널 생성 및 멤버 초대', dueDate: '2026-06-03', assignee: '이수진', done: true, addedToWeekly: false },
      { id: 'act-mr3-2', text: '협업 프로세스 문서화 및 팀 공유', dueDate: '2026-06-06', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr3-3', text: '주간 싱크업 캘린더 초대 발송', dueDate: '2026-06-03', assignee: '최유진', done: true, addedToWeekly: false },
    ],
    date: '2026-06-02', author: '이수진', duration: '35:42', attendees: 6, attendeeNames: ['이수진', 'Jihye', '김도현', '박서연', '최유진', '정하은'] },
    { id: 'mr-4', team: '디자인팀 02', type: '스프린트 기획', title: '2분기 스프린트 계획 수립',
    summary: '2분기 주요 마일스톤 설정 및 업무 분배. 우선순위 조정 및 리소스 할당에 대한 논의가 완료되었습니다.',
    aiPoints: ['2분기 핵심 목표: 신규 서비스 UI 3종 완성', '스프린트 1(6월): 와이어프레임·IA 확정', '스프린트 2(7월): 시각 디자인 + 프로토타입', '스프린트 3(8월): 개발 핸드오프 + QA 지원', '리소스 부족으로 외부 프리랜서 1명 추가 검토'],
    discussions: ['6월 집중 업무 과부하 우려 — 우선순위 상위 3개 업무 집중, 나머지 7월로 이월', '디자인 시스템 업데이트 병행 진행 여부 논의 → 스프린트 2 이후로 연기 결정', '주간 진척 리포트 양식 통일 필요'],
    script: [
      { time: '00:05', speaker: '박민준', text: '2분기 계획 수립 시작합니다. 먼저 1분기 회고 요약부터 공유할게요.' },
      { time: '04:30', speaker: '이수진', text: '신규 서비스 UI가 가장 우선순위가 높습니다. 3종 완성을 2분기 핵심 목표로 잡으면 어떨까요?' },
      { time: '10:15', speaker: '김도현', text: '리소스가 조금 부족할 것 같아요. 6월은 기존 업무 병행이 많아서요.' },
      { time: '15:40', speaker: '박민준', text: '프리랜서 1명 추가를 검토해 볼게요. 일단 우선순위 상위 3개에 집중하고 나머지는 7월로 이월합시다.' },
      { time: '22:00', speaker: '최유진', text: '디자인 시스템 업데이트는 스프린트 2 이후로 미루는 게 현실적일 것 같습니다.' },
    ],
    actionItems: [
      { id: 'act-mr4-1', text: '2분기 스프린트 로드맵 문서 작성', dueDate: '2026-06-05', assignee: '박민준', done: false, addedToWeekly: false },
      { id: 'act-mr4-2', text: '프리랜서 채용 요건 정리 및 공고 준비', dueDate: '2026-06-08', assignee: '이수진', done: false, addedToWeekly: false },
      { id: 'act-mr4-3', text: '주간 진척 리포트 양식 초안 작성', dueDate: '2026-06-06', assignee: 'Jihye', done: false, addedToWeekly: false },
    ],
    date: '2026-06-01', author: '박민준', duration: '58:20', attendees: 5, attendeeNames: ['박민준', '이수진', '김도현', '최유진', 'Jihye'] },
    { id: 'mr-5', team: '디자인팀 02', type: '주간 회의', title: '주간 진행상황 공유 #24',
    summary: '이번 주 완료된 작업 현황 공유 및 다음 주 계획 확인. 블로커 이슈 3건이 확인되었으며 관련 담당자 지정이 완료되었습니다.',
    aiPoints: ['이번 주 완료 업무 7건, 진행 중 4건, 미착수 2건', '블로커 3건: 에셋 미수령 / 리뷰 지연 / 외부 API 미확정', '다음 주 우선순위: 랜딩 페이지 디자인 완료 + 내부 리뷰'],
    discussions: ['에셋 미수령 건은 마케팅팀에 재요청 예정 (정하은 담당)', '외부 API 확정 지연으로 관련 화면 목업으로 대체 진행 결정', '이번 주 완료율 63% — 목표 80% 대비 저조, 다음 주 만회 계획 필요'],
    script: [
      { time: '00:02', speaker: '박민준', text: '주간 공유 시작합니다. 이번 주 완료 건부터 돌아가며 공유해 주세요.' },
      { time: '03:20', speaker: '이나경', text: '브랜드 가이드 업데이트 완료했습니다. 에셋 파일은 마케팅팀에서 아직 못 받았어요.' },
      { time: '07:10', speaker: '정하은', text: '제가 마케팅팀에 다시 연락해볼게요. 이번 주 안에 받을 수 있을 것 같습니다.' },
      { time: '12:45', speaker: 'Jihye', text: '외부 API가 아직 확정이 안 됐는데, 관련 화면은 목업으로 먼저 진행하는 게 좋을 것 같아요.' },
      { time: '18:30', speaker: '박민준', text: '완료율이 63%라 다음 주에 좀 더 속도를 내야 할 것 같습니다. 각자 블로커 빠르게 해소 부탁드립니다.' },
    ],
    actionItems: [
      { id: 'act-mr5-1', text: '마케팅팀 에셋 재요청 및 수령', dueDate: '2026-05-31', assignee: '정하은', done: true, addedToWeekly: false },
      { id: 'act-mr5-2', text: '외부 API 대체 목업 화면 작성', dueDate: '2026-06-02', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr5-3', text: '다음 주 완료율 80% 달성 계획 공유', dueDate: '2026-06-01', assignee: '박민준', done: false, addedToWeekly: false },
    ],
    date: '2026-05-29', author: '박민준', duration: '25:10', attendees: 4, attendeeNames: ['박민준', '이나경', '정하은', 'Jihye'] },
    { id: 'mr-6', team: '디자인팀 03', type: '워크샵', title: 'UX 리서치 워크샵',
    summary: '사용자 인터뷰 결과 공유 및 페르소나 재정립. 주요 사용자 니즈 기반 개선 방향성 설정 합의가 이루어졌습니다.',
    aiPoints: ['사용자 인터뷰 18건 분석 완료 — 주요 페인포인트 5가지 도출', '기존 페르소나 3종 → 4종으로 재정립 (신규: 중간관리자형 추가)', '개선 우선순위: 온보딩 플로우 간소화 > 알림 설정 > 검색 기능', '다음 분기 리서치 주제: 모바일 사용 패턴 분석'],
    discussions: ['인터뷰 참여자 중 70%가 온보딩 복잡성을 가장 큰 불편으로 꼽음', '페르소나 4번째 유형(중간관리자) 추가는 전원 합의', 'B2B 고객과 개인 사용자 간 니즈 차이 명확히 구분 필요'],
    script: [
      { time: '00:05', speaker: '최지영', text: '워크샵 시작합니다. 먼저 김도현님이 인터뷰 결과 요약을 공유해 주세요.' },
      { time: '05:30', speaker: '김도현', text: '18건 인터뷰 분석 결과, 가장 많이 나온 페인포인트는 온보딩이었습니다. 전체 70%가 언급했어요.' },
      { time: '18:20', speaker: '박서연', text: '기존 페르소나 3종에서 중간관리자 유형이 빠져 있었는데, 이번에 추가하는 게 좋겠어요.' },
      { time: '35:00', speaker: 'Jihye', text: '개선 우선순위는 온보딩 간소화를 1순위로 하고, 알림 설정과 검색을 그다음으로 잡으면 어떨까요?' },
      { time: '52:40', speaker: '이수진', text: '다음 분기 리서치는 모바일 사용 패턴으로 하면 제품 방향성 잡는 데 도움이 될 것 같습니다.' },
    ],
    actionItems: [
      { id: 'act-mr6-1', text: '페르소나 4종 문서 업데이트 및 팀 배포', dueDate: '2026-06-06', assignee: '김도현', done: false, addedToWeekly: false },
      { id: 'act-mr6-2', text: '온보딩 플로우 개선안 초안 작성', dueDate: '2026-06-10', assignee: 'Jihye', done: false, addedToWeekly: false },
      { id: 'act-mr6-3', text: '다음 분기 리서치 계획서 작성', dueDate: '2026-06-13', assignee: '최지영', done: false, addedToWeekly: false },
    ],
    startDate: '2026-05-30', endDate: '2026-05-30', author: '최지영', duration: '1:24:15', attendees: 8, attendeeNames: ['최지영', '김도현', '박서연', '이수진', 'Jihye', '최유진', '정하은', '이나경'] },
    { id: 'mr-7', team: '디자인팀 04', type: '업무 보고', title: '월간 성과 보고 — 5월',
    summary: '5월 주요 달성 지표 및 미달성 항목 리뷰. 6월 집중 개선 과제 3가지 합의 및 담당자 배정이 완료되었습니다.',
    aiPoints: ['5월 완료율 78% (목표 85% 대비 -7%)', '미달성 원인: 외부 의존성 지연 2건, 요구사항 변경 1건', '6월 개선 과제 3가지: 리뷰 사이클 단축 / 스펙 동결 기준 수립 / 일정 버퍼 확보', '팀 전반 번아웃 징후 감지 — 업무량 조정 검토 필요'],
    discussions: ['목표 대비 7% 부족한 원인이 외부 요인인지 내부 프로세스 문제인지 분석 필요', '리뷰 사이클이 길어지는 구간(개발 핸드오프 이후)에 병목 집중', '6월에는 스펙 동결 기준을 착수 3일 전으로 명확히 설정하기로 합의'],
    script: [
      { time: '00:04', speaker: '강지훈', text: '5월 성과 보고 시작합니다. 완료율 78%로 목표에 7% 미달했습니다.' },
      { time: '08:15', speaker: '이수진', text: '외부 의존성 지연이 주된 원인이었어요. 특히 데이터 API 확정이 2주 지연됐습니다.' },
      { time: '15:30', speaker: 'Jihye', text: '리뷰 사이클을 줄이면 도움이 될 것 같아요. 핸드오프 이후 구간에서 병목이 심한 것 같습니다.' },
      { time: '28:00', speaker: '강지훈', text: '6월은 스펙 동결 기준을 착수 3일 전으로 잡겠습니다. 변경 요청은 그 이전에만 수용합니다.' },
      { time: '38:45', speaker: '최유진', text: '팀원들이 좀 지쳐 있는 것 같아요. 6월에는 업무량 조정을 함께 고려해 주시면 좋겠습니다.' },
    ],
    actionItems: [
      { id: 'act-mr7-1', text: '리뷰 사이클 단축 방안 문서화', dueDate: '2026-06-03', assignee: '이수진', done: false, addedToWeekly: false },
      { id: 'act-mr7-2', text: '스펙 동결 기준 가이드라인 작성 및 공유', dueDate: '2026-06-03', assignee: '강지훈', done: false, addedToWeekly: false },
      { id: 'act-mr7-3', text: '6월 업무량 조정 계획 제출', dueDate: '2026-06-05', assignee: 'Jihye', done: false, addedToWeekly: false },
    ],
    date: '2026-05-28', author: '강지훈', duration: '47:33', attendees: 7, attendeeNames: ['강지훈', 'Jihye', '이수진', '박서연', '김도현', '최유진', '이나경'] },
    { id: 'mr-8', team: '디자인팀 05', type: '기술 공유', title: 'Figma 컴포넌트 최적화 세션',
    summary: '팀 내 Figma 라이브러리 구조 개선 방안 공유. 재사용 가능한 컴포넌트 설계 패턴 정립 및 스타일 토큰 일원화 논의가 진행되었습니다.',
    aiPoints: ['현재 Figma 라이브러리 컴포넌트 수 214개 → 중복·미사용 47개 정리 예정', '스타일 토큰 체계 Color/Spacing/Typography 3계층으로 일원화', 'Auto Layout 미적용 컴포넌트 32개 일괄 전환 계획', 'Figma Variables 활용한 다크모드 지원 방안 논의'],
    discussions: ['컴포넌트 네이밍 컨벤션 불일치로 검색 효율 저하 — 네이밍 가이드 수립 필요', '스타일 토큰 일원화 후 기존 화면에 일괄 적용하는 방법론 합의 필요', '다크모드 지원은 현 시점 우선순위에서 제외, 토큰 구조만 준비'],
    script: [
      { time: '00:03', speaker: '윤소영', text: '오늘은 Figma 라이브러리 최적화 방법을 공유할게요. 현재 214개 컴포넌트 중 47개가 중복이에요.' },
      { time: '10:20', speaker: 'Jihye', text: '네이밍이 팀마다 달라서 검색이 너무 힘들어요. 컨벤션 가이드가 꼭 필요할 것 같습니다.' },
      { time: '22:00', speaker: '정하은', text: '스타일 토큰을 Color·Spacing·Typography로 나누면 관리가 훨씬 쉬워질 것 같아요.' },
      { time: '35:10', speaker: '박서연', text: 'Auto Layout 안 된 컴포넌트 32개는 제가 순차적으로 전환 작업할게요.' },
      { time: '44:30', speaker: '윤소영', text: '다크모드는 지금 당장은 우선순위에서 빼고, 토큰 구조만 미리 잡아두는 방향으로 합시다.' },
    ],
    actionItems: [
      { id: 'act-mr8-1', text: '컴포넌트 네이밍 컨벤션 가이드 작성', dueDate: '2026-06-03', assignee: '윤소영', done: false, addedToWeekly: false },
      { id: 'act-mr8-2', text: 'Auto Layout 미적용 컴포넌트 전환', dueDate: '2026-06-10', assignee: '박서연', done: false, addedToWeekly: false },
      { id: 'act-mr8-3', text: '스타일 토큰 일원화 작업 착수', dueDate: '2026-06-07', assignee: '정하은', done: false, addedToWeekly: false },
    ],
    date: '2026-05-27', author: '윤소영', duration: '52:41', attendees: 5, attendeeNames: ['윤소영', 'Jihye', '정하은', '박서연', '최유진'] },
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
  const order = { 고정: 0, 긴급: 1, 일반: 2 };
  return (order[a.type] - order[b.type]) || a.title.localeCompare(b.title, 'ko');
}

function typeIconClass(type) {
  if (type === '고정') return 'pin';
  if (type === '긴급') return 'red';
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
    } else {
      period = `${item.start.slice(5).replace('-', '.')} ~ ${item.end.slice(5).replace('-', '.')}`;
    }
    const iconHtml = item.type === '고정'
      ? pinSvg
      : `<span class="type-icon ${item.type === '긴급' ? 'red' : 'gray'}"></span>`;
    return `
      <div class="task-item${isLastFixed ? ' is-last-fixed' : ''}" data-task-id="${item.id}" role="button" tabindex="0">
        ${iconHtml}
        <span class="task-body">
          <span class="task-name">${escapeHtml(item.title)}</span>
          <span class="task-period">${calIcon}${period}${delayed ? '<span class="badge-delayed">지연중</span>' : ''}</span>
        </span>
        <button type="button" class="task-edit-btn" data-edit-task-id="${item.id}" title="업무 수정">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
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
          <span class="day-date">${day.date.slice(5).replace('-', '/')}</span>
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
  const sessions = visibleSessions().filter(s => s.workItemId === item.id && s.date === state.today);
  const isFixed = draft.type === '고정';
  const rd = draft.recurringDays || [1];
  const DAY_LABELS = ['월', '화', '수', '목', '금'];

  const isDirty = draft.title !== item.title
    || draft.type !== item.type
    || draft.end !== (item.end || '')
    || draft.description !== (item.description || '')
    || JSON.stringify(rd) !== JSON.stringify(item.recurringDays || []);

  const dateRowHtml = isFixed
    ? `<div class="dw-field-2col">
        <label class="dw-field"><span>시작일</span>
          <input type="date" value="${item.start}" disabled style="opacity:0.5;cursor:default" />
        </label>
        <label class="dw-field"><span>종료일 <span class="dw-field-optional">미입력 시 무기한</span></span>
          <input type="date" id="detailEndDate" value="${draft.end}" />
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
          <input type="date" value="${item.start}" disabled style="opacity:0.5;cursor:default" />
        </label>
        <label class="dw-field"><span>마감일</span>
          <input type="date" id="detailEndDate" value="${draft.end}" />
        </label>
      </div>`;

  const sessionsHtml = sessions.length
    ? sessions.map(s => {
        const cat = CAT_COLORS[s.category] || { bg: '#f3f4f6', color: '#6b7280' };
        return `
          <div class="detail-session-item">
            <span class="detail-session-dot ${s.done ? 'done' : 'pending'}"></span>
            <span class="detail-session-name">${escapeHtml(s.title)}</span>
            <span class="detail-session-cat" style="background:${cat.bg};color:${cat.color}">${escapeHtml(s.category)}</span>
            <span class="detail-session-time">${s.startTime}~${s.endTime}</span>
          </div>`;
      }).join('')
    : '<p style="font-size:12px;color:var(--muted)">등록된 작업세션이 없습니다.</p>';

  document.getElementById('detailPanelBody').innerHTML = `
    <div class="detail-form">
      ${delayed ? '<span class="badge-delayed" style="align-self:flex-start">지연중</span>' : ''}

      <label class="dw-field">
        <span>업무명</span>
        <input id="detailTitle" value="${escapeHtml(draft.title)}" placeholder="업무명을 입력하세요" style="font-weight:600" />
      </label>

      <label class="dw-field">
        <span>업무유형</span>
        <select id="detailType">
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

      <div>
        <p class="detail-section-title">참여자</p>
        <div class="detail-participants">
          ${(item.participants || []).map(name => `
            <div class="detail-participant-chip">
              <div class="avatar">${name[0]}</div>
              <span>${escapeHtml(name)}</span>
            </div>`).join('')}
        </div>
      </div>

      <div>
        <p class="detail-section-title">오늘 작업세션 (${sessions.length}개)</p>
        <div class="detail-session-list">${sessionsHtml}</div>
      </div>
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
  // Reset draft to match saved
  state.detailDraft = { ...draft, title: item.title, recurringDays: item.recurringDays ? [...item.recurringDays] : [1] };
  renderAll();
  renderDetailPanel();
}

function renderDetailPanelIfOpen() {
  if (state.detailPanelItemId) renderDetailPanel();
}

function renderDailyTodo() {
  const today = state.today;
  const todayWeekday = new Date(today).getDay(); // 1=월~5=금 (JS getDay matches our system for Mon-Fri)

  const todayItems = state.workItems.filter(item => {
    if (item.type === '고정') {
      const rd = item.recurringDays || [1,2,3,4,5];
      return rd.includes(todayWeekday) && item.start <= today && (item.end === null || item.end >= today);
    }
    return item.start <= today && item.end >= today;
  });

  if (!todayItems.length) {
    $('#sessionList').innerHTML = '<div class="empty-state">오늘 해당하는 업무가 없습니다.</div>';
    $('#progressWrap').style.display = 'none';
    return;
  }

  // 인라인 입력창 — 오늘 할 일 최상단에 고정
  let inlineTopHtml = '';
  if (state.inlineAddItemId) {
    const inlineItem = state.workItems.find(w => w.id === state.inlineAddItemId);
    inlineTopHtml = `
      <div class="task-inline-add task-inline-top" data-inline-wrap="${state.inlineAddItemId}">
        <span class="task-inline-label">${escapeHtml(inlineItem?.title || '')}</span>
        <div class="task-inline-fields">
          <select class="task-inline-cat" data-inline-cat="${state.inlineAddItemId}">
            <option value="">카테고리</option>
            ${Object.keys(CAT_COLORS).map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <input class="task-inline-input" type="text"
            placeholder="세부 업무항목 입력 후 Enter"
            data-inline-item="${state.inlineAddItemId}" autocomplete="off" />
        </div>
      </div>`;
  }

  // 오늘 세션 전체 수집 후 시작시간 오름차순 정렬 (시간 없는 것은 맨 아래)
  let allSessions = [];
  todayItems.forEach(item => {
    const sessions = sessionsByItem(item.id).filter(s => s.date === today);
    allSessions.push(...sessions);
  });
  allSessions.sort((a, b) => {
    const hasA = !!a.startTime, hasB = !!b.startTime;
    if (!hasA && !hasB) return 0;
    if (!hasA) return 1;
    if (!hasB) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

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
  const timeMarkup = `
    <div class="session-time-inputs">
      <input type="text" class="session-time-input" placeholder="09:00"
        value="${s.startTime || ''}" data-time-start="${s.id}" />
      <span class="time-sep">~</span>
      <input type="text" class="session-time-input" placeholder="18:00"
        value="${s.endTime || ''}" data-time-end="${s.id}" />
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
        <span class="session-cat ${catClass}">${escapeHtml(s.category)}</span>
        ${titleHtml}
        ${timeMarkup}
      </div>
      <button class="session-del-btn" type="button" data-delete-session="${s.id}">삭제</button>
    </div>
  `;
}

function renderKpis() {
  const today = todaySessions();
  const allWeek = weekSessions();

  const todayMin = today.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0);
  const weekMin  = allWeek.reduce((sum, s) => sum + calcMinutes(s.startTime, s.endTime), 0);
  const done     = today.filter(s => s.done).length;
  const remaining= today.filter(s => !s.done).length;

  const total = today.length;
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
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            ${statusBadge}
            <span class="req-source">${escapeHtml(r.requestTeam)}</span>
          </div>
        </div>
        <div class="req-desc">${escapeHtml(r.detail)}</div>
        <div class="req-meta">${escapeHtml(r.requester)} · 마감 ${r.end.slice(5).replace('-', '/')}</div>
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
  const PRI_CLS = { '긴급': 'ts-pri-urgent', '높음': 'ts-pri-high', '일반': 'ts-pri-normal' };

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
  renderAll();
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
        <label class="action-check">
          <input type="checkbox" ${a.done ? 'checked' : ''} data-toggle-action="${a.id}" data-meeting-id="${m.id}" />
          <span class="action-item-text-label">${escapeHtml(a.text)}</span>
        </label>
        <span class="action-item-meta">${escapeHtml(a.assignee || '')}${a.dueDate ? ' · ' + a.dueDate : ''}</span>
        <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">${addedBadge}${addBtn}</div>
      </div>`;
    }).join('');
    body.innerHTML = `<div class="action-items-list">${items || '<p style="padding:16px;color:var(--muted)">액션아이템 없음</p>'}</div>`;
  }
}

function toggleActionItemDone(actId, meetingId) {
  const m = state.meetings.find(x => x.id === meetingId);
  if (!m) return;
  const a = (m.actionItems || []).find(x => x.id === actId);
  if (!a) return;
  a.done = !a.done;
  renderMeetingDetailPanel(m);
}

function addActionItemToWeekly(actId, meetingId) {
  const m = state.meetings.find(x => x.id === meetingId);
  if (!m) return;
  const a = (m.actionItems || []).find(x => x.id === actId);
  if (!a || a.addedToWeekly) return;

  const today = state.today;
  const dow = new Date(today + 'T00:00:00').getDay() || 1; // default Mon if Sun
  const newItem = {
    id: `wi-act-${Date.now()}`,
    title: a.text,
    description: `[${m.title}] 액션아이템`,
    start: a.dueDate || today,
    end: a.dueDate || today,
    type: '일반',
    participants: [state.currentUser.name],
    sessions: [],
  };
  state.workItems.push(newItem);
  a.addedToWeekly = true;

  renderMeetingDetailPanel(m);

  // flash banner
  const body = document.getElementById('meetingDetailContent');
  if (body) {
    const banner = document.createElement('div');
    banner.className = 'action-added-banner';
    banner.textContent = '"이번 주 업무"에 추가되었습니다';
    body.prepend(banner);
    setTimeout(() => banner.remove(), 2500);
  }
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

  // 요청 정보 표시
  $('#acceptRequestInfo').innerHTML = `
    <div style="font-weight:600;color:#111827;margin-bottom:4px">${escapeHtml(r.title)}</div>
    <div>${escapeHtml(r.detail)}</div>
    <div style="margin-top:4px">${escapeHtml(r.requester)} · ${escapeHtml(r.requestTeam)}</div>
  `;

  // Pre-fill form with request data
  $('#acceptTitle').value = r.title;
  const typeMap = { '긴급': '긴급', '높음': '긴급', '일반': '일반', '고정': '고정' };
  $('#acceptType').value = typeMap[r.priority] || '일반';
  $('#acceptStart').value = r.start;
  $('#acceptEnd').value = r.end;

  $('#acceptModal').classList.remove('hidden');
  setTimeout(() => $('#acceptTitle').focus(), 50);
}

function closeAcceptModal() {
  $('#acceptModal').classList.add('hidden');
}

function submitAcceptForm(e) {
  e.preventDefault();
  const r = state.requests.find(x => x.id === state.selectedRequestId);
  if (!r) return;

  const title = $('#acceptTitle').value.trim();
  const type  = $('#acceptType').value;
  const start = $('#acceptStart').value;
  const end   = $('#acceptEnd').value;
  if (!title || !start || !end) return;

  const newItem = {
    id: `wi-${Date.now()}`,
    title,
    start,
    end,
    type,
    participants: [state.currentUser.name],
    sourceRequestId: r.id,
  };

  state.workItems.push(newItem);
  state.selectedTaskId = newItem.id;
  r.status = '수락';

  // 시작일이 포함된 주로 뷰 이동
  const diffDays = Math.floor((toDate(start) - toDate(BASE_WEEK_START)) / (1000 * 60 * 60 * 24));
  state.weekOffset = Math.floor(diffDays / 7);

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

function renderLeaveTabBar() {
  const tabs = ['내 연차', '팀 연차', '이력'];
  document.getElementById('leaveTabBar').innerHTML = tabs.map(t => `
    <button class="leave-tab-btn${state.leaveTab === t ? ' active' : ''}" data-leave-tab="${t}">${t}</button>
  `).join('');
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
          <span class="leave-row-type">${lv.type}</span>
          ${leaveStatusBadge(lv.status)}
        </div>
        <div class="leave-row-meta">
          <span>📅 ${lv.startDate}${lv.endDate !== lv.startDate ? ' ~ ' + lv.endDate : ''}</span>
          <span>신청일 ${lv.requestedAt}</span>
          ${lv.approverName ? `<span>처리자 ${lv.approverName}</span>` : ''}
        </div>
        ${lv.reason ? `<div class="leave-row-reason">${lv.reason}</div>` : ''}
        ${lv.rejectedReason ? `<div class="leave-row-rejected-reason">반려 사유: ${lv.rejectedReason}</div>` : ''}
      </div>
      <div class="leave-row-actions">${hideActions ? '' : leaveActionBtns(lv)}</div>
    </div>
  `).join('');
}

function renderLeaveList() {
  const tab = state.leaveTab;
  let leaves;
  if (tab === '내 연차') {
    leaves = getMyLeaves().filter(l => l.status === '승인 대기').sort((a, b) => a.startDate.localeCompare(b.startDate));
  } else if (tab === '팀 연차') {
    leaves = state.leaves
      .filter(l => l.applicantId !== state.currentUser.id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    document.getElementById('leaveList').innerHTML = renderLeaveRows(leaves, true);
    return;
  } else { // 이력
    leaves = getMyLeaves()
      .filter(l => l.status === '승인 완료' || l.status === '반려')
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }
  document.getElementById('leaveList').innerHTML = renderLeaveRows(leaves);
}

function renderLeavePage() {
  renderLeaveKpi();
  renderLeaveTabBar();
  renderLeaveList();
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

  const PRI_COLOR = { '긴급': 'var(--red)', '높음': 'var(--orange)', '일반': 'var(--muted)' };
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

    // Task delete button
    const delTaskBtn = e.target.closest('[data-delete-task-id]');
    if (delTaskBtn) { requestDeleteWorkItem(delTaskBtn.dataset.deleteTaskId); return; }

    // Task edit button → open detail panel
    const editBtn = e.target.closest('[data-edit-task-id]');
    if (editBtn) {
      openDetailPanel(editBtn.dataset.editTaskId);
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

    // Task item → open inline input (show sessions in 오늘 할 일 only)
    const taskBtn = e.target.closest('[data-task-id]');
    if (taskBtn && !e.target.closest('[data-edit-task-id]') && !e.target.closest('[data-delete-task-id]') && !e.target.closest('[data-inline-wrap]')) {
      const id = taskBtn.dataset.taskId;
      state.selectedTaskId = id;
      state.inlineAddItemId = state.inlineAddItemId === id ? null : id;
      renderAll();
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

    // Close attendee dropdown on outside click
    const picker = document.getElementById('attendeePicker');
    const dropdown = document.getElementById('attendeeDropdown');
    if (picker && dropdown && !picker.contains(e.target)) {
      dropdown.classList.add('hidden');
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
      const catSel = document.querySelector(`[data-inline-cat="${itemId}"]`);
      const category = catSel ? catSel.value : '';
      state.sessions.push({
        id: `ws-${Date.now()}`,
        workItemId: itemId,
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        category,
        title,
        date: state.today,
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
      const s = state.sessions.find(x => x.id === inp.dataset.editSessionTitle);
      if (s && state.editingSessionOriginalTitle !== null) s.title = state.editingSessionOriginalTitle;
      state.editingSessionId = null;
      state.editingSessionOriginalTitle = null;
      renderDailyTodo();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = state.sessions.find(x => x.id === inp.dataset.editSessionTitle);
      if (s) { const v = inp.value.trim(); if (v) s.title = v; }
      state.editingSessionId = null;
      state.editingSessionOriginalTitle = null;
      renderDailyTodo();
    }
  });

  document.addEventListener('focusout', e => {
    const inp = e.target.closest('[data-edit-session-title]');
    if (!inp) return;
    // cancel on blur (revert)
    const s = state.sessions.find(x => x.id === inp.dataset.editSessionTitle);
    if (s && state.editingSessionOriginalTitle !== null) s.title = state.editingSessionOriginalTitle;
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

  // Enter: 저장 + 재정렬 / Escape: 취소 / Tab: 저장만 (재정렬 없이)
  document.addEventListener('keydown', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (!timeInp) return;
    if (e.key === 'Enter') {
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
    // Tab은 기본 동작(포커스 이동) 허용 — keydown을 막지 않음
  });

  // blur(Tab 포함): 저장하되 재정렬 없음
  document.addEventListener('change', e => {
    const timeInp = e.target.closest('[data-time-start], [data-time-end]');
    if (timeInp) saveTimeInput(timeInp, false);
  });

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
    const toggleBtn = e.target.closest('[data-toggle-action]');
    if (toggleBtn) { toggleActionItemDone(toggleBtn.dataset.toggleAction, toggleBtn.dataset.meetingId); return; }
    const addBtn = e.target.closest('[data-add-action]');
    if (addBtn) { addActionItemToWeekly(addBtn.dataset.addAction, addBtn.dataset.meetingId); return; }
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
  document.getElementById('leaveTabBar')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-leave-tab]');
    if (btn) { state.leaveTab = btn.dataset.leaveTab; renderLeavePage(); }
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
