export type OpportunityType =
  | 'Internship'
  | 'Scholarship'
  | 'Fellowship'
  | 'Hackathon'
  | 'Competition'
  | 'Graduate Program'
  | 'Job';

export type OpportunityStatus =
  | 'Saved'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OpportunityItem {
  id: string;
  userId: string;
  organization: string;
  title: string;
  type: OpportunityType;
  deadline: string;
  location?: string;
  applicationLink?: string;
  url?: string;
  status: OpportunityStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface ProjectItem {
  id: string;
  projectName: string;
  description: string;
  technologies: string;
  githubLink?: string;
  demoLink?: string;
}

export interface CertificationItem {
  id: string;
  certificateName: string;
  issuer: string;
  year: string;
}

export interface ResumeItem {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  createdAt: string;
  updatedAt?: string;

  // AI Resume Generator fields
  generatedByAI?: boolean;
  basedOnResumeId?: string;
  opportunityId?: string;
  resumeContent?: string;

  // Upload fields
  originalFileName?: string;
  fileType?: string;
  uploadedAt?: string;
  isUploaded?: boolean;

  // Legacy/optional fields for compatibility
  name?: string;
  fileUrl?: string;
  isPrimary?: boolean;
}

export interface OptimizedResumeData {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  keyImprovements: string[];
}

export interface AiAnalysisItem {
  id: string;
  userId: string;
  resumeId: string;
  opportunityId: string;
  fitScore: number;
  matchSummary: string;
  missingSkills: string[];
  missingKeywords: string[];
  resumeSuggestions: string[];
  coverLetter: string;
  interviewQuestions: string[];
  applicationTips: string[];
  createdAt: string;

  // Optional display metadata helpers
  resumeTitle?: string;
  opportunityTitle?: string;
  organization?: string;

  // Legacy/optional compatibility fields
  matchScore?: number;
  summary?: string;
  keyStrengths?: string[];
}
