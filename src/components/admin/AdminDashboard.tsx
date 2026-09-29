import React, { useState } from 'react';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  Bell,
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  Pin,
  Sparkles,
  Layers,
  ChevronDown,
  LayoutDashboard,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Compass,
  FileCheck,
  Calendar,
  Clock,
  Star,
  Eye,
  UserPlus,
  Check,
  ChevronRight,
  FileText,
  Video,
  Presentation,
  Download,
  Printer,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, UserStatus, Course, Assessment, Certificate } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    traineeProfiles,
    trainerProfiles,
    courses,
    enrollments,
    certificates,
    assessments,
    assessmentResults,
    resources,
    announcements,
    approveUser,
    rejectUser,
    changeUserRole,
    addUser,
    createCourse,
    deleteCourse,
    publishAnnouncement,
    deleteAnnouncement,
    setActiveCertificate,
    setActiveTab,
    setSelectedCourseId,
  } = useApp();

  // Sidebar navigation state matching Step 4:
  // Dashboard, Users, Courses, Assessments, Certifications, Analytics, Announcements
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'users' | 'courses' | 'assessments' | 'certifications' | 'analytics' | 'announcements'
  >('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // User Filter & Management State
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('trainee');
  const [newUserOrg, setNewUserOrg] = useState('Ministry of Electronics & IT');
  const [newUserDesignation, setNewUserDesignation] = useState('Assistant Director');
  const [newUserStatus, setNewUserStatus] = useState<UserStatus>('approved');

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Data Science');
  const [courseTrainerName, setCourseTrainerName] = useState('Dr. Rajesh Verma');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseWeeks, setCourseWeeks] = useState(8);
  const [courseHours, setCourseHours] = useState(40);
  const [courseDesc, setCourseDesc] = useState('');

  // Announcement Modal & Filter State
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'learning_path' | 'achievement' | 'assessment_update' | 'homepage'>('learning_path');
  const [annPinned, setAnnPinned] = useState(false);
  const [announcementFilter, setAnnouncementFilter] = useState<string>('all');

  // Certificate Verification Lookup Tool State
  const [certLookupCode, setCertLookupCode] = useState('');
  const [verifiedCert, setVerifiedCert] = useState<Certificate | null>(null);
  const [lookupError, setLookupError] = useState(false);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchUserQuery.trim()) {
      const q = searchUserQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;
  const approvedUsersCount = users.filter((u) => u.status === 'approved').length;

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: newUserStatus,
      organization: newUserOrg.trim(),
      designation: newUserDesignation.trim(),
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  // Handle Add Course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    createCourse({
      title: courseTitle.trim(),
      category: courseCategory,
      trainerName: courseTrainerName,
      level: courseLevel,
      durationWeeks: Number(courseWeeks),
      totalHours: Number(courseHours),
      description: courseDesc || 'Institutional capacity building curriculum accredited under national standards.',
      enrolledCount: 0,
      rating: 5.0,
      modulesCount: 3,
    });

    setShowAddCourseModal(false);
    setCourseTitle('');
    setCourseDesc('');
  };

  // Handle Publish Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;

    publishAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annCategory === 'achievement' ? 'achievement' : annCategory === 'learning_path' ? 'resource' : 'general',
      pinned: annPinned,
    });

    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnContent('');
    setAnnPinned(false);
  };

  // Handle Certificate Lookup
  const handleCertificateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certLookupCode.trim()) return;
    const cleanCode = certLookupCode.trim().toUpperCase();
    const found = certificates.find(
      (c) => c.verificationCode.toUpperCase() === cleanCode || c.certificateNumber.toUpperCase() === cleanCode
    );
    if (found) {
      setVerifiedCert(found);
      setLookupError(false);
    } else {
      setVerifiedCert(null);
      setLookupError(true);
    }
  };

  // Navigation Items according to Step 4 specifications
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: pendingUsersCount > 0 ? pendingUsersCount : undefined },
    { id: 'courses', label: 'Course Management', icon: BookOpen, badge: 38 },
    { id: 'assessments', label: 'Assessment Management', icon: CheckSquare, badge: assessments.length },
    { id: 'certifications', label: 'Certifications', icon: Award, badge: 172 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: announcements.length },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header Toggle */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Admin Workspace</span>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded capitalize">
            {activeNav}
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── LMS ADMIN SIDEBAR ───────────────────────────────── */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 shrink-0 p-4 flex flex-col justify-between z-20 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Persona Badge */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">Dr. Arvind Swaminathan</p>
                <p className="text-[11px] text-slate-600 truncate">Director of Capacity</p>
                <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-bold border-l-3 border-amber-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {'badge' in item && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                        item.id === 'users' && pendingUsersCount > 0
                          ? 'bg-amber-600 text-white'
                          : isActive
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Competency Mapping Shortcut */}
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('competency-matrix')}
              className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-700" />
                <span>Competency Matrix</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-blue-700" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>National Accreditation Board</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Centralized role governance, accredited courses, and cryptographic credential integrity.
          </p>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT ───────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ══════════════════════════════════════════════════════
            VIEW 1: 🛡️ ADMIN DASHBOARD (OVERVIEW)
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                  <Shield className="w-6 h-6 text-amber-600" />
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Directorate overview: approvals, platform participation, learning resources, and upcoming assessments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAnnounceModal(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Announcement</span>
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Dashboard Cards matching Step 4: 486 total users, 76% platform participation, Pending approvals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: 486 Total Users */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Users
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-3">
                  486
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-emerald-700 font-semibold">{approvedUsersCount + 440} Approved</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-semibold">{pendingUsersCount} Pending</span>
                </div>
              </div>

              {/* Card 2: 76% Platform Participation */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Platform Participation
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-3">
                  76%
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">370 active trainees this week</p>
              </div>

              {/* Card 3: Pending Account Approvals */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pending Approvals
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-3">
                  {pendingUsersCount}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-slate-500">Awaiting role approval</p>
                  <button
                    onClick={() => setActiveNav('users')}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    Review →
                  </button>
                </div>
              </div>

              {/* Card 4: Published Courses */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Published Courses
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-blue-700 mt-3">
                  38
                </p>
                <p className="text-[11px] text-slate-500 mt-2">12 core tracks · 26 specialized</p>
              </div>
            </div>

            {/* Pending Account Approvals Section */}
            {pendingUsersCount > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Pending Account Approvals ({pendingUsersCount})
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveNav('users')}
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    Open User Directory →
                  </button>
                </div>

                <div className="divide-y divide-amber-200/60 bg-white rounded-lg border border-amber-200 overflow-hidden shadow-xs">
                  {users
                    .filter((u) => u.status === 'pending')
                    .map((user) => (
                      <div key={user.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {user.email} · {user.organization || 'Public Sector Department'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Profile</span>
                          </button>
                          <button
                            onClick={() => approveUser(user.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectUser(user.id)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-[11px] flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Split Row: New Learning Resources & Upcoming Assessments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Learning Resources */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      New Learning Resources
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{resources.length} Available</span>
                </div>

                <div className="space-y-3">
                  {resources.slice(0, 4).map((res) => {
                    const isPdf = res.type === 'pdf';
                    const isPpt = res.type === 'ppt';
                    const isVid = res.type === 'video';

                    return (
                      <div
                        key={res.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-white text-xs ${
                              isPdf
                                ? 'bg-red-600'
                                : isPpt
                                ? 'bg-amber-600'
                                : isVid
                                ? 'bg-blue-600'
                                : 'bg-emerald-600'
                            }`}
                          >
                            {isPdf && <FileText className="w-3.5 h-3.5" />}
                            {isPpt && <Presentation className="w-3.5 h-3.5" />}
                            {isVid && <Video className="w-3.5 h-3.5" />}
                            {!isPdf && !isPpt && !isVid && <BookOpen className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Faculty: {res.trainerName} · {res.fileSize}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase shrink-0">
                          {res.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Assessments */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Upcoming Assessments
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveNav('assessments')}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {assessments.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{a.title}</p>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                            {a.questions.length} MCQs
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {a.subject} · Created by {a.createdByName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{a.deadline}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {a.totalAttempts || 184} attempts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 2: 👥 USERS & ROLES
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'users' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Users & Roles Management
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  View registered users, approve pending accounts, manage roles, inspect trainee profiles, and add users.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search user name, email, department..."
                  className="w-full bg-white p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="all">All Roles (486)</option>
                  <option value="trainee">Trainees</option>
                  <option value="trainer">Trainers</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4">User Name & Contact</th>
                    <th className="py-3 px-3">Assigned Role</th>
                    <th className="py-3 px-3">Organization / Dept</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 font-mono">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                          className="text-[11px] font-semibold bg-slate-100 text-slate-800 rounded p-1 border border-slate-200 cursor-pointer"
                        >
                          <option value="trainee">👨‍🎓 Trainee</option>
                          <option value="trainer">👨‍🏫 Trainer</option>
                          <option value="admin">🛡️ Admin</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate">
                        <p className="truncate font-medium">{user.organization || 'General Public Sector'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.designation || 'Specialist'}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {user.joinedAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                            title="View Full Profile"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Profile</span>
                          </button>

                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveUser(user.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => rejectUser(user.id)}
                                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 3: 📚 COURSE MANAGEMENT
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'courses' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  Course Management ({38} Published Courses)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit curriculum standards, add courses, manage courses, and view trainers and enrollments.
                </p>
              </div>

              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4">Course Title & Category</th>
                    <th className="py-3 px-3">Lead Faculty Trainer</th>
                    <th className="py-3 px-3">Level</th>
                    <th className="py-3 px-3 text-center">Duration</th>
                    <th className="py-3 px-3 text-center">Enrollments</th>
                    <th className="py-3 px-3 text-center">Rating</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-500">{c.category}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-900">{c.trainerName}</p>
                        <p className="text-[10px] text-slate-400">{c.trainerRole || 'Faculty'}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {c.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                        {c.durationWeeks} wks ({c.totalHours}h)
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-700 tabular-nums">
                        {c.enrolledCount}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-amber-600 font-bold">
                        ★ {c.rating}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          PUBLISHED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCourseId(c.id);
                              setActiveTab('courses');
                            }}
                            className="text-xs text-blue-700 hover:underline font-semibold"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => deleteCourse(c.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 4: 📝 ASSESSMENT MANAGEMENT
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'assessments' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                    Assessment Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitor active assessments, completion rates, upcoming deadlines, and trainee performance.
                  </p>
                </div>
              </div>

              {/* Assessment Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Active Assessments</p>
                  <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{assessments.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Multi-choice standardized</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Average Completion Rate</p>
                  <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">86.4%</p>
                  <p className="text-[11px] text-slate-500 mt-1">Target ≥80%</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Upcoming Deadlines</p>
                  <p className="text-2xl font-extrabold font-mono text-amber-600 mt-1">3 Active</p>
                  <p className="text-[11px] text-slate-500 mt-1">Next: Oct 31, 2026</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Total Attempts</p>
                  <p className="text-2xl font-extrabold font-mono text-blue-700 mt-1">
                    {assessmentResults.length > 0
                      ? assessmentResults.length
                      : assessments.reduce((sum, a) => sum + (a.totalAttempts || 0), 0)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Scored automatically</p>
                </div>
              </div>

              {/* Active Assessments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-3 px-4">Assessment Title</th>
                      <th className="py-3 px-3">Subject / Course</th>
                      <th className="py-3 px-3">Author Faculty</th>
                      <th className="py-3 px-3 text-center">Questions</th>
                      <th className="py-3 px-3 text-center">Avg Score</th>
                      <th className="py-3 px-3 text-center">Passing Mark</th>
                      <th className="py-3 px-3">Upcoming Deadline</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {a.title}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <p className="font-semibold text-slate-800">{a.subject}</p>
                          <p className="text-[10px] text-slate-400 truncate">{a.courseTitle}</p>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {a.createdByName}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                          {a.questions.length} MCQs
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700 tabular-nums">
                          {a.averageScore || 81.2}%
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                          {a.passingScorePercent}%
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-amber-700 font-semibold">{a.deadline}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 5: 🏆 CERTIFICATIONS
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'certifications' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Certifications & Verification Registry
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    172 certificates issued, monthly certificate statistics, and verification information.
                  </p>
                </div>
              </div>

              {/* Monthly Certificate Statistics & Totals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Counter Card */}
                <div className="p-6 bg-linear-to-br from-emerald-500 to-teal-700 text-white rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                      Certificates Issued
                    </span>
                    <Award className="w-6 h-6 text-emerald-200" />
                  </div>
                  <p className="text-4xl font-extrabold font-mono tabular-nums">172</p>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Cryptographically verifiable credentials issued to civil and corporate leaders across public administration.
                  </p>
                </div>

                {/* Monthly Certificate Statistics Visual Bars */}
                <div className="lg:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Monthly Certificate Statistics (Past 6 Months)
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">172 Total Issued</span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 items-end pt-4 h-28">
                    {[
                      { month: 'Nov', count: 18, pct: 42 },
                      { month: 'Dec', count: 24, pct: 57 },
                      { month: 'Jan', count: 32, pct: 76 },
                      { month: 'Feb', count: 38, pct: 90 },
                      { month: 'Mar', count: 42, pct: 100 },
                      { month: 'Apr', count: 18, pct: 42 },
                    ].map((item) => (
                      <div key={item.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono font-bold text-slate-700">{item.count}</span>
                        <div
                          className="w-full bg-emerald-600 rounded-t transition-all hover:bg-emerald-700"
                          style={{ height: `${item.pct}%` }}
                        ></div>
                        <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification Information & Interactive Tool */}
              <div className="p-5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Verification Information & Cryptographic Validator
                  </h3>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Every certificate issued by Capacity Connect includes an immutable SHA-256 digital stamp and unique
                  verification code (e.g. <code className="bg-white px-1.5 py-0.5 rounded text-blue-800 font-mono">VERIFY-CC-DA-99A102</code>). Enter any code below to inspect credential authenticity.
                </p>

                <form onSubmit={handleCertificateSearch} className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={certLookupCode}
                    onChange={(e) => setCertLookupCode(e.target.value)}
                    placeholder="Enter Verification Code..."
                    className="p-2 border border-blue-300 rounded bg-white text-xs flex-1 font-mono uppercase focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition-colors"
                  >
                    Verify
                  </button>
                </form>

                {lookupError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>No credential found matching this verification code. Please check the ID.</span>
                  </div>
                )}

                {verifiedCert && (
                  <div className="p-4 bg-white border border-emerald-300 rounded-lg shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Valid Accredited Credential Verified</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-600">{verifiedCert.verificationCode}</span>
                    </div>
                    <div className="text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Candidate</span>
                        <strong className="text-slate-900">{verifiedCert.traineeName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Course</span>
                        <strong className="text-slate-900">{verifiedCert.courseTitle}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Score & Grade</span>
                        <strong className="text-emerald-700">{verifiedCert.scorePercent}% ({verifiedCert.grade})</strong>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setActiveCertificate(verifiedCert)}
                        className="text-xs text-blue-700 font-bold hover:underline"
                      >
                        Inspect Official Certificate Document →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Certifications Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Certifications
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                        <th className="py-3 px-4">Certificate ID</th>
                        <th className="py-3 px-3">Trainee Candidate</th>
                        <th className="py-3 px-3">Accredited Course</th>
                        <th className="py-3 px-3">Faculty Signatory</th>
                        <th className="py-3 px-3 text-center">Score %</th>
                        <th className="py-3 px-3">Issue Date</th>
                        <th className="py-3 px-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 text-slate-900 font-bold">{cert.certificateNumber}</td>
                          <td className="py-3.5 px-3 font-sans font-semibold text-slate-900">{cert.traineeName}</td>
                          <td className="py-3.5 px-3 font-sans text-slate-600 max-w-xs truncate">{cert.courseTitle}</td>
                          <td className="py-3.5 px-3 font-sans text-slate-600">{cert.trainerName}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-emerald-700 tabular-nums">
                            {cert.scorePercent}% ({cert.grade})
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{cert.issueDate}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveCertificate(cert)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-sans font-semibold inline-flex items-center gap-1 shadow-xs"
                            >
                              <Printer className="w-3 h-3" />
                              <span>View / Print</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 6: 📊 ANALYTICS
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'analytics' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-700" />
                Capacity Analytics & Performance Metrics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Course completion, monthly participation, feedback scores, and assessment satisfaction.
              </p>
            </div>

            {/* Top 4 Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course Completion Rate
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-2">
                  84.6%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Across 38 published courses</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Participation
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-blue-700 mt-2">
                  76%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">370 weekly active officers</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Feedback Score
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-2">
                  4.85 / 5
                </p>
                <p className="text-[11px] text-slate-400 mt-1">98.2% positive reviews</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assessment Satisfaction
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-blue-700 mt-2">
                  92.4%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Subject matter relevance</p>
              </div>
            </div>

            {/* Deep Dive Row: Course Completion & Feedback Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Completion Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Course Completion by Discipline
                </h3>
                <div className="space-y-3 pt-1">
                  {[
                    { name: 'Data Analytics & Statistics', rate: 84, count: '1,420 Enrolled' },
                    { name: 'Cloud Infrastructure & DevOps', rate: 72, count: '980 Enrolled' },
                    { name: 'Enterprise Databases & SQL', rate: 88, count: '890 Enrolled' },
                    { name: 'Public Governance & Risk', rate: 79, count: '550 Enrolled' },
                  ].map((track) => (
                    <div key={track.name} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900">{track.name}</span>
                        <span className="font-mono text-slate-700">{track.rate}% ({track.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${track.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Scores Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trainee Feedback & Satisfaction Scores
                </h3>
                <div className="space-y-3 pt-1">
                  {[
                    { label: 'Trainer Pedagogy & Mentorship', score: '4.9 / 5', stars: 5 },
                    { label: 'Curriculum Depth & Practical Labs', score: '4.8 / 5', stars: 5 },
                    { label: 'Platform LMS Usability & Video Stream', score: '4.7 / 5', stars: 4 },
                    { label: 'Assessment Relevance to Job Functions', score: '4.9 / 5', stars: 5 },
                  ].map((fb) => (
                    <div key={fb.label} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{fb.label}</p>
                        <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < fb.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{fb.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 7: 📢 ANNOUNCEMENTS
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'announcements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  Announcements & Broadcast Directives
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin can manage: New learning paths, Achievements, Assessment updates, and Homepage announcements.
                </p>
              </div>

              <button
                onClick={() => setShowAnnounceModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'all', label: 'All Announcements' },
                { id: 'learning_path', label: '🎓 New Learning Paths' },
                { id: 'achievement', label: '🏆 Achievements' },
                { id: 'assessment_update', label: '📝 Assessment Updates' },
                { id: 'homepage', label: '🌐 Homepage Announcements' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setAnnouncementFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    announcementFilter === pill.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {ann.pinned && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Pin className="w-3 h-3 text-amber-700" /> PINNED DIRECTIVE
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {ann.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl pt-1">
                      {ann.content}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono pt-1">
                      Author: {ann.author} · Published: {ann.publishedAt}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL: ADD USER ─────────────────────────────────── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Add New User to Capacity Connect
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. ramesh.c@gov.in"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="trainee">👨‍🎓 Trainee</option>
                    <option value="trainer">👨‍🏫 Trainer</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Account Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as UserStatus)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="approved">Approved (Active)</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Organization / Department</label>
                <input
                  type="text"
                  value={newUserOrg}
                  onChange={(e) => setNewUserOrg(e.target.value)}
                  placeholder="e.g. Ministry of Electronics & IT"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={newUserDesignation}
                  onChange={(e) => setNewUserDesignation(e.target.value)}
                  placeholder="e.g. Senior Data Analyst"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW USER PROFILE ────────────────────────── */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">User Profile Inspection</h3>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
                  {viewingUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{viewingUser.name}</h4>
                  <p className="text-slate-500">{viewingUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-[10px] uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {viewingUser.role}
                    </span>
                    <span className="font-bold text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Status: {viewingUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Organization</span>
                  <span className="font-bold text-slate-800">{viewingUser.organization || 'Public Sector Body'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Designation</span>
                  <span className="font-bold text-slate-800">{viewingUser.designation || 'Officer'}</span>
                </div>
              </div>

              {/* Trainee Details if Trainee */}
              {viewingUser.role === 'trainee' && (
                <div className="space-y-3 pt-2">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Trainee Qualifications & Skills
                  </h5>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <p className="text-slate-700">
                      <strong>Qualification:</strong> {traineeProfiles[viewingUser.id]?.qualification || 'B.Tech / Public Systems'}
                    </p>
                    <p className="text-slate-700">
                      <strong>Experience:</strong> {traineeProfiles[viewingUser.id]?.experienceYears || 3} Years
                    </p>
                    <div>
                      <strong className="text-slate-700">Technical Skills:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(traineeProfiles[viewingUser.id]?.skills || [
                          { name: 'Python', level: 'Intermediate' },
                          { name: 'SQL', level: 'Intermediate' },
                          { name: 'Data Analytics', level: 'Beginner' },
                        ]).map((s, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700">
                            {s.name} ({s.level})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trainer Details if Trainer */}
              {viewingUser.role === 'trainer' && (
                <div className="space-y-3 pt-2">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Trainer Competency Matrix Ratings
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(trainerProfiles[viewingUser.id]?.competencies || {
                      Python: 5,
                      ML: 4,
                      Statistics: 4,
                      SQL: 5,
                      AI: 4,
                    }).map(([comp, val]) => (
                      <div key={comp} className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 font-semibold block">{comp}</span>
                        <strong className="font-mono text-emerald-700 font-bold">{val} / 5</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                {viewingUser.status === 'pending' && (
                  <button
                    onClick={() => {
                      approveUser(viewingUser.id);
                      setViewingUser(null);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs"
                  >
                    Approve Account
                  </button>
                )}
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD COURSE ───────────────────────────────── */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Add Accredited Course
              </h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced Machine Learning for Public Governance"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Discipline Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Databases & SQL">Databases & SQL</option>
                    <option value="GovTech & Systems">GovTech & Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assigned Faculty Trainer</label>
                  <select
                    value={courseTrainerName}
                    onChange={(e) => setCourseTrainerName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Dr. Rajesh Verma">Dr. Rajesh Verma (Data Science)</option>
                    <option value="Priya Sharma">Priya Sharma (Databases & SQL)</option>
                    <option value="Ananya Sengupta">Ananya Sengupta (Cloud & DevOps)</option>
                    <option value="Vikram Malhotra">Vikram Malhotra (Cybersecurity)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Level</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration (Wks)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={courseWeeks}
                    onChange={(e) => setCourseWeeks(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Hours</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={courseHours}
                    onChange={(e) => setCourseHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Curriculum Description</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Outline syllabus, prerequisite skills, and evaluation criteria..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs transition-colors"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE ANNOUNCEMENT ──────────────────────── */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Publish Announcement
              </h3>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePublishAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. New Learning Path: Advanced AI & GovTech Standards"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category (Admin Management)</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="learning_path">🎓 New Learning Paths</option>
                  <option value="achievement">🏆 Achievements</option>
                  <option value="assessment_update">📝 Assessment Updates</option>
                  <option value="homepage">🌐 Homepage Announcements</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter notice details, directives, and target audience..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="pinNotice" className="text-slate-700 font-medium">
                  Pin to top of Homepage Announcements
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
