import React, { useState } from 'react';
import { AiAnalysisItem } from '../../types';
import { History, Eye, Trash2, Calendar, Award, ArrowUpRight } from 'lucide-react';

interface PreviousAnalysesListProps {
  analyses: AiAnalysisItem[];
  onSelect: (analysis: AiAnalysisItem) => void;
  onDelete: (analysisId: string) => void;
  activeAnalysisId?: string;
}

export const PreviousAnalysesList: React.FC<PreviousAnalysesListProps> = ({
  analyses,
  onSelect,
  onDelete,
  activeAnalysisId,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!analyses || analyses.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          No Previous AI Analyses
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Your saved evaluation reports will appear here so you can review match reports and cover letters anytime.
        </p>
      </div>
    );
  }

  const handleDeleteConfirm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this AI analysis?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Previous AI Analyses
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
            {analyses.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map((item) => {
          const isActive = activeAnalysisId === item.id;
          const score = item.fitScore || item.matchScore || 0;

          let badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900';
          if (score >= 85) {
            badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
          } else if (score >= 70) {
            badgeStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900';
          } else if (score >= 50) {
            badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900';
          }

          const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                isActive
                  ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                      {item.organization || 'Organization'}
                    </p>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.opportunityTitle || 'Opportunity Analysis'}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${badgeStyle}`}>
                    {score}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.matchSummary || item.summary || 'No summary available.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                    }}
                    className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title="Reopen Analysis"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteConfirm(item.id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Delete Analysis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
