import React from 'react';
import { Target, Award, Sparkles, AlertTriangle } from 'lucide-react';

interface FitScoreCardProps {
  score: number;
}

export const FitScoreCard: React.FC<FitScoreCardProps> = ({ score }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  let label = 'Needs Improvement';
  let badgeColor = 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900';
  let strokeColor = '#f43f5e'; // rose-500
  let Icon = AlertTriangle;

  if (normalizedScore >= 85) {
    label = 'Excellent Match';
    badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    strokeColor = '#10b981'; // emerald-500
    Icon = Award;
  } else if (normalizedScore >= 70) {
    label = 'Good Match';
    badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    strokeColor = '#3b82f6'; // blue-500
    Icon = Sparkles;
  } else if (normalizedScore >= 50) {
    label = 'Average Match';
    badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    strokeColor = '#f59e0b'; // amber-500
    Icon = Target;
  }

  // Circle SVG math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Circular Progress Meter */}
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {normalizedScore}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Fit Score
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-center sm:text-left flex-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeColor}">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Application Relevance Score
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Based on direct semantic analysis of your qualifications, project history, and technical competencies against the opportunity requirements.
        </p>
      </div>
    </div>
  );
};
