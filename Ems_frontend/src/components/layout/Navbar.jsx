import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  KeyRound
} from 'lucide-react';
import { clsx } from 'clsx';
import { logout, getLoggedInUser } from '../../services/auth/AuthService';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../ChangePasswordModal';

export function Navbar({ onMenuClick }) {
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const getPageTitle = (path) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const firstSegment = segments[0];
    return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const username = getLoggedInUser() || 'User';
  const role = (sessionStorage.getItem('role') || 'EMPLOYEE').replace('ROLE_', '');
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">


        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Profile */}
        <div className="relative">
          <button 
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800/50">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase">{role}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">@{username}</p>
            </div>
            <ChevronDown size={14} className={clsx("transition-transform", showDropdown && "rotate-180")} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Account Management</p>
              </div>
              <button 
                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                className="flex items-center w-full gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={16} /> My Profile
              </button>
              <button 
                onClick={() => { setShowChangePassword(true); setShowDropdown(false); }}
                className="flex items-center w-full gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <KeyRound size={16} /> Change Password
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 mt-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-100 dark:border-slate-800 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </header>
  );
}
