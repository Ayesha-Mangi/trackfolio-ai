import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ResumeItem, OptimizedResumeData } from '../../types';
import {
  FileCheck,
  Copy,
  Check,
  Download,
  FileText,
  Save,
  RefreshCw,
  Sparkles,
  Columns,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
} from 'lucide-react';

interface ResumeComparisonCardProps {
  original: ResumeItem;
  optimized: OptimizedResumeData;
  onSaveAsNewResume: (optimized: OptimizedResumeData) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  isSavedAsNew?: boolean;
}

export const ResumeComparisonCard: React.FC<ResumeComparisonCardProps> = ({
  original,
  optimized,
  onSaveAsNewResume,
  onRegenerate,
  isRegenerating = false,
  isSavedAsNew = false,
}) => {
  const [activeView, setActiveView] = useState<'comparison' | 'preview'>('comparison');
  const [copied, setCopied] = useState(false);

  // Copy full plain text resume
  const handleCopyResume = () => {
    const text = `
${optimized.fullName}
${[optimized.email, optimized.phone, optimized.location].filter(Boolean).join(' | ')}

PROFESSIONAL SUMMARY
${optimized.professionalSummary}

SKILLS
${optimized.skills.join(', ')}

WORK EXPERIENCE
${optimized.experience
  .map(
    (exp) => `
${exp.position} - ${exp.company} (${exp.startDate} - ${exp.endDate})
${exp.description}
`
  )
  .join('\n')}

PROJECTS
${optimized.projects
  .map(
    (proj) => `
${proj.projectName} | Technologies: ${proj.technologies}
${proj.description}
${proj.githubLink ? `GitHub: ${proj.githubLink}` : ''}
`
  )
  .join('\n')}

EDUCATION
${optimized.education
  .map(
    (edu) => `
${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startYear} - ${edu.endYear})
`
  )
  .join('\n')}

CERTIFICATIONS
${optimized.certifications
  .map((cert) => `${cert.certificateName} - ${cert.issuer} (${cert.year})`)
  .join('\n')}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download DOCX
  const handleDownloadDocx = () => {
    const contentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${optimized.title || 'Optimized Resume'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 24pt; color: #1e293b; line-height: 1.5; }
        h1 { font-size: 20pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2pt; color: #0f172a; }
        .contact-info { font-size: 9.5pt; color: #475569; margin-bottom: 14pt; border-bottom: 1.5pt solid #4f46e5; padding-bottom: 4pt; }
        h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 14pt; margin-bottom: 6pt; color: #4338ca; border-bottom: 1pt solid #cbd5e1; padding-bottom: 2pt; }
        p { font-size: 10pt; margin-top: 2pt; margin-bottom: 4pt; color: #334155; }
        .item-header { font-weight: bold; font-size: 10.5pt; color: #0f172a; }
        .item-sub { font-style: italic; color: #64748b; font-size: 9pt; margin-bottom: 3pt; }
      </style>
      </head>
      <body>
        <h1>${optimized.fullName}</h1>
        <div class="contact-info">${[optimized.email, optimized.phone, optimized.location].filter(Boolean).join(' | ')}</div>

        <h2>Professional Summary</h2>
        <p>${optimized.professionalSummary}</p>

        ${
          optimized.skills && optimized.skills.length > 0
            ? `
          <h2>Technical & Core Skills</h2>
          <p>${optimized.skills.join(', ')}</p>
        `
            : ''
        }

        ${
          optimized.experience && optimized.experience.length > 0
            ? `
          <h2>Work Experience</h2>
          ${optimized.experience
            .map(
              (exp) => `
            <div class="item-header">${exp.position} — ${exp.company}</div>
            <div class="item-sub">${exp.startDate} - ${exp.endDate}</div>
            <p>${exp.description}</p>
          `
            )
            .join('')}
        `
            : ''
        }

        ${
          optimized.projects && optimized.projects.length > 0
            ? `
          <h2>Projects</h2>
          ${optimized.projects
            .map(
              (proj) => `
            <div class="item-header">${proj.projectName}</div>
            <div class="item-sub">Technologies: ${proj.technologies}</div>
            <p>${proj.description}</p>
          `
            )
            .join('')}
        `
            : ''
        }

        ${
          optimized.education && optimized.education.length > 0
            ? `
          <h2>Education</h2>
          ${optimized.education
            .map(
              (edu) => `
            <div class="item-header">${edu.degree} in ${edu.fieldOfStudy}</div>
            <div class="item-sub">${edu.institution} | ${edu.startYear} - ${edu.endYear} ${edu.grade ? `| GPA: ${edu.grade}` : ''}</div>
          `
            )
            .join('')}
        `
            : ''
        }

        ${
          optimized.certifications && optimized.certifications.length > 0
            ? `
          <h2>Certifications</h2>
          ${optimized.certifications
            .map((cert) => `<p><strong>${cert.certificateName}</strong> — ${cert.issuer} (${cert.year})</p>`)
            .join('')}
        `
            : ''
        }
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', contentHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(optimized.fullName || 'Resume').replace(/\s+/g, '_')}_AI_Optimized.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download PDF using jsPDF
  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 45;
      const contentWidth = pageWidth - margin * 2;
      let y = 45;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Header: Candidate Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // #0f172a
      const nameText = (optimized.fullName || 'RESUME').toUpperCase();
      doc.text(nameText, pageWidth / 2, y, { align: 'center' });
      y += 22;

      // Contact Info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // #475569
      const contactInfo = [optimized.email, optimized.phone, optimized.location].filter(Boolean).join('   |   ');
      if (contactInfo) {
        doc.text(contactInfo, pageWidth / 2, y, { align: 'center' });
        y += 14;
      }

      // Header accent bar
      doc.setDrawColor(79, 70, 229); // #4f46e5 (indigo-600)
      doc.setLineWidth(1.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      // Helper function for section titles
      const addSectionHeader = (title: string) => {
        checkPageBreak(35);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(67, 56, 202); // #4338ca (indigo-700)
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.75);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
      };

      // 1. Professional Summary
      if (optimized.professionalSummary) {
        addSectionHeader('Professional Summary');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59); // #1e293b
        const lines = doc.splitTextToSize(optimized.professionalSummary, contentWidth);
        checkPageBreak(lines.length * 12);
        doc.text(lines, margin, y);
        y += lines.length * 12 + 14;
      }

      // 2. Skills & Competencies
      if (optimized.skills && optimized.skills.length > 0) {
        addSectionHeader('Technical & Core Competencies');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        const skillsString = optimized.skills.join('  •  ');
        const lines = doc.splitTextToSize(skillsString, contentWidth);
        checkPageBreak(lines.length * 12);
        doc.text(lines, margin, y);
        y += lines.length * 12 + 14;
      }

      // 3. Work Experience
      if (optimized.experience && optimized.experience.length > 0) {
        addSectionHeader('Work Experience');
        optimized.experience.forEach((exp) => {
          checkPageBreak(40);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          const posTitle = exp.position || 'Position';
          doc.text(posTitle, margin, y);

          if (exp.company) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            const posWidth = doc.getTextWidth(posTitle);
            doc.text(` — ${exp.company}`, margin + posWidth, y);
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          const dateRange = `${exp.startDate || ''} - ${exp.endDate || ''}`;
          doc.text(dateRange, pageWidth - margin, y, { align: 'right' });
          y += 13;

          if (exp.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            checkPageBreak(descLines.length * 11);
            doc.text(descLines, margin, y);
            y += descLines.length * 11 + 10;
          }
        });
        y += 4;
      }

      // 4. Projects
      if (optimized.projects && optimized.projects.length > 0) {
        addSectionHeader('Key Projects');
        optimized.projects.forEach((proj) => {
          checkPageBreak(35);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.projectName || 'Project', margin, y);

          if (proj.technologies) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`Tech: ${proj.technologies}`, pageWidth - margin, y, { align: 'right' });
          }
          y += 13;

          if (proj.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(proj.description, contentWidth);
            checkPageBreak(descLines.length * 11);
            doc.text(descLines, margin, y);
            y += descLines.length * 11 + 8;
          }
        });
        y += 4;
      }

      // 5. Education
      if (optimized.education && optimized.education.length > 0) {
        addSectionHeader('Education');
        optimized.education.forEach((edu) => {
          checkPageBreak(25);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          const eduTitle = `${edu.degree || ''} in ${edu.fieldOfStudy || ''}`;
          doc.text(eduTitle, margin, y);

          if (edu.institution) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const titleWidth = doc.getTextWidth(eduTitle);
            doc.text(` — ${edu.institution}`, margin + titleWidth, y);
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          const eduYears = `${edu.startYear || ''} - ${edu.endYear || ''}`;
          doc.text(eduYears, pageWidth - margin, y, { align: 'right' });
          y += 14;
        });
        y += 4;
      }

      // 6. Certifications
      if (optimized.certifications && optimized.certifications.length > 0) {
        addSectionHeader('Certifications & Honors');
        optimized.certifications.forEach((cert) => {
          checkPageBreak(20);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const certTitle = cert.certificateName || 'Certification';
          doc.text(certTitle, margin, y);

          if (cert.issuer) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            const cWidth = doc.getTextWidth(certTitle);
            doc.text(` — ${cert.issuer}${cert.year ? ` (${cert.year})` : ''}`, margin + cWidth, y);
          }
          y += 13;
        });
      }

      const fileName = `${(optimized.fullName || 'Resume').replace(/\s+/g, '_')}_AI_Optimized.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('jsPDF Export Error:', error);
      window.print();
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                AI Tailored Resume
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>ATS Tailored</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customized for target opportunity without modifying truthfulness of qualifications
            </p>
          </div>
        </div>

        {/* View Switcher & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'comparison'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Preview</span>
            </button>
          </div>

          {/* User Action Buttons */}
          <button
            onClick={handleCopyResume}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Copy Resume Content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {!isSavedAsNew ? (
            <button
              onClick={() => onSaveAsNewResume(optimized)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as New Resume</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved in Resumes Library</span>
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleDownloadDocx}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
              title="Download DOCX"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DOCX</span>
            </button>
          </div>

          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50"
            title="Regenerate Resume"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Improvements Banner */}
      {optimized.keyImprovements && optimized.keyImprovements.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
          <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Key ATS Enhancements Applied by AI:</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {optimized.keyImprovements.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON VIEW */}
      {activeView === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* LEFT: ORIGINAL RESUME */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Original Resume
              </span>
              <span className="text-[11px] text-slate-400">{original.title}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{original.fullName}</h4>
                <p className="text-slate-500 text-[11px]">{[original.email, original.phone, original.location].filter(Boolean).join(' • ')}</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Professional Summary
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {original.professionalSummary || 'No summary provided.'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {original.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Work Experience
                </span>
                {original.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{exp.position}</span>
                      <span className="text-slate-400 font-normal">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{exp.company}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Projects
                </span>
                {original.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">{proj.projectName}</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: AI OPTIMIZED RESUME */}
          <div className="p-6 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60 dark:border-indigo-900/60">
              <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Optimized Resume</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Targeted & High-Impact
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">{optimized.fullName}</h4>
                <p className="text-slate-500 text-[11px]">{[optimized.email, optimized.phone, optimized.location].filter(Boolean).join(' • ')}</p>
              </div>

              {/* Enhanced Summary */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Tailored Professional Summary</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    ATS Rewritten
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {optimized.professionalSummary}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Prioritized Technical & Core Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {optimized.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-indigo-100/80 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 font-semibold text-[11px] border border-indigo-200/60 dark:border-indigo-800/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Optimized Work Experience
                </span>
                {optimized.experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 space-y-1 shadow-2xs">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{exp.position}</span>
                      <span className="text-slate-400 font-normal">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">{exp.company}</p>
                    <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Optimized Projects
                </span>
                {optimized.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{proj.projectName}</span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{proj.technologies}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRINTABLE RESUME PREVIEW */}
      {activeView === 'preview' && (
        <div className="pt-2">
          <div
            id="printable-resume-area"
            className="max-w-3xl mx-auto p-8 sm:p-12 bg-white text-slate-900 border border-slate-300 shadow-lg rounded-2xl space-y-6 font-sans"
          >
            {/* Resume Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-indigo-600">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
                {optimized.fullName}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {[optimized.email, optimized.phone, optimized.location].filter(Boolean).join('  |  ')}
              </p>
            </div>

            {/* Professional Summary */}
            {optimized.professionalSummary && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {optimized.professionalSummary}
                </p>
              </div>
            )}

            {/* Skills */}
            {optimized.skills && optimized.skills.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Technical & Core Competencies
                </h2>
                <p className="text-xs text-slate-800 font-medium">
                  {optimized.skills.join(' • ')}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {optimized.experience && optimized.experience.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Work Experience
                </h2>
                {optimized.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                      <span>{exp.position} — <span className="text-indigo-800">{exp.company}</span></span>
                      <span className="text-[11px] font-normal text-slate-500">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {optimized.projects && optimized.projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Key Projects
                </h2>
                {optimized.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                      <span>{proj.projectName}</span>
                      <span className="text-[11px] font-normal text-slate-500">{proj.technologies}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {optimized.education && optimized.education.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Education
                </h2>
                {optimized.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-xs text-slate-900">
                    <div>
                      <span className="font-bold">{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="text-slate-600 font-normal"> — {edu.institution}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{edu.startYear} - {edu.endYear}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {optimized.certifications && optimized.certifications.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b border-slate-200 pb-1">
                  Certifications & Honors
                </h2>
                <div className="text-xs text-slate-800 space-y-1">
                  {optimized.certifications.map((cert, idx) => (
                    <p key={idx}>
                      <span className="font-bold">{cert.certificateName}</span> — {cert.issuer} ({cert.year})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
