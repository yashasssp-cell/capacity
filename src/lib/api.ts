import { auth } from './firebase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.warn('Could not attach Firebase auth token:', err);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', database: 'Disconnected' };
    }
  },

  // Auth sync
  syncUser: async (user: {
    uid: string;
    email: string;
    name: string;
    role?: string;
    organization?: string;
    designation?: string;
  }) => {
    const res = await fetchWithAuth('/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return await res.json();
  },

  // Courses
  getCourses: async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to load courses');
      return await res.json();
    } catch (e) {
      console.warn('Backend getCourses failed, using fallback:', e);
      return null;
    }
  },

  // Enrollments
  getEnrollments: async (traineeUid?: string) => {
    try {
      const url = traineeUid ? `/api/enrollments?traineeUid=${encodeURIComponent(traineeUid)}` : '/api/enrollments';
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error('Failed to load enrollments');
      return await res.json();
    } catch (e) {
      console.warn('Backend getEnrollments failed, using fallback:', e);
      return null;
    }
  },

  enroll: async (data: { traineeUid: string; traineeId?: number; courseId: number }) => {
    const res = await fetchWithAuth('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  updateProgress: async (id: number, progress: number, completedModules?: string[]) => {
    const res = await fetchWithAuth(`/api/enrollments/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress, completedModules }),
    });
    return await res.json();
  },

  // Resources
  getResources: async () => {
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to load resources');
      return await res.json();
    } catch (e) {
      console.warn('Backend getResources failed, using fallback:', e);
      return null;
    }
  },

  // Assessments
  getAssessments: async () => {
    try {
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error('Failed to load assessments');
      return await res.json();
    } catch (e) {
      console.warn('Backend getAssessments failed, using fallback:', e);
      return null;
    }
  },

  submitAssessment: async (assessmentId: number, data: {
    traineeId?: number;
    traineeUid: string;
    score: number;
    passed: boolean;
    answers: any;
  }) => {
    const res = await fetchWithAuth(`/api/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // Certificates
  getCertificates: async (traineeUid?: string) => {
    try {
      const url = traineeUid ? `/api/certificates?traineeUid=${encodeURIComponent(traineeUid)}` : '/api/certificates';
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error('Failed to load certificates');
      return await res.json();
    } catch (e) {
      console.warn('Backend getCertificates failed, using fallback:', e);
      return null;
    }
  },

  verifyCertificate: async (code: string) => {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(code)}`);
    return await res.json();
  },

  // Competencies
  getCompetencies: async () => {
    try {
      const res = await fetch('/api/competencies');
      if (!res.ok) throw new Error('Failed to load competencies');
      return await res.json();
    } catch (e) {
      console.warn('Backend getCompetencies failed, using fallback:', e);
      return null;
    }
  },

  updateTrainerCompetency: async (userUid: string, ratings: Record<string, number>) => {
    const res = await fetchWithAuth(`/api/competencies/${encodeURIComponent(userUid)}`, {
      method: 'POST',
      body: JSON.stringify({ ratings }),
    });
    return await res.json();
  },

  // Users
  getUsers: async () => {
    try {
      const res = await fetchWithAuth('/api/users');
      if (!res.ok) throw new Error('Failed to load users');
      return await res.json();
    } catch (e) {
      console.warn('Backend getUsers failed, using fallback:', e);
      return null;
    }
  },

  updateUserStatus: async (uid: string, data: { role?: string; status?: string }) => {
    const res = await fetchWithAuth(`/api/users/${encodeURIComponent(uid)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return await res.json();
  },
};
