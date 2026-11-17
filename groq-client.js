/* Groq-powered MYP Desk client. ai.js remains available as the local fallback. */
(() => {
  "use strict";
  const local = window.ParlerAI;
  if (!local) return;
  const apiUrl = typeof window.PARLER_AI_API_URL === "string" ? window.PARLER_AI_API_URL.trim() : "";
  async function request(payload) {
    if (!apiUrl) throw new Error("The Render API URL has not been configured yet.");
    const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `AI request failed (${response.status}).`);
    return data;
  }
  async function askNotes({ notes, action = "explain", prompt = "", subject = "General", gradeLevel = "MYP 4–5" }) {
    try {
      const data = await request({ action, notes, prompt, subject, gradeLevel });
      return { text: data.text || "The AI returned an empty response.", provider: "groq", model: data.model };
    } catch (error) {
      const fallback = await local.askNotes({ notes, action, prompt });
      return { text: "GROQ IS CURRENTLY UNAVAILABLE — LOCAL NOTES MODE\n\n" + fallback.text + "\n\nCheck the Render API URL and server configuration. (" + error.message + ")", provider: "local-fallback" };
    }
  }
  async function generateQuiz({ notes, count = 10, style = "mixed", subject = "General", gradeLevel = "MYP 4–5" }) {
    try {
      const data = await request({ action: "quiz", notes, count, style, subject, gradeLevel });
      if (!data.quiz || !Array.isArray(data.quiz.questions) || !data.quiz.questions.length) throw new Error("Groq returned an invalid quiz.");
      return data.quiz;
    } catch (error) {
      const fallback = await local.generateQuiz({ notes, count, style });
      fallback.notice = "GROQ IS CURRENTLY UNAVAILABLE — this quiz was made by the local notes engine instead. " + error.message;
      return fallback;
    }
  }
  window.ParlerAI = Object.freeze({ ...local, isLocal: false, provider: "groq-with-local-fallback", askNotes, generateQuiz,
    diagnostics: () => ({ mode: "Groq AI via Render with local fallback", network: true, configured: Boolean(apiUrl), features: ["explain", "summarise", "flashcards", "study-guide", "ask", "quiz"] })
  });
})();
