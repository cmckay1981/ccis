/**
 * Delete Old SA Content & Upload All 6 CCIS Courses to Firestore
 *
 * This script:
 * 1. Deletes all old Situational Awareness course data
 * 2. Uploads all 6 courses (SA v2, DM, COMM, TW, LEAD, HF)
 *
 * Run with: node upload_all_courses.js
 * Requires: firebase-admin, Firebase CLI logged in
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin using default credentials from Firebase CLI
admin.initializeApp({
  projectId: 'redcell-gabriella'
});

const db = admin.firestore();

// Course metadata for all 6 courses
const courseMetadata = {
  'situational-awareness': {
    name: 'Situational Awareness',
    description: 'Build and maintain situational awareness in dynamic operational environments. Master perception, comprehension, projection, attention management, and threat recognition to stay ahead of changing conditions.',
    code: 'SA',
    order: 1,
    totalModules: 6,
    estimatedHours: 10,
    difficulty: 'foundational',
    prerequisites: [],
    tags: ['situational-awareness', 'perception', 'attention', 'mental-models', 'threat-detection']
  },
  'decision-making': {
    name: 'Decision Making',
    description: 'Operational decision-making under pressure, uncertainty, and time constraints. Master decision models, recognize cognitive biases, and improve team decision processes.',
    code: 'DM',
    order: 2,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness'],
    tags: ['decision-making', 'cognitive-biases', 'ooda-loop', 'stress-management']
  },
  'communication': {
    name: 'Communication',
    description: 'Verbal and non-verbal communication in operational environments. Master briefings, active listening, assertiveness, conflict resolution, and digital communication.',
    code: 'COMM',
    order: 3,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'foundational',
    prerequisites: ['situational-awareness'],
    tags: ['communication', 'briefings', 'active-listening', 'assertiveness', 'conflict']
  },
  'teamwork': {
    name: 'Teamwork',
    description: 'Team dynamics, coordination, trust-building, and performance optimization. Learn to leverage diversity, build psychological safety, and excel in distributed teams.',
    code: 'TW',
    order: 4,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness', 'communication'],
    tags: ['teamwork', 'coordination', 'trust', 'diversity', 'remote-teams']
  },
  'leadership': {
    name: 'Leadership',
    description: 'Leadership skills for high-reliability operations. Develop decision authority, influence, people development capabilities, crisis management, and ethical leadership.',
    code: 'LEAD',
    order: 5,
    totalModules: 6,
    estimatedHours: 15,
    difficulty: 'advanced',
    prerequisites: ['situational-awareness', 'communication', 'decision-making', 'teamwork'],
    tags: ['leadership', 'decision-authority', 'motivation', 'coaching', 'crisis-management', 'ethics']
  },
  'human-factors': {
    name: 'Human Factors',
    description: 'Human performance limitations, fatigue, stress, environmental factors, human-machine interfaces, and organizational influences on safety.',
    code: 'HF',
    order: 6,
    totalModules: 6,
    estimatedHours: 15,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness'],
    tags: ['human-factors', 'fatigue', 'stress', 'ergonomics', 'automation', 'safety-culture']
  }
};

async function deleteOldSAContent() {
  console.log('\n🗑️  Deleting old Situational Awareness content...');

  const batch = db.batch();
  let deleteCount = 0;

  // Delete old SA lessons
  const lessonsSnapshot = await db.collection('ccis-lessons')
    .where('courseId', '==', 'situational-awareness')
    .get();

  lessonsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  console.log(`  Found ${lessonsSnapshot.size} old SA lessons to delete`);

  // Delete old SA modules
  const modulesSnapshot = await db.collection('ccis-modules')
    .where('courseId', '==', 'situational-awareness')
    .get();

  modulesSnapshot.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  console.log(`  Found ${modulesSnapshot.size} old SA modules to delete`);

  // Delete old SA course
  const courseRef = db.collection('ccis-courses').doc('situational-awareness');
  const courseDoc = await courseRef.get();

  if (courseDoc.exists) {
    batch.delete(courseRef);
    deleteCount++;
    console.log(`  Found old SA course document to delete`);
  }

  if (deleteCount > 0) {
    await batch.commit();
    console.log(`  ✅ Deleted ${deleteCount} old SA documents`);
  } else {
    console.log(`  ℹ️  No old SA content found`);
  }
}

async function uploadCourse(filename, courseId) {
  console.log(`\n📚 Processing ${filename}...`);

  const filePath = path.join(__dirname, filename);
  const courseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let lessonCount = 0;

  // 1. Upload course document
  const courseRef = db.collection('ccis-courses').doc(courseId);
  const courseDoc = {
    ...courseMetadata[courseId],
    courseId: courseId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    active: true
  };

  await courseRef.set(courseDoc);
  console.log(`  ✓ Course document created: ${courseId}`);

  // 2. Upload modules and lessons
  for (const module of courseData.modules) {
    const moduleRef = db.collection('ccis-modules').doc(module.module_id);
    const moduleDoc = {
      moduleId: module.module_id,
      moduleName: module.module_name,
      courseId: courseId,
      order: module.order,
      totalLessons: module.lessons.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await moduleRef.set(moduleDoc);
    console.log(`  ✓ Module ${module.order}: ${module.module_name} (${module.lessons.length} lessons)`);

    // Upload lessons for this module
    const lessonPromises = module.lessons.map(lesson => {
      const lessonRef = db.collection('ccis-lessons').doc(lesson.lesson_id);
      const lessonDoc = {
        lessonId: lesson.lesson_id,
        title: lesson.title,
        moduleId: module.module_id,
        courseId: courseId,
        order: lesson.order,
        content: lesson.content,
        questions: lesson.questions || [],
        mcq: lesson.mcq || null,
        scenario: lesson.scenario || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      lessonCount++;
      return lessonRef.set(lessonDoc);
    });

    await Promise.all(lessonPromises);
  }

  console.log(`  ✅ Successfully uploaded ${courseData.modules.length} modules and ${lessonCount} lessons`);

  return {
    courseId,
    modules: courseData.modules.length,
    lessons: lessonCount
  };
}

async function main() {
  console.log('🚀 Starting Firestore upload...\n');
  console.log('Project: redcell-gabriella');
  console.log('='.repeat(60));

  try {
    // Step 1: Delete old SA content
    await deleteOldSAContent();

    console.log('\n' + '='.repeat(60));
    console.log('📦 Uploading all 6 courses...');
    console.log('='.repeat(60));

    // Step 2: Upload all 6 courses
    const courses = [
      { file: 'lessons_SA_v2.json', id: 'situational-awareness' },
      { file: 'lessons_DM.json', id: 'decision-making' },
      { file: 'lessons_COMM.json', id: 'communication' },
      { file: 'lessons_TW.json', id: 'teamwork' },
      { file: 'lessons_LEAD.json', id: 'leadership' },
      { file: 'lessons_HF.json', id: 'human-factors' }
    ];

    const results = [];

    for (const course of courses) {
      try {
        const result = await uploadCourse(course.file, course.id);
        results.push(result);
      } catch (error) {
        console.error(`\n❌ Error uploading ${course.file}:`, error);
        throw error;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ UPLOAD COMPLETE\n');
    console.log('Summary:');
    console.log('-'.repeat(60));

    let totalModules = 0;
    let totalLessons = 0;

    results.forEach(r => {
      console.log(`${r.courseId.padEnd(25)} | ${r.modules} modules | ${r.lessons} lessons`);
      totalModules += r.modules;
      totalLessons += r.lessons;
    });

    console.log('-'.repeat(60));
    console.log(`${'TOTAL'.padEnd(25)} | ${totalModules} modules | ${totalLessons} lessons`);
    console.log('='.repeat(60));

    console.log('\n📊 Firestore Collections Updated:');
    console.log('  • ccis-courses: 6 courses');
    console.log(`  • ccis-modules: ${totalModules} modules`);
    console.log(`  • ccis-lessons: ${totalLessons} lessons`);

    console.log('\n✨ All courses are now live in the CCIS training engine!');
    console.log('\n🔗 View in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/redcell-gabriella/firestore');

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
