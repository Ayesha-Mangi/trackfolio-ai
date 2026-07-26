import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResumeItem, OpportunityItem, AiAnalysisItem, OpportunityType, OptimizedResumeData } from '../types';
import { subscribeUserResumes, addResume } from '../services/resumeService';
import { subscribeUserOpportunities } from '../services/opportunityService';
import {
  subscribeUserAiAnalyses,
  saveAiAnalysis,
  deleteAiAnalysis,
} from '../services/aiAnalysisService';
import { Toast, ToastMessage } from '../components/common/Toast';
import { FitScoreCard } from '../components/ai/FitScoreCard';
import { CoverLetterCard } from '../components/ai/CoverLetterCard';
import { InterviewQuestionsCard } from '../components/ai/InterviewQuestionsCard';
import { PreviousAnalysesList } from '../components/ai/PreviousAnalysesList';
import { LoadingExperience } from '../components/ai/LoadingExperience';
import { ResumeGenerationLoading } from '../components/ai/ResumeGenerationLoading';
import { ResumeComparisonCard } from '../components/ai/ResumeComparisonCard';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  FileText,
  FileCheck,
  Target,
  Copy,
  Check,
  X,
  BookmarkPlus,
  ArrowRight,
  Lightbulb,
  FileSearch,
  ChevronDown,
  PlusCircle,
  Briefcase,
  Building2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OPPORTUNITY_TYPES: OpportunityType[] = [
  'Internship',
  'Scholarship',
  'Fellowship',
  'Hackathon',
  'Competition',
  'Graduate Program',
  'Job',
];

export const AiAnalysisPage: React.FC = () => {
  const { user } = useAuth();

  // Data states
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [previousAnalyses, setPreviousAnalyses] = useState<AiAnalysisItem[]>([]);

  // Form selection states
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [opportunityType, setOpportunityType] = useState<OpportunityType>('Internship');
  const [organization, setOrganization] = useState<string>('');
  const [opportunityTitle, setOpportunityTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  // Execution & UI states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<AiAnalysisItem | null>(null);
  const [copiedSuggestionIndex, setCopiedSuggestionIndex] = useState<number | null>(null);
  const [isSavedInSession, setIsSavedInSession] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // AI Tailored Resume Generator states
  const [isGeneratingResume, setIsGeneratingResume] = useState<boolean>(false);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResumeData | null>(null);
  const [isResumeSavedAsNew, setIsResumeSavedAsNew] = useState<boolean>(false);

  // Missing skills state (supports interactive removal/dismissal)
  const [activeMissingSkills, setActiveMissingSkills] = useState<string[]>([]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubResumes = subscribeUserResumes(user.uid, (data) => {
      setResumes(data);
      if (data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(data[0].id);
      }
    });

    const unsubOpps = subscribeUserOpportunities(user.uid, (data) => {
      setOpportunities(data);
    });

    const unsubAnalyses = subscribeUserAiAnalyses(user.uid, (data) => {
      setPreviousAnalyses(data);
    });

    return () => {
      unsubResumes();
      unsubOpps();
      unsubAnalyses();
    };
  }, [user]);

  // Sync missing skills when result changes
  useEffect(() => {
    if (currentResult) {
      setActiveMissingSkills(currentResult.missingSkills || []);
    }
  }, [currentResult]);

  // Handle Opportunity Selection Change
  const handleOpportunitySelect = (oppId: string) => {
    setSelectedOpportunityId(oppId);

    if (oppId === 'custom' || !oppId) {
      // Clear or keep custom fields
      return;
    }

    const opp = opportunities.find((o) => o.id === oppId);
    if (opp) {
      setOpportunityType(opp.type || 'Internship');
      setOrganization(opp.organization || '');
      setOpportunityTitle(opp.title || '');
      setJobDescription(
        opp.notes && opp.notes.trim().length > 0
          ? opp.notes
          : `${opp.title} at ${opp.organization} (${opp.type}). Location: ${opp.location || 'Remote/TBD'}`
      );
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  };

  // Execute Gemini AI Analysis
  const handleRunAnalysis = async () => {
    if (!user) {
      showToast('error', 'Please log in to use AI analysis.');
      return;
    }

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume) {
      showToast('error', 'Please select a valid resume before running AI analysis.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      showToast('error', 'Please enter or paste a job description for analysis.');
      return;
    }

    const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);

    setIsAnalyzing(true);
    setIsSavedInSession(false);

    try {
      const response = await fetch('/api/ai-analysis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: selectedResume,
          opportunity: selectedOpp || {
            title: opportunityTitle || 'Target Position',
            organization: organization || 'Target Organization',
            type: opportunityType,
          },
          jobDescription: jobDescription.trim(),
          opportunityType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete AI analysis');
      }

      const newAnalysis: AiAnalysisItem = {
        id: 'temp_' + Date.now(),
        userId: user.uid,
        resumeId: selectedResume.id,
        opportunityId: selectedOpp?.id || 'custom',
        fitScore: data.fitScore || 75,
        matchSummary: data.matchSummary || 'Solid structural alignment with role criteria.',
        missingSkills: data.missingSkills || [],
        missingKeywords: data.missingKeywords || [],
        resumeSuggestions: data.resumeSuggestions || [],
        coverLetter: data.coverLetter || '',
        interviewQuestions: data.interviewQuestions || [],
        applicationTips: data.applicationTips || [],
        createdAt: new Date().toISOString(),
        resumeTitle: selectedResume.title,
        opportunityTitle: opportunityTitle || selectedOpp?.title || 'Target Position',
        organization: organization || selectedOpp?.organization || 'Target Organization',
      };

      setCurrentResult(newAnalysis);

      // Auto-save analysis to Firestore as per requirements
      try {
        const savedDoc = await saveAiAnalysis(user.uid, {
          userId: user.uid,
          resumeId: newAnalysis.resumeId,
          opportunityId: newAnalysis.opportunityId,
          fitScore: newAnalysis.fitScore,
          matchSummary: newAnalysis.matchSummary,
          missingSkills: newAnalysis.missingSkills,
          missingKeywords: newAnalysis.missingKeywords,
          resumeSuggestions: newAnalysis.resumeSuggestions,
          coverLetter: newAnalysis.coverLetter,
          interviewQuestions: newAnalysis.interviewQuestions,
          applicationTips: newAnalysis.applicationTips,
          resumeTitle: newAnalysis.resumeTitle,
          opportunityTitle: newAnalysis.opportunityTitle,
          organization: newAnalysis.organization,
        });

        setCurrentResult(savedDoc);
        setIsSavedInSession(true);
        showToast('success', 'AI Analysis completed & saved successfully!');
      } catch (saveErr) {
        console.warn('Auto-save error:', saveErr);
        showToast('success', 'AI Analysis generated successfully!');
      }
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      showToast('error', err.message || 'An error occurred while generating AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manual Save Handler
  const handleSaveCurrentAnalysis = async () => {
    if (!user || !currentResult) return;
    try {
      const savedDoc = await saveAiAnalysis(user.uid, {
        userId: user.uid,
        resumeId: currentResult.resumeId,
        opportunityId: currentResult.opportunityId,
        fitScore: currentResult.fitScore,
        matchSummary: currentResult.matchSummary,
        missingSkills: currentResult.missingSkills,
        missingKeywords: currentResult.missingKeywords,
        resumeSuggestions: currentResult.resumeSuggestions,
        coverLetter: currentResult.coverLetter,
        interviewQuestions: currentResult.interviewQuestions,
        applicationTips: currentResult.applicationTips,
        resumeTitle: currentResult.resumeTitle,
        opportunityTitle: currentResult.opportunityTitle,
        organization: currentResult.organization,
      });

      setCurrentResult(savedDoc);
      setIsSavedInSession(true);
      showToast('success', 'Analysis saved to your library!');
    } catch (err: any) {
      showToast('error', 'Failed to save analysis.');
    }
  };

  // Delete Analysis Handler
  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!user) return;
    try {
      await deleteAiAnalysis(user.uid, analysisId);
      if (currentResult?.id === analysisId) {
        setCurrentResult(null);
      }
      showToast('success', 'Analysis deleted.');
    } catch (err) {
      showToast('error', 'Failed to delete analysis.');
    }
  };

  // Copy single resume suggestion
  const handleCopySuggestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSuggestionIndex(index);
    setTimeout(() => setCopiedSuggestionIndex(null), 2000);
  };

  // Dismiss missing skill chip
  const handleDismissSkill = (skillToDismiss: string) => {
    setActiveMissingSkills((prev) => prev.filter((s) => s !== skillToDismiss));
  };

  // Generate AI Tailored Resume Handler
  const handleGenerateOptimizedResume = async () => {
    if (!user) {
      showToast('error', 'Please log in to generate an optimized resume.');
      return;
    }

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume) {
      showToast('error', 'Please select a valid candidate resume first.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      showToast('error', 'Job description is required.');
      return;
    }

    const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId);

    setIsGeneratingResume(true);
    setIsResumeSavedAsNew(false);

    try {
      const response = await fetch('/api/ai-resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: selectedResume,
          opportunity: selectedOpp || {
            title: opportunityTitle || 'Target Position',
            organization: organization || 'Target Organization',
            type: opportunityType,
          },
          jobDescription: jobDescription.trim(),
          previousAnalysis: currentResult,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate optimized resume');
      }

      setOptimizedResume(data);
      showToast('success', 'AI Tailored Resume generated successfully!');

      setTimeout(() => {
        const el = document.getElementById('ai-optimized-resume-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    } catch (err: any) {
      console.error('AI Resume Generation Error:', err);
      showToast('error', err.message || 'An error occurred while generating the optimized resume.');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // Save as New Resume Version in Firestore Collection
  const handleSaveAsNewResume = async (opt: OptimizedResumeData) => {
    if (!user) return;
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);

    try {
      const newTitle = opt.title || `${selectedResume?.title || 'Resume'} (${organization || 'AI Tailored'})`;

      await addResume(user.uid, {
        title: newTitle,
        fullName: opt.fullName,
        email: opt.email,
        phone: opt.phone,
        location: opt.location,
        professionalSummary: opt.professionalSummary,
        skills: opt.skills,
        education: opt.education,
        experience: opt.experience,
        projects: opt.projects,
        certifications: opt.certifications,
        generatedByAI: true,
        basedOnResumeId: selectedResumeId,
        opportunityId: selectedOpportunityId || 'custom',
        resumeContent: opt.professionalSummary,
      });

      setIsResumeSavedAsNew(true);
      showToast('success', 'Saved as a new version in your Resumes library!');
    } catch (err: any) {
      console.error('Error saving new resume version:', err);
      showToast('error', 'Failed to save new resume version.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Career Assistant
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.6</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Optimize your university application fit score, resume statements, cover letter, and interview prep.
          </p>
        </div>
      </div>

      {/* Input Selection Configuration Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Application Analysis Setup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select candidate resume and target opportunity details for Gemini evaluation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Select Resume */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Select Resume <span className="text-rose-500">*</span>
            </label>
            {resumes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
                <p className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  No resumes found in your library.
                </p>
                <Link
                  to="/resumes"
                  className="inline-flex items-center gap-1 font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  <span>Create a resume first</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none pr-10"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.fullName || 'No Name'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* 2. Select Saved Opportunity */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Select Opportunity <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                value={selectedOpportunityId}
                onChange={(e) => handleOpportunitySelect(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none pr-10"
              >
                <option value="custom">-- Custom / Enter Job Description Directly --</option>
                {opportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.organization} - {o.title} ({o.type})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Opportunity Meta fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Opportunity Type
            </label>
            <div className="relative">
              <select
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value as OpportunityType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none pr-8"
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Organization
            </label>
            <div className="relative">
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Google, CERN, Rhodes Trust"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role / Opportunity Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={opportunityTitle}
                onChange={(e) => setOpportunityTitle(e.target.value)}
                placeholder="e.g. Software Engineering Intern"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              3. Job Description / Posting Requirements <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Paste full job text or requirements</span>
          </div>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job posting details, responsibilities, required technical skills, qualifications, or scholarship criteria here..."
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || resumes.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
            <span>Analyze with AI</span>
          </button>
        </div>
      </div>

      {/* Loading Animation Experience */}
      {isAnalyzing && <LoadingExperience />}

      {/* AI Analysis Output Display Cards */}
      {currentResult && !isAnalyzing && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-400">
          {/* Top Bar for Results & Manual Save Action */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="text-xs font-extrabold text-purple-900 dark:text-purple-100">
                  AI Match Report Ready
                </span>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  Targeting {currentResult.opportunityTitle || 'Opportunity'} at{' '}
                  {currentResult.organization || 'Organization'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSavedInSession ? (
                <button
                  onClick={handleSaveCurrentAnalysis}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Analysis</span>
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved in Library</span>
                </span>
              )}
            </div>
          </div>

          {/* Primary CTA Banner: Generate Optimized Resume */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 border border-indigo-500/30">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>AI Tailored Resume Generator</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Ready for a Tailored ATS-Friendly Resume?
              </h3>
              <p className="text-xs text-indigo-200/90 max-w-xl leading-relaxed">
                Gemini will rewrite your resume phrasing, optimize bullet points, and highlight relevant skills specifically for {currentResult.opportunityTitle || 'this opportunity'} while keeping your qualifications 100% truthful.
              </p>
            </div>

            <button
              onClick={handleGenerateOptimizedResume}
              disabled={isGeneratingResume}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-extrabold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span>Generate Optimized Resume</span>
            </button>
          </div>

          {/* Loading Animation while generating AI Resume */}
          {isGeneratingResume && <ResumeGenerationLoading />}

          {/* Display AI Tailored Resume Comparison & Preview */}
          {optimizedResume && resumes.find((r) => r.id === selectedResumeId) && (
            <div id="ai-optimized-resume-section" className="pt-2">
              <ResumeComparisonCard
                original={resumes.find((r) => r.id === selectedResumeId)!}
                optimized={optimizedResume}
                onSaveAsNewResume={handleSaveAsNewResume}
                onRegenerate={handleGenerateOptimizedResume}
                isRegenerating={isGeneratingResume}
                isSavedAsNew={isResumeSavedAsNew}
              />
            </div>
          )}

          {/* 1. Fit Score */}
          <FitScoreCard score={currentResult.fitScore} />

          {/* 2. Match Summary & 3/4. Missing Skills & Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Summary */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileSearch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Match Summary
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                {currentResult.matchSummary}
              </p>
            </div>

            {/* Missing Skills & Keywords */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Missing Skills</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Click x to dismiss)</span>
                </h4>
                {activeMissingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    No major skill gaps identified!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeMissingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => handleDismissSkill(skill)}
                          className="hover:text-rose-900 dark:hover:text-white transition-colors"
                          title="Dismiss skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Missing Keywords (ATS)
                </h4>
                {currentResult.missingKeywords.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Excellent keyword density!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentResult.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Resume Suggestions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Resume Bullet Point Improvements
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actionable phrasing suggestions to maximize ATS ranking and impact
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {currentResult.resumeSuggestions.map((suggestion, idx) => {
                const isCopied = copiedSuggestionIndex === idx;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-800 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {suggestion}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopySuggestion(suggestion, idx)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0"
                      title="Copy suggestion"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. AI Cover Letter */}
          <CoverLetterCard
            coverLetter={currentResult.coverLetter}
            onRegenerate={handleRunAnalysis}
            isRegenerating={isAnalyzing}
          />

          {/* 7. Interview Questions */}
          <InterviewQuestionsCard questions={currentResult.interviewQuestions} />

          {/* 8. Application Tips */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Practical Application Tips
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Strategic advice to strengthen your university candidate profile
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {currentResult.applicationTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-3"
                >
                  <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous AI Analyses Section */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <PreviousAnalysesList
          analyses={previousAnalyses}
          onSelect={(analysis) => {
            setCurrentResult(analysis);
            setIsSavedInSession(true);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          onDelete={handleDeleteAnalysis}
          activeAnalysisId={currentResult?.id}
        />
      </div>
    </div>
  );
};
