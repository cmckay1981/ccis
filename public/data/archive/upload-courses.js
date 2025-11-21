/**
 * Upload CRM Courses to Firestore
 *
 * This script uploads all 5 CRM courses (DM, COMM, TW, LEAD, HF) to Firestore
 * following the same structure as the SA course.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Course metadata
const courseMetadata = {
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

async function uploadCourse(filename, courseId) {
  console.log(`\n📚 Processing ${filename}...`);

  const filePath = path.join(__dirname, filename);
  const courseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const batch = db.batch();
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

  batch.set(courseRef, courseDoc);
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

    batch.set(moduleRef, moduleDoc);
    console.log(`  ✓ Module ${module.order}: ${module.module_name} (${module.lessons.length} lessons)`);

    // Upload lessons for this module
    for (const lesson of module.lessons) {
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

      batch.set(lessonRef, lessonDoc);
      lessonCount++;
    }
  }

  // Commit batch
  await batch.commit();
  console.log(`  ✅ Successfully uploaded ${courseData.modules.length} modules and ${lessonCount} lessons`);

  return {
    courseId,
    modules: courseData.modules.length,
    lessons: lessonCount
  };
}

async function main() {
  console.log('🚀 Starting Firestore upload...\n');
  console.log('=' .repeat(60));

  const courses = [
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
    console.log(`${r.courseId.padEnd(20)} | ${r.modules} modules | ${r.lessons} lessons`);
    totalModules += r.modules;
    totalLessons += r.lessons;
  });

  console.log('-'.repeat(60));
  console.log(`${'TOTAL'.padEnd(20)} | ${totalModules} modules | ${totalLessons} lessons`);
  console.log('='.repeat(60));

  console.log('\n📊 Firestore Collections Updated:');
  console.log('  • ccis-courses: 5 new documents');
  console.log('  • ccis-modules: 30 new documents');
  console.log(`  • ccis-lessons: ${totalLessons} new documents`);

  console.log('\n✨ All courses are now live in the CCIS training engine!');

  process.exit(0);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
