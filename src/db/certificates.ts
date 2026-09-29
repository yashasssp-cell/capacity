import { db } from './index.ts';
import { certificates, courses } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getCertificates(traineeUid?: string) {
  try {
    if (traineeUid) {
      return await db
        .select({
          id: certificates.id,
          certificateNumber: certificates.certificateNumber,
          traineeId: certificates.traineeId,
          traineeUid: certificates.traineeUid,
          courseId: certificates.courseId,
          verificationCode: certificates.verificationCode,
          sha256Digest: certificates.sha256Digest,
          grade: certificates.grade,
          issuedAt: certificates.issuedAt,
          courseTitle: courses.title,
        })
        .from(certificates)
        .innerJoin(courses, eq(certificates.courseId, courses.id))
        .where(eq(certificates.traineeUid, traineeUid));
    }

    return await db.select().from(certificates);
  } catch (error) {
    console.error('Database query failed in getCertificates:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function verifyCertificate(code: string) {
  try {
    const records = await db
      .select({
        id: certificates.id,
        certificateNumber: certificates.certificateNumber,
        verificationCode: certificates.verificationCode,
        sha256Digest: certificates.sha256Digest,
        grade: certificates.grade,
        issuedAt: certificates.issuedAt,
        courseTitle: courses.title,
      })
      .from(certificates)
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.verificationCode, code));

    return records[0] || null;
  } catch (error) {
    console.error('Database query failed in verifyCertificate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
