import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  ResumeItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
} from '../../types';
import { CreateResumeInput } from '../../services/resumeService';

interface ResumeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateResumeInput) => Promise<void>;
  initialData?: ResumeItem | null;
  titleText: string;
}

type FormTab = 'info' | 'summary' | 'education' | 'experience' | 'projects' | 'skills' | 'certifications';

export const ResumeFormModal: React.FC<ResumeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  titleText,
}) => {
  const [activeTab, setActiveTab] = useState<FormTab>('info');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState('');

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate initial data when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.name || '');
      setFullName(initialData.fullName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setLocation(initialData.location || '');
      setProfessionalSummary(initialData.professionalSummary || '');
      setEducation(initialData.education ? [...initialData.education] : []);
      setExperience(initialData.experience ? [...initialData.experience] : []);
      setProjects(initialData.projects ? [...initialData.projects] : []);
      setSkills(initialData.skills ? [...initialData.skills] : []);
      setCertifications(initialData.certifications ? [...initialData.certifications] : []);
    } else {
      // Defaults for brand new resume
      setTitle('');
      setFullName('');
      setEmail('');
      setPhone('');
      setLocation('');
      setProfessionalSummary('');
      setEducation([
        {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startYear: '',
          endYear: '',
          grade: '',
        },
      ]);
      setExperience([]);
      setProjects([]);
      setSkills([]);
      setCertifications([]);
    }
    setError(null);
    setActiveTab('info');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Skill Chip Handlers
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education Helpers
  const addEducationRow = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        grade: '',
      },
    ]);
  };

  const updateEducationRow = (id: string, field: keyof EducationItem, val: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const removeEducationRow = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  // Experience Helpers
  const addExperienceRow = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        company: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
      },
    ]);
  };

  const updateExperienceRow = (id: string, field: keyof ExperienceItem, val: string) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  };

  const removeExperienceRow = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  // Project Helpers
  const addProjectRow = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        projectName: '',
        description: '',
        technologies: '',
        githubLink: '',
        demoLink: '',
      },
    ]);
  };

  const updateProjectRow = (id: string, field: keyof ProjectItem, val: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const removeProjectRow = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // Certification Helpers
  const addCertificationRow = () => {
    setCertifications([
      ...certifications,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        certificateName: '',
        issuer: '',
        year: '',
      },
    ]);
  };

  const updateCertificationRow = (id: string, field: keyof CertificationItem, val: string) => {
    setCertifications(
      certifications.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const removeCertificationRow = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  // Form Submit Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Resume Title is required (e.g. Software Engineer Resume 2026)');
      setActiveTab('info');
      return;
    }
    if (!fullName.trim()) {
      setError('Full Name is required');
      setActiveTab('info');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Clean empty rows
      const cleanEducation = education.filter((e) => e.institution.trim() || e.degree.trim());
      const cleanExperience = experience.filter((e) => e.company.trim() || e.position.trim());
      const cleanProjects = projects.filter((p) => p.projectName.trim());
      const cleanCertifications = certifications.filter((c) => c.certificateName.trim());

      await onSubmit({
        title: title.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        professionalSummary: professionalSummary.trim(),
        education: cleanEducation,
        experience: cleanExperience,
        skills,
        projects: cleanProjects,
        certifications: cleanCertifications,
      });

      onClose();
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setError(err.message || 'Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { key: FormTab; label: string; icon: React.ElementType }[] = [
    { key: 'info', label: 'Personal Info', icon: User },
    { key: 'summary', label: 'Summary', icon: FileText },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'skills', label: 'Skills', icon: Sparkles },
    { key: 'projects', label: 'Projects', icon: Code },
    { key: 'certifications', label: 'Certifications', icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {titleText}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a domain-specific resume document for applications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 bg-white dark:bg-slate-900">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form id="resume-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Personal Info */}
          {activeTab === 'info' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Personal & Document Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide an identifier title for this resume and your personal contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Resume Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineering Resume 2026, ML Research CV"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Internal title to distinguish this resume in your library.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Professional Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Write a compelling, high-level summary highlighting your core background and goals.
                </p>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  value={professionalSummary}
                  onChange={(e) => setProfessionalSummary(e.target.value)}
                  placeholder="e.g. Computer Science senior with 2 years of software engineering research experience. Passionate about distributed systems, cloud infrastructure, and AI application development."
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Education */}
          {activeTab === 'education' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Education
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add degrees, universities, high schools, or academic certifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addEducationRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {education.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 space-y-2">
                  <p className="text-xs">No education records added yet.</p>
                  <button
                    type="button"
                    onClick={addEducationRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add your school or university
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Education #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducationRow(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Institution / School
                          </label>
                          <input
                            type="text"
                            value={item.institution}
                            onChange={(e) => updateEducationRow(item.id, 'institution', e.target.value)}
                            placeholder="e.g. Stanford University"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={item.degree}
                            onChange={(e) => updateEducationRow(item.id, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={item.fieldOfStudy}
                            onChange={(e) => updateEducationRow(item.id, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Start Year
                            </label>
                            <input
                              type="text"
                              value={item.startYear}
                              onChange={(e) => updateEducationRow(item.id, 'startYear', e.target.value)}
                              placeholder="2022"
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              End Year
                            </label>
                            <input
                              type="text"
                              value={item.endYear}
                              onChange={(e) => updateEducationRow(item.id, 'endYear', e.target.value)}
                              placeholder="2026"
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Grade (Opt)
                            </label>
                            <input
                              type="text"
                              value={item.grade || ''}
                              onChange={(e) => updateEducationRow(item.id, 'grade', e.target.value)}
                              placeholder="3.9 GPA"
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Work & Internship Experience
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add previous work experience, internships, or fellowships.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperienceRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {experience.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 space-y-2">
                  <p className="text-xs">No experience added yet.</p>
                  <button
                    type="button"
                    onClick={addExperienceRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add an internship or job
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {experience.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperienceRow(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Company / Organization
                          </label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => updateExperienceRow(item.id, 'company', e.target.value)}
                            placeholder="e.g. Google, Tech Startup"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Position / Title
                          </label>
                          <input
                            type="text"
                            value={item.position}
                            onChange={(e) => updateExperienceRow(item.id, 'position', e.target.value)}
                            placeholder="e.g. Software Engineering Intern"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={item.startDate}
                            onChange={(e) => updateExperienceRow(item.id, 'startDate', e.target.value)}
                            placeholder="e.g. Jun 2025"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            End Date
                          </label>
                          <input
                            type="text"
                            value={item.endDate}
                            onChange={(e) => updateExperienceRow(item.id, 'endDate', e.target.value)}
                            placeholder="e.g. Aug 2025 or Present"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Description / Bullet points
                          </label>
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) => updateExperienceRow(item.id, 'description', e.target.value)}
                            placeholder="• Developed RESTful backend APIs serving 50k active users using React and Express.&#10;• Reduced load times by 40% using query optimizations."
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Skills & Technologies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add technical skills, programming languages, frameworks, or soft skills as removable chips.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. TypeScript, React, Python, Docker, PostgreSQL"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                >
                  Add Skill
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-h-[120px] flex flex-wrap gap-2 items-start">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No skills added yet. Type above and press enter or click "Add Skill".
                  </p>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-900/60 shadow-2xs group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Projects
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add hackathon entries, personal side projects, or research applications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProjectRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 space-y-2">
                  <p className="text-xs">No projects added yet.</p>
                  <button
                    type="button"
                    onClick={addProjectRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add a personal project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Project #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProjectRow(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={item.projectName}
                            onChange={(e) => updateProjectRow(item.id, 'projectName', e.target.value)}
                            placeholder="e.g. AI Study Assistant"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Technologies Used
                          </label>
                          <input
                            type="text"
                            value={item.technologies}
                            onChange={(e) => updateProjectRow(item.id, 'technologies', e.target.value)}
                            placeholder="e.g. React, Tailwind CSS, Gemini API"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            GitHub Link (Optional)
                          </label>
                          <input
                            type="url"
                            value={item.githubLink || ''}
                            onChange={(e) => updateProjectRow(item.id, 'githubLink', e.target.value)}
                            placeholder="https://github.com/username/project"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Live Demo Link (Optional)
                          </label>
                          <input
                            type="url"
                            value={item.demoLink || ''}
                            onChange={(e) => updateProjectRow(item.id, 'demoLink', e.target.value)}
                            placeholder="https://myproject.demo.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Project Description
                          </label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => updateProjectRow(item.id, 'description', e.target.value)}
                            placeholder="Built an interactive dashboard allowing users to track study hours and synthesize flashcards automatically."
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Certifications */}
          {activeTab === 'certifications' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Certifications & Licenses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add certificates, online course completions, or professional licenses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCertificationRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Certification</span>
                </button>
              </div>

              {certifications.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 space-y-2">
                  <p className="text-xs">No certifications added yet.</p>
                  <button
                    type="button"
                    onClick={addCertificationRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add a certification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certifications.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Certification #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCertificationRow(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Certificate Name
                          </label>
                          <input
                            type="text"
                            value={item.certificateName}
                            onChange={(e) => updateCertificationRow(item.id, 'certificateName', e.target.value)}
                            placeholder="e.g. AWS Certified Cloud Practitioner"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Issuer / Organization
                          </label>
                          <input
                            type="text"
                            value={item.issuer}
                            onChange={(e) => updateCertificationRow(item.id, 'issuer', e.target.value)}
                            placeholder="e.g. Amazon Web Services, Coursera"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Year Issued
                          </label>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => updateCertificationRow(item.id, 'year', e.target.value)}
                            placeholder="e.g. 2025"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== 'info' && (
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.key === activeTab);
                  if (idx > 0) setActiveTab(TABS[idx - 1].key);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {activeTab !== 'certifications' && (
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.key === activeTab);
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors flex items-center gap-1"
              >
                <span>Next Section</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="resume-form"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
