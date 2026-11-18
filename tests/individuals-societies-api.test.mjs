import assert from "node:assert/strict";
import handler from "../api/ai.js";

const originalFetch=globalThis.fetch;
const originalKey=process.env.GROQ_API_KEY;
const originalModel=process.env.GROQ_MODEL;
process.env.GROQ_API_KEY="test-key";
process.env.GROQ_MODEL="test-model";

function response(){
 const state={status:200,payload:null};
 return {state,status(code){state.status=code;return this;},setHeader(){},json(payload){state.payload=payload;return this;}};
}
const names={A:"Knowing and understanding",B:"Investigating",C:"Communicating",D:"Thinking critically"};
const source="This fictional case study describes a town experiencing rapid growth. It explains how new housing, transport links and employment opportunities have changed the area. It also includes residents' views about traffic, access to services and the loss of nearby farmland. The figures and viewpoints are invented for this practice exercise.";
function paper(mode){
 const criteria=mode==="full"?["A","B","C","D"]:[mode];
 return {title:"Original MYP Individuals and Societies practice",topicLabel:"Mixed I&S topics",level:"MYP 4–5",mode,totalMarks:criteria.length*25,tasks:criteria.map(criterion=>({
  criterion,criterionName:names[criterion],title:"Task "+criterion,marks:25,sourceTitle:"A growing town: fictional case study",sourceText:source,
  questions:[
   {question:"Identify one relevant feature in the source.",marks:5,commandTerm:"Identify",successCriteria:["Select an accurate detail from the source."]},
   {question:"Explain a factor contributing to the situation.",marks:10,commandTerm:"Explain",successCriteria:["Use evidence from the source.","Explain a relevant cause or consequence."]},
   {question:"Evaluate a possible response to the issue.",marks:10,commandTerm:"Evaluate",successCriteria:["Consider more than one perspective.","Reach a justified conclusion."]}
  ]
 }))
 };
}
try{
 for(const discipline of ["history","geography","integrated"]){
 for(const mode of ["full","A","B","C","D"]){
  globalThis.fetch=async(_url,options)=>{
   const request=JSON.parse(options.body);
   assert.match(request.messages[1].content,/released MYP I&S specimen\/past-paper assessments/);
   assert.match(request.messages[1].content,/Never reproduce/);
   assert.match(request.messages[1].content,new RegExp(discipline==="history"?"firmly historical":discipline==="geography"?"firmly geographical":"genuinely interdisciplinary humanities"));
   assert.equal(request.response_format.type,"json_schema");
   return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify(paper(mode))}}]})};
  };
  const result=response();
  await handler({method:"POST",body:{action:"is_eassessment",mode,topic:"Mixed I&S topics",level:"MYP 4–5",discipline}},result);
  assert.equal(result.state.status,200,mode+" paper should generate");
  assert.equal(result.state.payload.paper.tasks.length,mode==="full"?4:1);
  assert.equal(result.state.payload.paper.totalMarks,mode==="full"?100:25);
  assert.equal(result.state.payload.paper.tasks.every(task=>task.questions.reduce((sum,q)=>sum+q.marks,0)===25),true);
 }
 }
 console.log("PASS: History, Geography and Integrated Humanities full papers and individual A–D tasks validate source material, discipline-specific prompts, structure and 100/25-mark totals.");
} finally {
 globalThis.fetch=originalFetch;
 if(originalKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=originalKey;
 if(originalModel===undefined)delete process.env.GROQ_MODEL;else process.env.GROQ_MODEL=originalModel;
}
