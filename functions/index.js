// Existing Gabriella agent (Gemini-based)
exports.agent = require("./agent").agent;

// CCIS Proxy (OpenAI-based, serves all CCIS agents)
exports.ccisProxy = require("./ccisProxy").ccisProxy;