'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUserAction } from '@/actions/sync-user';
import { usePathname, useRouter } from 'next/navigation';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  loginWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  role: null,
  signOut: async () => {},
  getIdToken: async () => null,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginWithGoogle: async () => {},
  resetPassword: async () => {},
  sendVerificationEmail: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();

  // Detect mock mode if the API key is empty or a placeholder
  const isMockMode = 
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your-firebase-client-api-key') ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === '';

  // Helper to determine role from email in mock mode
  const getMockRole = (email: string | null | undefined): string => {
    if (!email) return 'EMPLOYEE';
    const lower = email.toLowerCase();
    if (lower.includes('superadmin')) return 'SUPER_ADMIN';
    if (lower.includes('admin')) return 'ORG_ADMIN';
    if (lower.includes('hr')) return 'HR_MANAGER';
    if (lower.includes('manager')) return 'MANAGER';
    if (lower.includes('lead')) return 'TEAM_LEAD';
    if (lower.includes('finance')) return 'FINANCE_EXECUTIVE';
    if (lower.includes('it')) return 'IT_ADMINISTRATOR';
    if (lower.includes('audit')) return 'AUDITOR';
    return 'EMPLOYEE';
  };

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem('verdant_mock_user');
      if (stored) {
        try {
          const mockUser = JSON.parse(stored);
          const fbUser = {
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.displayName || 'Mock User',
            photoURL: null,
            getIdToken: async () => `mock-token:${mockUser.email}:${mockUser.uid}`,
          } as unknown as FirebaseUser;
          setFirebaseUser(fbUser);
          
          fbUser.getIdToken().then((token) => {
            syncUserAction(token || '').then((result) => {
              const finalRole = (result.success && result.user) 
                ? result.user.role 
                : getMockRole(mockUser.email);
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                role: finalRole,
              });
              setRole(finalRole);
              setLoading(false);
            }).catch(() => {
              const finalRole = getMockRole(mockUser.email);
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                role: finalRole,
              });
              setRole(finalRole);
              setLoading(false);
            });
          });
        } catch {
          localStorage.removeItem('verdant_mock_user');
          setFirebaseUser(null);
          setLoading(false);
        }
      } else {
        setFirebaseUser(null);
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          
          // Call Next.js Server Action to sync user and retrieve database role
          const result = await syncUserAction(token);

          if (result.success && result.user) {
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              role: result.user.role,
            });
            setRole(result.user.role);
          } else {
            console.warn('Sync failed, using fallback role:', result.error);
            const fallbackRole = getMockRole(fbUser.email);
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              role: fallbackRole,
            });
            setRole(fallbackRole);
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          const fallbackRole = getMockRole(fbUser.email);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: fallbackRole,
          });
          setRole(fallbackRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isMockMode]);

  // Client-side Router Guard
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(pathname);
    const isProtectedRoute = pathname === '/' || pathname.startsWith('/dashboard');

    if (!firebaseUser && isProtectedRoute) {
      router.push('/login');
    } else if (firebaseUser && isAuthRoute) {
      router.push('/dashboard');
    }
  }, [firebaseUser, loading, pathname, router]);

  const loginWithEmail = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    try {
      if (isMockMode) {
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: email.split('@')[0],
        };
        localStorage.setItem('verdant_mock_user', JSON.stringify(mockUser));
        
        const fbUser = {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: null,
          getIdToken: async () => `mock-token:${mockUser.email}:${mockUser.uid}`,
        } as unknown as FirebaseUser;
        setFirebaseUser(fbUser);
        
        try {
          const result = await syncUserAction(`mock-token:${mockUser.email}:${mockUser.uid}`);
          const finalRole = (result.success && result.user)
            ? result.user.role
            : getMockRole(mockUser.email);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: finalRole,
          });
          setRole(finalRole);
        } catch {
          const finalRole = getMockRole(mockUser.email);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: finalRole,
          });
          setRole(finalRole);
        }
        return;
      }

      await setPersistence(
        auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: email.split('@')[0],
        };
        localStorage.setItem('verdant_mock_user', JSON.stringify(mockUser));
        
        const fbUser = {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: null,
          getIdToken: async () => `mock-token:${mockUser.email}:${mockUser.uid}`,
        } as unknown as FirebaseUser;
        setFirebaseUser(fbUser);
        
        try {
          const result = await syncUserAction(`mock-token:${mockUser.email}:${mockUser.uid}`);
          const finalRole = (result.success && result.user)
            ? result.user.role
            : getMockRole(mockUser.email);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: finalRole,
          });
          setRole(finalRole);
        } catch {
          const finalRole = getMockRole(mockUser.email);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: finalRole,
          });
          setRole(finalRole);
        }
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
          email: 'google-user@example.com',
          displayName: 'Google User',
        };
        localStorage.setItem('verdant_mock_user', JSON.stringify(mockUser));
        
        const fbUser = {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: null,
          getIdToken: async () => `mock-token:${mockUser.email}:${mockUser.uid}`,
        } as unknown as FirebaseUser;
        setFirebaseUser(fbUser);
        
        try {
          const result = await syncUserAction(`mock-token:${mockUser.email}:${mockUser.uid}`);
          const finalRole = (result.success && result.user)
            ? result.user.role
            : 'EMPLOYEE';
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: finalRole,
          });
          setRole(finalRole);
        } catch {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: 'EMPLOYEE',
          });
          setRole('EMPLOYEE');
        }
        return;
      }

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (isMockMode) return;
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (isMockMode) return;
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        localStorage.removeItem('verdant_mock_user');
        setUser(null);
        setFirebaseUser(null);
        setRole(null);
        return;
      }

      await fbSignOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    if (isMockMode) {
      const stored = localStorage.getItem('verdant_mock_user');
      if (stored) {
        const mockUser = JSON.parse(stored);
        return `mock-token:${mockUser.email}:${mockUser.uid}`;
      }
      return null;
    }
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      role, 
      signOut, 
      getIdToken,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      resetPassword,
      sendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
