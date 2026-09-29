import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table (Central Identity synced with Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('trainee'), // 'trainee' | 'trainer' | 'admin'
  status: text('status').notNull().default('approved'), // 'pending' | 'approved' | 'rejected'
  organization: text('organization'),
  designation: text('designation'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Trainer Profiles
export const trainerProfiles = pgTable('trainer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull(),
  specialization: text('specialization'),
  qualifications: text('qualifications'),
  experienceYears: integer('experience_years').default(0),
  competencyRatings: jsonb('competency_ratings').default('{}'), // e.g. { python: 5, statistics: 4, ml: 5, sql: 3, ai: 5, cloud: 4 }
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Courses Registry
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  courseCode: text('course_code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  trainerId: integer('trainer_id').references(() => users.id),
  level: text('level').notNull().default('Beginner'),
  durationWeeks: integer('duration_weeks').default(8),
  totalHours: integer('total_hours').default(40),
  competencies: jsonb('competencies').default('[]'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Enrollments
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  traineeId: integer('trainee_id').references(() => users.id, { onDelete: 'cascade' }),
  traineeUid: text('trainee_uid').notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  progress: integer('progress').default(0),
  status: text('status').default('in_progress'), // 'in_progress' | 'completed'
  completedModules: jsonb('completed_modules').default('[]'),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
});

// 5. Learning Resources Storage Catalog
export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'video' | 'pdf' | 'ppt' | 'material'
  category: text('category').notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  trainerId: integer('trainer_id').references(() => users.id),
  storageUrl: text('storage_url').notNull(),
  fileSize: text('file_size'),
  format: text('format'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Assessments
export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  durationMin: integer('duration_min').default(30),
  passingScore: integer('passing_score').default(70),
  questions: jsonb('questions').notNull(), // Array of { id, text, options, correctAnswerIndex }
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Assessment Results
export const assessmentResults = pgTable('assessment_results', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }),
  traineeId: integer('trainee_id').references(() => users.id, { onDelete: 'cascade' }),
  traineeUid: text('trainee_uid').notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  answers: jsonb('answers').default('{}'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

// 8. Certificates Ledger
export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  certificateNumber: text('certificate_number').notNull().unique(),
  traineeId: integer('trainee_id').references(() => users.id, { onDelete: 'cascade' }),
  traineeUid: text('trainee_uid').notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  verificationCode: text('verification_code').notNull().unique(),
  sha256Digest: text('sha256_digest').notNull(),
  grade: text('grade').default('Distinction'),
  issuedAt: timestamp('issued_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  enrollments: many(enrollments),
  authoredCourses: many(courses),
  authoredResources: many(resources),
  results: many(assessmentResults),
  certificates: many(certificates),
  trainerProfile: one(trainerProfiles, {
    fields: [users.id],
    references: [trainerProfiles.userId],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  trainer: one(users, {
    fields: [courses.trainerId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  assessments: many(assessments),
  resources: many(resources),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  trainee: one(users, {
    fields: [enrollments.traineeId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  results: many(assessmentResults),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  trainee: one(users, {
    fields: [certificates.traineeId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));
