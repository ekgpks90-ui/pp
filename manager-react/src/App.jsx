import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import HomePage from './components/HomePage'
import CeoDashboard from './components/CeoDashboard'
import CeoReportCenter from './components/CeoReportCenter'
import MeetingRoomPage from './components/MeetingRoomPage'
import CalendarPage from './components/CalendarPage'
import TeamStatusPage from './components/TeamStatusPage'
import ProcessPage from './components/ProcessPage'
import LeavePage from './components/LeavePage'
import MyPage from './components/MyPage'
import { workItems as initialWorkItems, sessions as initialSessions, requests as initialRequests, notifications as initialNotifications, meetings as initialMeetings, assignmentRequests as initialAssignmentRequests, processes as initialProcesses, leaves as initialLeaves, totalLeave, teamMembers, currentUser, approvalItems as initialApprovalItems, gradeRates } from './data/state'
import { ROLES, canViewPage } from './data/roles'

export default function App() {
  const [role, setRole] = useState(ROLES.MANAGER)
  const [currentPage, setCurrentPage] = useState('home')
  const [weekOffset, setWeekOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // 현재 역할이 볼 수 없는 페이지면 home으로 대체 (렌더 시 파생 — effect 불필요)
  const activePage = canViewPage(role, currentPage) ? currentPage : 'home'

  // Mutable state
  const [workItems, setWorkItems] = useState(initialWorkItems)
  const [sessions, setSessions] = useState(initialSessions)
  const [requests, setRequests] = useState(initialRequests)
  const [notifs, setNotifs] = useState(initialNotifications)
  const [meetings, setMeetings] = useState(initialMeetings)
  const [assignmentRequests, setAssignmentRequests] = useState(initialAssignmentRequests)
  const [processes, setProcesses] = useState(initialProcesses)
  const [leavesState, setLeaves] = useState(initialLeaves)
  const [approvalItems, setApprovalItems] = useState(initialApprovalItems)
  const [workItemResources, setWorkItemResources] = useState({})

  // --- Meeting handlers ---
  const addMeeting = useCallback((meeting) => {
    setMeetings(prev => [meeting, ...prev])
  }, [])

  const deleteMeeting = useCallback((id) => {
    setMeetings(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateMeeting = useCallback((id, updater) => {
    setMeetings(prev => prev.map(m => m.id === id ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m))
  }, [])

  // --- Session handlers ---
  const toggleSession = useCallback((id) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }, [])

  const updateSession = useCallback((id, updates) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const deleteSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  const cloneSession = useCallback((id) => {
    const newId = `ws-${Date.now()}`
    setSessions(prev => {
      const src = prev.find(s => s.id === id)
      if (!src) return prev
      const newSession = { ...src, id: newId, done: false, startTime: '', endTime: '' }
      const idx = prev.indexOf(src)
      const next = [...prev]
      next.splice(idx + 1, 0, newSession)
      return next
    })
    return newId
  }, [])

  // 여러 작업세션 일괄 추가 (업무요청 수락 시 프로세스 단계 자동배치용)
  const addSessions = useCallback((newSessions) => {
    setSessions(prev => [...prev, ...newSessions])
  }, [])

  const addSession = useCallback((workItemId, date, title = '') => {
    const newId = `ws-${Date.now()}`
    const newSession = {
      id: newId,
      workItemId,
      authorId: 'u-1',
      authorName: 'Jihye',
      date,
      category: '기획',
      title: title || '새 작업',
      startTime: '',
      endTime: '',
      done: false,
    }
    setSessions(prev => [...prev, newSession])
    return newId
  }, [])

  // --- 아웃풋/리소스 handlers (캘린더 업무 상세) ---
  const addResource = useCallback((workItemId, resource) => {
    setWorkItemResources(prev => ({
      ...prev,
      [workItemId]: [...(prev[workItemId] || []), resource],
    }))
  }, [])

  const removeResource = useCallback((workItemId, resId) => {
    setWorkItemResources(prev => ({
      ...prev,
      [workItemId]: (prev[workItemId] || []).filter(r => r.id !== resId),
    }))
  }, [])

  // --- WorkItem handlers ---
  const deleteWorkItem = useCallback((id) => {
    setWorkItems(prev => prev.filter(w => w.id !== id))
    setSessions(prev => prev.filter(s => s.workItemId !== id))
  }, [])

  const updateWorkItem = useCallback((id, updates) => {
    setWorkItems(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }, [])

  const addWorkItem = useCallback((item) => {
    setWorkItems(prev => [...prev, item])
  }, [])

  // --- Request handlers ---
  const updateRequest = useCallback((id, updates) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  // --- Notification handlers ---
  const markNotifRead = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }, [])

  const markAllNotifsRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
  }, [])

  const addNotification = useCallback((title, body, requestTitle = null) => {
    setNotifs(prev => [
      { id: `n-${Date.now()}`, title, body, ...(requestTitle && { requestTitle }), unread: true },
      ...prev,
    ])
  }, [])

  // --- 대표 결재함(Approval Item) handlers ---
  const approveItem = useCallback((id) => {
    setApprovalItems(prev => prev.map(a => {
      if (a.id !== id) return a
      addNotification('결재 승인', `${a.title} 안건이 승인되었습니다.`)
      return { ...a, status: '승인' }
    }))
  }, [addNotification])

  const rejectItem = useCallback((id, reason) => {
    setApprovalItems(prev => prev.map(a => {
      if (a.id !== id) return a
      addNotification('결재 반려', `${a.title} 안건이 반려되었습니다.`)
      return { ...a, status: '반려', rejectReason: reason || null }
    }))
  }, [addNotification])

  // --- 연차 승인/반려 (대표는 리포트 연차 탭에서 처리) ---
  const approveLeave = useCallback((id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: '승인 완료', approverId: 'u-0', approverName: '대표' } : l))
  }, [])

  const rejectLeave = useCallback((id, reason) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: '반려', approverId: 'u-0', approverName: '대표', rejectedReason: reason || null } : l))
  }, [])

  return (
    <div className="h-screen grid grid-cols-[224px_minmax(0,1fr)] overflow-hidden font-sans">
      <Sidebar role={role} currentPage={activePage} onNavigate={setCurrentPage} />
      <main className="flex flex-col overflow-hidden">
        <Topbar
          role={role}
          onRoleChange={setRole}
          weekOffset={weekOffset}
          onPrevWeek={() => setWeekOffset(w => w - 1)}
          onNextWeek={() => setWeekOffset(w => w + 1)}
          onGoCurrentWeek={() => setWeekOffset(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifs}
          onMarkNotifRead={markNotifRead}
          onMarkAllNotifsRead={markAllNotifsRead}
        />
        {activePage ==='home' && role === ROLES.OWNER && (
          <CeoDashboard
            workItems={workItems}
            sessions={sessions}
            teamMembers={teamMembers}
            processes={processes}
            approvalItems={approvalItems}
            gradeRates={gradeRates}
            onApproveItem={approveItem}
            onRejectItem={rejectItem}
          />
        )}
        {activePage ==='home' && role !== ROLES.OWNER && (
          <HomePage
            role={role}
            weekOffset={weekOffset}
            searchQuery={searchQuery}
            workItems={workItems}
            sessions={sessions}
            requests={requests}
            meetings={meetings}
            processes={processes}
            onToggleSession={toggleSession}
            onUpdateSession={updateSession}
            onDeleteSession={deleteSession}
            onCloneSession={cloneSession}
            onAddSession={addSession}
            onAddSessions={addSessions}
            onDeleteWorkItem={deleteWorkItem}
            onUpdateWorkItem={updateWorkItem}
            onAddWorkItem={addWorkItem}
            onUpdateRequest={updateRequest}
            onAddNotification={addNotification}
            onNavigate={setCurrentPage}
          />
        )}
        {activePage ==='meeting-room' && (
          <MeetingRoomPage
            role={role}
            currentUser={currentUser}
            meetings={meetings}
            teamMembers={teamMembers}
            onUpdateMeeting={updateMeeting}
            onDeleteMeeting={deleteMeeting}
            onAddMeeting={addMeeting}
            onAddWorkItem={addWorkItem}
            onAddNotification={addNotification}
            searchQuery={searchQuery}
          />
        )}
        {activePage ==='calendar' && (
          <CalendarPage
            role={role}
            workItems={workItems}
            sessions={sessions}
            meetings={meetings}
            workItemResources={workItemResources}
            onAddResource={addResource}
            onRemoveResource={removeResource}
            onUpdateWorkItem={updateWorkItem}
            onAddNotification={addNotification}
          />
        )}
        {activePage === 'report-center' && (
          <CeoReportCenter
            workItems={workItems}
            sessions={sessions}
            leaves={leavesState}
            teamMembers={teamMembers}
            totalLeave={totalLeave}
            approvalItems={approvalItems}
            processes={processes}
            gradeRates={gradeRates}
            onApproveLeave={approveLeave}
            onRejectLeave={rejectLeave}
          />
        )}
        {/* 팀원 현황 — 대표 사이드바에서 제거(직원·팀장만 사용) */}
        {activePage === 'team-status' && (
          <TeamStatusPage
            role={role}
            assignmentRequests={assignmentRequests}
            teamMembers={teamMembers}
            currentUser={currentUser}
            processes={processes}
            onUpdateAssignmentRequests={setAssignmentRequests}
          />
        )}
        {/* 프로세스 관리 — 대표도 팀장과 동일한 ProcessPage(템플릿 관리)를 사용 */}
        {activePage === 'process' && (
          <ProcessPage
            processes={processes}
            onUpdateProcesses={setProcesses}
          />
        )}
        {activePage === 'leave' && (
          <LeavePage
            role={role}
            currentUser={currentUser}
            leaves={leavesState}
            totalLeave={totalLeave}
            teamMembers={teamMembers}
            onUpdateLeaves={setLeaves}
          />
        )}
        {activePage === 'my-page' && (
          <MyPage
            currentUser={currentUser}
            sessions={sessions}
            workItems={workItems}
            meetings={meetings}
            leaves={leavesState}
          />
        )}
      </main>
    </div>
  )
}
