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
    ["french", "Choose your course."],
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
  await page.getByRole("heading", { name: "Choose your course." }).waitFor();
  await page.locator('#navigation [data-page="french-emergent"]').click();
  await page.getByRole("heading", { name: "Emergent." }).waitFor();
  if (await page.locator(".course-chapter").count() !== 6) throw new Error("Emergent course should show six units.");
  await page.locator(".course-chapter").first().locator("summary").click();
  await page.getByText("Vocabulary", { exact: false }).first().waitFor();
  if (await page.locator("[data-listen]").count() !== 6) throw new Error("Listening controls are missing.");
  if (await page.locator("[data-speak]").count() !== 6) throw new Error("Speaking controls are missing.");
  await page.locator('#navigation [data-page="french"]').click();
  await page.getByRole("heading", { name: "Choose your course." }).waitFor();
  await page.locator('#navigation [data-page="french-capable"]').click();
  await page.getByRole("heading", { name: "Capable–Proficient." }).waitFor();
  if (await page.locator(".course-chapter").count() !== 6) throw new Error("Capable–Proficient course should show six units.");
  if (errors.length) throw new Error("Browser runtime errors: " + errors.join(" | "));
  console.log("PASS: startup, home subject cards, All Subjects cards, subject navigation, sidebar navigation, both six-unit French courses, listening/speaking controls.");
} finally {
  await browser.close();
}
