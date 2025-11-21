# OGLMS Well Volumes & Kill Sheet System

**Oil & Gas Liquid Management System - Digital Well Control Calculator**

## Overview

A comprehensive, web-based well volumes calculator and kill sheet system designed for oil & gas drilling operations. This system matches and exceeds the functionality of traditional Excel-based OGLMS systems, providing real-time calculations, BOP well control, and kill sheet management.

---

## Features

### 1. **Interactive Well Volumes Calculator** (`worksheets/well-volumes-calculator.html`)

A standalone HTML application with **2,722 lines** of functionality including:

#### **12 Main Tabs:**

1. **Dashboard** - Real-time overview of all calculations
2. **Units** - Comprehensive unit system management (Imperial/Metric)
3. **Strings** - Drill string component configuration
4. **Well Sections** - Casing and open hole configuration
5. **Annular Volumes** - Quick reference and calculator
6. **Kill Sheet** - Complete well control calculations
7. **BOP Kill Sheet** (NEW) - 3-page subsea BOP system
8. **Pipe Reference** (NEW) - Complete pipe library
9. **Density Tables** (NEW) - Mud weight conversions
10. **Conversions** - Unit conversion reference
11. **Stroke Tracker** (NEW) - Real-time displacement tracking
12. **Schematic** - Visual well representation

#### **Key Capabilities:**

- **Real-time calculations** for all volume and pressure parameters
- **Driller's Method kill sheet** with 20-step pressure schedule
- **Subsea BOP well control** with 3-page configuration
- **Pump output tables** for various rates and configurations
- **Stroke tracking** with milestone monitoring
- **Save/Load configurations** via localStorage
- **Export to PDF** with optimized print layout
- **Dropdown selectors** from comprehensive pipe libraries
- **Density tables** with PPG ↔ SG conversions
- **Hydrostatic pressure calculator**
- **Complete reference tables** for all common pipe sizes

### 2. **Data Files**

#### **unit-conversions.json** (New)
Comprehensive conversion factors for:
- Density (ppg, sg, kg/m³)
- Length (ft, m, in, mm)
- Volume (bbl, L, m³, gal)
- Pressure (psi, bar, kPa, MPa)
- Capacity constants and formulas

#### **pipe-capacities.json** (New)
Complete library of standard oil field tubulars:
- **Drill Pipe**: 9 standard sizes (2-3/8\" to 6-5/8\")
- **Drill Collars**: 8 sizes (4-3/4\" to 9-1/2\" OD)
- **HWDP**: 4 sizes (3-1/2\" to 5-1/2\")
- **Casing**: 24 sizes with multiple weights and grades
- **Open Hole**: 12 standard sizes (5-7/8\" to 36\")
- **Annular Capacities**: 8 common combinations

#### **sample-well-data.json** (New)
Example well configurations including:
- Well master data (Maersk Voyager, Platform Echo)
- String configurations with multiple BHA options
- Well section profiles with casings and open hole
- Complete kill sheets with kick data
- BOP stack configurations (Cameron, Hydril)

### 3. **Firestore Schema** (`well-volumes-schema.md`)

Complete database schema for 7 collections:

1. **wells** - Master well data and configuration
2. **well-string-configs** - Drill string components
3. **well-sections** - Casing/hole sections and annular volumes
4. **kill-sheets** - Well control calculations and kill data
5. **bop-configurations** - BOP stack equipment and ratings
6. **displacement-tracking** - Real-time fluid position tracking
7. **volume-calculations-log** - Audit trail of all calculations

Includes:
- Complete field definitions
- Security rules
- Composite indexes
- Query patterns
- Data migration strategy

### 4. **Cloud Functions** (`functions/wellVolumeCalculations.js`)

8 serverless functions for complex calculations:

1. **calculateStringVolume** - Drill string internal volumes
2. **calculateAnnularVolumes** - Annular space calculations
3. **calculateKillSheet** - Complete Driller's Method kill parameters
4. **calculatePumpOutputs** - Pump rate tables
5. **convertUnits** - Universal unit conversions
6. **trackDisplacement** - Real-time stroke/position tracking
7. **saveWellConfiguration** - Persist to Firestore
8. **getWellConfiguration** - Load from Firestore

All functions include:
- Input validation
- Error handling
- Authentication checks
- Comprehensive calculations
- Support for both imperial and metric units

---

## Calculations Reference

### String Volume
```
Capacity (bbl/ft) = ID² / 1029.4
Volume (bbl) = Capacity × Length
Displacement (bbl) = ((OD² - ID²) / 1029.4) × Length
```

### Annular Volume
```
Capacity (bbl/ft) = (Hole ID² - Pipe OD²) / 1029.4
Volume (bbl) = Capacity × Length
```

### Hydrostatic Pressure
```
Imperial: HP (psi) = MW (ppg) × 0.052 × TVD (ft)
Metric:   HP (bar) = MW (sg) × 0.0981 × TVD (m)
```

### Kill Sheet Calculations

**Formation Pressure:**
```
FP = SIDPP + (MW × 0.052 × TVD)
```

**Kill Weight Mud:**
```
KWM = MW + (SIDPP / 0.052 / TVD)
```

**Initial Circulating Pressure:**
```
ICP = SCR + SIDPP
```

**Final Circulating Pressure:**
```
FCP = SCR × (KWM / MW)
```

**MAASP (Maximum Allowable Annular Surface Pressure):**
```
MAASP = (LOT EMW - KWM) × 0.052 × Shoe TVD
```

**Strokes to Bit:**
```
STB = String Volume / Pump Output
```

---

## Usage

### Standalone HTML Calculator

1. **Open** `worksheets/well-volumes-calculator.html` in any modern web browser
2. **Select unit system** (Imperial or Metric) in the header
3. **Navigate tabs** to input well configuration:
   - **Strings Tab**: Add drill pipe, HWDP, drill collars
   - **Well Sections Tab**: Add casing strings and open hole
   - **Kill Sheet Tab**: Input kick data and well parameters
   - **BOP Kill Sheet Tab**: Configure subsea BOP system
4. **View Dashboard** for real-time summary
5. **Save Configuration** using the save button (stores in browser localStorage)
6. **Print/Export** using the Print button (optimized PDF output)

### With Firebase/Firestore

1. **Deploy Cloud Functions:**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

2. **Initialize Firestore Collections:**
   - Use `sample-well-data.json` as template
   - Import data using Firebase Console or admin SDK
   - Apply security rules from `well-volumes-schema.md`

3. **Call Functions from Frontend:**
   ```javascript
   // Calculate string volume
   const result = await firebase.functions().httpsCallable('calculateStringVolume')({
     components: [...],
     pumpOutput: 0.117
   });

   // Calculate kill sheet
   const killSheet = await firebase.functions().httpsCallable('calculateKillSheet')({
     currentMudWeight: 12.0,
     tvd: 10000,
     sidpp: 500,
     sicp: 650,
     scr: 800,
     pitGain: 20,
     shoeTVD: 8000,
     lotEMW: 14.5,
     stringVolume: 185.0,
     annularVolume: 1932.5,
     pumpOutput: 0.117
   });
   ```

---

## File Structure

```
/data/well-control-manuals/vol-4-calculations-quickref/
├── README.md                          (This file)
├── well-volumes-schema.md             (Firestore database schema)
├── worksheets/
│   └── well-volumes-calculator.html   (Standalone calculator - 2,722 lines)
├── data/
│   ├── unit-conversions.json          (Conversion factors)
│   ├── pipe-capacities.json           (Pipe library - 200+ entries)
│   └── sample-well-data.json          (Example well configurations)
└── /functions/
    ├── wellVolumeCalculations.js      (8 Cloud Functions)
    └── index.js                       (Function exports)
```

---

## Comparison with Excel OGLMS

| Feature | Excel OGLMS | Digital OGLMS | Advantage |
|---------|-------------|---------------|-----------|
| **Platform** | Excel Desktop | Web Browser | ✓ Cross-platform |
| **Real-time Calc** | Manual refresh | Automatic | ✓ Instant updates |
| **Data Entry** | Manual typing | Dropdown selectors | ✓ Faster, fewer errors |
| **Save/Load** | File system | LocalStorage + Cloud | ✓ Multiple methods |
| **Collaboration** | Email files | Cloud database | ✓ Real-time sharing |
| **Mobile** | Limited | Fully responsive | ✓ Works on phone/tablet |
| **Print** | Basic | Optimized PDF | ✓ Better layouts |
| **Pipe Library** | Static tables | Dynamic JSON | ✓ Easy to update |
| **Audit Trail** | Manual logs | Automatic logging | ✓ Complete history |
| **Stroke Tracking** | Manual | Real-time with milestones | ✓ Live monitoring |
| **Units** | Convert manually | Automatic conversion | ✓ Error-free |
| **BOP Kill Sheet** | 3 pages | Interactive 3 pages | ✓ Auto-calculated |
| **Training** | Offline | Can integrate with CCIS | ✓ Smart training |

---

## Advanced Features

### 1. **Pipe Library Integration**

The calculator loads comprehensive pipe data from `pipe-capacities.json`:

```javascript
// Auto-loaded on page load
loadReferenceData(); // Loads JSON asynchronously

// Populate dropdowns
populatePipeSelectors(); // Creates <option> elements

// Apply selected pipe data
applyPipeDataToRow(index, pipeData); // One-click population
```

### 2. **Save/Load Configurations**

Configurations are saved to browser localStorage:

```javascript
// Save current configuration
saveConfiguration(); // Stores JSON in localStorage

// Load saved configuration
loadConfiguration(); // Retrieves and populates all fields

// Data preserved:
// - Unit selections
// - All string components
// - All well sections
// - Pump settings
// - Timestamps
```

### 3. **Real-Time Stroke Tracking**

Live monitoring of fluid displacement:

```javascript
updateDisplacement(); // Called on stroke input change

// Displays:
// - Current position (string or annulus)
// - % complete for each section
// - Milestones (bit, annulus start, mid, complete)
// - Time remaining
// - ETA for completion
```

### 4. **BOP Kill Sheet System**

3-page subsea BOP well control:

**Page 1 - Well Data:**
- Casing/tubing configuration
- Real-time volume dashboard
- Riser calculations
- Total system volumes

**Page 2 - Kill Calculations:**
- 6-step Driller's Method
- Pressure step schedule (20 steps)
- MAASP warning system
- Barrier envelope

**Page 3 - Pump Outputs:**
- Multiple pump configurations
- SCR test data
- Combined pump tables
- Circulation time estimates

### 5. **Density Tables**

Complete mud weight reference:

- PPG to SG table (8.0-20.0 ppg)
- SG to PPG table (0.80-2.40 sg)
- Common fluids reference (9 fluids)
- Hydrostatic pressure calculator
- Gradient display (psi/ft and bar/m)

---

## Technical Specifications

### **Browser Support**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Dependencies**
- None (standalone HTML/CSS/JavaScript)
- Optional: Firebase SDK for cloud features

### **Performance**
- Instant calculations (<1ms)
- JSON data loads async (<100ms)
- No server required for basic use
- Cloud Functions respond in <200ms

### **Data Size**
- HTML file: ~150 KB
- unit-conversions.json: ~6 KB
- pipe-capacities.json: ~35 KB
- Total footprint: <200 KB

### **Security**
- Client-side calculations (no data transmission)
- LocalStorage is browser-isolated
- Firestore rules enforce access control
- Cloud Functions require authentication

---

## Future Enhancements

### Planned Features:
1. **Multi-well tracking** - Manage multiple wells simultaneously
2. **Torque & Drag calculations** - Drilling engineering analysis
3. **Hydraulics modeling** - ECD, annular velocity, cuttings transport
4. **Casing design** - Burst, collapse, tension analysis
5. **Cementing calculator** - Slurry volume, TOC, displacement
6. **PWD integration** - Real-time pressure-while-drilling data
7. **AI-powered suggestions** - Smart recommendations based on well data
8. **Mobile app** - Native iOS/Android versions
9. **3D well visualization** - Enhanced schematic with 3D rendering
10. **Report generation** - Automated daily drilling reports

### Data Integrations:
- WITSML (Wellsite Information Transfer Standard Markup Language)
- IADC reports (International Association of Drilling Contractors)
- Third-party MWD/LWD systems
- Rig instrumentation (DCS, PLC)

---

## Support & Documentation

### Quick Links:
- **Excel Screenshots**: See original OQLMS workbook for reference
- **Firestore Schema**: `well-volumes-schema.md`
- **Unit Conversions**: `data/unit-conversions.json`
- **Pipe Library**: `data/pipe-capacities.json`
- **Sample Data**: `data/sample-well-data.json`

### Formulas Reference:
All calculations follow **API (American Petroleum Institute)** standards and **IADC well control guidelines**.

### Training:
This system can be integrated with the **CCIS (Crew Competency Information System)** for AI-powered training on well control procedures.

---

## Version History

**Version 2.0** (November 2025)
- Added BOP Kill Sheet (3 pages)
- Added Pipe Reference library integration
- Added Density Tables
- Added Stroke Tracker with milestones
- Enhanced save/load functionality
- Added JSON data file integration
- Created Cloud Functions (8 functions)
- Designed Firestore schema (7 collections)
- Increased from 1,237 to 2,722 lines (120% increase)

**Version 1.0** (Previous)
- Basic well volumes calculator
- Kill sheet calculations
- Unit conversions
- Dashboard and schematic

---

## License & Usage

**Copyright © 2025 Metamorphic Energy**

This system is designed for professional oil & gas drilling operations. All calculations should be verified by qualified drilling engineers before use in actual well operations.

---

## Contact

For questions, support, or feature requests:
- **Email**: mckay@metamorphic.energy
- **Organization**: Metamorphic Energy / NUBLK Creative
- **Project**: Gabriella Functions / CCIS

---

**Last Updated:** November 21, 2025
**Maintained By:** Metamorphic Energy Engineering Team
