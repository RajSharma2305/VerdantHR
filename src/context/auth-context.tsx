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

  useEffect(() => {
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
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              role: 'EMPLOYEE',
            });
            setRole('EMPLOYEE');
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: 'EMPLOYEE',
          });
          setRole('EMPLOYEE');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
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
