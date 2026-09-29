import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { resources } from './schema.ts';

export async function getResources() {
  try {
    return await db.select().from(resources);
  } catch (error) {
    console.error('Database query failed in getResources:', error);
    return [];
  }
}

export async function createResource(data: {
  title: string;
  type: string;
  category: string;
  courseId?: number | string | null;
  trainerId?: number | string | null;
  storageUrl: string;
  fileSize?: string;
  format?: string;
  description?: string;
}) {
  try {
    const parsedCourseId =
      data.courseId !== undefined && data.courseId !== null && !isNaN(Number(data.courseId))
        ? Number(data.courseId)
        : null;

    const parsedTrainerId =
      data.trainerId !== undefined && data.trainerId !== null && !isNaN(Number(data.trainerId))
        ? Number(data.trainerId)
        : null;

    const inserted = await db
      .insert(resources)
      .values({
        title: data.title,
        type: data.type,
        category: data.category || 'General',
        courseId: parsedCourseId,
        trainerId: parsedTrainerId,
        storageUrl: data.storageUrl,
        fileSize: data.fileSize || '1.0 MB',
        format: data.format || data.type,
        description: data.description || '',
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createResource:', error);
    throw new Error('Database query failed in createResource', { cause: error });
  }
}

export async function deleteResource(id: number | string) {
  try {
    const numId = Number(id);
    if (isNaN(numId)) return false;
    await db.delete(resources).where(eq(resources.id, numId));
    return true;
  } catch (error) {
    console.error('Database query failed in deleteResource:', error);
    return false;
  }
}

