import assert from "node:assert/strict";
import handler from "../api/ai.js";

const originalFetch=globalThis.fetch;
const originalKey=process.env.GROQ_API_KEY;
const originalModel=process.env.GROQ_MODEL;
let activeMode="full";
process.env.GROQ_API_KEY="test-key";
process.env.GROQ_MODEL="test-model";
function response(){const state={status:200,payload:null};return {state,status(code){state.status=code;return this;},setHeader(){},json(payload){state.payload=payload;return this;}};}
const source="This fictional source pack describes a town undergoing rapid change. It contains a short background account, two residents' contrasting viewpoints, a small set of clearly labelled fictional figures and information about the organisations involved. Students can use it to formulate a research question, consider appropriate methods, communicate findings for an audience and analyse the strengths and limitations of the evidence. All details are invented for this practice paper.";
const success=["Use accurate evidence from the supplied source.","Explain the reasoning and connect it to the question."];
const markscheme=["Award credit for a relevant, accurate point supported by source evidence.","Award credit for a clear explanation, justified reasoning or suitable example."];
function q(criterion,marks,question){return {criterion,marks,question,commandTerm:"Explain",successCriteria:success,markscheme};}
function task(taskId,taskName,marks,criterionMarks,questions){
 return {taskId,taskName,marks,criterionMarks,title:taskName+" task",sourceTitle:"Fictional source pack: a changing town",sourceText:source,questions};
}
function paper(mode){
 let tasks;
 if(mode==="full")tasks=[
  task("investigating","Investigating",26,{A:6,B:20,C:0,D:0},[q("A",6,"Explain one relevant concept using the source."),q("B",10,"Formulate a focused research question and justify it."),q("B",10,"Develop a feasible action plan using appropriate methods and sources.")]),
  task("communicating","Communicating",18,{A:6,B:0,C:12,D:0},[q("A",6,"Explain relevant subject knowledge from the source."),q("C",6,"Identify an appropriate audience, purpose and format."),q("C",6,"Communicate the findings in the required format.")]),
  task("thinking","Thinking critically",36,{A:8,B:0,C:8,D:20},[q("A",8,"Explain a relevant concept and apply it to the issue."),q("C",8,"Organise a clear and coherent argument."),q("D",10,"Analyse the origin, purpose, value or limitation of a source."),q("D",10,"Evaluate contrasting perspectives and reach a justified conclusion.")])
 ];
 else if(["investigating","communicating","thinking"].includes(mode)){
  tasks=paper("full").tasks.filter(t=>t.taskId===mode);
 }else{
  const criterion=mode.slice(-1),marks={A:0,B:0,C:0,D:0};marks[criterion]=20;
  tasks=[task("criterion-"+criterion,"Criterion "+criterion+" practice",20,marks,[q(criterion,6,"Explain a relevant point."),q(criterion,7,"Analyse evidence from the source."),q(criterion,7,"Justify a conclusion using evidence.")])];
 }
 return {title:"Original MYP I&S practice examination",topicLabel:"Changing communities",level:"MYP 4–5",mode,totalMarks:tasks.reduce((n,t)=>n+t.marks,0),tasks};
}
try{
 for(const discipline of ["history","geography","integrated"]){
  for(const mode of ["full","investigating","communicating","thinking","criterion-A","criterion-B","criterion-C","criterion-D"]){
   globalThis.fetch=async(_url,options)=>{
    const request=JSON.parse(options.body),prompt=request.messages[1].content;
    assert.match(prompt,/80 marks/);
    assert.match(prompt,/INVESTIGATING = 26 marks/);
    assert.match(prompt,/COMMUNICATING = 18 marks/);
    assert.match(prompt,/THINKING CRITICALLY = 36 marks/);
    if(request.mode==="full"||request.mode==="investigating") assert.match(prompt,/Exactly 5 questions in this order: Criterion A = 2 marks, Criterion A = 4 marks, Criterion B = 5 marks, Criterion B = 5 marks, Criterion B = 10 marks/);
    if(request.mode==="full"||request.mode==="communicating") assert.match(prompt,/Exactly 5 questions in this order: Criterion A = 2 marks, Criterion A = 4 marks, Criterion C = 4 marks, Criterion C = 4 marks, Criterion C = 4 marks/);
    if(request.mode==="full"||request.mode==="thinking") assert.match(prompt,/Exactly 7 questions in this order: Criterion A = 4 marks, Criterion A = 4 marks, Criterion C = 4 marks, Criterion C = 4 marks, Criterion D = 5 marks, Criterion D = 5 marks, Criterion D = 10 marks/);
    if(request.mode.startsWith("criterion-")) assert.match(prompt,/Exactly 4 questions, each worth 5 marks/);
    assert.match(prompt,/Never reproduce/);
    assert.match(prompt,new RegExp(discipline==="history"?"Keep all content historical":discipline==="geography"?"Keep all content geographical":"genuinely interdisciplinary humanities"));
    assert.equal(request.response_format.type,"json_schema");
    return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify(paper(mode))}}]})};
   };
   const result=response();
   await handler({method:"POST",body:{action:"is_eassessment",mode,topic:"Changing communities",level:"MYP 4–5",discipline}},result);
   assert.equal(result.state.status,200,discipline+" "+mode+" should generate: "+JSON.stringify(result.state.payload));
   const generated=result.state.payload.paper;
   assert.equal(generated.totalMarks,mode==="full"?80:["investigating","communicating","thinking"].includes(mode)?({investigating:26,communicating:18,thinking:36}[mode]):20);
   if(mode==="full"){
    assert.deepEqual(generated.tasks.map(t=>t.taskId),["investigating","communicating","thinking"]);
    assert.deepEqual(generated.tasks.map(t=>t.marks),[26,18,36]);
    const totals={A:0,B:0,C:0,D:0};generated.tasks.forEach(t=>Object.entries(t.criterionMarks).forEach(([c,m])=>totals[c]+=m));
    assert.deepEqual(totals,{A:20,B:20,C:20,D:20});
   }
   assert.ok(generated.tasks.every(t=>t.questions.reduce((sum,item)=>sum+item.marks,0)===t.marks));
   assert.ok(generated.tasks.every(t=>t.questions.every(item=>item.markscheme.length>=2)));
  }
 }
 // Verify harmless AI label variations are canonicalized rather than rejected.
 globalThis.fetch=async(_url,options)=>{
  const request=JSON.parse(options.body),generated=paper(activeMode);
  if(request.mode==="full"){
   generated.tasks[0].taskId="Task A";
   generated.tasks[1].taskId="Task B";
   generated.tasks[2].taskId="Task C";
  }else if(request.mode==="criterion-A"){
   generated.tasks[0].taskId="";
   generated.tasks[0].taskName="Criterion A practice";
  }
  return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify(generated)}}]})};
 };
 for(const mode of ["full","criterion-A"]){
  activeMode=mode;
  const result=response();
  await handler({method:"POST",body:{action:"is_eassessment",mode,topic:"Changing communities",level:"MYP 4–5",discipline:"integrated"}},result);
  assert.equal(result.state.status,200,"equivalent labels should be accepted: "+JSON.stringify(result.state.payload));
  if(mode==="full")assert.deepEqual(result.state.payload.paper.tasks.map(t=>t.taskId),["investigating","communicating","thinking"]);
  else assert.equal(result.state.payload.paper.tasks[0].taskId,"criterion-A");
 }
 console.log("PASS: all three I&S pathways validate full 80-mark papers, 26/18/36 task marks, A/B/C/D criterion totals, three individual task generators and four 20-mark criterion drills.");
}finally{
 globalThis.fetch=originalFetch;
 if(originalKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=originalKey;
 if(originalModel===undefined)delete process.env.GROQ_MODEL;else process.env.GROQ_MODEL=originalModel;
}
