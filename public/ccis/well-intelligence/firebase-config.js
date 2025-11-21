/**
 * Firebase Configuration for Claymore & Colt Well Intelligence
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Select your project: redcell-gabriella
 * 3. Click the gear icon > Project settings
 * 4. Scroll to "Your apps" > Web apps
 * 5. Copy your config values and replace the placeholders below
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "redcell-gabriella.firebaseapp.com",
  projectId: "redcell-gabriella",
  storageBucket: "redcell-gabriella.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, auth, db, functions;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  functions = firebase.functions();

  console.log('Firebase initialized successfully');

  // For local development with emulators (optional)
  if (location.hostname === 'localhost' && location.port === '5001') {
    console.log('Using Firebase Emulators');
    db.useEmulator('localhost', 8080);
    functions.useEmulator('localhost', 5001);
    auth.useEmulator('http://localhost:9099');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('Using mock mode. Please configure Firebase to enable real data.');
}

/**
 * Check if Firebase is configured properly
 */
function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
         firebaseConfig.appId !== 'YOUR_APP_ID';
}

/**
 * Mock user for development (when not authenticated)
 */
const mockUser = {
  uid: 'mock-user-123',
  email: 'demo@metamorphic.energy',
  name: 'McKay White',
  initials: 'MW',
  organisationId: 'org-metamorphic-001',
  role: 'admin'
};

/**
 * Get current user (real or mock)
 */
async function getCurrentUser() {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, using mock user');
    return mockUser;
  }

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      unsubscribe();

      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await db.collection('people').doc(firebaseUser.uid).get();
          const userData = userDoc.exists ? userDoc.data() : {};

          // Get custom claims for organisationId
          const idTokenResult = await firebaseUser.getIdTokenResult();

          resolve({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.displayName || 'User',
            initials: getInitials(userData.name || firebaseUser.displayName || 'User'),
            organisationId: idTokenResult.claims.organisationId || userData.organisationId,
            role: idTokenResult.claims.role || userData.role || 'user'
          });
        } catch (error) {
          console.error('Error getting user data:', error);
          resolve({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            initials: getInitials(firebaseUser.displayName || 'User'),
            organisationId: null,
            role: 'user'
          });
        }
      } else {
        // Not authenticated, use mock user
        console.warn('No authenticated user, using mock user');
        resolve(mockUser);
      }
    });
  });
}

/**
 * Get user initials from name
 */
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Sign out user
 */
async function signOut() {
  if (isFirebaseConfigured()) {
    await auth.signOut();
  }
  window.location.href = '/login.html';
}

/**
 * Call a Cloud Function
 */
async function callFunction(functionName, data) {
  if (!isFirebaseConfigured()) {
    console.warn(`Firebase not configured. Mock call to ${functionName}:`, data);
    throw new Error('Firebase not configured. Please add your Firebase config to enable this feature.');
  }

  try {
    const fn = functions.httpsCallable(functionName);
    const result = await fn(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

/**
 * Mock data for development
 */
const mockWells = [
  {
    id: 'well-001',
    wellId: 'well-001',
    wellName: 'Maersk Voyager - Well A-12',
    wellNumber: 'A-12',
    rigName: 'Maersk Voyager',
    organisationId: 'org-metamorphic-001',
    status: 'drilling',
    field: 'North Sea Field',
    country: 'Norway',
    currentDepth: 8500,
    totalDepth: 11000,
    currentOperation: 'Drilling @ 8,500 ft / 11,000 ft',
    volumes: {
      stringVolume: 185.01,
      annularVolume: 1841.66,
      totalSystemVolume: 2026.67,
      lastCalculated: new Date().toISOString()
    },
    unitSystem: 'imperial',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'well-002',
    wellId: 'well-002',
    wellName: 'Platform Echo - Well B-05',
    wellNumber: 'B-05',
    rigName: 'Platform Echo',
    organisationId: 'org-metamorphic-001',
    status: 'completed',
    field: 'Gulf Platform',
    country: 'USA',
    currentDepth: 9850,
    totalDepth: 9850,
    currentOperation: 'Completed - Suspended',
    volumes: {
      stringVolume: 142.35,
      annularVolume: 1524.42,
      totalSystemVolume: 1666.77,
      lastCalculated: new Date().toISOString()
    },
    unitSystem: 'imperial',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Get wells for organisation (with mock fallback)
 */
async function getOrganisationWells(organisationId, statusFilter = null) {
  if (!isFirebaseConfigured()) {
    console.warn('Using mock wells data');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let wells = [...mockWells];

    // Apply status filter
    if (statusFilter) {
      wells = wells.filter(w => w.status === statusFilter);
    }

    return {
      success: true,
      wells,
      count: wells.length
    };
  }

  return callFunction('getOrganisationWells', {
    organisationId,
    status: statusFilter
  });
}

/**
 * Save complete well configuration
 */
async function saveCompleteWell(wellData, stringConfig, wellSections, bopConfig) {
  if (!isFirebaseConfigured()) {
    console.warn('Mock save - Firebase not configured');
    console.log('Well data to save:', { wellData, stringConfig, wellSections, bopConfig });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      wellId: 'well-mock-' + Date.now(),
      message: 'Well saved successfully (MOCK MODE)',
      data: {
        wellId: 'well-mock-' + Date.now(),
        wellName: wellData.wellName,
        status: 'drilling'
      }
    };
  }

  return callFunction('saveCompleteWell', {
    wellData,
    stringConfig,
    wellSections,
    bopConfig
  });
}

/**
 * Get complete well details
 */
async function getWellDetails(wellId) {
  if (!isFirebaseConfigured()) {
    console.warn('Using mock well details');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const well = mockWells.find(w => w.id === wellId);
    if (!well) {
      throw new Error('Well not found');
    }

    return {
      success: true,
      well,
      stringConfig: null,
      wellSections: null,
      bopConfig: null,
      activities: []
    };
  }

  return callFunction('getWellDetails', { wellId });
}

/**
 * Update well status
 */
async function updateWellStatus(wellId, status, currentDepth, currentOperation) {
  if (!isFirebaseConfigured()) {
    console.warn('Mock update - Firebase not configured');
    return {
      success: true,
      message: 'Well status updated (MOCK MODE)'
    };
  }

  return callFunction('updateWellStatus', {
    wellId,
    status,
    currentDepth,
    currentOperation
  });
}

// Export for use in other files
window.FirebaseConfig = {
  isConfigured: isFirebaseConfigured,
  getCurrentUser,
  signOut,
  getOrganisationWells,
  saveCompleteWell,
  getWellDetails,
  updateWellStatus,
  callFunction,
  mockUser,
  mockWells
};

console.log('Firebase config loaded. Configured:', isFirebaseConfigured());
