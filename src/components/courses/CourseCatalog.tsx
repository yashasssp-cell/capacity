import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, ArrowLeft, Star, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';

export const CourseCatalog: React.FC = () => {
  const {
    courses,
    enrollments,
    currentUser,
    enrollInCourse,
    setSelectedCourseId,
    setActiveTab,
    setAuthModalOpen,
    setAuthModalMode,
    goBack,
    canGoBack,
    previousTabName,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = ['all', 'Data Science', 'Databases', 'Artificial Intelligence', 'Cybersecurity'];

  const userEnrolledIds = enrollments
    .filter((e) => e.traineeId === currentUser?.id)
    .map((e) => e.courseId);

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedLevel !== 'all' && c.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.trainerName.toLowerCase().includes(q) ||
        c.competenciesTargeted.some((comp) => comp.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleActionClick = (course: Course) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (userEnrolledIds.includes(course.id)) {
      setSelectedCourseId(course.id);
      setActiveTab('trainee-dashboard');
    } else {
      enrollInCourse(course.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => goBack()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-2.5 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back {previousTabName ? `to ${previousTabName}` : 'to previous'}</span>
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Curriculum Registry
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Institutional Courses & Programs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Accredited capacity building tracks with recorded video lectures, technical reading packages, and verified subject assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('competency-matrix')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Launch Competency Matcher →
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, skills, or faculty..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const userEnrollment = enrollments.find(
            (e) => e.traineeId === currentUser?.id && e.courseId === course.id
          );
          const isEnrolled = !!userEnrollment;
          const progressPercent = userEnrollment ? userEnrollment.progressPercent : 0;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className={`h-2 bg-gradient-to-r ${course.coverAccent}`} />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
                    <span className="font-semibold text-slate-700">{course.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.level}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.durationWeeks} Weeks</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Competencies:
                    </p>
                    <p className="text-xs text-slate-600">
                      {course.competenciesTargeted.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  {/* Progress Tracking for Enrolled Students */}
                  {isEnrolled && (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-600">Your Progress</span>
                        <span className="font-mono font-bold text-emerald-700">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{course.trainerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {course.enrolledCount} enrolled · ★ {course.rating}
                      </p>
                    </div>

                    <button
                      onClick={() => handleActionClick(course)}
                      className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isEnrolled
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-700 hover:bg-blue-800 text-white'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Continue ({progressPercent}%)</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
