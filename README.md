# MYP DESK

A personal MYP 4–5 workspace with locally saved study notes and browser-based study tools.

## AI assistant (Groq)

The Notes Assistant and quiz builder use Groq through a separate Node.js API service hosted on Render. The GitHub Pages website calls the Render API; the Groq API key stays on Render and is never shipped to the browser.

- Explain, summarise, create flashcards, and build study guides from selected notes.
- Ask questions about notes, distinguishing note-supported information from additional explanation.
- Generate mixed, multiple-choice, and short-answer practice quizzes with answer explanations.
- The tutor supports all MYP subjects, not just French.
- If Groq is unavailable, the existing local rule-based study engine remains as a labelled fallback.

## Deploy the backend to Render

1. In Render, choose **New → Web Service** and connect this repository.
2. Use the repository root as the Root Directory.
3. Select **Node** as the runtime. Set Build Command to `npm install` and Start Command to `npm start` (the server has no external npm dependencies).
4. Add these Environment Variables in Render:
   - `GROQ_API_KEY`: your Groq API key.
   - `FRONTEND_ORIGIN`: `https://jaiveginati-creator.github.io` (the GitHub Pages site origin, with no trailing slash).
   - `GROQ_MODEL` (optional): defaults to `openai/gpt-oss-20b`.
5. Deploy. Check that `https://YOUR-SERVICE.onrender.com/health` returns JSON with `ok: true`.
6. Copy the service URL and append `/api/ai`. Put the full endpoint into `api-config.js` as the value of `window.PARLER_AI_API_URL`.
7. Commit the endpoint change to GitHub. GitHub Pages will publish the frontend update automatically.

The backend supports CORS preflight requests and basic per-IP request limiting. Render free services may sleep when idle, so the first AI request after inactivity can take longer.

## Local development

Run `npm start`, set `window.PARLER_AI_API_URL` in `api-config.js` to `http://localhost:3001/api/ai`, and provide the environment variables before starting the server.

Privacy: notes remain in browser storage until the student uses the assistant or quiz builder. At that point, only the selected notes are sent to Groq through the server-side API. Do not include sensitive personal information in study notes.

Never paste the API key into `index.html`, `ai.js`, `groq-client.js`, `api-config.js`, or GitHub. Store it only in Render Environment Variables.

## Local study-engine tests

The original browser-only study engine remains in `ai.js`. Run its dependency-free Node.js tests with:

```bash
node --test tests/ai.test.mjs
```

These tests cover local fallback actions, note-grounded question matching, unknown questions, quiz styles, answer-key consistency, and empty-input handling.
