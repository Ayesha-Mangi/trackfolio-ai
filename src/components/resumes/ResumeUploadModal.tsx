import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { ResumeItem } from '../../types';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsedSuccess: (parsedData: Partial<ResumeItem>, fileName: string, fileType: string) => void;
}

type StepStatus =
  | 'idle'
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'organizing'
  | 'done'
  | 'error';

const STEP_MESSAGES: Record<StepStatus, string> = {
  idle: 'Select or drag your resume file to begin',
  uploading: 'Uploading Resume...',
  reading: 'Reading File...',
  extracting: 'Extracting Information...',
  organizing: 'Organizing Resume Sections...',
  done: 'Almost Done...',
  error: 'Parsing Failed',
};

const STEP_PROGRESS: Record<StepStatus, number> = {
  idle: 0,
  uploading: 20,
  reading: 40,
  extracting: 65,
  organizing: 85,
  done: 95,
  error: 0,
};

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onParsedSuccess,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StepStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setStatus('idle');
    setErrorMessage(null);
    setDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['pdf', 'docx'];
    if (!validExtensions.includes(ext)) {
      return 'Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).';
    }
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please select a smaller file.`;
    }
    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setStatus('uploading');

    try {
      // Step 1: Uploading & Base64 encoding
      const fileType = file.name.split('.').pop()?.toLowerCase() === 'docx' ? 'docx' : 'pdf';

      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file from your device.'));
        reader.readAsDataURL(file);
      });

      // Step 2: Reading File
      setStatus('reading');
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Extracting Information
      setStatus('extracting');

      // Call Express API endpoint
      const response = await fetch('/api/ai-resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64String,
          fileName: file.name,
          fileType,
        }),
      });

      // Step 4: Organizing Sections
      setStatus('organizing');
      await new Promise((r) => setTimeout(r, 400));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume file.');
      }

      // Step 5: Almost Done
      setStatus('done');
      await new Promise((r) => setTimeout(r, 500));

      const parsedResumeData: Partial<ResumeItem> = {
        title: `${file.name.replace(/\.[^/.]+$/, '')} (Uploaded)`,
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        professionalSummary: data.professionalSummary || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        education: (data.education || []).map((e: any, idx: number) => ({
          id: `edu_parsed_${idx}_${Date.now()}`,
          institution: e.institution || '',
          degree: e.degree || '',
          fieldOfStudy: e.fieldOfStudy || '',
          startYear: e.startYear || '',
          endYear: e.endYear || '',
          grade: e.grade || '',
        })),
        experience: (data.experience || []).map((exp: any, idx: number) => ({
          id: `exp_parsed_${idx}_${Date.now()}`,
          company: exp.company || '',
          position: exp.position || '',
          description: exp.description || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
        })),
        projects: (data.projects || []).map((p: any, idx: number) => ({
          id: `proj_parsed_${idx}_${Date.now()}`,
          projectName: p.projectName || '',
          description: p.description || '',
          technologies: p.technologies || '',
          githubLink: p.githubLink || '',
          demoLink: p.demoLink || '',
        })),
        certifications: (data.certifications || []).map((c: any, idx: number) => ({
          id: `cert_parsed_${idx}_${Date.now()}`,
          certificateName: c.certificateName || '',
          issuer: c.issuer || '',
          year: c.year || '',
        })),
        originalFileName: file.name,
        fileType,
        uploadedAt: new Date().toISOString(),
        isUploaded: true,
      };

      handleClose();
      onParsedSuccess(parsedResumeData, file.name, fileType);
    } catch (err: any) {
      console.error('Error uploading/parsing resume:', err);
      setErrorMessage(
        err.message || 'Network or server error during resume parsing. Please check your connection and try again.'
      );
      setStatus('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isProcessing =
    status === 'uploading' ||
    status === 'reading' ||
    status === 'extracting' ||
    status === 'organizing' ||
    status === 'done';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Upload Resume</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                  AI Auto-Parse
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your existing resume file for instant AI section extraction
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* File Format & Size Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Supported Formats</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">PDF (.pdf) & Word (.docx)</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Maximum File Size</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">Up to 5 MB</p>
              </div>
            </div>
          </div>

          {/* Active Processing State */}
          {isProcessing ? (
            <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-5 animate-in fade-in duration-200">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {STEP_MESSAGES[status]}
                </p>
                {selectedFile && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-xs mx-auto">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-xs mx-auto">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${STEP_PROGRESS[status]}%` }}
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-400 text-right">
                  {STEP_PROGRESS[status]}%
                </p>
              </div>
            </div>
          ) : status === 'error' ? (
            /* Error State with Retry Button */
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Upload or Parsing Error
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                    {errorMessage || 'An error occurred while uploading or parsing your resume file.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Upload</span>
                </button>
              </div>
            </div>
          ) : (
            /* Default Dropzone Area */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-900">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Drag & Drop your resume here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">browse files</span> from your device
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
