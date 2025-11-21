# Firebase Migration & Deployment Guide

## Overview

This guide walks you through migrating your existing Firebase data to the new OGLMS Dashboard structure and deploying the complete system.

---

## Current Status

### ✅ Completed
- [x] Dashboard UI (index.html, create-well.html)
- [x] Cloud Functions (wellDashboard.js with 5 functions)
- [x] Firestore security rules
- [x] Firestore indexes configuration
- [x] Firebase config helper (firebase-config.js)
- [x] Mock data for testing

### ⏳ Pending
- [ ] Firebase authentication (login required)
- [ ] Add Firebase config credentials
- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore rules & indexes
- [ ] Migrate existing data (if needed)

---

## Step-by-Step Deployment

### Step 1: Authenticate with Firebase

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Re-authenticate with Firebase
firebase login --reauth

# Verify you're on the correct project
firebase use redcell-gabriella
```

---

### Step 2: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **redcell-gabriella**
3. Click gear icon ⚙️ > **Project settings**
4. Scroll to "Your apps" section
5. If you don't have a web app, click **Add app** > **Web** (</>) and register
6. Copy your Firebase configuration

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

---

### Step 3: Update Firebase Config in Dashboard

Edit: `/public/dashboard/firebase-config.js`

Replace lines 13-18 with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // ← Replace
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID", // ← Replace
  appId: "YOUR_ACTUAL_APP_ID"              // ← Replace
};
```

---

### Step 4: Deploy Firestore Rules & Indexes

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Or deploy both at once
firebase deploy --only firestore
```

**Expected output:**
```
✔  firestore: deployed indexes in firestore.indexes.json successfully
✔  firestore: deployed rules firestore.rules successfully
```

---

### Step 5: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:saveCompleteWell,functions:getOrganisationWells
```

**Expected output:**
```
✔  functions[saveCompleteWell(us-central1)] Successful create operation.
✔  functions[getOrganisationWells(us-central1)] Successful create operation.
✔  functions[getWellDetails(us-central1)] Successful create operation.
✔  functions[updateWellStatus(us-central1)] Successful create operation.
✔  functions[deleteWell(us-central1)] Successful create operation.
```

**New Cloud Functions Deployed:**
1. `saveCompleteWell` - Save well from wizard
2. `getOrganisationWells` - Load wells for dashboard
3. `getWellDetails` - Get complete well data
4. `updateWellStatus` - Update well status
5. `deleteWell` - Archive well

---

### Step 6: Set Up Authentication Custom Claims

Your security rules rely on `organisationId` being stored in user tokens. You need to set custom claims for users.

#### Option A: Using Firebase Admin SDK (Node.js script)

Create: `/scripts/setUserClaims.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setUserClaims(email, organisationId, role = 'user') {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      organisationId,
      role
    });

    console.log(`✅ Custom claims set for ${email}`);
    console.log(`   - organisationId: ${organisationId}`);
    console.log(`   - role: ${role}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Set claims for your users
setUserClaims('mckay@metamorphic.energy', 'org-metamorphic-001', 'admin');

// Add more users as needed
// setUserClaims('user@example.com', 'org-metamorphic-001', 'user');
```

Run:
```bash
node scripts/setUserClaims.js
```

#### Option B: Using Cloud Function (triggered on user creation)

Add to `/functions/auth.js`:

```javascript
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Get organisation from user data or default
  const organisationId = 'org-metamorphic-001'; // Set dynamically based on signup

  await admin.auth().setCustomUserClaims(user.uid, {
    organisationId,
    role: 'user'
  });
});
```

---

### Step 7: Audit Existing Firestore Data

Let's check what data you already have:

```bash
# List all collections
firebase firestore:list

# Export existing data (backup)
firebase firestore:export gs://redcell-gabriella.appspot.com/firestore-backup-$(date +%Y%m%d)
```

**Common collections you might have:**
- `people` (users)
- `organisations`
- `wells` (may need migration)
- `ccis-conversations`
- Other legacy collections

---

### Step 8: Data Migration (If Needed)

If you have existing `wells` data that doesn't match the new structure, create a migration script.

Create: `/scripts/migrateWells.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateWells() {
  console.log('Starting well data migration...');

  try {
    // Get all existing wells
    const snapshot = await db.collection('wells').get();

    console.log(`Found ${snapshot.size} wells to check`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const updates = {};

      // Add missing fields with defaults
      if (!data.hasOwnProperty('isActive')) {
        updates.isActive = true;
      }

      if (!data.hasOwnProperty('version')) {
        updates.version = 1;
      }

      if (!data.hasOwnProperty('volumes')) {
        updates.volumes = {
          stringVolume: 0,
          annularVolume: 0,
          totalSystemVolume: 0,
          lastCalculated: admin.firestore.FieldValue.serverTimestamp()
        };
      }

      if (!data.hasOwnProperty('status')) {
        updates.status = 'drilling';
      }

      if (!data.hasOwnProperty('unitSystem')) {
        updates.unitSystem = 'imperial';
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, {
          ...updates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updateCount++;
        console.log(`  → Will update: ${data.wellName || doc.id}`);
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updateCount} wells`);
    } else {
      console.log('✅ No updates needed - all wells are current');
    }

  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateWells()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

Run:
```bash
node scripts/migrateWells.js
```

---

### Step 9: Deploy Hosting

```bash
# Deploy the dashboard pages to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

**Expected output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/redcell-gabriella/overview
Hosting URL: https://redcell-gabriella.web.app
```

---

### Step 10: Test the Dashboard

1. **Open the dashboard:**
   ```
   https://redcell-gabriella.web.app/dashboard/
   ```

2. **Test authentication:**
   - You'll need to create a login page or use Firebase UI
   - For now, you can test locally with mock data

3. **Test locally with emulators (optional):**
   ```bash
   # Start Firebase emulators
   firebase emulators:start

   # Open dashboard at http://localhost:5000/dashboard/
   ```

4. **Create a test well:**
   - Click "+ Create New Well"
   - Fill out all 5 steps
   - Click "Save & Create Well"
   - Should redirect to dashboard with new well listed

---

## Data Structure Comparison

### Old Structure (if you have existing data)
```
wells/
  {wellId}/
    name: "Well A-12"
    depth: 11000
    ... (flat structure, inconsistent fields)
```

### New Structure
```
wells/
  {wellId}/
    wellName: "Maersk Voyager - Well A-12"
    wellNumber: "A-12"
    organisationId: "org-metamorphic-001"
    rigName: "Maersk Voyager"
    status: "drilling"
    totalDepth: 11000
    currentDepth: 8500
    volumes: { stringVolume, annularVolume, totalSystemVolume }
    ... (30+ structured fields)

well-string-configs/
  {configId}/
    wellId: "well-001"
    components: [ ... ]
    pumpData: { ... }
    totals: { ... }

well-sections/
  {sectionId}/
    wellId: "well-001"
    sections: [ ... ]

bop-configurations/
  {bopId}/
    wellId: "well-001"
    stackType: "subsea"
    ... (BOP details)

activity-log/
  {activityId}/
    wellId: "well-001"
    activityType: "well-created"
    timestamp: ...
```

---

## Security Rules Summary

### What's Protected

✅ **wells** - Only users in the same organisation can read/write
✅ **well-string-configs** - Linked to well access
✅ **well-sections** - Linked to well access
✅ **bop-configurations** - Linked to well access
✅ **activity-log** - Organisation-scoped, immutable
✅ **people** - Users can read own profile + same org

### Required Token Claims

Users MUST have these custom claims set:
- `organisationId` - Required for all well operations
- `role` - Optional, "admin" for admin operations

---

## Troubleshooting

### Issue: "Authentication Error: credentials no longer valid"

**Solution:**
```bash
firebase login --reauth
```

### Issue: "Permission denied" when accessing wells

**Check:**
1. User is authenticated
2. User has `organisationId` custom claim set
3. Well belongs to user's organisation
4. Security rules are deployed

**Test custom claims:**
```javascript
firebase.auth().currentUser.getIdTokenResult()
  .then(token => console.log(token.claims));
```

### Issue: "Firebase not configured" warning in console

**Solution:**
Update `/public/dashboard/firebase-config.js` with real API keys (Step 3)

### Issue: Firestore index missing error

**Solution:**
```bash
firebase deploy --only firestore:indexes
```

Or click the link in the error message to auto-create the index.

### Issue: Function deployment timeout

**Solution:**
Deploy functions one at a time:
```bash
firebase deploy --only functions:saveCompleteWell
firebase deploy --only functions:getOrganisationWells
# etc.
```

---

## Testing Checklist

### Local Testing (before deployment)
- [ ] Open `index.html` locally - should show 2 mock wells
- [ ] Click filters - wells should filter correctly
- [ ] Click "+ Create New Well" - wizard should open
- [ ] Complete all 5 wizard steps
- [ ] Submit form - should show success alert (mock mode)

### Post-Deployment Testing
- [ ] Open `https://redcell-gabriella.web.app/dashboard/`
- [ ] User can log in (authentication working)
- [ ] Dashboard loads wells from Firestore
- [ ] Create new well via wizard
- [ ] New well appears in dashboard immediately
- [ ] Volumes are calculated correctly
- [ ] Filter wells by status
- [ ] Click well card to view details (when workspace built)

---

## Next Steps After Deployment

### Phase 1: Authentication ✅ Deploy first
1. Create login page (`/public/login.html`)
2. Add Firebase UI for authentication
3. Set user custom claims (organisationId)
4. Test protected routes

### Phase 2: Well Workspace
1. Create well detail page (`/public/dashboard/well-workspace.html`)
2. Show complete well configuration
3. Edit well properties
4. View activity history

### Phase 3: Calculator Integration
1. Auto-populate calculator from well data
2. Save calculator results back to well
3. Link kill sheets to well records

### Phase 4: Advanced Features
1. Real-time collaboration
2. Offline support
3. Mobile app (PWA)
4. Automated alerts
5. Advanced reporting

---

## Commands Quick Reference

```bash
# Login
firebase login --reauth

# Check project
firebase use

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore

# Start local emulators
firebase emulators:start

# View logs
firebase functions:log
firebase functions:log --only saveCompleteWell

# Backup Firestore
firebase firestore:export gs://redcell-gabriella.appspot.com/backup

# List Firestore collections
firebase firestore:list
```

---

## Support & Documentation

- **Firebase Console:** https://console.firebase.google.com/project/redcell-gabriella
- **Dashboard README:** `/public/dashboard/README.md`
- **Cloud Functions:** `/functions/wellDashboard.js`
- **Security Rules:** `/firestore.rules`
- **Test Checklist:** `/public/dashboard/TEST-CHECKLIST.md`

---

**Version:** 1.0
**Date:** November 21, 2025
**Status:** Ready for Deployment
