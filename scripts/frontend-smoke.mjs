import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";

const html = fs.readFileSync("index.html", "utf8");
const inlineScripts = [];
let cursor = 0;
while (true) {
  const start = html.indexOf("<script", cursor);
  if (start < 0) break;
  const tagEnd = html.indexOf(">", start);
  const close = html.indexOf("</script>", tagEnd);
  if (tagEnd < 0 || close < 0) throw new Error("Malformed script tag in index.html");
  const openingTag = html.slice(start, tagEnd + 1);
  if (!openingTag.includes("src=")) inlineScripts.push(html.slice(tagEnd + 1, close));
  cursor = close + "</script>".length;
}
if (!inlineScripts.length) throw new Error("No inline application script found.");
for (const [index, code] of inlineScripts.entries()) {
  const check = spawnSync(process.execPath, ["--check"], { input: code, encoding: "utf8" });
  if (check.status !== 0) throw new Error(`Inline script ${index + 1} failed syntax check:\\n${check.stderr}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(pathToFileURL(process.cwd() + "/index.html").href);
  await page.locator("#pageContent .home-shell").waitFor();
  if (await page.locator("#pageContent .overview-card").count() !== 5) throw new Error("Home page should render five subject cards.");
  await page.locator('#navigation [data-page="subjects"]').click();
  await page.getByRole("heading", { name: "All subjects." }).waitFor();
  if (await page.locator("#pageContent .overview-card").count() !== 5) throw new Error("All Subjects page should render five subject cards.");
  for (const [target, heading] of [
    ["language-literature", "Language & Literature."],
    ["french", "French workspace."],
    ["individuals-societies", "Individuals & Societies."],
    ["sciences", "Sciences."],
    ["mathematics", "Mathematics."]
  ]) {
    await page.locator('#navigation [data-page="subjects"]').click();
    await page.locator('#pageContent [data-page="' + target + '"]').click();
    await page.getByRole("heading", { name: heading }).waitFor();
  }
  await page.locator('#navigation [data-page="subjects"]').click();
  await page.locator('#pageContent [data-page="sciences"]').click();
  if (await page.locator(".science-card").count() !== 3) throw new Error("Science page should show Biology, Chemistry and Physics.");
  for (const [target, heading] of [
    ["biology", "Biology."],
    ["chemistry", "Chemistry."],
    ["physics", "Physics."]
  ]) {
    await page.locator('#pageContent [data-page="' + target + '"]').click();
    await page.getByRole("heading", { name: heading }).waitFor();
    await page.locator('#pageContent [data-page="subjects"]').click();
    await page.locator('#pageContent [data-page="sciences"]').click();
  }
  await page.locator('#navigation [data-page="home"]').click();
  await page.locator("#pageContent .home-shell").waitFor();
  await page.locator('#pageContent [data-page="french"]').click();
  await page.getByRole("heading", { name: "French workspace." }).waitFor();
  await page.locator('#navigation [data-page="french-emergent"]').click();
  await page.getByRole("heading", { name: "Emergent." }).waitFor();
  for (const heading of ["Vocabulary · Vocabulaire","Conjugations · Conjugaison","Grammar · Grammaire"]) {
    await page.getByRole("heading", { name: heading }).waitFor();
  }
  if (await page.locator(".french-resource").count() !== 4) throw new Error("French workspace should have exactly four general skill sections.");
  if (await page.locator(".fd-card").count() !== 3) throw new Error("French workspace should render three flashcard decks.");
  if (await page.locator(".fd-progress").count() !== 3) throw new Error("Each French flashcard deck should show progress.");
  if (await page.locator(".grammar-lesson").count() < 40) throw new Error("French grammar should contain at least 40 expandable lessons.");
  if (await page.locator(".grammar-example").count() < 40) throw new Error("Every grammar lesson should include a worked example and translation.");
  const deckSizes = await page.evaluate(() => ({ vocab: window.frenchDecks.emvocab.length, conjugations: window.frenchDecks.emconjugation.length }));
  if (deckSizes.vocab < 200) throw new Error("French vocabulary should contain at least 200 flashcards.");
  if (deckSizes.conjugations < 600) throw new Error("French conjugations should contain at least 600 flashcards.");
  if (await page.locator(".grammar-lesson-body > p").first().textContent().then(x => x.length) < 180) throw new Error("Grammar lessons should include full explanations.");
  if (await page.locator(".reading-ai").count() !== 1) throw new Error("French should show the AI Reading Studio.");
  if (await page.locator(".french-vocab-item, .french-reading-item").count() !== 0) throw new Error("Static vocabulary tiles and static reading passages should be removed.");
  await page.locator(".fd-card").first().click();
  if (!(await page.locator(".fd-card").first().evaluate(el => el.classList.contains("flipped")))) throw new Error("Flashcard should flip to reveal its answer.");
  await page.locator("[data-french-rate=known]").first().click();
  if (!(await page.locator(".fd-progress").first().textContent()).includes("1 KNOWN")) throw new Error("Flashcard self-rating should update progress.");
  if (await page.locator("[data-listen], [data-speak]").count() !== 0) throw new Error("Listening and speaking should be deferred.");
  await page.locator('#navigation [data-page="french-capable"]').click();
  await page.getByRole("heading", { name: "Capable–Proficient." }).waitFor();
  if (await page.locator(".french-resource").count() !== 4) throw new Error("Capable–Proficient should also have four general skill sections.");
  if (await page.locator(".reading-ai").count() !== 1) throw new Error("Capable–Proficient should also have an AI Reading Studio.");
  const spacing=await page.locator("#pageContent").evaluate(el => getComputedStyle(el).paddingTop);
  if (parseFloat(spacing)<40) throw new Error("Study page spacing was not increased.");
  if (errors.length) throw new Error("Browser runtime errors: " + errors.join(" | "));
  console.log("PASS: startup, subject navigation, French flashcard flipping and self-rating, grammar lessons, AI Reading Studio, responsive layout.");
} finally {
  await browser.close();
}
