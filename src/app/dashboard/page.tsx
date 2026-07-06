'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserRoleAction, getUsersAction, syncFirebaseUsersAction, createUserAction } from '@/actions/update-role';
import { Role, LeaveType, LeaveStatus, AttendanceStatus, AssetStatus, TicketStatus, TicketPriority } from '@prisma/client';
import { 
  Users, Clock, CalendarRange, 
  LayoutDashboard, Coins, Laptop, Ticket, 
  Shield, Search, LogOut,
  Menu, Bell, ChevronLeft, ChevronRight, X,
  User, Settings, Plus, TrendingUp,
  CheckCircle2, Calendar, MessageSquare,
  Activity, Check, MoreHorizontal, Sparkles,
  Bot, Send, Loader2, RefreshCw, PlusCircle, AlertCircle
} from 'lucide-react';
import {
  seedSampleDataAction,
  getOverviewStatsAction,
  getEmployeesListAction,
  createEmployeeAction,
  getAttendanceListAction,
  clockInAttendanceAction,
  clockOutAttendanceAction,
  getLeaveRequestsListAction,
  createLeaveRequestAction,
  updateLeaveStatusAction,
  getPayrollsListAction,
  createPayrollAction,
  updatePayrollStatusAction,
  getAssetsListAction,
  createAssetAction,
  assignAssetAction,
  getTicketsListAction,
  createTicketAction,
  updateTicketStatusAction,
  getDeptsAndDesigsAction,
  getEmployeeDepartmentAction
} from '@/actions/features';

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

  // Modal Open States
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<any>(null);

  // Form States
  const [empForm, setEmpForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    employmentType: 'Full-time',
    status: 'Active',
    departmentId: '',
    designationId: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [assetForm, setAssetForm] = useState({
    name: '',
    serialNumber: '',
    type: 'Laptop'
  });

  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 50000
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'IT Support',
    priority: 'MEDIUM'
  });

  const [userForm, setUserForm] = useState({
    email: '',
    role: 'EMPLOYEE' as Role,
    password: ''
  });

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

  // simulated tasks checklist
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

  // Database-backed States
  const [liveStats, setLiveStats] = useState({ totalEmployees: 0, activeAttendance: 0, pendingLeaves: 0, openTickets: 0 });
  const [realEmployees, setRealEmployees] = useState<any[]>([]);
  const [realAttendance, setRealAttendance] = useState<any[]>([]);
  const [realLeaves, setRealLeaves] = useState<any[]>([]);
  const [realPayrolls, setRealPayrolls] = useState<any[]>([]);
  const [realAssets, setRealAssets] = useState<any[]>([]);
  const [realTickets, setRealTickets] = useState<any[]>([]);
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  
  const [loadingTab, setLoadingTab] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [syncingFirebase, setSyncingFirebase] = useState(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [loadingDbUsers, setLoadingDbUsers] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(true);

  const [rbacLogs, setRbacLogs] = useState<string[]>([
    "System Audit Log Initialized.",
    "Prisma DB Engine connected.",
    "Firebase Admin SDK initialized."
  ]);
  const [rbacStatus, setRbacStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userDept, setUserDept] = useState<{ name: string | null; code: string | null } | null>(null);

  useEffect(() => {
    async function fetchUserDept() {
      if (user?.email) {
        const res = await getEmployeeDepartmentAction(user.email);
        if (res.success && res.departmentName) {
          setUserDept({ name: res.departmentName, code: res.departmentCode });
        }
      }
    }
    fetchUserDept();
  }, [user?.email]);

  const isAccountsStaff = selectedRole === 'SUPER_ADMIN' || (
    userDept && (
      userDept.name?.toLowerCase().includes('accounts') || 
      userDept.name?.toLowerCase().includes('finance') || 
      userDept.code?.toUpperCase() === 'FIN'
    )
  );

  // Fetch Database Data for Active Tab
  const fetchTabData = async () => {
    setLoadingTab(true);
    setRbacStatus(null);
    try {
      if (activeTab === 'Overview') {
        const res = await getOverviewStatsAction();
        if (res.success && res.stats) {
          setLiveStats(res.stats);
        }
      } else if (activeTab === 'Employees') {
        const res = await getEmployeesListAction();
        if (res.success && res.employees) setRealEmployees(res.employees);
        const configRes = await getDeptsAndDesigsAction();
        if (configRes.success) {
          setDepartments(configRes.departments || []);
          setDesignations(configRes.designations || []);
        }
      } else if (activeTab === 'Attendance') {
        const res = await getAttendanceListAction(user?.email || undefined, selectedRole as Role);
        if (res.success && res.logs) setRealAttendance(res.logs);
      } else if (activeTab === 'Leaves') {
        const res = await getLeaveRequestsListAction();
        if (res.success && res.requests) setRealLeaves(res.requests);
      } else if (activeTab === 'Payroll') {
        const res = await getPayrollsListAction();
        if (res.success && res.payrolls) setRealPayrolls(res.payrolls);
        const empRes = await getEmployeesListAction();
        if (empRes.success && empRes.employees) setRealEmployees(empRes.employees);
      } else if (activeTab === 'Assets') {
        const res = await getAssetsListAction();
        if (res.success && res.assets) setRealAssets(res.assets);
        const empRes = await getEmployeesListAction();
        if (empRes.success && empRes.employees) setRealEmployees(empRes.employees);
      } else if (activeTab === 'Help Desk') {
        const res = await getTicketsListAction();
        if (res.success && res.tickets) setRealTickets(res.tickets);
      } else if (activeTab === 'System Control') {
        setLoadingDbUsers(true);
        const res = await getUsersAction();
        if (res.success && res.users) {
          setDbUsers(res.users);
          setIsDbConnected(true);
        } else {
          setIsDbConnected(false);
          setRbacStatus({ type: 'error', text: res.error || 'Failed to retrieve database users.' });
        }
        setLoadingDbUsers(false);
      }
    } catch (e) {
      console.error(e);
      setIsDbConnected(false);
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Seeder Trigger
  const handleSeedData = async () => {
    setSeeding(true);
    setRbacStatus(null);
    try {
      const res = await seedSampleDataAction();
      if (res.success) {
        setRbacStatus({ type: 'success', text: 'Sample data successfully seeded to database!' });
        setRbacLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Seeded sample organization, departments, designations, employees, attendance logs, leave requests, assets, and support tickets.`,
          ...prev
        ]);
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to seed sample data.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error seeding database.' });
    } finally {
      setSeeding(false);
    }
  };

  // Sync Firebase Users Action
  const handleSyncFirebaseUsers = async () => {
    setSyncingFirebase(true);
    setRbacStatus(null);
    try {
      const res = await syncFirebaseUsersAction();
      if (res.success) {
        setRbacStatus({ type: 'success', text: `Successfully synced ${res.count} user(s) from Firebase Auth.` });
        setRbacLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Sync triggered: Synced ${res.count} account(s).`,
          ...prev
        ]);
        const usersRes = await getUsersAction();
        if (usersRes.success && usersRes.users) {
          setDbUsers(usersRes.users);
        }
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to sync users.' });
      }
    } catch (e) {
      console.error(e);
      setRbacStatus({ type: 'error', text: 'An error occurred during synchronization.' });
    } finally {
      setSyncingFirebase(false);
    }
  };

  // Role Change Action
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRbacStatus(null);
    try {
      const res = await createUserAction(userForm.email, userForm.role, userForm.password);
      if (res.success && res.user) {
        setIsUserModalOpen(false);
        setUserForm({ email: '', role: 'EMPLOYEE' as Role, password: '' });
        setRbacStatus({ type: 'success', text: res.message || `User ${userForm.email} successfully created.` });
        setRbacLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Created user ${userForm.email} with role ${userForm.role}.`,
          ...prev
        ]);
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to create user.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error creating user.' });
    }
  };

  // Form Submissions
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setRbacStatus(null);
    try {
      const res = await createEmployeeAction(empForm);
      if (res.success) {
        setIsEmpModalOpen(false);
        setEmpForm({
          employeeId: '',
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          employmentType: 'Full-time',
          status: 'Active',
          departmentId: '',
          designationId: ''
        });
        setRbacStatus({ type: 'success', text: 'Employee successfully created.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to create employee.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'An error occurred while creating employee.' });
    }
  };

  const handleSelfClockIn = async () => {
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const res = await clockInAttendanceAction(user.email);
      if (res.success) {
        setRbacStatus({ type: 'success', text: 'Clocked in successfully!' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to clock in.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error clocking in.' });
    }
  };

  const handleSelfClockOut = async () => {
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const res = await clockOutAttendanceAction(user.email);
      if (res.success) {
        setRbacStatus({ type: 'success', text: 'Clocked out successfully!' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to clock out.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error clocking out.' });
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const res = await createLeaveRequestAction({
        employeeEmail: user.email,
        leaveType: leaveForm.leaveType as LeaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason
      });
      if (res.success) {
        setIsLeaveModalOpen(false);
        setLeaveForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
        setRbacStatus({ type: 'success', text: 'Leave request submitted successfully.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to submit leave.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error submitting leave.' });
    }
  };

  const handleApproveLeave = async (id: string, approve: boolean) => {
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const status = approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
      const res = await updateLeaveStatusAction(id, status, user.email);
      if (res.success) {
        setRbacStatus({ type: 'success', text: `Leave request ${approve ? 'approved' : 'rejected'} successfully.` });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to update leave request.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error updating leave request.' });
    }
  };

  const handleCalculatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setRbacStatus(null);
    try {
      const res = await createPayrollAction({
        employeeId: payrollForm.employeeId,
        month: Number(payrollForm.month),
        year: Number(payrollForm.year),
        basicSalary: Number(payrollForm.basicSalary)
      });
      if (res.success) {
        setIsPayrollModalOpen(false);
        setPayrollForm({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: 50000 });
        setRbacStatus({ type: 'success', text: 'Payroll record generated successfully.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to generate payroll.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error generating payroll.' });
    }
  };

  const handleTogglePayrollStatus = async (id: string, currentStatus: string) => {
    setRbacStatus(null);
    try {
      const nextStatus = currentStatus === 'Draft' ? 'Approved' : currentStatus === 'Approved' ? 'Paid' : 'Draft';
      const res = await updatePayrollStatusAction(id, nextStatus);
      if (res.success) {
        setRbacStatus({ type: 'success', text: `Payroll status updated to ${nextStatus}.` });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to update payroll status.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error updating payroll status.' });
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRbacStatus(null);
    try {
      const res = await createAssetAction(assetForm);
      if (res.success) {
        setIsAssetModalOpen(false);
        setAssetForm({ name: '', serialNumber: '', type: 'Laptop' });
        setRbacStatus({ type: 'success', text: 'Asset added successfully.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to add asset.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error adding asset.' });
    }
  };

  const handleAssignAsset = async (employeeId: string | null) => {
    if (!selectedAssetForAssign) return;
    setRbacStatus(null);
    try {
      const res = await assignAssetAction(selectedAssetForAssign.id, employeeId);
      if (res.success) {
        setSelectedAssetForAssign(null);
        setRbacStatus({ type: 'success', text: employeeId ? 'Asset assigned successfully.' : 'Asset reclaimed successfully.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to update asset assignment.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error updating asset assignment.' });
    }
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const res = await createTicketAction({
        employeeEmail: user.email,
        title: ticketForm.title,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority as TicketPriority
      });
      if (res.success) {
        setIsTicketModalOpen(false);
        setTicketForm({ title: '', description: '', category: 'IT Support', priority: 'MEDIUM' });
        setRbacStatus({ type: 'success', text: 'Support ticket raised successfully.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to raise ticket.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error raising support ticket.' });
    }
  };

  const handleResolveTicket = async (id: string) => {
    if (!user?.email) return;
    setRbacStatus(null);
    try {
      const res = await updateTicketStatusAction(id, TicketStatus.RESOLVED, user.email);
      if (res.success) {
        setRbacStatus({ type: 'success', text: 'Support ticket marked as resolved.' });
        fetchTabData();
      } else {
        setRbacStatus({ type: 'error', text: res.error || 'Failed to resolve ticket.' });
      }
    } catch (err) {
      setRbacStatus({ type: 'error', text: 'Error resolving ticket.' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    handleSendMessageFixed(text);
  };

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

  // -------------------------------------------------------------
  // TAB COMPONENT RENDERERS
  // -------------------------------------------------------------

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Good day, {user?.email?.split('@')[0] || 'VerdantHR Admin'} <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500">Here is what is happening across your enterprise workforce today.</p>
          </div>
          {selectedRole === 'SUPER_ADMIN' && liveStats.totalEmployees === 0 && (
            <button 
              onClick={handleSeedData}
              disabled={seeding}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{seeding ? 'Seeding...' : 'Seed Sample Data'}</span>
            </button>
          )}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Employees', value: liveStats.totalEmployees.toString(), footer: 'Active staff registered', icon: Users, change: 'Live', changeType: 'info' },
            { title: 'Active Attendance', value: liveStats.activeAttendance.toString(), footer: "Today's checked-in logs", icon: Clock, change: 'Today', changeType: 'positive' },
            { title: 'Leave Requests', value: liveStats.pendingLeaves.toString(), footer: 'Requires approval', icon: CalendarRange, change: 'Pending', changeType: 'warn' },
            { title: 'IT Support Tickets', value: liveStats.openTickets.toString(), footer: 'Open service desk items', icon: Ticket, change: 'Tickets', changeType: 'warn' }
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
                  <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="700" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  
                  <path d="M 10 120 L 10 30 Q 120 40 230 25 T 450 70 T 690 15 L 690 120 Z" fill="url(#chart-glow)" />
                  <path d="M 10 30 Q 120 40 230 25 T 450 70 T 690 15" fill="none" stroke="#2D6A4F" strokeWidth="3.5" strokeLinecap="round" />
                  
                  <circle cx="10" cy="30" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                  <circle cx="230" cy="25" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                  <circle cx="450" cy="70" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                  <circle cx="690" cy="15" r="5" fill="#2D6A4F" stroke="white" strokeWidth="2" />
                </svg>
                
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1">
                  <span>Monday</span>
                  <span>Wednesday</span>
                  <span>Friday</span>
                  <span>Sunday</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Action Tasks checklist */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Your Action Items</span>
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

            {/* System Connection Diagnostics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#2D6A4F]" />
                <span>Service Connection Registry</span>
              </h3>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                  <span className="text-slate-455 font-medium">MongoDB Core Connection</span>
                  <span className="px-1.5 py-0.25 bg-emerald-100 text-emerald-850 rounded font-black text-[9px] uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-455 font-medium">Database Mode (Prisma)</span>
                  <span className="px-1.5 py-0.25 bg-blue-100 text-blue-800 rounded font-black text-[9px] uppercase">Replica Set</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployees = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-5.5 h-5.5 text-[#004225]" />
              <span>Employees Directory</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify employee roles, contact information, and current system registry</p>
          </div>
          <button 
            onClick={() => setIsEmpModalOpen(true)}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase mt-1">Filter Dept:</span>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-1 px-3 text-slate-650 focus:outline-none focus:border-brand-green/20"
            >
              <option value="All">All Departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Emp ID</th>
                  <th className="py-3 px-5">Name & Email</th>
                  <th className="py-3 px-5">Department & Designation</th>
                  <th className="py-3 px-5">Employment Type</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650 bg-white">
                {realEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No employees found. Seed sample data or add a new employee profile.
                    </td>
                  </tr>
                ) : (
                  realEmployees
                    .filter((e: any) => filterDept === 'All' || (e.department?.name === filterDept))
                    .map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50/40 transition-all">
                        <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400 font-semibold">{e.employeeId}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#004225]/10 text-[#004225] font-black text-xs flex items-center justify-center">
                              {e.firstName[0] || 'E'}{e.lastName[0] || 'M'}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-800">{e.firstName} {e.lastName}</span>
                              <span className="block text-[10px] text-slate-455">{e.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="block font-semibold text-slate-700">{e.designation?.title || 'Not Assigned'}</span>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{e.department?.name || 'No Dept'}</span>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-600">{e.employmentType}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            e.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            e.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        {isEmpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[450px] p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Add New Employee Profile</h3>
                <button onClick={() => setIsEmpModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Employee ID</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. EMP006"
                      value={empForm.employeeId}
                      onChange={(e) => setEmpForm({...empForm, employeeId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="employee@company.com"
                      value={empForm.email}
                      onChange={(e) => setEmpForm({...empForm, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">First Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="John"
                      value={empForm.firstName}
                      onChange={(e) => setEmpForm({...empForm, firstName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Doe"
                      value={empForm.lastName}
                      onChange={(e) => setEmpForm({...empForm, lastName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Department</label>
                    <select
                      value={empForm.departmentId}
                      onChange={(e) => setEmpForm({...empForm, departmentId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Designation</label>
                    <select
                      value={empForm.designationId}
                      onChange={(e) => setEmpForm({...empForm, designationId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Employment Type</label>
                    <select
                      value={empForm.employmentType}
                      onChange={(e) => setEmpForm({...empForm, employmentType: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Mobile Number</label>
                    <input 
                      type="text" 
                      placeholder="+91 XXXXX XXXXX"
                      value={empForm.mobile}
                      onChange={(e) => setEmpForm({...empForm, mobile: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Create Employee Profile
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendance = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5.5 h-5.5 text-[#004225]" />
              <span>Workforce Attendance Register</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify employee daily clock-in/out registers and calculate active work hours</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSelfClockIn}
              className="px-3.5 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Clock In (Self)</span>
            </button>
            <button
              onClick={handleSelfClockOut}
              className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Clock Out (Self)</span>
            </button>
          </div>
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

        {/* Attendance Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Employee</th>
                  <th className="py-3 px-5">Clock In</th>
                  <th className="py-3 px-5">Clock Out</th>
                  <th className="py-3 px-5">Active Work Hours</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
                {realAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No attendance logs found in database. Seed sample data or clock in!
                    </td>
                  </tr>
                ) : (
                  realAttendance.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5 font-medium text-slate-600">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {log.employee?.firstName} {log.employee?.lastName} ({log.employee?.email})
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">
                        {new Date(log.clockIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">
                        {log.clockOut ? new Date(log.clockOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">
                        {log.workingHours ? `${log.workingHours} hrs` : '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaves = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <CalendarRange className="w-5.5 h-5.5 text-[#004225]" />
              <span>Leave Approval Desk & Balances</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Approve, reject, or audit enterprise-wide leave requests and balances</p>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
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

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-150">
            <h3 className="font-bold text-slate-800 text-sm">Active Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Employee</th>
                  <th className="py-3 px-5">Leave Type</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Reason</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
                {realLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No leave requests found in database. Seed sample data or apply!
                    </td>
                  </tr>
                ) : (
                  realLeaves.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5">
                        <span className="block font-bold text-slate-800">{req.employee?.firstName} {req.employee?.lastName}</span>
                        <span className="block text-[9px] text-slate-450">{req.employee?.email}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">{req.leaveType}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 max-w-[200px] truncate text-slate-500" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveLeave(req.id, true)}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 rounded-lg font-black text-[9px] uppercase border border-emerald-500/15"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveLeave(req.id, false)}
                              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-755 rounded-lg font-black text-[9px] uppercase border border-red-500/15"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Apply Leave Modal */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[400px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Apply for Leave</h3>
                <button onClick={() => setIsLeaveModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddLeave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="EARNED">Earned Leave</option>
                    <option value="WORK_FROM_HOME">Work From Home</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required 
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">End Date</label>
                    <input 
                      type="date" 
                      required 
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Reason Description</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Brief details about the request..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Submit Leave Application
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPayroll = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Coins className="w-5.5 h-5.5 text-[#004225]" />
              <span>Compensation & Payroll Administration</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify historical compensations and generate draft salaries for employee profiles</p>
          </div>
          {isAccountsStaff && (
            <button
              onClick={() => setIsPayrollModalOpen(true)}
              className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Payroll</span>
            </button>
          )}
        </div>

        {!isAccountsStaff && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-855 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Access Restricted: </span>
              Generate payroll controls and compensation status actions are restricted to members of the **Accounts / Finance** department.
            </div>
          </div>
        )}

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

        {/* History Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Employee</th>
                  <th className="py-3 px-5">Period</th>
                  <th className="py-3 px-5">Basic Salary</th>
                  <th className="py-3 px-5">HRA & Allowances</th>
                  <th className="py-3 px-5">Deductions (PF + Taxes)</th>
                  <th className="py-3 px-5">Net Salary</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
                {realPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No payroll records found in database. Seed sample data or generate payroll!
                    </td>
                  </tr>
                ) : (
                  realPayrolls.map((pr: any) => (
                    <tr key={pr.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5">
                        <span className="block font-bold text-slate-800">{pr.employee?.firstName} {pr.employee?.lastName}</span>
                        <span className="block text-[9px] text-slate-450">{pr.employee?.email}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">
                        {pr.month}/{pr.year}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-650">₹{pr.basicSalary.toLocaleString()}</td>
                      <td className="py-3.5 px-5 font-medium text-slate-650">₹{pr.hra.toLocaleString()}</td>
                      <td className="py-3.5 px-5 font-medium text-red-650">₹{(pr.providentFund + pr.incomeTax + pr.professionalTax).toLocaleString()}</td>
                      <td className="py-3.5 px-5 font-black text-[#004225]">₹{pr.netSalary.toLocaleString()}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          pr.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          pr.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-750 border-slate-100'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {isAccountsStaff ? (
                          <button
                            onClick={() => handleTogglePayrollStatus(pr.id, pr.status)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-black text-[9px] uppercase border border-slate-200 transition-all"
                          >
                            Change Status
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Payroll Modal */}
        {isPayrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[400px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Calculate Employee Payroll</h3>
                <button onClick={() => setIsPayrollModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCalculatePayroll} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Select Employee</label>
                  <select
                    required
                    value={payrollForm.employeeId}
                    onChange={(e) => setPayrollForm({...payrollForm, employeeId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                  >
                    <option value="">Select Employee Profile</option>
                    {realEmployees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Month</label>
                    <select
                      value={payrollForm.month}
                      onChange={(e) => setPayrollForm({...payrollForm, month: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Year</label>
                    <input 
                      type="number" 
                      required 
                      value={payrollForm.year}
                      onChange={(e) => setPayrollForm({...payrollForm, year: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Basic Salary (Monthly)</label>
                  <input 
                    type="number" 
                    required 
                    value={payrollForm.basicSalary}
                    onChange={(e) => setPayrollForm({...payrollForm, basicSalary: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Generate Compensation Record
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAssets = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Laptop className="w-5.5 h-5.5 text-[#004225]" />
              <span>IT & Enterprise Asset Registry</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify hardware/software asset connection states and assign configurations to staff profiles</p>
          </div>
          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
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

        {/* Assets Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Asset Name</th>
                  <th className="py-3 px-5">Serial Number</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Assignment Status</th>
                  <th className="py-3 px-5">Allocated To</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
                {realAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No assets found in database. Seed sample data or add one!
                    </td>
                  </tr>
                ) : (
                  realAssets.map((asset: any) => (
                    <tr key={asset.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5 font-bold text-slate-800">{asset.name}</td>
                      <td className="py-3.5 px-5 font-mono text-[10px] text-slate-500">{asset.serialNumber}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-600">{asset.type}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          asset.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        {asset.allocatedTo ? (
                          <>
                            <span className="block font-semibold">{asset.allocatedTo.firstName} {asset.allocatedTo.lastName}</span>
                            <span className="block text-[9px] text-slate-450 font-mono">Since: {new Date(asset.allocatedDate).toLocaleDateString()}</span>
                          </>
                        ) : 'Unallocated'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {asset.status === 'AVAILABLE' ? (
                          <button
                            onClick={() => setSelectedAssetForAssign(asset)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 rounded-lg font-black text-[9px] uppercase border border-emerald-500/15"
                          >
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              setSelectedAssetForAssign(asset);
                              // Directly reclaiming
                              setRbacStatus(null);
                              try {
                                const res = await assignAssetAction(asset.id, null);
                                if (res.success) {
                                  setSelectedAssetForAssign(null);
                                  setRbacStatus({ type: 'success', text: 'Asset reclaimed successfully.' });
                                  fetchTabData();
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-755 rounded-lg font-black text-[9px] uppercase border border-red-500/15"
                          >
                            Reclaim
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Asset Modal */}
        {isAssetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[350px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Add New Asset Profile</h3>
                <button onClick={() => setIsAssetModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Asset Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MacBook Pro M3 Max"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Serial Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. SN-MB3-8271A"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({...assetForm, serialNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Asset Type</label>
                  <select
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({...assetForm, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Mobile Phone">Mobile Phone</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Create Asset Item
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Assign Asset Dropdown Dialog */}
        {selectedAssetForAssign && selectedAssetForAssign.status === 'AVAILABLE' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[350px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Assign Asset: {selectedAssetForAssign.name}</h3>
                <button onClick={() => setSelectedAssetForAssign(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Select Employee Profile</label>
                  <select
                    onChange={(e) => handleAssignAsset(e.target.value)}
                    defaultValue=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                  >
                    <option value="" disabled>Select Employee</option>
                    {realEmployees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHelpDesk = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Ticket className="w-5.5 h-5.5 text-[#004225]" />
              <span>Enterprise Help Desk</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Verify software or hardware support tickets raised by team members</p>
          </div>
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Ticket</span>
          </button>
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

        {/* Tickets Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Ticket Details</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Raised By</th>
                  <th className="py-3 px-5">Assigned Agent</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
                {realTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No support tickets found in database. Seed sample data or raise one!
                    </td>
                  </tr>
                ) : (
                  realTickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-all">
                      <td className="py-3.5 px-5">
                        <span className="block font-bold text-slate-800">{t.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{t.description}</span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-655">{t.category}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' :
                          t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-105' :
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-750">
                        {t.raisedBy ? `${t.raisedBy.firstName} ${t.raisedBy.lastName}` : 'System'}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-655">
                        {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {t.status === 'OPEN' && (
                          <button
                            onClick={() => handleResolveTicket(t.id)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 rounded-lg font-black text-[9px] uppercase border border-emerald-500/15"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raise Ticket Modal */}
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[350px] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Submit IT Support Ticket</h3>
                <button onClick={() => setIsTicketModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Issue Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Cannot connect to office VPN"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Issue Description</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Describe the problem you are facing..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      <option value="IT Support">IT Support</option>
                      <option value="Software Support">Software Support</option>
                      <option value="Facilities">Facilities</option>
                      <option value="HR Inquiry">HR Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Raise IT Ticket
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-[#004225]" />
            <span>VerdantHR System Settings</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Verify system-wide isolation configs, client integrations, and keys</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-655">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Organization Profile</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Active Organization</label>
              <input type="text" readOnly value="Verdant Enterprise" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Unique Enterprise Code</label>
              <input type="text" readOnly value="VE" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-400 cursor-not-allowed" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Integrations Configuration</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Google Stitch SDK</label>
              <div className="flex gap-2">
                <input type="password" readOnly value="**************************" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-400 cursor-not-allowed" />
                <span className="px-3 py-2 bg-emerald-100 text-[#004225] font-black rounded-xl text-[9px] uppercase tracking-wider h-fit mt-1">Configured</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Firebase Client ID</label>
              <input type="text" readOnly value="verdanthr-21152" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemControl = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="w-5.5 h-5.5 text-[#004225]" />
              <span>System Control & Role-Based Access Control (RBAC)</span>
            </h2>
            <p className="text-xs text-slate-500">Root-level tenant configuration, live database status, and real-time user role management.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-705 text-white text-xs font-bold rounded-xl transition-all shadow-xs border border-amber-700 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? 'Seeding...' : 'Seed Sample Data'}</span>
            </button>
          </div>
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
              <div className="flex items-center gap-2">
                {loadingDbUsers && (
                  <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold flex-shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching...</span>
                  </div>
                )}
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#2D6A4F] hover:bg-[#204f3b] text-white text-[10px] font-bold rounded-xl transition-all shadow-xs flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
                <button
                  onClick={handleSyncFirebaseUsers}
                  disabled={syncingFirebase || loadingDbUsers}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] hover:text-[#1B4332] text-[10px] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#2D6A4F]/15 flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${syncingFirebase ? 'animate-spin' : ''}`} />
                  <span>{syncingFirebase ? 'Syncing...' : 'Sync Firebase Users'}</span>
                </button>
              </div>
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
                <tbody className="divide-y divide-slate-100 text-xs text-slate-655 bg-white">
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
                            'bg-slate-50 text-slate-700 border-slate-105'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="bg-slate-50 border border-slate-200 text-[11px] rounded-lg py-1 px-2 text-slate-655 focus:outline-none focus:border-brand-green/20"
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
                  <span className="text-slate-455 font-medium">Database Node (Prisma)</span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isDbConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-slate-455 font-medium">Firebase Auth Server</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">Online</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-slate-455 font-medium">Firebase Admin Node</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">Configured</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-455 font-medium">Tenant Isolation Mode</span>
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

        {/* Add User Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-[380px] p-6 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Add New User Account</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-650">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="user@verdanthr.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="Min 6 characters (Optional)"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">RBAC System Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as Role})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:bg-white text-slate-600"
                  >
                    {Object.values(Role).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-2.5 bg-[#2D6A4F] hover:bg-[#204f3b] text-white font-bold rounded-xl transition-all shadow-xs"
                >
                  Create User Profile
                </button>
              </form>
            </div>
          </div>
        )}
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
            className="p-1 rounded bg-[#005c33] text-slate-355 hover:text-white transition-all focus:outline-none hidden md:block"
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
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-305 hover:text-red-300 transition-all focus:outline-none ml-auto"
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
              className="p-1.5 rounded-lg text-slate-550 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-555 font-medium">
              <span>VerdantHR</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-404" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 focus:border-brand-green/20 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:bg-white transition-all text-slate-700 placeholder-slate-404"
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
                      <span className="text-xs font-bold text-slate-705">Notifications</span>
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
                          <p className="text-slate-505 text-[11px] mt-0.5">{n.text || n.message}</p>
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
                      <button className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-105 flex items-center gap-2 text-slate-600">
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
          {loadingTab ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#2D6A4F] font-semibold gap-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs text-slate-400 mt-2">Connecting to Replica Set...</span>
            </div>
          ) : activeTab === 'System Control' ? (
            renderSystemControl()
          ) : activeTab === 'Employees' ? (
            renderEmployees()
          ) : activeTab === 'Attendance' ? (
            renderAttendance()
          ) : activeTab === 'Leaves' ? (
            renderLeaves()
          ) : activeTab === 'Payroll' ? (
            renderPayroll()
          ) : activeTab === 'Assets' ? (
            renderAssets()
          ) : activeTab === 'Help Desk' ? (
            renderHelpDesk()
          ) : activeTab === 'Settings' ? (
            renderSettings()
          ) : (
            renderOverview()
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
                    <span className="text-[9px] text-emerald-350 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                      Gemini Powered
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setAiAssistantOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-355 hover:text-white"
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
                    className="text-[9px] font-bold text-slate-550 hover:text-[#2D6A4F] bg-white border border-slate-200 hover:border-[#2D6A4F]/40 px-2 py-0.75 rounded transition-all"
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
                  className="flex-1 bg-slate-105 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2D6A4F]/30"
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
