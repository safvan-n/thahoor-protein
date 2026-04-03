import * as admin from 'firebase-admin';
import * as path from 'path';

// Path to the service account key file
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
        console.log('✅ Firebase Admin initialized from serviceAccountKey.json');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin from file:', error);
        
        // Fallback to Env Var if file is missing (useful for production)
        const serviceAccountData = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountData) {
            try {
                const serviceAccount = JSON.parse(serviceAccountData);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✅ Firebase Admin initialized from Environment Variable (Fallback)');
            } catch (envError) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT from .env:', envError);
            }
        }
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
