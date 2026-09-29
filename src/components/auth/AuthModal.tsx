import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building, Briefcase, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    loginAsDemoUser,
    signInWithGoogle,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('trainee');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      await signInWithGoogle(role);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authModalMode === 'login') {
      const ok = login(email, role);
      if (!ok) {
        setErrorMessage('User not found. Try one-click demo login below or create an account.');
      }
    } else if (authModalMode === 'signup') {
      if (!name || !email) {
        setErrorMessage('Please fill in your name and email address.');
        return;
      }
      signup({
        name,
        email,
        role,
        organization,
        designation,
      });
    } else if (authModalMode === 'forgot') {
      if (!email) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      setForgotSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-lg font-bold">
              {authModalMode === 'login' && 'Sign In to Capacity Connect'}
              {authModalMode === 'signup' && 'Create Capacity Connect Account'}
              {authModalMode === 'forgot' && 'Reset Account Password'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connecting People • Building Competencies
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
                authModalMode === 'login'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors border-b-2 ${
                authModalMode === 'signup'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {authModalMode === 'forgot' ? (
            <div>
              {forgotSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Instructions Sent</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    A secure password reset link has been dispatched to <strong className="text-slate-900">{email}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setForgotSubmitted(false);
                      setAuthModalMode('login');
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Enter your official email. We will dispatch a password recovery link to your inbox.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="officer@organization.gov"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-1"
                  >
                    Cancel and return to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}
                  </span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2.5 text-slate-400 font-semibold">Or use email & password</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              {/* If Signup: Name, Org, Designation */}
              {authModalMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. / Officer / Specialist Name"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Role Selection</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('trainee')}
                        className={`py-2 px-2 text-center text-xs rounded-lg border transition-all ${
                          role === 'trainee'
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        👨🎓 Trainee
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('trainer')}
                        className={`py-2 px-2 text-center text-xs rounded-lg border transition-all ${
                          role === 'trainer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        👨🏫 Trainer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`py-2 px-2 text-center text-xs rounded-lg border transition-all ${
                          role === 'admin'
                            ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🛡️ Admin
                      </button>
                    </div>
                    {role !== 'trainee' && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                        Notice: Trainer and Admin registrations require manual Directorate approval before dashboard privileges unlock.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Organization</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Ministry / Enterprise"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Position Title"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work / Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@capacityconnect.org"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot')}
                      className="text-[11px] text-blue-600 hover:text-blue-800"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{authModalMode === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            </div>
          )}

          {/* Instant One-Click Demo Personas */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] text-slate-500 font-semibold mb-2.5 text-center">
              Testing Mode: Instant Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemoUser('trainee')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-700">Trainee</p>
                <p className="text-[10px] text-slate-500 truncate">Rahul Anand</p>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoUser('trainer')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg transition-all group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-800">Trainer</p>
                <p className="text-[10px] text-slate-500 truncate">Dr. Rajesh V.</p>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoUser('admin')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg transition-all group"
              >
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-amber-700">Admin</p>
                <p className="text-[10px] text-slate-500 truncate">Dr. Arvind S.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
