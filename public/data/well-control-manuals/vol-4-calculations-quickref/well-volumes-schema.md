# WELL VOLUMES & KILL SHEET FIRESTORE SCHEMA

**Version:** 1.0
**Last Updated:** November 2025
**Project:** gabriella-functions / Well Control OGLMS

---

## OVERVIEW

The Well Volumes system tracks drill string configurations, well sections, annular volumes, kill sheet calculations, and BOP control data for oil & gas operations. This schema supports both imperial and metric units with real-time calculations.

---

## COLLECTION 1: wells

**Purpose:** Top-level well information and configuration

**Collection Path:** `wells`

**Document ID:** Well identifier (e.g., `well-claymore-001`, `well-platform-echo-A12`)

**Document Schema:**

```typescript
{
  wellId: string;              // Well ID (same as document ID)
  wellName: string;            // e.g., "Claymore Platform Echo A-12"
  wellNumber: string;          // e.g., "A-12", "001"
  rigName: string;             // e.g., "Platform Echo", "Maersk Voyager"
  organisationId: string;      // Reference to organisations collection

  location: {
    field: string;             // e.g., "Claymore Field"
    block: string;             // e.g., "Block 14/19"
    country: string;           // e.g., "United Kingdom", "USA"
    latitude?: number;
    longitude?: number;
    waterDepth?: number;       // in feet or meters
  };

  wellType: "exploration" | "appraisal" | "development" | "injection" | "producer";
  status: "planning" | "drilling" | "suspended" | "completed" | "abandoned";

  // Active configuration references
  activeStringConfigId: string | null;  // Reference to well-string-configs
  activeWellSectionsId: string | null;  // Reference to well-sections
  activeKillSheetId: string | null;     // Reference to kill-sheets

  // Well data
  totalDepth: number;          // MD (ft or m)
  tvd: number;                 // True Vertical Depth
  kickoffDepth?: number;       // Where well deviates
  maxInclination?: number;     // Maximum angle (degrees)

  // Current operations
  currentMudWeight: number;    // ppg or sg
  currentDepth: number;        // Current drill depth
  formationPressure?: number;  // psi or bar

  units: {
    system: "imperial" | "metric";
    length: "ft" | "m";
    diameter: "in" | "mm";
    volume: "bbl" | "m3" | "L";
    mudWeight: "ppg" | "sg" | "kgm3";
    pressure: "psi" | "bar" | "kPa";
    pumpOutput: "bbl/stk" | "L/stk";
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;           // User ID
  lastModifiedBy: string;
}
```

---

## COLLECTION 2: well-string-configs

**Purpose:** Drill string component configurations (DP, HWDP, DC)

**Collection Path:** `well-string-configs`

**Document ID:** Auto-generated

**Document Schema:**

```typescript
{
  configId: string;
  wellId: string;              // Parent well reference
  configName: string;          // e.g., "Initial String - Surface Hole", "BHA-001"
  description: string;
  isActive: boolean;

  components: Array<{
    order: number;             // 1, 2, 3... (from surface down)
    componentType: "drill-pipe" | "hwdp" | "drill-collar" | "stabilizer" | "other";
    name: string;              // e.g., "5\" Drill Pipe", "6-1/2\" DC"
    od: number;                // Outer diameter (in or mm)
    id: number;                // Inner diameter (in or mm)
    length: number;            // Length of this component (ft or m)
    weight?: number;           // Weight (lb/ft or kg/m)

    // Calculated values
    capacity: number;          // Internal capacity (bbl/ft or L/m)
    volume: number;            // Total internal volume (bbl or L)
    displacement: number;      // Volume displaced (bbl or L)
  }>;

  // Totals
  totalLength: number;
  totalVolume: number;         // Total string internal volume
  totalDisplacement: number;   // Total string displacement
  totalStrokes: number;        // Strokes to pump through string

  pumpData: {
    pumpOutput: number;        // bbl/stk or L/stk
    pumpRate: number;          // SPM (strokes per minute)
    pumpTime: number;          // Minutes to displace string
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## COLLECTION 3: well-sections

**Purpose:** Well casing/hole sections and annular volumes

**Collection Path:** `well-sections`

**Document ID:** Auto-generated

**Document Schema:**

```typescript
{
  sectionId: string;
  wellId: string;              // Parent well reference
  configName: string;          // e.g., "Final Well Configuration"
  isActive: boolean;

  sections: Array<{
    order: number;             // 1, 2, 3... (from surface down)
    sectionType: "conductor" | "surface-casing" | "intermediate-casing" | "production-casing" | "liner" | "open-hole";
    name: string;              // e.g., "30\" Conductor", "13-3/8\" Surface Csg", "8-1/2\" Open Hole"

    // Dimensions
    holeID: number;            // Hole or casing inner diameter (in or mm)
    stringOD: number;          // String outer diameter in this section (in or mm)
    topDepth: number;          // Top of section (ft or m)
    bottomDepth: number;       // Bottom of section (ft or m)
    length: number;            // Calculated length

    // Casing specific
    casingWeight?: number;     // lb/ft or kg/m
    casingGrade?: string;      // e.g., "K-55", "P-110"
    casingOD?: number;         // Outer diameter if casing

    // Calculated values
    annularCapacity: number;   // bbl/ft or L/m
    annularVolume: number;     // Total annular volume (bbl or L)
    strokes: number;           // Strokes to fill this annular section
  }>;

  // Totals
  totalAnnularVolume: number;
  totalStrokes: number;
  totalCirculationTime: number; // Minutes for complete circulation

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## COLLECTION 4: kill-sheets

**Purpose:** Well control kill sheet calculations (Driller's Method, Wait & Weight)

**Collection Path:** `kill-sheets`

**Document ID:** Auto-generated

**Document Schema:**

```typescript
{
  killSheetId: string;
  wellId: string;
  stringConfigId: string;      // Reference to well-string-configs
  wellSectionsId: string;      // Reference to well-sections

  sheetName: string;           // e.g., "Kill Sheet - 8500ft", "Primary BOP Test"
  method: "drillers-method" | "wait-and-weight" | "volumetric";
  status: "draft" | "active" | "executed" | "archived";

  // Kick data
  kickData: {
    timestamp: Timestamp;      // When kick detected
    sidpp: number;             // Shut-in drill pipe pressure (psi or bar)
    sicp: number;              // Shut-in casing pressure (psi or bar)
    pitGain: number;           // Pit gain (bbl or L)
    flowRateBeforeShutIn?: number; // bbl/min or L/min
    mudWeightIn: number;       // Current mud weight (ppg or sg)
    mudWeightOut?: number;     // Return mud weight
  };

  // Well data at time of kick
  wellData: {
    bitDepth: number;          // MD at bit (ft or m)
    tvd: number;               // True vertical depth (ft or m)
    currentMudWeight: number;  // ppg or sg
    scr: number;               // Slow Circulating Rate pressure (psi or bar)
    scrRate: number;           // SCR pump rate (SPM)
  };

  // Casing shoe data
  shoeData: {
    shoeTVD: number;           // Shoe true vertical depth (ft or m)
    shoeMD?: number;           // Shoe measured depth
    lotPressure?: number;      // Leak-off test pressure (psi or bar)
    lotEMW: number;            // LOT Equivalent Mud Weight (ppg or sg)
    shoeTestPressure?: number; // Last test pressure
    fractureGradient?: number; // ppg or sg
  };

  // Calculated kill parameters
  calculations: {
    formationPressure: number;        // psi or bar
    killMudWeight: number;            // KWM (ppg or sg)
    icp: number;                      // Initial Circulating Pressure (psi or bar)
    fcp: number;                      // Final Circulating Pressure (psi or bar)
    maasp: number;                    // Maximum Allowable Annular Surface Pressure
    strokesToBit: number;             // Strokes to reach bit
    strokesBottomsUp: number;         // Total circulation strokes
    killMudVolume: number;            // Volume of kill mud needed (bbl or L)

    // Pressure step chart
    pressureSteps: Array<{
      strokes: number;
      dpPressure: number;            // Target DP pressure
      percentComplete: number;
    }>;
  };

  // BOP test data
  bopTest?: {
    testType: "initial" | "function" | "pressure";
    testPressure: number;            // psi or bar
    testDuration: number;            // minutes
    testDate: Timestamp;
    passedTest: boolean;
    notes: string;
  };

  notes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## COLLECTION 5: bop-configurations

**Purpose:** BOP stack configurations and pressure ratings

**Collection Path:** `bop-configurations`

**Document ID:** Auto-generated

**Document Schema:**

```typescript
{
  bopConfigId: string;
  wellId: string;
  rigName: string;

  stackType: "surface" | "subsea";
  manufacturer: string;        // e.g., "Cameron", "Shaffer", "Hydril"
  model: string;

  // Stack configuration (from bottom to top)
  components: Array<{
    order: number;             // 1 (bottom) to N (top)
    componentType: "annular" | "blind-shear-ram" | "pipe-ram" | "variable-bore-ram" | "kill-line" | "choke-line" | "connector";
    manufacturer: string;
    model: string;
    size: string;              // e.g., "18-3/4\"", "13-5/8\""
    workingPressure: number;   // PSI or bar
    ratedPressure: number;     // PSI or bar
    pipeSize?: string;         // For pipe rams (e.g., "5\"", "5-1/2\"")
    lastTestDate?: Timestamp;
    lastTestPressure?: number;
    testPassed?: boolean;
  }>;

  // Control system
  controlSystem: {
    type: "electro-hydraulic" | "hydraulic" | "multiplex";
    accumulator Capacity: number;    // gallons or liters
    accumulatorPressure: number;    // psi or bar
    fluidType: string;              // e.g., "Water-based", "Synthetic"
  };

  // Kill & choke lines
  killChoke: {
    killLineSize: string;           // e.g., "3\"", "4\""
    killLineRating: number;         // psi or bar
    chokeLineSize: string;
    chokeLineRating: number;
    chokeManifoldType: string;      // e.g., "Swaco", "Shaffer"
  };

  // Subsea specific (if applicable)
  subsea?: {
    waterDepth: number;             // ft or m
    lmrpConnector: string;          // Lower Marine Riser Package
    wellheadConnector: string;
    flexJointAngle: number;         // degrees
    riserSize: string;              // e.g., "21\""
    riserPressureRating: number;
  };

  installDate?: Timestamp;
  lastServiceDate?: Timestamp;
  nextServiceDue?: Timestamp;
  certificationExpiry?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## COLLECTION 6: displacement-tracking

**Purpose:** Real-time tracking of fluid displacement during operations

**Collection Path:** `displacement-tracking`

**Document ID:** Tracking session ID

**Document Schema:**

```typescript
{
  sessionId: string;
  wellId: string;
  operationType: "displacement" | "kill-operation" | "cement-job" | "pill" | "circulation";

  startTime: Timestamp;
  endTime?: Timestamp;
  status: "active" | "paused" | "completed" | "aborted";

  // Configuration
  stringConfigId: string;
  wellSectionsId: string;
  killSheetId?: string;          // If part of kill operation

  // Pump data
  pumpData: {
    pumpOutput: number;          // bbl/stk or L/stk
    targetRate: number;          // SPM
    actualRate?: number;         // Current SPM
  };

  // Real-time tracking
  currentStrokes: number;
  targetStrokes: number;
  percentComplete: number;

  fluidPosition: {
    inString: boolean;           // True if fluid still in string
    inAnnulus: boolean;          // True if fluid in annulus
    depthReached?: number;       // Estimated depth of fluid front
    sectionReached?: string;     // Which well section fluid is in
  };

  // Pressure tracking
  pressures: Array<{
    timestamp: Timestamp;
    strokes: number;
    dpPressure: number;
    annulusPressure: number;
    spm: number;
  }>;

  // Alerts
  alerts: Array<{
    timestamp: Timestamp;
    type: "pressure-high" | "pressure-low" | "rate-deviation" | "gains" | "losses";
    message: string;
    acknowledged: boolean;
  }>;

  notes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## COLLECTION 7: volume-calculations-log

**Purpose:** Audit log of all calculations performed

**Collection Path:** `volume-calculations-log`

**Document ID:** Auto-generated

**Document Schema:**

```typescript
{
  logId: string;
  wellId: string;
  userId: string;
  calculationType: "string-volume" | "annular-volume" | "kill-sheet" | "displacement" | "pressure";

  inputs: {
    [key: string]: any;          // All input parameters
  };

  outputs: {
    [key: string]: any;          // All calculated outputs
  };

  units: object;                 // Unit system used
  timestamp: Timestamp;
}
```

---

## INDEXES AND QUERIES

### Recommended Composite Indexes

1. **wells queries:**
   - `organisationId` + `status` + `updatedAt` (DESC)
   - `rigName` + `status`

2. **well-string-configs queries:**
   - `wellId` + `isActive` + `updatedAt` (DESC)

3. **well-sections queries:**
   - `wellId` + `isActive` + `updatedAt` (DESC)

4. **kill-sheets queries:**
   - `wellId` + `status` + `createdAt` (DESC)
   - `wellId` + `method` + `status`

5. **displacement-tracking queries:**
   - `wellId` + `status` + `startTime` (DESC)
   - `operationType` + `status`

---

## SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Wells - organization members only
    match /wells/{wellId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.organisationId ==
        resource.data.organisationId;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['engineer', 'supervisor', 'admin'];
    }

    // String configs - read for all authenticated, write for authorized
    match /well-string-configs/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['driller', 'engineer', 'supervisor', 'admin'];
    }

    // Well sections - same as string configs
    match /well-sections/{sectionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['driller', 'engineer', 'supervisor', 'admin'];
    }

    // Kill sheets - restricted write access
    match /kill-sheets/{killSheetId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['driller', 'engineer', 'supervisor', 'admin'];
    }

    // BOP configurations - read all, write restricted
    match /bop-configurations/{bopId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['engineer', 'supervisor', 'admin'];
    }

    // Displacement tracking - real-time operations
    match /displacement-tracking/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/user-profiles/$(request.auth.uid)).data.role in ['driller', 'engineer', 'supervisor', 'admin'];
      allow update: if request.auth != null &&
        resource.data.status == 'active';
    }

    // Volume calculations log - append only
    match /volume-calculations-log/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

---

## DATA MIGRATION STRATEGY

1. Create reference data collections (pipe-capacities, unit-conversions)
2. Create example well documents
3. Create string configurations for common BHAs
4. Create well sections for standard well designs
5. Generate kill sheets for test scenarios
6. Create BOP configuration templates

---

## CALCULATIONS REFERENCE

### String Volume
```
Capacity (bbl/ft) = ID² / 1029.4
Volume (bbl) = Capacity × Length
```

### Annular Volume
```
Capacity (bbl/ft) = (Hole ID² - Pipe OD²) / 1029.4
Volume (bbl) = Capacity × Length
```

### Hydrostatic Pressure
```
HP (psi) = MW (ppg) × 0.052 × TVD (ft)
HP (bar) = MW (sg) × 0.0981 × TVD (m)
```

### Kill Mud Weight
```
KWM (ppg) = MW + (SIDPP / 0.052 / TVD)
```

### Initial Circulating Pressure
```
ICP = SCR + SIDPP
```

### Final Circulating Pressure
```
FCP = SCR × (KWM / MW)
```

### MAASP
```
MAASP = (LOT EMW - KWM) × 0.052 × Shoe TVD
```

---

**Schema Version:** 1.0
**Last Updated:** November 2025
