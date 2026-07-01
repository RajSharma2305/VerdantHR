'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  Users, Clock, CalendarRange, 
  LayoutDashboard, Coins, Laptop, Ticket, 
  Shield, Search, LogOut, ArrowRight,
  Menu, Bell, ChevronLeft, ChevronRight, X,
  User, Settings, Plus, TrendingUp, Filter
} from 'lucide-react';
import { Logo } from '@/components/logo';

// Predefined roles for simulated RBAC testing
const AVAILABLE_ROLES = [
  { id: 'EMPLOYEE', label: 'Employee', desc: 'Self-service portal access' },
  { id: 'HR_MANAGER', label: 'HR Manager', desc: 'Full employee & recruitment access' },
  { id: 'MANAGER', label: 'Department Manager', desc: 'Approve leaves & evaluate tasks' },
  { id: 'FINANCE_EXECUTIVE', label: 'Finance Executive', desc: 'Run payroll & view salaries' },
  { id: 'IT_ADMINISTRATOR', label: 'IT Administrator', desc: 'Manage assets & resolve tickets' },
  { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Complete system control' }
];

export default function Dashboard() {
  const { user, role, signOut } = useAuth();
  
  // Responsive / Interactivity states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Dashboard mock states
  const [selectedRole, setSelectedRole] = useState(role || 'HR_MANAGER');
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications mock data
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New leave request', message: 'Rahul Sharma applied for Casual Leave', time: '5m ago', read: false },
    { id: 2, title: 'Asset Allocated', message: 'MacBook Pro SN: MB-2026-X83 assigned to Priya Singh', time: '1h ago', read: false },
    { id: 3, title: 'Payroll Run Complete', message: 'June payroll generated for review', time: '4h ago', read: true },
    { id: 4, title: 'Security Alert', message: 'Suspicious login detected from IP 192.168.1.105', time: 'Yesterday', read: true }
  ]);

  // Employee list mock data
  const [employees, setEmployees] = useState([
    { id: 'EMP001', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', dept: 'Engineering', role: 'Software Engineer', status: 'Active', joiningDate: '2026-01-15' },
    { id: 'EMP002', name: 'Priya Singh', email: 'priya.singh@company.com', dept: 'Engineering', role: 'Frontend Engineer', status: 'Active', joiningDate: '2026-03-10' },
    { id: 'EMP003', name: 'Amit Verma', email: 'amit.verma@company.com', dept: 'HR Operations', role: 'HR Coordinator', status: 'On Leave', joiningDate: '2025-11-01' },
    { id: 'EMP004', name: 'Neha Gupta', email: 'neha.gupta@company.com', dept: 'Finance', role: 'Payroll Specialist', status: 'Active', joiningDate: '2024-05-15' },
    { id: 'EMP005', name: 'Raj Sharma', email: 'raj.sharma@company.com', dept: 'HR Operations', role: 'HR Manager', status: 'Active', joiningDate: '2023-08-20' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      
      {/* ----------------- SIDEBAR ----------------- */}
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-brand-green border-r border-brand-green-dark transition-all duration-300 text-slate-100 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-brand-green-hover/40 bg-brand-green-dark">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-green-accent">
              <Logo className="w-5 h-5 text-brand-green-pale" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm tracking-wide text-white whitespace-nowrap">
                VerdantHR
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded bg-brand-green-hover/55 text-slate-300 hover:text-white transition-all focus:outline-none"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {[
            { name: 'Overview', icon: LayoutDashboard },
            { name: 'Employees', icon: Users },
            { name: 'Attendance', icon: Clock },
            { name: 'Leaves', icon: CalendarRange },
            { name: 'Payroll', icon: Coins },
            { name: 'Assets', icon: Laptop },
            { name: 'Help Desk', icon: Ticket },
            { name: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive 
                    ? 'bg-white text-brand-green shadow-md shadow-brand-green-dark/30' 
                    : 'text-brand-green-pale/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-green' : 'text-brand-green-pale/80 group-hover:text-white'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-green-hover/40 bg-brand-green-dark/40">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Admin User'}</span>
                <span className="text-[9px] text-brand-green-accent font-semibold uppercase tracking-wider">{selectedRole}</span>
              </div>
            )}
            <button 
              onClick={signOut}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-slate-300 transition-all focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
        >
          <aside 
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full bg-brand-green text-slate-100 flex flex-col shadow-2xl animate-slide-in"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-brand-green-hover/40 bg-brand-green-dark">
              <div className="flex items-center gap-3">
                <Logo className="w-5 h-5 text-white" />
                <span className="font-bold text-sm tracking-wide text-white">VerdantHR</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded bg-brand-green-hover/55 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="flex-1 py-4 space-y-1 px-3">
              {[
                { name: 'Overview', icon: LayoutDashboard },
                { name: 'Employees', icon: Users },
                { name: 'Attendance', icon: Clock },
                { name: 'Leaves', icon: CalendarRange },
                { name: 'Payroll', icon: Coins },
                { name: 'Assets', icon: Laptop },
                { name: 'Help Desk', icon: Ticket },
                { name: 'Settings', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-white text-brand-green shadow-md' 
                        : 'text-brand-green-pale/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-5 border-t border-brand-green-hover/40 bg-brand-green-dark/40">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{user?.email?.split('@')[0] || 'Admin User'}</span>
                  <span className="text-[9px] text-brand-green-accent font-semibold uppercase tracking-wider">{selectedRole}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-350"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ----------------- MAIN VIEW CONTAINER ----------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Page title / Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden md:inline font-medium">Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
              <span className="font-bold text-slate-800 text-sm tracking-tight">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources, directories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 focus:border-brand-green/30 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>

            {/* Simulated Role Selection for Testing */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-green-pale border border-brand-green/10 text-brand-green">
              <Shield className="w-3.5 h-3.5 text-brand-green-light" />
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-[11px] font-bold focus:outline-none cursor-pointer text-brand-green"
              >
                {AVAILABLE_ROLES.map(r => (
                  <option key={r.id} value={r.id} className="bg-white text-slate-700 font-medium">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell with interactive Drawer */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-850 transition-all focus:outline-none"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-green border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-brand-green hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 text-xs relative hover:bg-slate-50 transition-all ${!n.read ? 'bg-brand-green-pale/30' : ''}`}>
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            <button 
                              onClick={() => deleteNotification(n.id)}
                              className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-slate-450 block mt-1">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs shadow shadow-brand-green-dark/20">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-slate-150 bg-slate-50">
                    <span className="block text-xs font-bold text-slate-700 truncate">{user?.email || 'admin@company.com'}</span>
                    <span className="text-[9px] text-brand-green-light font-bold uppercase tracking-wider">{selectedRole}</span>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 transition-all flex items-center gap-2 text-slate-650">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-100 transition-all flex items-center gap-2 text-slate-650">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <div className="h-px bg-slate-150 my-1"></div>
                    <button 
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-red-50 text-red-600 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dashboard Content Workspace */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Top Welcome Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Enterprise Overview</h2>
              <p className="text-xs text-slate-500">Live indicators, system operations, and department summaries.</p>
            </div>
            
            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center gap-1.5 shadow-sm shadow-slate-100">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filters</span>
              </button>
              <button 
                onClick={() => alert('Simulated onboarding workspace initialized')}
                className="px-4.5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow shadow-brand-green-dark/20"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Employee</span>
              </button>
            </div>
          </div>

          {/* 4 Overview Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Workforce Strength', value: '82', footer: '+4 since last month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
              { title: 'On Duty Shift', value: '76', footer: '6 employees on leave', icon: Clock, color: 'text-brand-green-accent', bg: 'bg-emerald-500/10' },
              { title: 'Leaves Pending', value: '3', footer: 'Requires HR approval', icon: CalendarRange, color: 'text-purple-600', bg: 'bg-purple-500/10' },
              { title: 'Open IT Tickets', value: '3', footer: '1 critical item pending', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-500/10' }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-100 flex items-center justify-between hover:border-slate-300 hover:shadow transition-all group">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                    <span className="block text-2xl font-black text-slate-800 tracking-tight">{card.value}</span>
                    <span className="block text-[10px] text-slate-500">{card.footer}</span>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg} ${card.color} border border-slate-100 transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Placeholder Layout (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Attendance SVG Chart */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">Shift Attendance Trends</h3>
                    <p className="text-[10px] text-slate-400">Weekly rate comparison (%)</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-brand-green font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>94.8% Average</span>
                  </div>
                </div>

                {/* SVG Area/Bar Interactive Chart */}
                <div className="h-56 w-full flex items-end justify-between pt-4 px-2">
                  {[
                    { label: 'Mon', rate: 96 },
                    { label: 'Tue', rate: 94 },
                    { label: 'Wed', rate: 97 },
                    { label: 'Thu', rate: 93 },
                    { label: 'Fri', rate: 95 },
                    { label: 'Sat', rate: 88 },
                    { label: 'Sun', rate: 82 }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                      {/* Bar indicator info */}
                      <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded shadow">
                        {bar.rate}%
                      </span>
                      {/* Interactive Height Bar */}
                      <div 
                        className="w-8 sm:w-10 bg-brand-green/10 rounded-t-lg group-hover:bg-brand-green transition-all duration-300 relative"
                        style={{ height: `${bar.rate}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-green-dark/20 to-brand-green-accent/20 rounded-t-lg"></div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Headcount Breakdown */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm shadow-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Department Headcounts</h3>
                <p className="text-[10px] text-slate-400 mb-4">Total breakdown per department</p>

                <div className="space-y-3">
                  {[
                    { name: 'Engineering', count: 48, percentage: 58, color: 'bg-brand-green' },
                    { name: 'HR Operations', count: 12, percentage: 15, color: 'bg-emerald-600' },
                    { name: 'Finance', count: 8, percentage: 10, color: 'bg-indigo-600' },
                    { name: 'Marketing & Sales', count: 14, percentage: 17, color: 'bg-slate-400' }
                  ].map((dept, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">{dept.name}</span>
                        <span className="text-slate-800">{dept.count} ({dept.percentage}%)</span>
                      </div>
                      {/* Custom styled progress bars */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${dept.color}`}
                          style={{ width: `${dept.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between text-xs text-slate-450">
                <span>Updated 5m ago</span>
                <span className="text-brand-green font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

          </div>

          {/* Recent Activity / Employee Status Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm shadow-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Active Employee Register</h3>
                <p className="text-[10px] text-slate-400">Manage statuses, profiles, and reporting managers</p>
              </div>
              <button 
                onClick={() => setEmployees([...employees])}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                Refresh Data
              </button>
            </div>

            {/* Table layout responsive wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Employee ID</th>
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Joining Date</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-650">
                  {employees.filter(emp => 
                    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    emp.dept.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3.5 px-5 font-mono text-slate-500 font-bold">{emp.id}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{emp.name}</span>
                          <span className="text-[10px] text-slate-400">{emp.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">{emp.dept}</td>
                      <td className="py-3.5 px-5">{emp.role}</td>
                      <td className="py-3.5 px-5">{emp.joiningDate}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => alert(`Simulated edit for ${emp.name}`)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-[10px] font-bold text-slate-600 rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Archive ${emp.name}?`)) {
                                setEmployees(prev => prev.filter(e => e.id !== emp.id));
                              }
                            }}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-[10px] font-bold text-red-600 rounded-lg transition-all"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination / Table summary */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 5 of {employees.length} employees</span>
              <div className="flex gap-1.5">
                <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed text-[10px] font-bold">Prev</button>
                <button className="p-1 px-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-[10px] font-bold text-slate-600 transition-all">Next</button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
