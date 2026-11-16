# MYP DESK

A personal MYP 4–5 workspace with locally saved study notes, an AI notes assistant, and AI-generated practice quizzes.

## AI setup

The AI features use the OpenAI Responses API through a server-side Vercel Function. The browser never receives the API key.

1. Import this repository into Vercel and deploy it. Vercel automatically exposes the function in `api/ai.js` at `/api/ai`.
2. In the Vercel project settings, add the environment variable `OPENAI_API_KEY` with your OpenAI API key. Keep it private; never paste it into `ai.js`, `index.html`, or a public repository.
3. Optionally set `OPENAI_MODEL` to a model available to your API account. The default is `gpt-4.1-mini`.
4. Redeploy after adding or changing environment variables.

The static site can still be previewed without the AI environment variable. Notes remain stored in the current browser using local storage. AI requests will show a setup message until the server key is configured.

## AI features

- Explain selected notes in simpler language
- Summarise notes
- Generate revision flashcards
- Build a structured study guide
- Ask questions grounded in selected notes
- Generate 5–20 mixed, multiple-choice, or short-answer quiz questions with answer explanations

The assistant is instructed to use the supplied notes as its factual source and to say when the notes do not contain enough information. Quiz output is validated before it is sent to the browser.

## Privacy and operational notes

- Saved notes stay in the browser's local storage unless the student chooses to send selected notes to the AI assistant or quiz generator.
- When AI is used, the selected note text is sent to the configured server and then to the OpenAI API to produce the requested response.
- The API key is read only from the server environment.
- The API route applies request validation, same-origin checks, a per-instance rate limit, and disables response storage.
- The in-memory rate limit is a basic safeguard, not a complete abuse-prevention system. Add deployment-level rate limiting before making a public production deployment.
- Do not commit API keys or other secrets.
