/* MYP DESK — Individuals & Societies eAssessment practice.
   Original AI-generated practice based on the style and skills of released MYP papers. */
(() => {
"use strict";
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const criteria = {
 A:{name:"Knowing and understanding",focus:"Use subject knowledge, concepts, terminology and examples accurately to explain geographical, historical, economic and social processes."},
 B:{name:"Investigating",focus:"Formulate a focused research question, plan an investigation, select and use relevant sources, and consider the usefulness and limitations of evidence."},
 C:{name:"Communicating",focus:"Communicate information and ideas clearly for a specific purpose and audience, using appropriate structure, terminology, maps, graphs, tables, citations and conventions."},
 D:{name:"Thinking critically",focus:"Interpret and analyse sources, identify perspectives and assumptions, compare evidence, evaluate arguments and reach a justified conclusion."}
};
const topics=["Mixed I&S topics","History and historical change","Geography and global interactions","Resources and sustainability","Population and urban environments","Economics and development","Power, governance and conflict","Globalisation and interconnectedness"];
let currentPaper=null;
function markup(page="overview"){
 const title=page==="overview"?"Individuals & Societies":page==="full"?"Full practice paper":"Criterion "+page;
 const tabs=[["overview","Overview"],["A","Criterion A"],["B","Criterion B"],["C","Criterion C"],["D","Criterion D"],["full","Full paper"]];
 const selected=page==="overview"?"overview":page;
 const body=page==="overview"?overviewMarkup():generatorMarkup(page);
 return '<div class="is-shell"><div class="is-kicker"><span class="eyebrow">MYP 4–5 · INDIVIDUALS & SOCIETIES</span><span class="is-original-tag">ORIGINAL AI PRACTICE</span></div><div class="is-heading"><div><h1>Individuals &amp;<br>Societies<span>.</span></h1><p class="intro">Build your knowledge, investigate evidence, communicate clearly and think critically with original MYP-style practice.</p></div><div class="is-globe" aria-hidden="true">◎</div></div><div class="is-tabs" role="tablist" aria-label="Individuals and Societies criteria">'+tabs.map(([id,label])=>'<button type="button" class="is-tab '+(selected===id?"active":"")+'" role="tab" aria-selected="'+(selected===id)+'" data-is-tab="'+id+'">'+label+'</button>').join("")+'</div><div class="is-content">'+body+'</div><div class="is-footer"><span>INDIVIDUALS &amp; SOCIETIES · MYP 4–5</span><span>ORIGINAL AI-GENERATED PRACTICE · NOT AN OFFICIAL IB PAPER</span></div></div>';
}
function overviewMarkup(){
 return '<div class="is-intro-row"><div><div class="eyebrow">THE FOUR ASSESSMENT CRITERIA</div><h2>Know what each criterion tests.</h2><p>Choose a criterion to generate a focused 25-mark practice task, or create a complete 100-mark paper covering all four.</p></div><span class="is-mark-pill">100 MARKS · FULL PAPER</span></div><div class="is-criteria-grid">'+Object.entries(criteria).map(([key,item])=>'<button type="button" class="is-criterion-card" data-is-tab="'+key+'"><span class="is-card-top"><b>CRITERION '+key+'</b><i>↗</i></span><strong>'+esc(item.name)+'</strong><p>'+esc(item.focus)+'</p><span class="is-card-bottom">GENERATE 25-MARK PRACTICE →</span></button>').join("")+'</div><section class="is-full-callout"><div><span class="eyebrow">COMPLETE EXAM SIMULATION</span><h2>Put all four together.</h2><p>Generate a fresh, timed 100-mark paper with original sources, data, maps described in text and structured questions.</p></div><button type="button" class="is-primary" data-is-tab="full">Build full paper ↗</button></section><p class="is-method-note">The AI uses the structure, command terms and source-analysis approach associated with released MYP Individuals &amp; Societies eAssessment papers as a guide. It creates new material and does not reproduce past-paper questions.</p>';
}
function generatorMarkup(mode){
 const full=mode==="full",item=criteria[mode],name=full?"Full paper":item.name;
 return '<div class="is-generator-head"><div><span class="eyebrow">'+(full?"ALL FOUR CRITERIA":"CRITERION "+mode)+'</span><h2>'+esc(name)+'.</h2><p>'+(full?"A complete 100-mark practice examination with one task for each criterion.":"A focused 25-mark task designed to practise "+esc(item.name.toLowerCase())+".")+'</p></div><span class="is-mark-pill">'+(full?"100 MARKS · 120 MIN":"25 MARKS · 30 MIN")+'</span></div><div class="is-controls"><label>LEVEL<select id="is-level"><option>MYP 4</option><option selected>MYP 4–5</option><option>MYP 5</option></select></label><label>TOPIC<select id="is-topic">'+topics.map((t,i)=>'<option value="'+i+'">'+esc(t)+'</option>').join("")+'</select></label><button type="button" class="is-primary" data-is-generate="'+mode+'">Generate '+(full?"full paper":"criterion task")+' ↗</button></div><div id="is-results" class="is-results"><div class="is-empty"><strong>Your next I&amp;S challenge.</strong>Choose a level and topic, then generate original questions in the style of MYP eAssessment papers.</div></div>';
}
function renderPaper(paper){
 currentPaper=paper;
 return '<div class="is-paper-head"><span>'+esc(paper.level)+' · '+esc(paper.topicLabel)+' · '+paper.totalMarks+' MARKS · '+paper.durationMinutes+' MINUTES</span><h2>'+esc(paper.title)+'</h2><p>Original AI-generated practice. Read each source carefully, use evidence in your answers and respond to the command term.</p><div class="is-paper-criteria">'+paper.tasks.map(t=>'<span>CRITERION '+esc(t.criterion)+' <b>'+t.marks+' marks</b></span>').join("")+'</div></div>'+paper.tasks.map((task,ti)=>'<article class="is-task"><div class="is-task-top"><span>CRITERION '+esc(task.criterion)+' · '+esc(task.criterionName)+'</span><b>'+task.marks+' MARKS</b></div><h3>'+esc(task.title)+'</h3><div class="is-source"><span>'+esc(task.sourceTitle)+'</span><p>'+esc(task.sourceText)+'</p></div>'+task.questions.map((q,qi)=>'<section class="is-question"><div><span>QUESTION '+(qi+1)+' · '+esc(q.commandTerm)+'</span><b>'+q.marks+' MARKS</b></div><h4>'+esc(q.question)+'</h4><textarea rows="4" placeholder="Write your response here…" aria-label="Criterion '+task.criterion+' question '+(qi+1)+' response"></textarea><details><summary>What a strong answer should include</summary><ul>'+q.successCriteria.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></details></section>').join("")+'</article>').join("")+'<div class="is-paper-end"><span>END OF PRACTICE PAPER · CHECK YOUR ANSWERS AGAINST YOUR CLASS NOTES</span><button type="button" class="is-secondary" data-is-regenerate="'+paper.mode+'">Generate another version ↻</button></div>';
}
async function generate(button){
 const mode=button.dataset.isGenerate,root=document.getElementById("is-results");if(!root)return;
 const level=document.getElementById("is-level")?.value||"MYP 4–5",topic=topics[Number(document.getElementById("is-topic")?.value)||0]||topics[0];
 button.disabled=true;button.textContent="Generating…";
 root.innerHTML='<div class="is-loading"><span class="is-spinner"></span><strong>Building your practice paper…</strong><p>Creating original sources, questions and a checked mark structure.</p></div>';
 try{
  const response=await fetch(window.PARLER_AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"is_eassessment",mode,level,topic})});
  const data=await response.json();if(!response.ok||!data.paper)throw new Error(data.error||"The paper could not be generated.");
  root.innerHTML=renderPaper(data.paper);root.scrollIntoView({behavior:"smooth",block:"start"});
 }catch(error){root.innerHTML='<div class="is-empty"><strong>Paper generation failed.</strong>'+esc(error.message)+'<p>Check the AI service connection and try again.</p></div>'}
 finally{button.disabled=false;button.textContent="Generate "+(mode==="full"?"full paper":"criterion task")+" ↗"}
}
function handleClick(event){
 const tab=event.target.closest("[data-is-tab]");if(tab){const key=tab.dataset.isTab;const root=document.querySelector(".is-shell");if(root)root.outerHTML=markup(key);return}
 const generateButton=event.target.closest("[data-is-generate]");if(generateButton){generate(generateButton);return}
 const again=event.target.closest("[data-is-regenerate]");if(again){const button=document.querySelector("[data-is-generate]");if(button)generate(button)}
}
window.MYPIndividualsSocieties=Object.freeze({markup,handleClick});
})();