import { db } from './index.ts';
import { users, trainerProfiles } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed in getUsers:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const records = await db.select().from(users).where(eq(users.uid, uid));
    return records[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getOrCreateUser(params: {
  uid: string;
  email: string;
  name: string;
  role?: string;
  organization?: string;
  designation?: string;
}) {
  try {
    const existing = await getUserByUid(params.uid);
    if (existing) {
      return existing;
    }

    const inserted = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: params.email,
        name: params.name || params.email.split('@')[0],
        role: params.role || 'trainee',
        status: 'approved',
        organization: params.organization || 'Public Sector Organization',
        designation: params.designation || 'Civil Officer',
      })
      .returning();

    // If trainer, also initialize a trainer profile
    if (params.role === 'trainer') {
      await db.insert(trainerProfiles).values({
        userId: inserted[0].id,
        userUid: inserted[0].uid,
        specialization: 'Institutional Trainer',
        qualifications: 'Accredited Faculty',
        experienceYears: 5,
        competencyRatings: { python: 4, statistics: 4, ml: 4, sql: 4, ai: 4, cloud: 4 },
        bio: 'Accredited Capacity Connect Instructor',
      });
    }

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserRoleOrStatus(uid: string, updates: { role?: string; status?: string }) {
  try {
    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.uid, uid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateUserRoleOrStatus:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
