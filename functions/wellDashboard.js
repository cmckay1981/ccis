/**
 * Well Dashboard Cloud Functions
 * Handles well creation, retrieval, updates for the OGLMS Dashboard
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Save complete well with all configurations
 * Called from create-well.html wizard
 */
exports.saveCompleteWell = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const {
      wellData,
      stringConfig,
      wellSections,
      bopConfig
    } = data;

    const userId = context.auth.uid;
    const organisationId = wellData.organisationId || context.auth.token.organisationId;

    // Validate required fields
    if (!wellData.wellName) {
      throw new functions.https.HttpsError('invalid-argument', 'Well name is required');
    }

    if (!organisationId) {
      throw new functions.https.HttpsError('invalid-argument', 'Organisation ID is required');
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Use Firestore batch for atomic writes
    const batch = db.batch();

    // 1. Create main well document
    const wellRef = db.collection('wells').doc();
    const wellId = wellRef.id;

    const wellDoc = {
      wellId,
      wellName: wellData.wellName,
      wellNumber: wellData.wellNumber || null,
      apiUwi: wellData.apiUwi || null,

      // Organisation & Rig
      organisationId,
      rigName: wellData.rigName || null,
      rigType: wellData.rigType || null,
      contractor: wellData.contractor || null,

      // Location
      field: wellData.field || null,
      block: wellData.block || null,
      country: wellData.country || null,
      latitude: wellData.latitude || null,
      longitude: wellData.longitude || null,
      waterDepth: wellData.waterDepth || null,
      airGap: wellData.airGap || null,

      // Well Type
      wellType: wellData.wellType || null,
      wellPurpose: wellData.wellPurpose || null,
      wellProfile: wellData.wellProfile || null,

      // Trajectory
      totalDepth: wellData.totalDepth || null,
      tvd: wellData.tvd || null,
      kickoffDepth: wellData.kickoffDepth || null,
      maxInclination: wellData.maxInclination || null,
      azimuth: wellData.azimuth || null,

      // Fluid Properties
      mudWeight: wellData.mudWeight || null,
      mudType: wellData.mudType || null,
      fluidSystem: wellData.fluidSystem || null,

      // Current Status
      status: 'drilling', // drilling, completed, suspended, abandoned
      currentDepth: wellData.totalDepth || 0,
      currentOperation: 'Well created - awaiting operations',

      // Units
      unitSystem: wellData.unitSystem || 'imperial',

      // Volumes (calculated)
      volumes: {
        stringVolume: stringConfig?.totals?.totalVolume || 0,
        annularVolume: wellSections?.totals?.totalAnnularVolume || 0,
        totalSystemVolume: (stringConfig?.totals?.totalVolume || 0) + (wellSections?.totals?.totalAnnularVolume || 0),
        lastCalculated: timestamp
      },

      // Metadata
      createdBy: userId,
      createdAt: timestamp,
      updatedBy: userId,
      updatedAt: timestamp,
      version: 1,
      isActive: true
    };

    batch.set(wellRef, wellDoc);

    // 2. Create string configuration document
    if (stringConfig && stringConfig.components && stringConfig.components.length > 0) {
      const stringRef = db.collection('well-string-configs').doc();

      const stringDoc = {
        stringConfigId: stringRef.id,
        wellId,
        configName: 'Initial String Configuration',
        configType: 'drilling', // drilling, running-casing, completion
        isActive: true,

        // Components
        components: stringConfig.components.map((comp, index) => ({
          order: index + 1,
          componentType: comp.type || null,
          componentName: comp.name || null,
          od: comp.od || null,
          id: comp.id || null,
          length: comp.length || null,
          capacity: comp.capacity || null,
          volume: comp.volume || null,
          displacement: comp.displacement || null,
          weight: comp.weight || null,
          grade: comp.grade || null,
          connection: comp.connection || null
        })),

        // Pump Data
        pumpData: stringConfig.pumpData || {
          pumpType: 'triplex',
          linerSize: null,
          strokeLength: null,
          efficiency: 95,
          targetSPM: null,
          pumpOutput: null
        },

        // Totals
        totals: {
          totalLength: stringConfig.totals?.totalLength || 0,
          totalVolume: stringConfig.totals?.totalVolume || 0,
          totalDisplacement: stringConfig.totals?.totalDisplacement || 0,
          strokesToBit: stringConfig.totals?.strokesToBit || 0
        },

        unitSystem: wellData.unitSystem || 'imperial',
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      batch.set(stringRef, stringDoc);
    }

    // 3. Create well sections (casing program)
    if (wellData.casings && wellData.casings.length > 0) {
      const sectionsRef = db.collection('well-sections').doc();

      const sectionsDoc = {
        sectionId: sectionsRef.id,
        wellId,
        configType: 'casing-program',
        isActive: true,

        sections: wellData.casings.map((casing, index) => ({
          order: index + 1,
          sectionName: casing.stringName || `Section ${index + 1}`,
          holeSize: casing.size || null,
          casingOD: casing.size || null,
          casingWeight: casing.weight || null,
          casingGrade: casing.grade || null,
          topDepth: casing.top || 0,
          bottomDepth: casing.bottom || 0,
          length: (casing.bottom || 0) - (casing.top || 0),
          stringOD: null, // Will be populated from string config
          annularCapacity: null,
          annularVolume: null
        })),

        unitSystem: wellData.unitSystem || 'imperial',
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      batch.set(sectionsRef, sectionsDoc);
    }

    // 4. Create BOP configuration document
    if (bopConfig) {
      const bopRef = db.collection('bop-configurations').doc();

      const bopDoc = {
        bopConfigId: bopRef.id,
        wellId,
        isActive: true,

        // BOP Stack
        stackType: bopConfig.stackType || 'surface', // surface, subsea
        manufacturer: bopConfig.manufacturer || null,
        model: bopConfig.model || null,
        workingPressure: bopConfig.workingPressure || null,

        // Kill & Choke Lines
        killLineSize: bopConfig.killLineSize || null,
        killLineRating: bopConfig.killLineRating || null,
        chokeLineSize: bopConfig.chokeLineSize || null,
        chokeLineRating: bopConfig.chokeLineRating || null,
        chokeManifold: bopConfig.chokeManifold || null,

        // Subsea specific (if applicable)
        riserOD: bopConfig.riserOD || null,
        riserID: bopConfig.riserID || null,
        riserLength: bopConfig.riserLength || null,
        lmrpConnector: bopConfig.lmrpConnector || null,
        wellheadConnector: bopConfig.wellheadConnector || null,

        // Test Data (will be updated with BOP tests)
        lastTestDate: null,
        nextTestDate: null,
        testPressure: null,
        testResult: null,

        unitSystem: wellData.unitSystem || 'imperial',
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      batch.set(bopRef, bopDoc);
    }

    // 5. Create activity log entry
    const activityRef = db.collection('activity-log').doc();
    batch.set(activityRef, {
      activityId: activityRef.id,
      wellId,
      organisationId,
      activityType: 'well-created',
      description: `Well "${wellData.wellName}" created`,
      performedBy: userId,
      timestamp,
      metadata: {
        wellName: wellData.wellName,
        rigName: wellData.rigName,
        totalDepth: wellData.totalDepth
      }
    });

    // Commit the batch
    await batch.commit();

    console.log(`Well created successfully: ${wellId}`);

    return {
      success: true,
      wellId,
      message: 'Well created successfully',
      data: {
        wellId,
        wellName: wellData.wellName,
        status: 'drilling',
        volumes: wellDoc.volumes
      }
    };

  } catch (error) {
    console.error('Error saving well:', error);
    throw new functions.https.HttpsError('internal', `Error saving well: ${error.message}`);
  }
});

/**
 * Get wells for organization (for dashboard)
 */
exports.getOrganisationWells = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const organisationId = data.organisationId || context.auth.token.organisationId;
    const statusFilter = data.status || null; // 'drilling', 'completed', etc.
    const limit = data.limit || 50;

    if (!organisationId) {
      throw new functions.https.HttpsError('invalid-argument', 'Organisation ID is required');
    }

    let query = db.collection('wells')
      .where('organisationId', '==', organisationId)
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .limit(limit);

    // Apply status filter if provided
    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();

    const wells = [];
    snapshot.forEach(doc => {
      wells.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      });
    });

    return {
      success: true,
      wells,
      count: wells.length
    };

  } catch (error) {
    console.error('Error getting wells:', error);
    throw new functions.https.HttpsError('internal', `Error getting wells: ${error.message}`);
  }
});

/**
 * Get complete well configuration (for well workspace)
 */
exports.getWellDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { wellId } = data;

    if (!wellId) {
      throw new functions.https.HttpsError('invalid-argument', 'Well ID is required');
    }

    // Get well document
    const wellDoc = await db.collection('wells').doc(wellId).get();

    if (!wellDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Well not found');
    }

    const wellData = {
      id: wellDoc.id,
      ...wellDoc.data(),
      createdAt: wellDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: wellDoc.data().updatedAt?.toDate().toISOString()
    };

    // Check user has access
    const organisationId = context.auth.token.organisationId;
    if (wellData.organisationId !== organisationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied to this well');
    }

    // Get string configuration
    const stringSnapshot = await db.collection('well-string-configs')
      .where('wellId', '==', wellId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    const stringConfig = stringSnapshot.empty ? null : {
      id: stringSnapshot.docs[0].id,
      ...stringSnapshot.docs[0].data()
    };

    // Get well sections
    const sectionsSnapshot = await db.collection('well-sections')
      .where('wellId', '==', wellId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    const wellSections = sectionsSnapshot.empty ? null : {
      id: sectionsSnapshot.docs[0].id,
      ...sectionsSnapshot.docs[0].data()
    };

    // Get BOP configuration
    const bopSnapshot = await db.collection('bop-configurations')
      .where('wellId', '==', wellId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    const bopConfig = bopSnapshot.empty ? null : {
      id: bopSnapshot.docs[0].id,
      ...bopSnapshot.docs[0].data()
    };

    // Get recent activity
    const activitySnapshot = await db.collection('activity-log')
      .where('wellId', '==', wellId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const activities = [];
    activitySnapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString()
      });
    });

    return {
      success: true,
      well: wellData,
      stringConfig,
      wellSections,
      bopConfig,
      activities
    };

  } catch (error) {
    console.error('Error getting well details:', error);
    throw new functions.https.HttpsError('internal', `Error getting well details: ${error.message}`);
  }
});

/**
 * Update well status and current operation
 */
exports.updateWellStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { wellId, status, currentDepth, currentOperation } = data;

    if (!wellId) {
      throw new functions.https.HttpsError('invalid-argument', 'Well ID is required');
    }

    const userId = context.auth.uid;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const updateData = {
      updatedBy: userId,
      updatedAt: timestamp
    };

    if (status) updateData.status = status;
    if (currentDepth !== undefined) updateData.currentDepth = currentDepth;
    if (currentOperation) updateData.currentOperation = currentOperation;

    await db.collection('wells').doc(wellId).update(updateData);

    // Log activity
    await db.collection('activity-log').add({
      wellId,
      activityType: 'status-update',
      description: `Status updated to ${status || 'unknown'}`,
      performedBy: userId,
      timestamp,
      metadata: { status, currentDepth, currentOperation }
    });

    return {
      success: true,
      message: 'Well status updated successfully'
    };

  } catch (error) {
    console.error('Error updating well status:', error);
    throw new functions.https.HttpsError('internal', `Error updating well: ${error.message}`);
  }
});

/**
 * Delete/Archive well
 */
exports.deleteWell = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { wellId } = data;

    if (!wellId) {
      throw new functions.https.HttpsError('invalid-argument', 'Well ID is required');
    }

    const userId = context.auth.uid;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Soft delete - mark as inactive
    await db.collection('wells').doc(wellId).update({
      isActive: false,
      deletedBy: userId,
      deletedAt: timestamp,
      updatedAt: timestamp
    });

    // Log activity
    await db.collection('activity-log').add({
      wellId,
      activityType: 'well-deleted',
      description: 'Well archived',
      performedBy: userId,
      timestamp
    });

    return {
      success: true,
      message: 'Well archived successfully'
    };

  } catch (error) {
    console.error('Error deleting well:', error);
    throw new functions.https.HttpsError('internal', `Error deleting well: ${error.message}`);
  }
});
