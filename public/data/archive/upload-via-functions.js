/**
 * Upload CRM Courses via Cloud Function
 *
 * This script uploads course data by calling a Cloud Function
 * that has Firebase Admin SDK access
 */

const fs = require('fs');
const path = require('path');

// Course metadata
const courseMetadata = {
  'decision-making': {
    name: 'Decision Making',
    description: 'Operational decision-making under pressure, uncertainty, and time constraints.',
    code: 'DM',
    order: 2,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness'],
    tags: ['decision-making', 'cognitive-biases', 'ooda-loop']
  },
  'communication': {
    name: 'Communication',
    description: 'Verbal and non-verbal communication in operational environments.',
    code: 'COMM',
    order: 3,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'foundational',
    prerequisites: ['situational-awareness'],
    tags: ['communication', 'briefings', 'assertiveness']
  },
  'teamwork': {
    name: 'Teamwork',
    description: 'Team dynamics, coordination, trust-building, and performance optimization.',
    code: 'TW',
    order: 4,
    totalModules: 6,
    estimatedHours: 12,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness', 'communication'],
    tags: ['teamwork', 'coordination', 'trust']
  },
  'leadership': {
    name: 'Leadership',
    description: 'Leadership skills for high-reliability operations.',
    code: 'LEAD',
    order: 5,
    totalModules: 6,
    estimatedHours: 15,
    difficulty: 'advanced',
    prerequisites: ['situational-awareness', 'communication', 'decision-making', 'teamwork'],
    tags: ['leadership', 'decision-authority', 'ethics']
  },
  'human-factors': {
    name: 'Human Factors',
    description: 'Human performance limitations, fatigue, stress, and organizational factors.',
    code: 'HF',
    order: 6,
    totalModules: 6,
    estimatedHours: 15,
    difficulty: 'intermediate',
    prerequisites: ['situational-awareness'],
    tags: ['human-factors', 'fatigue', 'stress']
  }
};

function prepareCourseData(filename, courseId) {
  const filePath = path.join(__dirname, filename);
  const courseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    courseMetadata: courseMetadata[courseId],
    courseData: courseData
  };
}

function main() {
  console.log('📦 Preparing course data packages...\n');

  const courses = [
    { file: 'lessons_DM.json', id: 'decision-making' },
    { file: 'lessons_COMM.json', id: 'communication' },
    { file: 'lessons_TW.json', id: 'teamwork' },
    { file: 'lessons_LEAD.json', id: 'leadership' },
    { file: 'lessons_HF.json', id: 'human-factors' }
  ];

  const packages = {};

  courses.forEach(course => {
    console.log(`✓ Packaged ${course.id}`);
    packages[course.id] = prepareCourseData(course.file, course.id);
  });

  // Write combined package
  const outputPath = path.join(__dirname, 'courses_upload_package.json');
  fs.writeFileSync(outputPath, JSON.stringify(packages, null, 2));

  console.log(`\n✅ Course package created: courses_upload_package.json`);
  console.log('\n📋 Next steps:');
  console.log('1. Create a Cloud Function to upload this data');
  console.log('2. Or use Firebase Console to import manually');
  console.log('3. Or use the Python script with Firebase Admin SDK');
}

main();
