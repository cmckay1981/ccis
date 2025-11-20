# 🔥 CCIS FIREBASE DEPLOYMENT PLAN

**Project:** redcell-gabriella
**Migration:** PHP/cPanel → Firebase Cloud Functions + Firestore + Hosting
**Date:** January 2026

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Testing Procedures](#testing-procedures)
5. [Rollback Plan](#rollback-plan)
6. [Final Architecture](#final-architecture)

---

## 📖 OVERVIEW

### What's Being Migrated

**FROM:**
- cPanel hosting at `/claymoreandcolt/`
- PHP proxy.php for agent routing
- Text file-based prompts
- Apache .htaccess configuration

**TO:**
- Firebase Hosting
- Cloud Functions (ccisProxy)
- Firestore database for prompts
- Serverless architecture

### Benefits

✅ **No more path duplication issues**
✅ **No cPanel upload headaches**
✅ **Dynamic prompt updates via Firestore**
✅ **Automatic scaling**
✅ **Better security (environment variables)**
✅ **Free SSL certificate**
✅ **Global CDN**

---

## 🔧 PREREQUISITES

### 1. Firebase CLI Authenticated

```bash
# Check authentication status
firebase login:list

# If not logged in:
firebase login
```

### 2. OpenAI API Key

You need to set your OpenAI API key as a Firebase secret:

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Set the secret
firebase functions:secrets:set OPENAI_API_KEY

# When prompted, paste your OpenAI API key
```

### 3. Service Account Key (For Migration Script)

Download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `redcell-gabriella`
3. Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as: `/Users/whitemckay/Projects/gabriella-functions/serviceAccountKey.json`

**⚠️ CRITICAL: Add to .gitignore immediately:**

```bash
echo "serviceAccountKey.json" >> .gitignore
```

### 4. Install Dependencies

```bash
cd /Users/whitemckay/Projects/gabriella-functions/functions
npm install
```

This will install the new `openai` package.

---

## 🚀 MIGRATION STEPS

### STEP 1: Run Firestore Migration

This migrates all CCIS prompts from text files to Firestore.

```bash
cd /Users/whitemckay/Projects/gabriella-functions/functions

# Run migration script
node ccis-migration.js
```

**Expected Output:**

```
🔥 CCIS FIRESTORE MIGRATION
============================

📦 Migrating KA.BA.AKH...
✅ KA.BA.AKH migrated successfully

📦 Migrating Leadership Intelligence...
✅ Leadership Intelligence migrated successfully
   Loaded X modules

📦 Migrating Situational Awareness...
✅ Situational Awareness migrated successfully
   Loaded X drills

📦 Creating placeholder prompts...
✅ Well Control Intelligence placeholder created
✅ Cyber Security Intelligence placeholder created
✅ Hospitality Concierge placeholder created

✅ MIGRATION COMPLETE

Firestore collection: ccis-prompts
Documents created:
  • kabaakh
  • leadership-intelligence
  • situational-awareness
  • well-control-intelligence
  • cyber-security
  • hospitality-concierge
```

**Verify in Firebase Console:**

1. Go to Firestore Database
2. Check `ccis-prompts` collection
3. Verify all 6 agent documents exist

---

### STEP 2: Copy CCIS Frontend Files

Copy all CCIS frontend files from cPanel mirror to Firebase public directory:

```bash
# Copy entire CCIS frontend
cp -r /Users/whitemckay/Projects/CCIS/cPanel-mirror/claymoreandcolt/ccis/* \
      /Users/whitemckay/Projects/gabriella-functions/public/ccis/

# Copy assets (CSS, JS, images)
cp -r /Users/whitemckay/Projects/CCIS/cPanel-mirror/claymoreandcolt/assets \
      /Users/whitemckay/Projects/gabriella-functions/public/

# The chat/index.html is already updated with Firebase API calls
# (already created in Step 7)
```

**IMPORTANT:** The `chat/index.html` file has already been generated with Firebase API endpoints. Do NOT overwrite it.

---

### STEP 3: Test Functions Locally

Before deploying, test the ccisProxy function locally:

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Start Firebase emulator
firebase emulators:start
```

**Test with curl:**

```bash
# Test KA.BA.AKH
curl -X POST http://localhost:5001/redcell-gabriella/us-central1/ccisProxy \
  -H "Content-Type: application/json" \
  -d '{"agent":"kabaakh","message":"Hello"}'

# Test Leadership Intelligence welcome
curl -X POST http://localhost:5001/redcell-gabriella/us-central1/ccisProxy \
  -H "Content-Type: application/json" \
  -d '{"agent":"leadership-intelligence","message":"__system_welcome__"}'
```

**Expected Response:**

```json
{
  "type": "response",
  "agent": "kabaakh",
  "reply": "[AI response from OpenAI]"
}
```

---

### STEP 4: Deploy Cloud Functions

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Deploy only the new ccisProxy function
firebase deploy --only functions:ccisProxy
```

**Expected Output:**

```
=== Deploying to 'redcell-gabriella'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (X KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: updating Node.js 22 function ccisProxy(us-central1)...
✔  functions[ccisProxy(us-central1)] Successful update operation.

✔  Deploy complete!
```

**Get Function URL:**

```bash
firebase functions:list
```

Copy the URL for `ccisProxy`. It will look like:

```
https://us-central1-redcell-gabriella.cloudfunctions.net/ccisProxy
```

---

### STEP 5: Deploy Firebase Hosting

```bash
# Deploy hosting
firebase deploy --only hosting
```

**Expected Output:**

```
=== Deploying to 'redcell-gabriella'...

i  deploying hosting
i  hosting[redcell-gabriella]: beginning deploy...
i  hosting[redcell-gabriella]: found X files in public
✔  hosting[redcell-gabriella]: file upload complete
i  hosting[redcell-gabriella]: finalizing version...
✔  hosting[redcell-gabriella]: version finalized
i  hosting[redcell-gabriella]: releasing new version...
✔  hosting[redcell-gabriella]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/redcell-gabriella/overview
Hosting URL: https://redcell-gabriella.web.app
```

---

### STEP 6: Test Live Deployment

**Test CCIS Chat Interface:**

1. Navigate to: `https://redcell-gabriella.web.app/ccis/chat/?agent=kabaakh`
2. Verify welcome message loads
3. Send test message: "Hello"
4. Verify agent responds
5. Test all 6 agents

**Test All Agents:**

```bash
# Test script
for agent in kabaakh leadership-intelligence situational-awareness well-control-intelligence cyber-security hospitality-concierge
do
  echo "Testing $agent..."
  curl -X POST https://redcell-gabriella.web.app/api/ccis \
    -H "Content-Type: application/json" \
    -d "{\"agent\":\"$agent\",\"message\":\"Hello\"}"
  echo "\n---\n"
done
```

---

## 🧪 TESTING PROCEDURES

### Functional Tests

- [ ] All 6 agents load correctly
- [ ] Welcome messages display
- [ ] User messages send successfully
- [ ] AI responses appear
- [ ] Themes change per agent
- [ ] Mobile sidebar works
- [ ] CSS loads properly
- [ ] No console errors

### Agent-Specific Tests

**KA.BA.AKH:**
- [ ] Emotional clarity responses
- [ ] Grounding → Truth → Clarity flow

**Leadership Intelligence:**
- [ ] Welcome menu displays (A-H options)
- [ ] Option B switches to Situational Awareness
- [ ] RedCell coaching mode works

**Situational Awareness:**
- [ ] Manual-based responses
- [ ] Training module integration

**Well Control Intelligence:**
- [ ] Placeholder prompt works
- [ ] Can update with real prompt later

**Cyber Security:**
- [ ] Placeholder prompt works
- [ ] Can update with real prompt later

**Hospitality Concierge:**
- [ ] Placeholder prompt works
- [ ] Can update with real prompt later

### Security Tests

- [ ] Security filter blocks: "system prompt"
- [ ] Security filter blocks: "ignore previous"
- [ ] Security filter blocks: "show your code"
- [ ] Returns proprietary message on blocked phrases

### Performance Tests

- [ ] Response time < 5 seconds
- [ ] No timeout errors
- [ ] Concurrent requests handled
- [ ] CSS/JS cached properly

---

## 🔄 ROLLBACK PLAN

### If Firebase Deployment Fails

**Option 1: Keep cPanel Running (Parallel)**

Your existing cPanel deployment remains untouched. Simply update DNS or keep using the cPanel URL until Firebase is stable.

**Option 2: Redeploy Functions**

```bash
# Rollback to previous function version
firebase functions:delete ccisProxy
firebase deploy --only functions:ccisProxy
```

**Option 3: Restore from Backup**

```bash
# If you need to restore Firestore data
# Use Firebase Console → Firestore → Import/Export
```

### Emergency Contacts

- Firebase Support: console.firebase.google.com/support
- OpenAI Support: help.openai.com
- Project Owner: info@claymoreandcolt.com

---

## 🏗️ FINAL ARCHITECTURE

### Cloud Functions

```
https://us-central1-redcell-gabriella.cloudfunctions.net/
├── agent (Existing - Gemini-based Gabriella)
└── ccisProxy (NEW - OpenAI-based CCIS)
```

### Firestore Collections

```
redcell-gabriella/firestore/
├── agent_notes (Existing)
├── redcell_leadership_sessions (Existing)
├── redcell_cyber_sessions (Existing)
└── ccis-prompts (NEW)
    ├── kabaakh
    ├── leadership-intelligence
    ├── situational-awareness
    ├── well-control-intelligence
    ├── cyber-security
    └── hospitality-concierge
```

### Firebase Hosting

```
https://redcell-gabriella.web.app/
├── ccis/
│   ├── index.html (Dashboard)
│   ├── chat/
│   │   └── index.html (Chat interface)
│   ├── kabaakh/
│   ├── leadership-intelligence/
│   ├── situational-awareness/
│   ├── well-control-intelligence/
│   ├── cyber-security/
│   └── hospitality-concierge/
└── assets/
    ├── css/
    ├── js/
    └── img/
```

### API Endpoints

**CCIS Proxy:**
```
POST /api/ccis
→ Rewrites to Cloud Function: ccisProxy

Body:
{
  "agent": "kabaakh",
  "message": "Your message here"
}

Response:
{
  "type": "response",
  "agent": "kabaakh",
  "reply": "AI response"
}
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment

- [x] Firebase CLI authenticated
- [x] OpenAI API key set as secret
- [x] Service account key downloaded
- [x] Dependencies installed
- [x] Migration script ready

### Migration

- [ ] Firestore migration completed
- [ ] All 6 agents in Firestore
- [ ] Frontend files copied to public/
- [ ] Local emulator testing passed

### Deployment

- [ ] ccisProxy function deployed
- [ ] Firebase Hosting deployed
- [ ] Function URL obtained
- [ ] Hosting URL obtained

### Post-Deployment

- [ ] All agents tested live
- [ ] Security filters working
- [ ] Mobile UI functional
- [ ] CSS/JS loading correctly
- [ ] No console errors
- [ ] Performance acceptable

### Documentation

- [ ] Update CLAUDE.md with new architecture
- [ ] Document Firestore schema
- [ ] Update navigation instructions
- [ ] Archive cPanel deployment notes

---

## 📞 SUPPORT

**Firebase Issues:**
https://console.firebase.google.com/project/redcell-gabriella/support

**OpenAI Issues:**
https://help.openai.com

**CCIS Questions:**
info@claymoreandcolt.com
+1 (702) 844-9872

---

**Deployment Plan Version:** 1.0
**Last Updated:** January 2026
**Next Review:** After successful deployment

