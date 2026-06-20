import { useEffect } from 'react'
import AcceptModal from './AcceptModal'
import RejectModal from './RejectModal'
import ConfirmModal from './ConfirmModal'
import RequestDetailModal from './RequestDetailModal'
import TaskDrawer from './TaskDrawer'
import MeetingSaveModal from './MeetingSaveModal'
import AssignModal from './AssignModal'
import NewRequestModal from './NewRequestModal'
import DetailPanel from './DetailPanel'
import { processes, teamMembers } from '../data/state'

// fixed 엘리먼트를 부모 div 안에 가두는 CSS 트릭
const trap = {
  position: 'relative',
  transform: 'translateZ(0)',
  overflow: 'hidden',
  borderRadius: 16,
  border: '1px solid #e8e8ed',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  background: '#f4f4f6',
}

function ModalSlot({ label, width = 480, height = 520, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#72728a', marginBottom: 8, letterSpacing: '-0.01em' }}>
        {label}
      </div>
      <div style={{ ...trap, width, height }}>
        {children}
      </div>
    </div>
  )
}

const noop = () => {}

const sampleRequest = {
  id: 'r-1',
  title: '모바일 앱 API 연동',
  detail: '모바일 앱 신규 기능을 위한 REST API 설계 및 개발이 필요합니다.',
  requester: '김민준',
  start: '2026-06-19',
  end: '2026-06-30',
  status: '수락 대기',
  priority: '긴급',
  processId: null,
  selectedSteps: [],
  stepAssignees: {},
}

const sampleRequestRejected = {
  ...sampleRequest,
  id: 'r-2',
  title: 'UI 컴포넌트 리팩토링',
  status: '거절',
  priority: '일반',
  rejectReason: '담당 범위 아님',
  rejectDetail: '디자인팀에서 진행해야 하는 작업입니다.',
}

const sampleWorkItem = {
  id: 'wi-1',
  title: '대시보드 UI 수정',
  type: '일반',
  start: '2026-06-17',
  end: '2026-06-21',
  description: '홈 대시보드 전반적인 UI 개선 작업',
  participants: ['Jihye', '이서연'],
}

const sampleMeeting = {
  id: 'm-1',
  title: '스프린트 리뷰',
  team: '개발팀',
  type: '주간 회의',
  date: '2026-06-19',
  summary: '이번 스프린트 결과물 검토 및 다음 스프린트 계획 논의',
  attendeeNames: ['Jihye', '김민준', '이서연'],
  duration: '45:20',
  actionItems: [
    { id: 'ai-1', text: 'API 문서 업데이트', assignee: '박지훈', done: false },
    { id: 'ai-2', text: '디자인 QA 진행', assignee: '이서연', done: true },
  ],
}

const sampleAssignReq = {
  id: 'ar-1',
  title: '모바일 앱 API 연동',
  team: '개발팀',
  deadline: '2026-06-30',
  priority: '긴급',
  status: '신규요청',
  assignees: [],
  stepAssignees: {},
}

export default function ModalShowcase() {
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [])

  return (
    <div style={{ background: '#f4f4f6', minHeight: '100vh', padding: '40px 48px', fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d0d14', marginBottom: 8 }}>Modal Showcase</h1>
      <p style={{ fontSize: 13, color: '#72728a', marginBottom: 40 }}>
        WorkFlow Hub — 모든 모달 & 드로어 · html.to.design 캡처용
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>

        {/* 1. 업무 요청 수락 */}
        <ModalSlot label="업무 요청 수락 (AcceptModal)" width={480} height={420}>
          <AcceptModal
            request={sampleRequest}
            processes={processes}
            onClose={noop}
            onSubmit={noop}
          />
        </ModalSlot>

        {/* 2. 업무 요청 거절 */}
        <ModalSlot label="업무 요청 거절 (RejectModal)" width={460} height={500}>
          <RejectModal
            request={sampleRequest}
            onClose={noop}
            onSubmit={noop}
          />
        </ModalSlot>

        {/* 3. 삭제 확인 */}
        <ModalSlot label="삭제 확인 (ConfirmModal)" width={420} height={240}>
          <ConfirmModal
            title="업무 삭제"
            message='"대시보드 UI 수정" 업무와 관련된 모든 작업 세션이 삭제됩니다. 계속하시겠습니까?'
            onConfirm={noop}
            onCancel={noop}
          />
        </ModalSlot>

        {/* 4. 업무 요청 상세 (수락 대기) */}
        <ModalSlot label="업무 요청 상세 — 수락 대기 (RequestDetailModal)" width={460} height={360}>
          <RequestDetailModal
            request={sampleRequest}
            processes={processes}
            onClose={noop}
            onAccept={noop}
            onReject={noop}
          />
        </ModalSlot>

        {/* 5. 업무 요청 상세 (거절됨) */}
        <ModalSlot label="업무 요청 상세 — 거절됨 (RequestDetailModal)" width={460} height={400}>
          <RequestDetailModal
            request={sampleRequestRejected}
            processes={processes}
            onClose={noop}
            onAccept={noop}
            onReject={noop}
          />
        </ModalSlot>

        {/* 6. 업무 추가 드로어 */}
        <ModalSlot label="업무 추가 드로어 (TaskDrawer)" width={540} height={620}>
          <TaskDrawer
            open={true}
            weekOffset={0}
            onClose={noop}
            onSave={noop}
          />
        </ModalSlot>

        {/* 7. 업무 상세 패널 */}
        <ModalSlot label="업무 상세 패널 (DetailPanel)" width={520} height={640}>
          <DetailPanel
            item={sampleWorkItem}
            sessions={[]}
            meetings={[]}
            canEdit={true}
            onClose={noop}
            onSave={noop}
          />
        </ModalSlot>

        {/* 8. 회의록 저장 모달 */}
        <ModalSlot label="회의록 저장 (MeetingSaveModal)" width={560} height={680}>
          <MeetingSaveModal
            duration="45:20"
            teamMembers={teamMembers}
            meeting={sampleMeeting}
            onClose={noop}
            onSave={noop}
          />
        </ModalSlot>

        {/* 9. 담당자 배정 모달 */}
        <ModalSlot label="담당자 배정 (AssignModal)" width={520} height={580}>
          <AssignModal
            request={sampleAssignReq}
            teamMembers={teamMembers}
            processes={processes}
            onClose={noop}
            onSubmit={noop}
          />
        </ModalSlot>

        {/* 10. 업무요청 신규 생성 */}
        <ModalSlot label="업무요청 신규 생성 (NewRequestModal)" width={520} height={560}>
          <NewRequestModal
            processes={processes}
            teamMembers={teamMembers}
            currentUser={{ id: 'u-1', name: 'Jihye', team: '개발팀' }}
            onSubmit={noop}
            onClose={noop}
          />
        </ModalSlot>

      </div>
    </div>
  )
}
