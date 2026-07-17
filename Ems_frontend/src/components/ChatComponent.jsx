import React, { useEffect, useState, useRef } from 'react';
import { getLoggedInEmployee, listEmployees } from '../services/EmployeeService';
import { getPrivateChatHistory, getRecentContactTimestamps, getGroupChatHistory } from '../services/ChatService';
import { getWebSocketClient, onWebSocketConnect } from '../services/WebSocketService';
import { MessageSquare, Send, Search, Users, User } from 'lucide-react';

export default function ChatComponent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePartner, setActivePartner] = useState(null); // format: { username, fullName }
  const [unreadCounts, setUnreadCounts] = useState({});
  const [recentTimestamps, setRecentTimestamps] = useState({});
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const messageListRef = useRef(null);
  const stompClientRef = useRef(null);
  const activePartnerRef = useRef(activePartner);

  // Keep activePartnerRef updated so stomp callbacks can read the current active chat state
  useEffect(() => {
    activePartnerRef.current = activePartner;
    if (activePartner) {
      // Clear unread count for the active partner
      setUnreadCounts(prev => ({ ...prev, [activePartner.username]: 0 }));
    }
  }, [activePartner]);

  useEffect(() => {
    setLoading(true);
    getLoggedInEmployee()
      .then(res => {
        const user = res.data.data;
        setCurrentUser(user);
        
        listEmployees('', '', '')
          .then(empRes => {
            const list = empRes.data.data.content || [];
            // Exclude current user from DM list
            setEmployees(list.filter(e => e.username !== user.username));
            
            // Fetch recent contact timestamps
            getRecentContactTimestamps()
              .then(recentRes => {
                setRecentTimestamps(recentRes.data.data || {});
                setLoading(false);
              })
              .catch(err => {
                console.error('Error fetching recent contact timestamps', err);
                setLoading(false);
              });
          })
          .catch(err => {
            console.error('Error fetching employees list', err);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error('Error fetching current user details', err);
        setLoading(false);
      });

    // Establish WebSocket connection & setup subscriptions
    const client = getWebSocketClient();
    stompClientRef.current = client;

    let subDMs = null;
    let subGeneral = null;
    let subDept = null;
    let subTeam = null;

    const unsubscribe = onWebSocketConnect((connectedClient) => {
      setConnected(true);
      console.log('STOMP client connected');

      // Subscribe to Private Direct Messages
      subDMs = connectedClient.subscribe('/user/queue/messages', (msg) => {
        const messageBody = JSON.parse(msg.body);
        const sender = messageBody.senderUsername;
        const recipient = messageBody.recipientUsername;
        const partnerUsername = sender === currentUser?.username ? recipient : sender;
        handleIncomingMessage(messageBody, partnerUsername);
      });

      // Subscribe to General Group
      subGeneral = connectedClient.subscribe('/topic/group/GENERAL', (msg) => {
        const messageBody = JSON.parse(msg.body);
        handleIncomingMessage(messageBody, 'GENERAL');
      });

      // Subscribe to Department Group if applicable
      if (currentUser && currentUser.departmentId) {
        subDept = connectedClient.subscribe(`/topic/group/DEPT_${currentUser.departmentId}`, (msg) => {
          const messageBody = JSON.parse(msg.body);
          handleIncomingMessage(messageBody, `DEPT_${currentUser.departmentId}`);
        });
      }

      // Subscribe to Team Group if applicable
      if (currentUser && currentUser.teamId) {
        subTeam = connectedClient.subscribe(`/topic/group/TEAM_${currentUser.teamId}`, (msg) => {
          const messageBody = JSON.parse(msg.body);
          handleIncomingMessage(messageBody, `TEAM_${currentUser.teamId}`);
        });
      }
    });

    return () => {
      unsubscribe();
      if (subDMs) subDMs.unsubscribe();
      if (subGeneral) subGeneral.unsubscribe();
      if (subDept) subDept.unsubscribe();
      if (subTeam) subTeam.unsubscribe();
      setConnected(false);
    };
  }, [currentUser?.username, currentUser?.departmentId, currentUser?.teamId]);

  const handleIncomingMessage = (msg, partnerUsername) => {
    const currentPartner = activePartnerRef.current;
    const partnerKey = partnerUsername.toLowerCase();

    // Push partner to the top of list
    setRecentTimestamps(prev => ({
      ...prev,
      [partnerKey]: new Date().toISOString()
    }));

    if (currentPartner && currentPartner.username.toLowerCase() === partnerKey) {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } else {
      // Increment unread count for background chat
      setUnreadCounts(prev => ({
        ...prev,
        [partnerUsername]: (prev[partnerUsername] || 0) + 1
      }));
    }
  };

  // Load chat history when switching active partners
  useEffect(() => {
    if (!currentUser || !activePartner) {
      setMessages([]);
      return;
    }

    if (activePartner.isGroup) {
      getGroupChatHistory(activePartner.username).then(res => {
        setMessages(res.data.data || []);
      });
    } else {
      getPrivateChatHistory(activePartner.username).then(res => {
        setMessages(res.data.data || []);
      });
    }
  }, [activePartner, currentUser]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !stompClientRef.current || !currentUser || !activePartner) return;

    const chatMsg = {
      senderUsername: currentUser.username,
      recipientUsername: activePartner.username,
      content: newMessage.trim(),
    };

    stompClientRef.current.publish({
      destination: activePartner.isGroup
        ? '/app/chat.sendGroupMessage'
        : '/app/chat.sendPrivateMessage',
      body: JSON.stringify(chatMsg)
    });

    setRecentTimestamps(prev => ({
      ...prev,
      [activePartner.username.toLowerCase()]: new Date().toISOString()
    }));

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Compile unified chat items (Groups + DMs)
  const chatsList = [];
  if (currentUser) {
    // 1. General Chat (Company-wide)
    chatsList.push({
      id: 'general',
      isGroup: true,
      username: 'GENERAL',
      name: 'General Chat',
      designation: 'Company-Wide'
    });

    // 2. Department Group Chat
    if (currentUser.departmentId && currentUser.departmentName) {
      chatsList.push({
        id: `dept_${currentUser.departmentId}`,
        isGroup: true,
        username: `DEPT_${currentUser.departmentId}`,
        name: `${currentUser.departmentName} Department`,
        designation: 'Department Chat'
      });
    }

    // 3. Team Group Chat
    if (currentUser.teamId && currentUser.teamName) {
      chatsList.push({
        id: `team_${currentUser.teamId}`,
        isGroup: true,
        username: `TEAM_${currentUser.teamId}`,
        name: `${currentUser.teamName} Team`,
        designation: 'Team Chat'
      });
    }
  }

  // 4. Colleagues (Private DMs)
  employees.forEach(emp => {
    chatsList.push({
      id: emp.id,
      isGroup: false,
      username: emp.username,
      name: `${emp.firstName} ${emp.lastName}`,
      designation: emp.designation || 'Colleague',
      firstName: emp.firstName,
      lastName: emp.lastName
    });
  });

  // Sort chats by recent message timestamps
  const sortedChats = [...chatsList].sort((a, b) => {
    const userA = a.username ? a.username.toLowerCase() : '';
    const userB = b.username ? b.username.toLowerCase() : '';
    const timeA = userA ? recentTimestamps[userA] : null;
    const timeB = userB ? recentTimestamps[userB] : null;
    
    if (timeA && timeB) {
      return new Date(timeB) - new Date(timeA);
    }
    if (timeA) return -1;
    if (timeB) return 1;
    
    if (a.isGroup && !b.isGroup) return -1;
    if (!a.isGroup && b.isGroup) return 1;
    
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.localeCompare(nameB);
  });

  const filteredChats = sortedChats.filter(chat => {
    const nameStr = chat.name ? chat.name.toLowerCase() : '';
    const usernameStr = chat.username ? chat.username.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return nameStr.includes(query) || usernameStr.includes(query);
  });

  return (
    <div className="flex h-full w-full max-h-full bg-white dark:bg-slate-900 overflow-hidden">
      
      {/* SIDEBAR: Employees list */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
        
        {/* Search Employees */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search colleagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Chats</span>
          <div className="mt-2 space-y-1">
            {filteredChats.map((chat) => {
              const isActive = activePartner && activePartner.username.toLowerCase() === chat.username.toLowerCase();
              const unread = unreadCounts[chat.username] || 0;
              
              const initials = chat.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
              
              return (
                <button
                  key={chat.id}
                  onClick={() => setActivePartner({ 
                    username: chat.username, 
                    fullName: chat.name,
                    isGroup: chat.isGroup
                  })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase ${
                      chat.isGroup 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">{chat.name}</span>
                      <span className={`text-[10px] mt-1 ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>
                        {chat.isGroup ? chat.designation : `@${chat.username}`}
                      </span>
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-danger-500 text-white rounded-full">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHAT MAIN WINDOW */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-h-0">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activePartner.isGroup 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-400'
                }`}>
                  {activePartner.isGroup ? <Users size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{activePartner.fullName}</h3>
                  <span className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`}></span>
                    {connected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message list */}
            <div ref={messageListRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <MessageSquare size={36} className="text-slate-300 stroke-[1.5]" />
                  <span className="text-sm">No messages here yet. Say hello!</span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderUsername === currentUser?.username;
                  return (
                    <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isMine && (
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            @{msg.senderUsername}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-lg text-sm shadow-sm break-words whitespace-pre-wrap ${
                        isMine
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Send Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activePartner.fullName}...`}
                disabled={!connected}
                rows={1}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 disabled:opacity-50 resize-none overflow-y-auto max-h-24"
              />
              <button
                type="submit"
                disabled={!connected || !newMessage.trim()}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/10 disabled:opacity-50 h-10 align-middle"
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <MessageSquare size={48} className="text-slate-300 stroke-[1.2]" />
            <div className="text-center">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a Colleague</h3>
              <p className="text-xs text-slate-400 mt-1">Pick a colleague from the list to start a private chat.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
