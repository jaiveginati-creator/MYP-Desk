import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("French listening uses one utterance for the complete passage", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const start = html.indexOf('const playListening=e.target.closest("[data-play-ea-listening]")');
  assert.notEqual(start, -1, "listening play handler exists");
  const end = html.indexOf("\n const submitObjective=", start + 10);
  const handler = html.slice(start, end === -1 ? start + 7000 : end);

  assert.match(handler, /synth\.resume\(\)/, "resume a paused speech engine");
  assert.match(handler, /new SpeechSynthesisUtterance\(script\)/, "speak the complete passage in one request");
  assert.match(handler, /synth\.speak\(utterance\)/, "send the utterance to speech synthesis");
  assert.doesNotMatch(handler, /chunks|chunks\.forEach|sentences/, "do not split and queue multiple utterances");
  assert.doesNotMatch(handler, /synth\.cancel\(\);\s*synth\.resume/, "do not cancel immediately before starting playback");
  assert.match(handler, /utterance\.lang=voice\?\.lang\|\|"fr-FR"/, "use French locale if no French voice object is available");
  assert.match(handler, /utterance\.onstart=/, "track actual audio start");
  assert.match(handler, /expectedMinimum/, "do not report completion for an instant onend event");
  assert.match(handler, /utterance\.onerror=/, "surface browser speech errors");
  assert.match(handler, /The browser ended audio before it was actually played/, "explain premature browser completion");
});
