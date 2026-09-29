import { db } from './index.ts';
import { trainerProfiles, users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getTrainerCompetencies() {
  try {
    return await db
      .select({
        id: trainerProfiles.id,
        userId: trainerProfiles.userId,
        userUid: trainerProfiles.userUid,
        specialization: trainerProfiles.specialization,
        qualifications: trainerProfiles.qualifications,
        experienceYears: trainerProfiles.experienceYears,
        competencyRatings: trainerProfiles.competencyRatings,
        bio: trainerProfiles.bio,
        trainerName: users.name,
        trainerEmail: users.email,
        organization: users.organization,
      })
      .from(trainerProfiles)
      .innerJoin(users, eq(trainerProfiles.userId, users.id));
  } catch (error) {
    console.error('Database query failed in getTrainerCompetencies:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateTrainerCompetencies(userUid: string, ratings: Record<string, number>) {
  try {
    const updated = await db
      .update(trainerProfiles)
      .set({ competencyRatings: ratings })
      .where(eq(trainerProfiles.userUid, userUid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateTrainerCompetencies:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
