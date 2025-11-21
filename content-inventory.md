# OGLMS - Complete Content Inventory

**Project:** gabriella-functions (CCIS + OGLMS Dashboard)
**GitHub:** https://github.com/cmckay1981/ccis
**Firebase:** redcell-gabriella

---

## 📦 Complete Content Structure

### **Total Content Size:** ~5.1 MB
- Well Control Manuals: 748 KB
- HRO-HP Training: 1.5 MB
- Archive (CRM Masterclass): 1.9 MB
- Well Control Q&A: 404 KB
- Advanced Drilling: 244 KB
- DWOP/CWOP: 236 KB
- Digital Manuals: 108 KB

---

## 📂 Directory Structure

```
gabriella-functions/
├── public/                          # Hosted content
│   ├── dashboard/                   # ✅ OGLMS Dashboard (NEW)
│   │   ├── index.html
│   │   ├── create-well.html
│   │   ├── firebase-config.js
│   │   ├── README.md
│   │   └── TEST-CHECKLIST.md
│   │
│   ├── ccis/                        # ✅ CCIS Intelligence Systems
│   │   ├── well-control-intelligence/
│   │   ├── situational-awareness/
│   │   ├── leadership-intelligence/
│   │   ├── cyber-security/
│   │   ├── hospitality-concierge/
│   │   ├── kabaakh/
│   │   └── chat/
│   │
│   └── assets/                      # ✅ Shared assets
│       ├── css/
│       ├── js/
│       ├── img/
│       ├── video/
│       ├── lang/
│       └── fav/
│
├── data/                            # ✅ Training & Reference Data
│   ├── well-control-manuals/        # ✅ OGLMS Volumes 1-6
│   ├── well-control/                # ✅ Well Control Q&A
│   ├── advanced-drilling/           # ✅ ADO Course & Questions
│   ├── dwop-cwop/                   # ✅ DWOP Training Materials
│   ├── hro-hp/                      # ✅ HRO High Performance
│   ├── digital-manuals/             # ✅ Digital Reference
│   └── archive/                     # ✅ CRM Masterclass Archive
│
├── functions/                       # ✅ Cloud Functions
│   ├── wellDashboard.js             # ✅ NEW - Dashboard functions
│   ├── wellVolumeCalculations.js    # ✅ NEW - Calculator functions
│   ├── agent.js                     # ✅ AI agent
│   ├── ccisProxy.js                 # ✅ CCIS proxy
│   └── index.js                     # ✅ Exports
│
├── scripts/                         # ✅ NEW - Helper Scripts
│   ├── deploy.sh                    # Deployment helper
│   ├── setUserClaims.js             # User permissions
│   ├── migrateWells.js              # Data migration
│   └── README.md                    # Script docs
│
├── firestore.rules                  # ✅ NEW - Database security
├── firestore.indexes.json           # ✅ NEW - Database indexes
├── firebase.json                    # ✅ Firebase config
├── .firebaserc                      # ✅ Project config
│
└── Documentation/                   # ✅ NEW - Complete Docs
    ├── README-FIREBASE.md           # Main overview
    ├── DEPLOYMENT-QUICKSTART.md     # Quick deploy guide
    ├── FIREBASE-SETUP-SUMMARY.md    # Feature breakdown
    ├── FIREBASE-MIGRATION-GUIDE.md  # Detailed walkthrough
    ├── CONTENT-INVENTORY.md         # This file
    ├── well-dashboard-spec.md       # Dashboard specification
    └── well-volumes-system-summary.md # Calculator system
```

---

## 📚 Content Breakdown by Section

### 1. WELL CONTROL MANUALS (Vol 1-6)

**Location:** `/data/well-control-manuals/`
**Size:** 748 KB
**Type:** JSON reference data

```
vol-1-kick-detection-monitoring/
  ├── sections/
  │   ├── 1-1-pressure-monitoring.json
  │   ├── 1-2-flow-monitoring.json
  │   ├── 1-3-pit-level-monitoring.json
  │   └── [21 more sections...]
  └── README.md

vol-2-well-control-procedures/
  ├── sections/
  │   ├── 2-1-drillers-method.json
  │   ├── 2-2-wait-and-weight.json
  │   ├── 2-3-pressure-integrity.json
  │   └── [18 more sections...]
  └── README.md

vol-3-equipment-testing/
  ├── sections/
  │   ├── 3-1-bop-testing.json
  │   ├── 3-2-accumulator-testing.json
  │   ├── 3-3-choke-manifold.json
  │   └── [15 more sections...]
  └── README.md

vol-4-calculations-quickref/
  ├── worksheets/
  │   ├── well-volumes-calculator.html     # ✅ Enhanced (2,722 lines)
  │   ├── kill-sheet-generator.html
  │   └── displacement-tracker.html
  ├── data/
  │   ├── unit-conversions.json            # ✅ NEW
  │   ├── pipe-capacities.json             # ✅ NEW
  │   └── sample-well-data.json            # ✅ NEW
  ├── well-volumes-schema.md               # ✅ NEW - Database schema
  ├── SYSTEM-ARCHITECTURE.md               # ✅ System design
  └── README.md

vol-5-drilling-practices/
  ├── sections/
  │   ├── 5-1-tripping-practices.json
  │   ├── 5-2-connection-procedures.json
  │   └── [12 more sections...]
  └── README.md

vol-6-emergency-procedures/
  ├── sections/
  │   ├── 6-1-underground-blowout.json
  │   ├── 6-2-h2s-response.json
  │   └── [10 more sections...]
  └── README.md
```

**Features:**
- 100+ reference sections
- Searchable JSON format
- Cross-referenced procedures
- Equipment specifications
- Calculation formulas

---

### 2. WELL CONTROL Q&A

**Location:** `/data/well-control/`
**Size:** 404 KB
**Type:** Question banks

```
question-bank/
├── well-control-equipment.json      # BOP, chokes, manifolds
├── kick-detection.json              # Early detection methods
├── well-control-methods.json        # Driller's/Wait & Weight
├── pressure-control.json            # MAASP, formation pressure
└── emergency-procedures.json        # H2S, blowout response
```

**Content:**
- 500+ well control questions
- Multiple difficulty levels
- Scenario-based learning
- Equipment identification
- Procedure validation

---

### 3. ADVANCED DRILLING (ADO)

**Location:** `/data/advanced-drilling/`
**Size:** 244 KB
**Type:** Course materials + scenarios

```
ado-course/
├── modules/
│   ├── ado-101.json    # HPHT Fundamentals
│   ├── ado-102.json    # MPD Operations
│   ├── ado-103.json    # Subsea Well Control
│   ├── ado-104.json    # Gas Migration
│   ├── ado-105.json    # Lost Circulation
│   ├── ado-106.json    # Equipment Failures
│   ├── ado-107.json    # Barrier Management
│   ├── ado-108.json    # ECD Management
│   ├── ado-109.json    # Kick Tolerance
│   ├── ado-110.json    # Riser Margin
│   ├── ado-111.json    # Emergency Response
│   └── ado-112.json    # Decision Making
│
├── advanced-question-templates/
│   ├── hpht-narrow-window.json
│   ├── mpd-kick-response.json
│   ├── subsea-eds-decision.json
│   ├── gas-migration-response.json
│   ├── lost-circulation-severe.json
│   ├── equipment-failure-kill.json
│   ├── barrier-loss-response.json
│   ├── shallow-gas-response.json
│   ├── h2s-response.json
│   ├── salt-section-drilling.json
│   ├── surface-bop-well-control.json
│   ├── riser-margin.json
│   ├── hpht-kick-tolerance.json
│   ├── early-kick-detection.json
│   ├── connection-monitoring.json
│   ├── tripping-decision.json
│   ├── clfl-correction.json
│   ├── hpht-mawp-exceed.json
│   └── land-rig-logistics.json
│
└── well-profiles/
    ├── cc-phoenix-702.json          # Deepwater HPHT
    └── cc-sandstone-301.json        # Conventional profile
```

**Features:**
- 12 ADO modules
- 20+ advanced scenarios
- Real well profiles
- Decision trees
- Complex calculations

---

### 4. DWOP/CWOP TRAINING

**Location:** `/data/dwop-cwop/`
**Size:** 236 KB
**Type:** Workshop materials

```
ai-question-bank/
├── surface-drilling-questions.json
├── intermediate-drilling-questions.json
├── production-drilling-questions.json
└── well-control-questions.json

checklists/
├── surface-hole-drilling.json
├── intermediate-hole-drilling.json
└── production-hole-drilling.json

session-templates/
└── dwop-4day-agenda.json
```

**Content:**
- 4-day workshop curriculum
- Phase-specific drilling questions
- Operational checklists
- Session planning templates

---

### 5. HRO HIGH PERFORMANCE

**Location:** `/data/hro-hp/`
**Size:** 1.5 MB
**Type:** Leadership & performance training

```
well-control/
├── tier2-advanced-well-control-outline.md
└── digital-manuals/
    ├── supervisor-guide.json
    ├── toolpusher-guide.json
    └── crew-leader-guide.json

leadership-intelligence/
├── decision-making-frameworks.json
├── crew-resource-management.json
└── emergency-leadership.json

situational-awareness/
├── threat-assessment.json
├── monitoring-protocols.json
└── anomaly-detection.json
```

**Features:**
- HRO principles
- Leadership frameworks
- Crew management
- Decision-making models
- Situational awareness training

---

### 6. DIGITAL MANUALS

**Location:** `/data/digital-manuals/`
**Size:** 108 KB
**Type:** Reference documentation

```
equipment-references/
├── bop-specifications.json
├── pump-data-sheets.json
└── choke-manifold-specs.json

procedures/
├── standard-operating-procedures.json
├── emergency-action-plans.json
└── equipment-testing-protocols.json
```

---

### 7. CRM MASTERCLASS ARCHIVE

**Location:** `/data/archive/`
**Size:** 1.9 MB
**Type:** Legacy training content

```
crm-masterclass/
├── comm-masterclass/           # Communication
├── dm-masterclass/             # Decision Making
├── hf-masterclass/             # Human Factors
├── lead-masterclass/           # Leadership
├── sa-masterclass/             # Situational Awareness
└── tw-masterclass/             # Teamwork

hf-offshore-masterclass/        # Offshore HF
leadership-masterclass/         # Leadership intensive
```

**Content:**
- 6 masterclass courses
- 100+ lessons
- Video transcripts
- Assessment modules

---

## 🎯 CCIS Intelligence Systems

**Location:** `/public/ccis/`
**Type:** Web applications

### Available Systems:

1. **Well Control Intelligence**
   - Well control scenarios
   - Equipment troubleshooting
   - Procedure guidance
   - Real-time calculations

2. **Situational Awareness**
   - Threat detection
   - Anomaly identification
   - Decision support

3. **Leadership Intelligence**
   - Crew management
   - Emergency leadership
   - Decision frameworks

4. **Cyber Security**
   - OT/IT security
   - Threat assessment
   - Incident response

5. **Hospitality Concierge**
   - Guest services
   - Event planning
   - Service optimization

6. **Kabaakh**
   - Cultural intelligence
   - Regional awareness

7. **Chat**
   - General AI assistant
   - Document search
   - Q&A interface

---

## 🎨 OGLMS Dashboard (NEW)

**Location:** `/public/dashboard/`
**Type:** React web application

### Components:

```
dashboard/
├── index.html              # Main dashboard
├── create-well.html        # 5-step well wizard
├── firebase-config.js      # Firebase integration
├── README.md               # Feature documentation
└── TEST-CHECKLIST.md       # Testing guide
```

### Features:
- Well list with filters
- Stats cards (volumes, operations)
- Well creation wizard (5 steps)
- Real-time calculations
- Firebase integration
- Organisation-based security
- Responsive mobile design

### Integrations:
- Links to calculator (`vol-4-calculations-quickref/worksheets/`)
- Links to CCIS (well control intelligence)
- Links to Gabriella AI
- Activity logging
- Audit trail

---

## 🔌 Cloud Functions

**Location:** `/functions/`
**Type:** Node.js Firebase Functions

### Dashboard Functions (NEW):
```javascript
saveCompleteWell()          // Save well from wizard
getOrganisationWells()      // Load wells for dashboard
getWellDetails()            // Get complete well data
updateWellStatus()          // Update well operations
deleteWell()                // Archive well
```

### Calculator Functions (NEW):
```javascript
calculateStringVolume()     // String capacity & volume
calculateAnnularVolumes()   // Annular volumes
calculateKillSheet()        // Kill sheet generation
calculatePumpOutputs()      // Pump calculations
convertUnits()              // Unit conversions
trackDisplacement()         // Displacement tracking
saveWellConfiguration()     // Save calculator data
getWellConfiguration()      // Load calculator data
```

### Existing Functions:
```javascript
agent()                     // AI agent
ccisProxy()                 // CCIS routing
```

---

## 📊 Database Collections (Firestore)

### Well Management:
- `wells/` - Main well documents
- `well-string-configs/` - Drill string configurations
- `well-sections/` - Casing programs
- `bop-configurations/` - BOP details
- `activity-log/` - Audit trail

### Future Collections:
- `kill-sheets/` - Kill sheet records
- `displacement-tracking/` - Displacement logs
- `volume-calculations-log/` - Calculation history
- `organisations/` - Company data
- `people/` - User profiles

---

## 🔒 Security & Access

### Firestore Rules:
- Organisation-scoped access
- Role-based permissions (admin/user)
- Immutable audit logs
- Field-level validation

### Authentication:
- Firebase Auth integration
- Custom claims (organisationId, role)
- Token-based access control

---

## 📦 What Gets Deployed to Firebase

### Hosting (`public/`):
✅ Dashboard UI
✅ CCIS systems
✅ Calculator tools
✅ Assets (CSS, JS, images)
❌ PDFs (excluded by .gitignore)

### Functions:
✅ All Cloud Functions (13 total)
✅ wellDashboard.js (5 functions)
✅ wellVolumeCalculations.js (8 functions)

### Firestore:
✅ Security rules
✅ Database indexes
✅ Data collections (empty initially)

### Not Deployed (stays in repo):
✅ `/data/` directory (reference data)
✅ Scripts (setUserClaims, migrateWells)
✅ Documentation (markdown files)
✅ Service account keys (.gitignore)

---

## 🌐 What Gets Pushed to GitHub

### Included:
✅ All source code
✅ All `/data/` training materials
✅ All `/public/` web content
✅ Cloud Functions
✅ Scripts
✅ Documentation
✅ Configuration files

### Excluded (.gitignore):
❌ `node_modules/`
❌ `.DS_Store` files
❌ `.firebase/` cache
❌ `serviceAccountKey.json`
❌ `.env` files
❌ PDF files (optional - can be included)
❌ Log files

---

## 📋 Content Access URLs (After Deployment)

### Dashboard:
```
https://redcell-gabriella.web.app/dashboard/
https://redcell-gabriella.web.app/dashboard/create-well.html
```

### Calculators:
```
https://redcell-gabriella.web.app/data/well-control-manuals/vol-4-calculations-quickref/worksheets/well-volumes-calculator.html
```

### CCIS Systems:
```
https://redcell-gabriella.web.app/ccis/
https://redcell-gabriella.web.app/ccis/well-control-intelligence/
https://redcell-gabriella.web.app/ccis/situational-awareness/
```

---

## 🚀 Deployment Checklist

### GitHub Push:
- [ ] Review `git status`
- [ ] Stage all new files (`git add .`)
- [ ] Create commit with full description
- [ ] Push to origin (`git push`)

### Firebase Deploy:
- [ ] Update firebase-config.js with credentials
- [ ] Deploy Firestore rules & indexes
- [ ] Deploy Cloud Functions
- [ ] Deploy Hosting (all public/ content)
- [ ] Verify all URLs accessible

### Post-Deployment:
- [ ] Test dashboard functionality
- [ ] Test calculator access
- [ ] Test CCIS systems
- [ ] Verify well creation workflow
- [ ] Check security rules working

---

## 📊 Content Statistics

```
Total Directories:      ~150
Total Files:           ~500+
JSON Data Files:       ~200
HTML/Web Pages:        ~50
Cloud Functions:       13
Training Modules:      ~100
Question Banks:        ~1,000 questions
Scenarios:             ~50
Well Profiles:         2
Checklists:            ~20
```

---

## 🎯 Key Features by Content Type

### Well Control Manuals:
- Searchable JSON format
- Cross-referenced procedures
- Equipment specifications
- Calculation formulas
- Emergency procedures

### Training Content:
- Progressive difficulty
- Scenario-based learning
- Real-world examples
- Assessment modules
- Competency validation

### Dashboard:
- Multi-user collaboration
- Real-time calculations
- Data persistence
- Organisation security
- Audit trail

### CCIS:
- AI-powered intelligence
- Context-aware responses
- Multi-domain support
- Real-time assistance

---

**Status:** ✅ Complete content inventory
**Ready for:** GitHub push + Firebase deployment
**Total Size:** ~5.1 MB (excluding node_modules)
