# CCIS FIRESTORE SCHEMA DOCUMENTATION

**Version:** 2.0 - Training System
**Last Updated:** January 2026
**Project:** redcell-gabriella / CCIS

---

## OVERVIEW

The CCIS training system uses 7 primary Firestore collections to manage courses, user progress, organizations, and conversation history.

---

## COLLECTION 1: ccis-courses

**Purpose:** Top-level course catalog (e.g., Situational Awareness, Decision Making, Communication, Teamwork, Leadership, Human Factors)

**Collection Path:** `ccis-courses`

**Document ID:** Course identifier (e.g., `SA`, `DM`, `COMM`, `TW`, `LEAD`, `HF`)

**Document Schema:**

```typescript
{
  id: string;              // Course ID (same as document ID)
  title: string;           // e.g., "Situational Awareness"
  description: string;     // Course overview
  icon: string;            // Optional icon/emoji
  order: number;           // Display order (1, 2, 3...)
  modules: string[];       // Array of module IDs (e.g., ["SA-101", "SA-102"])
  systemPrompt: string;    // Base instruction for AI when teaching this course
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**

```json
{
  "id": "SA",
  "title": "Situational Awareness",
  "description": "Master the three phases of SA: Perception, Interpretation, and Projection. Learn to identify threats and maintain awareness in high-stakes environments.",
  "icon": "👁️",
  "order": 1,
  "modules": ["SA-101", "SA-102", "SA-103", "SA-104", "SA-105", "SA-106", "SA-107"],
  "systemPrompt": "You are a CCIS Situational Awareness instructor. Teach one concept at a time. Use clear, practical language. Ask one question at a time. Provide immediate feedback.",
  "createdAt": "2026-01-20T18:00:00Z",
  "updatedAt": "2026-01-20T18:00:00Z"
}
```

---

## COLLECTION 2: ccis-modules

**Purpose:** Modules within courses (e.g., "SA-101: Foundations and Purpose of SA")

**Collection Path:** `ccis-modules`

**Document ID:** Module identifier (e.g., `SA-101`, `DM-201`)

**Document Schema:**

```typescript
{
  id: string;              // Module ID (same as document ID)
  courseId: string;        // Parent course ID (e.g., "SA")
  title: string;           // e.g., "Foundations and Purpose of SA"
  description: string;     // Module overview
  order: number;           // Order within course (1, 2, 3...)
  lessons: string[];       // Array of lesson IDs (e.g., ["SA-101-01", "SA-101-02"])
  estimatedMinutes: number; // Estimated completion time
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**

```json
{
  "id": "SA-101",
  "courseId": "SA",
  "title": "Foundations and Purpose of SA",
  "description": "Introduction to situational awareness, why it matters, and the cost of losing it.",
  "order": 1,
  "lessons": ["SA-101-01", "SA-101-02", "SA-101-03"],
  "estimatedMinutes": 15,
  "createdAt": "2026-01-20T18:00:00Z",
  "updatedAt": "2026-01-20T18:00:00Z"
}
```

---

## COLLECTION 3: ccis-lessons

**Purpose:** Individual lesson units delivered one at a time

**Collection Path:** `ccis-lessons`

**Document ID:** Lesson identifier (e.g., `SA-101-01`)

**Document Schema:**

```typescript
{
  id: string;              // Lesson ID (same as document ID)
  moduleId: string;        // Parent module ID (e.g., "SA-101")
  courseId: string;        // Parent course ID (e.g., "SA")
  title: string;           // e.g., "What is Situational Awareness?"
  type: "lesson" | "scenario" | "knowledge-check" | "reflection";
  order: number;           // Order within module

  // CONTENT (type: "lesson")
  content?: string;        // Teaching content (short, conversational)

  // MULTIPLE CHOICE QUESTIONS (type: "knowledge-check")
  mcq?: Array<{
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctOption: "A" | "B" | "C" | "D";
    explanation: string;
  }>;

  // OPEN-ENDED QUESTIONS (type: "reflection")
  openQuestions?: Array<{
    prompt: string;
    evaluationGuidance: string; // For AI to evaluate response
  }>;

  // SCENARIO (type: "scenario")
  scenario?: {
    story: string;
    choices: {
      A: string;
      B: string;
      C: string;
      D?: string;
    };
    recommendedPath: "A" | "B" | "C" | "D";
    feedback: {
      A: string;
      B: string;
      C: string;
      D?: string;
    };
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Documents:**

```json
{
  "id": "SA-101-01",
  "moduleId": "SA-101",
  "courseId": "SA",
  "title": "What is Situational Awareness?",
  "type": "lesson",
  "order": 1,
  "content": "Situational Awareness (SA) is knowing what's happening around you and what could happen next.\n\nThree phases:\n1. PERCEPTION - What do I see/hear/notice?\n2. INTERPRETATION - What does it mean?\n3. PROJECTION - What could happen next?\n\nSA isn't just looking around. It's active pattern recognition and threat detection.",
  "createdAt": "2026-01-20T18:00:00Z",
  "updatedAt": "2026-01-20T18:00:00Z"
}
```

```json
{
  "id": "SA-101-02",
  "moduleId": "SA-101",
  "courseId": "SA",
  "title": "SA Knowledge Check",
  "type": "knowledge-check",
  "order": 2,
  "mcq": [{
    "question": "Which phase of SA involves predicting what might happen next?",
    "options": {
      "A": "Perception",
      "B": "Interpretation",
      "C": "Projection",
      "D": "Recognition"
    },
    "correctOption": "C",
    "explanation": "Projection is the third phase where you anticipate future states based on what you've perceived and interpreted."
  }],
  "createdAt": "2026-01-20T18:00:00Z",
  "updatedAt": "2026-01-20T18:00:00Z"
}
```

---

## COLLECTION 4: user-profiles

**Purpose:** User identity, organization membership, and active training state

**Collection Path:** `user-profiles`

**Document ID:** User ID (from Firebase Auth or generated)

**Document Schema:**

```typescript
{
  userId: string;          // Same as document ID
  name: string;
  email: string;
  organisationId: string;  // Reference to organisations collection
  role: string;            // e.g., "driller", "supervisor", "engineer", "leadership"

  // COURSE ENROLLMENT
  enrolledCourses: string[]; // Array of course IDs (e.g., ["SA", "DM"])
  activeCourseId: string | null;
  activeModuleId: string | null;
  activeLessonId: string | null;

  // MEMORY (AI maintains this)
  memory: {
    strengths: string[];   // e.g., ["Strong grasp of SA threats"]
    weaknesses: string[];  // e.g., ["Struggles with projection questions"]
    notes: string[];       // e.g., ["Prefers scenario-based learning"]
    lastInteraction: string; // Brief summary of last session
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**

```json
{
  "userId": "user123",
  "name": "John McKay",
  "email": "john@example.com",
  "organisationId": "org-claymore",
  "role": "driller",
  "enrolledCourses": ["SA", "DM"],
  "activeCourseId": "SA",
  "activeModuleId": "SA-102",
  "activeLessonId": "SA-102-03",
  "memory": {
    "strengths": ["Strong grasp of SA definitions", "Quick to recognize threats"],
    "weaknesses": ["Struggles with projection drills", "Needs practice with 4-quadrant scan"],
    "notes": ["Prefers scenario-based learning", "Works offshore drilling"],
    "lastInteraction": "Completed SA-102-02 (Interpretation phase). Asked good questions about bias."
  },
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-20T18:00:00Z"
}
```

---

## COLLECTION 5: organisations

**Purpose:** Company/team context for multi-tenant support

**Collection Path:** `organisations`

**Document ID:** Organization identifier (e.g., `org-claymore`)

**Document Schema:**

```typescript
{
  organisationId: string;  // Same as document ID
  name: string;
  sector: string;          // e.g., "offshore-drilling", "hospitality", "aviation"
  size: string;            // e.g., "10-50", "50-200", "200+"
  region: string;          // e.g., "North America", "Middle East"
  metadata: {
    customField1?: any;
    customField2?: any;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**

```json
{
  "organisationId": "org-claymore",
  "name": "Claymore & Colt Operations",
  "sector": "offshore-drilling",
  "size": "50-200",
  "region": "North America",
  "metadata": {
    "rig": "Platform Echo",
    "certification": "API-certified"
  },
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T10:00:00Z"
}
```

---

## COLLECTION 6: user-progress

**Purpose:** Track completion status, scores, and summaries for each lesson

**Collection Path:** `user-progress`

**Document ID:** User ID

**Document Structure:** Nested map of lesson progress

```typescript
{
  userId: string; // Document ID

  // Each lesson ID becomes a field
  "SA-101-01": {
    status: "not-started" | "in-progress" | "completed";
    score?: number;          // For quizzes (0-100)
    attempts?: number;       // Number of attempts
    lastInteraction: Timestamp;
    summary: string;         // What was covered in this lesson for this user
  },
  "SA-101-02": {
    status: "completed",
    score: 100,
    attempts: 1,
    lastInteraction: "2026-01-20T15:30:00Z",
    summary: "Correctly identified Projection as the phase for predicting future states."
  },
  // ... more lessons
}
```

**Example Document:**

```json
{
  "userId": "user123",
  "SA-101-01": {
    "status": "completed",
    "lastInteraction": "2026-01-20T14:00:00Z",
    "summary": "Learned 3 phases of SA: Perception, Interpretation, Projection"
  },
  "SA-101-02": {
    "status": "completed",
    "score": 100,
    "attempts": 1,
    "lastInteraction": "2026-01-20T15:30:00Z",
    "summary": "Correctly identified Projection as prediction phase"
  },
  "SA-101-03": {
    "status": "in-progress",
    "lastInteraction": "2026-01-20T16:00:00Z",
    "summary": "Started scenario about losing SA during routine operations"
  }
}
```

---

## COLLECTION 7: user-history

**Purpose:** Conversation logs for memory and debugging

**Collection Path:** `user-history`

**Document Structure:** Collection → User Doc → Subcollection of interactions

**Path:** `user-history/{userId}/interactions/{interactionId}`

**Document Schema:**

```typescript
{
  timestamp: Timestamp;
  agent: string;           // e.g., "ccis-training", "kabaakh", "leadership"
  mode: "training" | "general";

  // Training context (if applicable)
  courseId?: string;
  moduleId?: string;
  lessonId?: string;

  // Conversation
  userMessage: string;
  agentReply: string;

  // Metadata
  tags: string[];          // e.g., ["training", "SA", "knowledge-check"]
  actionTaken?: string;    // e.g., "completed-lesson", "failed-quiz", "resumed-training"
}
```

**Example Interaction:**

```json
{
  "timestamp": "2026-01-20T15:30:00Z",
  "agent": "ccis-training",
  "mode": "training",
  "courseId": "SA",
  "moduleId": "SA-101",
  "lessonId": "SA-101-02",
  "userMessage": "C",
  "agentReply": "Confirmed. Projection is the third phase where you anticipate future states based on what you've perceived and interpreted.",
  "tags": ["training", "SA", "knowledge-check", "correct-answer"],
  "actionTaken": "completed-lesson"
}
```

---

## INDEXES AND QUERIES

### Recommended Composite Indexes

1. **user-progress queries:**
   - `userId` + `status` + `lastInteraction` (DESC)

2. **user-history queries:**
   - `userId` + `timestamp` (DESC)
   - `userId` + `courseId` + `timestamp` (DESC)

3. **ccis-lessons queries:**
   - `courseId` + `order` (ASC)
   - `moduleId` + `order` (ASC)

4. **ccis-modules queries:**
   - `courseId` + `order` (ASC)

---

## SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for courses, modules, lessons
    match /ccis-courses/{courseId} {
      allow read: if true;
      allow write: if false; // Admin only (via Cloud Functions)
    }

    match /ccis-modules/{moduleId} {
      allow read: if true;
      allow write: if false;
    }

    match /ccis-lessons/{lessonId} {
      allow read: if true;
      allow write: if false;
    }

    // User profiles - authenticated users only
    match /user-profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // User progress - own data only
    match /user-progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User history - own data only
    match /user-history/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Organizations - read only for members
    match /organisations/{orgId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## DATA MIGRATION STRATEGY

1. Create courses (6 documents)
2. Create modules per course (~40-50 documents)
3. Create lessons per module (~150-200 documents)
4. Create example organization (1 document)
5. Create example user profiles (2-3 documents)
6. Initialize user-progress for test users

---

## NEXT STEPS

- Implement migration scripts to populate collections
- Update ccisProxy to support training mode
- Update frontend to support training UI
- Test end-to-end lesson flow with progress tracking

---

**Schema Version:** 2.0
**Last Updated:** January 2026
