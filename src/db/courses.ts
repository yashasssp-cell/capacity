import { db } from './index.ts';
import { courses } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getCourses() {
  try {
    return await db.select().from(courses);
  } catch (error) {
    console.error('Database query failed in getCourses:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getCourseById(id: number) {
  try {
    const list = await db.select().from(courses).where(eq(courses.id, id));
    return list[0] || null;
  } catch (error) {
    console.error('Database query failed in getCourseById:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createCourse(data: {
  courseCode: string;
  title: string;
  description: string;
  category: string;
  trainerId?: number;
  level: string;
  durationWeeks?: number;
  totalHours?: number;
  competencies?: string[];
}) {
  try {
    const inserted = await db
      .insert(courses)
      .values({
        courseCode: data.courseCode,
        title: data.title,
        description: data.description,
        category: data.category,
        trainerId: data.trainerId,
        level: data.level,
        durationWeeks: data.durationWeeks || 8,
        totalHours: data.totalHours || 40,
        competencies: data.competencies || [],
        status: 'active',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createCourse:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
