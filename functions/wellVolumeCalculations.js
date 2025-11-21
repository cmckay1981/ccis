/**
 * Well Volume Calculations Cloud Functions
 * Provides server-side calculations for well volumes, kill sheets, and BOP operations
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Calculate pipe/casing internal capacity
 * @param {number} id - Internal diameter (inches)
 * @returns {number} Capacity in bbl/ft
 */
function calculateCapacity(id) {
  return (id * id) / 1029.4;
}

/**
 * Calculate annular capacity
 * @param {number} holeID - Hole/casing inner diameter (inches)
 * @param {number} pipeOD - Pipe outer diameter (inches)
 * @returns {number} Annular capacity in bbl/ft
 */
function calculateAnnularCapacity(holeID, pipeOD) {
  return ((holeID * holeID) - (pipeOD * pipeOD)) / 1029.4;
}

/**
 * Calculate hydrostatic pressure
 * @param {number} mudWeight - Mud weight in ppg
 * @param {number} tvd - True vertical depth in feet
 * @returns {number} Hydrostatic pressure in psi
 */
function calculateHydrostaticPressure(mudWeight, tvd) {
  return mudWeight * 0.052 * tvd;
}

/**
 * Calculate string volume and displacement
 */
exports.calculateStringVolume = functions.https.onCall(async (data, context) => {
  try {
    const { components, pumpOutput } = data;

    let totalVolume = 0;
    let totalDisplacement = 0;
    let totalLength = 0;

    const calculatedComponents = components.map(comp => {
      const capacity = calculateCapacity(comp.id);
      const volume = capacity * comp.length;
      const displacement = ((comp.od * comp.od) - (comp.id * comp.id)) / 1029.4 * comp.length;

      totalVolume += volume;
      totalDisplacement += displacement;
      totalLength += comp.length;

      return {
        ...comp,
        capacity: parseFloat(capacity.toFixed(4)),
        volume: parseFloat(volume.toFixed(2)),
        displacement: parseFloat(displacement.toFixed(2))
      };
    });

    const totalStrokes = pumpOutput ? Math.ceil(totalVolume / pumpOutput) : 0;

    return {
      success: true,
      components: calculatedComponents,
      totals: {
        totalLength: parseFloat(totalLength.toFixed(2)),
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        totalDisplacement: parseFloat(totalDisplacement.toFixed(2)),
        totalStrokes
      }
    };
  } catch (error) {
    console.error('Error calculating string volume:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Calculate annular volumes
 */
exports.calculateAnnularVolumes = functions.https.onCall(async (data, context) => {
  try {
    const { sections, pumpOutput } = data;

    let totalAnnularVolume = 0;

    const calculatedSections = sections.map(section => {
      const length = section.bottomDepth - section.topDepth;
      const annularCapacity = calculateAnnularCapacity(section.holeID, section.stringOD);
      const annularVolume = annularCapacity * length;
      const strokes = pumpOutput ? Math.ceil(annularVolume / pumpOutput) : 0;

      totalAnnularVolume += annularVolume;

      return {
        ...section,
        length: parseFloat(length.toFixed(2)),
        annularCapacity: parseFloat(annularCapacity.toFixed(4)),
        annularVolume: parseFloat(annularVolume.toFixed(2)),
        strokes
      };
    });

    const totalStrokes = pumpOutput ? Math.ceil(totalAnnularVolume / pumpOutput) : 0;

    return {
      success: true,
      sections: calculatedSections,
      totals: {
        totalAnnularVolume: parseFloat(totalAnnularVolume.toFixed(2)),
        totalStrokes
      }
    };
  } catch (error) {
    console.error('Error calculating annular volumes:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Calculate complete kill sheet
 */
exports.calculateKillSheet = functions.https.onCall(async (data, context) => {
  try {
    const {
      currentMudWeight,  // ppg
      tvd,              // ft
      sidpp,            // psi
      sicp,             // psi
      scr,              // psi
      pitGain,          // bbl
      shoeTVD,          // ft
      lotEMW,           // ppg
      stringVolume,     // bbl
      annularVolume,    // bbl
      pumpOutput        // bbl/stk
    } = data;

    // Formation Pressure
    const formationPressure = sidpp + (currentMudWeight * 0.052 * tvd);

    // Kill Weight Mud (KWM)
    const killMudWeight = currentMudWeight + (sidpp / 0.052 / tvd);

    // Initial Circulating Pressure (ICP)
    const icp = scr + sidpp;

    // Final Circulating Pressure (FCP)
    const fcp = scr * (killMudWeight / currentMudWeight);

    // Maximum Allowable Annular Surface Pressure (MAASP)
    const maasp = (lotEMW - killMudWeight) * 0.052 * shoeTVD;

    // Strokes to Bit
    const strokesToBit = Math.ceil(stringVolume / pumpOutput);

    // Strokes Bottoms Up (complete circulation)
    const strokesBottomsUp = Math.ceil((stringVolume + annularVolume) / pumpOutput);

    // Kill Mud Volume Required
    const killMudVolume = stringVolume + annularVolume;

    // Kick gradient
    const kickGradient = pitGain > 0 ? (sicp - sidpp) / pitGain : 0;

    // Generate pressure step chart (20 steps)
    const pressureSteps = [];
    const steps = 20;
    const strokeStep = Math.ceil(strokesToBit / steps);
    const pressureDecrement = (icp - fcp) / steps;

    for (let i = 0; i <= steps; i++) {
      const strokes = Math.min(i * strokeStep, strokesToBit);
      const dpPressure = icp - (i * pressureDecrement);
      const percentComplete = ((i / steps) * 100);

      pressureSteps.push({
        strokes,
        dpPressure: parseFloat(dpPressure.toFixed(0)),
        percentComplete: parseFloat(percentComplete.toFixed(1))
      });
    }

    // Check for MAASP violations
    const maaspViolation = sicp > maasp;

    // Kick intensity classification
    let kickIntensity = 'Low';
    if (kickGradient > 0.45) kickIntensity = 'High (Gas)';
    else if (kickGradient > 0.30) kickIntensity = 'Medium (Oil/Water)';

    return {
      success: true,
      calculations: {
        formationPressure: parseFloat(formationPressure.toFixed(0)),
        killMudWeight: parseFloat(killMudWeight.toFixed(2)),
        icp: parseFloat(icp.toFixed(0)),
        fcp: parseFloat(fcp.toFixed(0)),
        maasp: parseFloat(maasp.toFixed(0)),
        strokesToBit,
        strokesBottomsUp,
        killMudVolume: parseFloat(killMudVolume.toFixed(2)),
        kickGradient: parseFloat(kickGradient.toFixed(3)),
        kickIntensity,
        maaspViolation,
        pressureSteps
      },
      warnings: maaspViolation ? ['WARNING: Annulus pressure exceeds MAASP. Risk of formation breakdown.'] : []
    };
  } catch (error) {
    console.error('Error calculating kill sheet:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Calculate pump outputs for various rates
 */
exports.calculatePumpOutputs = functions.https.onCall(async (data, context) => {
  try {
    const {
      linerSize,        // inches
      strokeLength,     // inches
      efficiency,       // decimal (e.g., 0.95 for 95%)
      pumpType         // 'triplex' or 'duplex'
    } = data;

    // Pump output formula: (Liner² × Stroke Length × Number of Cylinders × Efficiency) / 294
    const numCylinders = pumpType === 'triplex' ? 3 : 2;
    const baseOutput = (linerSize * linerSize * strokeLength * numCylinders * efficiency) / 294;

    // Generate outputs for common SPM rates
    const rates = [20, 30, 40, 50, 60, 70, 80, 90, 100];
    const outputs = rates.map(spm => {
      const outputBblMin = baseOutput * spm;
      const outputBblStk = baseOutput;

      return {
        spm,
        outputBblMin: parseFloat(outputBblMin.toFixed(3)),
        outputBblStk: parseFloat(outputBblStk.toFixed(4)),
        outputGalMin: parseFloat((outputBblMin * 42).toFixed(2)),
        outputLMin: parseFloat((outputBblMin * 159).toFixed(2))
      };
    });

    return {
      success: true,
      pumpData: {
        linerSize,
        strokeLength,
        efficiency,
        pumpType,
        numCylinders
      },
      outputs
    };
  } catch (error) {
    console.error('Error calculating pump outputs:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Convert units between systems
 */
exports.convertUnits = functions.https.onCall(async (data, context) => {
  try {
    const { value, fromUnit, toUnit } = data;

    const conversions = {
      // Length
      'ft_m': 0.3048,
      'm_ft': 3.281,
      'in_mm': 25.4,
      'mm_in': 0.03937,

      // Volume
      'bbl_L': 159,
      'L_bbl': 1 / 159,
      'bbl_m3': 0.159,
      'm3_bbl': 6.29,
      'bbl_gal': 42,
      'gal_bbl': 1 / 42,

      // Pressure
      'psi_bar': 0.0689,
      'bar_psi': 14.5,
      'psi_kPa': 6.895,
      'kPa_psi': 0.145,
      'psi_MPa': 0.006895,
      'MPa_psi': 145,

      // Mud Weight / Density
      'ppg_sg': 0.1198,
      'sg_ppg': 8.345,
      'ppg_kgm3': 119.8,
      'kgm3_ppg': 0.00835
    };

    const conversionKey = `${fromUnit}_${toUnit}`;
    const factor = conversions[conversionKey];

    if (!factor) {
      throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
    }

    const result = value * factor;

    return {
      success: true,
      value,
      fromUnit,
      toUnit,
      result: parseFloat(result.toFixed(6)),
      factor
    };
  } catch (error) {
    console.error('Error converting units:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Track displacement in real-time
 */
exports.trackDisplacement = functions.https.onCall(async (data, context) => {
  try {
    const {
      currentStrokes,
      pumpOutput,
      stringVolume,
      annularVolume,
      pumpRate
    } = data;

    const volumePumped = currentStrokes * pumpOutput;
    const totalVolume = stringVolume + annularVolume;
    const percentComplete = (volumePumped / totalVolume) * 100;

    let status = '';
    let depthInfo = {};

    if (volumePumped < stringVolume) {
      // Fluid still in string
      status = 'in-string';
      const percentThroughString = (volumePumped / stringVolume) * 100;
      depthInfo = {
        location: 'Drill String',
        percentComplete: parseFloat(percentThroughString.toFixed(1)),
        volumeRemaining: parseFloat((stringVolume - volumePumped).toFixed(2)),
        strokesRemaining: Math.ceil((stringVolume - volumePumped) / pumpOutput)
      };
    } else {
      // Fluid in annulus
      status = 'in-annulus';
      const annulusVolume = volumePumped - stringVolume;
      const percentThroughAnnulus = (annulusVolume / annularVolume) * 100;
      depthInfo = {
        location: 'Annulus',
        percentComplete: parseFloat(percentThroughAnnulus.toFixed(1)),
        volumeRemaining: parseFloat((annularVolume - annulusVolume).toFixed(2)),
        strokesRemaining: Math.ceil((annularVolume - annulusVolume) / pumpOutput)
      };
    }

    // Calculate time remaining
    const strokesRemaining = Math.ceil((totalVolume - volumePumped) / pumpOutput);
    const minutesRemaining = pumpRate > 0 ? Math.ceil(strokesRemaining / pumpRate) : 0;

    return {
      success: true,
      tracking: {
        currentStrokes,
        volumePumped: parseFloat(volumePumped.toFixed(2)),
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        percentComplete: parseFloat(percentComplete.toFixed(1)),
        status,
        depthInfo,
        timeEstimate: {
          strokesRemaining,
          minutesRemaining,
          estimatedCompletion: new Date(Date.now() + minutesRemaining * 60000).toISOString()
        }
      }
    };
  } catch (error) {
    console.error('Error tracking displacement:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Save well configuration to Firestore
 */
exports.saveWellConfiguration = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const {
      wellId,
      configName,
      stringComponents,
      wellSections,
      pumpData,
      units
    } = data;

    const db = admin.firestore();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Save string configuration
    const stringConfigRef = await db.collection('well-string-configs').add({
      wellId,
      configName: `${configName} - String`,
      description: 'Saved from calculator',
      isActive: true,
      components: stringComponents,
      pumpData,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: context.auth.uid
    });

    // Save well sections
    const sectionsRef = await db.collection('well-sections').add({
      wellId,
      configName: `${configName} - Sections`,
      isActive: true,
      sections: wellSections,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: context.auth.uid
    });

    return {
      success: true,
      stringConfigId: stringConfigRef.id,
      sectionsConfigId: sectionsRef.id,
      message: 'Configuration saved successfully'
    };
  } catch (error) {
    console.error('Error saving configuration:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Get well configuration from Firestore
 */
exports.getWellConfiguration = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { wellId } = data;
    const db = admin.firestore();

    // Get active string configuration
    const stringSnapshot = await db.collection('well-string-configs')
      .where('wellId', '==', wellId)
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    // Get active well sections
    const sectionsSnapshot = await db.collection('well-sections')
      .where('wellId', '==', wellId)
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    const stringConfig = stringSnapshot.empty ? null : { id: stringSnapshot.docs[0].id, ...stringSnapshot.docs[0].data() };
    const sectionsConfig = sectionsSnapshot.empty ? null : { id: sectionsSnapshot.docs[0].id, ...sectionsSnapshot.docs[0].data() };

    return {
      success: true,
      stringConfig,
      sectionsConfig
    };
  } catch (error) {
    console.error('Error getting configuration:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

module.exports = {
  calculateStringVolume: exports.calculateStringVolume,
  calculateAnnularVolumes: exports.calculateAnnularVolumes,
  calculateKillSheet: exports.calculateKillSheet,
  calculatePumpOutputs: exports.calculatePumpOutputs,
  convertUnits: exports.convertUnits,
  trackDisplacement: exports.trackDisplacement,
  saveWellConfiguration: exports.saveWellConfiguration,
  getWellConfiguration: exports.getWellConfiguration
};
