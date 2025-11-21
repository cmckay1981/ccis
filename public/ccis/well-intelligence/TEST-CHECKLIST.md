# Dashboard Test Checklist

## Dashboard Home (`index.html`)

### Visual Elements
- [ ] Header displays with OGLMS logo and "Create New Well" button
- [ ] User avatar shows "MM" initials
- [ ] 4 stats cards display (Total Wells: 2, Active: 1, Completed: 1, Volume: 2,026.67 bbl)
- [ ] Stats cards have gradient backgrounds

### Well Cards
- [ ] Two well cards display:
  - **Maersk Voyager - Well A-12** (Drilling - Red dot)
  - **Platform Echo - Well B-05** (Completed - Blue dot)
- [ ] Each card shows:
  - Well name with status indicator
  - Location (field, country)
  - Current operation/depth
  - String volume
  - Annular volume
  - Last update time
  - Two action buttons (📊 Volumes, 📋 Kill Sheet)

### Filters
- [ ] Filter tabs present: All, Active, Drilling, Completed, Suspended
- [ ] "All" is selected by default (blue background)
- [ ] Clicking "Drilling" shows only A-12
- [ ] Clicking "Completed" shows only B-05
- [ ] Well count updates correctly

### Quick Actions
- [ ] Panel displays on right side
- [ ] 6 action buttons present:
  - 📊 Volume Calculator
  - 📋 Create Kill Sheet
  - 🔧 BOP Test Log
  - 📈 Displacement Tracker
  - 🤖 Ask Gabriella
  - 📄 Export Reports

### Functionality
- [ ] "📊 Volumes" button opens calculator in new tab
- [ ] Calculator URL: `../data/well-control-manuals/vol-4-calculations-quickref/worksheets/well-volumes-calculator.html`
- [ ] "🤖 Ask Gabriella" button opens CCIS
- [ ] "+ Create New Well" button opens wizard

---

## Well Creation Wizard (`create-well.html`)

### General
- [ ] Progress bar shows 5 steps
- [ ] Step 1 is highlighted initially
- [ ] "Next" and "Cancel" buttons present
- [ ] "Cancel" returns to dashboard

### Step 1: Well Information
- [ ] Form sections display:
  - Basic Information (Well Name, Number, API/UWI)
  - Operator & Rig (Organisation, Rig Name, Rig Type, Contractor)
  - Location (Field, Block, Country, Lat/Lon, Water Depth, Air Gap)
  - Well Type (Type, Purpose, Profile)
  - Unit System (Imperial/Metric radio buttons)
- [ ] All inputs are text/select fields
- [ ] "Next" button advances to Step 2

### Step 2: Casing Design
- [ ] Form sections display:
  - Well Trajectory (Total Depth, TVD, Kickoff, Inclination, Azimuth)
  - Casing Program (table with + Add button)
  - Drilling Fluids (Mud Weight, Type, System)
- [ ] "+ Add Casing String" creates new row
- [ ] Row has: String Name, Size, Weight, Grade, Top, Bottom, Remove button
- [ ] "Previous" returns to Step 1
- [ ] "Next" advances to Step 3

### Step 3: Drill String
- [ ] Form sections display:
  - String Components (table with + Add button)
  - Pump Data (Type, Liner, Stroke, Efficiency, Target SPM)
  - Calculations Summary (3 cards)
- [ ] "+ Add Component" creates new row
- [ ] Row has: Type, Component, OD, ID, Length, Remove button
- [ ] Pump type dropdown: Triplex/Duplex
- [ ] Calculation cards show:
  - Pump Output (bbl/stroke)
  - String Volume (bbl)
  - Strokes to Bit
- [ ] Values update when inputs change
- [ ] "Previous" and "Next" work

### Step 4: BOP Configuration
- [ ] Form sections display:
  - BOP Stack Info (Type, Manufacturer, Model, Working Pressure)
  - Kill & Choke Lines (sizes, ratings, manifold)
  - Subsea Details (conditional - only shows if "Subsea" selected)
- [ ] BOP Type dropdown: Surface/Subsea
- [ ] Selecting "Subsea" shows riser and connector fields
- [ ] Selecting "Surface" hides subsea fields
- [ ] "Previous" and "Next" work

### Step 5: Review & Save
- [ ] Summary sections display:
  - Well Information (with Edit button)
  - Casing Design (with Edit button)
  - Drill String (with Edit button)
  - BOP Configuration (with Edit button)
- [ ] Each "Edit" button returns to respective step
- [ ] Data persists when returning from edit
- [ ] "Save & Create Well" shows success alert
- [ ] After save, redirects to dashboard (currently shows alert only)

### Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] Dashboard switches to single column
- [ ] Well cards stack vertically
- [ ] Quick actions panel moves below wells
- [ ] Wizard form sections stack
- [ ] Tables scroll horizontally if needed
- [ ] All buttons remain accessible

---

## Integration Tests

### Calculator Link
- [ ] Open dashboard
- [ ] Click "📊 Volumes" on Maersk Voyager well
- [ ] Calculator opens in new tab
- [ ] Calculator loads successfully
- [ ] Calculator shows all 12 tabs

### CCIS Link
- [ ] Click "🤖 Ask Gabriella" in Quick Actions
- [ ] New tab opens to `../ccis/` (may show 404 if not built yet)

### Create Well Flow
- [ ] Click "+ Create New Well"
- [ ] Wizard opens
- [ ] Fill Step 1: "Test Well X-99"
- [ ] Fill Step 2: Add 2 casing strings
- [ ] Fill Step 3: Add 3 components, enter pump data
- [ ] Verify calculations update
- [ ] Fill Step 4: Select "Subsea", fill fields
- [ ] Step 5: Verify all data in summary
- [ ] Click Edit button, verify return to step
- [ ] Complete wizard
- [ ] Click "Save & Create Well"
- [ ] Alert shows "Well saved successfully!"
- [ ] (Would redirect to dashboard in production)

---

## Browser Console
- [ ] Open DevTools (F12)
- [ ] Check Console tab
- [ ] No errors displayed (except Firebase config warning expected)
- [ ] Mock data logs visible

---

## Known Limitations (Expected)
- ⚠️ Firebase warning: "Firebase config not set"
- ⚠️ Save button shows alert instead of saving to database
- ⚠️ Calculator doesn't auto-populate with well data yet
- ⚠️ CCIS may not exist yet (404 expected)
- ⚠️ No authentication - using mock user

---

## Test Results

**Date Tested:** _____________
**Browser:** _____________
**Tester:** _____________

### Passed ✅


### Failed ❌


### Notes:
