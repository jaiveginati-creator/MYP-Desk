/* MYP DESK — English Language & Literature eAssessment practice */
(() => {
"use strict";
const API=()=>window.PARLER_AI_API_URL;
const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tabs=[
 {id:"type1",label:"TYPE 1",title:"Analysing",sub:"Short responses + compare and contrast",marks:"30 MARKS"},
 {id:"type2",label:"TYPE 2",title:"Literary text",sub:"Creative writing from a visual prompt",marks:"20 MARKS"},
 {id:"type3",label:"TYPE 3",title:"Non-literary text",sub:"Purposeful writing for a real audience",marks:"30 MARKS"},
 {id:"full",label:"FULL PAPER",title:"Full assessment",sub:"All three tasks in exam conditions",marks:"80 MARKS"}
];
const themes=["Identities and relationships","Orientation in space and time","Personal and cultural expression","Scientific and technical innovation","Globalization and sustainability","Fairness and development"];
let activeTab="type1",lastPaper=null;
let timerInterval=null,timerRemaining=0,timerTotal=0,timerRunning=false;
const recommendedMinutes={type1:70,type2:35,type3:15,full:120};
function stopTimer(){if(timerInterval!==null){clearInterval(timerInterval);timerInterval=null}timerRunning=false}
function resetTimer(){stopTimer();timerTotal=(recommendedMinutes[activeTab]||120)*60;timerRemaining=timerTotal;updateTimerUI()}
function formatTime(seconds){const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;return [h,m,s].map(v=>String(v).padStart(2,"0")).join(":")}
function updateTimerUI(){
 const clock=document.getElementById("eng-timer-clock"),bar=document.getElementById("eng-timer-progress"),state=document.getElementById("eng-timer-state"),toggle=document.getElementById("eng-timer-toggle"),wrap=document.getElementById("eng-timer");
 if(!clock||!bar||!state||!toggle||!wrap)return;
 clock.textContent=formatTime(timerRemaining);
 bar.style.width=(timerTotal?Math.max(0,timerRemaining/timerTotal*100):0)+"%";
 wrap.classList.toggle("warning",timerRemaining<=300&&timerRemaining>0);
 wrap.classList.toggle("expired",timerRemaining===0);
 toggle.textContent=timerRunning?"Pause timer":"Start timer";
 state.textContent=timerRemaining===0?"Time is up — review your response.":timerRunning?"Timer running":"Timer paused";
}
function toggleTimer(){
 if(timerRunning){stopTimer();updateTimerUI();return}
 if(timerRemaining<=0)resetTimer();
 timerRunning=true;
 timerInterval=setInterval(()=>{
  timerRemaining=Math.max(0,timerRemaining-1);
  if(timerRemaining===0)stopTimer();
  updateTimerUI();
 },1000);
 updateTimerUI();
}
function timerMarkup(){
 let split="Task 1: 35 min short responses + 35 min comparison · Task 2: 35 min literary writing · Task 3: 15 min non-literary writing.";
 if(activeTab==="type1")split="Suggested split: 35 min for the four short responses, then 35 min for the extended comparison.";
 if(activeTab==="type2")split="Suggested time: 35 min for planning, writing and checking your literary text.";
 if(activeTab==="type3")split="Suggested time: 15 min for planning, writing and checking your non-literary text.";
 return '<div class="eng-timer" id="eng-timer"><div class="eng-timer-top"><div><span class="eng-timer-label">IB-STYLE SUGGESTED TIMING</span><div class="eng-timer-clock" id="eng-timer-clock">'+formatTime(timerRemaining)+'</div><span class="eng-timer-state" id="eng-timer-state">Timer paused</span></div><div class="eng-timer-actions"><button type="button" class="btn" id="eng-timer-toggle">Start timer</button><button type="button" class="btn secondary" id="eng-timer-reset">Reset</button></div></div><div class="eng-timer-track"><span id="eng-timer-progress"></span></div><p>'+split+'</p><small>Approximate practice guidance, not a compulsory IB rule. The full paper remains 120 minutes.</small></div>';
}
function markup(){
 return `<div class="english-assessment">
 <div class="eyebrow">MYP 4 & MYP 5 · LANGUAGE & LITERATURE</div>
 <h1>English e-assessment prep.</h1>
 <p class="intro">Practise the three MYP eAssessment tasks with original AI-generated texts, prompts and questions. Generate a focused task or a complete timed paper.</p>
 <div class="eng-overview"><div class="eng-stat"><strong>3</strong><span>Assessment tasks</span></div><div class="eng-stat"><strong>80</strong><span>Total marks</span></div><div class="eng-stat"><strong>120 min</strong><span>Full paper duration</span></div></div>
 <div class="eng-tabs" role="tablist" aria-label="English assessment task type">${tabs.map(t=>`<button type="button" class="eng-tab ${t.id===activeTab?"active":""}" role="tab" aria-selected="${t.id===activeTab}" data-eng-tab="${t.id}"><span>${t.label} · ${t.marks}</span><strong>${t.title}</strong></button>`).join("")}</div>
 <div class="eng-panel">
 <div class="eng-panel-head"><div><h2 id="eng-panel-title">${tabs.find(t=>t.id===activeTab).title} practice.</h2><p id="eng-panel-sub">${tabs.find(t=>t.id===activeTab).sub}. Questions follow the published MYP Language & Literature assessment framework.</p></div><span class="eng-tag">GROQ AI · ORIGINAL PRACTICE</span></div>
 <div class="eng-config"><div><label for="eng-level">Level</label><select id="eng-level"><option>MYP 4</option><option selected>MYP 4–5</option><option>MYP 5</option></select></div><div><label for="eng-theme">Global context</label><select id="eng-theme">${themes.map(t=>`<option>${t}</option>`).join("")}<option>Surprise me</option></select></div></div>
 <div class="eng-generate-row"><button type="button" class="btn" id="eng-generate">Generate ${activeTab==="full"?"full assessment":"practice task"} ↗</button><span class="eng-note" id="eng-status" aria-live="polite">Fresh unseen texts and original prompts are generated each time.</span></div>
 </div>
 <div class="eng-results" id="eng-results"><div class="eng-empty"><strong>Ready to practise.</strong>Choose a task above and generate an original MYP-style practice set. Your generated paper will appear here.</div></div>
 <div class="page-footer">MYP DESK · ENGLISH LANGUAGE & LITERATURE · PRACTICE, NOT AN OFFICIAL IB PAPER</div>
 </div>`;
}
function setTab(id){
 if(!tabs.some(t=>t.id===id))return;stopTimer();activeTab=id;
 const title=document.getElementById("eng-panel-title"),sub=document.getElementById("eng-panel-sub"),btn=document.getElementById("eng-generate");
 const t=tabs.find(x=>x.id===id);
 document.querySelectorAll("[data-eng-tab]").forEach(b=>{const on=b.dataset.engTab===id;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
 if(title)title.textContent=t.title+".";
 if(sub)sub.textContent=t.sub+". Questions follow the published MYP Language & Literature assessment framework.";
 if(btn)btn.textContent="Generate "+(id==="full"?"full assessment":"practice task")+" ↗";
 const status=document.getElementById("eng-status");if(status)status.textContent="Fresh unseen texts and original prompts are generated each time.";
 const results=document.getElementById("eng-results");if(results)results.innerHTML='<div class="eng-empty"><strong>'+escapeHTML(t.title)+' practice.</strong>Generate a new set of original questions for this task.</div>';
 lastPaper=null;
 resetTimer();
}
function renderSource(source){
 return '<div class="eng-source"><div class="eng-source-top"><strong>'+escapeHTML(source.title)+'</strong><span>'+escapeHTML(source.format)+'</span></div><p>'+escapeHTML(source.content)+'</p></div>';
}
function renderQuestion(q,taskIndex,questionIndex){
 const id="eng-answer-"+taskIndex+"-"+questionIndex;
 const target=q.wordTarget?'<small>Suggested length: '+escapeHTML(q.wordTarget)+'</small>':'<small>Answer in complete sentences and use evidence from the source where relevant.</small>';
 return '<article class="eng-question" data-eng-question="'+taskIndex+'-'+questionIndex+'"><div class="eng-question-top"><span>QUESTION '+escapeHTML(q.id||String(questionIndex+1))+(q.commandTerm?" · "+escapeHTML(q.commandTerm.toUpperCase()):"")+'</span><strong>'+Number(q.marks||0)+' MARKS</strong></div><h4>'+escapeHTML(q.question)+'</h4><textarea id="'+id+'" data-eng-answer placeholder="Write your response here…"></textarea><div class="eng-question-actions">'+target+'<button type="button" class="btn secondary" data-eng-mark="'+taskIndex+'-'+questionIndex+'">Get AI feedback</button></div><div class="eng-feedback" data-eng-feedback hidden></div></article>';
}
function renderPaper(paper){
 if(!paper||!Array.isArray(paper.tasks)||!paper.tasks.length)throw new Error("The AI returned an incomplete assessment.");
 let html='<div class="eng-paper-head"><span>'+escapeHTML(paper.durationMinutes)+' MINUTES · '+escapeHTML(paper.totalMarks)+' MARKS</span><h2>'+escapeHTML(paper.title)+'</h2><p>Global context: '+escapeHTML(paper.theme)+'. Original practice material generated for this session. Complete the questions in order.</p></div>';
 html+=timerMarkup();
 paper.tasks.forEach((task,ti)=>{
 const typeKey=String(task.type||"").toLowerCase();
 const taskMinutes=typeKey.includes("analys")?70:typeKey.includes("non-literary")?15:35;
 html+='<section class="eng-task"><div class="eng-task-top"><span>TASK '+escapeHTML(task.taskNumber)+' · '+escapeHTML(task.type.toUpperCase())+'</span><strong>'+Number(task.marks||0)+' MARKS · ~'+taskMinutes+' MIN</strong></div><h3>'+escapeHTML(task.title)+'</h3><p class="eng-instructions">'+escapeHTML(task.instructions)+'</p>';
 (task.sources||[]).forEach(source=>{html+=renderSource(source)});
 (task.questions||[]).forEach((q,qi)=>{html+=renderQuestion(q,ti,qi)});
 html+='</section>';
 });
 if(paper.tasks.length===3&&Number(paper.totalMarks)===80){
  html+='<section class="eng-submit-all"><div class="eng-submit-copy"><span>FINAL SUBMISSION</span><h3>Ready to submit your full assessment?</h3><p>AI will assess every response, calculate your total out of 80 and provide an indicative MYP 1–7 band.</p></div><button type="button" class="btn" id="eng-submit-all">Submit full assessment ↗</button><div id="eng-overall-result" aria-live="polite"></div></section>';
 }
 return html;
}
async function generate(){
 const button=document.getElementById("eng-generate"),status=document.getElementById("eng-status"),results=document.getElementById("eng-results");
 if(!button||!status||!results)return;
 const level=document.getElementById("eng-level").value,theme=document.getElementById("eng-theme").value;
 button.disabled=true;button.textContent="Generating…";status.textContent="Creating unseen texts, questions and writing prompts…";results.innerHTML='<div class="eng-loading">The AI is building your paper and checking the task structure. This can take a little while.</div>';
 try{
  const response=await fetch(API(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"english_eassessment",taskType:activeTab,level,theme})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Assessment generation failed.");
  if(!data.paper)throw new Error("The AI did not return a complete paper.");
  lastPaper=data.paper;resetTimer();results.innerHTML=renderPaper(data.paper);status.textContent="Your practice paper is ready. Work through the tasks and request feedback on each response.";
 }catch(error){results.innerHTML='<div class="eng-empty"><strong>Could not generate the paper.</strong>'+escapeHTML(error.message||"Please try again.")+'</div>';status.textContent="Generation failed."}
 finally{button.disabled=false;button.textContent="Generate "+(activeTab==="full"?"full assessment":"practice task")+" ↗"}
}
async function mark(taskIndex,questionIndex,button){
 if(!lastPaper)return;
 const task=lastPaper.tasks[taskIndex],q=task?.questions?.[questionIndex],textarea=document.getElementById("eng-answer-"+taskIndex+"-"+questionIndex),feedback=document.querySelector('[data-eng-question="'+taskIndex+"-"+questionIndex+'"] [data-eng-feedback]');
 if(!q||!textarea||!feedback)return;
 const response=textarea.value.trim();if(response.length<15){feedback.hidden=false;feedback.textContent="Write a little more before requesting feedback.";return}
 button.disabled=true;button.textContent="Assessing…";feedback.hidden=false;feedback.textContent="Reviewing your response against the task and MYP criteria…";
 try{
  const res=await fetch(API(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"english_eassessment_mark",level:document.getElementById("eng-level").value,taskType:task.type,taskTitle:task.title,question:q.question,marks:q.marks,commandTerm:q.commandTerm,successCriteria:q.successCriteria||[],sources:(task.sources||[]).map(s=>s.content).join("\n\n"),response})});
  const data=await res.json();if(!res.ok)throw new Error(data.error||"Feedback request failed.");
  const a=data.assessment;if(!a)throw new Error("The AI returned no assessment.");
  feedback.innerHTML=assessmentFeedbackHTML(a,q.marks);
 }catch(error){feedback.textContent="Could not assess this response: "+error.message}
 finally{button.disabled=false;button.textContent="Get AI feedback"}
}
function assessmentFeedbackHTML(a,maxScore){
 const score=Number(a.score)||0;
 return '<strong>Estimated practice score: '+score+' / '+Number(a.maxScore||maxScore)+'</strong>\n'+escapeHTML(a.feedback)+'\n\nSTRENGTHS\n• '+(a.strengths||[]).map(escapeHTML).join('\n• ')+'\n\nNEXT STEPS\n• '+(a.improvements||[]).map(escapeHTML).join('\n• ');
}
function practiceBand(percent){
 if(percent<10)return 1;
 if(percent<25)return 2;
 if(percent<40)return 3;
 if(percent<55)return 4;
 if(percent<70)return 5;
 if(percent<85)return 6;
 return 7;
}
async function submitFullAssessment(button){
 if(!lastPaper||!Array.isArray(lastPaper.tasks)||lastPaper.tasks.length!==3)return;
 const resultRoot=document.getElementById("eng-overall-result");
 if(!resultRoot)return;
 button.disabled=true;button.textContent="Grading all responses…";
 resultRoot.innerHTML='<div class="eng-overall-loading">Assessing each response against its question and available marks. Please keep this page open.</div>';
 const taskResults=[];
 let totalScore=0,totalMax=0;
 try{
  for(let ti=0;ti<lastPaper.tasks.length;ti++){
   const task=lastPaper.tasks[ti],questions=Array.isArray(task.questions)?task.questions:[];
   let taskScore=0,taskMax=0;
   for(let qi=0;qi<questions.length;qi++){
    const q=questions[qi],max=Number(q.marks)||0;
    const input=document.getElementById("eng-answer-"+ti+"-"+qi);
    const feedback=document.querySelector('[data-eng-question="'+ti+"-"+qi+'"] [data-eng-feedback]');
    const response=input?input.value.trim():"";
    taskMax+=max;totalMax+=max;
    let assessment;
    if(response.length<15){
     assessment={score:0,maxScore:max,feedback:response?"This response is too short to assess reliably. Develop your answer with relevant explanation and evidence.":"No response submitted. This question receives 0 in this practice calculation.",strengths:[],improvements:["Complete the response and support your ideas with specific evidence."]};
    }else{
     if(feedback){feedback.hidden=false;feedback.textContent="AI is assessing this response…"}
     const res=await fetch(API(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"english_eassessment_mark",level:document.getElementById("eng-level").value,taskType:task.type,taskTitle:task.title,question:q.question,marks:max,commandTerm:q.commandTerm,successCriteria:q.successCriteria||[],sources:(task.sources||[]).map(s=>s.content).join("\n\n"),response})});
     const data=await res.json();
     if(!res.ok)throw new Error(data.error||("Grading failed for Task "+(ti+1)+", Question "+(qi+1)+"." ));
     if(!data.assessment)throw new Error("The AI returned no assessment for Task "+(ti+1)+", Question "+(qi+1)+".");
     assessment=data.assessment;
    }
    const rawScore=Number(assessment.score);
    const score=Math.max(0,Math.min(max,Number.isFinite(rawScore)?rawScore:0));
    assessment.score=score;assessment.maxScore=max;
    taskScore+=score;totalScore+=score;
    if(feedback){feedback.hidden=false;feedback.innerHTML=assessmentFeedbackHTML(assessment,max)}
   }
   taskResults.push({title:task.title||("Task "+(ti+1)),score:taskScore,max:taskMax});
  }
  const percent=totalMax?Math.round(totalScore/totalMax*100):0;
  const band=practiceBand(percent);
  resultRoot.innerHTML='<div class="eng-overall-card"><div class="eng-overall-top"><div><span>YOUR FULL ASSESSMENT RESULT</span><p>Estimated total score</p></div><div class="eng-band">BAND '+band+'</div></div><div class="eng-overall-score"><strong>'+Number(totalScore.toFixed(1))+'</strong><span>/ '+totalMax+'</span><em>'+percent+'%</em></div><div class="eng-overall-breakdown">'+taskResults.map((r,i)=>'<div><span>Task '+(i+1)+' · '+escapeHTML(r.title)+'</span><strong>'+Number(r.score.toFixed(1))+' / '+r.max+'</strong></div>').join("")+'</div><p class="eng-band-note">Indicative practice band only. The percentage-to-band conversion is a guide for revision and is not an official IB grade boundary.</p></div>';
  button.textContent="Assessment graded ✓";
 }catch(error){
  resultRoot.innerHTML='<div class="eng-overall-error"><strong>Grading could not be completed.</strong><p>'+escapeHTML(error.message||"Please try submitting again.")+'</p><small>Any individual feedback already completed remains visible. You can retry the full submission.</small></div>';
  button.textContent="Retry full assessment ↗";
  button.disabled=false;
  return;
 }
 button.disabled=false;
}
function handleClick(event){
 if(event.target.closest("#eng-timer-toggle")){toggleTimer();return}
 if(event.target.closest("#eng-timer-reset")){resetTimer();return}
 const tab=event.target.closest("[data-eng-tab]");if(tab){setTab(tab.dataset.engTab);return}
 if(event.target.closest("#eng-generate")){generate();return}
 const submitButton=event.target.closest("#eng-submit-all");if(submitButton){submitFullAssessment(submitButton);return}
 const markButton=event.target.closest("[data-eng-mark]");if(markButton){const parts=markButton.dataset.engMark.split("-").map(Number);mark(parts[0],parts[1],markButton)}
}
window.EnglishAssessment=Object.freeze({markup,handleClick,renderPaper});
})();