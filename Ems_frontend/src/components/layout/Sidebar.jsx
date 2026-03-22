import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UsersRound, 
  FileText, 
  Megaphone, 
  CalendarDays, 
  UserCheck, 
  Banknote, 
  UserCircle,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { clsx } from 'clsx';

const ALL_MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users, adminOnly: true },
  { path: '/departments', label: 'Departments', icon: Building2, adminOnly: true },
  { path: '/teams', label: 'Teams', icon: UsersRound, adminOnly: true },
  { path: '/reports', label: 'Reports', icon: FileText, adminOnly: true },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays },
  { path: '/attendance', label: 'Attendance', icon: UserCheck },
  { path: '/salaries', label: 'Salaries', icon: Banknote },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export function Sidebar({ isOpen, setIsOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-400 transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isCollapsed ? "w-64 lg:w-20" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-0 lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className={clsx(
            "flex items-center h-16 bg-slate-900 border-b border-slate-800 transition-all duration-300",
            isCollapsed ? "justify-center px-0 lg:px-0 px-6 justify-between lg:justify-center" : "justify-between px-6"
          )}>
            <div className={clsx("flex items-center", isCollapsed ? "lg:justify-center gap-3 lg:gap-0" : "gap-3")}>
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex-shrink-0 flex items-center justify-center text-white font-bold transition-transform">
                E
              </div>
              <span className={clsx("text-xl font-bold text-white tracking-tight transition-all duration-300", isCollapsed ? "lg:hidden" : "block")}>
                EMS
              </span>
            </div>
            <button 
              className={clsx("lg:hidden p-2 rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700", isCollapsed ? "" : "")}
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-2.5 px-3 space-y-1 custom-scrollbar">
            {ALL_MENU_ITEMS.filter(item => {
              const role = sessionStorage.getItem('role');
              if (item.adminOnly && role === 'ROLE_EMPLOYEE') return false;
              if (role === 'ROLE_MANAGER') return item.path !== '/departments';
              if (role === 'ROLE_TEAM_LEADER') return !['/departments', '/teams'].includes(item.path);
              return true;
            }).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) => clsx(
                  "flex items-center px-4 py-2.5 rounded-xl transition-all group mx-1.5",
                  isCollapsed ? "lg:justify-center justify-between" : "justify-between",
                  isActive 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                    : "hover:bg-slate-800 hover:text-slate-200"
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              >
                <div className={clsx("flex items-center", isCollapsed ? "lg:justify-center gap-3 lg:gap-0" : "gap-3")}>
                  <item.icon size={20} className="transition-colors flex-shrink-0 group-hover:text-white" />
                  <span className={clsx("font-medium whitespace-nowrap overflow-hidden transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100")}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={14} className={clsx("opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0", isCollapsed ? "lg:hidden" : "block")} />
              </NavLink>
            ))}
          </nav>

          {/* Collapse Toggle (Desktop Only) */}
          <div className="hidden lg:flex p-2 border-t border-slate-800 mt-auto">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-full py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
