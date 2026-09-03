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

async function createOrUpdateAdmin(email: string, password?: string) {
    try {
        let user: admin.auth.UserRecord;

        try {
            user = await admin.auth().getUserByEmail(email);
            console.log(`Found existing user with UID: ${user.uid}`);
            if (password) {
                await admin.auth().updateUser(user.uid, { password });
                console.log(`Updated password for ${email}`);
            }
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                if (!password) {
                    console.error(`❌ User ${email} does not exist. Please provide a password to create the user.`);
                    console.log(`Usage: npx ts-node src/scripts/createAdmin.ts <email> <password>`);
                    process.exit(1);
                }
                console.log(`User not found. Creating new Firebase Auth user for ${email}...`);
                user = await admin.auth().createUser({
                    email,
                    password,
                    displayName: 'Administrator',
                    emailVerified: true
                });
                console.log(`✅ Created user with UID: ${user.uid}`);
            } else {
                throw error;
            }
        }

        console.log(`Assigning { admin: true } custom claims to UID: ${user.uid}...`);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        console.log(`\n🎉 SUCCESS: ${email} is now an authorized Administrator!`);
        console.log(`You can now log in at /admin using this email and password.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to configure admin user:', err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: npx ts-node src/scripts/createAdmin.ts <email> [password]');
    process.exit(1);
}

const targetEmail = args[0];
const targetPassword = args[1];

createOrUpdateAdmin(targetEmail, targetPassword);
