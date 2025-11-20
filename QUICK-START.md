# 🚀 CCIS FIREBASE — QUICK START GUIDE

**5-Step Deployment Process**

---

## STEP 1: Install Dependencies

```bash
cd /Users/whitemckay/Projects/gabriella-functions/functions
npm install
```

---

## STEP 2: Set OpenAI API Key

```bash
cd /Users/whitemckay/Projects/gabriella-functions
firebase functions:secrets:set OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

---

## STEP 3: Download Service Account Key

1. Visit: https://console.firebase.google.com/project/redcell-gabriella/settings/serviceaccounts
2. Click "Generate New Private Key"
3. Save as: `/Users/whitemckay/Projects/gabriella-functions/serviceAccountKey.json`
4. Add to .gitignore:

```bash
echo "serviceAccountKey.json" >> .gitignore
```

---

## STEP 4: Run Firestore Migration

```bash
cd /Users/whitemckay/Projects/gabriella-functions/functions
node ccis-migration.js
```

**Expected output:**
```
✅ KA.BA.AKH migrated successfully
✅ Leadership Intelligence migrated successfully
✅ Situational Awareness migrated successfully
✅ Well Control Intelligence placeholder created
✅ Cyber Security Intelligence placeholder created
✅ Hospitality Concierge placeholder created
✅ MIGRATION COMPLETE
```

---

## STEP 5: Copy Frontend Files

```bash
# Copy CCIS pages
cp -r /Users/whitemckay/Projects/CCIS/cPanel-mirror/claymoreandcolt/ccis/* \
      /Users/whitemckay/Projects/gabriella-functions/public/ccis/

# ⚠️ IMPORTANT: Restore the updated chat/index.html
# The Firebase version is already created at:
# /Users/whitemckay/Projects/gabriella-functions/public/ccis/chat/index.html
# Do NOT overwrite it!

# Copy assets
cp -r /Users/whitemckay/Projects/CCIS/cPanel-mirror/claymoreandcolt/assets \
      /Users/whitemckay/Projects/gabriella-functions/public/
```

---

## STEP 6: Test Locally (Optional)

```bash
cd /Users/whitemckay/Projects/gabriella-functions
firebase emulators:start
```

Visit: http://localhost:5000/ccis/chat/?agent=kabaakh

---

## STEP 7: Deploy to Production

```bash
cd /Users/whitemckay/Projects/gabriella-functions

# Deploy everything
firebase deploy

# Or deploy separately:
# firebase deploy --only functions:ccisProxy
# firebase deploy --only hosting
```

---

## STEP 8: Test Live Deployment

Visit: https://redcell-gabriella.web.app/ccis/chat/?agent=kabaakh

**Test all agents:**
- kabaakh
- leadership-intelligence
- situational-awareness
- well-control-intelligence
- cyber-security
- hospitality-concierge

---

## 🔍 TROUBLESHOOTING

### "Missing OpenAI API key"
```bash
firebase functions:secrets:set OPENAI_API_KEY
```

### "Service account not found"
Download from Firebase Console → Settings → Service Accounts

### "Firestore permission denied"
Check Firestore rules in Firebase Console

### "CSS not loading"
Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### "Function timeout"
Normal for first cold start (can take up to 30 seconds)
Subsequent calls will be fast

---

## 📊 Verify Deployment

### Check Functions

```bash
firebase functions:list
```

Should show:
- agent (existing)
- ccisProxy (new)

### Check Firestore

Firebase Console → Firestore Database → ccis-prompts

Should contain 6 documents:
- kabaakh
- leadership-intelligence
- situational-awareness
- well-control-intelligence
- cyber-security
- hospitality-concierge

### Check Hosting

```bash
firebase hosting:sites:list
```

Should show hosting URL: https://redcell-gabriella.web.app

---

## 📞 Support

**Firebase Console:**
https://console.firebase.google.com/project/redcell-gabriella

**Questions:**
info@claymoreandcolt.com

---

**That's it! CCIS is now running on Firebase.**

