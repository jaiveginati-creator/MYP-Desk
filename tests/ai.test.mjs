"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(new URL("../ai.js", import.meta.url), "utf8");
const sandbox = {window:{}};
vm.runInNewContext(source, sandbox, {filename:"ai.js"});
const engine = sandbox.window.ParlerAI;
assert.equal(engine.isLocal, true);
assert.equal(engine.diagnostics().network, false);

const notes = [{
  title:"Cell biology",
  body:[
    "Cells are the basic structural and functional units of living organisms.",
    "The nucleus is the control centre of the cell and contains genetic material.",
    "The cell membrane controls what enters and leaves the cell.",
    "Mitochondria release energy through cellular respiration.",
    "Ribosomes are structures where proteins are made.",
    "Chloroplasts contain chlorophyll and absorb light energy for photosynthesis.",
    "Photosynthesis is the process by which plants use light energy to make glucose.",
    "Cellular respiration releases energy from glucose."
  ].join("\n")
}];

(async()=>{
  const actions=["explain","summarise","flashcards","study-guide"];
  for(const action of actions){
    const result=await engine.askNotes({notes,action});
    assert.ok(result.text.length>50, action+" should return useful text");
  }
  const answer=await engine.askNotes({notes,action:"ask",prompt:"What does the nucleus do?"});
  assert.match(answer.text,/control centre|genetic material/i);
  const unknown=await engine.askNotes({notes,action:"ask",prompt:"Explain ocean currents"});
  assert.match(unknown.text,/couldn't find/i);

  for(const style of ["mixed","multiple","short"]){
    const quiz=await engine.generateQuiz({notes,count:10,style});
    assert.ok(quiz.questions.length>0,style+" should create questions");
    assert.ok(quiz.questions.length<=10);
    for(const question of quiz.questions){
      assert.ok(question.question.length>8);
      assert.ok(question.answer!==undefined && question.answer!=="");
      assert.ok(question.explanation.length>5);
      if(question.options.length){
        assert.ok(question.options.length>=2);
        assert.equal(new Set(question.options).size,question.options.length);
        assert.ok(question.correctIndex>=0 && question.correctIndex<question.options.length);
        assert.equal(question.options[question.correctIndex],question.answer);
      }
    }
  }
  await assert.rejects(()=>engine.generateQuiz({notes:[{title:"Empty",body:""}]}),/empty/i);
  await assert.rejects(()=>engine.askNotes({notes:[],action:"explain"}),/select/i);
  console.log("PASS: all assistant actions, note-grounded Q&A, unknown-question handling, quiz styles, answer keys, and empty-input checks.");
})().catch(error=>{console.error(error);process.exitCode=1;});
