import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';
import { getWebSocketClient, onWebSocketConnect } from '../../services/WebSocketService';
import Swal from 'sweetalert2';

export function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const mainRef = React.useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    const client = getWebSocketClient();
    let sub = null;

    const unsubscribe = onWebSocketConnect((connectedClient) => {
      sub = connectedClient.subscribe('/user/queue/notifications', (msg) => {
        const notification = JSON.parse(msg.body);
        const isDark = document.documentElement.classList.contains('dark');
        
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });

        Toast.fire({
          icon: 'info',
          title: 'Notification',
          text: notification.message
        });
      });
    });

    return () => {
      unsubscribe();
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content Area */}
        <main 
          ref={mainRef}
          className={`flex-1 ${isChatPage ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar'}`}
        >
          {isChatPage ? (
            <div className="flex-1 overflow-hidden animate-in fade-in duration-500">
              {children}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          )}
        </main>

        {/* Optional Page Background Element */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
