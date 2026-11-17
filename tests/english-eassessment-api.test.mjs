import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ai.js";

function recorder(){return {statusCode:200,payload:null,headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(payload){this.payload=payload;return this}}}
function task(number,type,marks){
 const analysing=type==="Analysing";
 return {
  taskNumber:number,type,title:"Original practice task",marks,
  instructions:"Read the supplied sources and complete the task.",
  sources:analysing?[
   {title:"A written extract",format:"Literary extract",content:"An original short passage about belonging and change."},
   {title:"A visual sequence",format:"Multimedia description",content:"A detailed description of a short visual sequence showing a community response."}
  ]:[{title:"Prompt",format:"Visual prompt description",content:"An original scene showing a quiet street after a storm."}],
  questions:analysing?[
   {id:"1a",question:"Identify one choice.",marks:2,responseType:"short",commandTerm:"Identify",wordTarget:"",audience:"",purpose:"",genre:"",successCriteria:["Use evidence"]},
   {id:"1b",question:"Explain one effect.",marks:2,responseType:"short",commandTerm:"Explain",wordTarget:"",audience:"",purpose:"",genre:"",successCriteria:["Explain effect"]},
   {id:"1c",question:"Analyse a technique.",marks:3,responseType:"short",commandTerm:"Analyse",wordTarget:"",audience:"",purpose:"",genre:"",successCriteria:["Analyse choice"]},
   {id:"1d",question:"Explain a connection.",marks:3,responseType:"short",commandTerm:"Explain",wordTarget:"",audience:"",purpose:"",genre:"",successCriteria:["Use detail"]},
   {id:"1e",question:"Compare and contrast the sources.",marks:20,responseType:"extended",commandTerm:"Compare and contrast",wordTarget:"350–400 words",audience:"Examiner",purpose:"Analyse",genre:"Comparative response",successCriteria:["Compare both sources","Use evidence"]}
  ]:[{id:String(number)+"a",question:"Write an original response.",marks,responseType:"writing",commandTerm:"Create",wordTarget:"350–400 words",audience:"Specified audience",purpose:"Communicate",genre:analysing?"":"Creative or non-literary text",successCriteria:["Use deliberate structure","Control language"]}]
 };
}
function mockFetch(payload,inspect){
 return async(url,options)=>{const request=JSON.parse(options.body);inspect?.(request);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(payload)}}]}),{status:200,headers:{"Content-Type":"application/json"}})};
}
async function withAI(run){
 const previousKey=process.env.GROQ_API_KEY,previousFetch=globalThis.fetch;
 process.env.GROQ_API_KEY="test-key";
 try{return await run()}finally{globalThis.fetch=previousFetch;if(previousKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=previousKey}
}

test("generates a validated Type 1 English analysis task",async()=>{
 const paper={title:"Belonging and the public space",theme:"Identities and relationships",taskType:"type1",durationMinutes:70,totalMarks:30,tasks:[task(1,"Analysing",30)]};
 await withAI(async()=>{
  let prompt="";
  globalThis.fetch=mockFetch(paper,request=>{
   prompt=request.messages[1].content;
   assert.equal(request.response_format.type,"json_schema");
   assert.equal(request.response_format.json_schema.strict,true);
   assert.deepEqual(request.response_format.json_schema.schema.required,["title","theme","taskType","durationMinutes","totalMarks","tasks"]);
  });
  const res=recorder();
  await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.paper.tasks[0].questions.length,5);
  assert.equal(res.payload.paper.totalMarks,30);
  assert.equal(res.payload.paper.durationMinutes,70);
  assert.match(prompt,/four shorter analysis questions/);
  assert.match(prompt,/NEVER copy or closely paraphrase/);
 });
});

test("generates the complete 80-mark, three-task English assessment",async()=>{
 const paper={title:"The changing city",theme:"Globalization and sustainability",taskType:"full",durationMinutes:120,totalMarks:80,tasks:[task(1,"Analysing",30),task(2,"Producing literary text",20),task(3,"Producing non-literary text",30)]};
 await withAI(async()=>{
  globalThis.fetch=mockFetch(paper,request=>assert.match(request.messages[1].content,/120 minutes and 80 marks/));
  const res=recorder();
  await handler({method:"POST",body:{action:"english_eassessment",taskType:"full",level:"MYP 4–5",theme:"Globalization and sustainability"}},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.paper.tasks.length,3);
  assert.deepEqual(res.payload.paper.tasks.map(t=>t.marks),[30,20,30]);
  assert.equal(res.payload.paper.durationMinutes,120);
 });
});

test("returns English feedback capped at the question's available marks",async()=>{
 await withAI(async()=>{
  globalThis.fetch=mockFetch({score:99,maxScore:20,strengths:["Clear comparison"],improvements:["Use evidence from both sources"],feedback:"A strong response."},request=>{
   assert.match(request.messages[1].content,/comparative analysis/);
   assert.match(request.messages[1].content,/not an official IB mark/);
  });
  const res=recorder();
  await handler({method:"POST",body:{action:"english_eassessment_mark",taskType:"Analysing",taskTitle:"Compare texts",question:"Compare and contrast the sources.",marks:20,commandTerm:"Compare and contrast",response:"Both texts explore belonging in different ways, using imagery and dialogue."}},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.assessment.score,20);
  assert.equal(res.payload.assessment.maxScore,20);
 });
});
