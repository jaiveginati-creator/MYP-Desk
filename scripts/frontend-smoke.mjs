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


const apiSyntax = spawnSync(process.execPath, ["--check", "api/ai.js"], { encoding: "utf8" });
if (apiSyntax.status !== 0) throw new Error("AI API failed syntax check:\\n" + apiSyntax.stderr);
const englishSyntax = spawnSync(process.execPath, ["--check", "english-assessment.js"], { encoding: "utf8" });
if (englishSyntax.status !== 0) throw new Error("English assessment frontend failed syntax check:\n" + englishSyntax.stderr);
const scienceSyntax = spawnSync(process.execPath, ["--check", "science.js"], { encoding: "utf8" });
if (scienceSyntax.status !== 0) throw new Error("Science frontend failed syntax check:\n" + scienceSyntax.stderr);
const isSyntax = spawnSync(process.execPath, ["--check", "individuals-societies.js"], { encoding: "utf8" });
if (isSyntax.status !== 0) throw new Error("Individuals & Societies frontend failed syntax check:\n" + isSyntax.stderr);
const apiTests = spawnSync(process.execPath, ["--test"], { encoding: "utf8" });
if (apiTests.status !== 0) throw new Error("E-assessment API tests failed:\\n" + apiTests.stdout + apiTests.stderr);

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
  if (!(await page.locator('#navigation [data-page="language-literature"]').isVisible())) throw new Error("Sidebar should include Language & Literature.");
  for (const [target, heading] of [
    ["language-literature", "English e-assessment prep."],
    ["french", "French workspace."],
    ["individuals-societies", "Individuals & Societies."],
    ["sciences", "Sciences."],
    ["mathematics", "Mathematics."]
  ]) {
    await page.locator('#navigation [data-page="subjects"]').click();
    await page.locator('#pageContent [data-page="' + target + '"]').click();
    await page.getByRole("heading", { name: heading }).waitFor();
    if (target === "individuals-societies") {
      await page.locator(".is-shell").waitFor();
      if (await page.locator(".is-criterion-card").count() !== 4) throw new Error("I&S overview should show four separate criterion sections.");
      if (await page.locator(".is-tab").count() !== 6) throw new Error("I&S should have overview, four criteria and a full-paper section.");
      if (await page.locator(".is-discipline-tab").count() !== 3) throw new Error("I&S should offer History, Geography and Integrated Humanities pathways.");
      await page.evaluate(() => {
        window.fetch = async (_url, options) => {
          const request = JSON.parse(options.body);
          if (!["history","geography","integrated"].includes(request.discipline)) throw new Error("I&S generation must include the selected discipline.");
          const criteria = request.mode === "full" ? ["A","B","C","D"] : [request.mode];
          const names = {A:"Knowing and understanding",B:"Investigating",C:"Communicating",D:"Thinking critically"};
          const tasks = criteria.map(criterion => ({criterion,criterionName:names[criterion],title:"Practice task "+criterion,marks:25,sourceTitle:"Sample source",sourceText:"This is an original fictional case study with enough contextual information for students to interpret the situation, identify evidence and answer the related questions. It is included only to test the paper renderer.",questions:[{question:"Identify one important feature shown in the source.",marks:5,commandTerm:"Identify",successCriteria:["Select a relevant detail"]},{question:"Explain a factor that contributed to the situation.",marks:10,commandTerm:"Explain",successCriteria:["Use evidence from the source","Explain a relevant cause or consequence"]},{question:"Evaluate the significance of the issue.",marks:10,commandTerm:"Evaluate",successCriteria:["Consider more than one perspective","Reach a justified conclusion"]}]}));
          return {ok:true,json:async()=>({paper:{title:"Mock I&S practice paper",topicLabel:request.topic,level:request.level,mode:request.mode,totalMarks:criteria.length*25,durationMinutes:request.mode==="full"?120:30,tasks}})};
        };
      });
      for (const [discipline,label] of [["history","History"],["geography","Geography"],["integrated","Integrated Humanities"]]) {
        await page.locator('[data-is-discipline="' + discipline + '"]').click();
        if (!(await page.locator(".is-pathway-description").textContent()).length) throw new Error(label+" pathway should explain its subject focus.");
        await page.locator('[data-is-tab="full"]').click();
        const options = await page.locator("#is-topic option").allTextContents();
        if (!options.length) throw new Error(label+" should provide its own topic list.");
        await page.locator('[data-is-generate="full"]').click();
        await page.locator(".is-paper-head").waitFor();
        if (await page.locator(".is-task").count() !== 4) throw new Error(label+" full paper should contain all four criteria.");
        if (!(await page.locator(".is-paper-head").textContent()).includes(label)) throw new Error(label+" paper should identify its selected discipline.");
      }
      await page.locator('[data-is-discipline="integrated"]').click();
      await page.locator('[data-is-tab="overview"]').click();
      for (const criterion of ["A","B","C","D"]) {
        await page.locator('.is-tab[data-is-tab="' + criterion + '"]').click();
        if (!(await page.locator('[data-is-generate="' + criterion + '"]').isVisible())) throw new Error("Criterion "+criterion+" should provide its own AI paper generator.");
        await page.locator('[data-is-generate="' + criterion + '"]').click();
        await page.locator(".is-paper-head").waitFor();
        if (await page.locator(".is-task").count() !== 1) throw new Error("Criterion "+criterion+" should generate one 25-mark task.");
      }
      await page.locator('[data-is-tab="full"]').click();
      await page.locator('[data-is-generate="full"]').click();
      await page.locator(".is-paper-head").waitFor();
      if (await page.locator(".is-task").count() !== 4) throw new Error("The full I&S paper should contain all four criteria.");
      if (await page.locator(".is-question textarea").count() !== 12) throw new Error("The full I&S paper should render answer spaces for all questions.");
      if (!(await page.locator(".is-paper-head").textContent()).includes("100 MARKS")) throw new Error("The full I&S paper should total 100 marks.");
    }
    if (target === "language-literature") {
      if (await page.locator("[data-eng-tab]").count() !== 4) throw new Error("English workspace should have four assessment tabs.");
      for (const tab of ["type1", "type2", "type3", "full"]) {
        await page.locator("[data-eng-tab=\"" + tab + "\"]").click();
        if (!(await page.locator("#eng-generate").isVisible())) throw new Error("Each English tab should provide an AI generation action.");
      }
      const timingPreview = {
        title:"Timed practice preview",theme:"Identities and relationships",durationMinutes:120,totalMarks:80,
        tasks:[
          {taskNumber:1,type:"Analysing",title:"Analysis",marks:30,instructions:"Complete the analysis.",sources:[],questions:[]},
          {taskNumber:2,type:"Producing literary text",title:"Literary writing",marks:20,instructions:"Write creatively.",sources:[],questions:[]},
          {taskNumber:3,type:"Producing non-literary text",title:"Non-literary writing",marks:30,instructions:"Write for an audience.",sources:[],questions:[]}
        ]
      };
      await page.evaluate(paper => {
        document.querySelector("#eng-results").innerHTML = window.EnglishAssessment.renderPaper(paper);
      }, timingPreview);
      if (!(await page.locator("#eng-submit-all").isVisible())) throw new Error("A full assessment should provide one final submit-and-grade action.");
      if (!(await page.locator("#eng-timer-clock").isVisible())) throw new Error("English assessment should show a countdown timer.");
      if (!(await page.locator("#eng-timer").textContent()).includes("35 min short responses + 35 min comparison")) throw new Error("Full-paper timer should show the recommended Task 1 timing split.");
      await page.locator("#eng-timer-toggle").click();
      if (await page.locator("#eng-timer-toggle").textContent() !== "Pause timer") throw new Error("Timer should start and switch to pause state.");
      await page.locator("#eng-timer-reset").click();
      if (await page.locator("#eng-timer-toggle").textContent() !== "Start timer") throw new Error("Timer reset should pause the countdown.");
    }
  }
  await page.locator('#navigation [data-page="subjects"]').click();
  await page.locator('#pageContent [data-page="sciences"]').click();
  if (await page.locator(".science-card").count() !== 3) throw new Error("Science page should show Biology, Chemistry and Physics.");
  for (const [target, heading, units] of [
    ["biology", "Biology.", 11],
    ["chemistry", "Chemistry.", 12],
    ["physics", "Physics.", 12]
  ]) {
    await page.locator('#pageContent [data-page="' + target + '"]').click();
    await page.getByRole("heading", { name: heading }).waitFor();
    if (await page.locator(".science-unit").count() !== units) throw new Error(target + " should contain the Hodder chapter list.");
    await page.locator(".science-lesson-card").first().click();
    if (!(await page.locator("#scienceLessonView").isVisible())) throw new Error(target + " lessons should open an explanation and understanding check.");
    if (await page.locator("#scienceLessonView li").count() < 2) throw new Error(target + " lesson should include key ideas.");
    await page.locator("[data-close-science-lesson]").first().click();
    await page.locator('#navigation [data-page="sciences"]').click();
  }
  await page.locator('#pageContent [data-page="science-eassessment"]').click();
  await page.getByRole("heading", { name: "E-assessment prep." }).waitFor();
  if (!(await page.locator('[data-science-generate="full"]').isVisible())) throw new Error("Science e-assessment prep should generate a full AI paper.");
  if (await page.locator("#science-ai-subject option").count() !== 4) throw new Error("Science AI practice should offer biology, chemistry, physics and mixed disciplines.");
  await page.locator('#pageContent [data-page="science-ad"]').click();
  await page.getByRole("heading", { name: "Criteria A & D practice." }).waitFor();
  if (!(await page.locator('[data-science-generate="ad"]').isVisible())) throw new Error("Criteria A & D should provide AI-generated practice.");
  await page.locator('#navigation [data-page="science-bc"]').click();
  await page.getByRole("heading", { name: "Criteria B & C practice." }).waitFor();
  if (!(await page.locator('[data-science-generate="bc"]').isVisible())) throw new Error("Criteria B & C should provide AI-generated practice.");
  await page.locator('#navigation [data-page="home"]').click();
  await page.locator("#pageContent .home-shell").waitFor();
  await page.locator('#pageContent [data-page="french"]').click();
  await page.getByRole("heading", { name: "French workspace." }).waitFor();
  await page.locator('#navigation [data-page="french-emergent"]').click();
  await page.getByRole("heading", { name: "Emergent." }).waitFor();
  for (const [tab, heading, panel] of [
    ["vocabulary","Vocabulary · Vocabulaire","vocabulary"],
    ["conjugations","Conjugations · Conjugaison","conjugations"],
    ["grammar","Grammar · Grammaire","grammar"],
    ["reading","AI Reading Studio · Compréhension","reading"],
    ["eassessment","E-Assessment Prep · Préparation","eassessment"]
  ]) {
    await page.locator('[data-french-skill-tab="' + tab + '"]').click();
    await page.locator('[data-skill-panel="' + panel + '"]').waitFor({state:"visible"});
    await page.getByRole("heading", { name: heading }).waitFor();
    if (await page.locator('[data-skill-panel]:visible').count() !== 1) throw new Error("Only the selected French skill tab should be visible.");
  }
  await page.locator('[data-french-skill-tab="vocabulary"]').click();
  if (await page.locator(".french-resource").count() !== 5) throw new Error("French workspace should have five study sections including e-assessment preparation.");
  if (await page.locator(".fd-card").count() !== 3) throw new Error("French workspace should render vocabulary, conjugation and grammar decks.");
  if (await page.locator(".fd-progress").count() !== 3) throw new Error("Each French flashcard deck should show progress.");
  if (await page.locator(".grammar-lesson").count() !== 50) throw new Error("French grammar should contain exactly 50 expandable lessons.");
  if (await page.locator(".grammar-example").count() !== 50) throw new Error("Every grammar lesson should include a worked example and translation.");
  const deckSizes = await page.evaluate(() => ({
    vocab: window.frenchDecks.emvocab.length,
    verbs: window.MYP_FRENCH_EXPANSION.verbs.length,
    tenses: Object.fromEntries(window.MYP_FRENCH_EXPANSION.tenses.map(t => [t.key, window.frenchDecks["emconj-" + t.key].length]))
  }));
  if (deckSizes.vocab < 5000) throw new Error("French vocabulary should contain at least 5,000 cards.");
  const vocabSearch = page.locator("[data-french-search=emvocab]");
  await vocabSearch.fill("maison");
  if (!(await page.locator("[data-deck-root=emvocab] .fd-card strong").textContent()).includes("maison")) throw new Error("Vocabulary search should find words without requiring their article.");
  if (deckSizes.verbs < 2500) throw new Error("French conjugations should cover at least 2,500 verbs.");
  if (Object.keys(deckSizes.tenses).length !== 5 || Object.values(deckSizes.tenses).some(n => n < 2500)) throw new Error("Each core tense should cover at least 2,500 verbs.");
  if (await page.locator(".conjugation-tab").count() !== 5) throw new Error("French conjugations should have five switchable tense tabs.");
  await page.locator('[data-french-skill-tab="conjugations"]').click();
  const search = page.locator("[data-french-search=emconj-present]");
  await search.fill("parler");
  const conjugationAnswer = await page.locator("[data-deck-root=emconj-present] .fd-answer").textContent();
  if (!conjugationAnswer.includes("je parle")) throw new Error("Present conjugation should show all subject forms.");
  await page.locator('[data-conjugation-tab="passeCompose"]').click();
  if (await page.locator("[data-deck-root=emconj-passeCompose] .fd-card strong").textContent() !== "parler") throw new Error("Switching tense tabs should keep the same selected verb.");
  const compoundAnswer = await page.locator("[data-deck-root=emconj-passeCompose] .fd-answer").textContent();
  if (!compoundAnswer.includes("j'ai parlé")) throw new Error("The passé composé tab should show the selected verb's conjugation.");
  await page.locator('[data-french-skill-tab="grammar"]').click();
  if (await page.locator(".grammar-lesson-body > p").first().textContent().then(x => x.length) < 180) throw new Error("Grammar lessons should include full explanations.");
  await page.locator('[data-french-skill-tab="reading"]').click();
  if (await page.locator(".reading-ai:visible").count() !== 1) throw new Error("French should show the AI Reading Studio when its tab is selected.");
  await page.locator('[data-french-skill-tab="eassessment"]').click();
  if (await page.locator('[data-skill-panel="eassessment"]:visible').count() !== 1) throw new Error("French should show the e-assessment preparation panel when its tab is selected.");
  if (await page.locator(".ea-controls select").count() !== 2) throw new Error("E-assessment prep should offer proficiency level and theme controls.");
  if (!(await page.locator("[data-generate-eassessment]").isVisible())) throw new Error("E-assessment prep should provide a generate-paper action.");
  if (await page.locator(".french-vocab-item, .french-reading-item").count() !== 0) throw new Error("Static vocabulary tiles and static reading passages should be removed.");
  await page.locator('[data-french-skill-tab="vocabulary"]').click();
  await page.locator(".fd-card").first().click();
  if (!(await page.locator(".fd-card").first().evaluate(el => el.classList.contains("flipped")))) throw new Error("Flashcard should flip to reveal its answer.");
  await page.locator("[data-french-rate=known]").first().click();
  if (!(await page.locator(".fd-progress").first().textContent()).includes("1 KNOWN")) throw new Error("Flashcard self-rating should update progress.");
  if (await page.locator("[data-listen], [data-speak]").count() !== 0) throw new Error("Listening and speaking should be deferred.");
  await page.locator('#navigation [data-page="french-capable"]').click();
  await page.getByRole("heading", { name: "Capable–Proficient." }).waitFor();
  if (await page.locator(".french-resource").count() !== 5) throw new Error("Capable–Proficient should also have five study sections.");
  if (await page.locator(".reading-ai").count() !== 1) throw new Error("Capable–Proficient should also have an AI Reading Studio.");
  const spacing=await page.locator("#pageContent").evaluate(el => getComputedStyle(el).paddingTop);
  if (parseFloat(spacing)<40) throw new Error("Study page spacing was not increased.");
  if (errors.length) throw new Error("Browser runtime errors: " + errors.join(" | "));
  console.log("PASS: startup, subject navigation, 5,000 vocabulary cards, 2,500+ verbs across five tenses, conjugation search, 50 grammar lessons, flashcards, AI Reading Studio, responsive layout.");
} finally {
  await browser.close();
}
