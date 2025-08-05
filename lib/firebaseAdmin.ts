import admin from "firebase-admin";

if (!admin.apps.length) {
  // Check if we have environment variables for Firebase Admin
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      } as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://draftconlogin-default-rtdb.firebaseio.com"
    });
  } else {
    // Fallback for development - you can add a service account key file if needed
    console.warn("Firebase Admin SDK not configured. Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables.");
  }
}

export default admin; 