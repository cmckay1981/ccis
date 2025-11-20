const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const OpenAI = require("openai");

// Initialize Firestore (admin.initializeApp() already called in agent.js)
const db = admin.firestore();

// Lazy load OpenAI so Firebase secrets resolve at runtime
let openai;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/* ============================================================================
   CCIS PROXY — FIREBASE CLOUD FUNCTION
   ============================================================================
   Unified API endpoint for all CCIS agents:
   - kabaakh
   - leadership-intelligence
   - situational-awareness
   - well-control-intelligence
   - cyber-security
   - hospitality-concierge
============================================================================ */

// Security filter - block prompt injection attempts
const BLOCKED_PHRASES = [
  "system prompt",
  "manual",
  "architecture",
  "training data",
  "show your code",
  "rules",
  "recreate",
  "replicate",
  "instructions",
  "ignore previous",
  "disregard",
  "bypass"
];

// Load agent system prompt from Firestore
async function loadAgentPrompt(agentName) {
  try {
    const docRef = db.collection("ccis-prompts").doc(agentName);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Agent prompt not found in Firestore: ${agentName}`);
    }

    const data = doc.data();
    return {
      agent: data.agent || agentName,
      system_prompt: data.system_prompt || "",
      modules: data.modules || {},
      version: data.version || "1.0",
      updated_at: data.updated_at || null
    };
  } catch (error) {
    console.error(`Error loading agent prompt for ${agentName}:`, error);
    throw error;
  }
}

// CCIS Proxy Cloud Function
exports.ccisProxy = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
    memory: "512MiB"
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
      const { agent: agentRaw, message } = req.body;

      if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "Empty or invalid message" });
      }

      const agent = (agentRaw || "kabaakh").toLowerCase().trim().split("/")[0];

      const normalizedMessage = message.toLowerCase();
      for (const blocked of BLOCKED_PHRASES) {
        if (normalizedMessage.includes(blocked)) {
          return res.json({
            type: "response",
            agent,
            reply: "That information is proprietary to Claymore & Colt."
          });
        }
      }

      // Leadership welcome menu
      if (agent === "leadership-intelligence" && message.trim() === "__system_welcome__") {
        return res.json({
          type: "response",
          agent: "leadership-intelligence",
          reply: `BRIEFING & EXECUTION
A) Guide me through an operational brief.
B) Teach me situational awareness and human factors.

LEADERSHIP DECISION SUPPORT
C) Help me clarify a leadership decision or conflict.
D) Train me in communication discipline.

PLANNING & STRATEGY
E) Walk me through the OPAR cycle.
F) Structure team roles and task assignments.

REDCELL ANALYSIS
G) Spot risk patterns and blind spots.
H) Prepare contingencies and failure modes.

Which direction do you want to start with?`
        });
      }

      // Leadership option B → switch agent
      const leadershipOptions = ["a","a)","b","b)","c","c)","d","d)","e","e)","f","f)","g","g)","h","h)"];
      if (agent === "leadership-intelligence" && leadershipOptions.includes(normalizedMessage)) {
        if (normalizedMessage === "b" || normalizedMessage === "b)") {
          const saPrompt = await loadAgentPrompt("situational-awareness");
          return res.json({
            type: "system",
            agent: "situational-awareness",
            reply: saPrompt.system_prompt
          });
        }
      }

      const validAgents = [
        "kabaakh",
        "leadership-intelligence",
        "situational-awareness",
        "well-control-intelligence",
        "cyber-security",
        "hospitality-concierge"
      ];

      if (!validAgents.includes(agent)) {
        return res.status(400).json({
          error: "Unknown agent",
          agents: validAgents
        });
      }

      let agentData;
      try {
        agentData = await loadAgentPrompt(agent);
      } catch (error) {
        console.error("Firestore load error:", error);
        return res.status(500).json({
          error: "Failed to load agent configuration",
          message: error.message
        });
      }

      let userMessage = message;
      if (agent === "leadership-intelligence") {
        userMessage = `USER_MESSAGE: ${message}`;
      }

      // FIXED OPENAI CALL
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: agentData.system_prompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.55,
        max_tokens: 2000
      });

      const reply = completion.choices?.[0]?.message?.content || "No response generated.";

      return res.json({
        type: "response",
        agent,
        reply
      });

    } catch (error) {
      console.error("CCIS Proxy Error:", error);

      if (error.status) {
        return res.status(error.status).json({
          error: "OpenAI API error",
          message: error.message
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  }
);