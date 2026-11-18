import assert from "node:assert/strict";
import handler from "../api/ai.js";
const originalFetch=globalThis.fetch,originalKey=process.env.GROQ_API_KEY,originalModel=process.env.GROQ_MODEL;
process.env.GROQ_API_KEY="test-key";process.env.GROQ_MODEL="test-model";
function res(){const state={status:200,payload:null};return {state,status(code){state.status=code;return this;},setHeader(){},json(payload){state.payload=payload;return this;}};}
function paper(mode){
 const criteria=mode==="full"?["A","B","C","D"]:mode==="ad"?["A","D"]:["B","C"];
 return {title:"Test science paper",subject:"biology",subjectLabel:"Biology",level:"MYP 4–5",mode,totalMarks:criteria.length*25,tasks:criteria.map(criterion=>({criterion,criterionName:"Criterion "+criterion,title:"Task "+criterion,marks:25,scenario:"A detailed scientific context explains the real-world problem, the relevant scientific background and why the investigation or application matters. Students can use the information here alongside the supplied evidence to develop and justify their answers.",data:criterion==="C"?"Light intensity (units) | Rate (units)\n10 | 2.1\n20 | 3.8\n30 | 5.2\n40 | 6.0\n50 | 6.1":"A labelled source description and relevant observations are supplied for this task.",questions:[{question:"Interpret the scientific information and identify the key pattern.",marks:5,commandTerm:"Interpret",successCriteria:["Use evidence"]},{question:"Explain the scientific reasoning behind the pattern.",marks:6,commandTerm:"Explain",successCriteria:["Accurate science"]},{question:"Apply the science to a changed or unfamiliar situation.",marks:7,commandTerm:"Apply",successCriteria:["Apply concept"]},{question:"Evaluate the evidence and justify a conclusion.",marks:7,commandTerm:"Evaluate",successCriteria:["Reasoned judgement"]}]}))};
}
const explanation="This section develops the scientific idea carefully. It defines the important terms, explains the process in a logical sequence and connects each stage to the underlying scientific principles. A concrete example shows how the concept can be applied, while the final sentences explain why the idea matters in a wider scientific context. Students should be able to use this explanation to interpret unfamiliar information and construct a reasoned answer.";
const lesson={objectives:["Describe the process","Explain the mechanism","Apply the idea to evidence"],overview:"A detailed overview introduces the topic, explains why it matters and links its main concepts together. It establishes the scientific context before the lesson develops each idea in sequence.",sections:[1,2,3,4].map(n=>({heading:"Concept "+n,explanation})),keyTerms:[1,2,3,4].map(n=>({term:"Term "+n,definition:"A clear scientific definition that explains the term and its role in the topic."})),visualModel:"Draw a labelled flow diagram showing the inputs, process and outputs. Add arrows to show the direction of transfer and annotate each stage.",workedExample:"Start with the known information. Identify the scientific relationship, substitute the values and show each step with the correct units. Explain what the result means in the context of the question.",commonMisconception:"A common misunderstanding is to confuse the input with the energy or matter transferred during the process. The correction is to identify what is conserved, what changes and what evidence supports that distinction.",examPractice:[{question:"Explain the relationship shown in the supplied data.",marks:5,answerOutline:"Describe the pattern, quote relevant values and explain the scientific reason."},{question:"Evaluate one limitation of the method.",marks:4,answerOutline:"Identify a limitation and explain how it affects reliability or validity."}],checkQuestion:"Apply the concept to a new situation and explain your reasoning.",modelAnswer:"The result follows because the relevant scientific factor changes the process. The evidence supports this explanation."};
try{
 for(const mode of ["full","ad","bc"]){
  let calls=0;
  globalThis.fetch=async(_url,options)=>{calls++;const prompt=JSON.parse(options.body).messages[1].content;assert.match(prompt,/released MYP Sciences eAssessment/);assert.match(prompt,/100 marks/);assert.match(prompt,/25 marks/);return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify(paper(mode))}}]})};};
  const result=res();await handler({method:"POST",body:{action:"science_eassessment",mode,subject:"biology",level:"MYP 4–5"}},result);
  assert.equal(result.state.status,200,mode+" should generate");
  assert.equal(result.state.payload.paper.tasks.length,mode==="full"?4:2);
  assert.equal(result.state.payload.paper.totalMarks,mode==="full"?100:50);
  assert.equal(result.state.payload.paper.durationMinutes,mode==="full"?120:60);
  assert.ok(result.state.payload.paper.tasks.every(task=>task.marks===25&&task.questions.reduce((n,q)=>n+q.marks,0)===25));
  assert.equal(calls,1);
 }
 let calls=0;
 globalThis.fetch=async(_url,options)=>{calls++;assert.match(JSON.parse(options.body).messages[1].content,/5–6 ordered concept sections/);return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify(lesson)}}]})};};
 const lessonResult=res();await handler({method:"POST",body:{action:"science_lesson",subject:"biology",level:"MYP 4–5",title:"Photosynthesis",summary:"Plants capture light energy.",points:["Chlorophyll absorbs light.","Carbon dioxide and water make glucose and oxygen."]}},lessonResult);
 assert.equal(lessonResult.state.status,200);
 assert.equal(lessonResult.state.payload.lesson.sections.length,4);
 assert.equal(lessonResult.state.payload.lesson.keyTerms.length,4);
 assert.equal(lessonResult.state.payload.lesson.examPractice.length,2);
 assert.equal(calls,1);
 let markCalls=0;
 globalThis.fetch=async(_url,options)=>{markCalls++;assert.match(JSON.parse(options.body).messages[1].content,/Available marks: 25/);return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify({score:25,strengths:["Clear reasoning"],improvements:[],feedback:"Strong response."})}}]})};};
 const markResult=res();await handler({method:"POST",body:{action:"science_eassessment_mark",level:"MYP 5",subject:"biology",criterion:"A",criterionName:"Knowing and understanding",taskTitle:"Task A",scenario:"Scientific context",data:"Data",question:"Explain the result.",marks:25,commandTerm:"Explain",successCriteria:["Scientific reasoning"],response:"The result occurs because the process changes in response to the variable."}},markResult);
 assert.equal(markResult.state.status,200);
 assert.equal(markResult.state.payload.assessment.maxScore,25);
 assert.equal(markResult.state.payload.assessment.score,25);
 assert.equal(markCalls,1);
 console.log("PASS: full/A&D/B&C 100/50-mark blueprint, expanded lesson schema, and 25-mark criterion feedback.");
}finally{
 globalThis.fetch=originalFetch;
 if(originalKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=originalKey;
 if(originalModel===undefined)delete process.env.GROQ_MODEL;else process.env.GROQ_MODEL=originalModel;
}
