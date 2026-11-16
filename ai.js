/* PARLER FRANÇAIS — AI quiz adapter
 *
 * This file is the frontend integration point only. Keep provider secrets on a
 * server you control; never place a private API key in this browser code.
 * When ready, set the backend route in your server environment and implement
 * POST /api/quiz. The browser can then call this adapter without knowing which
 * provider is used behind the server.
 */
(() => {
  const CONFIG = Object.freeze({
    endpoint: "/api/quiz",
    enabled: false // Set true only after the secure backend endpoint is deployed.
  });

  async function generateQuiz({ notes, count = 10, style = "mixed" }) {
    if (!CONFIG.enabled) {
      throw new Error("AI quiz generation is not connected yet. Configure the secure backend first.");
    }
    const response = await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        notes: notes.map(({ title, body }) => ({ title, body })),
        count,
        style,
        language: "French"
      })
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.error || "The quiz service could not generate a quiz.");
    }
    return response.json();
  }

  window.ParlerAI = Object.freeze({
    isConfigured: () => CONFIG.enabled,
    generateQuiz
  });
})();
