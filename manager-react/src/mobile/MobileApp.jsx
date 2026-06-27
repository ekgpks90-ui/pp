// 팀장 모바일 앱 루트 — Figma "모바일 버전(팀장)" 설계도 반영.
// 상단 헤더 + 하단 아이콘 탭 5개 + 서브 화면 스택. 데이터/파생규칙은 ../data 공유.
import { useState, useCallback } from 'react'
import {
  workItems as seedWorkItems, sessions as seedSessions,
  requests as seedRequests, leaves as seedLeaves,
  meetings as seedMeetings, currentUser,
} from '../data/state'
import { TODAY_ISO } from '../data/helpers'
import { pendingRequests, pendingLeaves } from './derive'
import { COLOR } from './theme'
import { IconHome, IconUsers, IconFolder, IconCheckCircle, IconUser, IconBell } from './icons'
import HomeTab from './tabs/HomeTab'
import TeamTab from './tabs/TeamTab'
import ProjectTab from './tabs/ProjectTab'
import ApprovalTab from './tabs/ApprovalTab'
import MyWorkTab from './tabs/MyWorkTab'
import MemberDetail from './screens/MemberDetail'
import ProjectDetail from './screens/ProjectDetail'
import { MeetingView, CalendarView, ProcessView } from './screens/ViewOnlyScreens'

const TABS = [
  { key: 'home', label: '홈', icon: IconHome },
  { key: 'team', label: '팀원', icon: IconUsers },
  { key: 'project', label: '프로젝트', icon: IconFolder },
  { key: 'approval', label: '결재', icon: IconCheckCircle },
  { key: 'mywork', label: '내 업무', icon: IconUser },
]

const TAB_TITLE = { home: '홈', team: '팀원', project: '프로젝트', approval: '결재', mywork: '내 업무' }
const VIEW_TITLE = { meeting: '회의록', calendar: '캘린더', process: '프로세스' }

export default function MobileApp() {
  const [tab, setTab] = useState('home')
  const [stack, setStack] = useState([]) // { screen, params }
  const [approvalSegment, setApprovalSegment] = useState('업무요청')

  // 공유 데이터의 가변 복사본 (결재/기록은 모바일 내부 상태로 처리, 데스크탑 미영향)
  const [requests, setRequests] = useState(seedRequests)
  const [leaves, setLeaves] = useState(seedLeaves)
  const [sessions, setSessions] = useState(seedSessions)
  const [workItems] = useState(seedWorkItems)
  const [meetings] = useState(seedMeetings)

  const top = stack[stack.length - 1] || null
  const push = useCallback(s => setStack(prev => [...prev, s]), [])
  const pop = useCallback(() => setStack(prev => prev.slice(0, -1)), [])

  // ─── 핸들러 ──────────────────────────────────────────────────────────────────
  const acceptRequest = useCallback(id =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: '우리 팀 할당' } : r)), [])
  const rejectRequest = useCallback((id, reason) =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: '거절', rejectReason: reason } : r)), [])
  const approveLeave = useCallback(id =>
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: '팀장 승인', approverName: currentUser.name } : l)), [])
  const rejectLeave = useCallback((id, reason) =>
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: '반려', approverName: currentUser.name, rejectedReason: reason } : l)), [])
  const updateSession = useCallback((id, updates) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s)), [])
  const addSession = useCallback(title =>
    setSessions(prev => [...prev, {
      id: `ws-m${Date.now()}`, workItemId: null, stepId: null,
      authorId: currentUser.id, authorName: currentUser.name,
      date: TODAY_ISO, category: '기획', title, startTime: '', endTime: '', done: false,
    }]), [])

  const goApproval = useCallback(segment => {
    setApprovalSegment(segment)
    setStack([])
    setTab('approval')
  }, [])

  const goTab = useCallback(t => { setStack([]); setTab(t) }, [])
  const openProject = useCallback(id => push({ screen: 'project', params: { id } }), [push])

  const pendingCount = pendingRequests(requests).length + pendingLeaves(leaves).length

  // ─── 헤더 제목 ────────────────────────────────────────────────────────────────
  const title = top
    ? (top.screen === 'member' ? '팀원 상세'
      : top.screen === 'project' ? '프로젝트 상세'
        : VIEW_TITLE[top.screen] || '')
    : TAB_TITLE[tab]

  return (
    <div className="mx-auto flex h-screen max-w-[430px] flex-col bg-bg font-sans">
      {/* 상단 헤더 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
        <div className="flex items-center gap-2">
          {top && <button onClick={pop} className="-ml-1 text-2xl leading-none text-text-sub">‹</button>}
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative text-muted">
            <IconBell size={22} />
            {pendingCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: COLOR.danger }} />}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: COLOR.primary }}>
            {currentUser.name.slice(0, 1)}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto">
        {top?.screen === 'member' && <MemberDetail memberId={top.params.id} />}
        {top?.screen === 'project' && <ProjectDetail projectId={top.params.id} workItems={workItems} sessions={sessions} />}
        {top?.screen === 'meeting' && <MeetingView />}
        {top?.screen === 'calendar' && <CalendarView workItems={workItems} sessions={sessions} />}
        {top?.screen === 'process' && <ProcessView />}

        {!top && tab === 'home' && (
          <HomeTab
            workItems={workItems} sessions={sessions} requests={requests} leaves={leaves} meetings={meetings}
            onGoApproval={goApproval} onOpenView={v => push({ screen: v })} onOpenProject={openProject}
          />
        )}
        {!top && tab === 'team' && <TeamTab onOpenMember={id => push({ screen: 'member', params: { id } })} />}
        {!top && tab === 'project' && <ProjectTab workItems={workItems} sessions={sessions} onOpenProject={openProject} />}
        {!top && tab === 'approval' && (
          <ApprovalTab
            requests={requests} leaves={leaves} workItems={workItems} sessions={sessions}
            initialSegment={approvalSegment}
            onAcceptRequest={acceptRequest} onRejectRequest={rejectRequest}
            onApproveLeave={approveLeave} onRejectLeave={rejectLeave}
          />
        )}
        {!top && tab === 'mywork' && (
          <MyWorkTab
            workItems={workItems} sessions={sessions}
            onUpdateSession={updateSession} onAddSession={addSession}
          />
        )}
      </main>

      {/* 하단 탭 5개 */}
      <nav className="flex h-16 shrink-0 items-stretch border-t border-line bg-surface px-3">
        {TABS.map(t => {
          const active = !top && tab === t.key
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => goTab(t.key)} className="relative flex flex-1 flex-col items-center justify-center gap-1">
              <span className="relative" style={{ color: active ? COLOR.primary : COLOR.muted }}>
                <Icon size={24} />
                {t.key === 'approval' && pendingCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: COLOR.danger }}>
                    {pendingCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium" style={{ color: active ? COLOR.primary : COLOR.muted }}>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
