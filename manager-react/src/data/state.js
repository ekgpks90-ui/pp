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

export const requests = [
  { id: 'wr-1', title: '신제품 론칭 SNS 배너', detail: '7월 신제품 론칭에 맞춰 인스타그램·페이스북용 배너 각 2종씩 제작 요청드립니다.', requester: '김지수', start: '2026-06-18', end: '2026-06-23', priority: '긴급', status: '수락 대기' },
  { id: 'wr-2', title: '채용 공고 포스터 디자인', detail: 'UI 디자이너 채용 공고 포스터 제작 부탁드립니다.', requester: '박소현', start: '2026-06-18', end: '2026-06-24', priority: '일반', status: '수락 대기' },
  { id: 'wr-3', title: '신규 서비스 인트로 모션', detail: '앱 첫 진입 시 재생되는 15초 인트로 모션 그래픽이 필요합니다.', requester: '이준호', start: '2026-06-19', end: '2026-06-27', priority: '일반', status: '수락 대기' },
];

export const notifications = [
  { id: 'n-1', title: '업무 요청', requestTitle: '신제품 론칭 SNS 배너', body: '김지수님이 디자인팀에 업무를 요청했습니다.', unread: true },
  { id: 'n-2', title: '업무 요청', requestTitle: '채용 공고 포스터 디자인', body: '박소현님이 디자인팀에 업무를 요청했습니다.', unread: true },
  { id: 'n-3', title: '업무 요청', requestTitle: '신규 서비스 인트로 모션', body: '이준호님이 디자인팀에 업무를 요청했습니다.', unread: false },
];
