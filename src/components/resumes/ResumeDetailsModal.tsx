import React from 'react';
import {
  X,
  Pencil,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Sparkles,
  ExternalLink,
  Github,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { ResumeItem } from '../../types';

interface ResumeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeEdit: (resume: ResumeItem) => void;
  resume: ResumeItem | null;
}

export const ResumeDetailsModal: React.FC<ResumeDetailsModalProps> = ({
  isOpen,
  onClose,
  onResumeEdit,
  resume,
}) => {
  if (!isOpen || !resume) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {resume.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resume Overview & Structure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onResumeEdit(resume);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Content Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/30 dark:bg-slate-900/30">
          {/* Header Card (Name & Contact) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md space-y-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight">{resume.fullName || 'Anonymous Candidate'}</h1>
              <p className="text-xs text-blue-200/90 font-medium mt-0.5">{resume.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100/90 pt-2 border-t border-blue-800/60 font-medium">
              {resume.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-300" />
                  <span>{resume.email}</span>
                </span>
              )}
              {resume.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-300" />
                  <span>{resume.phone}</span>
                </span>
              )}
              {resume.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-300" />
                  <span>{resume.location}</span>
                </span>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {resume.professionalSummary && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Professional Summary</span>
              </h3>
              <p className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {resume.professionalSummary}
              </p>
            </div>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Work & Internship Experience</span>
              </h3>

              <div className="space-y-3">
                {resume.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {exp.position}
                        </h4>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Education</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resume.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {edu.institution}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {edu.startYear} – {edu.endYear}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </p>
                    {edu.grade && (
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Grade/GPA: {edu.grade}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Projects</span>
              </h3>

              <div className="space-y-3">
                {resume.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {proj.projectName}
                      </h4>

                      <div className="flex items-center gap-3 text-xs font-semibold">
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {proj.demoLink && (
                          <a
                            href={proj.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {proj.technologies && (
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        Tech Stack: {proj.technologies}
                      </p>
                    )}

                    {proj.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Skills & Expertise</span>
              </h3>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-2">
                {resume.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Certifications</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resume.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 space-y-1"
                  >
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {cert.certificateName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Issued by {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
