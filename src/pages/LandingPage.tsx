import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Briefcase,
  Award,
  Code2,
  Globe2,
  Sparkles,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const opportunityCategories = [
    { name: 'Internships', icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
    { name: 'Scholarships', icon: Award, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
    { name: 'Hackathons', icon: Code2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
    { name: 'Fellowships', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
    { name: 'Competitions', icon: Zap, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
    { name: 'Grad Programs', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
    { name: 'Job Applications', icon: Globe2, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60' },
  ];

  const features = [
    {
      title: 'Unified Opportunity Tracker',
      desc: 'Keep track of application deadlines, interview dates, offer status, and custom notes in one central dashboard.',
      icon: Layers,
    },
    {
      title: 'Structured Resume Library',
      desc: 'Organize target resumes for different domains—software engineering, research, design, and scholarships.',
      icon: FileText,
    },
    {
      title: 'AI Smart Insights (Gemini)',
      desc: 'Get automated match analysis, skill gap summaries, and application recommendations powered by Gemini AI.',
      icon: Sparkles,
    },
    {
      title: 'Firebase Realtime Security',
      desc: 'Your data is securely authenticated with Firebase and persisted using Cloud Firestore collections.',
      icon: ShieldCheck,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Sign Up Your Account',
      desc: 'Create your secure profile using email and password to access your personalized student dashboard.',
    },
    {
      num: '02',
      title: 'Log Opportunities',
      desc: 'Add deadlines, URLs, award details, and notes for internships, hackathons, scholarships, and jobs.',
    },
    {
      num: '03',
      title: 'Attach Resumes & AI Insights',
      desc: 'Prepare target resume versions and analyze job descriptions with AI assistant capabilities.',
    },
    {
      num: '04',
      title: 'Monitor & Secure Offers',
      desc: 'Stay ahead of upcoming deadlines and track interview stages to land your ideal offers.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              Track<span className="text-blue-600 dark:text-blue-400">Folio</span>{' '}
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                AI
              </span>
            </span>
          </Link>

          {/* Action Buttons & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Built for University Students & Graduates</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Track Every Opportunity.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Never Miss Your Future.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Track internships, scholarships, hackathons, jobs, and more in one place. Organize applications, monitor deadlines, and prepare smarter with AI.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-base transition-all shadow-xs"
            >
              Login
            </Link>
          </div>

          {/* Supported Opportunity Category Pills */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
              Organize 7 Key Opportunity Categories in One Workspace
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {opportunityCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className={`p-1 rounded-md ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Powerful Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              Designed for High-Achieving Students
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
              Stop juggling chaotic spreadsheets and scattered notes. TrackFolio AI gives you clean structure and actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Step-by-Step Guidance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              How TrackFolio AI Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
              Four simple steps to streamline your career journey and academic applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col">
                <div className="text-4xl font-black text-blue-600/30 dark:text-blue-500/20 mb-3">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                TrackFolio AI
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Empowering university students worldwide.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>Powered by Firebase & Cloud Firestore</span>
            <span>•</span>
            <span>Gemini AI Ready</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} TrackFolio AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
