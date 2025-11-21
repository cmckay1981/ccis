# Deployment & Migration Scripts

This directory contains helper scripts for deploying and managing your OGLMS Dashboard Firebase project.

---

## 🚀 Quick Start

### 1. First-Time Setup

```bash
# Download service account key from Firebase Console
# Save as: serviceAccountKey.json (in project root)

# Set user custom claims (required for security rules)
node scripts/setUserClaims.js

# Audit existing data
node scripts/migrateWells.js audit
```

### 2. Deploy to Firebase

```bash
# Interactive deployment script
./scripts/deploy.sh

# Or manually:
firebase deploy --only firestore        # Deploy rules & indexes
firebase deploy --only functions        # Deploy Cloud Functions
firebase deploy --only hosting          # Deploy dashboard UI
firebase deploy                         # Deploy everything
```

---

## 📜 Available Scripts

### `setUserClaims.js`

**Purpose:** Set custom claims (`organisationId`, `role`) on user accounts

**Why needed:** Firestore security rules require these claims to determine access

**Usage:**
```bash
node scripts/setUserClaims.js
```

**Before running:**
1. Edit the script and add your user emails
2. Make sure you have `serviceAccountKey.json` in project root

**Example:**
```javascript
// In setUserClaims.js, update this section:
await setUserClaims('your-email@example.com', 'org-your-org-001', 'admin');
```

**After running:**
- Users must sign out and back in for claims to take effect
- Or call: `await firebase.auth().currentUser.getIdToken(true)`

---

### `migrateWells.js`

**Purpose:** Migrate existing well data to new schema structure

**Commands:**

```bash
# Check existing data without making changes
node scripts/migrateWells.js audit

# Preview migration changes (dry run)
node scripts/migrateWells.js migrate

# Actually perform migration
node scripts/migrateWells.js --commit

# Create a sample test well
node scripts/migrateWells.js create-sample

# Delete all test wells
node scripts/migrateWells.js cleanup
```

**What it does:**
- Adds missing required fields (`isActive`, `version`, `status`)
- Adds `volumes` structure if missing
- Sets default `organisationId` if missing
- Normalizes field names
- Adds timestamps

**Safety:**
- Always run `audit` first
- Run `migrate` (dry run) to preview changes
- Only use `--commit` when you're sure
- Creates backup automatically (via Firestore export recommended)

---

### `deploy.sh`

**Purpose:** Interactive deployment helper

**Usage:**
```bash
./scripts/deploy.sh
```

**Options:**
1. Deploy everything (hosting + functions + firestore)
2. Deploy hosting only (dashboard UI)
3. Deploy Cloud Functions only
4. Deploy Firestore rules & indexes
5. Deploy functions + Firestore (skip hosting)
6. Test with emulators (local development)
7. Cancel

**Requirements:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Correct project selected: `firebase use redcell-gabriella`

---

## 🔐 Service Account Key Setup

### Download from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `redcell-gabriella`
3. Click gear icon ⚙️ > **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save as: `/Users/whitemckay/Projects/gabriella-functions/serviceAccountKey.json`

### Security Warning

⚠️ **NEVER commit `serviceAccountKey.json` to git!**

It's already in `.gitignore`, but double-check:
```bash
cat .gitignore | grep serviceAccountKey
```

Should show:
```
serviceAccountKey.json
```

---

## 📋 Pre-Deployment Checklist

### Before deploying:

- [ ] Firebase CLI installed and logged in
- [ ] Correct project selected (`firebase use`)
- [ ] Firebase config added to `public/dashboard/firebase-config.js`
- [ ] Service account key downloaded (for scripts)
- [ ] User custom claims set (via `setUserClaims.js`)
- [ ] Existing data audited (via `migrateWells.js audit`)
- [ ] Functions tested locally (optional: `firebase emulators:start`)

---

## 🧪 Local Testing with Emulators

### Start emulators:
```bash
firebase emulators:start
```

### Access points:
- **Dashboard:** http://localhost:5000/dashboard/
- **Functions:** http://localhost:5001
- **Firestore:** http://localhost:8080
- **Auth:** http://localhost:9099
- **Emulator UI:** http://localhost:4000

### Config for emulators:

The dashboard automatically detects localhost and connects to emulators.

See `public/dashboard/firebase-config.js:30-35`:
```javascript
if (location.hostname === 'localhost' && location.port === '5001') {
  db.useEmulator('localhost', 8080);
  functions.useEmulator('localhost', 5001);
  auth.useEmulator('http://localhost:9099');
}
```

---

## 🔄 Migration Workflow

### If you have existing data:

```bash
# Step 1: Backup current data
firebase firestore:export gs://redcell-gabriella.appspot.com/backup-$(date +%Y%m%d)

# Step 2: Audit data
node scripts/migrateWells.js audit

# Step 3: Preview migration
node scripts/migrateWells.js migrate

# Step 4: Apply migration
node scripts/migrateWells.js --commit

# Step 5: Verify
node scripts/migrateWells.js audit
```

### If starting fresh:

```bash
# Create a sample well for testing
node scripts/migrateWells.js create-sample

# Delete it when done
node scripts/migrateWells.js cleanup
```

---

## 📊 Post-Deployment Verification

### Check functions deployed:
```bash
firebase functions:list
```

Should show:
- `saveCompleteWell`
- `getOrganisationWells`
- `getWellDetails`
- `updateWellStatus`
- `deleteWell`
- (plus existing functions)

### Check Firestore rules:
```bash
firebase firestore:rules:list
```

### View function logs:
```bash
firebase functions:log
firebase functions:log --only saveCompleteWell
```

### Test dashboard:
1. Open: `https://redcell-gabriella.web.app/dashboard/`
2. Create test well via wizard
3. Check Firestore console for new documents
4. Verify well appears in dashboard

---

## 🐛 Troubleshooting

### "Authentication Error: credentials no longer valid"
```bash
firebase login --reauth
```

### "Permission denied" when running scripts
```bash
chmod +x scripts/deploy.sh
```

### "Cannot find module 'serviceAccountKey.json'"
Download from Firebase Console (see "Service Account Key Setup" above)

### "User does not have permission to access wells"
Run `setUserClaims.js` to add `organisationId` claim to user

### Functions not deploying
```bash
# Check functions directory
cd functions
npm install
npm run lint  # Check for errors
cd ..

# Deploy one at a time
firebase deploy --only functions:saveCompleteWell
```

---

## 📞 Support

- **Main Guide:** `/FIREBASE-MIGRATION-GUIDE.md`
- **Dashboard Docs:** `/public/dashboard/README.md`
- **Functions Code:** `/functions/wellDashboard.js`
- **Security Rules:** `/firestore.rules`

---

**Version:** 1.0
**Updated:** November 21, 2025
