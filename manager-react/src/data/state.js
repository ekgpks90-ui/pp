import { TODAY_ISO } from './helpers';

// Current user
export const currentUser = {
  id: 'u-1', name: 'Jihye', role: 'Member', team: '디자인팀', onLeave: false, joinDate: '2023-04-03'
};

export const teamMembers = [
  { id: 'u-1', name: 'Jihye', role: 'UI/UX Designer', team: '디자인팀', onLeave: false, leaveType: null },
  { id: 'u-2', name: '이나경', role: 'Brand Designer', team: '디자인팀', onLeave: false, leaveType: null },
  { id: 'u-3', name: '박서연', role: 'Motion Designer', team: '디자인팀', onLeave: false, leaveType: null },
  { id: 'u-4', name: '김도현', role: 'UX Researcher', team: '디자인팀', onLeave: true, leaveType: '오전 반차' },
  { id: 'u-5', name: '최유진', role: 'Product Designer', team: '디자인팀', onLeave: false, leaveType: null },
  { id: 'u-6', name: '정하은', role: 'Visual Designer', team: '디자인팀', onLeave: false, leaveType: null },
  { id: 'u-7', name: '장준혁', role: 'Design Lead', team: '디자인팀', onLeave: false, leaveType: null },
];

export const workItems = [
  // 회의 업무항목
  { id: 'wi-mtg-1', title: '디자인 QA 체크포인트', start: '2026-06-18', end: '2026-06-18', type: '회의', meetingTime: '14:30', participants: ['Jihye', '최유진', '박서연', '이나경', '장준혁'] },
  // 고정업무
  { id: 'wi-1', title: '주간 디자인 싱크 미팅', start: '2026-06-01', end: null, type: '고정', recurringDays: [1], participants: ['Jihye', '장준혁'] },
  { id: 'wi-2', title: '일일 작업 기록', start: '2026-06-01', end: null, type: '고정', recurringDays: [1,2,3,4,5], participants: ['Jihye'] },
  { id: 'wi-3', title: '디자인 리뷰 미팅', start: '2026-06-01', end: null, type: '고정', recurringDays: [2,4], participants: ['Jihye'] },
  { id: 'wi-4', title: 'Figma 라이브러리 정리', start: '2026-06-01', end: null, type: '고정', recurringDays: [5], participants: ['Jihye'] },
  // 긴급업무
  { id: 'wi-5', title: '(주)모아커머스 앱 리뉴얼', start: '2026-06-11', end: '2026-06-18', type: '긴급', participants: ['Jihye', '최유진', '박서연', '장준혁'], sourceRequestId: 'wr-r1' },
  { id: 'wi-6', title: '(주)그린푸드 프로모션 배너', start: '2026-06-12', end: '2026-06-17', type: '긴급', participants: ['Jihye', '정하은', '이나경'], sourceRequestId: 'wr-r2' },
  // 일반업무
  { id: 'wi-7', title: '테크스타트 서비스 UI/UX', start: '2026-06-09', end: '2026-06-20', type: '일반', participants: ['Jihye', '최유진', '김도현', '장준혁'], sourceRequestId: 'wr-r3' },
  { id: 'wi-8', title: '디자인 시스템 컴포넌트 정리', start: '2026-06-02', end: '2026-06-27', type: '일반', participants: ['Jihye'] },
  { id: 'wi-9', title: '스카이벤처스 UX 리서치', start: '2026-06-10', end: '2026-06-20', type: '일반', participants: ['Jihye', '김도현', '최유진', '장준혁'], sourceRequestId: 'wr-r4' },
  { id: 'wi-10', title: '블루밍헬스 리브랜딩', start: '2026-06-09', end: '2026-06-24', type: '일반', participants: ['Jihye', '이나경', '정하은', '장준혁'], sourceRequestId: 'wr-r5' },
  { id: 'wi-11', title: '핏라이프 모바일 앱', start: '2026-06-13', end: '2026-06-23', type: '일반', participants: ['Jihye', '최유진', '김도현'], sourceRequestId: 'wr-r6' },
  { id: 'wi-12', title: '핏라이프 랜딩 페이지', start: '2026-06-16', end: '2026-06-24', type: '일반', participants: ['Jihye', '정하은', '이나경'], sourceRequestId: 'wr-r7' },
  { id: 'wi-13', title: '(주)모아커머스 아이콘 세트', start: '2026-06-23', end: '2026-06-30', type: '일반', participants: ['Jihye', '윤소이', '정하은', '장준혁'], sourceRequestId: 'wr-r8' },
  { id: 'wi-14', title: '주간 업무 보고서 작성', start: '2026-06-01', end: null, type: '일반', recurringDays: [5], participants: ['Jihye'] },
  { id: 'wi-15', title: '(주)모아커머스 QA 지원', start: '2026-06-09', end: '2026-06-20', type: '긴급', recurringDays: [1,2,3,4,5], participants: ['Jihye', '최유진', '장준혁'], sourceRequestId: 'wr-r9' },
  { id: 'wi-16', title: '넥스트에듀 서비스 소개 영상', start: '2026-06-15', end: '2026-06-25', type: '일반', participants: ['Jihye', '박서연', '정하은', '장준혁'], sourceRequestId: 'wr-r10' },
  { id: 'wi-17', title: '하이브뷰티 제품 카탈로그', start: '2026-06-12', end: '2026-06-20', type: '일반', participants: ['Jihye', '이나경', '정하은', '장준혁'], sourceRequestId: 'wr-r11' },
];

export const sessions = [
  // Today sessions (dynamic date)
  { id: 'ws-1', workItemId: 'wi-9', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '최종 디자인 확정', startTime: '', endTime: '', done: false },
  { id: 'ws-2', workItemId: 'wi-5', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '최종 디자인 확정', startTime: '', endTime: '', done: false },
  { id: 'ws-3', workItemId: 'wi-16', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '1차 피드백', startTime: '', endTime: '', done: false },
  { id: 'ws-4', workItemId: 'wi-15', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '1차 피드백', startTime: '', endTime: '', done: false },
  // Past sessions (only enough for Home page KPIs)
  { id: 'ws-h24', workItemId: 'wi-1', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획', title: '주간 디자인 싱크 진행', startTime: '09:00', endTime: '10:00', done: true },
  { id: 'ws-h25', workItemId: 'wi-7', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획', title: '2차 피드백', startTime: '10:00', endTime: '11:30', done: true },
  { id: 'ws-h26', workItemId: 'wi-16', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획', title: '브리핑 & 계약', startTime: '14:30', endTime: '15:30', done: true },
  { id: 'ws-h27', workItemId: 'wi-10', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-15', category: '기획', title: '1차 피드백', startTime: '16:30', endTime: '18:00', done: true },
  { id: 'ws-h28', workItemId: 'wi-3', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '디자인', title: '디자인 리뷰', startTime: '14:00', endTime: '15:30', done: true },
  { id: 'ws-h29', workItemId: 'wi-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획', title: '브리핑 & 계약', startTime: '09:00', endTime: '09:30', done: true },
  { id: 'ws-h30', workItemId: 'wi-12', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-16', category: '기획', title: '콘셉트 기획', startTime: '12:00', endTime: '13:00', done: true },
  { id: 'ws-h33', workItemId: 'wi-6', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '디자인', title: '최종 디자인 확정', startTime: '09:00', endTime: '10:00', done: true },
  { id: 'ws-h34', workItemId: 'wi-15', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획', title: '브리핑 & 계약', startTime: '12:00', endTime: '13:00', done: true },
  { id: 'ws-h35', workItemId: 'wi-15', authorId: 'u-1', authorName: 'Jihye', date: '2026-06-17', category: '기획', title: '2차 피드백', startTime: '14:30', endTime: '16:00', done: true },
  // Today-specific sessions for other items
  { id: 'ws-t22', workItemId: 'wi-7', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '최종 디자인 확정', startTime: '', endTime: '', done: false },
  { id: 'ws-t46', workItemId: 'wi-10', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '최종 디자인 확정', startTime: '', endTime: '', done: false },
  { id: 'ws-t58', workItemId: 'wi-11', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '2차 피드백', startTime: '', endTime: '', done: false },
  { id: 'ws-t59', workItemId: 'wi-11', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '디자인', title: '최종 디자인 확정', startTime: '', endTime: '', done: false },
  { id: 'ws-t68', workItemId: 'wi-12', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '1차 피드백', startTime: '', endTime: '', done: false },
  { id: 'ws-t103', workItemId: 'wi-17', authorId: 'u-1', authorName: 'Jihye', date: TODAY_ISO, category: '기획', title: '2차 피드백', startTime: '', endTime: '', done: false },
];

export const meetings = [
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
    date: '2026-05-30', startTime: '09:30', author: '김도현', duration: '1:24:15', attendees: 6, attendeeNames: ['김도현', '장준혁', '박서연', 'Jihye', '최유진', '정하은'] },
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
];

export const requests = [
  { id: 'wr-1', title: '신제품 론칭 SNS 배너', detail: '7월 신제품 론칭에 맞춰 인스타그램·페이스북용 배너 각 2종씩 제작 요청드립니다.', requester: '김지수', start: '2026-06-18', end: '2026-06-23', priority: '긴급', status: '수락 대기' },
  { id: 'wr-2', title: '채용 공고 포스터 디자인', detail: 'UI 디자이너 채용 공고 포스터 제작 부탁드립니다.', requester: '박소현', start: '2026-06-18', end: '2026-06-24', priority: '일반', status: '수락 대기' },
  { id: 'wr-3', title: '신규 서비스 인트로 모션', detail: '앱 첫 진입 시 재생되는 15초 인트로 모션 그래픽이 필요합니다.', requester: '이준호', start: '2026-06-19', end: '2026-06-27', priority: '일반', status: '수락 대기' },
];

export const assignmentRequests = [
  { id: 'ar-1', title: '신제품 론칭 SNS 배너 제작', team: '마케팅팀', hours: 12, deadline: '2026-06-23', priority: '긴급', status: '수락대기중', assignees: ['Jihye', '최유진'], processId: 'pc-3', stepAssignees: { 'ps-3-02': ['Jihye'], 'ps-3-04': ['Jihye', '최유진'], 'ps-3-07': ['최유진'] } },
  { id: 'ar-2', title: '채용 공고 포스터 디자인', team: 'HR팀', hours: 6, deadline: '2026-06-24', priority: '일반', status: '수락대기중', assignees: ['Jihye'], processId: 'pc-2', stepAssignees: { 'ps-2-04': ['Jihye'], 'ps-2-10': ['Jihye'], 'ps-2-12': ['정하은'] } },
  { id: 'ar-3', title: '신규 서비스 인트로 모션', team: '기획팀', hours: 16, deadline: '2026-06-27', priority: '일반', status: '수락대기중', assignees: ['Jihye', '박서연'], processId: 'pc-4', stepAssignees: { 'ps-4-02': ['Jihye'], 'ps-4-05': ['박서연'], 'ps-4-06': ['박서연'] } },
  { id: 'ar-4', title: '서비스 소개 브로셔 리디자인', team: '기획팀', hours: 8, deadline: '2026-06-25', priority: '일반', status: '재배정', assignees: [], processId: 'pc-2', stepAssignees: {} },
  { id: 'ar-5', title: '앱 스토어 스크린샷 업데이트', team: '기획팀', hours: 4, deadline: '2026-06-20', priority: '일반', status: '신규요청', assignees: [], processId: 'pc-3', stepAssignees: {} },
  { id: 'ar-6', title: '브랜드 소개 영상 30초', team: '마케팅팀', hours: 20, deadline: '2026-06-30', priority: '일반', status: '신규요청', assignees: [], processId: 'pc-4', stepAssignees: {} },
  { id: 'ar-7', title: '파트너사 공동 이벤트 키비주얼', team: '마케팅팀', hours: 20, deadline: '2026-06-27', priority: '일반', status: '수락대기중', assignees: ['이나경'], processId: 'pc-3', stepAssignees: {} },
  { id: 'ar-8', title: '분기 성과 인포그래픽 제작', team: '경영팀', hours: 10, deadline: '2026-06-28', priority: '일반', status: '수락대기중', assignees: ['박서연', '최유진'], processId: 'pc-3', stepAssignees: {} },
  { id: 'ar-9', title: '모바일 앱 아이콘 세트 리뉴얼', team: '기획팀', hours: 14, deadline: '2026-06-30', priority: '일반', status: '배정완료', assignees: ['정하은', 'Jihye'], processId: 'pc-1', stepAssignees: {} },
]

export const processes = [
  {
    id: 'pc-1', category: 'UI/UX 디자인',
    steps: [
      { id: 'ps-1-01', title: '브리핑 & 계약' }, { id: 'ps-1-02', title: '리서치 (사용자/경쟁사)' },
      { id: 'ps-1-03', title: '정보구조도(IA) 설계' }, { id: 'ps-1-04', title: '와이어프레임 제작' },
      { id: 'ps-1-05', title: '와이어프레임 피드백' }, { id: 'ps-1-06', title: '1차 UI 디자인' },
      { id: 'ps-1-07', title: '1차 수정' }, { id: 'ps-1-08', title: '2차 UI 디자인' },
      { id: 'ps-1-09', title: '2차 수정' }, { id: 'ps-1-10', title: '프로토타입 제작' },
      { id: 'ps-1-11', title: '사용성 테스트' }, { id: 'ps-1-12', title: '최종 디자인 확정' },
      { id: 'ps-1-13', title: '개발 핸드오프' }, { id: 'ps-1-14', title: '디자인 QA' },
    ],
  },
  {
    id: 'pc-2', category: '브랜드 & 인쇄물',
    steps: [
      { id: 'ps-2-01', title: '브리핑 & 계약' }, { id: 'ps-2-02', title: '리서치 (시장/경쟁사)' },
      { id: 'ps-2-03', title: '콘셉트 기획' }, { id: 'ps-2-04', title: '시안 제작' },
      { id: 'ps-2-05', title: '1차 피드백' }, { id: 'ps-2-06', title: '1차 수정' },
      { id: 'ps-2-07', title: '2차 시안 제작' }, { id: 'ps-2-08', title: '2차 피드백' },
      { id: 'ps-2-09', title: '2차 수정' }, { id: 'ps-2-10', title: '최종 디자인 확정' },
      { id: 'ps-2-11', title: '인쇄 사양 확인' }, { id: 'ps-2-12', title: '파일 납품' },
    ],
  },
  {
    id: 'pc-3', category: '디지털 콘텐츠',
    steps: [
      { id: 'ps-3-01', title: '브리핑 & 계약' }, { id: 'ps-3-02', title: '콘셉트 기획' },
      { id: 'ps-3-03', title: '카피 & 구성안 작성' }, { id: 'ps-3-04', title: '시안 제작' },
      { id: 'ps-3-05', title: '1차 피드백' }, { id: 'ps-3-06', title: '1차 수정' },
      { id: 'ps-3-07', title: '최종 디자인 확정' }, { id: 'ps-3-08', title: '파일 납품' },
    ],
  },
  {
    id: 'pc-4', category: '영상 & 모션',
    steps: [
      { id: 'ps-4-01', title: '브리핑 & 계약' }, { id: 'ps-4-02', title: '스토리보드 작성' },
      { id: 'ps-4-03', title: '스토리보드 피드백' }, { id: 'ps-4-04', title: '스크립트 & 보이스 녹음' },
      { id: 'ps-4-05', title: '1차 편집' }, { id: 'ps-4-06', title: '1차 피드백' },
      { id: 'ps-4-07', title: '1차 수정' }, { id: 'ps-4-08', title: '최종 편집' },
      { id: 'ps-4-09', title: '최종 디자인 확정' }, { id: 'ps-4-10', title: '파일 납품' },
    ],
  },
]

export const leaves = [
  { id: 'lv-1', applicantId: 'u-2', applicantName: '김민준', applicantRole: 'Member', type: '종일 연차', startDate: '2026-06-16', endDate: '2026-06-16', reason: '개인 사정으로 휴가 신청드립니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-10' },
  { id: 'lv-2', applicantId: 'u-3', applicantName: '이수진', applicantRole: 'Member', type: '오전 반차', startDate: '2026-06-13', endDate: '2026-06-13', reason: '병원 예약이 있어 오전 반차 신청합니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-11' },
  { id: 'lv-3', applicantId: 'u-1', applicantName: 'Jihye', applicantRole: 'Manager', type: '종일 연차', startDate: '2026-06-20', endDate: '2026-06-22', reason: '연차 소진 목적으로 신청합니다.', status: '승인 대기', approverId: null, approverName: null, rejectedReason: null, requestedAt: '2026-06-09' },
  { id: 'lv-4', applicantId: 'u-4', applicantName: '박민준', applicantRole: 'Member', type: '오후 반차', startDate: '2026-06-10', endDate: '2026-06-10', reason: '개인 일정이 있습니다.', status: '승인 완료', approverId: 'u-1', approverName: 'Jihye', rejectedReason: null, requestedAt: '2026-06-07' },
  { id: 'lv-5', applicantId: 'u-1', applicantName: 'Jihye', applicantRole: 'Manager', type: '오전 반차', startDate: '2026-05-30', endDate: '2026-05-30', reason: '개인 사정.', status: '승인 완료', approverId: 'u-0', approverName: '대표', rejectedReason: null, requestedAt: '2026-05-28' },
  { id: 'lv-6', applicantId: 'u-2', applicantName: '김민준', applicantRole: 'Member', type: '종일 연차', startDate: '2026-05-22', endDate: '2026-05-24', reason: '여행 계획이 있습니다.', status: '반려', approverId: 'u-1', approverName: 'Jihye', rejectedReason: '해당 날짜 주요 납품 일정이 있어 반려합니다.', requestedAt: '2026-05-19' },
]

export const totalLeave = 15

export const notifications = [
  { id: 'n-1', title: '업무 요청', requestTitle: '신제품 론칭 SNS 배너', body: '김지수님이 디자인팀에 업무를 요청했습니다.', unread: true },
  { id: 'n-2', title: '업무 요청', requestTitle: '채용 공고 포스터 디자인', body: '박소현님이 디자인팀에 업무를 요청했습니다.', unread: true },
  { id: 'n-3', title: '업무 요청', requestTitle: '신규 서비스 인트로 모션', body: '이준호님이 디자인팀에 업무를 요청했습니다.', unread: false },
];
