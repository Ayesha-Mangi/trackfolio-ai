import React, { useState } from 'react';
import { HelpCircle, Copy, Check, MessageSquareCode, UserCheck, ShieldCheck } from 'lucide-react';

interface InterviewQuestionsCardProps {
  questions: string[];
}

export const InterviewQuestionsCard: React.FC<InterviewQuestionsCardProps> = ({ questions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopySingle = (q: string, idx: number) => {
    navigator.clipboard.writeText(q);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!questions || questions.length === 0) return;
    const formatted = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Helper to categorize questions automatically for visual appeal
  const getCategory = (q: string, index: number) => {
    const qLower = q.toLowerCase();
    if (
      qLower.includes('technical') ||
      qLower.includes('code') ||
      qLower.includes('system') ||
      qLower.includes('algorithm') ||
      qLower.includes('project') ||
      qLower.includes('architecture') ||
      qLower.includes('database') ||
      qLower.includes('framework') ||
      index % 3 === 0
    ) {
      return { label: 'Technical', bg: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900', icon: MessageSquareCode };
    }
    if (
      qLower.includes('tell me about a time') ||
      qLower.includes('conflict') ||
      qLower.includes('team') ||
      qLower.includes('challenge') ||
      qLower.includes('failure') ||
      qLower.includes('leader') ||
      index % 3 === 1
    ) {
      return { label: 'Behavioral', bg: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900', icon: UserCheck };
    }
    return { label: 'General HR', bg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900', icon: ShieldCheck };
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Targeted Interview Questions ({questions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice questions tailored to the candidate's background and this role
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>All Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Questions</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {questions.map((q, idx) => {
          const category = getCategory(q, idx);
          const CatIcon = category.icon;
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-800/80 transition-all space-y-2.5 group relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                    #{idx + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${category.bg}`}>
                    <CatIcon className="w-3 h-3" />
                    <span>{category.label}</span>
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleCopySingle(q, idx)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
