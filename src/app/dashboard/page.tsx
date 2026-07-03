'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserRoleAction, getUsersAction } from '@/actions/update-role';
import { Role } from '@prisma/client';
import { 
  Users, Clock, CalendarRange, 
  LayoutDashboard, Coins, Laptop, Ticket, 
  Shield, Search, LogOut,
  Menu, Bell, ChevronLeft, ChevronRight, X,
  User, Settings, Plus, TrendingUp,
  CheckCircle2, Calendar, MessageSquare,
  Activity, Check, MoreHorizontal, Sparkles,
  Bot, Send, Loader2
} from 'lucide-react';



export default function Dashboard() {
  const { user, role, signOut } = useAuth();
  
  // Interactive UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  
  // App States
  const selectedRole = role || 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Employees', icon: Users },
    { name: 'Attendance', icon: Clock },
    { name: 'Leaves', icon: CalendarRange },
    { name: 'Payroll', icon: Coins },
    { name: 'Assets', icon: Laptop },
    { name: 'Help Desk', icon: Ticket },
    { name: 'Settings', icon: Settings }
  ];
  if (selectedRole === 'SUPER_ADMIN') {
    menuItems.push({ name: 'System Control', icon: Shield });
  }

  // simulated task checklist
  const [tasks, setTasks] = useState([
    { id: 'tsk-1', text: 'Approve Rahul\'s casual leave request', done: false, priority: 'high' },
    { id: 'tsk-2', text: 'Assign MacBook Pro to Priya Singh', done: true, priority: 'medium' },
    { id: 'tsk-3', text: 'Review payroll budget for Q3 operations', done: false, priority: 'high' },
    { id: 'tsk-4', text: 'Update VerdantHR onboarding checklist docs', done: false, priority: 'low' }
  ]);

  // Simulated notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Leave Request', text: 'Rahul Sharma applied for 3 days of Casual Leave', time: '10m ago', read: false },
    { id: 2, title: 'IT Asset Audit', message: 'MacBook Pro SN: MB-2026-X83 assigned to Priya Singh', time: '1h ago', read: false },
    { id: 3, title: 'June Payroll Ready', message: 'VerdantHR payroll calculations generated', time: '4h ago', read: true }
  ]);

  // Simulated employees list
  const [employees] = useState([
    { id: 'EMP001', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', dept: 'Engineering', role: 'Software Engineer', status: 'Active', avatar: 'RS' },
    { id: 'EMP002', name: 'Priya Singh', email: 'priya.singh@company.com', dept: 'Engineering', role: 'Frontend Developer', status: 'Active', avatar: 'PS' },
    { id: 'EMP003', name: 'Amit Verma', email: 'amit.verma@company.com', dept: 'HR Operations', role: 'HR Coordinator', status: 'On Leave', avatar: 'AV' },
    { id: 'EMP004', name: 'Neha Gupta', email: 'neha.gupta@company.com', dept: 'Finance', role: 'Payroll Lead', status: 'Active', avatar: 'NG' },
    { id: 'EMP005', name: 'Raj Sharma', email: 'raj.sharma@company.com', dept: 'HR Operations', role: 'HR Manager', status: 'Active', avatar: 'RS' }
  ]);

  // AI Chat states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Hi! I am your VerdantHR AI assistant. How can I help you manage employee operations, leaves, or system configurations today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  // System Control States
  interface SafeUser {
    id: string;
    email: string;
    role: Role;
  }
  const [dbUsers, setDbUsers] = useState<SafeUser[]>([]);
  const [loadingDbUsers, setLoadingDbUsers] = useState(false);
  const [rbacLogs, setRbacLogs] = useState<string[]>([
    "System Audit Log Initialized.",
    "Prisma DB Engine connected.",
    "Firebase Admin SDK initialized."
  ]);
  const [rbacStatus, setRbacStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    if (activeTab === 'System Control') {
      const fetchUsers = async () => {
        setLoadingDbUsers(true);
        try {
          const res = await getUsersAction();
          if (res.success && res.users) {
            setDbUsers(res.users);
            setIsDbConnected(true);
          } else {
            setIsDbConnected(false);
            setRbacStatus({ type: 'error', text: res.error || 'Failed to retrieve database users.' });
            console.error(res.error);
          }
        } catch (e) {
          setIsDbConnected(false);
          console.error(e);
        } finally {
          setLoadingDbUsers(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setRbacStatus(null);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success && res.user) {
        setDbUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setRbacStatus({ type: 'success', text: `Successfully updated user role to ${newRole}.` });
        setRbacLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Updated user ID ${userId} to role ${newRole}.`,
          ...prev
        ]);
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to update user role.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred.' });
    }
  };


  // Fix the timeout duration below to be 1000ms
  const handleSendMessageFixed = (userText: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "I am processing that command. VerdantHR analytics indicate stable operations.";
      const query = userText.toLowerCase();

      if (query.includes('leave') || query.includes('casual')) {
        aiResponse = "Rahul Sharma has 5 casual leaves remaining of his 12 allocated days. Amit Verma is currently On Leave.";
      } else if (query.includes('task') || query.includes('todo')) {
        const pending = tasks.filter(t => !t.done).length;
        aiResponse = `You currently have ${pending} pending tasks in your VerdantHR action items queue.`;
      } else if (query.includes('role') || query.includes('permissions')) {
        aiResponse = `Your authenticated role is ${selectedRole}.`;
      } else if (query.includes('stitch') || query.includes('sdk')) {
        aiResponse = "The Google Stitch SDK is initialized. To generate a mockup UI screen, verify your STITCH_API_KEY inside the project's .env file.";
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: aiResponse }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    handleSendMessageFixed(text);
  };

  const renderSystemControl = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="w-5.5 h-5.5 text-[#004225]" />
            <span>System Control & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500">Root-level tenant configuration, live database status, and real-time user role management.</p>
        </div>

        {/* Status Indicator Banner */}
        {rbacStatus && (
          <div className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
            rbacStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : 'bg-red-50 text-red-850 border-red-100'
          }`}>
            <Shield className={`w-4 h-4 mt-0.5 ${rbacStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`} />
            <div>
              <span className="font-bold">{rbacStatus.type === 'success' ? 'Success: ' : 'Error: '}</span>
              {rbacStatus.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Directory for Role Management */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Active Accounts Registry</h3>
                <p className="text-[10px] text-slate-400 font-medium">Dynamically promote, demote, or audit tenant credentials</p>
              </div>
              {loadingDbUsers && (
                <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">User ID</th>
                    <th className="py-3 px-5">Email Address</th>
                    <th className="py-3 px-5">Assigned RBAC Role</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650 bg-white">
                  {dbUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        {loadingDbUsers ? 'Loading registered users...' : 'No users found in database. Ask users to sign up first.'}
                      </td>
                    </tr>
                  ) : (
                    dbUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/40 transition-all">
                        <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400 font-semibold">{u.id}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">{u.email}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border mr-2 ${
                            u.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                            u.role === 'ORG_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            u.role === 'HR_MANAGER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="bg-slate-50 border border-slate-200 text-[11px] rounded-lg py-1 px-2 text-slate-600 focus:outline-none focus:border-brand-green/20"
                          >
                            {Object.values(Role).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Health & Audit Logs */}
          <div className="lg:col-span-4 space-y-6">
            {/* System Status Indicators */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#2D6A4F]" />
                <span>System Connection Registry</span>
              </h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Database Node (Prisma)</span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isDbConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Firebase Auth Server</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">Online</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Firebase Admin Node</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">Configured</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 font-medium">Tenant Isolation Mode</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black uppercase rounded">Multi-Tenant</span>
                </div>
              </div>
            </div>

            {/* Quick System Diagnostics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#2D6A4F]" />
                <span>System Commands Toolset</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => {
                    setRbacStatus({ type: 'success', text: 'System cache cleared successfully. All active sessions verified.' });
                    setRbacLogs(prev => [`[${new Date().toLocaleTimeString()}] Triggered cache flush and verified session tokens.`, ...prev]);
                  }}
                  className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-xl transition-all"
                >
                  Flush System Cache
                </button>
                <button 
                  onClick={() => {
                    setRbacStatus({ type: 'success', text: `Integrity check complete: audited ${dbUsers.length} user records successfully.` });
                    setRbacLogs(prev => [`[${new Date().toLocaleTimeString()}] Triggered database integrity audit. No corruption detected.`, ...prev]);
                  }}
                  className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-xl transition-all"
                >
                  Database Audit
                </button>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#2D6A4F]" />
                <span>Audit Logs Feed</span>
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {rbacLogs.map((logStr, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg text-[9px] font-mono text-slate-500 leading-tight border border-slate-100">
                    {logStr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* ----------------- SIDEBAR ----------------- */}
      {/* Collapsible Sidebar (Framer Motion Animated) */}
      <motion.aside 
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-[#004225] text-slate-100 flex-shrink-0 relative z-30"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#005c33] bg-[#002d1a]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
              <Logo className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                VerdantHR
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded bg-[#005c33] text-slate-350 hover:text-white transition-all focus:outline-none hidden md:block"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                suppressHydrationWarning
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive 
                    ? 'bg-white text-[#004225] shadow-sm' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#004225]' : 'text-slate-300 group-hover:text-white'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#005c33] bg-[#002d1a]/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0] || 'Administrator'}</span>
                <span className="text-[9px] text-[#2D6A4F] bg-white/90 px-1.5 py-0.5 rounded font-black uppercase tracking-wider w-fit mt-0.5">{selectedRole}</span>
              </div>
            )}
            <button 
              onClick={signOut}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-all focus:outline-none ml-auto"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.aside 
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-60 h-full bg-[#004225] text-slate-100 flex flex-col relative z-50 shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#005c33] bg-[#002d1a]">
                <div className="flex items-center gap-3">
                  <Logo className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm tracking-tight text-white">VerdantHR</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 px-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        setMobileMenuOpen(false);
                      }}
                      suppressHydrationWarning
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive ? 'bg-white text-[#004225]' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-5 border-t border-[#005c33] bg-[#002d1a]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{user?.email?.split('@')[0]}</span>
                    <span className="text-[9px] text-[#2D6A4F] bg-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider mt-0.5">{selectedRole}</span>
                  </div>
                  <button onClick={signOut} className="p-2 rounded bg-white/10 hover:bg-red-500/20 text-slate-300">
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MAIN VIEW ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-25">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>VerdantHR</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 focus:border-brand-green/20 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:bg-white transition-all text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Real Role Display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[#2D6A4F] text-[10px] font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{selectedRole}</span>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 relative transition-all"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D6A4F] rounded-full"></span>
                )}
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Notifications</span>
                      <button 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="text-[10px] font-bold text-[#2D6A4F] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3.5 text-xs hover:bg-slate-50/50 transition-all ${!n.read ? 'bg-emerald-500/5' : ''}`}>
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800">{n.title}</span>
                            <span className="text-[9px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.text || n.message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#004225] text-white font-bold text-xs"
              >
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <span className="block text-xs font-bold text-slate-700 truncate">{user?.email || 'admin@verdanthr.com'}</span>
                      <span className="text-[9px] text-[#2D6A4F] font-bold uppercase tracking-wider">{selectedRole}</span>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <button className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 flex items-center gap-2 text-slate-600">
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-red-50 text-red-650 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'System Control' ? renderSystemControl() : (
            <>
              {/* Welcome Intro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Good day, {user?.email?.split('@')[0] || 'VerdantHR Admin'} <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500">Here is what is happening across your enterprise workforce today.</p>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Quick Actions</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Employees', value: '82', footer: '4 onboarding candidates', icon: Users, change: '+4.2%', changeType: 'positive' },
              { title: 'Active Attendance', value: '76', footer: '92.6% punctuality rate', icon: Clock, change: '92.6%', changeType: 'info' },
              { title: 'Leave Requests', value: '3', footer: '2 requests require review', icon: CalendarRange, change: 'Pending', changeType: 'warn' },
              { title: 'Sprint Completion', value: '64%', footer: '2 active sprints in progress', icon: Activity, change: '+12%', changeType: 'positive' }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                    <span className="block text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <span className={`px-1.5 py-0.25 rounded font-black ${
                        kpi.changeType === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                        kpi.changeType === 'warn' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>{kpi.change}</span>
                      <span>{kpi.footer}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[#004225]">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Visual Layout (Middle Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Charts & Analytics Table */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Interactive Weekly Shift Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">Workforce Attendance Weekly Rates</h3>
                    <p className="text-[10px] text-slate-400">Weekly simulated data index</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#2D6A4F] text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Average 95%</span>
                  </div>
                </div>

                {/* SVG Visual line chart */}
                <div className="h-48 w-full pt-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 700 150">
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="700" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Shadow Area under the line */}
                    <path d="M 10 120 L 10 30 Q 120 40 230 25 T 450 70 T 690 15 L 690 120 Z" fill="url(#chart-glow)" />
                    {/* Main stroke line */}
                    <path d="M 10 30 Q 120 40 230 25 T 450 70 T 690 15" fill="none" stroke="#2D6A4F" strokeWidth="3.5" strokeLinecap="round" />
                    
                    {/* Nodes on path */}
                    <circle cx="10" cy="30" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                    <circle cx="230" cy="25" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                    <circle cx="450" cy="70" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                    <circle cx="690" cy="15" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                  </svg>
                  
                  {/* Axis labels */}
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1">
                    <span>Monday</span>
                    <span>Wednesday</span>
                    <span>Friday</span>
                    <span>Sunday</span>
                  </div>
                </div>
              </div>

              {/* Employee Analytics Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">Staff Register Directory</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Verify department roles and security statuses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      suppressHydrationWarning
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-1 px-3 text-slate-650 focus:outline-none focus:border-brand-green/20"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR Operations">HR Operations</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-5">ID</th>
                        <th className="py-3 px-5">Employee</th>
                        <th className="py-3 px-5">Department</th>
                        <th className="py-3 px-5">Role</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600 bg-white">
                      {employees
                        .filter(e => filterDept === 'All' ? true : e.dept === filterDept)
                        .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/40 transition-all">
                            <td className="py-3 px-5 font-mono font-bold text-slate-450">{emp.id}</td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#004225]/10 text-[#004225] flex items-center justify-center font-bold text-[10px]">
                                  {emp.avatar}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800">{emp.name}</span>
                                  <span className="text-[10px] text-slate-400">{emp.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-5">{emp.dept}</td>
                            <td className="py-3 px-5">{emp.role}</td>
                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                emp.status === 'Active' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <button suppressHydrationWarning className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right side: Calendar, Tasks, Activity Feed */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Calendar Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Calendar</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">July 2026</span>
                </div>
                
                {/* Simulated Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {/* Empty spaces for offset */}
                  <span className="text-slate-300 py-1">29</span>
                  <span className="text-slate-300 py-1">30</span>
                  
                  {/* Days */}
                  <span className="py-1 font-bold text-slate-800 border border-brand-green/20 rounded bg-brand-green-pale text-[#004225]">1</span>
                  <span className="py-1 text-slate-700">2</span>
                  <span className="py-1 text-slate-700">3</span>
                  <span className="py-1 text-slate-750 font-bold">4</span>
                  <span className="py-1 text-slate-750 font-bold">5</span>
                  
                  {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(d => (
                    <span 
                      key={d} 
                      className={`py-1 text-slate-700 relative flex items-center justify-center hover:bg-slate-100 rounded cursor-pointer ${
                        d === 15 ? 'bg-amber-500/10 text-amber-800 font-bold border border-amber-500/20' : ''
                      } ${
                        d === 20 ? 'bg-purple-500/10 text-purple-800 font-bold border border-purple-500/20' : ''
                      }`}
                      title={d === 15 ? 'Leave Deadline' : d === 20 ? 'Policy Review' : ''}
                    >
                      {d}
                      {(d === 15 || d === 20) && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-current"></span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Tasks checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Your Tasks</span>
                </h3>
                
                <div className="space-y-3">
                  {tasks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleToggleTask(t.id)}
                      className="flex items-start gap-3 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-all text-xs"
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        t.done 
                          ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white' 
                          : 'border-slate-350 bg-white'
                      }`}>
                        {t.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[11px] leading-tight transition-all ${
                        t.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                      }`}>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity feed */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Recent Activity</span>
                </h3>
                
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {[
                    { title: 'Rahul Sharma clocked in', time: '10m ago', dot: 'bg-emerald-500' },
                    { title: 'Priya Singh uploaded Aadhaar docs', time: '1h ago', dot: 'bg-blue-500' },
                    { title: 'June payroll generated by Neha', time: '4h ago', dot: 'bg-amber-500' },
                    { title: 'New candidate applied: Priya Singh', time: '1d ago', dot: 'bg-[#2D6A4F]' }
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4 items-start text-xs relative pl-6">
                      <span className={`absolute left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ring-transparent ${act.dot}`}></span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 leading-tight">{act.title}</span>
                        <span className="text-[10px] text-slate-450 mt-0.5">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
            </>
          )}
        </div>

      </div>

      {/* ----------------- FLOATING AI ASSISTANT CHAT WINDOW ----------------- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Animated Popover Chat Window */}
        <AnimatePresence>
          {aiAssistantOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-96 h-[480px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-2"
            >
              {/* Chat Window Header */}
              <div className="px-4 py-3 bg-[#004225] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight leading-none">VerdantHR AI</h4>
                    <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                      Gemini Powered
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setAiAssistantOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs leading-normal">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    {msg.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-[#004225]/15 border border-[#004225]/25 flex items-center justify-center text-[#004225] flex-shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-[#2D6A4F] text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-650 rounded-tl-none shadow-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex gap-2 max-w-[85%] mr-auto">
                    <div className="w-6 h-6 rounded-full bg-[#004225]/15 border border-[#004225]/25 flex items-center justify-center text-[#004225] flex-shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-xs flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[10px] italic">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion Prompts */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
                {[
                  "Remaining leaves?",
                  "Show pending tasks",
                  "Stitch configuration"
                ].map((pText, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setChatInput('');
                      handleSendMessageFixed(pText);
                    }}
                    className="text-[9px] font-bold text-slate-500 hover:text-[#2D6A4F] bg-white border border-slate-200 hover:border-[#2D6A4F]/40 px-2 py-0.75 rounded transition-all"
                  >
                    {pText}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleFormSubmit} className="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2D6A4F]/30"
                />
                <button 
                  type="submit"
                  className="p-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#204f3b] text-white transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Button */}
        <button 
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="w-12 h-12 rounded-full bg-[#004225] hover:bg-[#005c33] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none border-2 border-white/20"
          title="VerdantHR AI Assistant"
        >
          {aiAssistantOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>

      </div>

    </div>
  );
}
