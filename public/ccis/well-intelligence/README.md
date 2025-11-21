# OGLMS Well Control Dashboard

**Modern React-based dashboard for managing oil & gas wells with integrated well control calculations**

---

## 🎯 What's Been Built

### 1. **Dashboard Home** (`index.html`)
A complete well management dashboard with:
- ✅ Well list with real-time status
- ✅ Stats cards (total wells, active wells, system volumes)
- ✅ Well cards with quick actions
- ✅ Filters (All, Active, Drilling, Completed, Suspended)
- ✅ Quick Actions panel (Volume Calculator, Kill Sheet, Gabriella, etc.)
- ✅ Responsive design (mobile-friendly)
- ✅ Firebase integration ready

### 2. **Well Creation Wizard** (`create-well.html`)
5-step wizard for creating new wells:
- ✅ **Step 1:** Well Information (name, rig, location)
- ✅ **Step 2:** Casing Design (trajectory, casings, fluids)
- ✅ **Step 3:** Drill String (components, pump data)
- ✅ **Step 4:** BOP Configuration (stack, kill/choke lines)
- ✅ **Step 5:** Review & Save (summary with edit buttons)

---

## 🚀 Quick Start

### **Option 1: Open Locally**
```bash
# Navigate to dashboard
cd /Users/whitemckay/Projects/gabriella-functions/public/dashboard

# Open in browser
open index.html
```

### **Option 2: Serve with Firebase**
```bash
cd /Users/whitemckay/Projects/gabriella-functions
firebase serve --only hosting
```

Then open: `http://localhost:5000/dashboard/`

---

## 📋 Features

### Dashboard Home

#### **Stats Cards**
- Total Wells
- Active Wells
- Completed Wells
- Total System Volume (bbl)

#### **Well Cards**
Each well card shows:
- Well name with status indicator (🔴 Active, 🔵 Completed)
- Location (field, country)
- Current operation (Drilling @ 8,500 ft / 11,000 ft)
- String & annular volumes
- Last update time
- Quick action buttons (📊 Volumes, 📋 Kill Sheet)

#### **Filters**
- All Wells
- Active
- Drilling
- Completed
- Suspended

#### **Quick Actions**
- 📊 Volume Calculator → Opens well-volumes-calculator.html
- 📋 Create Kill Sheet
- 🔧 BOP Test Log
- 📈 Displacement Tracker
- 🤖 Ask Gabriella → Opens CCIS
- 📄 Export Reports

---

### Well Creation Wizard

#### **Step 1: Well Information**
- Basic Info (well name, well number, API/UWI)
- Operator & Rig (organization, rig name, rig type, contractor)
- Location (field, block, country, lat/lon, water depth, air gap)
- Well Type (type, purpose, profile)
- Unit System (Imperial/Metric)

#### **Step 2: Casing Design**
- Well Trajectory (total depth, TVD, kickoff, inclination, azimuth)
- Casing Program (dynamic table with add/remove rows)
- Drilling Fluids (mud weight, type, system)

#### **Step 3: Drill String**
- String Components (dynamic table: type, name, OD, ID, length)
- Pump Data (type, liner size, stroke length, efficiency, target SPM)
- Real-time Calculations:
  - Pump Output (bbl/stroke)
  - String Volume (bbl)
  - Strokes to Bit

#### **Step 4: BOP Configuration**
- BOP Stack Info (type, manufacturer, model, working pressure)
- Kill & Choke Lines (sizes, ratings, manifold)
- Subsea Details (riser, connectors) - shows only for subsea BOP

#### **Step 5: Review & Save**
- Summary of all entered data
- Edit buttons for each section
- Save & Create Well button

---

## 🔧 Technology Stack

- **React 18** (via CDN - no build required)
- **Firebase SDK** (Auth, Firestore, Functions)
- **Vanilla CSS** (custom design system)
- **No dependencies** - runs in any modern browser

---

## 🎨 Design System

### Colors
```css
--primary: #1a365d        (Navy Blue)
--primary-light: #2c5282  (Light Navy)
--accent: #ed8936         (Orange)
--success: #38a169        (Green)
--warning: #d69e2e        (Yellow)
--danger: #e53e3e         (Red)
```

### Components
- Cards with shadow and rounded corners
- Gradient stat cards
- Well status indicators (colored dots)
- Responsive grids
- Form inputs with focus states
- Button variants (primary, outline, success, small)

---

## 📱 Responsive Design

### Breakpoints
- **Desktop:** Full 2-column layouts
- **Tablet:** Adaptive grids
- **Mobile:** Single-column stacked layouts

### Mobile Features
- Touch-friendly buttons
- Swipeable cards
- Collapsible sections
- Optimized forms

---

## 🔌 Firebase Integration

### Current Status
- ✅ Firebase SDK loaded
- ✅ Mock data for testing
- ⏳ Firebase config placeholders
- ⏳ Cloud Functions integration pending

### To Enable Firebase

**1. Add your Firebase config:**

Edit `index.html` and `create-well.html`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**2. Enable Firestore queries:**

In `index.html`, replace mock data:
```javascript
async function loadWells() {
    try {
        const snapshot = await db.collection('wells')
            .where('organisationId', '==', user.organisationId)
            .orderBy('updatedAt', 'desc')
            .get();

        const wellsData = [];
        snapshot.forEach(doc => {
            wellsData.push({ id: doc.id, ...doc.data() });
        });

        setWells(wellsData);
        setLoading(false);
    } catch (error) {
        console.error('Error loading wells:', error);
        setLoading(false);
    }
}
```

**3. Enable well creation:**

In `create-well.html`, replace mock save:
```javascript
async function saveWell() {
    try {
        const saveCompleteWell = firebase.functions().httpsCallable('saveCompleteWell');
        const result = await saveCompleteWell({
            wellData: wellData,
            stringConfig: { /* build from wellData */ },
            wellSections: { /* build from wellData */ },
            bopConfig: { /* build from wellData */ }
        });

        alert('Well saved successfully!');
        window.location.href = './index.html';
    } catch (error) {
        console.error('Error saving well:', error);
        alert('Error saving well: ' + error.message);
    }
}
```

---

## 🧪 Testing

### Mock Data Included

The dashboard includes 2 mock wells for testing:
1. **Maersk Voyager - Well A-12**
   - Status: Drilling
   - Depth: 8,500 / 11,000 ft
   - String Volume: 185 bbl
   - Annular Volume: 1,842 bbl

2. **Platform Echo - Well B-05**
   - Status: Completed
   - Depth: 9,850 ft
   - String Volume: 142 bbl
   - Annular Volume: 1,524 bbl

### To Test
1. Open `index.html` in browser
2. See 2 wells displayed
3. Click filters to filter wells
4. Click "📊 Volumes" to open calculator
5. Click "+ Create New Well" to open wizard
6. Fill out wizard and click through steps
7. Click "Save & Create Well" (shows alert for now)

---

## 🔗 Integration Points

### Volume Calculator
- Button in well card opens `../data/well-control-manuals/vol-4-calculations-quickref/worksheets/well-volumes-calculator.html`
- **Coming:** Auto-populate calculator with well data

### CCIS (Gabriella)
- "Ask Gabriella" quick action links to `../ccis/`
- **Coming:** Pass well context to Gabriella

### Cloud Functions
- `saveCompleteWell` - Save new well configuration
- `getWellConfiguration` - Load well data
- `calculateStringVolume` - Server-side calculations
- `calculateKillSheet` - Generate kill sheets

---

## 📊 User Flow

```
Login → Dashboard Home
         │
         ├─→ Filter Wells
         ├─→ Click Well Card → Well Workspace (coming soon)
         ├─→ Click "📊 Volumes" → Volume Calculator opens
         ├─→ Click "📋 Kill Sheet" → Generate kill sheet
         ├─→ Click "🤖 Ask Gabriella" → Open CCIS
         │
         └─→ Click "+ Create New Well"
              │
              ├─→ Step 1: Well Information
              ├─→ Step 2: Casing Design
              ├─→ Step 3: Drill String
              ├─→ Step 4: BOP Configuration
              ├─→ Step 5: Review & Save
              │
              └─→ Save → Return to Dashboard
```

---

## 🚧 Coming Next

### Phase 1: Currently Built ✅
- [x] Dashboard Home UI
- [x] Well Creation Wizard (5 steps)
- [x] Responsive design
- [x] Mock data for testing
- [x] Quick actions panel

### Phase 2: Firebase Integration ⏳
- [ ] Real-time Firestore queries
- [ ] Cloud Functions for save/load
- [ ] User authentication
- [ ] Security rules

### Phase 3: Well Workspace ⏳
- [ ] Detailed well view
- [ ] Edit well configuration
- [ ] View history
- [ ] Activity log
- [ ] Team members

### Phase 4: Calculator Integration ⏳
- [ ] Auto-populate calculator from dashboard
- [ ] Save calculator results back to well
- [ ] Real-time sync
- [ ] Export well reports

### Phase 5: AI Integration ⏳
- [ ] Pass well context to Gabriella
- [ ] Generate kill sheets from well data
- [ ] CCIS training scenarios using well config
- [ ] Smart recommendations

---

## 🎬 Demo Flow

### **Scenario:** Create a new well and run calculations

1. **Open Dashboard**
   ```
   open /Users/whitemckay/Projects/gabriella-functions/public/dashboard/index.html
   ```

2. **View existing wells** (2 mock wells shown)

3. **Click "+ Create New Well"**

4. **Step 1: Enter well information**
   - Well Name: "Maersk Voyager - Well C-21"
   - Rig Name: "Maersk Voyager"
   - Field: "North Sea Field"
   - Select "Imperial" units

5. **Step 2: Add casing program**
   - Click "+ Add Casing String"
   - Enter: 30" Conductor, 0-200 ft
   - Add more strings as needed

6. **Step 3: Configure drill string**
   - Click "+ Add Component"
   - Enter: 5" DP, OD=5.0, ID=4.276, Length=10000
   - Enter pump data
   - See real-time calculations

7. **Step 4: Set up BOP**
   - Select Subsea
   - Enter manufacturer and model
   - Configure kill/choke lines

8. **Step 5: Review and save**
   - Review all data
   - Click "Save & Create Well"
   - Return to dashboard

9. **Open calculator**
   - Click "📊 Volumes" on your new well
   - Calculator opens in new tab
   - **(Coming Soon)** Data auto-populated

10. **Ask Gabriella**
    - Click "🤖 Ask Gabriella"
    - **(Coming Soon)** Gabriella knows your well details

---

## 📝 Code Structure

```
/public/dashboard/
├── index.html           # Dashboard home page
│   ├── Header component
│   ├── StatsCards component
│   ├── WellCard component
│   ├── Filters component
│   ├── QuickActions component
│   └── Dashboard component (main)
│
├── create-well.html     # Well creation wizard
│   ├── WellCreationWizard component
│   ├── Step1WellInformation
│   ├── Step2CasingDesign
│   ├── Step3DrillString
│   ├── Step4BOPConfiguration
│   └── Step5Review
│
└── README.md            # This file
```

---

## 🐛 Known Issues

1. **Firebase config** - Needs to be updated with actual credentials
2. **Authentication** - Currently using mock user, needs real auth
3. **Data persistence** - Mock data only, needs Firestore integration
4. **Calculator integration** - Opens but doesn't auto-populate yet
5. **Well workspace** - Not yet built

---

## 💡 Tips

### For Development
- Use Chrome DevTools for responsive testing
- React DevTools work with this setup
- Firebase Emulator for local testing

### For Production
- Add Firebase config
- Enable authentication
- Deploy Cloud Functions
- Set up security rules
- Enable offline support

---

## 📞 Support

- **Documentation:** `/WELL-DASHBOARD-SPEC.md`
- **Volume Calculator:** `/data/well-control-manuals/vol-4-calculations-quickref/README.md`
- **Database Schema:** `/data/well-control-manuals/vol-4-calculations-quickref/well-volumes-schema.md`

---

**Version:** 1.0
**Last Updated:** November 21, 2025
**Status:** ✅ Dashboard UI Complete, ⏳ Firebase Integration Pending
