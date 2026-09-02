import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Ensure Firebase Admin is initialized
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        console.error('❌ Missing Firebase Admin credentials.');
        process.exit(1);
    }
}

async function makeAdmin(email: string) {
    try {
        console.log(`Searching for user: ${email}...`);
        const user = await admin.auth().getUserByEmail(email);
        
        console.log(`Setting admin custom claim for user ID: ${user.uid}...`);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        
        console.log(`✅ Successfully made ${email} an admin!`);
        console.log(`Note: The user needs to sign out and sign back in for the changes to take effect.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin claim:', error);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('Usage: npx ts-node src/scripts/makeAdmin.ts <email>');
    process.exit(1);
}

const targetEmail = args[0];
makeAdmin(targetEmail);
