import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  BookOpen,
  UserCheck,
  FileText,
  X,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Compass,
  Video,
  Presentation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course, ResourceItem, User } from '../../types';

interface SearchResultItem {
  id: string;
  type: 'course' | 'trainer' | 'resource';
  title: string;
  subtitle: string;
  extra?: string;
  badge?: string;
  raw: Course | User | ResourceItem;
}

export const GlobalSearchBar: React.FC<{ isMobileDrawer?: boolean; onCloseMobile?: () => void }> = ({
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const {
    courses,
    users,
    trainerProfiles,
    resources,
    setActiveTab,
    setSelectedCourseId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input, textarea or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter trainers
  const approvedTrainers = useMemo(() => {
    return users.filter((u) => u.role === 'trainer' && u.status === 'approved');
  }, [users]);

  // Aggregate and filter search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { courses: [], trainers: [], resources: [], all: [] };

    // 1. Match Courses
    const matchedCourses: SearchResultItem[] = courses
      .filter((c) => {
        return (
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.trainerName.toLowerCase().includes(q) ||
          c.competenciesTargeted.some((comp) => comp.toLowerCase().includes(q)) ||
          c.level.toLowerCase().includes(q)
        );
      })
      .map((c) => ({
        id: `course-${c.id}`,
        type: 'course',
        title: c.title,
        subtitle: `${c.category} · ${c.durationWeeks} Weeks · ${c.level}`,
        extra: `Faculty: ${c.trainerName}`,
        badge: c.category,
        raw: c,
      }));

    // 2. Match Trainers
    const matchedTrainers: SearchResultItem[] = approvedTrainers
      .filter((t) => {
        const profile = trainerProfiles[t.id];
        const competencies = profile ? Object.keys(profile.competencies) : [];
        return (
          t.name.toLowerCase().includes(q) ||
          (t.designation && t.designation.toLowerCase().includes(q)) ||
          (t.organization && t.organization.toLowerCase().includes(q)) ||
          (profile?.bio && profile.bio.toLowerCase().includes(q)) ||
          competencies.some((c) => c.toLowerCase().includes(q))
        );
      })
      .map((t) => {
        const profile = trainerProfiles[t.id];
        const topSkills = profile
          ? Object.entries(profile.competencies)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([skill]) => skill)
              .join(' · ')
          : 'Accredited Faculty';

        return {
          id: `trainer-${t.id}`,
          type: 'trainer',
          title: t.name,
          subtitle: `${t.designation || 'Lead Faculty'} · ${t.organization || 'Institutional Capacity Cadre'}`,
          extra: topSkills ? `Proficiency: ${topSkills}` : undefined,
          badge: 'Faculty',
          raw: t,
        };
      });

    // 3. Match Resources
    const matchedResources: SearchResultItem[] = resources
      .filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.courseTitle && r.courseTitle.toLowerCase().includes(q)) ||
          r.trainerName.toLowerCase().includes(q)
        );
      })
      .map((r) => ({
        id: `resource-${r.id}`,
        type: 'resource',
        title: r.title,
        subtitle: `${r.type.toUpperCase()} · ${r.fileSize} · Uploaded by ${r.trainerName}`,
        extra: r.courseTitle ? `Course: ${r.courseTitle}` : undefined,
        badge: r.type.toUpperCase(),
        raw: r,
      }));

    const all = [...matchedCourses, ...matchedTrainers, ...matchedResources];
    return {
      courses: matchedCourses,
      trainers: matchedTrainers,
      resources: matchedResources,
      all,
    };
  }, [query, courses, approvedTrainers, trainerProfiles, resources]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Navigate to selected result
  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();

    if (item.type === 'course') {
      const course = item.raw as Course;
      setSelectedCourseId(course.id);
      setActiveTab('courses');
    } else if (item.type === 'trainer') {
      setActiveTab('competency-matrix');
    } else if (item.type === 'resource') {
      setActiveTab('resources');
    }
  };

  // Keyboard navigation within list
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.all.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.all.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.all.length) % searchResults.all.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults.all[selectedIndex];
      if (selected) {
        handleSelectResult(selected);
      }
    }
  };

  // Popular search tags for quick discovery
  const popularKeywords = ['Data Science', 'Python', 'Machine Learning', 'Databases', 'Governance', 'Rajesh Verma'];

  const totalResultsCount = searchResults.all.length;

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobileDrawer ? 'w-full' : 'w-64 lg:w-80'}`}
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInInput}
          placeholder={isMobileDrawer ? 'Search courses, trainers, resources...' : 'Search LMS...'}
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          !isMobileDrawer && (
            <div className="absolute right-2 hidden sm:flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          )
        )}
      </div>

      {/* Floating Results Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 ${
            isMobileDrawer
              ? 'w-full static mt-2 shadow-none'
              : 'w-80 sm:w-96 lg:w-[480px] -left-12 sm:left-0'
          } max-h-[460px] flex flex-col`}
        >
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {query.trim()
                ? `Results for "${query}" (${totalResultsCount})`
                : 'Quick Navigation & Discovery'}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Use ↑↓ to navigate</span>
              <span>·</span>
              <span>↵ to open</span>
            </div>
          </div>

          {/* Results List or Empty State */}
          <div className="overflow-y-auto p-2 space-y-3 flex-1">
            {query.trim() ? (
              totalResultsCount === 0 ? (
                <div className="p-8 text-center text-xs space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-800">No matching results found</p>
                  <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                    Try searching for subject keywords (e.g., "Python", "Data Science"), faculty names, or format like "PDF".
                  </p>
                </div>
              ) : (
                <>
                  {/* Category 1: Courses */}
                  {searchResults.courses.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>Courses & Tracks ({searchResults.courses.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.courses.map((item) => {
                          const itemIndex = searchResults.all.findIndex((i) => i.id === item.id);
                          const isSelected = selectedIndex === itemIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectResult(item)}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-3 ${
                                isSelected ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                                {item.extra && (
                                  <p className="text-[10px] text-blue-700 font-medium">{item.extra}</p>
                                )}
                              </div>
                              <div className="shrink-0 flex items-center gap-1 pt-1 text-slate-400">
                                <span className="text-[10px] text-slate-500 font-medium">Open Track</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Trainers */}
                  {searchResults.trainers.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3" />
                        <span>Faculty & Trainers ({searchResults.trainers.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.trainers.map((item) => {
                          const itemIndex = searchResults.all.findIndex((i) => i.id === item.id);
                          const isSelected = selectedIndex === itemIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectResult(item)}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-3 ${
                                isSelected ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                                {item.extra && (
                                  <p className="text-[10px] text-emerald-700 font-medium">{item.extra}</p>
                                )}
                              </div>
                              <div className="shrink-0 flex items-center gap-1 pt-1 text-slate-400">
                                <span className="text-[10px] text-slate-500 font-medium">View Matrix</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Resources */}
                  {searchResults.resources.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>Learning Resources ({searchResults.resources.length})</span>
                      </div>
                      <div className="space-y-1 mt-1">
                        {searchResults.resources.map((item) => {
                          const itemIndex = searchResults.all.findIndex((i) => i.id === item.id);
                          const isSelected = selectedIndex === itemIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectResult(item)}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-3 ${
                                isSelected ? 'bg-amber-50 text-amber-950' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                                {item.extra && (
                                  <p className="text-[10px] text-amber-700 font-medium">{item.extra}</p>
                                )}
                              </div>
                              <div className="shrink-0 flex items-center gap-1 pt-1 text-slate-400">
                                <span className="text-[10px] text-slate-500 font-medium">Library</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )
            ) : (
              /* Idle / Prompted State */
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Popular Subjects & Faculty
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularKeywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setQuery(kw);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab('courses');
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 text-blue-700 mb-1" />
                    <p className="font-bold text-slate-900 text-xs">Courses</p>
                    <p className="text-[10px] text-slate-500">{courses.length} Tracks</p>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab('competency-matrix');
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                  >
                    <Compass className="w-4 h-4 text-emerald-700 mb-1" />
                    <p className="font-bold text-slate-900 text-xs">Faculty</p>
                    <p className="text-[10px] text-slate-500">{approvedTrainers.length} Trainers</p>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveTab('resources');
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-amber-700 mb-1" />
                    <p className="font-bold text-slate-900 text-xs">Library</p>
                    <p className="text-[10px] text-slate-500">{resources.length} Docs</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Capacity Connect Knowledge Index</span>
            <span className="font-mono text-[10px] text-slate-400">Esc to dismiss</span>
          </div>
        </div>
      )}
    </div>
  );
};
