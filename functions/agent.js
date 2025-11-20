const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

// Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the correct model:
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.5-pro-latest"
});

/* -------------------------------------------------------------------------- */
/*                                   TOOLS                                    */
/* -------------------------------------------------------------------------- */

async function saveNoteTool(data) {
  const { userId, text } = data;
  await db.collection("agent_notes").add({
    userId,
    text,
    timestamp: Date.now(),
  });
  return { status: "saved" };
}

async function saveLeadershipSessionTool(data) {
  const { userId, sector, topics, keyTakeaways, commitments } = data;
  await db.collection("redcell_leadership_sessions").add({
    userId: userId || "anonymous",
    sector: sector || "unknown",
    topics: Array.isArray(topics) ? topics : [],
    keyTakeaways: keyTakeaways || "",
    commitments: commitments || "",
    createdAt: Date.now(),
  });
  return { status: "saved" };
}

async function saveCyberSessionTool(data) {
  const { userId, focusArea, keyTakeaways, risksNoted } = data;
  await db.collection("redcell_cyber_sessions").add({
    userId: userId || "anonymous",
    focusArea: focusArea || "",
    keyTakeaways: keyTakeaways || "",
    risksNoted: risksNoted || "",
    createdAt: Date.now(),
  });
  return { status: "saved" };
}

/* -------------------------------------------------------------------------- */
/*                                MAIN AGENT                                  */
/* -------------------------------------------------------------------------- */

exports.agent = onRequest(async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const userId = req.body.userId || "anonymous";
    const agentType = req.body.agentType || "general";
    const sector = (req.body.sector || "").toLowerCase().trim();

    let rolePrompt = "";
    let sectorHint = "";

    if (agentType === "redcell-leadership") {
      rolePrompt = `
You are Gabriella, the lead instructor of REDCELL — the High-Reliability Leadership & Operations Standard.
You are a female instructor with calm authority.

Your job:
- Coach leaders in high-reliability, high-risk environments.
- Use simple, practical language.
- Provide clear direction, empathetic tone, and real-world examples.
`;

      if (sector === "well") {
        sectorHint = `User works in well operations (rigs, MPD, well control).`;
      } else if (sector === "hospitality") {
        sectorHint = `User works in hospitality (service, guest experience).`;
      } else if (sector === "aviation") {
        sectorHint = `User works in aviation (cockpit, ATC, CRM).`;
      } else if (sector === "tactical") {
        sectorHint = `User works in tactical/ops context (planning, briefings, trust).`;
      } else {
        sectorHint = `User works in a high-reliability environment.`;
      }

    } else if (agentType === "redcell-cyber") {
      rolePrompt = `
You are Gabriella, REDCELL's cyber behavior & human-layer instructor.
Your style is calm, direct, and practical.
`;
      sectorHint = `Environment involves sensitive digital operations.`;

    } else {
      rolePrompt = `
You are Gabriella, the REDCELL assistant.
Keep responses simple, clear, and helpful.
`;
    }

    const fullPrompt = `
${rolePrompt}

Environment context:
${sectorHint}

The user ID is: ${userId}

If user asks to save or log something, use the provided save tools.
`;

    const chat = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${fullPrompt}\n\nUser: ${userMessage}` }],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "saveNote",
              description: "Save a simple note.",
              parameters: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  text: { type: "string" },
                },
                required: ["userId", "text"],
              },
            },
            {
              name: "saveLeadershipSession",
              description: "Save a REDCELL leadership coaching summary.",
              parameters: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  sector: { type: "string" },
                  topics: { type: "array", items: { type: "string" }},
                  keyTakeaways: { type: "string" },
                  commitments: { type: "string" },
                },
                required: ["userId", "sector", "keyTakeaways"],
              },
            },
            {
              name: "saveCyberSession",
              description: "Save a REDCELL cyber coaching summary.",
              parameters: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  focusArea: { type: "string" },
                  risksNoted: { type: "string" },
                  keyTakeaways: { type: "string" },
                },
                required: ["userId", "keyTakeaways"],
              },
            },
          ],
        },
      ],
    });

    const result = chat?.response?.candidates?.[0];
    const possibleCall = result?.content?.parts?.[0]?.functionCall;

    if (possibleCall) {
      const call = possibleCall;

      if (call.name === "saveNote") {
        return res.json({ type: "tool-result", result: await saveNoteTool(call.args) });
      }
      if (call.name === "saveLeadershipSession") {
        return res.json({ type: "tool-result", result: await saveLeadershipSessionTool(call.args) });
      }
      if (call.name === "saveCyberSession") {
        return res.json({ type: "tool-result", result: await saveCyberSessionTool(call.args) });
      }
    }

    const reply = result?.content?.parts?.[0]?.text || "I'm not sure how to reply yet.";
    return res.json({ type: "response", reply });

  } catch (err) {
    console.error("AGENT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});