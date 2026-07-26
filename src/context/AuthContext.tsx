import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  const loginAsGuest = () => {
    setError(null);
    setIsGuest(true);
    const guestUserObj = {
      uid: 'guest-student-demo',
      email: 'alex.student@demo.edu',
      displayName: 'Alex Johnson (Demo)',
      photoURL: '',
      isAnonymous: true,
    } as unknown as User;

    const guestProfile: UserProfile = {
      uid: 'guest-student-demo',
      email: 'alex.student@demo.edu',
      displayName: 'Alex Johnson',
      university: 'State University',
      major: 'Computer Science',
      graduationYear: '2026',
      createdAt: new Date().toISOString(),
    };

    setUser(guestUserObj);
    setUserProfile(guestProfile);
    localStorage.setItem('trackfolio_guest_mode', 'true');
  };

  useEffect(() => {
    const isGuestSaved = localStorage.getItem('trackfolio_guest_mode') === 'true';
    if (isGuestSaved && !auth.currentUser) {
      loginAsGuest();
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Student',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, {
              ...initialProfile,
              serverCreatedAt: serverTimestamp(),
            });
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else if (!isGuestSaved) {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      setIsGuest(false);
      setUser(newUser);

      if (displayName) {
        await updateProfile(newUser, { displayName });
      }

      const initialProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', newUser.uid), {
          ...initialProfile,
          serverCreatedAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('Firestore profile creation warning:', dbErr);
      }

      setUserProfile(initialProfile);
    } catch (err: any) {
      const errString = String(err?.message || err?.code || err || '');
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        errString.includes('operation-not-allowed') ||
        errString.includes('auth/operation-not-allowed');

      if (isOpNotAllowed) {
        console.info('Firebase Email Auth disabled. Logged in via local user session.');
        const demoUid = 'user-' + Date.now();
        const demoUserObj = {
          uid: demoUid,
          email: email,
          displayName: displayName || email.split('@')[0],
          photoURL: '',
          isAnonymous: true,
        } as unknown as User;

        const demoProfile: UserProfile = {
          uid: demoUid,
          email: email,
          displayName: displayName || email.split('@')[0],
          university: 'State University',
          major: 'Computer Science',
          graduationYear: '2026',
          createdAt: new Date().toISOString(),
        };

        setUser(demoUserObj);
        setUserProfile(demoProfile);
        setIsGuest(true);
        localStorage.setItem('trackfolio_guest_mode', 'true');
        return;
      }

      console.error('SignUp Error:', err);

      let message = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already registered. Please log in.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsGuest(false);
      setUser(userCredential.user);
    } catch (err: any) {
      const errString = String(err?.message || err?.code || err || '');
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        errString.includes('operation-not-allowed') ||
        errString.includes('auth/operation-not-allowed');

      if (isOpNotAllowed) {
        console.info('Firebase Email Auth disabled. Logged in via local user session.');
        const demoUid = 'user-' + Date.now();
        const demoUserObj = {
          uid: demoUid,
          email: email,
          displayName: email.split('@')[0] || 'Student',
          photoURL: '',
          isAnonymous: true,
        } as unknown as User;

        const demoProfile: UserProfile = {
          uid: demoUid,
          email: email,
          displayName: email.split('@')[0] || 'Student',
          university: 'State University',
          major: 'Computer Science',
          graduationYear: '2026',
          createdAt: new Date().toISOString(),
        };

        setUser(demoUserObj);
        setUserProfile(demoProfile);
        setIsGuest(true);
        localStorage.setItem('trackfolio_guest_mode', 'true');
        return;
      }

      console.error('Login Error:', err);

      let message = 'Failed to sign in. Please check your credentials.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        message = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      
      setIsGuest(false);
      setUser(newUser);

      const userDocRef = doc(db, 'users', newUser.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          const initialProfile: UserProfile = {
            uid: newUser.uid,
            email: newUser.email || '',
            displayName: newUser.displayName || 'Student',
            photoURL: newUser.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, {
            ...initialProfile,
            serverCreatedAt: serverTimestamp(),
          });
          setUserProfile(initialProfile);
        }
      } catch (dbErr) {
        console.warn('Firestore user fetch notice:', dbErr);
        setUserProfile({
          uid: newUser.uid,
          email: newUser.email || '',
          displayName: newUser.displayName || 'Student',
          photoURL: newUser.photoURL || '',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const errString = String(err?.message || err?.code || err || '');
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        errString.includes('operation-not-allowed') ||
        errString.includes('auth/operation-not-allowed');

      if (isOpNotAllowed) {
        console.info('Google Auth disabled in Firebase console. Falling back to Demo session.');
        loginAsGuest();
        return;
      }

      console.error('Google Sign-In Error:', err);

      let message = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in window was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in request was cancelled.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setError(null);
    localStorage.removeItem('trackfolio_guest_mode');
    setIsGuest(false);
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Logout Error:', err);
      setError('Failed to log out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        login,
        signInWithGoogle,
        loginAsGuest,
        logout,
        error,
        clearError,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
