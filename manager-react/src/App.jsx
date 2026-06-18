import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import HomePage from './components/HomePage'
import { workItems as initialWorkItems, sessions as initialSessions, requests as initialRequests, notifications as initialNotifications } from './data/state'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [weekOffset, setWeekOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Mutable state
  const [workItems, setWorkItems] = useState(initialWorkItems)
  const [sessions, setSessions] = useState(initialSessions)
  const [requests, setRequests] = useState(initialRequests)
  const [notifs, setNotifs] = useState(initialNotifications)

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
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex flex-col overflow-hidden">
        <Topbar
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
        {currentPage === 'home' && (
          <HomePage
            weekOffset={weekOffset}
            searchQuery={searchQuery}
            workItems={workItems}
            sessions={sessions}
            requests={requests}
            onToggleSession={toggleSession}
            onUpdateSession={updateSession}
            onDeleteSession={deleteSession}
            onCloneSession={cloneSession}
            onAddSession={addSession}
            onDeleteWorkItem={deleteWorkItem}
            onUpdateWorkItem={updateWorkItem}
            onAddWorkItem={addWorkItem}
            onUpdateRequest={updateRequest}
            onAddNotification={addNotification}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage !== 'home' && (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            {currentPage} 페이지 (준비 중)
          </div>
        )}
      </main>
    </div>
  )
}
