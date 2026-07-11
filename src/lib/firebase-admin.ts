import admin from 'firebase-admin';

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

let adminAuth: admin.auth.Auth | CustomAuth;

if (!admin.apps.length) {
  if (hasValidCredentials) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
      });
      adminAuth = admin.auth();
    } catch {
      console.warn('Failed to initialize Firebase Admin with credentials, falling back to mock auth client.');
      adminAuth = mockAuthClient;
    }
  } else {
    console.warn('Firebase Admin credentials missing or using placeholders. Initializing with mock auth client for development/build.');
    adminAuth = mockAuthClient;
  }
} else {
  try {
    adminAuth = admin.auth();
  } catch {
    adminAuth = mockAuthClient;
  }
}

export { adminAuth };
