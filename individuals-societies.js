/* MYP DESK — Individuals & Societies eAssessment practice.
   Original AI-generated practice with separate History, Geography and Integrated Humanities pathways. */
(() => {
"use strict";
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const criteria = {
 A:{name:"Knowing and understanding",focus:"Use subject knowledge, concepts, terminology and examples accurately to explain historical, geographical, economic and social processes."},
 B:{name:"Investigating",focus:"Formulate a focused research question, plan an investigation, select and use relevant sources, and consider the usefulness and limitations of evidence."},
 C:{name:"Communicating",focus:"Communicate information and ideas clearly for a specific purpose and audience, using appropriate structure, terminology, maps, graphs, tables, citations and conventions."},
 D:{name:"Thinking critically",focus:"Interpret and analyse sources, identify perspectives and assumptions, compare evidence, evaluate arguments and reach a justified conclusion."}
};
const disciplines = {
 history:{label:"History",description:"Explore historical change, continuity, causes, consequences, perspectives and the interpretation of evidence.",topics:["Historical change and continuity","Causes and consequences of conflict","Power, empires and governance","Revolutions and social movements","Trade, exploration and cultural exchange","Historical sources and interpretations"]},
 geography:{label:"Geography",description:"Investigate places, spatial patterns, human and physical processes, environments and sustainability using maps and data.",topics:["Population and migration","Urban environments and settlement","Climate, ecosystems and hazards","Resources and sustainability","Development and inequality","Global interactions and trade"]},
 integrated:{label:"Integrated Humanities",description:"Connect history, geography, economics and politics to understand complex real-world issues from multiple perspectives.",topics:["Globalisation and interdependence","Economics, development and inequality","Power, governance and citizenship","Resources, sustainability and policy","Conflict, cooperation and human rights","Technology and social change"]}
};
let currentDiscipline="integrated";
function markup(page="overview"){
 const title=page==="overview"?"Individuals & Societies":page==="full"?"Full practice paper":"Criterion "+page;
 const tabs=[["overview","Overview"],["A","Criterion A"],["B","Criterion B"],["C","Criterion C"],["D","Criterion D"],["full","Full paper"]];
 const selected=page==="overview"?"overview":page;
 const body=page==="overview"?overviewMarkup():generatorMarkup(page);
 return '<div class="is-shell"><div class="is-kicker"><span class="eyebrow">MYP 4–5 · INDIVIDUALS &amp; SOCIETIES</span><span class="is-original-tag">ORIGINAL AI PRACTICE</span></div><div class="is-heading"><div><h1>Individuals &amp;<br>Societies<span>.</span></h1><p class="intro">Choose a discipline pathway, then practise the four MYP criteria with original source-based examinations.</p></div><div class="is-globe" aria-hidden="true">◎</div></div><div class="is-discipline-tabs" role="tablist" aria-label="I&S discipline pathways">'+Object.entries(disciplines).map(([key,item])=>'<button type="button" class="is-discipline-tab '+(currentDiscipline===key?"active":"")+'" role="tab" aria-selected="'+(currentDiscipline===key)+'" data-is-discipline="'+key+'">'+esc(item.label)+'</button>').join("")+'</div><div class="is-pathway-description">'+esc(disciplines[currentDiscipline].description)+'</div><div class="is-tabs" role="tablist" aria-label="Individuals and Societies criteria">'+tabs.map(([id,label])=>'<button type="button" class="is-tab '+(selected===id?"active":"")+'" role="tab" aria-selected="'+(selected===id)+'" data-is-tab="'+id+'">'+label+'</button>').join("")+'</div><div class="is-content">'+body+'</div><div class="is-footer"><span>INDIVIDUALS &amp; SOCIETIES · MYP 4–5</span><span>ORIGINAL AI-GENERATED PRACTICE · NOT AN OFFICIAL IB PAPER</span></div></div>';
}
function overviewMarkup(){
 const discipline=disciplines[currentDiscipline];
 return '<div class="is-intro-row"><div><div class="eyebrow">'+esc(discipline.label.toUpperCase())+' · FOUR ASSESSMENT CRITERIA</div><h2>Prepare by criterion.</h2><p>'+esc(discipline.description)+' Generate a focused 25-mark task for any criterion, or a complete 100-mark paper for this pathway.</p></div><span class="is-mark-pill">100 MARKS · FULL PAPER</span></div><div class="is-criteria-grid">'+Object.entries(criteria).map(([key,item])=>'<button type="button" class="is-criterion-card" data-is-tab="'+key+'"><span class="is-card-top"><b>CRITERION '+key+'</b><i>↗</i></span><strong>'+esc(item.name)+'</strong><p>'+esc(item.focus)+'</p><span class="is-card-bottom">GENERATE 25-MARK PRACTICE →</span></button>').join("")+'</div><section class="is-full-callout"><div><span class="eyebrow">'+esc(discipline.label.toUpperCase())+' · COMPLETE EXAM SIMULATION</span><h2>Put all four together.</h2><p>Generate a timed 100-mark '+esc(discipline.label)+' paper with original sources, data, maps where relevant and structured questions.</p></div><button type="button" class="is-primary" data-is-tab="full">Build full paper ↗</button></section><p class="is-method-note">The examination uses four 25-mark criterion tasks (100 marks total) as the MYP Desk practice blueprint. All sources and questions are newly generated; this is not an official IB paper.</p>';
}
function generatorMarkup(mode){
 const full=mode==="full",item=criteria[mode],discipline=disciplines[currentDiscipline],name=full?"Full "+discipline.label+" paper":item.name;
 const topics=discipline.topics;
 return '<div class="is-generator-head"><div><span class="eyebrow">'+esc(discipline.label.toUpperCase())+' · '+(full?"ALL FOUR CRITERIA":"CRITERION "+mode)+'</span><h2>'+esc(name)+'.</h2><p>'+(full?"A complete 100-mark practice examination with one task for each criterion.":"A focused 25-mark task designed to practise "+esc(item.name.toLowerCase())+" in "+esc(discipline.label)+".")+'</p></div><span class="is-mark-pill">'+(full?"100 MARKS · 120 MIN":"25 MARKS · 30 MIN")+'</span></div><div class="is-controls"><label>LEVEL<select id="is-level"><option>MYP 4</option><option selected>MYP 4–5</option><option>MYP 5</option></select></label><label>TOPIC<select id="is-topic">'+topics.map((t,i)=>'<option value="'+i+'">'+esc(t)+'</option>').join("")+'</select></label><button type="button" class="is-primary" data-is-generate="'+mode+'">Generate '+(full?"full paper":"criterion task")+' ↗</button></div><div id="is-results" class="is-results"><div class="is-empty"><strong>Your next '+esc(discipline.label)+' challenge.</strong>Choose a level and topic, then generate original questions in the style of MYP eAssessment papers.</div></div>';
}
function renderPaper(paper){
 return '<div class="is-paper-head"><span>'+esc(disciplines[currentDiscipline].label)+' · '+esc(paper.level)+' · '+esc(paper.topicLabel)+' · '+paper.totalMarks+' MARKS · '+paper.durationMinutes+' MINUTES</span><h2>'+esc(paper.title)+'</h2><p>Original AI-generated practice. Read each source carefully, use evidence in your answers and respond to the command term.</p><div class="is-paper-criteria">'+paper.tasks.map(t=>'<span>CRITERION '+esc(t.criterion)+' <b>'+t.marks+' marks</b></span>').join("")+'</div></div>'+paper.tasks.map((task,ti)=>'<article class="is-task"><div class="is-task-top"><span>CRITERION '+esc(task.criterion)+' · '+esc(task.criterionName)+'</span><b>'+task.marks+' MARKS</b></div><h3>'+esc(task.title)+'</h3><div class="is-source"><span>'+esc(task.sourceTitle)+'</span><p>'+esc(task.sourceText)+'</p></div>'+task.questions.map((q,qi)=>'<section class="is-question"><div><span>QUESTION '+(qi+1)+' · '+esc(q.commandTerm)+'</span><b>'+q.marks+' MARKS</b></div><h4>'+esc(q.question)+'</h4><textarea rows="4" placeholder="Write your response here…" aria-label="Criterion '+task.criterion+' question '+(qi+1)+' response"></textarea><details><summary>What a strong answer should include</summary><ul>'+q.successCriteria.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></details></section>').join("")+'</article>').join("")+'<div class="is-paper-end"><span>END OF PRACTICE PAPER · CHECK YOUR ANSWERS AGAINST YOUR CLASS NOTES</span><button type="button" class="is-secondary" data-is-regenerate="'+paper.mode+'">Generate another version ↻</button></div>';
}
async function generate(button){
 const mode=button.dataset.isGenerate,root=document.getElementById("is-results");if(!root)return;
 const level=document.getElementById("is-level")?.value||"MYP 4–5",topics=disciplines[currentDiscipline].topics,topic=topics[Number(document.getElementById("is-topic")?.value)||0]||topics[0];
 button.disabled=true;button.textContent="Generating…";
 root.innerHTML='<div class="is-loading"><span class="is-spinner"></span><strong>Building your '+esc(disciplines[currentDiscipline].label)+' paper…</strong><p>Creating original sources, questions and a checked mark structure.</p></div>';
 try{
  const response=await fetch(window.PARLER_AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"is_eassessment",mode,level,topic,discipline:currentDiscipline})});
  const data=await response.json();if(!response.ok||!data.paper)throw new Error(data.error||"The paper could not be generated.");
  root.innerHTML=renderPaper(data.paper);root.scrollIntoView({behavior:"smooth",block:"start"});
 }catch(error){root.innerHTML='<div class="is-empty"><strong>Paper generation failed.</strong>'+esc(error.message)+'<p>Check the AI service connection and try again.</p></div>'}
 finally{button.disabled=false;button.textContent="Generate "+(mode==="full"?"full paper":"criterion task")+" ↗"}
}
function handleClick(event){
 const discipline=event.target.closest("[data-is-discipline]");if(discipline){currentDiscipline=discipline.dataset.isDiscipline;if(!disciplines[currentDiscipline])currentDiscipline="integrated";const active=document.querySelector(".is-tab.active")?.dataset.isTab||"overview";const root=document.querySelector(".is-shell");if(root)root.outerHTML=markup(active);return}
 const tab=event.target.closest("[data-is-tab]");if(tab){const key=tab.dataset.isTab;const root=document.querySelector(".is-shell");if(root)root.outerHTML=markup(key);return}
 const generateButton=event.target.closest("[data-is-generate]");if(generateButton){generate(generateButton);return}
 const again=event.target.closest("[data-is-regenerate]");if(again){const button=document.querySelector("[data-is-generate]");if(button)generate(button)}
}
window.MYPIndividualsSocieties=Object.freeze({markup,handleClick});
})();