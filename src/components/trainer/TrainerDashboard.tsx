import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FolderOpen,
  BarChart3,
  User,
  Plus,
  Upload,
  Edit,
  Eye,
  FileText,
  Video,
  Presentation,
  CheckCircle2,
  Clock,
  Star,
  Users,
  TrendingUp,
  Award,
  Trash2,
  ExternalLink,
  Sliders,
  Check,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit3,
  ListChecks,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assessment, AssessmentQuestion, Course, ResourceItem } from '../../types';

export const TrainerDashboard: React.FC = () => {
  const {
    currentUser,
    trainerProfiles,
    courses,
    resources,
    assessments,
    assessmentResults,
    feedbacks,
    createCourse,
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
    setActiveTab,
  } = useApp();

  // Sidebar navigation state: Dashboard, My Courses, Questionnaires, Trainer Library, Performance, Profile
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'courses' | 'questionnaires' | 'library' | 'performance' | 'profile'
  >('dashboard');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [viewResultsAssessment, setViewResultsAssessment] = useState<Assessment | null>(null);
  const [manageQuestionsAssessment, setManageQuestionsAssessment] = useState<Assessment | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Course Form state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Data Analytics');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseDuration, setCourseDuration] = useState(8);
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCompetencies, setCourseCompetencies] = useState('Python, Data Analytics, Statistics');

  // Resource Form state
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('Presentations');
  const [resType, setResType] = useState<'pdf' | 'video' | 'ppt' | 'material'>('pdf');
  const [resDesc, setResDesc] = useState('');
  const [resFileSize, setResFileSize] = useState('4.8 MB');

  // Questionnaire Form state (Creation & Edit)
  const [assessCourseId, setAssessCourseId] = useState(courses[0]?.id || 'course-da');
  const [assessTitle, setAssessTitle] = useState('');
  const [assessSubject, setAssessSubject] = useState('Data Analytics');
  const [assessPassScore, setAssessPassScore] = useState(70);
  const [assessTimeMins, setAssessTimeMins] = useState(15);
  const [assessDeadline, setAssessDeadline] = useState('2026-11-30');
  const [assessDescription, setAssessDescription] = useState('Comprehensive diagnostic competency evaluation.');
  const [assessPublishImmediately, setAssessPublishImmediately] = useState(false);
  const [assessFilter, setAssessFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Questions inside Questionnaire Creation Modal
  const [newQuestionsList, setNewQuestionsList] = useState<AssessmentQuestion[]>([
    {
      id: 'q-seed-1',
      question: 'What is the primary role of categorical exploratory data analysis?',
      optionA: 'Identifying statistical modes and discrete value distributions',
      optionB: 'Maximizing network transmission bandwidth',
      optionC: 'Overriding continuous loss functions',
      optionD: 'Deprecating index hashes',
      correctAnswer: 'a',
      explanation: 'Categorical EDA examines distribution, frequency, and relationship between discrete attributes.',
    },
  ]);

  // Draft question inputs for the creator
  const [draftQText, setDraftQText] = useState('');
  const [draftOptA, setDraftOptA] = useState('');
  const [draftOptB, setDraftOptB] = useState('');
  const [draftOptC, setDraftOptC] = useState('');
  const [draftOptD, setDraftOptD] = useState('');
  const [draftCorrect, setDraftCorrect] = useState<'a' | 'b' | 'c' | 'd'>('a');
  const [draftExplanation, setDraftExplanation] = useState('');
  const [editingDraftQIndex, setEditingDraftQIndex] = useState<number | null>(null);
  const [assessmentModalError, setAssessmentModalError] = useState<string | null>(null);

  // Draft question inputs for "Manage Questions" modal
  const [manageQText, setManageQText] = useState('');
  const [manageOptA, setManageOptA] = useState('');
  const [manageOptB, setManageOptB] = useState('');
  const [manageOptC, setManageOptC] = useState('');
  const [manageOptD, setManageOptD] = useState('');
  const [manageCorrect, setManageCorrect] = useState<'a' | 'b' | 'c' | 'd'>('a');
  const [manageExplanation, setManageExplanation] = useState('');

  // Filter for library
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string>('all');

  // Trainer profile
  const trainerProfile = currentUser ? trainerProfiles[currentUser.id] : null;

  // Live dynamic assessments for this trainer
  const trainerAssessments = currentUser
    ? assessments.filter(
        (a) =>
          a.createdByTrainerId === currentUser.id ||
          currentUser.role === 'admin' ||
          a.createdByTrainerId === 'user-trainer-1'
      )
    : assessments;

  // Trainer specific stats as specified in prompt:
  // 248 trainees, 12 courses, 18 active assessments, 92% participation
  const traineesCount = 248;
  const coursesCount = 12;
  const activeAssessmentsCount = trainerAssessments.length;
  const participationRate = '92%';
  const completionRate = '86.4%';

  // Competency skills to highlight in profile: Python, ML, Statistics, Data Analytics
  const competencyKeys = ['Python', 'ML', 'Statistics', 'Data Analytics', 'SQL', 'AI'];

  // Handle Course Create / Edit
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    if (editingCourse) {
      setEditingCourse(null);
    } else {
      createCourse({
        title: courseTitle,
        category: courseCategory,
        level: courseLevel,
        durationWeeks: Number(courseDuration),
        description: courseDesc,
        competenciesTargeted: courseCompetencies.split(',').map((s) => s.trim()),
      });
    }

    setShowCourseModal(false);
    setCourseTitle('');
    setCourseDesc('');
  };

  const handleOpenEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseTitle(c.title);
    setCourseCategory(c.category);
    setCourseLevel(c.level);
    setCourseDuration(c.durationWeeks);
    setCourseDesc(c.description);
    setCourseCompetencies(c.competenciesTargeted.join(', '));
    setShowCourseModal(true);
  };

  // Handle Resource Upload
  const handleUploadResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    uploadResource({
      title: resTitle,
      category: resCategory,
      type: resType,
      fileSize: resFileSize,
      description: resDesc,
    });

    setShowResourceModal(false);
    setResTitle('');
    setResDesc('');
  };

  // Fast sample question loader
  const handleLoadSampleQuestions = () => {
    const selectedCourse = courses.find((c) => c.id === assessCourseId) || courses[0];
    const category = selectedCourse?.category || assessSubject || 'Data Analytics';

    const samples: AssessmentQuestion[] = [
      {
        id: `q-sample-${Date.now()}-1`,
        question: `In ${category}, what is the primary objective of exploratory data validation?`,
        optionA: 'Uncovering distributional characteristics, anomalies, and structural patterns',
        optionB: 'Bypassing schema integrity constraints for faster execution',
        optionC: 'Overriding continuous loss functions without validation',
        optionD: 'Deprecating index hashes and audit logging',
        correctAnswer: 'a',
        explanation: 'Exploratory data analysis validates data quality and distribution prior to model inference.',
      },
      {
        id: `q-sample-${Date.now()}-2`,
        question: `Which confidence interval threshold is standard when establishing baseline metrics in ${category}?`,
        optionA: '50% probability threshold',
        optionB: '95% statistical confidence bounds (p < 0.05)',
        optionC: 'Arbitrary variation without statistical bounds',
        optionD: 'Unrestricted sample variance tolerances',
        correctAnswer: 'b',
        explanation: '95% confidence intervals represent the recognized benchmark for statistical significance.',
      },
      {
        id: `q-sample-${Date.now()}-3`,
        question: `How should model drift or distributional shift be addressed in production systems?`,
        optionA: 'Continuous evaluation metrics, automated retraining triggers, and drift monitors',
        optionB: 'Disabling telemetry monitors to maintain low operational latency',
        optionC: 'Permanently hardcoding initial test weights',
        optionD: 'Deprecating rollback checkpoints',
        correctAnswer: 'a',
        explanation: 'Continuous telemetry and automated drift detection ensure models maintain acceptable accuracy.',
      },
    ];
    setNewQuestionsList(samples);
    setAssessmentModalError(null);
  };

  // Add or Update draft question during creation
  const handleAddQuestionToDraft = () => {
    if (!draftQText.trim()) {
      setAssessmentModalError('Please enter a question statement.');
      return;
    }
    if (!draftOptA.trim() || !draftOptB.trim() || !draftOptC.trim() || !draftOptD.trim()) {
      setAssessmentModalError('Please provide all 4 options (A, B, C, D) for the question.');
      return;
    }
    setAssessmentModalError(null);

    const questionItem: AssessmentQuestion = {
      id:
        editingDraftQIndex !== null && newQuestionsList[editingDraftQIndex]
          ? newQuestionsList[editingDraftQIndex].id
          : `q-draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question: draftQText.trim(),
      optionA: draftOptA.trim(),
      optionB: draftOptB.trim(),
      optionC: draftOptC.trim(),
      optionD: draftOptD.trim(),
      correctAnswer: draftCorrect,
      explanation: draftExplanation.trim() || 'Accredited curriculum benchmark.',
    };

    if (editingDraftQIndex !== null) {
      setNewQuestionsList((prev) =>
        prev.map((q, idx) => (idx === editingDraftQIndex ? questionItem : q))
      );
      setEditingDraftQIndex(null);
    } else {
      setNewQuestionsList((prev) => [...prev, questionItem]);
    }

    setDraftQText('');
    setDraftOptA('');
    setDraftOptB('');
    setDraftOptC('');
    setDraftOptD('');
    setDraftCorrect('a');
    setDraftExplanation('');
  };

  const handleEditDraftQuestion = (index: number) => {
    const targetQ = newQuestionsList[index];
    if (!targetQ) return;
    setEditingDraftQIndex(index);
    setDraftQText(targetQ.question);
    setDraftOptA(targetQ.optionA);
    setDraftOptB(targetQ.optionB);
    setDraftOptC(targetQ.optionC);
    setDraftOptD(targetQ.optionD);
    setDraftCorrect(targetQ.correctAnswer);
    setDraftExplanation(targetQ.explanation || '');
    setAssessmentModalError(null);
  };

  const handleCancelEditDraft = () => {
    setEditingDraftQIndex(null);
    setDraftQText('');
    setDraftOptA('');
    setDraftOptB('');
    setDraftOptC('');
    setDraftOptD('');
    setDraftCorrect('a');
    setDraftExplanation('');
    setAssessmentModalError(null);
  };

  const handleRemoveQuestionFromDraft = (qId: string) => {
    setNewQuestionsList((prev) => prev.filter((q) => q.id !== qId));
    if (editingDraftQIndex !== null) {
      setEditingDraftQIndex(null);
      setDraftQText('');
      setDraftOptA('');
      setDraftOptB('');
      setDraftOptC('');
      setDraftOptD('');
      setDraftCorrect('a');
      setDraftExplanation('');
    }
  };

  // Handle Questionnaire Create
  const handleCreateAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessTitle.trim()) {
      setAssessmentModalError('Please enter an assessment title.');
      return;
    }

    let finalQuestions = [...newQuestionsList];
    // If trainer typed a question in inputs without explicitly clicking "+ Add Question", include it
    if (draftQText.trim() && draftOptA.trim() && draftOptB.trim()) {
      const pendingQ: AssessmentQuestion = {
        id:
          editingDraftQIndex !== null && newQuestionsList[editingDraftQIndex]
            ? newQuestionsList[editingDraftQIndex].id
            : `q-draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        question: draftQText.trim(),
        optionA: draftOptA.trim(),
        optionB: draftOptB.trim(),
        optionC: draftOptC.trim() || 'Option C',
        optionD: draftOptD.trim() || 'Option D',
        correctAnswer: draftCorrect,
        explanation: draftExplanation.trim() || 'Curriculum verified answer.',
      };
      if (editingDraftQIndex !== null) {
        finalQuestions[editingDraftQIndex] = pendingQ;
      } else {
        finalQuestions.push(pendingQ);
      }
    }

    if (finalQuestions.length === 0) {
      setAssessmentModalError('Please add at least 1 question to the assessment before saving.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === assessCourseId) || courses[0];

    createAssessment({
      title: assessTitle.trim(),
      subject: assessSubject.trim() || selectedCourse?.category || 'General Assessment',
      courseId: selectedCourse?.id || 'course-da',
      courseTitle: selectedCourse?.title || 'Capacity Training Course',
      description: assessDescription.trim(),
      passingScorePercent: Number(assessPassScore) || 70,
      timeLimitMinutes: Number(assessTimeMins) || 15,
      deadline: assessDeadline,
      status: assessPublishImmediately ? 'published' : 'draft',
      questions: finalQuestions,
    });

    setShowAssessmentModal(false);
    setNewQuestionsList([]);
    setEditingDraftQIndex(null);
    setDraftQText('');
    setDraftOptA('');
    setDraftOptB('');
    setDraftOptC('');
    setDraftOptD('');
    setDraftCorrect('a');
    setDraftExplanation('');
    setAssessTitle('');
    setAssessmentModalError(null);
  };

  // Handle Edit Questionnaire Submit
  const handleEditAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;
    updateAssessment(editingAssessment.id, {
      title: assessTitle,
      subject: assessSubject,
      passingScorePercent: Number(assessPassScore),
      timeLimitMinutes: Number(assessTimeMins),
      deadline: assessDeadline,
      description: assessDescription,
    });
    setEditingAssessment(null);
  };

  // Add question to existing assessment (Manage Questions Modal)
  const handleAddQuestionToExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageQuestionsAssessment || !manageQText.trim() || !manageOptA.trim() || !manageOptB.trim()) return;

    addQuestionToAssessment(manageQuestionsAssessment.id, {
      question: manageQText,
      optionA: manageOptA,
      optionB: manageOptB,
      optionC: manageOptC || 'Option C',
      optionD: manageOptD || 'Option D',
      correctAnswer: manageCorrect,
      explanation: manageExplanation || 'Evaluated syllabus benchmark.',
    });

    // Update local modal state copy
    setManageQuestionsAssessment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: [
          ...prev.questions,
          {
            id: `q-${Date.now()}`,
            question: manageQText,
            optionA: manageOptA,
            optionB: manageOptB,
            optionC: manageOptC || 'Option C',
            optionD: manageOptD || 'Option D',
            correctAnswer: manageCorrect,
            explanation: manageExplanation || 'Evaluated syllabus benchmark.',
          },
        ],
      };
    });

    setManageQText('');
    setManageOptA('');
    setManageOptB('');
    setManageOptC('');
    setManageOptD('');
    setManageCorrect('a');
    setManageExplanation('');
  };

  // Delete question from existing assessment
  const handleDeleteQuestionFromExisting = (questionId: string) => {
    if (!manageQuestionsAssessment) return;
    deleteQuestionFromAssessment(manageQuestionsAssessment.id, questionId);
    setManageQuestionsAssessment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      };
    });
  };

  // Delete entire assessment
  const handleDeleteAssessment = (assessmentId: string) => {
    if (confirm('Are you sure you want to delete this questionnaire?')) {
      deleteAssessment(assessmentId);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen, badge: coursesCount },
    { id: 'questionnaires', label: 'Questionnaires', icon: HelpCircle, badge: activeAssessmentsCount },
    { id: 'library', label: 'Trainer Library', icon: FolderOpen, badge: resources.length },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header Toggle */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trainer Workspace</span>
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

      {/* ─── LMS TRAINER SIDEBAR ───────────────────────────────── */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 shrink-0 p-4 flex flex-col justify-between z-20 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Trainer Persona Badge */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser?.name.charAt(0) || 'T'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name || 'Dr. Rajesh Verma'}
                </p>
                <p className="text-[11px] text-slate-600 truncate">Lead Faculty</p>
                <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                  Accredited Trainer
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
                      ? 'bg-blue-50 text-blue-800 font-bold border-l-3 border-blue-700'
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
                        isActive ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600'
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

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Faculty Directorate</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Capacity Connect certified instructor. Courseware and grading aligned with national standards.
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Trainer Studio — {currentUser?.name || 'Dr. Rajesh Verma'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage active cohorts, review trainee participation, and author accredited curricula.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseTitle('');
                    setCourseDesc('');
                    setShowCourseModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </button>
                <button
                  onClick={() => setShowAssessmentModal(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>New Questionnaire</span>
                </button>
              </div>
            </div>

            {/* Dashboard Cards: 248 trainees, 12 courses, 18 active assessments, 92% participation */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Trainees
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-3">
                  {traineesCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Active in enrolled tracks</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Courses Authored
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-blue-700 mt-3">
                  {coursesCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">Published across registry</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Active Assessments
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-3">
                  {activeAssessmentsCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">MCQ evaluation questionnaires</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Participation
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-3">
                  {participationRate}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">High engagement rate</p>
              </div>
            </div>

            {/* Recent Courses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Courses</h2>
                  <p className="text-xs text-slate-500">
                    Active curricula authored by you in the Capacity Connect catalog
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('courses')}
                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>View All 12 Courses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-blue-700">{c.category}</span>
                        <span>{c.durationWeeks} Weeks</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {c.competenciesTargeted.map((comp) => (
                          <span key={comp} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-500 text-[11px]">
                        <strong>{c.enrolledCount}</strong> Trainees
                      </span>
                      <button
                        onClick={() => handleOpenEditCourse(c)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Course</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 2: MY COURSES
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Courses ({coursesCount})</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curricula, resource units, and enrollment statistics across faculty cohorts
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseTitle('');
                  setCourseDesc('');
                  setShowCourseModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </button>
            </div>

            {/* Course List with course/resource/enrollment information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                      <th className="py-3 px-4">Course Title & Domain</th>
                      <th className="py-3 px-3">Proficiency Level</th>
                      <th className="py-3 px-3 text-center">Modules / Resources</th>
                      <th className="py-3 px-3 text-center">Enrolled Trainees</th>
                      <th className="py-3 px-3 text-center">Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{c.title}</p>
                          <p className="text-[11px] text-blue-700 font-medium">{c.category} · {c.durationWeeks} Weeks</p>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium text-[11px]">
                            {c.level}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                          {c.modulesCount} Units · {resources.length} Handouts
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                          {c.enrolledCount}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono text-amber-600 font-bold">
                          ★ {c.rating}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditCourse(c)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Course</span>
                          </button>
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
            VIEW 3: QUESTIONNAIRES
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'questionnaires' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Questionnaires & Subject MCQs ({activeAssessmentsCount} Active)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deadlines, participant metrics, answer keys, and grading distributions
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAssessmentModal(true);
                  setNewQuestionsList([]);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Assessment</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium mr-1">Status Filter:</span>
              {(['all', 'published', 'draft'] as const).map((filterVal) => {
                const count =
                  filterVal === 'all'
                    ? trainerAssessments.length
                    : filterVal === 'published'
                    ? trainerAssessments.filter((a) => a.status === 'published' || !a.status).length
                    : trainerAssessments.filter((a) => a.status === 'draft').length;

                return (
                  <button
                    key={filterVal}
                    onClick={() => setAssessFilter(filterVal)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                      assessFilter === filterVal
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filterVal === 'all' ? 'All Assessments' : filterVal} ({count})
                  </button>
                );
              })}
            </div>

            {/* Live Questionnaires Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainerAssessments
                .filter((a) => {
                  if (assessFilter === 'published') return a.status === 'published' || !a.status;
                  if (assessFilter === 'draft') return a.status === 'draft';
                  return true;
                })
                .map((a) => {
                  const isPublished = a.status === 'published' || !a.status;
                  const resultsForA = assessmentResults.filter((r) => r.assessmentId === a.id);
                  const participantsCount = resultsForA.length;
                  const passingCount = resultsForA.filter((r) => r.passed).length;
                  const passRate = participantsCount > 0 ? Math.round((passingCount / participantsCount) * 100) : 0;
                  const averageScore =
                    participantsCount > 0
                      ? Math.round(resultsForA.reduce((acc, curr) => acc + curr.scorePercent, 0) / participantsCount)
                      : a.averageScore || 0;

                  return (
                    <div
                      key={a.id}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                            {a.subject}
                          </span>
                          {isPublished ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Published · {a.questions.length} MCQs
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              Draft (Hidden) · {a.questions.length} MCQs
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                          <p className="text-xs text-blue-700 font-semibold mt-0.5">{a.courseTitle}</p>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <p className="flex items-center justify-between">
                            <span>Submissions:</span>
                            <strong className="font-mono text-slate-900 tabular-nums">
                              {participantsCount} attempts
                            </strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Pass Rate:</span>
                            <strong className="font-mono text-emerald-700">{passRate}%</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Average Score:</span>
                            <strong className="font-mono text-blue-700">{averageScore}%</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Passing Threshold:</span>
                            <strong className="font-mono text-slate-900">{a.passingScorePercent}%</strong>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Deadline:</span>
                            <strong className="font-mono text-slate-900">{a.deadline}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Actions: Publish Toggle / View Results / Manage / Edit / Delete */}
                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAssessmentStatus(a.id)}
                            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                              isPublished
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isPublished ? 'Revert to Draft' : 'Publish to Trainees'}
                          </button>
                          <button
                            onClick={() => setViewResultsAssessment(a)}
                            className="flex-1 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Results ({participantsCount})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setManageQuestionsAssessment(a)}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                            title="Manage Questions"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-slate-600" />
                            <span>Questions ({a.questions.length})</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingAssessment(a);
                              setAssessTitle(a.title);
                              setAssessSubject(a.subject);
                              setAssessPassScore(a.passingScorePercent);
                              setAssessTimeMins(a.timeLimitMinutes);
                              setAssessDeadline(a.deadline);
                              setAssessDescription(a.description || '');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                            title="Edit Questionnaire"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssessment(a.id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-semibold transition-colors"
                            title="Delete Questionnaire"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 4: TRAINER LIBRARY
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'library' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Trainer Library & Study Vault</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  PDF resources, recorded lectures, and presentations accessible to enrolled participants
                </p>
              </div>

              {/* Upload Resource Button */}
              <button
                onClick={() => setShowResourceModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resource</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium mr-1">Filter Type:</span>
              {['all', 'pdf', 'video', 'ppt'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLibraryTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg uppercase text-xs font-semibold transition-colors ${
                    libraryTypeFilter === type
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type === 'all' ? 'All Formats' : type === 'pdf' ? 'PDF Resources' : type === 'video' ? 'Recorded Lectures' : 'Presentations'}
                </button>
              ))}
            </div>

            {/* Library Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources
                .filter((r) => (libraryTypeFilter === 'all' ? true : r.type === libraryTypeFilter))
                .map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-blue-700">
                          {res.type === 'pdf' ? 'PDF Resource' : res.type === 'video' ? 'Recorded Lecture' : 'Presentation Deck'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{res.fileSize}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{res.title}</h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Downloads: {res.downloadCount}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab('resources')}
                          className="text-blue-700 font-semibold hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteResource(res.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 5: PERFORMANCE
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'performance' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl font-bold text-slate-900">Faculty Performance & Analytics</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation metrics, completion rates, trainee feedback, and assessment performance
              </p>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Trainee Count
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-2">
                  {traineesCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Across 48 public departments</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completion Rate
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-2">
                  {completionRate}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">12% above national benchmark</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Average Rating
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-amber-600 mt-2">
                  4.9 / 5.0
                </p>
                <p className="text-[11px] text-slate-400 mt-1">From trainee evaluations</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Certificates Conferred
                </span>
                <p className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 mt-2">
                  184
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Accredited graduates</p>
              </div>
            </div>

            {/* Assessment Performance Bars */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Assessment Performance Bars
              </h2>
              <div className="space-y-4 pt-2">
                {trainerAssessments.map((a) => {
                  const resultsForA = assessmentResults.filter((r) => r.assessmentId === a.id);
                  const count = resultsForA.length;
                  const avg =
                    count > 0
                      ? Math.round(resultsForA.reduce((sum, r) => sum + r.scorePercent, 0) / count)
                      : a.averageScore || 0;

                  return (
                    <div key={a.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{a.title}</span>
                        <span className="font-mono font-bold text-blue-800 tabular-nums">
                          {avg}% avg score · {count} attempts
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full rounded-full"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Training Feedback */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Training Feedback & Evaluations
              </h2>
              <div className="divide-y divide-slate-100">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="py-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{fb.traineeName}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                        ★ {fb.rating}/5
                      </div>
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium">{fb.courseTitle}</p>
                    <p className="text-slate-600 leading-relaxed">{fb.comments}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{fb.submittedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW 6: PROFILE
        ══════════════════════════════════════════════════════ */}
        {activeNav === 'profile' && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Trainer Profile & Competency Matrix</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Faculty credentials, authored courses, and multi-skill competency ratings
              </p>
            </div>

            {/* Trainer Role & Stats Summary */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Trainer Role:</span>
                <strong className="text-blue-950 font-bold">
                  {currentUser?.designation || 'Lead Faculty & Chief AI Scientist'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Courses Created:</span>
                <strong className="font-mono text-blue-950 font-bold">{coursesCount} Curricula</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Accredited Trainees:</span>
                <strong className="font-mono text-blue-950 font-bold">{traineesCount} Active Officers</strong>
              </div>
            </div>

            {/* Competencies: Python, ML, Statistics, Data Analytics */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audited Competencies (1 to 5 Rating)
              </h3>

              {competencyKeys.map((key) => {
                const currentVal = trainerProfile?.competencies[key] || 5;
                return (
                  <div
                    key={key}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{key}</span>
                      <p className="text-[11px] text-slate-500">
                        Level {currentVal} of 5 · {currentVal === 5 ? 'Master / Authority' : 'Advanced'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => currentUser && updateTrainerCompetency(currentUser.id, key, lvl)}
                          className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                            lvl <= currentVal
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-500'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 italic">
              Changes to competency ratings update your ranking in the Competency Engine and match scores across institutional training requirements.
            </p>
          </div>
        )}
      </main>

      {/* ─── MODAL: CREATE / EDIT COURSE ─────────────────────── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingCourse ? 'Edit Course Curricula' : 'Create New Course Track'}
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced Python for Public Policy Analytics"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Databases">Databases</option>
                    <option value="Leadership & Soft Skills">Leadership & Soft Skills</option>
                    <option value="Management">Management</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                  </select>
                </div>
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
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Targeted Competencies (comma separated)</label>
                <input
                  type="text"
                  value={courseCompetencies}
                  onChange={(e) => setCourseCompetencies(e.target.value)}
                  placeholder="Python, Statistics, Data Analytics"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description & Learning Outcomes</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Key concepts, lab exercises, and prerequisites..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                >
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: UPLOAD RESOURCE ──────────────────────────── */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Upload Resource to Trainer Library</h3>
              <button onClick={() => setShowResourceModal(false)} className="text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleUploadResourceSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Python Data Manipulation Handbook"
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Format Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="pdf">PDF Resource</option>
                    <option value="video">Recorded Lecture</option>
                    <option value="ppt">Presentation Slides</option>
                    <option value="material">Lab Notebook</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">File Size</label>
                  <input
                    type="text"
                    value={resFileSize}
                    onChange={(e) => setResFileSize(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Reference material for enrolled trainees..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: CREATE QUESTIONNAIRE WITH QUESTION BUILDER ─── */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">New Assessment Questionnaire</h3>
                <p className="text-[11px] text-slate-400">
                  Configure exam requirements, passing criteria, and MCQ question pool
                </p>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} className="text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateAssessmentSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Questionnaire Title</label>
                  <input
                    type="text"
                    required
                    value={assessTitle}
                    onChange={(e) => setAssessTitle(e.target.value)}
                    placeholder="e.g. Python Fundamentals MCQ"
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assign to Course</label>
                  <select
                    value={assessCourseId}
                    onChange={(e) => setAssessCourseId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={assessSubject}
                    onChange={(e) => setAssessSubject(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pass Score %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={assessPassScore}
                    onChange={(e) => setAssessPassScore(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={assessTimeMins}
                    onChange={(e) => setAssessTimeMins(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={assessDeadline}
                    onChange={(e) => setAssessDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assessment Description</label>
                <textarea
                  rows={2}
                  value={assessDescription}
                  onChange={(e) => setAssessDescription(e.target.value)}
                  placeholder="Evaluation goals and syllabus references..."
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Error Banner */}
              {assessmentModalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{assessmentModalError}</span>
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  MULTI-QUESTION POOL BUILDER & MANAGEMENT
              ══════════════════════════════════════════════════ */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-blue-700" />
                      <span>Configured Questions ({newQuestionsList.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add multiple MCQs. Each question must include options A–D with one designated correct answer.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {newQuestionsList.length === 0 && (
                      <button
                        type="button"
                        onClick={handleLoadSampleQuestions}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors border border-blue-200"
                        title="Quick-load 3 subject-relevant sample questions"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Load Sample MCQs</span>
                      </button>
                    )}
                    {editingDraftQIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEditDraft}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* List of Already Added Questions */}
                {newQuestionsList.length > 0 && (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {newQuestionsList.map((q, idx) => {
                      const isBeingEdited = editingDraftQIndex === idx;
                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            isBeingEdited
                              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <p className="font-bold text-slate-900 leading-snug">
                                <span className="inline-block w-5 h-5 bg-blue-700 text-white rounded-full text-center text-[11px] leading-5 font-bold mr-1.5">
                                  {idx + 1}
                                </span>
                                {q.question}
                              </p>

                              {/* Options preview with correct marked in emerald */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                <span
                                  className={`px-2 py-0.5 rounded font-mono truncate ${
                                    q.correctAnswer === 'a'
                                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                                      : 'text-slate-600 bg-white/70'
                                  }`}
                                >
                                  <strong>A:</strong> {q.optionA} {q.correctAnswer === 'a' && '✓'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded font-mono truncate ${
                                    q.correctAnswer === 'b'
                                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                                      : 'text-slate-600 bg-white/70'
                                  }`}
                                >
                                  <strong>B:</strong> {q.optionB} {q.correctAnswer === 'b' && '✓'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded font-mono truncate ${
                                    q.correctAnswer === 'c'
                                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                                      : 'text-slate-600 bg-white/70'
                                  }`}
                                >
                                  <strong>C:</strong> {q.optionC} {q.correctAnswer === 'c' && '✓'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded font-mono truncate ${
                                    q.correctAnswer === 'd'
                                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                                      : 'text-slate-600 bg-white/70'
                                  }`}
                                >
                                  <strong>D:</strong> {q.optionD} {q.correctAnswer === 'd' && '✓'}
                                </span>
                              </div>

                              {q.explanation && (
                                <p className="text-[10px] text-slate-500 italic">💡 {q.explanation}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleEditDraftQuestion(idx)}
                                className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1"
                                title="Edit Question"
                              >
                                <Edit3 className="w-3 h-3 text-blue-700" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionFromDraft(q.id)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Remove question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Active Question Composer Card ── */}
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-700" />
                      <span>
                        {editingDraftQIndex !== null
                          ? `Edit Question #${editingDraftQIndex + 1}`
                          : `Add Question #${newQuestionsList.length + 1}`}
                      </span>
                    </p>
                    <span className="text-[11px] text-blue-700 font-medium">
                      Select option radio to mark correct answer
                    </span>
                  </div>

                  {/* Question Statement */}
                  <div>
                    <label className="block font-semibold text-slate-800 text-[11px] mb-1">
                      Question Statement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={draftQText}
                      onChange={(e) => setDraftQText(e.target.value)}
                      placeholder="e.g. Which algorithm minimizes empirical loss function during cross-validation?"
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Options A, B, C, D Grid with Direct Correct Answer Selector */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800 text-[11px]">
                      Answer Options (Click A–D circle to designate the correct answer):
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Option A */}
                      <div
                        className={`flex items-center gap-2 p-1.5 bg-white border rounded-lg transition-colors ${
                          draftCorrect === 'a'
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40'
                            : 'border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftCorrect('a')}
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-transform ${
                            draftCorrect === 'a'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Click to mark A as Correct Answer"
                        >
                          A
                        </button>
                        <input
                          type="text"
                          value={draftOptA}
                          onChange={(e) => setDraftOptA(e.target.value)}
                          placeholder="Option A text..."
                          className="w-full bg-transparent text-xs focus:outline-none"
                        />
                        {draftCorrect === 'a' && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0 pr-1">Correct ✓</span>
                        )}
                      </div>

                      {/* Option B */}
                      <div
                        className={`flex items-center gap-2 p-1.5 bg-white border rounded-lg transition-colors ${
                          draftCorrect === 'b'
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40'
                            : 'border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftCorrect('b')}
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-transform ${
                            draftCorrect === 'b'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Click to mark B as Correct Answer"
                        >
                          B
                        </button>
                        <input
                          type="text"
                          value={draftOptB}
                          onChange={(e) => setDraftOptB(e.target.value)}
                          placeholder="Option B text..."
                          className="w-full bg-transparent text-xs focus:outline-none"
                        />
                        {draftCorrect === 'b' && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0 pr-1">Correct ✓</span>
                        )}
                      </div>

                      {/* Option C */}
                      <div
                        className={`flex items-center gap-2 p-1.5 bg-white border rounded-lg transition-colors ${
                          draftCorrect === 'c'
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40'
                            : 'border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftCorrect('c')}
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-transform ${
                            draftCorrect === 'c'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Click to mark C as Correct Answer"
                        >
                          C
                        </button>
                        <input
                          type="text"
                          value={draftOptC}
                          onChange={(e) => setDraftOptC(e.target.value)}
                          placeholder="Option C text..."
                          className="w-full bg-transparent text-xs focus:outline-none"
                        />
                        {draftCorrect === 'c' && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0 pr-1">Correct ✓</span>
                        )}
                      </div>

                      {/* Option D */}
                      <div
                        className={`flex items-center gap-2 p-1.5 bg-white border rounded-lg transition-colors ${
                          draftCorrect === 'd'
                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/40'
                            : 'border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftCorrect('d')}
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-transform ${
                            draftCorrect === 'd'
                              ? 'bg-emerald-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Click to mark D as Correct Answer"
                        >
                          D
                        </button>
                        <input
                          type="text"
                          value={draftOptD}
                          onChange={(e) => setDraftOptD(e.target.value)}
                          placeholder="Option D text..."
                          className="w-full bg-transparent text-xs focus:outline-none"
                        />
                        {draftCorrect === 'd' && (
                          <span className="text-[10px] text-emerald-700 font-bold shrink-0 pr-1">Correct ✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Explanation / Learning Hint */}
                  <div>
                    <label className="block font-semibold text-slate-800 text-[11px] mb-1">
                      Explanation / Learning Note (Displayed during Trainee review)
                    </label>
                    <input
                      type="text"
                      value={draftExplanation}
                      onChange={(e) => setDraftExplanation(e.target.value)}
                      placeholder="e.g. Standard benchmark verified in syllabus unit 3."
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Action Button: Add or Save Question */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddQuestionToDraft}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {editingDraftQIndex !== null
                          ? `Update Question #${editingDraftQIndex + 1}`
                          : '+ Add Question to Assessment'}
                      </span>
                    </button>
                    {editingDraftQIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEditDraft}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Publication Status Selector */}
              <div className="pt-3 border-t border-slate-200 bg-slate-50 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Initial Assessment Status:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      !assessPublishImmediately
                        ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-semibold ring-1 ring-amber-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assessPublishStatus"
                      checked={!assessPublishImmediately}
                      onChange={() => setAssessPublishImmediately(false)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-[11px] text-amber-900">Save as Draft (Recommended)</p>
                      <p className="text-[10px] text-slate-500">
                        Hidden from trainees until you review the question pool and click Publish.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      assessPublishImmediately
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assessPublishStatus"
                      checked={assessPublishImmediately}
                      onChange={() => setAssessPublishImmediately(true)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-[11px] text-emerald-900">Publish Immediately</p>
                      <p className="text-[10px] text-slate-500">
                        Assessment becomes active for enrolled trainees right away.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">
                  Total Questions:{' '}
                  <strong className="text-slate-900 font-mono">
                    {newQuestionsList.length +
                      (draftQText.trim() && draftOptA.trim() && draftOptB.trim() && editingDraftQIndex === null
                        ? 1
                        : 0)}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssessmentModal(false);
                      setAssessmentModalError(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      Save Assessment (
                      {newQuestionsList.length +
                        (draftQText.trim() && draftOptA.trim() && draftOptB.trim() && editingDraftQIndex === null
                          ? 1
                          : 0)}{' '}
                      Questions)
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: MANAGE QUESTIONS IN EXISTING QUESTIONNAIRE ─── */}
      {manageQuestionsAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Manage Questions: {manageQuestionsAssessment.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {manageQuestionsAssessment.questions.length} Questions Configured · Pass: {manageQuestionsAssessment.passingScorePercent}%
                </p>
              </div>
              <button onClick={() => setManageQuestionsAssessment(null)} className="text-white text-sm">✕</button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Question list */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Existing Question Pool ({manageQuestionsAssessment.questions.length})
                </h4>

                {manageQuestionsAssessment.questions.length === 0 ? (
                  <p className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                    No questions added yet. Add questions below.
                  </p>
                ) : (
                  manageQuestionsAssessment.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900 text-xs">
                          {idx + 1}. {q.question}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestionFromExisting(q.id)}
                          className="text-red-500 hover:text-red-700 px-2 py-0.5 rounded text-[11px] font-semibold hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div
                          className={`p-2 rounded border ${
                            q.correctAnswer === 'a'
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>A:</strong> {q.optionA}
                          {q.correctAnswer === 'a' && ' ✓ (Correct)'}
                        </div>
                        <div
                          className={`p-2 rounded border ${
                            q.correctAnswer === 'b'
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>B:</strong> {q.optionB}
                          {q.correctAnswer === 'b' && ' ✓ (Correct)'}
                        </div>
                        <div
                          className={`p-2 rounded border ${
                            q.correctAnswer === 'c'
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>C:</strong> {q.optionC}
                          {q.correctAnswer === 'c' && ' ✓ (Correct)'}
                        </div>
                        <div
                          className={`p-2 rounded border ${
                            q.correctAnswer === 'd'
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>D:</strong> {q.optionD}
                          {q.correctAnswer === 'd' && ' ✓ (Correct)'}
                        </div>
                      </div>

                      {q.explanation && (
                        <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                          💡 Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Question Form */}
              <form
                onSubmit={handleAddQuestionToExisting}
                className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3"
              >
                <h5 className="font-bold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-700" />
                  <span>Add New Question to this Assessment</span>
                </h5>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Question Statement</label>
                  <input
                    type="text"
                    required
                    value={manageQText}
                    onChange={(e) => setManageQText(e.target.value)}
                    placeholder="e.g. Which metric is used to evaluate binary classification accuracy?"
                    className="w-full p-2 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={manageOptA}
                    onChange={(e) => setManageOptA(e.target.value)}
                    placeholder="Option A"
                    className="p-1.5 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={manageOptB}
                    onChange={(e) => setManageOptB(e.target.value)}
                    placeholder="Option B"
                    className="p-1.5 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={manageOptC}
                    onChange={(e) => setManageOptC(e.target.value)}
                    placeholder="Option C"
                    className="p-1.5 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={manageOptD}
                    onChange={(e) => setManageOptD(e.target.value)}
                    placeholder="Option D"
                    className="p-1.5 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Correct Option:</span>
                    <select
                      value={manageCorrect}
                      onChange={(e) => setManageCorrect(e.target.value as any)}
                      className="p-1.5 bg-white border border-blue-200 rounded text-xs font-bold font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={manageExplanation}
                    onChange={(e) => setManageExplanation(e.target.value)}
                    placeholder="Explanation for trainees"
                    className="p-1.5 bg-white border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs transition-colors shadow-xs"
                >
                  Save Question to Assessment
                </button>
              </form>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setManageQuestionsAssessment(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT QUESTIONNAIRE METADATA ─────────────── */}
      {editingAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Questionnaire Parameters</h3>
              <button onClick={() => setEditingAssessment(null)} className="text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleEditAssessmentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={assessTitle}
                  onChange={(e) => setAssessTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={assessSubject}
                    onChange={(e) => setAssessSubject(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pass %</label>
                  <input
                    type="number"
                    value={assessPassScore}
                    onChange={(e) => setAssessPassScore(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time (mins)</label>
                  <input
                    type="number"
                    value={assessTimeMins}
                    onChange={(e) => setAssessTimeMins(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={assessDeadline}
                  onChange={(e) => setAssessDeadline(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={assessDescription}
                  onChange={(e) => setAssessDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAssessment(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: VIEW LIVE RESULTS FROM RESULTS TABLE ──────── */}
      {viewResultsAssessment && (() => {
        const assessmentSubmissions = assessmentResults.filter(
          (r) => r.assessmentId === viewResultsAssessment.id
        );
        const subCount = assessmentSubmissions.length;
        const passCount = assessmentSubmissions.filter((r) => r.passed).length;
        const passRate = subCount > 0 ? Math.round((passCount / subCount) * 100) : 0;
        const avgScore =
          subCount > 0
            ? Math.round(assessmentSubmissions.reduce((acc, curr) => acc + curr.scorePercent, 0) / subCount)
            : viewResultsAssessment.averageScore || 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white">{viewResultsAssessment.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Live Trainee Attempts & Evaluation Audit from Results Table
                  </p>
                </div>
                <button onClick={() => setViewResultsAssessment(null)} className="text-white text-sm">✕</button>
              </div>

              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Total Attempts</span>
                    <strong className="text-sm text-slate-900">{subCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Pass Rate</span>
                    <strong className="text-sm text-emerald-700">{passRate}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Average Score</span>
                    <strong className="text-sm text-blue-700">{avgScore}%</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Trainee Submissions ({subCount}):
                  </p>

                  {assessmentSubmissions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-1">
                      <HelpCircle className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700">No attempts submitted yet</p>
                      <p className="text-[11px] text-slate-400">
                        When trainees take this assessment, their scores, answers, and time taken will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {assessmentSubmissions.map((sub) => (
                        <div key={sub.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{sub.traineeName}</p>
                            <p className="text-[10px] text-slate-400">
                              {sub.submittedAt} · {sub.timeTakenMinutes} min · {sub.correctAnswersCount}/{sub.totalQuestions} correct
                            </p>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sub.scorePercent}% ({sub.passed ? 'PASSED' : 'FAILED'})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end shrink-0">
                  <button
                    onClick={() => setViewResultsAssessment(null)}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold text-xs"
                  >
                    Close Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
