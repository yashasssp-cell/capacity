import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { getUsers, getUserByUid, getOrCreateUser, updateUserRoleOrStatus } from './src/db/users.ts';
import { getCourses, createCourse } from './src/db/courses.ts';
import { getEnrollments, enrollTrainee, updateEnrollmentProgress } from './src/db/enrollments.ts';
import { getResources, createResource, deleteResource } from './src/db/resources.ts';
import { getAssessments, createAssessment, submitAssessmentResult, getResultsForTrainee } from './src/db/assessments.ts';
import { getCertificates, verifyCertificate } from './src/db/certificates.ts';
import { getTrainerCompetencies, updateTrainerCompetencies } from './src/db/competencies.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes
// 1. Health check & status
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const userList = await getUsers();
    res.json({
      status: 'healthy',
      database: 'Cloud SQL PostgreSQL Connected',
      activeUsers: userList.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// 2. Auth sync & profile
app.get('/api/auth/me', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.json({ authenticated: false, user: null });
    }
    const user = await getUserByUid(req.user.uid);
    res.json({ authenticated: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/sync', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { uid, email, name, role, organization, designation } = req.body;
    const targetUid = req.user?.uid || uid;
    const targetEmail = req.user?.email || email;

    if (!targetUid || !targetEmail) {
      return res.status(400).json({ error: 'Missing UID or email for user synchronization' });
    }

    const user = await getOrCreateUser({
      uid: targetUid,
      email: targetEmail,
      name: name || targetEmail.split('@')[0],
      role: role || 'trainee',
      organization,
      designation,
    });

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Users Management (Admin)
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const userList = await getUsers();
    res.json(userList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { role, status } = req.body;
    const updated = await updateUserRoleOrStatus(uid, { role, status });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Courses
app.get('/api/courses', async (_req: Request, res: Response) => {
  try {
    const courseList = await getCourses();
    res.json(courseList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', async (req: Request, res: Response) => {
  try {
    const course = await createCourse(req.body);
    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Enrollments
app.get('/api/enrollments', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const traineeUid = req.query.traineeUid as string || req.user?.uid;
    const list = await getEnrollments(traineeUid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/enrollments', async (req: Request, res: Response) => {
  try {
    const { traineeUid, traineeId, courseId } = req.body;
    const enrollment = await enrollTrainee(traineeUid, traineeId || 1, courseId);
    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/enrollments/:id/progress', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { progress, completedModules } = req.body;
    const updated = await updateEnrollmentProgress(id, progress, completedModules);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Resources (Learning Library)
app.get('/api/resources', async (_req: Request, res: Response) => {
  try {
    const list = await getResources();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources', async (req: Request, res: Response) => {
  try {
    const item = await createResource(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/resources/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteResource(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Assessments
app.get('/api/assessments', async (_req: Request, res: Response) => {
  try {
    const list = await getAssessments();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assessments', async (req: Request, res: Response) => {
  try {
    const { title, courseId, subject, durationMin, passingScore, questions, deadline } = req.body;
    let parsedDeadline: Date | undefined = undefined;
    if (deadline && typeof deadline === 'string' && !isNaN(Date.parse(deadline))) {
      parsedDeadline = new Date(deadline);
    }
    const newAssessment = await createAssessment({
      title,
      courseId: courseId || 1,
      subject: subject || 'General',
      durationMin: durationMin || 30,
      passingScore: passingScore || 70,
      questions: questions || [],
      deadline: parsedDeadline,
    });
    res.status(201).json(newAssessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assessments/:id/submit', async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id, 10);
    const { traineeId, traineeUid, score, passed, answers } = req.body;
    const result = await submitAssessmentResult({
      assessmentId,
      traineeId: traineeId || 1,
      traineeUid: traineeUid || 'trainee-uid-1',
      score,
      passed,
      answers,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Certificates
app.get('/api/certificates', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const traineeUid = req.query.traineeUid as string || req.user?.uid;
    const list = await getCertificates(traineeUid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/certificates/verify/:code', async (req: Request, res: Response) => {
  try {
    const cert = await verifyCertificate(req.params.code);
    if (!cert) {
      return res.status(404).json({ verified: false, message: 'Invalid or revoked certificate code' });
    }
    res.json({ verified: true, certificate: cert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Competencies & Trainer Matching
app.get('/api/competencies', async (_req: Request, res: Response) => {
  try {
    const competencies = await getTrainerCompetencies();
    res.json(competencies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/competencies/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { ratings } = req.body;
    const updated = await updateTrainerCompetencies(uid, ratings);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Capacity Connect Backend listening on port ${PORT}`);
  });
}

startServer();
