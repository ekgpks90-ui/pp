import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import HomePage from './components/HomePage'
import MeetingRoomPage from './components/MeetingRoomPage'
import CalendarPage from './components/CalendarPage'
import TeamStatusPage from './components/TeamStatusPage'
import ProcessPage from './components/ProcessPage'
import LeavePage from './components/LeavePage'
import MyPage from './components/MyPage'
import { workItems as initialWorkItems, sessions as initialSessions, requests as initialRequests, notifications as initialNotifications, meetings as initialMeetings, assignmentRequests as initialAssignmentRequests, processes as initialProcesses, leaves as initialLeaves, totalLeave, teamMembers, currentUser } from './data/state'
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
        {activePage ==='home' && (
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
          />
        )}
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
