import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserRole,
  UserStatus,
  TraineeProfile,
  TrainerProfile,
  Course,
  CourseModule,
  Enrollment,
  ResourceItem,
  Assessment,
  AssessmentQuestion,
  AssessmentResult,
  Certificate,
  CourseFeedback,
  CompetencyDefinition,
  SubjectRequirement,
  Announcement,
  SystemNotification,
  TrainerMatchResult,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TRAINEE_PROFILES,
  INITIAL_TRAINER_PROFILES,
  INITIAL_COMPETENCIES,
  INITIAL_SUBJECT_REQUIREMENTS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_ENROLLMENTS,
  INITIAL_RESOURCES,
  INITIAL_ASSESSMENTS,
  INITIAL_RESULTS,
  INITIAL_CERTIFICATES,
  INITIAL_FEEDBACKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  traineeProfiles: Record<string, TraineeProfile>;
  trainerProfiles: Record<string, TrainerProfile>;
  courses: Course[];
  modules: CourseModule[];
  enrollments: Enrollment[];
  resources: ResourceItem[];
  assessments: Assessment[];
  assessmentResults: AssessmentResult[];
  certificates: Certificate[];
  feedbacks: CourseFeedback[];
  competencies: CompetencyDefinition[];
  subjectRequirements: SubjectRequirement[];
  announcements: Announcement[];
  notifications: SystemNotification[];

  // Navigation & UI controls
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedAssessmentId: string | null;
  setSelectedAssessmentId: (id: string | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;
  activeCertificate: Certificate | null;
  setActiveCertificate: (cert: Certificate | null) => void;
  canGoBack: boolean;
  previousTabName: string | null;
  goBack: () => boolean;
  navigateTo: (tab: string, courseId?: string | null, assessmentId?: string | null) => void;
  navigationHistory: Array<{ tab: string; courseId: string | null; assessmentId: string | null }>;

  // Actions
  login: (email: string, role?: UserRole) => boolean;
  loginAsDemoUser: (role: UserRole) => void;
  signInWithGoogle: (roleOverride?: UserRole) => Promise<User>;
  signup: (userData: { name: string; email: string; role: UserRole; organization?: string; designation?: string }) => void;
  addUser: (userData: { name: string; email: string; role: UserRole; status: UserStatus; organization?: string; designation?: string }) => void;
  logout: () => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;
  
  enrollInCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  submitAssessment: (
    assessmentId: string,
    answers: Record<string, 'a' | 'b' | 'c' | 'd'>,
    timeTakenMinutes: number
  ) => AssessmentResult;
  submitFeedback: (courseId: string, rating: number, comments: string) => void;
  
  // Trainer & Admin mutations
  createCourse: (newCourse: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  createAssessment: (newAssessment: Partial<Assessment>) => Assessment;
  updateAssessment: (assessmentId: string, updatedData: Partial<Assessment>) => void;
  deleteAssessment: (assessmentId: string) => void;
  toggleAssessmentStatus: (assessmentId: string) => void;
  addQuestionToAssessment: (assessmentId: string, question: Omit<AssessmentQuestion, 'id'> & { id?: string }) => void;
  updateQuestionInAssessment: (assessmentId: string, questionId: string, updatedQuestion: Partial<AssessmentQuestion>) => void;
  deleteQuestionFromAssessment: (assessmentId: string, questionId: string) => void;
  uploadResource: (newResource: Partial<ResourceItem>) => void;
  deleteResource: (resourceId: string) => void;
  updateTrainerCompetency: (trainerId: string, competencyName: string, level: number) => void;
  updateTraineeProfile: (profile: Partial<TraineeProfile>) => void;
  publishAnnouncement: (announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Competency matching helper
  calculateTrainerMatch: (requirementId: string) => TrainerMatchResult[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'capacity_connect_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

const syncSupabase = async (task: () => PromiseLike<any>) => {
  if (!isSupabaseConfigured) return;
  try {
    const res = await task();
    if (res && res.error) {
      console.info('Supabase sync info:', res.error.message);
    }
  } catch (err: unknown) {
    console.info('Supabase sync notice:', err);
  }
};

export const TAB_NAMES: Record<string, string> = {
  landing: 'Home',
  courses: 'Courses & Tracks',
  resources: 'Learning Library',
  'competency-matrix': 'Competency Engine',
  'trainee-dashboard': 'Trainee Dashboard',
  'trainer-dashboard': 'Trainer Studio',
  'admin-dashboard': 'Admin Console',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = loadFromStorage<User | null>('current_user', null);
    if (saved) return saved;
    // Default to trainee demo user for rich preview
    return INITIAL_USERS[0]; // Rahul Anand (trainee)
  });

  const [traineeProfiles, setTraineeProfiles] = useState<Record<string, TraineeProfile>>(() =>
    loadFromStorage('trainee_profiles', INITIAL_TRAINEE_PROFILES)
  );
  const [trainerProfiles, setTrainerProfiles] = useState<Record<string, TrainerProfile>>(() =>
    loadFromStorage('trainer_profiles', INITIAL_TRAINER_PROFILES)
  );
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage('courses', INITIAL_COURSES));
  const [modules, setModules] = useState<CourseModule[]>(() => loadFromStorage('modules', INITIAL_MODULES));
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => loadFromStorage('enrollments', INITIAL_ENROLLMENTS));
  const [resources, setResources] = useState<ResourceItem[]>(() => loadFromStorage('resources', INITIAL_RESOURCES));
  const [assessments, setAssessments] = useState<Assessment[]>(() => loadFromStorage('assessments', INITIAL_ASSESSMENTS));
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>(() =>
    loadFromStorage('results', INITIAL_RESULTS)
  );
  const [certificates, setCertificates] = useState<Certificate[]>(() =>
    loadFromStorage('certificates', INITIAL_CERTIFICATES)
  );
  const [feedbacks, setFeedbacks] = useState<CourseFeedback[]>(() => loadFromStorage('feedbacks', INITIAL_FEEDBACKS));
  const [competencies, setCompetencies] = useState<CompetencyDefinition[]>(() =>
    loadFromStorage('competencies', INITIAL_COMPETENCIES)
  );
  const [subjectRequirements, setSubjectRequirements] = useState<SubjectRequirement[]>(() =>
    loadFromStorage('subject_requirements', INITIAL_SUBJECT_REQUIREMENTS)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadFromStorage('announcements', INITIAL_ANNOUNCEMENTS)
  );
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );

  // UI state & Navigation History
  const [activeTab, setActiveTabState] = useState<string>('landing');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ tab: string; courseId: string | null; assessmentId: string | null }>>([]);

  const navigateTo = (tab: string, courseId: string | null = null, assessmentId: string | null = null) => {
    if (tab === activeTab && courseId === selectedCourseId && assessmentId === selectedAssessmentId) {
      return;
    }
    setNavigationHistory((prev) => [
      ...prev,
      { tab: activeTab, courseId: selectedCourseId, assessmentId: selectedAssessmentId },
    ]);
    setActiveTabState(tab);
    setSelectedCourseId(courseId);
    setSelectedAssessmentId(assessmentId);
  };

  const setActiveTab = (tabOrUpdater: string | ((prev: string) => string)) => {
    setActiveTabState((prevTab) => {
      const nextTab = typeof tabOrUpdater === 'function' ? tabOrUpdater(prevTab) : tabOrUpdater;
      if (nextTab !== prevTab) {
        setNavigationHistory((prev) => [
          ...prev,
          { tab: prevTab, courseId: selectedCourseId, assessmentId: selectedAssessmentId },
        ]);
      }
      return nextTab;
    });
  };

  const canGoBack = navigationHistory.length > 0 || activeTab !== 'landing';

  const previousTabName = useMemo(() => {
    if (navigationHistory.length > 0) {
      const last = navigationHistory[navigationHistory.length - 1];
      return TAB_NAMES[last.tab] || last.tab;
    }
    if (activeTab !== 'landing') {
      return 'Home';
    }
    return null;
  }, [navigationHistory, activeTab]);

  const goBack = (): boolean => {
    if (navigationHistory.length > 0) {
      const last = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTabState(last.tab);
      setSelectedCourseId(last.courseId);
      setSelectedAssessmentId(last.assessmentId);
      return true;
    }
    if (activeTab !== 'landing') {
      setActiveTabState('landing');
      setSelectedCourseId(null);
      setSelectedAssessmentId(null);
      return true;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return true;
    }
    return false;
  };

  // Sync to local storage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('trainee_profiles', traineeProfiles), [traineeProfiles]);
  useEffect(() => saveToStorage('trainer_profiles', trainerProfiles), [trainerProfiles]);
  useEffect(() => saveToStorage('courses', courses), [courses]);
  useEffect(() => saveToStorage('enrollments', enrollments), [enrollments]);
  useEffect(() => saveToStorage('resources', resources), [resources]);
  useEffect(() => saveToStorage('assessments', assessments), [assessments]);
  useEffect(() => saveToStorage('results', assessmentResults), [assessmentResults]);
  useEffect(() => saveToStorage('certificates', certificates), [certificates]);
  useEffect(() => saveToStorage('feedbacks', feedbacks), [feedbacks]);
  useEffect(() => saveToStorage('announcements', announcements), [announcements]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);

  // Auth operations
  const login = (email: string, role?: UserRole): boolean => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (user.status === 'rejected') {
        return false;
      }
      setCurrentUser(user);
      setAuthModalOpen(false);
      // Route to role-specific dashboard
      if (user.role === 'trainee') setActiveTab('trainee-dashboard');
      else if (user.role === 'trainer') setActiveTab('trainer-dashboard');
      else if (user.role === 'admin') setActiveTab('admin-dashboard');
      return true;
    }
    // If user not found, create guest demo session if requested
    if (role) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        status: role === 'admin' ? 'approved' : 'pending',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const loginAsDemoUser = (role: UserRole) => {
    let demoUser: User | undefined;
    if (role === 'trainee') {
      demoUser = users.find((u) => u.id === 'user-trainee-1') || users.find((u) => u.role === 'trainee');
    } else if (role === 'trainer') {
      demoUser = users.find((u) => u.id === 'user-trainer-1') || users.find((u) => u.role === 'trainer');
    } else {
      demoUser = users.find((u) => u.id === 'user-admin-1') || users.find((u) => u.role === 'admin');
    }

    if (demoUser) {
      setCurrentUser(demoUser);
      setAuthModalOpen(false);
      if (role === 'trainee') setActiveTab('trainee-dashboard');
      else if (role === 'trainer') setActiveTab('trainer-dashboard');
      else if (role === 'admin') setActiveTab('admin-dashboard');
    }
  };

  const signup = (userData: { name: string; email: string; role: UserRole; organization?: string; designation?: string }) => {
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return;
    }

    // Trainees are approved by default for instant onboarding; trainers and admins require approval
    const isInstantApproval = userData.role === 'trainee';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: isInstantApproval ? 'approved' : 'pending',
      organization: userData.organization || 'Public Sector Organization',
      designation: userData.designation || (userData.role === 'trainee' ? 'Capacity Trainee' : 'Lead Trainer'),
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);

    if (userData.role === 'trainee') {
      setTraineeProfiles((prev) => ({
        ...prev,
        [newUser.id]: {
          userId: newUser.id,
          qualification: 'Bachelor of Technology / Public Systems',
          experienceYears: 2,
          experienceDetails: 'Engaged in institutional operations and modernization projects.',
          interests: ['Data Science', 'Enterprise Infrastructure', 'Governance'],
          skills: [
            { name: 'Python', level: 'Beginner' },
            { name: 'SQL', level: 'Intermediate' },
          ],
          currentRole: newUser.designation || 'Specialist',
          department: newUser.organization || 'General Public Administration',
        },
      }));
    } else if (userData.role === 'trainer') {
      setTrainerProfiles((prev) => ({
        ...prev,
        [newUser.id]: {
          userId: newUser.id,
          specialization: 'Technology Architecture & Capacity Training',
          experienceYears: 5,
          bio: 'Faculty specializing in capacity building and digital infrastructure.',
          rating: 5.0,
          coursesAuthored: 0,
          studentsTrained: 0,
          competencies: {
            Python: 3,
            ML: 3,
            Statistics: 3,
            SQL: 3,
            AI: 3,
          },
        },
      }));
    }

    // Add notification for admin
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'New User Registration',
      message: `${userData.name} registered as a ${userData.role} (${newUser.status}).`,
      type: 'approval',
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setCurrentUser(newUser);
    setAuthModalOpen(false);
    if (newUser.status === 'approved') {
      if (newUser.role === 'trainee') setActiveTab('trainee-dashboard');
      else if (newUser.role === 'trainer') setActiveTab('trainer-dashboard');
      else setActiveTab('admin-dashboard');
    }
  };

  const addUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    organization?: string;
    designation?: string;
  }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      organization: userData.organization || 'Public Sector Organization',
      designation:
        userData.designation ||
        (userData.role === 'trainee'
          ? 'Capacity Trainee'
          : userData.role === 'trainer'
          ? 'Lead Trainer'
          : 'Administrator'),
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);

    if (userData.role === 'trainee') {
      setTraineeProfiles((prev) => ({
        ...prev,
        [newUser.id]: {
          userId: newUser.id,
          qualification: 'Bachelor of Technology / Public Administration',
          experienceYears: 2,
          experienceDetails: 'Engaged in public governance operations.',
          interests: ['Data Science', 'Governance', 'Cloud Services'],
          skills: [
            { name: 'Python', level: 'Intermediate' },
            { name: 'SQL', level: 'Intermediate' },
          ],
          currentRole: newUser.designation || 'Specialist',
          department: newUser.organization || 'Public Administration',
        },
      }));
    } else if (userData.role === 'trainer') {
      setTrainerProfiles((prev) => ({
        ...prev,
        [newUser.id]: {
          userId: newUser.id,
          specialization: 'Enterprise Competency Training',
          experienceYears: 6,
          bio: 'Accredited trainer in digital government capabilities.',
          rating: 4.9,
          coursesAuthored: 1,
          studentsTrained: 120,
          competencies: {
            Python: 4,
            ML: 3,
            Statistics: 4,
            SQL: 4,
            AI: 3,
          },
        },
      }));
    }
  };

  const signInWithGoogle = async (roleOverride?: UserRole): Promise<User> => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = res.user;
      const targetRole = roleOverride || 'trainee';

      // Synchronize with Cloud SQL PostgreSQL database
      const syncRes = await api.syncUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Authorized User',
        role: targetRole,
        organization: 'Ministry of Communications & IT',
        designation: targetRole === 'admin' ? 'Directorate Officer' : targetRole === 'trainer' ? 'Lead Faculty' : 'Systems Analyst',
      });

      const syncedUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Authorized User',
        email: firebaseUser.email || '',
        role: (syncRes?.user?.role as UserRole) || targetRole,
        status: 'approved',
        organization: syncRes?.user?.organization || 'Ministry of Communications & IT',
        designation: syncRes?.user?.designation || (targetRole === 'admin' ? 'Directorate Officer' : 'Capacity Specialist'),
        joinedAt: new Date().toISOString().split('T')[0],
      };

      setCurrentUser(syncedUser);
      setUsers((prev) => {
        if (prev.some((u) => u.id === syncedUser.id || u.email === syncedUser.email)) {
          return prev.map((u) => (u.email === syncedUser.email ? syncedUser : u));
        }
        return [syncedUser, ...prev];
      });

      setAuthModalOpen(false);
      return syncedUser;
    } catch (err) {
      console.error('Firebase Google sign-in failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const approveUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'approved' } : u)));
    const target = users.find((u) => u.id === userId);
    if (target) {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        userId,
        title: 'Account Approved',
        message: `Your Capacity Connect account has been approved by the Administrator.`,
        type: 'approval',
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const rejectUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'rejected' } : u)));
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  // Trainee actions
  const enrollInCourse = (courseId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const alreadyEnrolled = enrollments.some((e) => e.traineeId === currentUser.id && e.courseId === courseId);
    if (alreadyEnrolled) {
      setActiveTab('trainee-dashboard');
      setSelectedCourseId(courseId);
      return;
    }

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      traineeId: currentUser.id,
      courseId,
      enrolledAt: new Date().toISOString().split('T')[0],
      progressPercent: 0,
      completedLessonIds: [],
      lastAccessedAt: new Date().toISOString().split('T')[0],
      status: 'in_progress',
    };

    setEnrollments((prev) => [...prev, newEnrollment]);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );

    const course = courses.find((c) => c.id === courseId);
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Course Enrollment Confirmed',
      message: `You are now enrolled in "${course?.title || 'Course'}". Begin your first module!`,
      type: 'enrollment',
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    setSelectedCourseId(courseId);
    setActiveTab('trainee-dashboard');
  };

  const completeLesson = (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.traineeId === currentUser.id && e.courseId === courseId) {
          const completed = e.completedLessonIds.includes(lessonId)
            ? e.completedLessonIds
            : [...e.completedLessonIds, lessonId];
          // Calculate approx progress
          const courseMod = modules.filter((m) => m.courseId === courseId);
          const totalLessons = courseMod.reduce((sum, m) => sum + m.lessons.length, 0) || 4;
          const progressPercent = Math.min(100, Math.round((completed.length / totalLessons) * 100));
          return {
            ...e,
            completedLessonIds: completed,
            progressPercent,
            status: progressPercent >= 100 ? 'completed' : 'in_progress',
            lastAccessedAt: new Date().toISOString().split('T')[0],
          };
        }
        return e;
      })
    );
  };

  const submitAssessment = (
    assessmentId: string,
    answers: Record<string, 'a' | 'b' | 'c' | 'd'>,
    timeTakenMinutes: number
  ): AssessmentResult => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    let correctCount = 0;
    assessment.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = scorePercent >= assessment.passingScorePercent;

    const result: AssessmentResult = {
      id: `result-${Date.now()}`,
      traineeId: currentUser?.id || 'guest',
      traineeName: currentUser?.name || 'Rahul Anand',
      assessmentId,
      assessmentTitle: assessment.title,
      courseId: assessment.courseId,
      courseTitle: assessment.courseTitle,
      scorePercent,
      totalQuestions: assessment.questions.length,
      correctAnswersCount: correctCount,
      passed,
      submittedAt: new Date().toISOString().split('T')[0],
      timeTakenMinutes,
      userAnswers: answers,
    };

    setAssessmentResults((prev) => [result, ...prev]);

    // Update assessment stats in state
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const currentAttempts = (a.totalAttempts || 0) + 1;
          const currentAvg = a.averageScore || a.passingScorePercent;
          const newAvg = Math.round(((currentAvg * (currentAttempts - 1)) + scorePercent) / currentAttempts);
          return {
            ...a,
            totalAttempts: currentAttempts,
            averageScore: newAvg,
          };
        }
        return a;
      })
    );

    // Issue certificate if passed
    if (passed && currentUser) {
      const certGrade = scorePercent >= 95 ? 'Honors' : scorePercent >= 85 ? 'A+' : scorePercent >= 75 ? 'A' : 'B';
      const trainer = users.find((u) => u.id === assessment.createdByTrainerId);
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        certificateNumber: `CC-2026-${assessment.subject.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
        traineeId: currentUser.id,
        traineeName: currentUser.name,
        courseId: assessment.courseId,
        courseTitle: assessment.courseTitle,
        trainerName: trainer?.name || assessment.createdByName,
        issueDate: new Date().toISOString().split('T')[0],
        grade: certGrade,
        scorePercent,
        verificationCode: `VERIFY-CC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };

      setCertificates((prev) => {
        const existing = prev.filter((c) => !(c.traineeId === currentUser.id && c.courseId === assessment.courseId));
        return [newCert, ...existing];
      });

      syncSupabase(() =>
        supabase.from('certificates').insert([
          {
            id: newCert.id,
            certificate_number: newCert.certificateNumber,
            trainee_id: currentUser.id,
            trainee_name: currentUser.name,
            course_id: newCert.courseId,
            course_title: newCert.courseTitle,
            trainer_name: newCert.trainerName,
            issue_date: newCert.issueDate,
            grade: newCert.grade,
            score_percent: newCert.scorePercent,
            verification_code: newCert.verificationCode,
          },
        ])
      );

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: 'Assessment Passed & Certificate Issued!',
        message: `You scored ${scorePercent}% on "${assessment.title}". Your official Certificate of Competency has been awarded!`,
        type: 'assessment',
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
      setActiveCertificate(newCert);
    }

    // Sync attempt to Supabase results table if connected
    syncSupabase(() =>
      supabase.from('results').insert([
        {
          id: result.id,
          assessment_id: assessmentId,
          assessment_title: assessment.title,
          course_id: assessment.courseId,
          course_title: assessment.courseTitle,
          trainee_id: result.traineeId,
          trainee_name: result.traineeName,
          score_percent: scorePercent,
          total_questions: assessment.questions.length,
          correct_count: correctCount,
          passed,
          submitted_at: result.submittedAt,
          time_taken_minutes: timeTakenMinutes,
          user_answers: answers,
        },
      ])
    );

    return result;
  };

  const submitFeedback = (courseId: string, rating: number, comments: string) => {
    if (!currentUser) return;
    const course = courses.find((c) => c.id === courseId);
    const feedback: CourseFeedback = {
      id: `fb-${Date.now()}`,
      traineeId: currentUser.id,
      traineeName: currentUser.name,
      courseId,
      courseTitle: course?.title || 'Course',
      rating,
      comments,
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setFeedbacks((prev) => [feedback, ...prev]);
  };

  // Trainer & Admin mutations
  const createCourse = (newCourseData: Partial<Course>) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: newCourseData.title || 'New Capacity Course',
      description: newCourseData.description || 'Comprehensive training module.',
      category: newCourseData.category || 'Data Science',
      level: newCourseData.level || 'Intermediate',
      durationWeeks: newCourseData.durationWeeks || 6,
      totalHours: newCourseData.totalHours || 30,
      trainerId: currentUser?.id || 'user-trainer-1',
      trainerName: currentUser?.name || 'Dr. Rajesh Verma',
      trainerRole: currentUser?.designation || 'Lead Faculty',
      status: 'active',
      enrolledCount: 0,
      rating: 5.0,
      reviewCount: 0,
      coverAccent: newCourseData.coverAccent || 'from-blue-600 to-slate-900',
      competenciesTargeted: newCourseData.competenciesTargeted || ['Python', 'Statistics'],
      modulesCount: 2,
      featured: false,
    };

    setCourses((prev) => [newCourse, ...prev]);

    // Create initial module
    const initModule: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId: newCourse.id,
      title: 'Module 1: Orientation & Core Fundamentals',
      description: 'Foundational concepts and reference standards.',
      order: 1,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          moduleId: `mod-${Date.now()}`,
          title: 'Introduction & Course Syllabus',
          type: 'video',
          duration: '15 min',
          description: 'Key competencies and weekly progression guidelines.',
        },
        {
          id: `les-${Date.now()}-2`,
          moduleId: `mod-${Date.now()}`,
          title: 'Curriculum Study Guide & Reading Pack',
          type: 'pdf',
          duration: '12 pages',
          description: 'Essential literature and prerequisite requirements.',
        },
      ],
    };
    setModules((prev) => [...prev, initModule]);
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId));
  };

  const createAssessment = (newAssessmentData: Partial<Assessment>): Assessment => {
    const newAssessment: Assessment = {
      id: newAssessmentData.id || `assess-${Date.now()}`,
      courseId: newAssessmentData.courseId || (courses[0]?.id || 'course-da'),
      courseTitle: newAssessmentData.courseTitle || (courses[0]?.title || 'Capacity Training Course'),
      title: newAssessmentData.title || 'Subject Competency Assessment',
      subject: newAssessmentData.subject || 'General Engineering',
      description: newAssessmentData.description || 'Subject matter evaluation.',
      timeLimitMinutes: newAssessmentData.timeLimitMinutes || 15,
      passingScorePercent: newAssessmentData.passingScorePercent || 70,
      deadline: newAssessmentData.deadline || '2026-11-30',
      createdByTrainerId: currentUser?.id || 'user-trainer-1',
      createdByName: currentUser?.name || 'Dr. Rajesh Verma',
      status: newAssessmentData.status || 'draft',
      questions: newAssessmentData.questions || [],
      totalAttempts: 0,
      averageScore: 0,
    };
    setAssessments((prev) => [newAssessment, ...prev]);

    syncSupabase(async () => {
      // 1. Insert assessment record with questions JSON
      await supabase
        .from('assessments')
        .insert([
          {
            id: newAssessment.id,
            title: newAssessment.title,
            course_id: newAssessment.courseId,
            course_title: newAssessment.courseTitle,
            subject: newAssessment.subject,
            description: newAssessment.description,
            time_limit_minutes: newAssessment.timeLimitMinutes,
            passing_score_percent: newAssessment.passingScorePercent,
            deadline: newAssessment.deadline,
            created_by_trainer_id: newAssessment.createdByTrainerId,
            created_by_name: newAssessment.createdByName,
            status: newAssessment.status,
            questions: newAssessment.questions,
          },
        ]);

      // 2. Also insert each question row into relational 'questions' table
      if (newAssessment.questions && newAssessment.questions.length > 0) {
        const questionRows = newAssessment.questions.map((q, idx) => ({
          id: q.id,
          assessment_id: newAssessment.id,
          question: q.question,
          option_a: q.optionA,
          option_b: q.optionB,
          option_c: q.optionC,
          option_d: q.optionD,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || '',
          order_index: idx + 1,
        }));
        await supabase.from('questions').insert(questionRows);
      }
    });

    // Also persist to PostgreSQL backend /api/assessments
    fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newAssessment.title,
        courseId: 1,
        subject: newAssessment.subject,
        durationMin: newAssessment.timeLimitMinutes,
        passingScore: newAssessment.passingScorePercent,
        questions: newAssessment.questions,
        deadline: newAssessment.deadline,
      }),
    }).catch(() => {});

    return newAssessment;
  };

  const toggleAssessmentStatus = (assessmentId: string) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const newStatus: 'draft' | 'published' = a.status === 'published' ? 'draft' : 'published';
          syncSupabase(() =>
            supabase.from('assessments').update({ status: newStatus }).eq('id', assessmentId)
          );
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  const updateAssessment = (assessmentId: string, updatedData: Partial<Assessment>) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, ...updatedData } : a))
    );

    syncSupabase(() =>
      supabase.from('assessments').update(updatedData).eq('id', assessmentId)
    );
  };

  const deleteAssessment = (assessmentId: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));

    syncSupabase(async () => {
      await supabase.from('questions').delete().eq('assessment_id', assessmentId);
      await supabase.from('assessments').delete().eq('id', assessmentId);
    });
  };

  const addQuestionToAssessment = (
    assessmentId: string,
    questionData: Omit<AssessmentQuestion, 'id'> & { id?: string }
  ) => {
    const newQuestion: AssessmentQuestion = {
      id: questionData.id || `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question: questionData.question,
      optionA: questionData.optionA,
      optionB: questionData.optionB,
      optionC: questionData.optionC,
      optionD: questionData.optionD,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || '',
    };

    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const updatedQuestions = [...a.questions, newQuestion];
          syncSupabase(async () => {
            await supabase.from('assessments').update({ questions: updatedQuestions }).eq('id', assessmentId);
            await supabase.from('questions').insert([
              {
                id: newQuestion.id,
                assessment_id: assessmentId,
                question: newQuestion.question,
                option_a: newQuestion.optionA,
                option_b: newQuestion.optionB,
                option_c: newQuestion.optionC,
                option_d: newQuestion.optionD,
                correct_answer: newQuestion.correctAnswer,
                explanation: newQuestion.explanation || '',
              },
            ]);
          });
          return { ...a, questions: updatedQuestions };
        }
        return a;
      })
    );
  };

  const updateQuestionInAssessment = (
    assessmentId: string,
    questionId: string,
    updatedQuestion: Partial<AssessmentQuestion>
  ) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const updatedQuestions = a.questions.map((q) =>
            q.id === questionId ? { ...q, ...updatedQuestion } : q
          );
          syncSupabase(async () => {
            await supabase.from('assessments').update({ questions: updatedQuestions }).eq('id', assessmentId);
            await supabase.from('questions').update({
              question: updatedQuestion.question,
              option_a: updatedQuestion.optionA,
              option_b: updatedQuestion.optionB,
              option_c: updatedQuestion.optionC,
              option_d: updatedQuestion.optionD,
              correct_answer: updatedQuestion.correctAnswer,
              explanation: updatedQuestion.explanation,
            }).eq('id', questionId);
          });
          return { ...a, questions: updatedQuestions };
        }
        return a;
      })
    );
  };

  const deleteQuestionFromAssessment = (assessmentId: string, questionId: string) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.id === assessmentId) {
          const updatedQuestions = a.questions.filter((q) => q.id !== questionId);
          syncSupabase(async () => {
            await supabase.from('assessments').update({ questions: updatedQuestions }).eq('id', assessmentId);
            await supabase.from('questions').delete().eq('id', questionId);
          });
          return { ...a, questions: updatedQuestions };
        }
        return a;
      })
    );
  };

  const uploadResource = (newResData: Partial<ResourceItem>) => {
    const newRes: ResourceItem = {
      id: `res-${Date.now()}`,
      courseId: newResData.courseId,
      courseTitle: newResData.courseTitle || 'Capacity Training Library',
      trainerId: currentUser?.id || 'user-trainer-1',
      trainerName: currentUser?.name || 'Trainer Faculty',
      title: newResData.title || 'Learning Resource Package',
      category: newResData.category || 'Study Materials',
      type: newResData.type || 'pdf',
      fileSize: newResData.fileSize || '3.5 MB',
      downloadUrl: '#',
      downloadCount: 0,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: newResData.description || 'Handout for trainees.',
    };
    setResources((prev) => [newRes, ...prev]);
  };

  const deleteResource = (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  const updateTrainerCompetency = (trainerId: string, competencyName: string, level: number) => {
    setTrainerProfiles((prev) => {
      const existing = prev[trainerId] || {
        userId: trainerId,
        specialization: 'Faculty Trainer',
        experienceYears: 8,
        bio: 'Capacity building instructor.',
        rating: 4.8,
        coursesAuthored: 1,
        studentsTrained: 500,
        competencies: {},
      };
      return {
        ...prev,
        [trainerId]: {
          ...existing,
          competencies: {
            ...existing.competencies,
            [competencyName]: Math.max(1, Math.min(5, level)),
          },
        },
      };
    });
  };

  const updateTraineeProfile = (updatedProfile: Partial<TraineeProfile>) => {
    if (!currentUser) return;
    setTraineeProfiles((prev) => {
      const current = prev[currentUser.id] || {
        userId: currentUser.id,
        qualification: '',
        experienceYears: 0,
        experienceDetails: '',
        interests: [],
        skills: [],
        currentRole: '',
        department: '',
      };
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          ...updatedProfile,
        },
      };
    });
  };

  const publishAnnouncement = (annData: Partial<Announcement>) => {
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: annData.title || 'Official Announcement',
      content: annData.content || '',
      type: annData.type || 'general',
      author: currentUser?.name || 'Capacity Connect Administrator',
      publishedAt: new Date().toISOString().split('T')[0],
      pinned: !!annData.pinned,
    };
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Competency matching algorithm:
  // Given a SubjectRequirement (e.g. Data Science -> Python + Statistics + ML + Data Visualization + SQL)
  // Evaluates every trainer in the system:
  // S = sum(weight_i * trainer_level_i) / sum(weight_i * 5) * 100
  const calculateTrainerMatch = (requirementId: string): TrainerMatchResult[] => {
    const req = subjectRequirements.find((r) => r.id === requirementId) || subjectRequirements[0];
    const results: TrainerMatchResult[] = [];

    // Find all trainers
    const trainerUsers = users.filter((u) => u.role === 'trainer' && u.status === 'approved');

    trainerUsers.forEach((trainer) => {
      const profile = trainerProfiles[trainer.id] || {
        userId: trainer.id,
        specialization: trainer.designation || 'Instructor',
        experienceYears: 5,
        bio: trainer.bio || '',
        rating: 4.8,
        coursesAuthored: 1,
        studentsTrained: 500,
        competencies: {},
      };

      let weightedScoreSum = 0;
      let totalMaxWeightedScore = 0;

      const breakdown = req.targetCompetencies.map((target) => {
        const trainerLevel = profile.competencies[target.competencyName] || 2;
        weightedScoreSum += target.weight * trainerLevel;
        totalMaxWeightedScore += target.weight * 5;

        let status: 'meets' | 'exceeds' | 'lacks' = 'meets';
        if (trainerLevel > target.minimumLevel) status = 'exceeds';
        else if (trainerLevel < target.minimumLevel) status = 'lacks';

        return {
          competencyName: target.competencyName,
          requiredLevel: target.minimumLevel,
          trainerLevel,
          status,
        };
      });

      const suitabilityPercent = Math.round((weightedScoreSum / (totalMaxWeightedScore || 1)) * 100);

      let suitabilityGrade: 'Highly Recommended' | 'Suitable' | 'Marginal' = 'Marginal';
      if (suitabilityPercent >= 82) suitabilityGrade = 'Highly Recommended';
      else if (suitabilityPercent >= 65) suitabilityGrade = 'Suitable';

      results.push({
        trainerId: trainer.id,
        trainerName: trainer.name,
        specialization: profile.specialization,
        experienceYears: profile.experienceYears,
        overallSuitabilityPercent: suitabilityPercent,
        competencyBreakdown: breakdown,
        suitabilityGrade,
      });
    });

    // Sort descending by suitability score
    return results.sort((a, b) => b.overallSuitabilityPercent - a.overallSuitabilityPercent);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        traineeProfiles,
        trainerProfiles,
        courses,
        modules,
        enrollments,
        resources,
        assessments,
        assessmentResults,
        certificates,
        feedbacks,
        competencies,
        subjectRequirements,
        announcements,
        notifications,
        activeTab,
        setActiveTab,
        selectedCourseId,
        setSelectedCourseId,
        selectedAssessmentId,
        setSelectedAssessmentId,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        activeCertificate,
        setActiveCertificate,
        canGoBack,
        previousTabName,
        goBack,
        navigateTo,
        navigationHistory,
        login,
        loginAsDemoUser,
        signInWithGoogle,
        signup,
        addUser,
        logout,
        approveUser,
        rejectUser,
        changeUserRole,
        enrollInCourse,
        completeLesson,
        submitAssessment,
        submitFeedback,
        createCourse,
        deleteCourse,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        toggleAssessmentStatus,
        addQuestionToAssessment,
        updateQuestionInAssessment,
        deleteQuestionFromAssessment,
        uploadResource,
        deleteResource,
        updateTrainerCompetency,
        updateTraineeProfile,
        publishAnnouncement,
        deleteAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        calculateTrainerMatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
