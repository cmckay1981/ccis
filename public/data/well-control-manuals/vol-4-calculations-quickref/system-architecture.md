# OGLMS System Architecture

**Oil & Gas Liquid Management System - Digital Platform**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Web Browser    │  │  Mobile Device   │  │  Future: App  │ │
│  │  (Any Platform)  │  │ (iOS / Android)  │  │  (Native)     │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            └─────────────────────┴─────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
          ┌─────────▼──────────┐      ┌────────▼─────────┐
          │  STANDALONE MODE   │      │   FIREBASE MODE  │
          │  (No Server)       │      │   (Cloud)        │
          └─────────┬──────────┘      └────────┬─────────┘
                    │                           │
                    │                           │
    ┌───────────────┴──────────┐    ┌──────────┴──────────────────┐
    │                          │    │                             │
    │  well-volumes-           │    │   Cloud Functions           │
    │  calculator.html         │    │   (8 Functions)             │
    │  (2,722 lines)           │    │                             │
    │                          │    │  - calculateStringVolume    │
    │  Features:               │    │  - calculateAnnularVolumes  │
    │  • 12 tabs               │    │  - calculateKillSheet       │
    │  • Real-time calcs       │    │  - calculatePumpOutputs     │
    │  • Pipe library          │    │  - convertUnits             │
    │  • Kill sheets           │    │  - trackDisplacement        │
    │  • BOP system            │    │  - saveWellConfiguration    │
    │  • Stroke tracking       │    │  - getWellConfiguration     │
    │  • Save/Load (localStorage)   │                             │
    │  • Print/PDF             │    └─────────────┬───────────────┘
    │                          │                  │
    └────────────┬─────────────┘                  │
                 │                                │
                 │                    ┌───────────▼────────────────┐
                 │                    │   Firestore Database        │
                 │                    │   (7 Collections)           │
                 │                    │                             │
                 │                    │  - wells                    │
                 │                    │  - well-string-configs      │
                 │                    │  - well-sections            │
                 │                    │  - kill-sheets              │
                 │                    │  - bop-configurations       │
                 │                    │  - displacement-tracking    │
                 │                    │  - volume-calculations-log  │
                 │                    │                             │
                 │                    └─────────────────────────────┘
                 │
    ┌────────────▼─────────────┐
    │   Reference Data         │
    │   (JSON Files)           │
    │                          │
    │  - unit-conversions.json │
    │  - pipe-capacities.json  │
    │  - sample-well-data.json │
    │                          │
    └──────────────────────────┘
```

---

## Data Flow

### Standalone Mode (No Server)

```
User Input
    │
    ├─→ HTML/JavaScript (Client-side)
    │       │
    │       ├─→ Calculate String Volumes
    │       ├─→ Calculate Annular Volumes
    │       ├─→ Generate Kill Sheet
    │       ├─→ Track Displacement
    │       └─→ Convert Units
    │
    ├─→ JSON Files (Reference Data)
    │       │
    │       ├─→ Pipe Capacities Library
    │       ├─→ Unit Conversion Factors
    │       └─→ Sample Well Data
    │
    └─→ localStorage (Browser)
            │
            ├─→ Save Configuration
            └─→ Load Configuration
```

### Firebase Mode (Cloud-Integrated)

```
User Input
    │
    ├─→ HTML/JavaScript (Client-side)
    │       │
    │       ├─→ Basic Calculations (fast)
    │       └─→ Complex Calculations → Cloud Functions
    │
    ├─→ Cloud Functions (Server-side)
    │       │
    │       ├─→ Validate Input
    │       ├─→ Perform Calculations
    │       ├─→ Log to Firestore
    │       └─→ Return Results
    │
    └─→ Firestore Database
            │
            ├─→ Read Well Configurations
            ├─→ Write Kill Sheets
            ├─→ Track Displacement Sessions
            └─→ Audit Log Calculations
```

---

## Component Architecture

### Frontend (HTML/JavaScript)

```
well-volumes-calculator.html
│
├─ HEADER
│  ├─ Title & Branding
│  ├─ Unit Toggle (Imperial/Metric)
│  └─ Print Button
│
├─ TABS (12)
│  │
│  ├─ 1. Dashboard
│  │  ├─ Summary Cards (4)
│  │  ├─ String Volumes Table
│  │  └─ Annular Volumes Table
│  │
│  ├─ 2. Units
│  │  ├─ Unit Selectors (6)
│  │  └─ Preset Buttons (Imperial/Metric)
│  │
│  ├─ 3. Strings
│  │  ├─ Component Table (dynamic rows)
│  │  ├─ Pipe Library Dropdowns
│  │  ├─ Real-time Calculations
│  │  └─ Pump Data Inputs
│  │
│  ├─ 4. Well Sections
│  │  ├─ Section Table (dynamic rows)
│  │  ├─ Top/Bottom Depths
│  │  └─ Annular Calculations
│  │
│  ├─ 5. Annular Volumes
│  │  ├─ Reference Table
│  │  └─ Quick Calculator
│  │
│  ├─ 6. Kill Sheet
│  │  ├─ Well Data Inputs
│  │  ├─ 6-Step Calculations
│  │  ├─ Pressure Step Chart (20 steps)
│  │  └─ MAASP Warning System
│  │
│  ├─ 7. BOP Kill Sheet (NEW)
│  │  ├─ Page 1: Well Configuration
│  │  │  ├─ Casing/Tubing Table
│  │  │  ├─ Volume Dashboard
│  │  │  └─ Riser Calculations
│  │  ├─ Page 2: Kill Calculations
│  │  │  ├─ Kick Parameters
│  │  │  ├─ 6-Step Kill Method
│  │  │  ├─ Barrier Envelope
│  │  │  └─ Pressure Schedule
│  │  └─ Page 3: Pump Outputs
│  │     ├─ Pump Configuration
│  │     ├─ Output Tables (2 pumps)
│  │     └─ SCR Test Data
│  │
│  ├─ 8. Pipe Reference (NEW)
│  │  ├─ Drill Pipe Tab (9 sizes)
│  │  ├─ Drill Collars Tab (8 sizes)
│  │  ├─ HWDP Tab (4 sizes)
│  │  ├─ Casing Tab (24 sizes)
│  │  ├─ Open Hole Tab (12 sizes)
│  │  └─ Annular Capacities Tab (8)
│  │
│  ├─ 9. Density Tables (NEW)
│  │  ├─ PPG → SG Table
│  │  ├─ SG → PPG Table
│  │  ├─ Common Fluids
│  │  └─ Hydrostatic Calculator
│  │
│  ├─ 10. Conversions
│  │  ├─ Reference Conversions
│  │  └─ Quick Converter Tool
│  │
│  ├─ 11. Stroke Tracker (NEW)
│  │  ├─ Current Strokes Input
│  │  ├─ Quick Buttons (+10, +50, +100)
│  │  ├─ Progress Bars
│  │  ├─ Milestone Table
│  │  └─ Time Remaining
│  │
│  └─ 12. Schematic
│     ├─ Visual Well Representation
│     └─ Depth/Volume Labels
│
├─ JAVASCRIPT FUNCTIONS (50+)
│  │
│  ├─ Calculation Functions
│  │  ├─ calculateCapacity()
│  │  ├─ calculateAnnularCapacity()
│  │  ├─ calculateHydrostatic()
│  │  ├─ recalcStrings()
│  │  ├─ recalcWell()
│  │  ├─ calcKillSheet()
│  │  ├─ calcBOP()
│  │  └─ calcPumpOutputs()
│  │
│  ├─ Data Management
│  │  ├─ loadReferenceData()
│  │  ├─ populatePipeSelectors()
│  │  ├─ applyPipeDataToRow()
│  │  ├─ saveConfiguration()
│  │  └─ loadConfiguration()
│  │
│  ├─ UI Functions
│  │  ├─ showTab()
│  │  ├─ showSubTab()
│  │  ├─ updateUnits()
│  │  ├─ updateDashboard()
│  │  ├─ updateSchematic()
│  │  └─ updateDisplacement()
│  │
│  └─ Utility Functions
│     ├─ convert()
│     ├─ quickAnnCalc()
│     ├─ resetTracker()
│     └─ generateDensityTables()
│
└─ CSS STYLES
   ├─ Variables (colors, sizes)
   ├─ Layout (grid, flex)
   ├─ Components (cards, tables, forms)
   ├─ Responsive (@media queries)
   └─ Print (@media print)
```

---

## Backend Architecture (Firebase)

### Cloud Functions

```
wellVolumeCalculations.js
│
├─ CALCULATION FUNCTIONS
│  │
│  ├─ calculateStringVolume()
│  │  Input: components[], pumpOutput
│  │  Output: totals, calculated components
│  │
│  ├─ calculateAnnularVolumes()
│  │  Input: sections[], pumpOutput
│  │  Output: totals, calculated sections
│  │
│  ├─ calculateKillSheet()
│  │  Input: mudWeight, tvd, sidpp, sicp, scr, etc.
│  │  Output: FP, KWM, ICP, FCP, MAASP, steps
│  │
│  └─ calculatePumpOutputs()
│     Input: linerSize, strokeLength, efficiency
│     Output: outputs for multiple rates
│
├─ CONVERSION FUNCTIONS
│  │
│  └─ convertUnits()
│     Input: value, fromUnit, toUnit
│     Output: converted value, factor
│
├─ TRACKING FUNCTIONS
│  │
│  └─ trackDisplacement()
│     Input: currentStrokes, pumpOutput, volumes
│     Output: position, percentComplete, timeRemaining
│
└─ DATABASE FUNCTIONS
   │
   ├─ saveWellConfiguration()
   │  Input: wellId, components, sections
   │  Output: saved doc IDs
   │
   └─ getWellConfiguration()
      Input: wellId
      Output: active configurations
```

### Firestore Collections

```
Firestore Database
│
├─ wells/
│  └─ {wellId}
│     ├─ wellName
│     ├─ rigName
│     ├─ location
│     ├─ wellType
│     ├─ status
│     ├─ totalDepth
│     ├─ tvd
│     ├─ currentMudWeight
│     └─ units
│
├─ well-string-configs/
│  └─ {configId}
│     ├─ wellId
│     ├─ configName
│     ├─ isActive
│     ├─ components[]
│     ├─ totals
│     └─ pumpData
│
├─ well-sections/
│  └─ {sectionId}
│     ├─ wellId
│     ├─ configName
│     ├─ isActive
│     ├─ sections[]
│     └─ totals
│
├─ kill-sheets/
│  └─ {killSheetId}
│     ├─ wellId
│     ├─ stringConfigId
│     ├─ wellSectionsId
│     ├─ sheetName
│     ├─ method
│     ├─ kickData{}
│     ├─ wellData{}
│     ├─ shoeData{}
│     ├─ calculations{}
│     └─ notes[]
│
├─ bop-configurations/
│  └─ {bopConfigId}
│     ├─ wellId
│     ├─ stackType
│     ├─ manufacturer
│     ├─ components[]
│     ├─ controlSystem{}
│     ├─ killChoke{}
│     └─ subsea{}
│
├─ displacement-tracking/
│  └─ {sessionId}
│     ├─ wellId
│     ├─ operationType
│     ├─ status
│     ├─ currentStrokes
│     ├─ fluidPosition{}
│     ├─ pressures[]
│     └─ alerts[]
│
└─ volume-calculations-log/
   └─ {logId}
      ├─ wellId
      ├─ userId
      ├─ calculationType
      ├─ inputs{}
      ├─ outputs{}
      └─ timestamp
```

---

## Integration Points

### Current System Integrations

```
┌─────────────────────────────────────────────────────┐
│            OGLMS Well Volumes System                │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
    ┌────▼───┐ ┌──▼───┐ ┌───▼────┐
    │Browser │ │JSON  │ │Firebase│
    │Storage │ │Files │ │Cloud   │
    └────────┘ └──────┘ └────────┘
```

### Future Integrations

```
┌─────────────────────────────────────────────────────┐
│            OGLMS Well Volumes System                │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┼─────────────────┐
         │         │                 │
    ┌────▼───┐ ┌──▼───────┐ ┌───────▼────────┐
    │  CCIS  │ │Gabriella │ │  Rig Systems   │
    │Training│ │AI Agent  │ │  (WITSML)      │
    └────────┘ └──────────┘ └────────────────┘
         │         │                 │
         └─────────┼─────────────────┘
                   │
          ┌────────▼────────┐
          │  Mobile Apps    │
          │  (iOS/Android)  │
          └─────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT                            │
│  (Browser / Mobile App)                              │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ HTTPS/TLS
                     │
┌────────────────────▼─────────────────────────────────┐
│              Firebase Authentication                 │
│  (Email/Password, Google, etc.)                      │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ Auth Token
                     │
┌────────────────────▼─────────────────────────────────┐
│              Cloud Functions                         │
│  • Validate auth token                               │
│  • Check user role                                   │
│  • Execute calculation                               │
│  • Log to audit trail                                │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ Service Account
                     │
┌────────────────────▼─────────────────────────────────┐
│              Firestore Database                      │
│  • Security Rules enforced                           │
│  • Role-based access:                                │
│    - driller: read/write wells, configs              │
│    - engineer: read/write all except logs            │
│    - supervisor: read/write all                      │
│    - admin: full access                              │
│  • Organization-scoped data                          │
└──────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Standalone Deployment

```
User's Computer
└─ Web Browser
   └─ file:// protocol
      └─ well-volumes-calculator.html
         ├─ Embedded CSS
         ├─ Embedded JavaScript
         └─ External JSON (optional)
```

### Firebase Hosting Deployment

```
Firebase Hosting (CDN)
├─ /data/well-control-manuals/vol-4-calculations-quickref/
│  ├─ /worksheets/
│  │  └─ well-volumes-calculator.html
│  └─ /data/
│     ├─ unit-conversions.json
│     ├─ pipe-capacities.json
│     └─ sample-well-data.json
│
└─ Cloud Functions (us-central1)
   ├─ calculateStringVolume
   ├─ calculateAnnularVolumes
   ├─ calculateKillSheet
   ├─ calculatePumpOutputs
   ├─ convertUnits
   ├─ trackDisplacement
   ├─ saveWellConfiguration
   └─ getWellConfiguration
```

---

## Performance Architecture

### Client-Side Performance

```
Initial Load:
  ├─ HTML Parse: ~10ms
  ├─ CSS Parse: ~5ms
  ├─ JavaScript Execute: ~20ms
  ├─ JSON Load (async): ~50-100ms
  └─ Total: <200ms

Calculation Performance:
  ├─ String Volume: <1ms
  ├─ Annular Volume: <1ms
  ├─ Kill Sheet: <5ms
  ├─ Pump Outputs: <2ms
  └─ Total Recalc: <10ms
```

### Server-Side Performance

```
Cloud Function Call:
  ├─ Cold Start: ~500-1000ms (first call)
  ├─ Warm Execution: ~100-300ms
  │  ├─ Auth Validation: ~20ms
  │  ├─ Calculation: ~10-50ms
  │  └─ Firestore Write: ~50-200ms
  └─ Response Time: <300ms (warm)
```

---

## Scalability

### Horizontal Scaling

```
                    Load Balancer
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
Cloud Function      Cloud Function      Cloud Function
  Instance 1          Instance 2          Instance 3
      │                   │                   │
      └───────────────────┼───────────────────┘
                          │
                  Firestore Database
                  (Auto-scaling)
```

### Concurrent Users

```
Standalone Mode:
  Unlimited (each user has own browser instance)

Firebase Mode:
  - Cloud Functions: 1000 concurrent instances
  - Firestore: 1M concurrent connections
  - Hosting: Unlimited via CDN

Expected Load:
  - 10-100 users: No issues
  - 100-1000 users: Excellent performance
  - 1000+ users: Still performs well
```

---

## Data Architecture

### Data Relationships

```
organisations
     │
     └─→ users (user-profiles)
            │
            └─→ wells
                  ├─→ well-string-configs
                  ├─→ well-sections
                  ├─→ kill-sheets
                  ├─→ bop-configurations
                  └─→ displacement-tracking
                         │
                         └─→ volume-calculations-log
```

### Data Flow

```
Create Well
    │
    ├─→ Define String Configuration
    │      │
    │      └─→ Calculate Volumes
    │             │
    │             └─→ Log Calculation
    │
    ├─→ Define Well Sections
    │      │
    │      └─→ Calculate Annular Volumes
    │             │
    │             └─→ Log Calculation
    │
    └─→ Create Kill Sheet
           │
           ├─→ Calculate Kill Parameters
           │      │
           │      └─→ Log Calculation
           │
           └─→ Track Displacement
                  │
                  ├─→ Update Real-time
                  └─→ Log Progress
```

---

**System Architecture Version:** 1.0
**Last Updated:** November 21, 2025
