import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in the private key string
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); // In case we ever need it, though we use Prisma
