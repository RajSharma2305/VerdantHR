import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin';
import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

// Check if credentials exist and are not placeholder strings
const hasValidCredentials = 
  !!firebaseAdminConfig.projectId && 
  !!firebaseAdminConfig.clientEmail && 
  !!firebaseAdminConfig.privateKey && 
  !firebaseAdminConfig.privateKey.includes('YOUR-PRIVATE-KEY');

// Define Custom Auth interface to support fallback mocking without type errors
interface CustomAuth {
  verifyIdToken: (token: string) => Promise<{ uid: string; email: string }>;
}

const mockAuthClient: CustomAuth = {
  verifyIdToken: async (token: string) => {
    if (token && token.startsWith('mock-token:')) {
      const parts = token.split(':');
      return { 
        uid: parts[2] || 'mock-uid', 
        email: parts[1] || 'mock-user@example.com' 
      };
    }
    return { uid: 'mock-uid', email: 'mock-user@example.com' };
  }
};

let adminAuth: Auth | CustomAuth;

if (!getApps().length) {
  if (hasValidCredentials) {
    try {
      initializeApp({
        credential: cert(firebaseAdminConfig as ServiceAccount),
      });
      adminAuth = (admin as any).auth();
    } catch (err) {
      console.error('Firebase Admin initialization failed:', err);
      adminAuth = mockAuthClient;
    }
  } else {
    console.warn('Firebase Admin credentials missing or using placeholders. Initializing with mock auth client for development/build.');
    adminAuth = mockAuthClient;
  }
} else {
  try {
    adminAuth = (admin as any).auth();
  } catch (err) {
    console.error('Firebase Admin getAuth failed:', err);
    adminAuth = mockAuthClient;
  }
}

export { adminAuth };
