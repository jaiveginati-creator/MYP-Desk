# MYP DESK

A personal MYP 4–5 workspace with locally saved study notes and browser-based study tools.

## Notes assistant and quiz builder

The study tools run entirely in the browser. They do not use an API, API key, serverless function, external AI provider, or network request.

Available tools:
- Explain and reorganise selected notes in simpler sections
- Summarise the main sentences in a note
- Create revision flashcards from definition-style notes
- Build a structured study guide and self-check prompts
- Find the closest matching passages for a question
- Generate multiple-choice, short-answer, or mixed quizzes with answers and explanations

## Run the study-engine tests

The study engine has a dependency-free Node.js test suite. From the repository root, run:

```bash
node --test tests/ai.test.mjs
```

The tests cover all assistant actions, note-grounded question matching, unknown questions, all quiz styles, answer-key consistency, and empty-input handling.

## Important limitation

The local study engine uses text processing, keyword matching, sentence ranking, and definition detection. It is not a large language model and does not have human-like reasoning or general knowledge. Its answers are limited to the material students enter, and the quality of generated questions depends on clear, complete notes. It will say when it cannot find enough information rather than pretending to know.

## Privacy

- Notes are stored in the current browser using local storage.
- The assistant and quiz builder process selected notes locally in the browser.
- No note content is sent to a remote service.
- No API key or account is required.
