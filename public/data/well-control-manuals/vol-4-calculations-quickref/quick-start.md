# Quick Start Guide - OGLMS Well Volumes Calculator

**Get started in 2 minutes!**

---

## Option 1: Open Directly (Fastest)

### Mac/Linux:
```bash
cd /Users/whitemckay/Projects/gabriella-functions/data/well-control-manuals/vol-4-calculations-quickref/worksheets
open well-volumes-calculator.html
```

### Or double-click:
```
📁 gabriella-functions
  └─ 📁 data
      └─ 📁 well-control-manuals
          └─ 📁 vol-4-calculations-quickref
              └─ 📁 worksheets
                  └─ 📄 well-volumes-calculator.html  ← Double-click this
```

**That's it!** The calculator will open in your default browser.

---

## Option 2: Serve with Firebase (Recommended for JSON data)

```bash
cd /Users/whitemckay/Projects/gabriella-functions
firebase serve --only hosting
```

Then open: `http://localhost:5000/data/well-control-manuals/vol-4-calculations-quickref/worksheets/well-volumes-calculator.html`

**Benefit:** JSON data files will load properly via fetch API.

---

## Basic Usage

### 1. Select Units
- Click **Imperial** or **Metric** button in the header
- All calculations update automatically

### 2. Enter Drill String
- Go to **Strings** tab
- Click **+ Add Row** button
- Either:
  - Type manually: Component name, OD, ID, Length
  - Or use dropdown: Select from pipe library (auto-populates)
- Calculations happen instantly

### 3. Enter Well Sections
- Go to **Well Sections** tab
- Click **+ Add Section** button
- Enter: Section name, Hole ID, String OD, Top/Bottom depths
- Annular volumes calculate automatically

### 4. View Dashboard
- Click **Dashboard** tab
- See 4 summary cards:
  - Total String Volume
  - Total Annular Volume
  - Displacement Strokes
  - Pump Time
- Summary tables show breakdown by component

### 5. Generate Kill Sheet
- Go to **Kill Sheet** tab
- Enter kick data:
  - Current Mud Weight
  - TVD at Bit
  - SIDPP (shut-in drill pipe pressure)
  - SICP (shut-in casing pressure)
  - SCR (slow circulating rate)
  - Pit Gain
- Enter shoe data:
  - Shoe TVD
  - LOT EMW (leak-off test equivalent mud weight)
- View 6-step calculations:
  - Formation Pressure
  - Kill Weight Mud
  - ICP / FCP
  - MAASP
  - Strokes to Bit
- Pressure step chart generates automatically (20 steps)

---

## Advanced Features

### BOP Kill Sheet (Subsea)
1. Click **BOP Kill Sheet** tab
2. Navigate 3 pages using **Page 1 | Page 2 | Page 3** buttons
3. **Page 1:** Enter well configuration and casing strings
4. **Page 2:** View kill calculations with barrier envelope
5. **Page 3:** Configure pump outputs and circulation times

### Save Configuration
1. Enter all your data
2. Click **Save Config** button
3. Configuration stores in browser localStorage
4. Survives browser restarts

### Load Configuration
1. Click **Load Config** button
2. All saved data populates automatically
3. Continue editing or printing

### Print / Export PDF
1. Click **Print** button in header
2. Browser print dialog opens
3. Save as PDF or print to paper
4. Layout is optimized for drilling reports

### Track Displacement
1. Go to **Stroke Tracker** tab
2. Enter current strokes pumped
3. Or use quick buttons: +10, +50, +100
4. See live position:
   - % through string
   - % through annulus
   - Milestones (bit, start, mid, complete)
   - Time remaining

---

## Reference Tables

### Pipe Reference
- Click **Pipe Reference** tab
- 6 sub-tabs:
  - Drill Pipe (9 sizes)
  - Drill Collars (8 sizes)
  - HWDP (4 sizes)
  - Casing (24 sizes)
  - Open Hole (12 sizes)
  - Annular Capacities (8 combinations)

### Density Tables
- Click **Density Tables** tab
- PPG to SG conversion (8.0-20.0 ppg)
- SG to PPG conversion (0.80-2.40 sg)
- Common fluids (water, seawater, OBM, etc.)
- Hydrostatic pressure calculator

### Unit Conversions
- Click **Conversions** tab
- Length, Volume, Pressure, Density conversions
- Quick converter tool
- Capacity constants and formulas

---

## Tips & Tricks

### 💡 Use Pipe Library Dropdowns
Instead of typing pipe dimensions, use the dropdown selectors in the Strings table. Select a pipe size and dimensions auto-populate.

### 💡 Watch for Warnings
Kill sheet will show **red warning** if annulus pressure exceeds MAASP (risk of formation breakdown).

### 💡 Multiple Configurations
Save different configurations with different names:
- "Initial String"
- "Final BHA"
- "Casing Running"

### 💡 Mobile-Friendly
Open on phone/tablet for on-site reference. All features work on mobile.

### 💡 Keyboard Shortcuts
- `Tab` to move between input fields
- `Enter` to trigger calculations
- `Ctrl/Cmd + P` to print

---

## Example Workflow

### Scenario: Calculate volumes for 8500ft well

1. **Open calculator** → Double-click HTML file
2. **Select Imperial units** → Click Imperial button
3. **Add drill string** → Strings tab
   - 5" DP, ID 4.276", 7500 ft
   - 5" HWDP, ID 3.0", 500 ft
   - 6.5" DC, ID 2.5", 500 ft
4. **Add well sections** → Well Sections tab
   - 20" Surface Csg, 0-3000 ft
   - 13-3/8" Int Csg, 3000-8000 ft
   - 8.5" Open Hole, 8000-8500 ft
5. **View dashboard** → Click Dashboard tab
   - See total volumes and strokes
6. **Generate kill sheet** → Kill Sheet tab
   - Enter kick data and shoe data
   - View 6-step calculations
7. **Save** → Click Save Config
8. **Print** → Click Print button

**Time:** ~5 minutes

---

## Troubleshooting

### JSON data not loading?
- Serve via Firebase: `firebase serve --only hosting`
- Or place JSON files in same directory as HTML
- Or use file:// protocol (browser dependent)

### Calculations not updating?
- Check that all required fields are filled
- Ensure numbers are valid (not text)
- Try clicking in/out of the field

### Print layout looks wrong?
- Use Chrome or Firefox for best results
- Ensure "Background graphics" is enabled in print settings
- Select "Save as PDF" for best quality

### Can't save configuration?
- Ensure browser allows localStorage
- Check if in incognito/private mode (storage disabled)
- Try a different browser

### Mobile view too small?
- Pinch to zoom in
- Rotate to landscape for more space
- Some tables scroll horizontally

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + P` | Print / Export PDF |
| `Ctrl/Cmd + S` | Save Configuration |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Enter` | Trigger calculation |
| `Esc` | Close dialogs |

---

## Need Help?

### Documentation:
- **Full README**: See `README.md` in same folder
- **Database Schema**: See `well-volumes-schema.md`
- **Summary**: See `/WELL-VOLUMES-SYSTEM-SUMMARY.md` in root

### Example Data:
- **Sample Wells**: `data/sample-well-data.json`
- **Pipe Library**: `data/pipe-capacities.json`
- **Unit Conversions**: `data/unit-conversions.json`

### Support:
- Email: mckay@metamorphic.energy
- Project: gabriella-functions / CCIS

---

## What's Next?

### After you're comfortable:
1. ✅ Deploy Cloud Functions for server-side calculations
2. ✅ Import data to Firestore for multi-user access
3. ✅ Integrate with CCIS training system
4. ✅ Connect to Gabriella AI agent
5. ✅ Build mobile app version

---

**You're ready to go! Open the HTML file and start calculating.**

🚀 **Happy Drilling!**
