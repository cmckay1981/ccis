/**
 * Set Custom Claims for Firebase Users
 *
 * This script sets organisationId and role custom claims on user accounts.
 * These claims are required for the Firestore security rules to work.
 *
 * Setup:
 * 1. Download your service account key from Firebase Console
 * 2. Save as serviceAccountKey.json in project root
 * 3. Run: node scripts/setUserClaims.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Error loading service account key:');
  console.error('   Please download your service account key from:');
  console.error('   Firebase Console > Project Settings > Service Accounts');
  console.error('   Save it as: serviceAccountKey.json in project root');
  process.exit(1);
}

/**
 * Set custom claims for a user
 */
async function setUserClaims(email, organisationId, role = 'user') {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      organisationId,
      role
    });

    console.log(`✅ Custom claims set for ${email}`);
    console.log(`   - UID: ${user.uid}`);
    console.log(`   - organisationId: ${organisationId}`);
    console.log(`   - role: ${role}`);

    return { success: true, uid: user.uid };
  } catch (error) {
    console.error(`❌ Error setting claims for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * List all users and their claims
 */
async function listUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);

    console.log('\n📋 All Users:');
    console.log('─'.repeat(80));

    for (const user of listUsersResult.users) {
      const claims = user.customClaims || {};

      console.log(`\nEmail: ${user.email || 'No email'}`);
      console.log(`UID: ${user.uid}`);
      console.log(`Name: ${user.displayName || 'Not set'}`);
      console.log(`Organisation: ${claims.organisationId || 'NOT SET ⚠️'}`);
      console.log(`Role: ${claims.role || 'NOT SET ⚠️'}`);
      console.log(`Created: ${new Date(user.metadata.creationTime).toLocaleDateString()}`);
    }

    console.log('\n─'.repeat(80));
    console.log(`Total users: ${listUsersResult.users.length}\n`);
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

/**
 * Remove claims from a user
 */
async function removeUserClaims(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, null);
    console.log(`✅ Custom claims removed from ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error removing claims for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// MAIN SCRIPT - Configure your users here
// ============================================

async function main() {
  console.log('\n🚀 Setting up user custom claims...\n');

  // Example 1: Set admin for your account
  await setUserClaims(
    'mckay@metamorphic.energy',
    'org-metamorphic-001',
    'admin'
  );

  // Example 2: Add more users
  // await setUserClaims(
  //   'user@example.com',
  //   'org-metamorphic-001',
  //   'user'
  // );

  // Example 3: Different organisation
  // await setUserClaims(
  //   'other@company.com',
  //   'org-other-company-002',
  //   'admin'
  // );

  // List all users to verify
  console.log('\n');
  await listUsers();

  console.log('✅ Done!\n');
  console.log('⚠️  IMPORTANT: Users must sign out and sign back in for claims to take effect.');
  console.log('   Or call: await firebase.auth().currentUser.getIdToken(true);\n');
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
