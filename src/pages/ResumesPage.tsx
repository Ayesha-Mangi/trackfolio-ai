import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Code,
  Briefcase,
  GraduationCap,
  Copy,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResumeItem } from '../types';
import {
  subscribeUserResumes,
  addResume,
  updateResume,
  deleteResume,
  duplicateResume,
  CreateResumeInput,
} from '../services/resumeService';
import { ResumeCard } from '../components/resumes/ResumeCard';
import { ResumeFormModal } from '../components/resumes/ResumeFormModal';
import { ResumeDetailsModal } from '../components/resumes/ResumeDetailsModal';
import { DeleteResumeModal } from '../components/resumes/DeleteResumeModal';
import { ResumeUploadModal } from '../components/resumes/ResumeUploadModal';

type SortOption = 'newest' | 'oldest' | 'alphabetical';

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'error';
}

export const ResumesPage: React.FC = () => {
  const { user } = useAuth();

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [editingResume, setEditingResume] = useState<ResumeItem | null>(null);
  const [parsedInitialData, setParsedInitialData] = useState<ResumeItem | null>(null);
  const [viewingResume, setViewingResume] = useState<ResumeItem | null>(null);
  const [deletingResume, setDeletingResume] = useState<ResumeItem | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Subscribe to user resumes from Firestore
  useEffect(() => {
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserResumes(
      user.uid,
      (items) => {
        setResumes(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching resumes:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Search & Sorting logic
  const filteredResumes = useMemo(() => {
    let result = [...resumes];

    // Search filter: Resume Title, Skill, Project Name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((res) => {
        const titleMatch = res.title.toLowerCase().includes(q);
        const fullNameMatch = res.fullName?.toLowerCase().includes(q);
        const skillMatch = res.skills?.some((s) => s.toLowerCase().includes(q));
        const projectMatch = res.projects?.some((p) => p.projectName.toLowerCase().includes(q));

        return titleMatch || fullNameMatch || skillMatch || projectMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [resumes, searchQuery, sortBy]);

  // Actions Handlers
  const handleOpenCreateModal = () => {
    setEditingResume(null);
    setParsedInitialData(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (resume: ResumeItem) => {
    setEditingResume(resume);
    setParsedInitialData(null);
    setIsFormOpen(true);
  };

  const handleParsedSuccess = (parsedData: Partial<ResumeItem>, fileName: string, fileType: string) => {
    const fullParsedData: ResumeItem = {
      id: '',
      userId: user?.uid || '',
      title: parsedData.title || `${fileName.replace(/\.[^/.]+$/, '')} (Uploaded)`,
      fullName: parsedData.fullName || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      professionalSummary: parsedData.professionalSummary || '',
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      skills: parsedData.skills || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      createdAt: new Date().toISOString(),
      originalFileName: fileName,
      fileType: fileType,
      uploadedAt: new Date().toISOString(),
      isUploaded: true,
    };

    setEditingResume(null);
    setParsedInitialData(fullParsedData);
    setIsFormOpen(true);
    showToast('Resume extracted! Please review and save.', 'success');
  };

  const handleFormSubmit = async (input: CreateResumeInput) => {
    if (!user) return;

    if (editingResume) {
      // Update existing resume
      await updateResume(user.uid, editingResume.id, input);
      showToast('Resume updated successfully!', 'success');
    } else {
      // Create new resume (manual or parsed upload)
      await addResume(user.uid, {
        ...input,
        originalFileName: parsedInitialData?.originalFileName || input.originalFileName,
        fileType: parsedInitialData?.fileType || input.fileType,
        uploadedAt: parsedInitialData?.uploadedAt || input.uploadedAt,
        isUploaded: parsedInitialData?.isUploaded ?? input.isUploaded,
      });
      showToast('New resume saved successfully!', 'success');
      setParsedInitialData(null);
    }
  };

  const handleDuplicate = async (resumeToCopy: ResumeItem) => {
    if (!user) return;
    try {
      await duplicateResume(user.uid, resumeToCopy);
      showToast(`Duplicated "${resumeToCopy.title}" as copy`, 'success');
    } catch (err) {
      console.error('Failed to duplicate resume:', err);
      showToast('Failed to duplicate resume. Please try again.', 'error');
    }
  };

  const handleDeleteConfirm = async (resumeId: string) => {
    if (!user) return;
    try {
      await deleteResume(user.uid, resumeId);
      showToast('Resume deleted successfully', 'info');
    } catch (err) {
      console.error('Failed to delete resume:', err);
      showToast('Failed to delete resume.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-0.5 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Resume Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build manually or upload PDF/Word resumes to auto-extract structured profiles for Firestore storage
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resume</span>
          </button>
        </div>
      </div>

      {/* Search and Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by title, skill, or project name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 dark:text-white font-bold text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Resumes Display Section */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold">Loading resume library from Firestore...</p>
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="p-10 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-xs space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-inner">
            <FileText className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              No resumes created yet.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload an existing PDF/DOCX resume for automatic AI extraction, or create a custom resume manually.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Resume from Device</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-sm transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Create Resume Manually</span>
            </button>
          </div>
        </div>
      ) : filteredResumes.length === 0 ? (
        /* Search Empty State */
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No resumes found matching "{searchQuery}"
          </p>
          <p className="text-xs text-slate-500">
            Try searching by another title, skill keyword, or project name.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 inline-block"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        /* Resumes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onView={(res) => setViewingResume(res)}
              onEdit={(res) => handleOpenEditModal(res)}
              onDelete={(res) => setDeletingResume(res)}
              onDuplicate={(res) => handleDuplicate(res)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onParsedSuccess={handleParsedSuccess}
      />

      <ResumeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setParsedInitialData(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingResume || parsedInitialData}
        titleText={
          editingResume
            ? 'Edit Resume Document'
            : parsedInitialData
            ? 'Review & Edit Extracted Resume'
            : 'Create New Resume'
        }
      />

      <ResumeDetailsModal
        isOpen={!!viewingResume}
        onClose={() => setViewingResume(null)}
        onResumeEdit={(res) => handleOpenEditModal(res)}
        resume={viewingResume}
      />

      <DeleteResumeModal
        isOpen={!!deletingResume}
        resume={deletingResume}
        onClose={() => setDeletingResume(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

