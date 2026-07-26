import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { OpportunityItem, OpportunityStatus, OpportunityType } from '../types';

const COLLECTION_NAME = 'opportunities';

const getLocalStorageKey = (userId: string) => `trackfolio_opps_${userId}`;

// Helper to get cached local items
export const getLocalOpportunities = (userId: string): OpportunityItem[] => {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read local opportunities:', err);
  }
  return [];
};

// Helper to save cached local items
export const saveLocalOpportunities = (userId: string, items: OpportunityItem[]) => {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save local opportunities:', err);
  }
};

/**
 * Subscribe to user's opportunities in real time.
 */
export const subscribeUserOpportunities = (
  userId: string,
  onUpdate: (items: OpportunityItem[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Load cached first for immediate UI render
  const cached = getLocalOpportunities(userId);
  onUpdate(cached);

  // Check if real Firebase user is logged in matching userId
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (!isRealAuthUser) {
    return () => {};
  }

  try {
    const oppsRef = collection(db, COLLECTION_NAME);
    const q = query(oppsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: OpportunityItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || userId,
            organization: data.organization || '',
            title: data.title || '',
            type: (data.type as OpportunityType) || 'Internship',
            deadline: data.deadline || '',
            location: data.location || '',
            applicationLink: data.applicationLink || data.url || '',
            url: data.url || data.applicationLink || '',
            status: (data.status as OpportunityStatus) || 'Saved',
            notes: data.notes || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          });
        });

        // Sort by createdAt desc by default
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Save local cache
        saveLocalOpportunities(userId, items);
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore snapshot notice (using local cache):', err);
        if (onError) onError(err);
        // Fallback to local cache
        onUpdate(getLocalOpportunities(userId));
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Error setting up Firestore listener, fallback to local storage:', err);
    onUpdate(getLocalOpportunities(userId));
    return () => {};
  }
};

/**
 * Add a new opportunity for the user
 */
export const addOpportunity = async (
  userId: string,
  data: {
    organization: string;
    title: string;
    type: OpportunityType;
    deadline: string;
    location?: string;
    applicationLink?: string;
    status: OpportunityStatus;
    notes?: string;
  }
): Promise<OpportunityItem> => {
  const newItem: OpportunityItem = {
    id: 'opp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId,
    organization: data.organization.trim(),
    title: data.title.trim(),
    type: data.type,
    deadline: data.deadline,
    location: data.location?.trim() || '',
    applicationLink: data.applicationLink?.trim() || '',
    url: data.applicationLink?.trim() || '',
    status: data.status || 'Saved',
    notes: data.notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const oppsRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(oppsRef, {
        userId,
        organization: newItem.organization,
        title: newItem.title,
        type: newItem.type,
        deadline: newItem.deadline,
        location: newItem.location,
        applicationLink: newItem.applicationLink,
        url: newItem.applicationLink,
        status: newItem.status,
        notes: newItem.notes,
        createdAt: newItem.createdAt,
        serverCreatedAt: serverTimestamp(),
      });

      newItem.id = docRef.id;
    } catch (err) {
      console.warn('Firestore addDoc failed, saved to local storage:', err);
    }
  }

  // Update local storage cache
  const existing = getLocalOpportunities(userId);
  const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)];
  saveLocalOpportunities(userId, updated);

  return newItem;
};

/**
 * Update an existing opportunity
 */
export const updateOpportunity = async (
  userId: string,
  opportunityId: string,
  data: Partial<Omit<OpportunityItem, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const updatedAt = new Date().toISOString();

  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const docRef = doc(db, COLLECTION_NAME, opportunityId);
      await updateDoc(docRef, {
        ...data,
        updatedAt,
      });
    } catch (err) {
      console.warn('Firestore updateDoc failed, updating local storage:', err);
    }
  }

  // Always update local cache
  const existing = getLocalOpportunities(userId);
  const updated = existing.map((item) =>
    item.id === opportunityId ? { ...item, ...data, updatedAt } : item
  );
  saveLocalOpportunities(userId, updated);
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (userId: string, opportunityId: string): Promise<void> => {
  const isRealAuthUser = auth.currentUser && auth.currentUser.uid === userId;
  if (isRealAuthUser) {
    try {
      const docRef = doc(db, COLLECTION_NAME, opportunityId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteDoc failed, removing from local storage:', err);
    }
  }

  // Always update local cache
  const existing = getLocalOpportunities(userId);
  const updated = existing.filter((item) => item.id !== opportunityId);
  saveLocalOpportunities(userId, updated);
};
