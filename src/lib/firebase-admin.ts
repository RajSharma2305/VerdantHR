// Define Custom Auth interface to support fallback mocking without type errors
export interface CustomAuth {
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

let cachedAuth: any = null;

export async function getAdminAuth() {
  if (cachedAuth) return cachedAuth;

  try {
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    };

    const hasValidCredentials = 
      !!firebaseAdminConfig.projectId && 
      !!firebaseAdminConfig.clientEmail && 
      !!firebaseAdminConfig.privateKey && 
      !firebaseAdminConfig.privateKey.includes('YOUR-PRIVATE-KEY');

    if (hasValidCredentials) {
      // Dynamically import Firebase Admin modules to prevent compile-time ESM require errors
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const { getAuth } = await import('firebase-admin/auth');

      if (!getApps().length) {
        initializeApp({
          credential: cert(firebaseAdminConfig as any),
        });
      }
      cachedAuth = getAuth();
    } else {
      console.warn('Firebase Admin credentials missing or using placeholders. Initializing with mock auth client.');
      cachedAuth = mockAuthClient;
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK, falling back to mock auth client. Error:', err);
    cachedAuth = mockAuthClient;
  }

  return cachedAuth;
}
