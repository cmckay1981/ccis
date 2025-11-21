# Industry Scenario Packs Framework

## Overview

Industry Scenario Packs provide job-function-specific examples that replace generic scenarios in lessons. Core learning content remains the same; scenarios are swapped to match the learner's industry AND department.

---

## Available Industry Packs

| Code | Industry | Departments | Total Roles |
|------|----------|-------------|-------------|
| **OG** | Oil & Gas | Rig Floor, Control Room, Maintenance, etc. | 40+ |
| **HSP** | Hospitality | 12 departments | 60+ roles |
| **AVN** | Aviation | 12 departments | 50+ roles |
| **HCR** | Healthcare | 15 departments | 70+ roles |
| **MFG** | Manufacturing | 13 departments | 55+ roles |

---

## Hospitality (HSP) Departments

| Department | Sample Roles |
|------------|--------------|
| Front Desk / Guest Services | Front Desk Agent, Concierge, Bell Staff, Valet |
| Housekeeping | Room Attendant, Supervisor, Laundry, Public Area |
| F&B - Front of House | Server, Host, Bartender, Restaurant Manager |
| F&B - Back of House | Line Cook, Prep Cook, Sous Chef, Executive Chef |
| Casino / Gaming | Dealer, Pit Boss, Slot Attendant, Surveillance |
| Nightlife / Entertainment | Door Staff, VIP Host, Promoter, Nightclub Manager |
| Security | Security Officer, Loss Prevention, Emergency Response |
| Maintenance / Engineering | Technician, HVAC, Electrician, Chief Engineer |
| HR / Administration | HR Generalist, Recruiter, Training Coordinator |
| Purchasing / Receiving | Purchasing Agent, Receiver, Inventory Controller |
| Spa / Wellness | Massage Therapist, Esthetician, Spa Director |
| Events / Banquets | Event Coordinator, Banquet Captain, AV Technician |

---

## Aviation (AVN) Departments

| Department | Sample Roles |
|------------|--------------|
| Flight Deck | Captain, First Officer, Check Airman |
| Cabin Crew | Purser, Flight Attendant, Cabin Service Director |
| Ground Operations | Ramp Agent, Ground Crew Lead, Pushback Operator |
| Dispatch / Operations | Flight Dispatcher, Crew Scheduler, Weather Specialist |
| Maintenance / MRO | A&P Mechanic, Avionics Tech, Inspector |
| Passenger Services | Gate Agent, Ticket Agent, Customer Service |
| Cargo Operations | Cargo Agent, Load Planner, Dangerous Goods Specialist |
| Security | TSA Officer, Airport Security, K-9 Handler |
| Air Traffic Services | Tower Controller, Approach Controller, Center Controller |
| Fueling | Fuel Technician, Quality Specialist, Supervisor |
| Catering | Catering Driver, Galley Loader, Food Safety Specialist |
| Training / Standards | Flight Instructor, Simulator Instructor, Standards Captain |

---

## Healthcare (HCR) Departments

| Department | Sample Roles |
|------------|--------------|
| Nursing - Inpatient | RN, Charge Nurse, Nurse Manager, PCT |
| Emergency Department | ED Nurse, Triage Nurse, Trauma Nurse |
| Physicians | Attending, Resident, Hospitalist, Specialist |
| Surgical Services / OR | Surgeon, Anesthesiologist, Scrub Tech, Circulator |
| Pharmacy | Clinical Pharmacist, Pharmacy Tech, Director |
| Laboratory | Medical Technologist, Phlebotomist, Pathologist |
| Imaging / Radiology | Radiologic Tech, CT Tech, MRI Tech, Radiologist |
| Respiratory Therapy | Respiratory Therapist, ECMO Specialist |
| Patient Transport | Transporter, Dispatch, Logistics Coordinator |
| Environmental Services | EVS Technician, Infection Prevention Liaison |
| Registration / Access | Registrar, Financial Counselor, Revenue Cycle |
| Case Management | Case Manager, Social Worker, Discharge Planner |
| Biomedical Engineering | Biomed Technician, Clinical Engineer |
| Infection Prevention | Infection Preventionist, Patient Safety Officer |
| EMS / Prehospital | EMT, Paramedic, Flight Medic |

---

## Manufacturing (MFG) Departments

| Department | Sample Roles |
|------------|--------------|
| Production / Operations | Machine Operator, Line Lead, Production Supervisor |
| Maintenance / Reliability | Maintenance Tech, Electrician, Millwright, Planner |
| Quality Control | Quality Inspector, Lab Analyst, Quality Engineer |
| Warehouse / Logistics | Forklift Operator, Picker/Packer, Shipping Clerk |
| Engineering | Process Engineer, Manufacturing Engineer, Project Engineer |
| Safety / EHS | Safety Technician, EHS Specialist, Industrial Hygienist |
| Supply Chain | Buyer, Planner, Supply Chain Analyst, Procurement |
| Production Planning | Production Planner, Master Scheduler, Capacity Planner |
| Process Control | Control Room Operator, Board Operator, DCS Technician |
| Utilities / Facilities | Utilities Operator, Boiler Operator, HVAC Technician |
| Training / HR | Training Coordinator, HR Generalist |
| Laboratory / R&D | Lab Technician, Research Scientist, Product Developer |
| Packaging / Finishing | Packaging Operator, Line Lead, Packaging Supervisor |

---

## Scenario Structure

Each department includes scenarios for all 6 competencies:

```json
{
  "DEPARTMENT_CODE": {
    "name": "Department Name",
    "roles": ["Role 1", "Role 2", "Role 3"],
    "scenarios": {
      "SA": "Situational awareness scenario for this department",
      "DM": "Decision making scenario for this department",
      "COMM": "Communication scenario for this department",
      "TW": "Teamwork scenario for this department",
      "LEAD": "Leadership scenario for this department",
      "HF": "Human factors scenario for this department"
    }
  }
}
```

---

## Cross-Department Scenarios

Each industry pack includes scenarios requiring coordination across multiple departments:

- **Hospitality:** VIP Arrival, System Outage, Medical Emergency, Staffing Crisis
- **Aviation:** Weather Diversion, Security Incident, Mechanical AOG, Medical Diversion
- **Healthcare:** Rapid Response, Surgical Emergency, Outbreak Response, Discharge Crunch
- **Manufacturing:** Equipment Failure, Quality Escape, Process Upset, Rush Order

---

## Implementation

### Deploying by Department

1. Select industry pack (HSP, AVN, HCR, MFG)
2. Select department(s) to include
3. System filters scenarios to relevant roles
4. Learners see scenarios from their own work context

### Deploying Cross-Functional

1. Select industry pack
2. Include all departments
3. Use cross-department scenarios for team exercises
4. Build shared vocabulary across organization

---

## Language Localization

Each scenario pack supports multiple languages:

```
HSP_HOSPITALITY/
├── scenarios_EN.json    (English - Primary)
├── scenarios_PT.json    (Portuguese)
├── scenarios_ES.json    (Spanish)
```

---

## Creating Custom Industry Packs

To create a new industry pack:

1. Copy template structure from existing pack
2. Define departments and roles for your industry
3. Write 6 scenarios per department (SA, DM, COMM, TW, LEAD, HF)
4. Create 3-4 cross-department scenarios
5. Define terminology mapping
6. Validate with industry subject matter experts
7. Test for cultural sensitivity

---

## Quality Standards

All scenarios must:
- Be operationally realistic for that role
- Avoid stereotypes or cultural insensitivity
- Use industry-standard terminology
- Present learnable situations (not trick questions)
- Have clear correct answers with educational explanations
- Be appropriate for all experience levels

---

**Copyright:** Claymore & Colt - All Rights Reserved
