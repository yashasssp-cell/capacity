import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  User,
  MessageSquare,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Star,
  Check,
  Download,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assessment, Course, Lesson } from '../../types';

export const TraineeDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    modules,
    enrollments,
    assessments,
    assessmentResults,
    certificates,
    traineeProfiles,
    completeLesson,
    submitAssessment,
    submitFeedback,
    updateTraineeProfile,
    setActiveCertificate,
    feedbacks,
    setActiveTab,
    goBack,
    previousTabName,
  } = useApp();

  // Sidebar navigation state (Dashboard, My Courses, Assessments, Certificates, My Profile, Feedback)
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'courses' | 'assessments' | 'certificates' | 'profile' | 'feedback'
  >('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Course Filter state inside My Courses
  const [coursesFilter, setCoursesFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Active Selected Course for Player
  const [playerCourseId, setPlayerCourseId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Quiz Runner Modal State
  const [activeQuizAssessment, setActiveQuizAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, 'a' | 'b' | 'c' | 'd'>>({});
  const [quizTimeLeftSeconds, setQuizTimeLeftSeconds] = useState(600);
  const [quizCompletedResult, setQuizCompletedResult] = useState<any | null>(null);

  // Feedback State
  const [selectedFeedbackCourseId, setSelectedFeedbackCourseId] = useState<string>('course-da');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccessNotice, setFeedbackSuccessNotice] = useState(false);

  // Profile Edit State
  const traineeProfile = currentUser ? traineeProfiles[currentUser.id] : null;
  const [editQualification, setEditQualification] = useState(traineeProfile?.qualification || 'M.Tech in Information Systems');
  const [editExpYears, setEditExpYears] = useState(traineeProfile?.experienceYears || 6);
  const [editExpDetails, setEditExpDetails] = useState(
    traineeProfile?.experienceDetails || 'Led statistical epidemiological surveillance pipelines at NHM for 3 regional districts.'
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Compute Enrolled & Completed Courses for currentUser
  const userEnrollments = currentUser
    ? enrollments.filter((e) => e.traineeId === currentUser.id)
    : enrollments;

  const enrolledCourseIds = userEnrollments.map((e) => e.courseId);
  const userCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  // The 3 highlighted in-progress courses:
  const inProgressCourses = userCourses.filter((c) => {
    const enr = userEnrollments.find((e) => e.courseId === c.id);
    return enr && enr.progressPercent < 100;
  });

  const completedCourses = userCourses.filter((c) => {
    const enr = userEnrollments.find((e) => e.courseId === c.id);
    return enr && enr.progressPercent >= 100;
  });

  // Real live results and assessments for current trainee from results table
  const userResults = currentUser
    ? assessmentResults.filter((r) => r.traineeId === currentUser.id)
    : assessmentResults;

  // Trainees see published assessments for their enrolled courses
  const enrolledCourseIdSet = new Set(userEnrollments.map((e) => e.courseId));
  const publishedEnrolledAssessments = assessments.filter((a) => {
    const isPublished = a.status === 'published' || !a.status;
    const isEnrolled = enrolledCourseIdSet.has(a.courseId);
    return isPublished && isEnrolled;
  });

  const passedAssessmentIds = new Set(userResults.filter((r) => r.passed).map((r) => r.assessmentId));
  const pendingAssessments = publishedEnrolledAssessments.filter((a) => !passedAssessmentIds.has(a.id));
  const pendingAssessmentsCount = pendingAssessments.length;
  const passedAssessmentsCount = publishedEnrolledAssessments.filter((a) => passedAssessmentIds.has(a.id)).length;

  const userCertificates = currentUser
    ? certificates.filter((c) => c.traineeId === currentUser.id)
    : certificates;

  // Target metrics calculated from live enrollments, results, and certificates
  const totalEnrolledCount = userCourses.length || 8;
  const totalCompletedCount = completedCourses.length || 5;
  const totalCertificatesCount = userCertificates.length || 6;

  // The fixed overall progress benchmark specified: 78%
  const overallProgressPercent = 78;

  // Course Player current course
  const playerCourse = courses.find((c) => c.id === playerCourseId) || courses.find((c) => c.id === 'course-da') || courses[0];
  const playerModules = modules.filter((m) => m.courseId === playerCourse?.id);
  const currentEnrollment = userEnrollments.find((e) => e.courseId === playerCourse?.id);
  const completedLessonIds = currentEnrollment?.completedLessonIds || [];

  // Quiz timer effect
  useEffect(() => {
    if (!activeQuizAssessment || quizCompletedResult) return;
    const interval = setInterval(() => {
      setQuizTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuizAssessment, quizCompletedResult]);

  const handleStartQuiz = (assessment: Assessment) => {
    setActiveQuizAssessment(assessment);
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setQuizTimeLeftSeconds(assessment.timeLimitMinutes * 60);
    setQuizCompletedResult(null);
  };

  const handleQuizAnswerSelect = (questionId: string, option: 'a' | 'b' | 'c' | 'd') => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleQuizSubmit = () => {
    if (!activeQuizAssessment) return;
    const timeTaken = Math.max(
      1,
      Math.round((activeQuizAssessment.timeLimitMinutes * 60 - quizTimeLeftSeconds) / 60)
    );
    const result = submitAssessment(activeQuizAssessment.id, quizAnswers, timeTaken);
    setQuizCompletedResult(result);
  };

  const handleOpenCoursePlayer = (courseId: string) => {
    setPlayerCourseId(courseId);
    setActiveNav('courses');
    setActiveLesson(null);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedbackCourseId) return;
    submitFeedback(selectedFeedbackCourseId, feedbackRating, feedbackComment);
    setFeedbackSuccessNotice(true);
    setFeedbackComment('');
    setTimeout(() => setFeedbackSuccessNotice(false), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTraineeProfile({
      qualification: editQualification,
      experienceYears: Number(editExpYears),
      experienceDetails: editExpDetails,
    });
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const currentSkills = traineeProfile?.skills || [];
    updateTraineeProfile({
      skills: [...currentSkills, { name: newSkillName.trim(), level: 'Intermediate' }],
    });
    setNewSkillName('');
  };

  const myCertificates = certificates.filter((c) => c.traineeId === currentUser?.id);
  const myFeedbacks = feedbacks.filter((f) => f.traineeId === currentUser?.id);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen, badge: totalEnrolledCount },
    { id: 'assessments', label: 'Assessments', icon: HelpCircle, badge: pendingAssessmentsCount },
    { id: 'certificates', label: 'Certificates', icon: Award, badge: totalCertificatesCount },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trainee Workspace</span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded capitalize">
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

      {/* ─── LMS SIDEBAR ─────────────────────────────────────── */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 shrink-0 p-4 flex flex-col justify-between z-20 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Workspace Title & Persona Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser?.name.charAt(0) || 'R'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Rahul Anand'}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.designation || 'Senior Data Analyst'}</p>
                <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded uppercase">
                  Accredited Trainee
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
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {'badge' in item && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Support Card */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Capacity Connect LMS</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            National Competency Registry verified. All completions are cryptographically recorded.
          </p>
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT ───────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ══════════════════════════════════════════════════════
            VIEW 1: DASHBOARD
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'dashboard' && (
          <div className="space-y-8">
            {/* Header Greeting */}
            <div>
              <button
                onClick={() => goBack()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-2.5 group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back {previousTabName ? `to ${previousTabName}` : 'to previous'}</span>
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Rahul'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track your active learning courses, pending assessments, and verified competency certificates.
              </p>
            </div>

            {/* 1. DASHBOARD CARDS (Top row: 8 Enrolled Courses, 5 Completed, 3 Assessments, 6 Certificates) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: 8 Enrolled Courses */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Enrolled Courses
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-3">
                  {totalEnrolledCount}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-blue-700 font-semibold">3 In Progress</span>
                  <span aria-hidden="true">·</span>
                  <span>5 Completed</span>
                </div>
              </div>

              {/* Card 2: 5 Completed */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Completed
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-3">
                  {totalCompletedCount}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-emerald-700 font-semibold">100% Curriculum Cleared</span>
                </div>
              </div>

              {/* Card 3: 3 Assessments */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assessments
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-3">
                  {pendingAssessmentsCount}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-amber-700 font-semibold">3 Open for Submission</span>
                </div>
              </div>

              {/* Card 4: 6 Certificates */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Certificates
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-3">
                  {totalCertificatesCount}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                  <span className="text-emerald-700 font-semibold">Accredited & Verified</span>
                </div>
              </div>
            </div>

            {/* 2. LEARNING OVERVIEW (78% overall progress, Learning progress bar, 3 pending assessments, 6 certificates earned) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Learning Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous professional development benchmarks and cohort pacing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-mono">
                    Cohort Q3 Track
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* 78% Progress Gauge & Bar */}
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                        {overallProgressPercent}%
                      </span>
                      <span className="text-xs text-slate-500 ml-2 font-medium">overall progress</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      On Track for Q3 Accreditation
                    </span>
                  </div>

                  {/* High fidelity Learning progress bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${overallProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Course Work: 82%</span>
                    <span>Assessments: 75%</span>
                    <span>Accreditation Target: 80%</span>
                  </div>
                </div>

                {/* Status Badges List */}
                <div className="md:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      Pending Assessments:
                    </span>
                    <strong className="font-mono text-amber-700 tabular-nums">
                      {pendingAssessmentsCount} pending {pendingAssessmentsCount === 1 ? 'assessment' : 'assessments'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Certificates Earned:
                    </span>
                    <strong className="font-mono text-emerald-700 tabular-nums">
                      {userCertificates.length} {userCertificates.length === 1 ? 'certificate' : 'certificates'} earned
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Hours Completed:
                    </span>
                    <strong className="font-mono text-slate-900 tabular-nums">42 hours</strong>
                  </div>
                </div>
              </div>

              {/* Quick Resume Learning Banner */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Up Next in Your Curriculum
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      Data Analytics Fundamentals — Module 3: Advanced Visualizations
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Next lesson: Interactive Lab: Building High-Impact Policy Dashboards (22 min)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCoursePlayer('course-da')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <span>Continue Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. COURSE AREA (Data Analytics Fundamentals → 78%, Effective Communication → 35%, Leadership & Team Building → 62%) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Course Area</h2>
                  <p className="text-xs text-slate-500">
                    Active learning tracks in progress. Click Continue or Start to launch interactive lessons.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('courses')}
                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>View All 8 Courses</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Course 1: Data Analytics Fundamentals → 78% */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-900" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">Data Analytics</span>
                        <span>8 Weeks</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        Data Analytics Fundamentals
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        Exploratory statistics, trend identification, and visual storytelling for institutional reporting.
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500">Course Progress</span>
                          <span className="font-mono font-bold text-blue-700 tabular-nums">78%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '78%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Next: Module 3 (Advanced Visualizations)
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Dr. Rajesh Verma</span>
                      <button
                        onClick={() => handleOpenCoursePlayer('course-da')}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course 2: Effective Communication → 35% */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="h-2 bg-gradient-to-r from-amber-600 to-orange-800" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">Leadership & Soft Skills</span>
                        <span>4 Weeks</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        Effective Communication
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        Executive brief structuring, stakeholder alignment, and conflict negotiation.
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500">Course Progress</span>
                          <span className="font-mono font-bold text-amber-600 tabular-nums">35%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Next: Module 1 (Active Listening Protocols)
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Ananya Sengupta</span>
                      <button
                        onClick={() => handleOpenCoursePlayer('course-ec')}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course 3: Leadership & Team Building → 62% */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-900" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700">Management</span>
                        <span>6 Weeks</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        Leadership & Team Building
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        Team motivation, delegation matrices, and cross-functional management.
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500">Course Progress</span>
                          <span className="font-mono font-bold text-emerald-700 tabular-nums">62%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: '62%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Next: Module 1 (Psychological Safety Protocols)
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Vikram Malhotra</span>
                      <button
                        onClick={() => handleOpenCoursePlayer('course-lt')}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access to Pending Assessments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Pending Subject MCQ Assessments ({pendingAssessmentsCount})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNav('assessments')}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  View All Assessments →
                </button>
              </div>

              {pendingAssessments.length === 0 ? (
                <div className="p-6 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">All Assessments Passed!</p>
                  <p className="text-emerald-700 text-[11px]">
                    You have cleared all enrolled subject assessments with accredited passing marks.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pendingAssessments.slice(0, 3).map((assess) => {
                    const attempts = userResults.filter((r) => r.assessmentId === assess.id);
                    const latestAttempt = attempts[0];
                    return (
                      <div
                        key={assess.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-700 uppercase">{assess.subject}</span>
                            {latestAttempt && (
                              <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                                Prev: {latestAttempt.scorePercent}%
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">{assess.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {assess.questions.length} Questions · {assess.timeLimitMinutes} Mins · Pass: {assess.passingScorePercent}%
                          </p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">Due: {assess.deadline}</span>
                          <button
                            onClick={() => handleStartQuiz(assess)}
                            className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-[11px]"
                          >
                            {latestAttempt ? 'Retake Quiz' : 'Start Quiz'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 2: MY COURSES & INTERACTIVE PLAYER
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Enrolled Courses ({totalEnrolledCount})</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curricula assigned and registered across national capacity tracks
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setCoursesFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    coursesFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({totalEnrolledCount})
                </button>
                <button
                  onClick={() => setCoursesFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    coursesFilter === 'in_progress'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In Progress (3)
                </button>
                <button
                  onClick={() => setCoursesFilter('completed')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    coursesFilter === 'completed'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed (5)
                </button>
              </div>
            </div>

            {/* Interactive Course Player Canvas (if course selected) */}
            {playerCourse && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Interactive Learning Workspace
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">{playerCourse.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Faculty: {playerCourse.trainerName} · {playerCourse.category} Track
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Progress: </span>
                    <strong className="font-mono text-emerald-400 text-sm">
                      {currentEnrollment?.progressPercent || 78}%
                    </strong>
                  </div>
                </div>

                {/* Video / Lecture Screen */}
                <div className="p-6 bg-slate-950 text-white">
                  <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200 mt-4">
                      {activeLesson ? activeLesson.title : 'Module Lecture Recording'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {activeLesson ? activeLesson.description : 'Select any lesson below to begin streaming.'}
                    </p>

                    {activeLesson && (
                      <div className="mt-4">
                        <button
                          onClick={() => completeLesson(playerCourse.id, activeLesson.id)}
                          className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            completedLessonIds.includes(activeLesson.id)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {completedLessonIds.includes(activeLesson.id)
                              ? 'Lesson Completed'
                              : 'Mark Lesson as Completed (+Progress)'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modules & Syllabus */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Syllabus Units & Handouts
                  </h3>
                  <div className="space-y-3">
                    {playerModules.map((mod) => (
                      <div key={mod.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{mod.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{mod.lessons.length} Lessons</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {mod.lessons.map((lesson) => {
                            const isDone = completedLessonIds.includes(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      completeLesson(playerCourse.id, lesson.id);
                                    }}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                      isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                                    }`}
                                  >
                                    {isDone && <Check className="w-3 h-3" />}
                                  </button>
                                  <div>
                                    <p className={`font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                      {lesson.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {lesson.type.toUpperCase()} · {lesson.duration}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-blue-700 font-semibold text-[11px]">Open →</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Courses List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {userCourses
                .filter((c) => {
                  const enr = userEnrollments.find((e) => e.courseId === c.id);
                  const isDone = (enr?.progressPercent || 0) >= 100;
                  if (coursesFilter === 'in_progress') return !isDone;
                  if (coursesFilter === 'completed') return isDone;
                  return true;
                })
                .map((c) => {
                  const enr = userEnrollments.find((e) => e.courseId === c.id);
                  const progress = enr?.progressPercent || 0;
                  const isDone = progress >= 100;
                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-slate-700">{c.category}</span>
                          <span className="font-mono text-blue-700 font-bold">{progress}%</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isDone ? 'bg-emerald-600' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">{c.trainerName}</span>
                        <button
                          onClick={() => handleOpenCoursePlayer(c.id)}
                          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-blue-700 text-white hover:bg-blue-800'
                          }`}
                        >
                          <span>{isDone ? 'Review Track' : progress > 0 ? 'Continue' : 'Start'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 3: ASSESSMENTS (Published for Enrolled Courses)
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'assessments' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl font-bold text-slate-900">
                MCQ Assessments ({publishedEnrolledAssessments.length} Available · {pendingAssessmentsCount} Pending · {passedAssessmentsCount} Passed)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete subject-wise assessments for your enrolled courses with a passing score of ≥70% to confer accredited credentials.
              </p>
            </div>

            {publishedEnrolledAssessments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Published Assessments Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are no published assessments available for your currently enrolled courses. Either the assessments are still in Draft mode by the trainer, or you haven't enrolled in those courses yet.
                </p>
                <button
                  onClick={() => setActiveNav('courses')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
                >
                  Browse Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {publishedEnrolledAssessments.map((assess) => {
                  const attempts = userResults.filter((r) => r.assessmentId === assess.id);
                  const isPassed = attempts.some((r) => r.passed);
                  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((r) => r.scorePercent)) : null;
                  const latestAttempt = attempts[0];

                  return (
                    <div
                      key={assess.id}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-blue-700 uppercase tracking-wider text-[10px]">
                            {assess.subject}
                          </span>
                          {isPassed ? (
                            <span className="text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Submitted · Passed ({bestScore}%)
                            </span>
                          ) : latestAttempt ? (
                            <span className="text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded text-[10px]">
                              Submitted ({latestAttempt.scorePercent}% · Retake)
                            </span>
                          ) : (
                            <span className="text-slate-700 bg-slate-100 font-bold px-2 py-0.5 rounded text-[10px]">
                              Pending Attempt
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{assess.title}</h3>
                        <p className="text-xs text-blue-700 font-semibold mt-0.5">{assess.courseTitle}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{assess.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                          <span>{assess.questions.length} Questions</span>
                          <span aria-hidden="true">·</span>
                          <span>{assess.timeLimitMinutes} Mins</span>
                          <span aria-hidden="true">·</span>
                          <span>Pass: {assess.passingScorePercent}%</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">Due: {assess.deadline}</span>
                        <button
                          onClick={() => handleStartQuiz(assess)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isPassed
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : latestAttempt
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-blue-700 hover:bg-blue-800 text-white'
                          }`}
                        >
                          {isPassed ? 'Review Answers / Retake' : latestAttempt ? 'Retake Assessment' : 'Start Assessment'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 4: CERTIFICATES (6 Certificates Earned)
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'certificates' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Earned Certificates ({myCertificates.length})</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified credentials issued by the National Capacity Directorate with digital seal
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                6 Verified Badges
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{cert.certificateNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Grade {cert.grade}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{cert.courseTitle}</h3>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <p>Signatory: <strong className="text-slate-800">{cert.trainerName}</strong></p>
                      <p>Issue Date: <strong className="text-slate-800">{cert.issueDate}</strong></p>
                      <p>Score: <strong className="text-slate-800 font-mono">{cert.scorePercent}%</strong></p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{cert.verificationCode}</span>
                    <button
                      onClick={() => setActiveCertificate(cert)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 5: MY PROFILE
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'profile' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Trainee Professional Profile</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional credentials, qualifications, and operational skill portfolio
              </p>
            </div>

            {profileSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile successfully updated and saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Academic Qualification</label>
                <input
                  type="text"
                  value={editQualification}
                  onChange={(e) => setEditQualification(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Years of Work Experience</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={editExpYears}
                  onChange={(e) => setEditExpYears(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Experience & Departmental Mandate</label>
                <textarea
                  rows={3}
                  value={editExpDetails}
                  onChange={(e) => setEditExpDetails(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-medium text-slate-700 mb-2">Technical Skills & Competencies</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(traineeProfile?.skills || []).map((sk) => (
                    <span
                      key={sk.name}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium text-[11px]"
                    >
                      {sk.name} ({sk.level})
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Add skill (e.g. Data Visualization, R)"
                    className="flex-1 p-2 border border-slate-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-700"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 6: FEEDBACK
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'feedback' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Course & Training Feedback</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit course ratings and qualitative reviews directly to the faculty evaluation board
              </p>
            </div>

            {feedbackSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your feedback has been recorded in the faculty registry.</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Enrolled Course</label>
                <select
                  value={selectedFeedbackCourseId}
                  onChange={(e) => setSelectedFeedbackCourseId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {userCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.trainerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= feedbackRating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-slate-700 ml-2">
                    {feedbackRating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Comments on Curriculum & Practical Application
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share what parts of the training delivered highest value..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>

            {/* Submitted Feedback History */}
            {myFeedbacks.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Previously Submitted Reviews ({myFeedbacks.length})
                </h3>
                <div className="space-y-3">
                  {myFeedbacks.map((fb) => (
                    <div key={fb.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{fb.courseTitle}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                          ★ {fb.rating}/5
                        </div>
                      </div>
                      <p className="text-slate-600">{fb.comments}</p>
                      <p className="text-[10px] text-slate-400">{fb.submittedAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── INTERACTIVE QUIZ RUNNER MODAL ───────────────────── */}
      {activeQuizAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div>
                <h3 className="text-sm font-bold text-white">{activeQuizAssessment.title}</h3>
                <p className="text-[11px] text-slate-400">
                  Question {currentQuestionIndex + 1} of {activeQuizAssessment.questions.length} · Pass score {activeQuizAssessment.passingScorePercent}%
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(quizTimeLeftSeconds / 60)}:
                  {(quizTimeLeftSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / Math.max(activeQuizAssessment.questions.length, 1)) * 100}%`,
                }}
              />
            </div>

            {/* If Quiz Completed */}
            {quizCompletedResult ? (
              <div className="p-8 text-center space-y-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    quizCompletedResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {quizCompletedResult.passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {quizCompletedResult.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    You scored <strong className="font-mono text-slate-900">{quizCompletedResult.scorePercent}%</strong> (
                    {quizCompletedResult.correctAnswersCount} of {quizCompletedResult.totalQuestions} questions correct)
                  </p>
                </div>

                {quizCompletedResult.passed && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 text-left">
                    <p className="font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Official Certificate of Competency Conferred!</span>
                    </p>
                    <p className="text-[11px] mt-1">
                      Your new certificate has been added to your Certificates repository.
                    </p>
                  </div>
                )}

                {/* Question by Question Review */}
                <div className="text-left space-y-3 pt-4 border-t border-slate-100 max-h-72 overflow-y-auto pr-1">
                  <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Detailed MCQ Performance Breakdown:
                  </h5>
                  {activeQuizAssessment.questions.map((q, idx) => {
                    const chosen = quizCompletedResult.userAnswers?.[q.id];
                    const isCorrect = chosen === q.correctAnswer;
                    const chosenText = chosen
                      ? chosen === 'a'
                        ? q.optionA
                        : chosen === 'b'
                        ? q.optionB
                        : chosen === 'c'
                        ? q.optionC
                        : q.optionD
                      : 'None';
                    const correctText =
                      q.correctAnswer === 'a'
                        ? q.optionA
                        : q.correctAnswer === 'b'
                        ? q.optionB
                        : q.correctAnswer === 'c'
                        ? q.optionC
                        : q.optionD;

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                          isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {idx + 1}. {q.question}
                          </p>
                          <span
                            className={`shrink-0 font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                              isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Your Answer:{' '}
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                            ({chosen ? chosen.toUpperCase() : 'None'}) {chosenText}
                          </strong>
                        </p>
                        {!isCorrect && (
                          <p className="text-slate-700 text-[11px]">
                            Correct Answer:{' '}
                            <strong className="text-emerald-700">
                              ({q.correctAnswer.toUpperCase()}) {correctText}
                            </strong>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-slate-500 text-[10px] italic pt-1 border-t border-slate-200/50">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveQuizAssessment(null);
                      setQuizCompletedResult(null);
                      setActiveNav('certificates');
                    }}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
                  >
                    View My Certificates
                  </button>
                  <button
                    onClick={() => {
                      setActiveQuizAssessment(null);
                      setQuizCompletedResult(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Question Question view */
              <div className="p-6 space-y-6">
                {(() => {
                  const q = activeQuizAssessment.questions[currentQuestionIndex];
                  const selectedOption = quizAnswers[q.id];
                  return (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {currentQuestionIndex + 1}. {q.question}
                      </p>

                      <div className="space-y-2.5">
                        {(['a', 'b', 'c', 'd'] as const).map((optKey) => {
                          const optionText =
                            optKey === 'a'
                              ? q.optionA
                              : optKey === 'b'
                              ? q.optionB
                              : optKey === 'c'
                              ? q.optionC
                              : q.optionD;

                          const isSelected = selectedOption === optKey;

                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => handleQuizAnswerSelect(q.id, optKey)}
                              className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-600'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {optKey}
                              </span>
                              <span className="leading-relaxed">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeQuizAssessment.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleQuizSubmit}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Submit Assessment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
