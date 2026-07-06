'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  Users, Clock, CalendarRange, 
  LayoutDashboard, Coins, Laptop, Ticket, 
  Send, Bot, Search, 
  Sparkles, LogOut, MapPin, Loader2, ArrowRight
} from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const { user, role, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated stats
  const [employeeCount] = useState(82);
  const [activeTasks] = useState([
    { id: 'T-1', title: 'Build Attendance Module', project: 'Employee Portal', priority: 'High', status: 'In Progress', deadline: '2026-08-15' },
    { id: 'T-2', title: 'Review Leave Policies', project: 'HR Handbooks', priority: 'Medium', status: 'Review', deadline: '2026-07-20' },
    { id: 'T-3', title: 'Setup database cluster', project: 'Platform Core', priority: 'Critical', status: 'To Do', deadline: '2026-07-10' }
  ]);

  // Attendance Simulator
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [todayWorkingHours, setTodayWorkingHours] = useState(0.00);
  const [gpsVerified, setGpsVerified] = useState(false);

  // Leave Balance Simulator
  const [leaveBalances, setLeaveBalances] = useState({
    casual: 5,
    sick: 10,
    earned: 15
  });

  // AI Assistant Chat Simulator
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am your AI Operations Assistant. I can answer questions about HR policies, summarize documents, track leave balances, or assist with recruitment. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Clock simulator hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClockedIn) {
      interval = setInterval(() => {
        setTodayWorkingHours(prev => parseFloat((prev + 0.01).toFixed(2)));
      }, 10000); // speed up time for demonstration
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  // Clock In/Out action
  const handleClockToggle = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(timeString);
      setClockOutTime(null);
      setGpsVerified(true);
    } else {
      setIsClockedIn(false);
      setClockOutTime(timeString);
    }
  };

  // AI chat submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiTyping(true);

    // AI Responses simulator
    setTimeout(() => {
      let aiText = "I'm processing that request using Gemini models. Let me retrieve the organization parameters for you.";
      
      const queryLower = userMsg.toLowerCase();
      if (queryLower.includes('leave') || queryLower.includes('casual')) {
        aiText = `You have ${leaveBalances.casual} casual leaves available. You have used 7 out of your allocated 12 casual leaves this year.`;
      } else if (queryLower.includes('attendance') || queryLower.includes('clock')) {
        aiText = isClockedIn 
          ? `You clocked in today at ${clockInTime}. You have tracked ${todayWorkingHours} hours of work.` 
          : `You are currently clocked out. Don't forget to mark your daily clock-in when beginning work!`;
      } else if (queryLower.includes('role') || queryLower.includes('rbac')) {
        const userRole = role || 'EMPLOYEE';
        aiText = `Your current authenticated role is '${userRole}'. Your privileges include: ${
          userRole === 'HR_MANAGER' ? 'Full employee CRUD operations, recruitment management, and audit log tracking.' :
          userRole === 'FINANCE_EXECUTIVE' ? 'Full salary adjustment, payslip generation, and financial reports.' :
          userRole === 'SUPER_ADMIN' ? 'Root access across all components and tenant configuration.' :
          'Standard self-service profile updates, leave planning, and task completion.'
        }`;
      } else if (queryLower.includes('stitch') || queryLower.includes('design')) {
        aiText = "The Google Stitch SDK is configured at `/src/lib/stitch.ts`. It allows programmatically triggering Gemini to build layouts, export Tailwind CSS classes, and create UI screen variants from text prompts.";
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: aiText }]);
      setIsAiTyping(false);
    }, 1000);
  };

  // Simulated leave request
  const applySimulatedLeave = () => {
    if (leaveBalances.casual > 0) {
      setLeaveBalances(prev => ({ ...prev, casual: prev.casual - 1 }));
      alert('Simulated leave request submitted successfully! Pending Department Manager approval.');
    } else {
      alert('Error: Leave balance cannot be negative.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-green/15">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-green shadow-lg shadow-brand-green/20 border border-brand-green-light/45">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 font-sans tracking-tight">
                VerdantHR
              </h1>
              <p className="text-[10px] text-slate-400">Enterprise Workforce Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">


            {/* Auth Indicator */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.email?.split('@')[0]}</span>
                  <span className="text-[9px] text-emerald-400 uppercase tracking-wider">{role || 'EMPLOYEE'}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-950/20 hover:border-red-800/40 text-slate-400 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-medium text-amber-400">Local Auth Simulator Mode</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Side: Workspaces / Modules (8 columns) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Welcome Alert */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-green/30 via-slate-900/20 to-slate-900/30 p-6 border border-brand-green/20 shadow-md">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/15 text-brand-green-pale border border-brand-green/20 w-fit">
                <Sparkles className="w-3 h-3" /> Ready for Development
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
                Project Initialized Successfully
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Next.js 15, TypeScript, Tailwind, Prisma client, Firebase auth modules, and the Google Stitch SDK configurations are set up and validated.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  DB Provider: <span className="text-brand-green-accent font-semibold">PostgreSQL</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  Prisma Client: <span className="text-emerald-400 font-semibold">v7.8.0</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  Stitch Status: <span className="text-brand-green-light font-semibold">Loaded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Workforce Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Attendance Clock In/Out card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">Attendance Tracker</h3>
                      <p className="text-[11px] text-slate-400">Mark daily shift attendance</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isClockedIn ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isClockedIn ? 'CLOCKED IN' : 'OFF DUTY'}
                  </span>
                </div>

                <div className="my-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between text-center">
                  <div className="flex-1">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Clock In</span>
                    <span className="text-sm font-semibold text-slate-200">{clockInTime || '--:--'}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex-1">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Working Hours</span>
                    <span className="text-sm font-semibold text-slate-200">{todayWorkingHours.toFixed(2)}h</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex-1">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Clock Out</span>
                    <span className="text-sm font-semibold text-slate-200">{clockOutTime || '--:--'}</span>
                  </div>
                </div>

                {gpsVerified && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>GPS location verified: 28.6139° N, 77.2090° E</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleClockToggle}
                suppressHydrationWarning
                className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md ${
                  isClockedIn 
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/20' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/20'
                }`}
              >
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
              </button>
            </div>

            {/* Leave Balances card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">Leave & Time-Off</h3>
                    <p className="text-[11px] text-slate-400">Plan and request time off</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-center">
                    <span className="block text-xl font-bold text-blue-400">{leaveBalances.casual}</span>
                    <span className="text-[10px] text-slate-400">Casual</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-center">
                    <span className="block text-xl font-bold text-purple-400">{leaveBalances.sick}</span>
                    <span className="text-[10px] text-slate-400">Sick</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-center">
                    <span className="block text-xl font-bold text-amber-400">{leaveBalances.earned}</span>
                    <span className="text-[10px] text-slate-400">Earned</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={applySimulatedLeave}
                  suppressHydrationWarning
                  className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-950/10 text-xs font-semibold text-slate-300 hover:text-blue-300 transition-all"
                >
                  Apply Casual Leave
                </button>
              </div>
            </div>

            {/* Employee Management card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">Employee Directory</h3>
                    <p className="text-[11px] text-slate-400">Manage and onboard staff</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-indigo-950/30 border border-indigo-900/40 text-[10px] font-bold text-indigo-400">
                  {employeeCount} TOTAL
                </div>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  suppressHydrationWarning
                  placeholder="Search name, role, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Sample list */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {[
                  { name: 'Rahul Sharma', id: 'EMP1023', dept: 'Engineering', role: 'Software Engineer', status: 'Active' },
                  { name: 'Priya Singh', id: 'EMP1024', dept: 'Engineering', role: 'Candidate (Interviewing)', status: 'Interview' },
                  { name: 'Raj Sharma', id: 'EMP005', dept: 'HR Operations', role: 'HR Manager', status: 'Active' }
                ].filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map((emp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-850 hover:bg-slate-950/80 transition-all text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-300">{emp.name}</span>
                      <span className="text-[10px] text-slate-500">{emp.dept} • {emp.role}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                      emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Task Tracker card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">Task Kanban & Sprints</h3>
                      <p className="text-[11px] text-slate-400">Sprint planning and tasks</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">3 active</span>
                </div>

                <div className="space-y-3">
                  {activeTasks.map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col gap-1 hover:border-slate-700 transition-all text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-300">{t.title}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded ${
                          t.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          t.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{t.project}</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-400">
                          Status: <span className="text-amber-400 font-semibold">{t.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-1 border-t border-slate-850">
                <button suppressHydrationWarning className="flex items-center justify-between w-full text-left text-[11px] text-indigo-400 hover:text-indigo-300 font-medium group transition-all">
                  <span>Open Interactive Kanban Board</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Payroll Management card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">Payroll & Salary</h3>
                    <p className="text-[11px] text-slate-400">Automated compensation structures</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Basic Salary:</span>
                    <span className="font-medium text-slate-350">₹60,000</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">House Rent Allowance (HRA):</span>
                    <span className="font-medium text-slate-350">₹12,000</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Overtime & Bonuses:</span>
                    <span className="font-medium text-emerald-400">+₹8,000</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Deductions (Taxes/PF):</span>
                    <span className="font-medium text-rose-450">-₹2,500</span>
                  </div>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">Net Take-Home Salary:</span>
                    <span className="text-emerald-400">₹77,500</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-all">
                  Generate Payslip PDF
                </button>
              </div>
            </div>

            {/* IT Help Desk & Asset Tracking card */}
            <div className="rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 shadow-lg hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">IT Assets & Help Desk</h3>
                    <p className="text-[11px] text-slate-400">Track hardware and support tickets</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <span className="block font-medium text-slate-350">MacBook Pro M3</span>
                        <span className="text-[9px] text-slate-500">SN: MB-2026-X83</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Allocated</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <span className="block font-medium text-slate-350">Software license request</span>
                        <span className="text-[9px] text-slate-550">Ticket #8492</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">Pending</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-all">
                  Open Support Ticket
                </button>
              </div>
            </div>

          </div>

        </section>

        {/* Right Side: AI Assistant Sidebar (4 columns) */}
        <section className="lg:col-span-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-xl flex flex-col h-[700px] lg:h-auto overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">AI Operations Assistant</h3>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active (Gemini 3.5)
                </span>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                {msg.sender === 'assistant' && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900/80 border border-slate-850 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-850 text-slate-500 rounded-tl-none flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] font-medium italic">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-slate-850/50 bg-slate-950/10">
            <span className="block text-[9px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">Suggested Questions:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "How many casual leaves do I have remaining?",
                "What is Google Stitch?",
                "Explain current simulated role permissions"
              ].map((txt, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setChatInput(txt);
                  }}
                  className="text-[10px] text-slate-400 hover:text-blue-300 bg-slate-950 border border-slate-850 hover:border-blue-500/40 px-2 py-1 rounded-md transition-all text-left truncate max-w-full"
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2">
            <input 
              type="text" 
              suppressHydrationWarning
              placeholder="Ask a policy, query data, sync status..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
            <button 
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-md shadow-blue-950/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </section>

      </main>
    </div>
  );
}
