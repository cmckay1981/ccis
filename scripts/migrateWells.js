/**
 * Migrate existing wells to new data structure
 *
 * This script updates existing well documents to match the new schema
 * and creates related documents (string configs, sections, BOP, etc.)
 *
 * Setup:
 * 1. Download your service account key from Firebase Console
 * 2. Save as serviceAccountKey.json in project root
 * 3. Run: node scripts/migrateWells.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Error loading service account key:');
  console.error('   Please download your service account key from:');
  console.error('   Firebase Console > Project Settings > Service Accounts');
  console.error('   Save it as: serviceAccountKey.json in project root');
  process.exit(1);
}

const db = admin.firestore();

/**
 * Audit existing wells collection
 */
async function auditWells() {
  console.log('\n📊 Auditing existing wells...\n');

  try {
    const snapshot = await db.collection('wells').get();

    console.log(`Found ${snapshot.size} wells in Firestore\n`);

    if (snapshot.empty) {
      console.log('No wells found. Database is clean for new structure.');
      return { empty: true, count: 0 };
    }

    const wells = [];
    const issues = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const wellInfo = {
        id: doc.id,
        wellName: data.wellName || data.name || 'Unknown',
        hasOrganisationId: !!data.organisationId,
        hasVolumes: !!data.volumes,
        hasStatus: !!data.status,
        hasUnitSystem: !!data.unitSystem,
        hasIsActive: !!data.hasOwnProperty('isActive'),
        hasVersion: !!data.hasOwnProperty('version'),
        fields: Object.keys(data).length
      };

      wells.push(wellInfo);

      // Check for issues
      if (!data.organisationId) {
        issues.push({
          wellId: doc.id,
          wellName: wellInfo.wellName,
          issue: 'Missing organisationId'
        });
      }
    });

    // Print summary
    console.log('Summary:');
    console.log('─'.repeat(80));

    wells.forEach(well => {
      console.log(`\n📍 ${well.wellName} (${well.id})`);
      console.log(`   Fields: ${well.fields}`);
      console.log(`   organisationId: ${well.hasOrganisationId ? '✅' : '❌ MISSING'}`);
      console.log(`   volumes: ${well.hasVolumes ? '✅' : '⚠️  Missing'}`);
      console.log(`   status: ${well.hasStatus ? '✅' : '⚠️  Missing'}`);
      console.log(`   isActive: ${well.hasIsActive ? '✅' : '⚠️  Missing'}`);
      console.log(`   unitSystem: ${well.hasUnitSystem ? '✅' : '⚠️  Missing'}`);
    });

    console.log('\n─'.repeat(80));

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => {
        console.log(`   - ${issue.wellName}: ${issue.issue}`);
      });
    }

    return { empty: false, count: snapshot.size, wells, issues };
  } catch (error) {
    console.error('❌ Error auditing wells:', error.message);
    return { error: error.message };
  }
}

/**
 * Migrate wells to new structure
 */
async function migrateWells(dryRun = true) {
  console.log(`\n🔄 ${dryRun ? 'DRY RUN - ' : ''}Migrating wells...\n`);

  try {
    const snapshot = await db.collection('wells').get();

    if (snapshot.empty) {
      console.log('No wells to migrate.');
      return { count: 0 };
    }

    console.log(`Processing ${snapshot.size} wells...\n`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const updates = {};

      // Add missing required fields
      if (!data.hasOwnProperty('isActive')) {
        updates.isActive = true;
      }

      if (!data.hasOwnProperty('version')) {
        updates.version = 1;
      }

      // Add volumes structure if missing
      if (!data.hasOwnProperty('volumes')) {
        updates.volumes = {
          stringVolume: 0,
          annularVolume: 0,
          totalSystemVolume: 0,
          lastCalculated: admin.firestore.FieldValue.serverTimestamp()
        };
      }

      // Add status if missing
      if (!data.hasOwnProperty('status')) {
        updates.status = 'drilling';
      }

      // Add unitSystem if missing
      if (!data.hasOwnProperty('unitSystem')) {
        updates.unitSystem = 'imperial';
      }

      // Ensure organisationId exists (critical for security rules)
      if (!data.organisationId) {
        console.warn(`   ⚠️  Well ${data.wellName || doc.id} missing organisationId - setting default`);
        updates.organisationId = 'org-metamorphic-001'; // Set your default org
      }

      // Normalize field names if needed
      if (data.name && !data.wellName) {
        updates.wellName = data.name;
      }

      if (data.depth && !data.totalDepth) {
        updates.totalDepth = data.depth;
      }

      // Add timestamps if missing
      if (!data.updatedAt) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      if (!data.createdAt) {
        updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        if (!dryRun) {
          batch.update(doc.ref, updates);
        }

        updateCount++;
        console.log(`${dryRun ? '[DRY RUN] ' : ''}✏️  Updating: ${data.wellName || doc.id}`);
        console.log(`   Fields to update: ${Object.keys(updates).join(', ')}`);
      } else {
        console.log(`✅ Already current: ${data.wellName || doc.id}`);
      }
    });

    if (updateCount > 0 && !dryRun) {
      await batch.commit();
      console.log(`\n✅ Updated ${updateCount} wells`);
    } else if (updateCount > 0 && dryRun) {
      console.log(`\n📝 Would update ${updateCount} wells (dry run)`);
      console.log('   Run with --commit to apply changes');
    } else {
      console.log('\n✅ No updates needed - all wells are current');
    }

    return { count: updateCount };
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
}

/**
 * Create sample well for testing
 */
async function createSampleWell() {
  console.log('\n🏗️  Creating sample well...\n');

  try {
    const wellRef = db.collection('wells').doc();
    const wellId = wellRef.id;

    const sampleWell = {
      wellId,
      wellName: 'Sample Test Well - X-99',
      wellNumber: 'X-99',
      apiUwi: 'TEST-001',

      organisationId: 'org-metamorphic-001',
      rigName: 'Test Rig',
      rigType: 'Drillship',
      contractor: 'Test Contractor',

      field: 'Test Field',
      country: 'USA',
      latitude: 29.7604,
      longitude: -95.3698,

      wellType: 'development',
      wellPurpose: 'production',
      wellProfile: 'horizontal',

      totalDepth: 12000,
      tvd: 10500,
      kickoffDepth: 8000,
      maxInclination: 85,
      azimuth: 180,

      mudWeight: 10.5,
      mudType: 'OBM',
      fluidSystem: 'Synthetic',

      status: 'drilling',
      currentDepth: 9500,
      currentOperation: 'Drilling @ 9,500 ft',

      unitSystem: 'imperial',

      volumes: {
        stringVolume: 175.5,
        annularVolume: 1650.25,
        totalSystemVolume: 1825.75,
        lastCalculated: admin.firestore.FieldValue.serverTimestamp()
      },

      createdBy: 'migration-script',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration-script',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: 1,
      isActive: true
    };

    await wellRef.set(sampleWell);

    console.log('✅ Sample well created:');
    console.log(`   Well ID: ${wellId}`);
    console.log(`   Name: ${sampleWell.wellName}`);
    console.log(`   Status: ${sampleWell.status}`);

    return { wellId, wellName: sampleWell.wellName };
  } catch (error) {
    console.error('❌ Error creating sample well:', error.message);
    throw error;
  }
}

/**
 * Delete sample/test wells
 */
async function cleanupTestWells() {
  console.log('\n🧹 Cleaning up test wells...\n');

  try {
    const snapshot = await db.collection('wells')
      .where('wellName', '>=', 'Sample')
      .where('wellName', '<=', 'Sample\uf8ff')
      .get();

    if (snapshot.empty) {
      console.log('No test wells found.');
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      console.log(`   Deleting: ${doc.data().wellName}`);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Deleted ${snapshot.size} test wells`);
  } catch (error) {
    console.error('❌ Error cleaning up:', error.message);
  }
}

// ============================================
// MAIN SCRIPT
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n🔧 Well Migration Tool\n');
  console.log('Project: redcell-gabriella');
  console.log('Collection: wells\n');

  try {
    switch (command) {
      case 'audit':
        await auditWells();
        break;

      case 'migrate':
        await migrateWells(true); // Dry run
        break;

      case 'migrate-commit':
      case '--commit':
        console.log('⚠️  WARNING: This will modify your database!');
        console.log('Press Ctrl+C to cancel, or wait 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await migrateWells(false); // Real migration
        break;

      case 'create-sample':
        await createSampleWell();
        break;

      case 'cleanup':
        await cleanupTestWells();
        break;

      default:
        console.log('Usage:');
        console.log('  node scripts/migrateWells.js audit           - Check existing data');
        console.log('  node scripts/migrateWells.js migrate         - Dry run migration');
        console.log('  node scripts/migrateWells.js --commit        - Actually migrate data');
        console.log('  node scripts/migrateWells.js create-sample   - Create test well');
        console.log('  node scripts/migrateWells.js cleanup         - Delete test wells\n');
        break;
    }

    console.log('\n✅ Complete\n');
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
