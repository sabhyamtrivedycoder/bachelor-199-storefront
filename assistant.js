const answerBank = [
  { keys: ["how many", "recipe count", "number of recipe", "how much recipe", "199 recipes", "bonus"], answer: "Bachelor 199 includes 199 main recipes plus 30 bonus recipes, for 229 recipes total." },
  { keys: ["199 rupee", "₹199", "cost", "price of recipe", "budget", "afford", "under 199"], answer: "Each printed estimate aims to keep the ingredients used for one serving below ₹199. Prices change by city, season, shop and brand. The estimate covers the portion used, not buying every full unopened package, fuel or delivery. Please check current local prices." },
  { keys: ["serving", "portion", "how many people", "one person", "for one"], answer: "The recipes are written for one adult. The book explains how to scale ingredients for two. Cooking time may change, so check that food is safely cooked throughout." },
  { keys: ["format", "pdf", "epub", "download", "file", "ebook", "e-book"], answer: "The current Shopify listing delivers one PDF e-book file. The product is active in the store admin at ₹149 INR; the storefront is still password-protected, so customers cannot place an order until the store is opened." },
  { keys: ["inside", "what is in", "categories", "include", "topics", "chapter"], answer: "The book covers breakfast, eggs, rice and grain bowls, pasta and noodles, vegetarian meals, chicken, minced meat, fish and seafood, wraps, soups, snacks and sweets. It also includes a quick-start section and food-safety notes." },
  { keys: ["step", "beginner", "simple", "easy", "how are recipes", "instructions"], answer: "Each recipe uses simple English, measured ingredients, a one-person serving, numbered cooking steps, a time estimate, an original illustration and an estimated ingredient cost." },
  { keys: ["allerg", "gluten", "vegetarian", "vegan", "diet", "substitut"], answer: "Recipes include different ingredients and may not fit every allergy or diet. Read each ingredient list carefully and make substitutions only when they are safe for you. The book is not medical or nutrition advice." },
  { keys: ["author", "who wrote", "pen name"], answer: "The author name has not been finalized yet. The book's author details will be updated before it is published." },
  { keys: ["buy", "purchase", "checkout", "shopify", "available", "order", "sale"], answer: "Bachelor 199 is listed in Shopify at ₹149 INR with one PDF file for download. The store is currently password-protected and on a trial plan, so checkout is not publicly available yet." },
  { keys: ["safety", "chicken", "raw", "safe", "temperature", "food poisoning"], answer: "The book includes basic food-safety reminders. Keep raw and cooked foods separate, wash hands and tools, cook poultry thoroughly, and follow trusted local food-safety guidance. For health concerns, consult a qualified professional." }
];

function findAnswer(question) {
  const q = question.toLocaleLowerCase().replace(/[^\p{L}\p{N}₹ ]/gu, " ").replace(/\s+/g, " ").trim();
  let best = null;
  let bestScore = 0;
  for (const item of answerBank) {
    const score = item.keys.reduce((sum, key) => sum + (q.includes(key) ? Math.max(1, key.split(" ").length) : 0), 0);
    if (score > bestScore) { best = item.answer; bestScore = score; }
  }
  return best || "I can help with recipe count, contents, serving size, cost estimates, formats, safety notes or purchase details. Try asking one of those questions. For recipe-specific advice, check the full recipe and trusted food-safety guidance.";
}

const messages = document.querySelector("#chat-messages");
const input = document.querySelector("#chat-input");
function addMessage(text, kind) {
  const bubble = document.createElement("div");
  bubble.className = `message ${kind}-message`;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}
function ask(text) {
  const question = text.trim();
  if (!question) return;
  addMessage(question, "user");
  addMessage(findAnswer(question), "bot");
}
async function submitQuestion(text) {
  const question = text.trim();
  if (!question) return;
  addMessage(question, "user");
  const pending = document.createElement("div");
  pending.className = "message bot-message";
  pending.textContent = "Thinking…";
  messages.append(pending);
  messages.scrollTop = messages.scrollHeight;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    if (!response.ok) throw new Error("AI service unavailable");
    const data = await response.json();
    if (!data.answer || typeof data.answer !== "string") throw new Error("No answer returned");
    pending.textContent = data.answer;
  } catch {
    pending.textContent = findAnswer(question);
  }
  messages.scrollTop = messages.scrollHeight;
}
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuestion(input.value);
  input.value = "";
  input.focus();
});
document.querySelectorAll("[data-question]").forEach((button) => button.addEventListener("click", () => submitQuestion(button.dataset.question)));

