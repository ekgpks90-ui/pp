import { canViewPage } from '../data/roles'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/> },
  { id: 'calendar', label: 'Calendar', icon: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/> },
  { id: 'team-status', label: 'Team Status', icon: <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"/> },
  { id: 'process', label: 'Process Management', icon: null },
  { id: 'meeting-room', label: 'Meeting Room', icon: <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/> },
  { id: 'leave', label: 'Leave Management', icon: <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/> },
  { id: 'report-center', label: 'Report Center', icon: <path d="M3 3a1 1 0 000 2v10a2 2 0 002 2h12a1 1 0 100-2H5V4a1 1 0 00-2-1zm5 9a1 1 0 102 0V9a1 1 0 10-2 0v3zm4 0a1 1 0 102 0V7a1 1 0 10-2 0v5zm-8 0a1 1 0 102 0v-1a1 1 0 10-2 0v1z"/> },
  { id: 'my-page', label: 'My Page', icon: <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/> },
]

export default function Sidebar({ role, currentPage, onNavigate }) {
  // 역할에 따라 보이는 메뉴만 노출 (예: Process Management는 팀장만)
  const navItems = NAV_ITEMS.filter(item => canViewPage(role, item.id))

  return (
    <aside className="bg-sidebar-bg border-r border-sidebar-border py-[22px] px-[14px] flex flex-col gap-8 overflow-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white text-sm font-extrabold shadow-[0_2px_8px_rgba(93,135,255,0.4)]">
          W
        </div>
        <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">WorkFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[1px]">
        {navItems.map(item => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[9px] text-[13px] font-medium tracking-[-0.01em] transition-colors cursor-pointer
                ${isActive
                  ? 'bg-sidebar-active-bg text-sidebar-active-text shadow-[0_2px_6px_rgba(93,135,255,0.35)]'
                  : 'text-sidebar-text hover:bg-surface-hover hover:text-blue'
                }`}
            >
              {item.icon && (
                <svg className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`} viewBox="0 0 20 20" fill="currentColor">
                  {item.icon}
                </svg>
              )}
              {!item.icon && (
                <svg className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="1" y="2" width="5" height="4" rx="1" fill="currentColor" stroke="none"/>
                  <rect x="1" y="10" width="5" height="4" rx="1" fill="currentColor" stroke="none"/>
                  <rect x="14" y="6" width="5" height="4" rx="1" fill="currentColor" stroke="none"/>
                  <path d="M6 4h3a1 1 0 011 1v2a1 1 0 001 1h3" strokeLinecap="round"/>
                  <path d="M6 12h3a1 1 0 000-2V8" strokeLinecap="round"/>
                </svg>
              )}
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
