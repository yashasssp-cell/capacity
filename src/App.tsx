import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CourseCatalog } from './components/courses/CourseCatalog';
import { ResourceLibrary } from './components/resources/ResourceLibrary';
import { CompetencyEngine } from './components/competency/CompetencyEngine';
import { TraineeDashboard } from './components/trainee/TraineeDashboard';
import { TrainerDashboard } from './components/trainer/TrainerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { CertificateModal } from './components/common/CertificateModal';

const MainLayout: React.FC = () => {
  const { activeTab, activeCertificate, setActiveCertificate } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'courses' && <CourseCatalog />}
        {activeTab === 'resources' && <ResourceLibrary />}
        {activeTab === 'competency-matrix' && <CompetencyEngine />}
        {activeTab === 'trainee-dashboard' && <TraineeDashboard />}
        {activeTab === 'trainer-dashboard' && <TrainerDashboard />}
        {activeTab === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal />
      <CertificateModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
