import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight">
        404
      </h1>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">
        Page Not Found
      </h2>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
        The opportunity or page route you are looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Landing Page</span>
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
