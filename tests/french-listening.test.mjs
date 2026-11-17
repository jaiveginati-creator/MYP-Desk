import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("French listening starts speech synchronously from the play click", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const start = html.indexOf('const playListening=e.target.closest("[data-play-ea-listening]")');
  assert.notEqual(start, -1, "listening play handler exists");
  const end = html.indexOf('\n const ', start + 10);
  const handler = html.slice(start, end === -1 ? start + 6000 : end);
  assert.match(handler, /synth\.resume\(\)/, "resume a paused speech engine");
  assert.match(handler, /synth\.speak\(utterance\)/, "queue speech utterances");
  assert.doesNotMatch(handler, /await\s+new Promise/, "do not wait for voiceschanged before speaking");
  assert.match(handler, /\|\|null/, "support browsers that have not loaded a French voice list yet");
  assert.match(handler, /utterance\.lang=voice\?\.lang\|\|"fr-FR"/, "use French locale even without a French voice object");
  assert.match(handler, /utterance\.onend=speakNext/, "continue through every audio chunk");
  assert.match(handler, /utterance\.onerror=/, "surface browser speech errors and transcript fallback");
});
