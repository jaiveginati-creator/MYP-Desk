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
function queueFetch(queue,inspect){
  let call=0;
  return async(url,options)=>{
    const request=JSON.parse(options.body);
    inspect?.(request,call);
    const next=queue[call];
    call++;
    if(!next)throw new Error("Unexpected extra Groq call ("+call+")");
    if(next.errorStatus){
      return new Response(JSON.stringify({error:{message:next.errorMessage||"Schema validation failed"}}),{status:next.errorStatus,headers:{"Content-Type":"application/json"}});
    }
    const content=typeof next.raw==="string"?next.raw:JSON.stringify(next.payload);
    return new Response(JSON.stringify({choices:[{message:{content}}]}),{status:200,headers:{"Content-Type":"application/json"}});
  };
}
async function withAI(run){
  const previousKey=process.env.GROQ_API_KEY,previousFetch=globalThis.fetch;
  process.env.GROQ_API_KEY="test-key";
  try{return await run()}finally{globalThis.fetch=previousFetch;if(previousKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=previousKey}
}

test("generates a validated Type 1 English analysis task",async()=>{
  const paperTask=task(1,"Analysing",30);
  await withAI(async()=>{
    let prompt="",schemaName="";
    globalThis.fetch=queueFetch([{payload:paperTask}],request=>{
      prompt=request.messages[1].content;
      assert.equal(request.response_format.type,"json_schema");
      assert.equal(request.response_format.json_schema.strict,true);
      assert.equal(request.response_format.json_schema.name,"english_eassessment_task");
      assert.deepEqual(request.response_format.json_schema.schema.required,["taskNumber","type","title","marks","instructions","sources","questions"]);
      schemaName=request.response_format.json_schema.name;
    });
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.tasks[0].questions.length,5);
    assert.equal(res.payload.paper.totalMarks,30);
    assert.equal(res.payload.paper.durationMinutes,70);
    assert.equal(res.payload.paper.tasks[0].taskNumber,1);
    assert.equal(schemaName,"english_eassessment_task");
    assert.match(prompt,/four shorter analysis questions/);
    assert.match(prompt,/NEVER copy or closely paraphrase/);
  });
});

test("generates a validated Type 2 literary writing task",async()=>{
  const paperTask=task(1,"Producing literary text",20);
  await withAI(async()=>{
    globalThis.fetch=queueFetch([{payload:paperTask}]);
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type2",level:"MYP 4–5",theme:"Orientation in space and time"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.tasks.length,1);
    assert.equal(res.payload.paper.tasks[0].questions.length,1);
    assert.equal(res.payload.paper.tasks[0].questions[0].marks,20);
    assert.equal(res.payload.paper.totalMarks,20);
    assert.equal(res.payload.paper.durationMinutes,35);
  });
});

test("generates a validated Type 3 non-literary writing task",async()=>{
  const paperTask=task(1,"Producing non-literary text",30);
  await withAI(async()=>{
    globalThis.fetch=queueFetch([{payload:paperTask}]);
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type3",level:"MYP 5",theme:"Fairness and development"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.tasks.length,1);
    assert.equal(res.payload.paper.tasks[0].questions.length,1);
    assert.equal(res.payload.paper.tasks[0].questions[0].marks,30);
    assert.equal(res.payload.paper.totalMarks,30);
    assert.equal(res.payload.paper.durationMinutes,15);
  });
});

test("assembles the complete 80-mark, three-task English assessment from per-task generations",async()=>{
  const tasks=[task(1,"Analysing",30),task(2,"Producing literary text",20),task(3,"Producing non-literary text",30)];
  await withAI(async()=>{
    let calls=0;let sawFullPaperPrompt=false;
    globalThis.fetch=queueFetch(tasks.map(payload=>({payload})),request=>{
      calls++;
      if(/120 minutes and 80 marks/.test(request.messages[1].content))sawFullPaperPrompt=true;
    });
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"full",level:"MYP 4–5",theme:"Globalization and sustainability"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(calls,3);
    assert.equal(sawFullPaperPrompt,true);
    assert.equal(res.payload.paper.tasks.length,3);
    assert.deepEqual(res.payload.paper.tasks.map(t=>t.marks),[30,20,30]);
    assert.deepEqual(res.payload.paper.tasks.map(t=>t.taskNumber),[1,2,3]);
    assert.deepEqual(res.payload.paper.tasks.map(t=>t.type),["Analysing","Producing literary text","Producing non-literary text"]);
    assert.equal(res.payload.paper.totalMarks,80);
    assert.equal(res.payload.paper.durationMinutes,120);
    assert.equal(res.payload.paper.taskType,"full");
  });
});

test("rejects a task whose questions property is missing, after one retry",async()=>{
  const broken={...task(1,"Producing literary text",20)};
  delete broken.questions;
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{payload:broken},{payload:broken}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type2",level:"MYP 4–5",theme:"Fairness and development"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,502);
    assert.match(res.payload.error,/questions/i);
  });
});

test("recovers when the model omits questions on the first attempt and returns them on retry",async()=>{
  const broken={...task(1,"Producing literary text",20)};
  delete broken.questions;
  const valid=task(1,"Producing literary text",20);
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{payload:broken},{payload:valid}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type2",level:"MYP 4–5",theme:"Fairness and development"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.tasks[0].questions.length,1);
  });
});

test("returns 502 for malformed model output (not valid JSON)",async()=>{
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{raw:"```json\n{not json"},{raw:"definitely not json"}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,502);
    assert.match(res.payload.error,/English task 1/);
  });
});

test("enforces exact task count: a failing middle task fails the full paper with a clear error",async()=>{
  const tasks=[task(1,"Analysing",30),{...task(2,"Producing literary text",20),questions:[{id:"2a",question:"Prompt?",marks:10,responseType:"writing",commandTerm:"Create",wordTarget:"",audience:"",purpose:"",genre:"",successCriteria:[]}]},task(3,"Producing non-literary text",30)];
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{payload:tasks[0]},{payload:tasks[1]},{payload:tasks[1]}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"full",level:"MYP 4–5",theme:"Fairness and development"}},res);
    assert.equal(calls,3);
    assert.equal(res.statusCode,502);
    assert.match(res.payload.error,/English task 2/);
  });
});

test("enforces question-mark totals: analysing questions that do not add to 30 marks are rejected twice then fail",async()=>{
  const bad=task(1,"Analysing",30);
  bad.questions[4]={...bad.questions[4],marks:15};
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{payload:bad},{payload:bad}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,502);
    assert.match(res.payload.error,/do not add up|mark total/i);
  });
});

test("retries a Groq strict-schema rejection and recovers on the next attempt",async()=>{
  const valid=task(1,"Analysing",30);
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{errorStatus:400,errorMessage:"jsonschema failed_generation: missing properties: tasks[0].questions"},{payload:valid}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.totalMarks,30);
  });
});

test("returns 502 with the Groq schema error when both attempts are rejected by strict-schema validation",async()=>{
  await withAI(async()=>{
    let calls=0;
    globalThis.fetch=queueFetch([{errorStatus:400,errorMessage:"jsonschema failed_generation: missing properties: questions"},{errorStatus:400,errorMessage:"jsonschema failed_generation: missing properties: questions"}],()=>{calls++});
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(calls,2);
    assert.equal(res.statusCode,502);
    assert.match(res.payload.error,/questions/i);
  });
});

test("normalizes model-supplied task labels to the canonical requested task type",async()=>{
  const mislabeled={...task(1,"Analysing",30),type:"Producing non-literary text"};
  await withAI(async()=>{
    globalThis.fetch=queueFetch([{payload:mislabeled}]);
    const res=recorder();
    await handler({method:"POST",body:{action:"english_eassessment",taskType:"type1",level:"MYP 4",theme:"Identities and relationships"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.tasks[0].type,"Analysing");
  });
});

test("returns English feedback capped at the question's available marks",async()=>{
  await withAI(async()=>{
    globalThis.fetch=queueFetch([{payload:{score:99,maxScore:20,strengths:["Clear comparison"],improvements:["Use evidence from both sources"],feedback:"A strong response."}}],request=>{
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
