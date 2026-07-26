import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  ResumeItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
} from '../types';

const COLLECTION_NAME = 'resumes';

const getLocalStorageKey = (userId: string) => `trackfolio_resumes_${userId}`;

// Helper to get cached local resumes
export const getLocalResumes = (userId: string): ResumeItem[] => {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read local resumes:', err);
  }
  return [];
};

// Helper to save cached local resumes
export const saveLocalResumes = (userId: string, items: ResumeItem[]) => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save local resumes:', err);
  }
};

/**
 * Subscribe to user's resumes in real time from Firestore
 */
export const subscribeUserResumes = (
  userId: string,
  onUpdate: (items: ResumeItem[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Load cached first for immediate responsive render
  const cached = getLocalResumes(userId);
  onUpdate(cached);

  // Check if real Firebase user is logged in matching userId
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (!isRealAuthUser) {
    return () => {};
  }

  try {
    const resumesRef = collection(db, COLLECTION_NAME);
    const q = query(resumesRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ResumeItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || userId,
            title: data.title || data.name || 'Untitled Resume',
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            professionalSummary: data.professionalSummary || '',
            education: Array.isArray(data.education) ? data.education : [],
            experience: Array.isArray(data.experience) ? data.experience : [],
            skills: Array.isArray(data.skills) ? data.skills : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
            name: data.name || data.title,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            originalFileName: data.originalFileName,
            uploadedAt: data.uploadedAt,
            isUploaded: data.isUploaded,
            isPrimary: data.isPrimary,
          });
        });

        // Default sort: newest created/updated first
        items.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );

        saveLocalResumes(userId, items);
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore resumes snapshot notice, falling back to local storage:', err);
        if (onError) onError(err);
        onUpdate(getLocalResumes(userId));
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Error listening to resumes in Firestore:', err);
    onUpdate(getLocalResumes(userId));
    return () => {};
  }
};

export type CreateResumeInput = Omit<ResumeItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

/**
 * Add a new resume for the user in Firestore
 */
export const addResume = async (
  userId: string,
  input: CreateResumeInput
): Promise<ResumeItem> => {
  const now = new Date().toISOString();
  const newItem: ResumeItem = {
    id: 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId,
    title: input.title.trim() || 'Untitled Resume',
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    location: input.location.trim(),
    professionalSummary: input.professionalSummary.trim(),
    education: input.education || [],
    experience: input.experience || [],
    skills: input.skills || [],
    projects: input.projects || [],
    certifications: input.certifications || [],
    generatedByAI: input.generatedByAI || false,
    basedOnResumeId: input.basedOnResumeId || '',
    opportunityId: input.opportunityId || '',
    resumeContent: input.resumeContent || '',
    originalFileName: input.originalFileName || '',
    fileType: input.fileType || '',
    uploadedAt: input.uploadedAt || '',
    isUploaded: input.isUploaded || false,
    createdAt: now,
    updatedAt: now,
  };

  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const resumesRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(resumesRef, {
        userId,
        title: newItem.title,
        fullName: newItem.fullName,
        email: newItem.email,
        phone: newItem.phone,
        location: newItem.location,
        professionalSummary: newItem.professionalSummary,
        education: newItem.education,
        experience: newItem.experience,
        skills: newItem.skills,
        projects: newItem.projects,
        certifications: newItem.certifications,
        generatedByAI: newItem.generatedByAI,
        basedOnResumeId: newItem.basedOnResumeId,
        opportunityId: newItem.opportunityId,
        resumeContent: newItem.resumeContent,
        originalFileName: newItem.originalFileName,
        fileType: newItem.fileType,
        uploadedAt: newItem.uploadedAt,
        isUploaded: newItem.isUploaded,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
        serverCreatedAt: serverTimestamp(),
      });

      newItem.id = docRef.id;
    } catch (err) {
      console.warn('Firestore addDoc failed for resume, caching locally:', err);
    }
  }

  // Update local cache
  const existing = getLocalResumes(userId);
  const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)];
  saveLocalResumes(userId, updated);

  return newItem;
};

/**
 * Update an existing resume
 */
export const updateResume = async (
  userId: string,
  resumeId: string,
  input: Partial<CreateResumeInput>
): Promise<void> => {
  const updatedAt = new Date().toISOString();

  const updateData: Record<string, any> = { ...input, updatedAt };

  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const docRef = doc(db, COLLECTION_NAME, resumeId);
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.warn('Firestore updateDoc failed for resume, updating local cache:', err);
    }
  }

  // Always update local cache
  const existing = getLocalResumes(userId);
  const updated = existing.map((item) =>
    item.id === resumeId ? { ...item, ...input, updatedAt } : item
  );
  saveLocalResumes(userId, updated);
};

/**
 * Delete a resume
 */
export const deleteResume = async (userId: string, resumeId: string): Promise<void> => {
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const docRef = doc(db, COLLECTION_NAME, resumeId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteDoc failed for resume, deleting from local cache:', err);
    }
  }

  const existing = getLocalResumes(userId);
  const updated = existing.filter((item) => item.id !== resumeId);
  saveLocalResumes(userId, updated);
};

/**
 * Duplicate an existing resume
 * Generates a copy with title + " (Copy)"
 */
export const duplicateResume = async (
  userId: string,
  sourceResume: ResumeItem
): Promise<ResumeItem> => {
  const duplicateInput: CreateResumeInput = {
    title: `${sourceResume.title} (Copy)`,
    fullName: sourceResume.fullName || '',
    email: sourceResume.email || '',
    phone: sourceResume.phone || '',
    location: sourceResume.location || '',
    professionalSummary: sourceResume.professionalSummary || '',
    education: JSON.parse(JSON.stringify(sourceResume.education || [])),
    experience: JSON.parse(JSON.stringify(sourceResume.experience || [])),
    skills: [...(sourceResume.skills || [])],
    projects: JSON.parse(JSON.stringify(sourceResume.projects || [])),
    certifications: JSON.parse(JSON.stringify(sourceResume.certifications || [])),
  };

  return await addResume(userId, duplicateInput);
};
