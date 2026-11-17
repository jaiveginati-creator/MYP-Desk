import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ai.js";

function responseRecorder() {
  return {
    statusCode:200,
    payload:null,
    headers:{},
    setHeader(name,value){this.headers[name]=value},
    status(code){this.statusCode=code;return this},
    json(payload){this.payload=payload;return this}
  };
}

test("generates a validated three-task French e-assessment paper", async () => {
  const previousKey=process.env.GROQ_API_KEY, previousFetch=globalThis.fetch;
  process.env.GROQ_API_KEY="test-key";
  const task={text:"Un court texte en français.",questions:Array.from({length:6},(_,i)=>({question:"Question "+(i+1)+" ?",options:["A","B","C","D"],correctIndex:2,explanation:"Le texte confirme cette réponse."}))};
  const paper={title:"La vie en ville",theme:"Identities and relationships",level:"Capable",listening:task,reading:task,writing:{stimulusTitle:"Affiche",stimulus:"Une affiche sur la vie locale.",task:"Écris un message.",audience:"Tes camarades",purpose:"Informer",wordTarget:"120–180 words",successCriteria:["Use clear paragraphs"]}};
  globalThis.fetch=async(url,options)=>{
    const request=JSON.parse(options.body);
    assert.equal(request.response_format.type,"json_schema");\n    assert.equal(request.response_format.json_schema.strict,true);\n    assert.equal(request.response_format.json_schema.schema.additionalProperties,false);\n    assert.deepEqual(request.response_format.json_schema.schema.required,["title","theme","level","listening","reading","writing"]);
    assert.match(request.messages[1].content,/72 marks/);
    assert.match(request.messages[1].content,/three on-screen tasks/);
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(paper)}}]}),{status:200,headers:{"Content-Type":"application/json"}});
  };
  try {
    const res=responseRecorder();
    await handler({method:"POST",body:{action:"eassessment",level:"Capable",theme:"Identities and relationships"}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.paper.listening.questions.length,6);
    assert.equal(res.payload.paper.reading.questions.length,6);
    assert.equal(res.payload.paper.level,"Capable");
  } finally {
    globalThis.fetch=previousFetch;
    if(previousKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=previousKey;
  }
});

test("returns formative writing feedback with a score capped at 24", async () => {
  const previousKey=process.env.GROQ_API_KEY, previousFetch=globalThis.fetch;
  process.env.GROQ_API_KEY="test-key";
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({score:31,strengths:["Clear ideas"],improvements:["Check verb endings"],feedback:"A promising response."})}}]}),{status:200,headers:{"Content-Type":"application/json"}});
  try {
    const res=responseRecorder();
    await handler({method:"POST",body:{action:"eassessment_mark",level:"Emergent",writingTask:"Write an email.",stimulus:"School event poster.",response:"Bonjour, je voudrais participer à cette activité parce que j'aime travailler avec mes amis."}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.payload.assessment.score,24);
    assert.equal(res.payload.assessment.strengths[0],"Clear ideas");
  } finally {
    globalThis.fetch=previousFetch;
    if(previousKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=previousKey;
  }
});
