import { db } from './index.ts';
import { assessments, assessmentResults, courses } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getAssessments() {
  try {
    return await db
      .select({
        id: assessments.id,
        title: assessments.title,
        courseId: assessments.courseId,
        subject: assessments.subject,
        durationMin: assessments.durationMin,
        passingScore: assessments.passingScore,
        questions: assessments.questions,
        deadline: assessments.deadline,
        courseTitle: courses.title,
      })
      .from(assessments)
      .innerJoin(courses, eq(assessments.courseId, courses.id));
  } catch (error) {
    console.error('Database query failed in getAssessments:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createAssessment(data: {
  title: string;
  courseId: number;
  subject: string;
  durationMin?: number;
  passingScore?: number;
  questions: any[];
  deadline?: Date;
}) {
  try {
    const inserted = await db
      .insert(assessments)
      .values(data)
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createAssessment:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function submitAssessmentResult(data: {
  assessmentId: number;
  traineeId: number;
  traineeUid: string;
  score: number;
  passed: boolean;
  answers: any;
}) {
  try {
    const inserted = await db
      .insert(assessmentResults)
      .values(data)
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in submitAssessmentResult:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getResultsForTrainee(traineeUid: string) {
  try {
    return await db
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.traineeUid, traineeUid));
  } catch (error) {
    console.error('Database query failed in getResultsForTrainee:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
