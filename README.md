# MYP DESK

A personal MYP 4–5 workspace with locally saved study notes and browser-based study tools.

## AI assistant (Groq)

The Notes Assistant and quiz builder use Groq through a server-side API route. The browser calls `/api/ai`; the Groq API key stays on the server and is never shipped to the client.

- Explain, summarise, create flashcards, and build study guides from selected notes.
- Ask questions about notes, with the tutor distinguishing note-supported information from additional explanation.
- Generate mixed, multiple-choice, and short-answer practice quizzes with answer explanations.
- The tutor is general-purpose across MYP subjects, not limited to French.
- If Groq is unavailable, the existing local rule-based study engine remains as a fallback and labels the response accordingly.

### Deployment

This repository includes a Vercel serverless function in `api/ai.js` and a `vercel.json` configuration.

1. Import this repository into Vercel and deploy it as a Vercel project. A static-only host such as GitHub Pages cannot run the server-side API route.
2. In Vercel Project Settings → Environment Variables, add:
   - `GROQ_API_KEY`: your Groq API key.
   - `GROQ_MODEL` (optional): defaults to `openai/gpt-oss-20b`.
3. Redeploy after adding the environment variables.
4. Open the deployed site and test the Notes Assistant and quiz builder.

Privacy: notes remain in browser storage until the student uses the assistant or quiz builder. At that point, only the selected notes are sent to Groq through the server-side API for processing. Do not include sensitive personal information in study notes.\n\nDo not paste the API key into `index.html`, `ai.js`, `groq-client.js`, or commit it to GitHub. The `.env.example` file is only a variable-name template and contains no secret.

## Local study-engine tests

The original browser-only study engine remains in `ai.js`. Its dependency-free Node.js tests can be run with:

```bash
node --test tests/ai.test.mjs
```

These tests cover local fallback actions, note-grounded question matching, unknown questions, quiz styles, answer-key consistency, and empty-input handling.
