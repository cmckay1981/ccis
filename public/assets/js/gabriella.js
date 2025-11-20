// ========== GABRIELLA | MAIN ASSISTANT SCRIPT ========== //
// Location: /assets/js/gabriella.js
// Usage: Called from both contact and trading qualification pages

document.addEventListener("DOMContentLoaded", () => {
  // ========== DOM ELEMENTS ========== //
  const chat = document.getElementById("gabriella-chat");
  const form = document.getElementById("gabriella-form");
  const input = document.getElementById("gabriella-input");

  // ========== PAGE CONTEXT DETECTION ========== //
  const path = window.location.pathname.toLowerCase();
  let pageContext = "default";
  if (path.includes("/contact")) pageContext = "contact";
  else if (path.includes("/trading/qualification")) pageContext = "trading";

  // ========== INITIAL STATE ========== //
  let state = "start";
  let role = "";
  let category = "";
  let productQueue = [];
  let currentProduct = null;
  let userName = "";
  let userEmail = "";
  let volumeEntered = null;
  let portEntered = "";

  // ========== STARTUP MESSAGES ========== //
  if (pageContext === "contact") {
    appendMessage("Hi there! I’m Gabriella — McKay and Tom’s assistant. What’s your name? 😊", "bot");
  } else if (pageContext === "trading") {
    appendMessage("Hi! I’m Gabriella — McKay and Tom’s assistant. Let’s get you qualified for trade support. What’s your name?", "bot");
    state = "getName";
  }

  // ========== CHAT HANDLER ========== //
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;
    appendMessage(userInput, "user");
    input.value = "";

    // ========== CONTACT PAGE FLOW ========== //
    if (pageContext === "contact") {
      if (state === "start") {
        state = "askDivision";
        userName = userInput;
        appendMessage(`Nice to meet you, ${userName}. Which division would you like to speak with?`, "bot");
        appendMessage("Options: Energy, Trading, Decom, or General Inquiry", "bot");
        return;
      }
      if (state === "askDivision") {
        appendMessage("Thanks! I’ll pass this to the correct team. If you'd like to leave a message, feel free.", "bot");
        state = "done";
        return;
      }
    }

    // ========== TRADING PAGE FLOW ========== //
    if (pageContext === "trading") {
      if (state === "getName") {
        userName = userInput.split(" ")[0];
        state = "getEmail";
        appendMessage(`Thanks, ${userName}. What’s the best email to reach you?`, "bot");
        return;
      }

      if (state === "getEmail") {
        userEmail = userInput;
        if (!userName || userName.toLowerCase() === "customer" || userName.length <= 2) {
          const extracted = userEmail.split("@")[0].replace(/[^a-z]/gi, " ").split(" ")[0];
          if (extracted.length > 1) userName = capitalize(extracted);
        }
        state = "category";
        appendMessage(`Nice to see you again, ${userName}. Let’s get started — what type of product are you dealing with today?`, "bot");
        appendMessage("Options: Fuel / Energy, Agriculture, Equipment, or Other", "bot");
        return;
      }

      if (state === "category") {
        if (/fuel|energy/i.test(userInput)) {
          category = "fuel";
          state = "intent";
          appendMessage("Are you looking to buy or sell fuel products today?", "bot");
        } else if (/ag/i.test(userInput)) {
          category = "agriculture";
          state = "agComingSoon";
          appendMessage("Thanks — agriculture product screening is coming soon. For now, feel free to describe your request.", "bot");
        } else if (/equip|defense/i.test(userInput)) {
          category = "equipment";
          state = "equipComingSoon";
          appendMessage("Thanks — equipment screening is in development. You can describe the item or upload documents above.", "bot");
        } else {
          appendMessage("Got it. You can go ahead and describe what you need, or select Fuel, Ag, or Equipment.", "bot");
        }
        return;
      }

      if (state === "intent") {
        if (/buy/i.test(userInput)) {
          role = "buyer";
          state = "getProducts";
          appendMessage("What product or products are you looking to buy? (e.g., EN590, Jet A1)", "bot");
        } else if (/sell/i.test(userInput)) {
          role = "seller";
          state = "getProducts";
          appendMessage("What product or products are you offering?", "bot");
        } else {
          appendMessage("Please let me know if you're looking to buy or sell.", "bot");
        }
        return;
      }

      if (state === "getProducts") {
        const knownSpecs = ["EN590", "D6", "JET A1", "JET B", "BONNY LIGHT", "BRENT CRUDE", "MEREY 16"];
        productQueue = userInput.split(/,|and|&/i).map(p => p.trim().toUpperCase());
        for (let i = 0; i < productQueue.length; i++) {
          const product = productQueue[i];
          if (!knownSpecs.includes(product)) {
            appendMessage(`"${product}" doesn't match any recognized fuel, jet, or crude spec. Did you mean something like EN590, Jet A1, or Brent Crude?`, "bot");
            state = "getProducts";
            return;
          }
        }
        currentProduct = productQueue.shift();
        state = "spec";
        appendMessage(`Let’s start with ${currentProduct}. Any specific spec or certification required?`, "bot");
        return;
      }

      if (state === "spec") {
        if (/9200/.test(userInput)) {
          appendMessage("Just checking — did you mean EN590 10ppm (Euro V standard)?", "bot");
        }
        state = "volume";
        appendMessage(`What is the volume and delivery schedule for ${currentProduct}?`, "bot");
        return;
      }

      if (state === "volume") {
        volumeEntered = userInput;
        const productUnits = {
          "EN590": "MT",
          "D6": "MT",
          "JET A1": "BBL",
          "JET B": "BBL",
          "JP54": "GAL",
          "BONNY LIGHT": "BBL",
          "BRENT CRUDE": "BBL",
          "MEREY 16": "BBL"
        };
        const unit = productUnits[currentProduct] || "unit";
        state = "location";
        appendMessage(`Just confirming — ${currentProduct} is typically traded in ${unit}.`, "bot");
        setTimeout(() => {
          appendMessage(`Where should ${currentProduct} be delivered? Any preferred port or terminal?`, "bot");
        }, 600);
        return;
      }

      if (state === "location") {
        portEntered = userInput;
        if (role === "buyer") {
          appendMessage("Do you have a TSA (Tank Storage Agreement) in place, if using TTT (Tank-to-Tank)?", "bot");
        } else {
          appendMessage("Can you provide a TSR (Tank Storage Receipt) or tank reference for this product?", "bot");
        }
        if (productQueue.length > 0) {
          currentProduct = productQueue.shift();
          state = "spec";
          appendMessage(`Now for ${currentProduct} — any specific spec or certification?`, "bot");
        } else {
          state = "docs";
          appendMessage("Can you describe your company or any past deals? You can also upload supporting info above — optional at this stage.", "bot");
        }
        return;
      }

      if (state === "docs") {
        state = "payment";
        appendMessage("Preferred payment method? (TT, SBLC, DLC, crypto?) And which bank would be involved?", "bot");
        return;
      }

      if (state === "payment") {
        state = "roleCheck";
        appendMessage("Are you the actual buyer/seller, a mandate, or intermediary? Who has Power of Attorney (POA)?", "bot");
        return;
      }

      if (state === "roleCheck") {
        state = "done";
        appendMessage("Thank you! We'll review your information and follow up. You can also upload additional documents above.", "bot");
        submitToSheet(); // 🚀 Push data to Google Sheets
        return;
      }
    }
  });

  // ========== UTILITIES ========== //
  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `gabriella-message ${sender}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // ========== GOOGLE SHEET SUBMISSION ========== //
  function submitToSheet() {
    const webhookUrl = "https://script.google.com/macros/s/AKfycbwe3eeMuMytF1ODuQkFb3QNIvNc31z_dds_QaUYKiNsH6pAV0uj_JrwMmsu1qjqP8py/exec";

    const redFlags = [];
    const vol = parseInt(volumeEntered.toString().replace(/[^\d]/g, "")) || 0;
    if (currentProduct === "EN590" && vol < 10000) redFlags.push("⚠️ EN590 volume under 10,000 MT");
    if (currentProduct === "JET A1" && vol < 10000) redFlags.push("⚠️ Jet A1 volume unusually small");
    if (currentProduct === "JP54") redFlags.push("⚠️ Legacy spec - JP54");

    const summary = `${role} requested ${currentProduct} at ${volumeEntered}, to be delivered at ${portEntered}. ${redFlags.length ? redFlags.join(" ") : "No red flags."}`;

    const payload = {
      name: userName,
      email: userEmail,
      product: currentProduct,
      volume: volumeEntered,
      port: portEntered,
      role: role,
      flags: redFlags.join("; "),
      summary: summary,
      page: pageContext
    };

    fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    })
      .then(() => appendMessage("✅ Deal summary submitted to our team.", "bot"))
      .catch(() => appendMessage("⚠️ Something went wrong submitting your info.", "bot"));
  }
});