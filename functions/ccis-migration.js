/**
 * CCIS FIRESTORE MIGRATION SCRIPT
 * ================================
 *
 * Migrates CCIS agent prompts from PHP text files to Firestore.
 *
 * Usage:
 *   node ccis-migration.js
 *
 * Prerequisites:
 *   - Firebase Admin SDK initialized
 *   - Service account key configured
 *   - Prompt files accessible locally
 *
 * © 2026 Claymore & Colt Holdings LLC. All rights reserved.
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
// NOTE: Update this path to your service account key
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Path to your CCIS prompt files
// ADJUST THIS PATH to match your local cPanel mirror location
const PROMPTS_BASE = "/Users/whitemckay/Projects/CCIS/cPanel-mirror/claymoreandcolt/ccis/api/prompts";

/**
 * Read a text file
 */
function readPromptFile(filepath) {
  try {
    return fs.readFileSync(filepath, "utf-8").trim();
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error.message);
    return `[ERROR] Could not read file: ${filepath}`;
  }
}

/**
 * Migrate KA.BA.AKH prompt
 */
async function migrateKabaakh() {
  console.log("\n📦 Migrating KA.BA.AKH...");

  const promptFile = path.join(PROMPTS_BASE, "kabaakh.txt");
  const systemPrompt = readPromptFile(promptFile);

  const data = {
    agent: "KA.BA.AKH — The Higher Witness",
    system_prompt: systemPrompt,
    version: "3.0",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    modules: {}
  };

  await db.collection("ccis-prompts").doc("kabaakh").set(data);
  console.log("✅ KA.BA.AKH migrated successfully");
}

/**
 * Migrate Leadership Intelligence prompt
 */
async function migrateLeadershipIntelligence() {
  console.log("\n📦 Migrating Leadership Intelligence...");

  const baseDir = path.join(PROMPTS_BASE, "leadership_intelligence");

  const parts = [
    "leadership_intel_part01_identity_voice.txt",
    "leadership_intel_part02_domains_modes.txt",
    "leadership_intel_part03_engines.txt",
    "leadership_intel_part04_training_opar.txt",
    "leadership_intel_part05_rules_safety.txt"
  ];

  let systemPrompt = "";
  for (const part of parts) {
    const filepath = path.join(baseDir, part);
    systemPrompt += "\n" + readPromptFile(filepath);
  }

  // Optional: Load modules directory
  const modulesDir = path.join(baseDir, "leadership_modules");
  const modules = {};

  if (fs.existsSync(modulesDir)) {
    const moduleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith(".txt"));
    for (const moduleFile of moduleFiles) {
      const moduleName = moduleFile.replace(".txt", "");
      const modulePath = path.join(modulesDir, moduleFile);
      modules[moduleName] = readPromptFile(modulePath);
    }
  }

  const data = {
    agent: "Leadership Intelligence — RedCell Hybrid v1.2",
    system_prompt: systemPrompt.trim(),
    version: "1.2",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    modules: modules
  };

  await db.collection("ccis-prompts").doc("leadership-intelligence").set(data);
  console.log("✅ Leadership Intelligence migrated successfully");
  console.log(`   Loaded ${Object.keys(modules).length} modules`);
}

/**
 * Migrate Situational Awareness prompt
 */
async function migrateSituationalAwareness() {
  console.log("\n📦 Migrating Situational Awareness...");

  const baseDir = path.join(PROMPTS_BASE, "situational_awareness");

  const parts = [
    "SA_part01_manual.txt",
    "SA_part02_training.txt"
  ];

  let systemPrompt = "";
  for (const part of parts) {
    const filepath = path.join(baseDir, part);
    systemPrompt += "\n" + readPromptFile(filepath);
  }

  // Optional: Load drills directory
  const drillsDir = path.join(baseDir, "drills");
  const drills = {};

  if (fs.existsSync(drillsDir)) {
    const drillFiles = fs.readdirSync(drillsDir).filter(f => f.endsWith(".txt"));
    for (const drillFile of drillFiles) {
      const drillName = drillFile.replace(".txt", "");
      const drillPath = path.join(drillsDir, drillFile);
      drills[drillName] = readPromptFile(drillPath);
    }
  }

  const data = {
    agent: "Situational Awareness Module — CCIS",
    system_prompt: systemPrompt.trim(),
    version: "1.0",
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    modules: drills
  };

  await db.collection("ccis-prompts").doc("situational-awareness").set(data);
  console.log("✅ Situational Awareness migrated successfully");
  console.log(`   Loaded ${Object.keys(drills).length} drills`);
}

/**
 * Create placeholder prompts for remaining agents
 */
async function createPlaceholders() {
  console.log("\n📦 Creating placeholder prompts...");

  const placeholders = [
    {
      id: "well-control-intelligence",
      agent: "Well Control Intelligence",
      prompt: "You are the Well Control Intelligence agent for CCIS. Provide expert guidance on well control operations, safety protocols, and risk management."
    },
    {
      id: "cyber-security",
      agent: "Cyber Security Intelligence",
      prompt: "You are the Cyber Security Intelligence agent for CCIS. Provide guidance on cybersecurity best practices, threat awareness, and digital safety."
    },
    {
      id: "hospitality-concierge",
      agent: "Hospitality Concierge",
      prompt: "You are the Hospitality Concierge agent for CCIS. Provide exceptional service guidance, guest experience optimization, and hospitality excellence coaching."
    }
  ];

  for (const placeholder of placeholders) {
    const data = {
      agent: placeholder.agent,
      system_prompt: placeholder.prompt,
      version: "1.0",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      modules: {}
    };

    await db.collection("ccis-prompts").doc(placeholder.id).set(data);
    console.log(`✅ ${placeholder.agent} placeholder created`);
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("🔥 CCIS FIRESTORE MIGRATION");
  console.log("============================\n");

  try {
    await migrateKabaakh();
    await migrateLeadershipIntelligence();
    await migrateSituationalAwareness();
    await createPlaceholders();

    console.log("\n✅ MIGRATION COMPLETE");
    console.log("\nFirestore collection: ccis-prompts");
    console.log("Documents created:");
    console.log("  • kabaakh");
    console.log("  • leadership-intelligence");
    console.log("  • situational-awareness");
    console.log("  • well-control-intelligence");
    console.log("  • cyber-security");
    console.log("  • hospitality-concierge");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:", error);
    process.exit(1);
  }
}

// Run migration
migrate();
