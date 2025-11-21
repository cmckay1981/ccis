#!/usr/bin/env python3
"""
Upload CRM Courses to Firestore

This script uploads all 5 CRM courses to Firestore using Firebase Admin SDK.
Run with: python3 upload_courses.py
"""

import json
import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'redcell-gabriella'
})

db = firestore.client()

# Course metadata
COURSE_METADATA = {
    'decision-making': {
        'name': 'Decision Making',
        'description': 'Operational decision-making under pressure, uncertainty, and time constraints. Master decision models, recognize cognitive biases, and improve team decision processes.',
        'code': 'DM',
        'order': 2,
        'totalModules': 6,
        'estimatedHours': 12,
        'difficulty': 'intermediate',
        'prerequisites': ['situational-awareness'],
        'tags': ['decision-making', 'cognitive-biases', 'ooda-loop', 'stress-management']
    },
    'communication': {
        'name': 'Communication',
        'description': 'Verbal and non-verbal communication in operational environments. Master briefings, active listening, assertiveness, conflict resolution, and digital communication.',
        'code': 'COMM',
        'order': 3,
        'totalModules': 6,
        'estimatedHours': 12,
        'difficulty': 'foundational',
        'prerequisites': ['situational-awareness'],
        'tags': ['communication', 'briefings', 'active-listening', 'assertiveness', 'conflict']
    },
    'teamwork': {
        'name': 'Teamwork',
        'description': 'Team dynamics, coordination, trust-building, and performance optimization. Learn to leverage diversity, build psychological safety, and excel in distributed teams.',
        'code': 'TW',
        'order': 4,
        'totalModules': 6,
        'estimatedHours': 12,
        'difficulty': 'intermediate',
        'prerequisites': ['situational-awareness', 'communication'],
        'tags': ['teamwork', 'coordination', 'trust', 'diversity', 'remote-teams']
    },
    'leadership': {
        'name': 'Leadership',
        'description': 'Leadership skills for high-reliability operations. Develop decision authority, influence, people development capabilities, crisis management, and ethical leadership.',
        'code': 'LEAD',
        'order': 5,
        'totalModules': 6,
        'estimatedHours': 15,
        'difficulty': 'advanced',
        'prerequisites': ['situational-awareness', 'communication', 'decision-making', 'teamwork'],
        'tags': ['leadership', 'decision-authority', 'motivation', 'coaching', 'crisis-management', 'ethics']
    },
    'human-factors': {
        'name': 'Human Factors',
        'description': 'Human performance limitations, fatigue, stress, environmental factors, human-machine interfaces, and organizational influences on safety.',
        'code': 'HF',
        'order': 6,
        'totalModules': 6,
        'estimatedHours': 15,
        'difficulty': 'intermediate',
        'prerequisites': ['situational-awareness'],
        'tags': ['human-factors', 'fatigue', 'stress', 'ergonomics', 'automation', 'safety-culture']
    }
}

def upload_course(filename, course_id):
    """Upload a single course with its modules and lessons."""
    print(f"\n📚 Processing {filename}...")

    # Load course data
    filepath = os.path.join(os.path.dirname(__file__), filename)
    with open(filepath, 'r') as f:
        course_data = json.load(f)

    lesson_count = 0
    batch = db.batch()
    batch_count = 0
    MAX_BATCH = 500  # Firestore batch limit

    # 1. Upload course document
    course_ref = db.collection('ccis-courses').document(course_id)
    course_doc = {
        **COURSE_METADATA[course_id],
        'courseId': course_id,
        'createdAt': firestore.SERVER_TIMESTAMP,
        'updatedAt': firestore.SERVER_TIMESTAMP,
        'active': True
    }
    batch.set(course_ref, course_doc)
    batch_count += 1
    print(f"  ✓ Course document created: {course_id}")

    # 2. Upload modules and lessons
    for module in course_data['modules']:
        module_ref = db.collection('ccis-modules').document(module['module_id'])
        module_doc = {
            'moduleId': module['module_id'],
            'moduleName': module['module_name'],
            'courseId': course_id,
            'order': module['order'],
            'totalLessons': len(module['lessons']),
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        batch.set(module_ref, module_doc)
        batch_count += 1
        print(f"  ✓ Module {module['order']}: {module['module_name']} ({len(module['lessons'])} lessons)")

        # Upload lessons
        for lesson in module['lessons']:
            # Commit batch if near limit
            if batch_count >= MAX_BATCH - 10:
                batch.commit()
                print(f"    ... committed batch ({batch_count} operations)")
                batch = db.batch()
                batch_count = 0

            lesson_ref = db.collection('ccis-lessons').document(lesson['lesson_id'])
            lesson_doc = {
                'lessonId': lesson['lesson_id'],
                'title': lesson['title'],
                'moduleId': module['module_id'],
                'courseId': course_id,
                'order': lesson['order'],
                'content': lesson['content'],
                'questions': lesson.get('questions', []),
                'mcq': lesson.get('mcq'),
                'scenario': lesson.get('scenario'),
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            }
            batch.set(lesson_ref, lesson_doc)
            batch_count += 1
            lesson_count += 1

    # Commit final batch
    if batch_count > 0:
        batch.commit()
        print(f"  ... committed final batch ({batch_count} operations)")

    print(f"  ✅ Successfully uploaded {len(course_data['modules'])} modules and {lesson_count} lessons")

    return {
        'courseId': course_id,
        'modules': len(course_data['modules']),
        'lessons': lesson_count
    }

def main():
    """Main execution function."""
    print('🚀 Starting Firestore upload...\n')
    print('Project: redcell-gabriella')
    print('=' * 60)

    courses = [
        {'file': 'lessons_DM.json', 'id': 'decision-making'},
        {'file': 'lessons_COMM.json', 'id': 'communication'},
        {'file': 'lessons_TW.json', 'id': 'teamwork'},
        {'file': 'lessons_LEAD.json', 'id': 'leadership'},
        {'file': 'lessons_HF.json', 'id': 'human-factors'}
    ]

    results = []

    for course in courses:
        try:
            result = upload_course(course['file'], course['id'])
            results.append(result)
        except Exception as e:
            print(f"\n❌ Error uploading {course['file']}: {e}")
            raise

    print('\n' + '=' * 60)
    print('✅ UPLOAD COMPLETE\n')
    print('Summary:')
    print('-' * 60)

    total_modules = 0
    total_lessons = 0

    for r in results:
        print(f"{r['courseId']:<20} | {r['modules']} modules | {r['lessons']} lessons")
        total_modules += r['modules']
        total_lessons += r['lessons']

    print('-' * 60)
    print(f"{'TOTAL':<20} | {total_modules} modules | {total_lessons} lessons")
    print('=' * 60)

    print('\n📊 Firestore Collections Updated:')
    print('  • ccis-courses: 5 new documents')
    print('  • ccis-modules: 30 new documents')
    print(f'  • ccis-lessons: {total_lessons} new documents')

    print('\n✨ All courses are now live in the CCIS training engine!')
    print('\n🔗 View in Firebase Console:')
    print('   https://console.firebase.google.com/project/redcell-gabriella/firestore')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n💥 Fatal error: {e}')
        import traceback
        traceback.print_exc()
        exit(1)
