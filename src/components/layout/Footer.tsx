import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Sparkles,
  BookOpen,
  ExternalLink,
  Bell,
  X,
  CheckCheck,
  Award,
  CheckSquare,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useApp();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'content') return n.type === 'course' || n.title.toLowerCase().includes('content') || n.title.toLowerCase().includes('path');
    if (filterType === 'achievement') return n.title.toLowerCase().includes('achievement') || n.title.toLowerCase().includes('learner');
    if (filterType === 'assessment') return n.type === 'assessment' || n.title.toLowerCase().includes('assessment');
    return true;
  });

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                CC
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Capacity Connect</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Connecting People • Building Competencies • Strengthening Organizations.
              An institutional capacity-building platform mapping organizational skill requirements directly to verified faculty competencies.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span>National Accreditation Standard</span>
              <span aria-hidden="true">·</span>
              <span>ISO 9001:2015 Aligned</span>
              <span aria-hidden="true">·</span>
              <span>Open Competency Framework</span>
            </div>

            {/* Notification Center Trigger Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowNotificationCenter(true)}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-amber-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </div>
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Platform Modules</p>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  Course Catalog & Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('competency-matrix')}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Competency Matching Engine</span>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">Core</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="hover:text-white transition-colors text-left"
                >
                  Trainer Materials Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('trainee-dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Trainee Learning Space
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('trainer-dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Trainer Faculty Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('admin-dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Directorate Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Governance */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Directorate Support</p>
            <div className="text-sm space-y-2 text-slate-400">
              <p>Institutional Capacity Directorate</p>
              <p className="text-xs">Email: <span className="text-slate-300">support@capacityconnect.org</span></p>
              <p className="text-xs">Helpline: <span className="text-slate-300">+91 (11) 2436-0100</span></p>
              <p className="text-xs text-slate-500 pt-2 leading-relaxed">
                New user registrations for Trainer and Admin roles require verification from the governing Directorate committee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Capacity Connect. All rights reserved. Built for institutional workforce excellence.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications ({unreadCount})</span>
            </button>
            <span>Privacy Policy</span>
            <span>Terms of Training</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>

      {/* ─── MODAL: NOTIFICATION CENTER ───────────────────────── */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center">
                  <Bell className="w-4 h-4 font-bold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Notification Center
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Latest learning content, achievements, and assessment updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 font-medium"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Read</span>
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 text-xs shrink-0">
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'content', label: '🆕 New Content' },
                { id: 'achievement', label: '🏆 Achievements' },
                { id: 'assessment', label: '📝 Assessment Updates' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterType === pill.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Notifications Feed */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-600">No notifications in this category</p>
                  <p className="text-[11px] text-slate-400 mt-1">Check back later for new platform updates.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isAchievement = notif.title.toLowerCase().includes('achievement') || notif.title.toLowerCase().includes('top learners');
                  const isContent = notif.type === 'course' || notif.title.toLowerCase().includes('content') || notif.title.toLowerCase().includes('python');
                  const isAssessment = notif.type === 'assessment' || notif.title.toLowerCase().includes('assessment');

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        notif.read
                          ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                          : 'bg-amber-50/40 border-amber-300 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isAchievement
                                ? 'bg-amber-500 text-white'
                                : isContent
                                ? 'bg-blue-600 text-white'
                                : isAssessment
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            {isAchievement && <Award className="w-4 h-4" />}
                            {isContent && <BookOpen className="w-4 h-4" />}
                            {isAssessment && <CheckSquare className="w-4 h-4" />}
                            {!isAchievement && !isContent && !isAssessment && <Bell className="w-4 h-4" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                              )}
                              <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.timestamp).toLocaleDateString()}
                              </span>
                              <span className="uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                                {isAchievement
                                  ? 'Achievement'
                                  : isContent
                                  ? 'New Content'
                                  : isAssessment
                                  ? 'Assessment Update'
                                  : 'System'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct action button */}
                        <div className="shrink-0 self-center">
                          {isContent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNotificationCenter(false);
                                setActiveTab('courses');
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <span>Explore</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {isAssessment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNotificationCenter(false);
                                setActiveTab('trainee-dashboard');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <span>View Test</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {isAchievement && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNotificationCenter(false);
                                setActiveTab('trainee-dashboard');
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>National Directorate Broadcast System</span>
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
