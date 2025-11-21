# OGLMS Dashboard - Deployment Quick Start

**Goal:** Get your dashboard live on Firebase in 20 minutes

---

## ⚡ 5-Minute Version

```bash
# 1. Login & verify project
firebase login --reauth
firebase use

# 2. Get Firebase config from Console, update firebase-config.js

# 3. Deploy
firebase deploy

# 4. Done! Open: https://redcell-gabriella.web.app/dashboard/
```

---

## 📋 20-Minute Full Setup

### Step 1: Firebase Login (2 min)

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Re-authenticate
firebase login --reauth

# Verify project
firebase use
# Should show: "Now using project redcell-gabriella"

# If wrong project:
firebase use redcell-gabriella
```

---

### Step 2: Get Firebase Config (3 min)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select **redcell-gabriella**
3. Click ⚙️ (gear icon) > **Project settings**
4. Scroll to "Your apps" section
5. If no web app exists:
   - Click **Add app** > Web icon (</>)
   - Name it: "OGLMS Dashboard"
   - Click **Register app**
6. Copy the config object

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456..."
};
```

7. Edit `/public/dashboard/firebase-config.js`
8. Replace lines 13-18 with your values

Before:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← Replace
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Replace
  appId: "YOUR_APP_ID"              // ← Replace
};
```

After:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",             // ← Your real key
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "123456789012",  // ← Your real ID
  appId: "1:123456789012:web:abc..."  // ← Your real app ID
};
```

---

### Step 3: Download Service Account Key (2 min)

**Only needed for scripts (user claims, migration)**

1. Firebase Console > **Project settings**
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** (confirms download)
5. Save as: `/Users/whitemckay/Projects/gabriella-functions/serviceAccountKey.json`

⚠️ Keep this file secret! It's already in `.gitignore`.

---

### Step 4: Set User Permissions (3 min)

Edit `scripts/setUserClaims.js` (line 129):

```javascript
// Replace with your email
await setUserClaims(
  'mckay@metamorphic.energy',      // ← Your email
  'org-metamorphic-001',            // ← Your org ID
  'admin'                           // ← Your role
);
```

Run:
```bash
node scripts/setUserClaims.js
```

Expected output:
```
✅ Firebase Admin initialized
✅ Custom claims set for mckay@metamorphic.energy
   - organisationId: org-metamorphic-001
   - role: admin

📋 All Users:
────────────────────────────────────────────────────
Email: mckay@metamorphic.energy
UID: abc123...
Organisation: org-metamorphic-001
Role: admin
────────────────────────────────────────────────────
✅ Done!
```

---

### Step 5: Check Existing Data (2 min)

```bash
node scripts/migrateWells.js audit
```

**If you have no wells:**
```
Found 0 wells in Firestore
No wells found. Database is clean for new structure.
```
✅ You're good to go!

**If you have existing wells:**
```
Found 3 wells in Firestore

📍 Well A-12 (well-001)
   organisationId: ❌ MISSING
   volumes: ⚠️  Missing
```
⚠️ Run migration:
```bash
node scripts/migrateWells.js migrate      # Preview changes
node scripts/migrateWells.js --commit     # Apply changes
```

---

### Step 6: Deploy to Firebase (5 min)

#### Option A: Interactive Script (Recommended)

```bash
./scripts/deploy.sh
```

Select: **1) Everything**

#### Option B: Manual Deployment

```bash
# Deploy in order:
firebase deploy --only firestore        # Rules & indexes first (30 sec)
firebase deploy --only functions        # Cloud Functions (2-3 min)
firebase deploy --only hosting          # Dashboard UI (1 min)
```

Expected output:
```
✔  firestore: deployed rules successfully
✔  firestore: deployed indexes successfully

✔  functions[saveCompleteWell(us-central1)] Successful create
✔  functions[getOrganisationWells(us-central1)] Successful create
✔  functions[getWellDetails(us-central1)] Successful create
✔  functions[updateWellStatus(us-central1)] Successful create
✔  functions[deleteWell(us-central1)] Successful create

✔  hosting: deployed to redcell-gabriella

✨ Deploy complete!

Hosting URL: https://redcell-gabriella.web.app
```

---

### Step 7: Test the Dashboard (3 min)

1. **Open the dashboard:**
   ```
   https://redcell-gabriella.web.app/dashboard/
   ```

2. **You should see:**
   - ✅ Dashboard loads (no errors)
   - ✅ Firebase connected (check console: no "Firebase not configured" warning)
   - ✅ No wells yet (empty state) OR existing wells if you had them

3. **Create a test well:**
   - Click **"+ Create New Well"**
   - Fill Step 1: "Test Well X-99"
   - Fill Step 2: Add casing strings
   - Fill Step 3: Add drill string components
   - Fill Step 4: Select BOP type
   - Step 5: Review and **"Save & Create Well"**

4. **Verify:**
   - ✅ Success message appears
   - ✅ Dashboard shows new well
   - ✅ Well persists on page refresh

5. **Check Firestore:**
   - Firebase Console > **Firestore Database**
   - See new documents in:
     - `wells/` collection
     - `well-string-configs/` collection
     - `well-sections/` collection
     - `bop-configurations/` collection
     - `activity-log/` collection

---

## 🎉 Success! What You Can Do Now

### Dashboard Features:
- ✅ Create new wells via wizard
- ✅ View all wells in organisation
- ✅ Filter by status (Active, Drilling, Completed)
- ✅ See well volumes and operations
- ✅ Open volume calculator (links to calculator)
- ✅ Data persists forever
- ✅ Multi-user collaboration
- ✅ Audit trail of all actions

### Next Steps:
1. Create more wells
2. Invite team members (add them via `setUserClaims.js`)
3. Build Well Workspace (detailed view)
4. Auto-populate calculator from well data
5. Create login page

---

## 🐛 Troubleshooting

### Dashboard shows "Firebase not configured"

**Problem:** API keys not updated in firebase-config.js

**Fix:**
```bash
# Edit public/dashboard/firebase-config.js
# Replace YOUR_API_KEY, YOUR_APP_ID, etc. with real values
```

---

### "Permission denied" when creating well

**Problem:** User doesn't have `organisationId` custom claim

**Fix:**
```bash
node scripts/setUserClaims.js
```

Then sign out and back in (or run in browser console):
```javascript
await firebase.auth().currentUser.getIdToken(true);
location.reload();
```

---

### "Authentication Error: credentials no longer valid"

**Problem:** Firebase CLI session expired

**Fix:**
```bash
firebase login --reauth
```

---

### Function deployment fails

**Problem:** NPM dependencies or syntax errors

**Fix:**
```bash
cd functions
npm install
npm run lint
cd ..

# Deploy one function at a time to isolate error
firebase deploy --only functions:saveCompleteWell
```

---

### Well created but doesn't appear

**Problem:** Security rules blocking read access

**Fix:**
1. Check user has `organisationId` claim (run `setUserClaims.js`)
2. Check well has correct `organisationId` field
3. Check Firestore rules deployed: `firebase deploy --only firestore:rules`

---

### "Cannot find module 'serviceAccountKey.json'"

**Problem:** Service account key not downloaded

**Fix:** Download from Firebase Console > Project Settings > Service Accounts

---

## 📚 Full Documentation

- **This guide:** Quick deployment steps
- **FIREBASE-SETUP-SUMMARY.md:** Complete overview of what's built
- **FIREBASE-MIGRATION-GUIDE.md:** Detailed deployment & migration guide
- **scripts/README.md:** How to use helper scripts
- **public/dashboard/README.md:** Dashboard features & testing

---

## 💬 Need Help?

### Check Logs:
```bash
# Function logs
firebase functions:log
firebase functions:log --only saveCompleteWell

# Hosting logs
firebase hosting:channel:list
```

### Verify Deployment:
```bash
# List deployed functions
firebase functions:list

# Check Firestore rules
firebase firestore:rules:list
```

### Test Locally:
```bash
# Start emulators
firebase emulators:start

# Open dashboard at:
# http://localhost:5000/dashboard/
```

---

## ✅ Deployment Checklist

Mark off as you complete:

- [ ] Firebase CLI installed & authenticated
- [ ] Firebase config added to `firebase-config.js`
- [ ] Service account key downloaded (for scripts)
- [ ] User custom claims set (via `setUserClaims.js`)
- [ ] Existing data migrated (if applicable)
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Dashboard deployed to hosting
- [ ] Test well created successfully
- [ ] Well persists on page refresh
- [ ] Multiple users can access (if applicable)

---

**Status:** 🟢 Ready to deploy

**Estimated time:** 20 minutes

**Start here:** Step 1 (Firebase Login)

**Questions?** See full docs in FIREBASE-SETUP-SUMMARY.md
