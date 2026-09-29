import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  FileText,
  Video,
  Presentation,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Star,
  X,
  Sliders,
  Info,
  Check,
  Megaphone,
  Flame,
  Bell,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';

export const LandingPage: React.FC = () => {
  const {
    courses,
    resources,
    announcements,
    users,
    trainerProfiles,
    setActiveTab,
    setSelectedCourseId,
    enrollInCourse,
    setAuthModalOpen,
    setAuthModalMode,
    currentUser,
  } = useApp();

  const featuredCourses = courses.filter((c) => c.featured).slice(0, 3);
  const trainerUsers = users.filter((u) => u.role === 'trainer' && u.status === 'approved').slice(0, 3);
  const recentResources = resources.slice(0, 4);

  // Step 5: Competency Matching Panel state
  const [showMatchingPanel, setShowMatchingPanel] = useState(false);
  const [downloadedResId, setDownloadedResId] = useState<string | null>(null);

  const handleDownloadResource = (resId: string) => {
    setDownloadedResId(resId);
    setTimeout(() => {
      setDownloadedResId((prev) => (prev === resId ? null : prev));
    }, 2500);
  };

  const handleEnrollClick = (courseId: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    enrollInCourse(courseId);
  };

  const handleCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('courses');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-800">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>National Capacity Building & Competency Standard</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              CAPACITY CONNECT
            </h1>

            <p className="text-lg sm:text-xl font-medium text-blue-200">
              Connecting People • Building Competencies • Strengthening Organizations
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              An institutional learning management system designed to systematically identify skill gaps, map accredited trainer proficiencies, and deliver high-impact courses, MCQ assessments, and verified credentials across public and private sector workforces.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('courses')}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <span>Browse Accredited Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('competency-matrix')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Launch Competency Engine</span>
              </button>

              {!currentUser && (
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Create Trainee / Faculty Account →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Impact Stats Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">3,840+</p>
              <p className="text-xs text-slate-400 mt-1">Officers & Trainees Enrolled</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-400">96.4%</p>
              <p className="text-xs text-slate-400 mt-1">Competency Alignment Rate</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">1,820+</p>
              <p className="text-xs text-slate-400 mt-1">Verified Credentials Conferred</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400">48</p>
              <p className="text-xs text-slate-400 mt-1">Participating Public Departments</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Curated Curriculum
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Featured Capacity Building Tracks
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Structured modules with recorded lectures, presentations, and subject MCQ assessments
            </p>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Top Accent Ribbon */}
              <div className={`h-3 bg-gradient-to-r ${course.coverAccent}`} />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category and Level unboxed text with separator */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-slate-700">{course.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.level}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.durationWeeks} Weeks</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-blue-700 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {/* Competencies targeted */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Competencies Developed:
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {course.competenciesTargeted.join(' · ')}
                    </p>
                  </div>

                  {/* Trainer & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{course.trainerName}</p>
                      <p className="text-[11px] text-slate-500">{course.trainerRole || 'Faculty Lead'}</p>
                    </div>

                    <button
                      onClick={() => handleEnrollClick(course.id)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Competency-driven training */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Compass className="w-4 h-4" />
                <span>Competency-driven training</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                Precision Competency Mapping & Trainer Matching
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rather than guessing instructors, Capacity Connect decomposes institutional subjects into verified multi-attribute competencies (e.g. Python, Statistics, Machine Learning, SQL, AI) and evaluates real trainer proficiency vectors on a standardized 1–5 scale.
              </p>
              
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Subject: <strong>Data Science</strong> → Python + Statistics + ML + Data Visualization</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Weighted fit scoring calculates exact skill alignment for every accredited trainer</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Objective match scores and visual progress bars for immediate cohort assignment</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowMatchingPanel(true)}
                  className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Trainer Matching</span>
                </button>

                <button
                  onClick={() => setActiveTab('competency-matrix')}
                  className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Launch Full Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* In-Page Competency Matching Panel */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Trainer Competency Matching Panel
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live fit analysis based on subject requirements
                  </p>
                </div>
                <button
                  onClick={() => setShowMatchingPanel(true)}
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Expand Panel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Example Required Skills */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    Example Required Skills:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-semibold text-xs shadow-2xs">
                    Python
                  </span>
                  <span className="text-slate-400 font-bold">+</span>
                  <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-semibold text-xs shadow-2xs">
                    Statistics
                  </span>
                  <span className="text-slate-400 font-bold">+</span>
                  <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded font-semibold text-xs shadow-2xs">
                    Machine Learning
                  </span>
                </div>
              </div>

              {/* Trainer Match Table / Cards with Visual Progress Bars */}
              <div className="space-y-4 pt-1">
                {/* Trainer A */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Trainer A</span>
                      <span className="text-[11px] text-slate-500 ml-2">(Dr. Rajesh Verma · Senior Faculty)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-emerald-700">92%</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Competency Match</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-600 font-mono">
                    Python 5/5 · Statistics 4/5 · ML 5/5
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>

                {/* Trainer C */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Trainer C</span>
                      <span className="text-[11px] text-slate-500 ml-2">(Ananya Sengupta · Systems Specialist)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-blue-700">84%</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Competency Match</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-600 font-mono">
                    Python 4/5 · Statistics 4/5 · ML 4/5
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: '84%' }}
                    ></div>
                  </div>
                </div>

                {/* Trainer B */}
                <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Trainer B</span>
                      <span className="text-[11px] text-slate-500 ml-2">(Priya Sharma · Database Architect)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-amber-600">78%</span>
                      <span className="text-[10px] text-slate-400 block font-sans">Competency Match</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-600 font-mono">
                    Python 4/5 · Statistics 3/5 · ML 4/5
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Important Disclaimer from brief */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-[11px] text-amber-900">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Important:</strong> These percentages are currently demo data to demonstrate the UI and matching concept. The real version will calculate them from trainer competency records in the database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODAL: EXPLORE TRAINER MATCHING PANEL ───────────── */}
      {showMatchingPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Trainer Competency Matching Panel</h3>
                  <p className="text-[11px] text-slate-400">Institutional Faculty Recommendation Engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowMatchingPanel(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Required Skills Callout */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  Example Required Skills:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-lg font-bold text-xs shadow-2xs">
                    Python
                  </span>
                  <span className="text-blue-400 font-bold">+</span>
                  <span className="px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-lg font-bold text-xs shadow-2xs">
                    Statistics
                  </span>
                  <span className="text-blue-400 font-bold">+</span>
                  <span className="px-3 py-1.5 bg-white border border-blue-200 text-blue-900 rounded-lg font-bold text-xs shadow-2xs">
                    Machine Learning
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 pt-1">
                  Target subject: <strong>Data Science & Applied Analytics</strong>
                </p>
              </div>

              {/* Table / Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                  <span>Trainer</span>
                  <span>Competency Match</span>
                </div>

                {/* Trainer A */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Trainer A</p>
                      <p className="text-[11px] text-slate-500">Dr. Rajesh Verma · Senior Faculty</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold font-mono text-emerald-700">92%</span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">Best Match</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono font-medium text-slate-700">
                    Python 5/5 · Statistics 4/5 · ML 5/5
                  </p>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-600 h-3 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Trainer C */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Trainer C</p>
                      <p className="text-[11px] text-slate-500">Ananya Sengupta · Systems Specialist</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold font-mono text-blue-700">84%</span>
                      <span className="text-[10px] text-blue-800 font-semibold block">Strong Match</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono font-medium text-slate-700">
                    Python 4/5 · Statistics 4/5 · ML 4/5
                  </p>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>

                {/* Trainer B */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Trainer B</p>
                      <p className="text-[11px] text-slate-500">Priya Sharma · Database Architect</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold font-mono text-amber-600">78%</span>
                      <span className="text-[10px] text-amber-800 font-semibold block">Qualified Match</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono font-medium text-slate-700">
                    Python 4/5 · Statistics 3/5 · ML 4/5
                  </p>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-amber-500 h-3 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>

              {/* Important Disclaimer Note */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-950">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Important:</strong> These percentages are currently demo data to demonstrate the UI and matching concept. The real version will calculate them from trainer competency records in the database.
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMatchingPanel(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMatchingPanel(false);
                    setActiveTab('competency-matrix');
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Launch Full Competency Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Latest Learning Resources & Trainer Library */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Open Knowledge Base
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Latest Learning Materials & Handbooks
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lecture slide decks, case studies, and reference cheat sheets published by faculty
            </p>
          </div>
          <button
            onClick={() => setActiveTab('resources')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentResources.map((res) => (
            <div
              key={res.id}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="uppercase font-mono text-[10px] text-blue-700 font-semibold">
                    {res.type}
                  </span>
                  <span>{res.fileSize}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {res.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{res.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-600 truncate max-w-[130px]">
                  {res.trainerName}
                </span>
                <button
                  onClick={() => handleDownloadResource(res.id)}
                  className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] transition-colors"
                >
                  {downloadedResId === res.id ? 'Saved ✓' : 'Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. What's happening Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Platform Pulse</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              What’s happening
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active directives, learner recognition milestones, and newly published learning paths.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Directorate Feed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 📢 Announcement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                  Announcement
                </span>
                <span className="text-[10px] font-mono text-slate-400">Updated Today</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assessment schedule updated
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Directorate updates regarding national technical evaluations and cycle schedules.
                </p>
              </div>

              {/* Bullet features */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-medium">Upcoming questionnaires</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-medium">New deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-medium">Assessment updates</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('trainee-dashboard')}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Assessment Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: 🏆 Achievement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Achievement
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Monthly Honors
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Top Learners — September
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Celebrating top-performing officers and trainees completing accredited competency badges.
                </p>
              </div>

              {/* Bullet features */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">Learning milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">Monthly achievements</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('trainee-dashboard')}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Milestones & Badges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: 🆕 New Content */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  New Content
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
                  New Release
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Python Learning Path
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive curricular sequence for public systems automation, scripting, and analytics.
                </p>
              </div>

              {/* Bullet features */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium">Beginner-friendly content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-medium">Newly added resources</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('courses')}
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Python Learning Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Announcements & Achievements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Announcements */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Announcements & Notifications
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Directorate Feed</span>
            </div>

            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    {ann.pinned && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                        Pinned
                      </span>
                    )}
                    <h4 className="font-bold text-slate-900">{ann.title}</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{ann.content}</p>
                  <p className="text-[10px] text-slate-400">
                    Published by {ann.author} · {ann.publishedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Distinguished Faculty Highlights */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Distinguished Accredited Trainers
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Audited Faculty</span>
            </div>

            <div className="space-y-4">
              {trainerUsers.map((trainer) => {
                const profile = trainerProfiles[trainer.id];
                return (
                  <div key={trainer.id} className="flex items-start gap-3.5 text-xs">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
                      {trainer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{trainer.name}</p>
                        <div className="flex items-center gap-1 text-amber-500 font-mono text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{profile?.rating || '4.9'}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{profile?.specialization}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {profile?.experienceYears} yrs exp · {profile?.studentsTrained}+ officers trained
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. About Capacity Connect & Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to Upgrade Institutional Workforce Capabilities?
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              Sign up today as a Trainee to enroll in accredited courses and earn verifiable certificates, or register as a Trainer to contribute curriculums and evaluate national talent.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors shadow-md text-center"
            >
              Get Started Now
            </button>
            <button
              onClick={() => setActiveTab('competency-matrix')}
              className="w-full sm:w-auto px-5 py-3 bg-blue-800/80 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg border border-blue-600/50 transition-colors text-center"
            >
              View Competency Matrix
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
