import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("French listening queues all chunks without cancelling the fresh queue", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const start = html.indexOf('const playListening=e.target.closest("[data-play-ea-listening]")');
  assert.notEqual(start, -1, "listening play handler exists");
  const end = html.indexOf('\n const ', start + 10);
  const handler = html.slice(start, end === -1 ? start + 7000 : end);
  assert.match(handler, /synth\.resume\(\)/, "resume a paused speech engine");
  assert.match(handler, /chunks\.forEach/, "queue every audio chunk up front");
  assert.match(handler, /synth\.speak\(utterance\)/, "send each chunk to speech synthesis");
  assert.doesNotMatch(handler, /synth\.cancel\(\);\s*synth\.resume/, "do not cancel immediately before starting playback");
  assert.match(handler, /utterance\.lang=voice\?\.lang\|\|"fr-FR"/, "use French locale if no French voice object is available");
  assert.match(handler, /utterance\.onstart=/, "track actual audio start");
  assert.match(handler, /expectedMinimum/, "do not report completion for instant onend events");
  assert.match(handler, /utterance\.onerror=/, "surface browser speech errors");
  assert.match(handler, /The browser ended audio before it was actually played/, "explain premature browser completion");
});
