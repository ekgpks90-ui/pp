import { useState } from 'react'
import { TODAY_ISO } from '../data/helpers'
import DailyTodo from './DailyTodo'
import WeeklyTasks from './WeeklyTasks'
import KpiCard from './KpiCard'
import WorkRequests from './WorkRequests'
import ConfirmModal from './ConfirmModal'
import DetailPanel from './DetailPanel'
import RequestDetailModal from './RequestDetailModal'
import AcceptModal from './AcceptModal'
import RejectModal from './RejectModal'
import TaskDrawer from './TaskDrawer'

export default function HomePage({
  weekOffset, searchQuery,
  workItems, sessions, requests, meetings, processes,
  onToggleSession, onUpdateSession, onDeleteSession, onCloneSession, onAddSession, onAddSessions,
  onDeleteWorkItem, onUpdateWorkItem, onAddWorkItem,
  onUpdateRequest, onAddNotification, onNavigate,
}) {
  const [dailyViewDate, setDailyViewDate] = useState(undefined)
  const [addingSessionForItem, setAddingSessionForItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Detail panel
  const [detailItem, setDetailItem] = useState(null)

  // Task drawer
  const [showTaskDrawer, setShowTaskDrawer] = useState(false)

  // Request modals
  const [requestDetail, setRequestDetail] = useState(null)
  const [acceptingRequest, setAcceptingRequest] = useState(null)
  const [rejectingRequest, setRejectingRequest] = useState(null)

  const handleAddSessionTrigger = (workItemId, date) => {
    setDailyViewDate(date)
    setAddingSessionForItem({ workItemId, date })
  }

  const handleDeleteWorkItem = (item) => {
    setDeleteConfirm(item)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteWorkItem(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  // Detail panel handlers
  const handleOpenDetail = (item) => {
    setDetailItem(item)
  }

  const handleSaveDetail = (id, updates) => {
    onUpdateWorkItem(id, updates)
  }

  // Request handlers
  const handleOpenRequestDetail = (request) => {
    setRequestDetail(request)
  }

  const handleAcceptFromDetail = (requestId) => {
    setRequestDetail(null)
    const r = requests.find(x => x.id === requestId)
    if (r) setAcceptingRequest(r)
  }

  const handleRejectFromDetail = (requestId) => {
    setRequestDetail(null)
    const r = requests.find(x => x.id === requestId)
    if (r) setRejectingRequest(r)
  }

  const handleAcceptDirect = (requestId) => {
    const r = requests.find(x => x.id === requestId)
    if (r) setAcceptingRequest(r)
  }

  const handleRejectDirect = (requestId) => {
    const r = requests.find(x => x.id === requestId)
    if (r) setRejectingRequest(r)
  }

  const handleSubmitAccept = ({ request, newItem, todoDate }) => {
    onAddWorkItem(newItem)
    onUpdateRequest(request.id, { status: '수락' })

    // 선택된 프로세스 단계들을 오늘 할 일(작업세션)에 자동배치 (원본 submitAcceptForm 대응)
    const newSessions = (request.selectedSteps || []).map((step, i) => ({
      id: `ws-${Date.now()}-${i}`,
      workItemId: newItem.id,
      stepId: step.stepId,
      authorId: 'u-1',
      authorName: 'Jihye',
      date: todoDate,
      category: step.role,
      title: step.title,
      deadline: step.deadline ?? null,
      startTime: '',
      endTime: '',
      done: false,
    }))
    if (newSessions.length) onAddSessions(newSessions)

    onAddNotification('업무항목 추가', `"${request.title}" 업무항목이 이번 주 업무에 추가되었습니다.`, request.title)
    setAcceptingRequest(null)
  }

  const handleSubmitReject = ({ requestId, reason, detail }) => {
    onUpdateRequest(requestId, {
      status: '거절',
      rejectReason: reason,
      rejectDetail: detail,
      rejectedAt: TODAY_ISO,
    })
    const r = requests.find(x => x.id === requestId)
    onAddNotification('업무요청 거절', `${r?.title || ''} 요청을 거절했습니다.`, r?.title)
    setRejectingRequest(null)
  }

  return (
    <div className="flex-1 overflow-hidden px-7 pt-[18px] pb-7">
      <div className="grid grid-cols-3 gap-4 h-full">
        {/* Column 1: Weekly Tasks */}
        <div className="flex flex-col gap-4 min-h-0">
          <WeeklyTasks
            weekOffset={weekOffset}
            searchQuery={searchQuery}
            workItems={workItems}
            sessions={sessions}
            onDateClick={setDailyViewDate}
            onAddSession={handleAddSessionTrigger}
            onDeleteWorkItem={handleDeleteWorkItem}
            onOpenDetail={handleOpenDetail}
            onOpenTaskDrawer={() => setShowTaskDrawer(true)}
          />
        </div>

        {/* Column 2: Daily Todo */}
        <div className="flex flex-col gap-4 min-h-0">
          <DailyTodo
            viewDate={dailyViewDate}
            onViewDateChange={setDailyViewDate}
            workItems={workItems}
            sessions={sessions}
            onToggleSession={onToggleSession}
            onUpdateSession={onUpdateSession}
            onDeleteSession={onDeleteSession}
            onCloneSession={onCloneSession}
            onAddSession={onAddSession}
            addingSessionForItem={addingSessionForItem}
            onClearAddingSession={() => setAddingSessionForItem(null)}
          />
        </div>

        {/* Column 3: KPI + Requests */}
        <div className="flex flex-col gap-[14px] min-h-0 overflow-hidden">
          <KpiCard workItems={workItems} sessions={sessions} viewDate={dailyViewDate ?? TODAY_ISO} />
          <WorkRequests
            requests={requests}
            onAccept={handleAcceptDirect}
            onReject={handleRejectDirect}
            onOpenDetail={handleOpenRequestDetail}
          />
        </div>
      </div>

      {/* Task drawer */}
      <TaskDrawer
        open={showTaskDrawer}
        weekOffset={weekOffset}
        sessions={sessions}
        workItems={workItems}
        onClose={() => setShowTaskDrawer(false)}
        onSave={onAddWorkItem}
      />

      {/* Delete work item confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="업무 삭제"
          message={`"${deleteConfirm.title}" 업무와 관련된 모든 작업 세션이 삭제됩니다. 계속하시겠습니까?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Detail panel */}
      {detailItem && (
        <DetailPanel
          item={detailItem}
          sessions={sessions}
          meetings={meetings}
          onClose={() => setDetailItem(null)}
          onSave={handleSaveDetail}
          onNavigate={onNavigate}
        />
      )}

      {/* Request detail modal */}
      {requestDetail && (
        <RequestDetailModal
          request={requestDetail}
          processes={processes}
          onClose={() => setRequestDetail(null)}
          onAccept={handleAcceptFromDetail}
          onReject={handleRejectFromDetail}
        />
      )}

      {/* Accept modal */}
      {acceptingRequest && (
        <AcceptModal
          request={acceptingRequest}
          processes={processes}
          onClose={() => setAcceptingRequest(null)}
          onSubmit={handleSubmitAccept}
        />
      )}

      {/* Reject modal */}
      {rejectingRequest && (
        <RejectModal
          request={rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          onSubmit={handleSubmitReject}
        />
      )}
    </div>
  )
}
