export type UserRole = 'trainee' | 'trainer' | 'admin';
export type UserStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  organization?: string;
  designation?: string;
  joinedAt: string;
  bio?: string;
}

export interface TraineeProfile {
  userId: string;
  qualification: string;
  experienceYears: number;
  experienceDetails: string;
  interests: string[];
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Expert' }[];
  currentRole: string;
  department: string;
}

export interface TrainerProfile {
  userId: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  rating: number;
  coursesAuthored: number;
  studentsTrained: number;
  competencies: Record<string, number>; // 1 to 5 scale
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  totalHours: number;
  trainerId: string;
  trainerName: string;
  trainerRole?: string;
  status: 'active' | 'draft' | 'archived';
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  coverAccent: string;
  competenciesTargeted: string[];
  modulesCount: number;
  featured?: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'video' | 'pdf' | 'presentation' | 'material';
  duration: string;
  contentUrl?: string;
  description: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Enrollment {
  id: string;
  traineeId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedLessonIds: string[];
  lastAccessedAt: string;
  status: 'in_progress' | 'completed';
}

export interface ResourceItem {
  id: string;
  courseId?: string;
  courseTitle?: string;
  trainerId: string;
  trainerName: string;
  title: string;
  category: string;
  type: 'video' | 'ppt' | 'pdf' | 'material';
  fileSize: string;
  downloadUrl: string;
  downloadCount: number;
  uploadedAt: string;
  description: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  subject: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  deadline: string;
  createdByTrainerId: string;
  createdByName: string;
  status?: 'draft' | 'published';
  questions: AssessmentQuestion[];
  totalAttempts?: number;
  averageScore?: number;
}

export interface AssessmentResult {
  id: string;
  traineeId: string;
  traineeName: string;
  assessmentId: string;
  assessmentTitle: string;
  courseId: string;
  courseTitle: string;
  scorePercent: number;
  totalQuestions: number;
  correctAnswersCount: number;
  passed: boolean;
  submittedAt: string;
  timeTakenMinutes: number;
  userAnswers: Record<string, 'a' | 'b' | 'c' | 'd'>;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseTitle: string;
  trainerName: string;
  issueDate: string;
  grade: 'A+' | 'A' | 'B' | 'Honors';
  scorePercent: number;
  verificationCode: string;
}

export interface CourseFeedback {
  id: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  comments: string;
  submittedAt: string;
}

export interface CompetencyDefinition {
  id: string;
  name: string;
  subject: string;
  category: string;
  description: string;
}

export interface SubjectRequirement {
  id: string;
  subject: string;
  title: string;
  description: string;
  targetCompetencies: {
    competencyName: string;
    minimumLevel: number;
    weight: number; // 1 to 5
  }[];
}

export interface TrainerMatchResult {
  trainerId: string;
  trainerName: string;
  specialization: string;
  experienceYears: number;
  overallSuitabilityPercent: number;
  competencyBreakdown: {
    competencyName: string;
    requiredLevel: number;
    trainerLevel: number;
    status: 'meets' | 'exceeds' | 'lacks';
  }[];
  suitabilityGrade: 'Highly Recommended' | 'Suitable' | 'Marginal';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'resource' | 'achievement' | 'deadline';
  author: string;
  publishedAt: string;
  pinned: boolean;
}

export interface SystemNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'enrollment' | 'assessment' | 'approval' | 'system' | 'course';
  read: boolean;
  timestamp: string;
}
