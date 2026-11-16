/* MYP DESK — secure AI study tools frontend adapter.
 * The API key stays on the server. This file contains no provider secrets.
 */
(() => {
  const ENDPOINT = "/api/ai";
  async function request(payload) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The AI service could not complete your request.");
    return data;
  }
  async function generateQuiz({ notes, count = 10, style = "mixed" }) {
    return request({ action: "quiz", notes: notes.map(({ title, body }) => ({ title, body })), count, style });
  }
  async function askNotes({ notes, action = "explain", prompt = "" }) {
    return request({ action: "notes", notes: notes.map(({ title, body }) => ({ title, body })), task: action, prompt });
  }
  window.ParlerAI = Object.freeze({ isConfigured: () => true, generateQuiz, askNotes });
})();
