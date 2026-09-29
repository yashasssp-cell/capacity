import { db } from './index.ts';
import { enrollments, courses } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getEnrollments(traineeUid?: string) {
  try {
    if (traineeUid) {
      return await db
        .select({
          id: enrollments.id,
          traineeId: enrollments.traineeId,
          traineeUid: enrollments.traineeUid,
          courseId: enrollments.courseId,
          progress: enrollments.progress,
          status: enrollments.status,
          completedModules: enrollments.completedModules,
          enrolledAt: enrollments.enrolledAt,
          courseTitle: courses.title,
          courseCode: courses.courseCode,
          category: courses.category,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.traineeUid, traineeUid));
    }

    return await db.select().from(enrollments);
  } catch (error) {
    console.error('Database query failed in getEnrollments:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function enrollTrainee(traineeUid: string, traineeId: number, courseId: number) {
  try {
    const existing = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.traineeUid, traineeUid), eq(enrollments.courseId, courseId)));

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(enrollments)
      .values({
        traineeId,
        traineeUid,
        courseId,
        progress: 0,
        status: 'in_progress',
        completedModules: [],
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in enrollTrainee:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateEnrollmentProgress(id: number, progress: number, completedModules?: string[]) {
  try {
    const status = progress >= 100 ? 'completed' : 'in_progress';
    const updated = await db
      .update(enrollments)
      .set({
        progress,
        status,
        ...(completedModules ? { completedModules } : {}),
      })
      .where(eq(enrollments.id, id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateEnrollmentProgress:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
