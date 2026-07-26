import React from 'react';
import {
  FileText,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Code,
  Sparkles,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { ResumeItem } from '../../types';

interface ResumeCardProps {
  resume: ResumeItem;
  onView: (resume: ResumeItem) => void;
  onEdit: (resume: ResumeItem) => void;
  onDelete: (resume: ResumeItem) => void;
  onDuplicate: (resume: ResumeItem) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const formattedDate = React.useMemo(() => {
    const raw = resume.updatedAt || resume.createdAt;
    if (!raw) return 'Recently';
    try {
      const d = new Date(raw);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  }, [resume.updatedAt, resume.createdAt]);

  const skillCount = resume.skills?.length || 0;
  const projectCount = resume.projects?.length || 0;
  const experienceCount = resume.experience?.length || 0;
  const educationCount = resume.education?.length || 0;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-5 group">
      {/* Top Header & Title */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onView(resume)}
              title="View Resume Details"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(resume)}
              title="Edit Resume"
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(resume)}
              title="Duplicate Resume"
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(resume)}
              title="Delete Resume"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {resume.title}
            </h3>
            {resume.generatedByAI && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>AI Tailored</span>
              </span>
            )}
            {resume.isUploaded && (
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800 inline-flex items-center gap-1 shrink-0">
                <FileText className="w-3 h-3 text-teal-500" />
                <span>Uploaded {resume.fileType?.toUpperCase() || 'Document'}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{resume.fullName || 'No Name Provided'}</span>
          </div>
        </div>

        {/* Professional summary snippet if present */}
        {resume.professionalSummary && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {resume.professionalSummary}
          </p>
        )}
      </div>

      {/* Metrics Chips & Last Updated */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            {skillCount} {skillCount === 1 ? 'Skill' : 'Skills'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 flex items-center gap-1">
            <Code className="w-3 h-3 text-purple-500" />
            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
          </span>
          {experienceCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-emerald-500" />
              {experienceCount} Exp
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated {formattedDate}</span>
          </span>

          <button
            onClick={() => onView(resume)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
