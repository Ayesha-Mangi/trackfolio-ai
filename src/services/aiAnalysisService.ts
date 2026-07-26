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
import { AiAnalysisItem } from '../types';

const COLLECTION_NAME = 'aiAnalysis';

const getLocalStorageKey = (userId: string) => `trackfolio_aianalysis_${userId}`;

// Helper to get cached local analyses
export const getLocalAiAnalyses = (userId: string): AiAnalysisItem[] => {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read local AI analyses:', err);
  }
  return [];
};

// Helper to save cached local analyses
export const saveLocalAiAnalyses = (userId: string, items: AiAnalysisItem[]) => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save local AI analyses:', err);
  }
};

/**
 * Subscribe to user's AI analyses in real time from Firestore
 */
export const subscribeUserAiAnalyses = (
  userId: string,
  onUpdate: (items: AiAnalysisItem[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Load cached first for immediate UI render
  const cached = getLocalAiAnalyses(userId);
  onUpdate(cached);

  // Check if real Firebase user is logged in matching userId
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (!isRealAuthUser) {
    return () => {};
  }

  try {
    const analysisRef = collection(db, COLLECTION_NAME);
    const q = query(analysisRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: AiAnalysisItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || userId,
            resumeId: data.resumeId || '',
            opportunityId: data.opportunityId || '',
            fitScore: typeof data.fitScore === 'number' ? data.fitScore : (data.matchScore || 0),
            matchSummary: data.matchSummary || data.summary || '',
            missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
            missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
            resumeSuggestions: Array.isArray(data.resumeSuggestions) ? data.resumeSuggestions : [],
            coverLetter: data.coverLetter || '',
            interviewQuestions: Array.isArray(data.interviewQuestions) ? data.interviewQuestions : [],
            applicationTips: Array.isArray(data.applicationTips) ? data.applicationTips : [],
            createdAt: data.createdAt || new Date().toISOString(),
            resumeTitle: data.resumeTitle || '',
            opportunityTitle: data.opportunityTitle || '',
            organization: data.organization || '',
          });
        });

        // Sort by createdAt desc
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        saveLocalAiAnalyses(userId, items);
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore aiAnalysis snapshot notice, falling back to local storage:', err);
        if (onError) onError(err);
        onUpdate(getLocalAiAnalyses(userId));
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Error listening to aiAnalysis in Firestore:', err);
    onUpdate(getLocalAiAnalyses(userId));
    return () => {};
  }
};

export type SaveAiAnalysisInput = Omit<AiAnalysisItem, 'id' | 'createdAt'>;

/**
 * Save or update AI analysis in Firestore
 */
export const saveAiAnalysis = async (
  userId: string,
  input: SaveAiAnalysisInput
): Promise<AiAnalysisItem> => {
  const now = new Date().toISOString();
  const newItem: AiAnalysisItem = {
    ...input,
    id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId,
    createdAt: now,
  };

  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const analysisRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(analysisRef, {
        userId,
        resumeId: newItem.resumeId,
        opportunityId: newItem.opportunityId,
        fitScore: newItem.fitScore,
        matchSummary: newItem.matchSummary,
        missingSkills: newItem.missingSkills,
        missingKeywords: newItem.missingKeywords,
        resumeSuggestions: newItem.resumeSuggestions,
        coverLetter: newItem.coverLetter,
        interviewQuestions: newItem.interviewQuestions,
        applicationTips: newItem.applicationTips,
        resumeTitle: newItem.resumeTitle || '',
        opportunityTitle: newItem.opportunityTitle || '',
        organization: newItem.organization || '',
        createdAt: newItem.createdAt,
        serverCreatedAt: serverTimestamp(),
      });

      newItem.id = docRef.id;
    } catch (err) {
      console.warn('Firestore addDoc failed for aiAnalysis, saving locally:', err);
    }
  }

  // Update local cache
  const existing = getLocalAiAnalyses(userId);
  const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)];
  saveLocalAiAnalyses(userId, updated);

  return newItem;
};

/**
 * Delete an AI analysis
 */
export const deleteAiAnalysis = async (userId: string, analysisId: string): Promise<void> => {
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const docRef = doc(db, COLLECTION_NAME, analysisId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteDoc failed for aiAnalysis, deleting locally:', err);
    }
  }

  const existing = getLocalAiAnalyses(userId);
  const updated = existing.filter((item) => item.id !== analysisId);
  saveLocalAiAnalyses(userId, updated);
};
