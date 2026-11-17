/* MYP DESK — browser-only, rule-based study engine.
 * No API, account, network request, external model, or server is used.
 * All outputs are derived from the notes selected by the student.
 */
(() => {
"use strict";

const STOP = new Set(("a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours").split(" "));
const clean = value => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
const words = value => clean(value).toLocaleLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
const stem = word => word.length > 5 && word.endsWith("ies") ? word.slice(0,-3)+"y" : word.length > 5 && word.endsWith("ing") ? word.slice(0,-3) : word.length > 4 && word.endsWith("ed") ? word.slice(0,-2) : word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0,-1) : word;
const useful = word => word.length > 2 && !STOP.has(word) && !/^\d+$/.test(word);
const tokenize = value => words(value).filter(useful).map(stem);

function splitSentences(value) {
  return String(value || "").replace(/\r/g,"").split(/\n+|(?<=[.!?])\s+/)
    .map(part => clean(part.replace(/^\s*[-•*▪]+\s*/,"")))
    .filter(part => words(part).length >= 3 && part.length >= 14);
}
function collect(notes) {
  if (!Array.isArray(notes) || !notes.length) throw new Error("Select at least one saved note first.");
  const source = notes.map(note => ({title:clean(note && note.title) || "Untitled note", body:String(note && note.body || "").trim()})).filter(note => note.body);
  if (!source.length) throw new Error("Your selected notes are empty.");
  const sentences = source.flatMap(note => splitSentences(note.body).map(sentence => ({sentence,title:note.title})));
  if (!sentences.length) throw new Error("Add a little more detail to your notes. The study tools need complete sentences or clear bullet points.");
  return {source,sentences};
}
function termCounts(value) {
  const counts = new Map();
  tokenize(value).forEach(word => counts.set(word,(counts.get(word)||0)+1));
  return counts;
}
function keyTerms(value, limit=14) {
  const counts = termCounts(value);
  return [...counts.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,limit).map(([word])=>word);
}
function scoreSentences(items) {
  const list = items.map(item => typeof item === "string" ? {sentence:item} : item);
  const frequency = termCounts(list.map(item=>item.sentence).join(" "));
  return list.map((item,index) => {
    const terms = tokenize(item.sentence);
    const unique = new Set(terms);
    const score = [...unique].reduce((sum,term)=>sum+(1+Math.log1p(frequency.get(term)||0)),0) / Math.sqrt(Math.max(1,unique.size));
    const position = index === 0 ? 0.12 : 0;
    return {...item,index,score:score+position};
  }).sort((a,b)=>b.score-a.score || a.index-b.index);
}
function definitionFacts(items) {
  const facts=[], seen=new Set();
  const patterns=[
    /^(.{2,75}?)\s+(?:is defined as|can be defined as|refers to|is known as|is called|means|is|are|was|were)\s+(.{5,})$/i,
    /^(.{2,75}?)\s*[:–—-]\s*(.{5,})$/i
  ];
  items.forEach(item=>{
    const sentence=item.sentence.replace(/^[-•*▪]+\s*/,"").replace(/[.!?]+$/,"").trim();
    for(const pattern of patterns){
      const match=sentence.match(pattern);
      if(!match) continue;
      const term=clean(match[1]).replace(/^(the|a|an)\s+/i,"");
      const definition=clean(match[2]);
      const termWords=words(term);
      if(!termWords.length || termWords.length>9 || termWords.length>words(definition).length+2) continue;
      if(/^(this|that|it|they|he|she|we|there|these|those)$/i.test(term)) continue;
      const key=(term+"|"+definition).toLocaleLowerCase();
      if(!seen.has(key)){seen.add(key);facts.push({term,definition,source:item.sentence,title:item.title});}
      break;
    }
  });
  return facts;
}
function uniqueSentences(items) {
  const seen=new Set();
  return items.filter(item=>{
    const key=item.sentence.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
    if(!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
function summaryText(items,limit=6) {
  const unique=uniqueSentences(items);
  const chosen=scoreSentences(unique).slice(0,Math.min(limit,unique.length)).sort((a,b)=>a.index-b.index);
  return chosen.map(item=>"• "+item.sentence).join("\n");
}
function explain({notes,action="explain",prompt=""}) {
  const {sentences}=collect(notes), all=sentences.map(item=>item.sentence), facts=definitionFacts(sentences);
  if(action==="summarise" || action==="summarize") {
    return "SUMMARY OF YOUR NOTES\n\n"+summaryText(sentences,8)+"\n\nThis summary selects the most relevant sentences from your notes. Check the original notes for details that may not appear here.";
  }
  if(action==="flashcards") {
    const cards=facts.slice(0,15);
    if(cards.length) return "FLASHCARDS\n\n"+cards.map((fact,index)=>"CARD "+(index+1)+"\nQ: What is "+fact.term+"?\nA: "+fact.definition).join("\n\n");
    const ranked=scoreSentences(uniqueSentences(sentences)).slice(0,10);
    return "REVISION CARDS\n\n"+ranked.map((item,index)=>"CARD "+(index+1)+"\nQ: What is an important point from "+(item.title||"your notes")+"?\nA: "+item.sentence).join("\n\n")+"\n\nThese are recall prompts, not independently verified facts.";
  }
  if(action==="study-guide") {
    const terms=keyTerms(all.join(" "),12);
    const ideas=summaryText(sentences,7);
    const glossary=facts.length?facts.slice(0,12).map(fact=>"• "+fact.term+": "+fact.definition):terms.map(term=>"• "+term);
    const checks=facts.length?facts.slice(0,7).map(fact=>"• Explain "+fact.term+" and give its meaning."):terms.slice(0,7).map(term=>"• Find and explain '"+term+"' using your notes.");
    return "STUDY GUIDE\n\nKEY IDEAS\n"+ideas+"\n\nIMPORTANT TERMS\n"+(glossary.join("\n")||"No clear terms were detected.")+"\n\nSELF-CHECK\n"+(checks.join("\n")||"• Explain the most important idea in your notes in your own words.")+"\n\nUse your original notes to check each response.";
  }
  if(action==="ask") {
    const query=tokenize(prompt), raw=clean(prompt).toLocaleLowerCase();
    if(!query.length) return "Enter a question with a topic or keyword from your notes.";
    const querySet=new Set(query);
    const matches=sentences.map(item=>{
      const sentence=tokenize(item.sentence), sentenceSet=new Set(sentence);
      const overlap=[...querySet].filter(word=>sentenceSet.has(word)).length;
      const coverage=overlap/Math.max(1,querySet.size);
      const phrase=raw.length>4 && item.sentence.toLocaleLowerCase().includes(raw) ? 2 : 0;
      const score=overlap*1.5+coverage+phrase;
      return {...item,score,overlap,coverage};
    }).filter(item=>item.overlap>0).sort((a,b)=>b.score-a.score || b.sentence.length-a.sentence.length);
    if(!matches.length || (matches[0].coverage<0.2 && matches[0].overlap<2)) {
      return "I couldn't find a reliable answer to that in the selected notes. Try using a topic name or a different keyword, or add the missing information to your notes.\n\nI won't guess beyond the material provided.";
    }
    const selected=matches.slice(0,5);
    return "WHAT YOUR NOTES SAY\n\n"+selected.map(item=>"• "+item.sentence).join("\n")+
      "\n\nI found these passages by matching the important words in your question. They are evidence from your notes, not a new answer from an external source.";
  }
  const ranked=scoreSentences(uniqueSentences(sentences)).slice(0,7).sort((a,b)=>a.index-b.index);
  const glossary=facts.slice(0,8).map(fact=>"• "+fact.term+" means "+fact.definition);
  return "LET'S BREAK IT DOWN\n\n"+ranked.map(item=>"• "+item.sentence).join("\n")+
    (glossary.length?"\n\nKEY TERMS\n"+glossary.join("\n"):"")+
    "\n\nTry explaining each point aloud, then check it against the original note. This helper reorganises your material; it does not add facts that aren't there.";
}
function shuffleOptions(values) {
  const unique=[...new Set(values.map(clean).filter(Boolean))];
  // Stable ordering keeps the same notes from producing a confusingly changing answer key.
  return unique.sort((a,b)=>a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
}
function makeQuestions(notes,count,style) {
  const {sentences}=collect(notes), facts=definitionFacts(sentences), unique=uniqueSentences(sentences);
  const questions=[], used=new Set();
  const add=question=>{
    const key=question.question.toLocaleLowerCase().replace(/\W+/g," ").trim();
    if(!used.has(key)){used.add(key);questions.push(question);}
  };
  const makeDefinitionQuestion=(fact,index)=>{
    const otherDefinitions=facts.filter((other,j)=>j!==index).map(other=>other.definition).filter(value=>value.toLocaleLowerCase()!==fact.definition.toLocaleLowerCase());
    const distractors=shuffleOptions(otherDefinitions).slice(0,3);
    const wantsMultiple=style==="multiple" || style==="mixed";
    if(wantsMultiple && distractors.length>=3) {
      const options=shuffleOptions([fact.definition,...distractors]);
      add({question:"Which statement best describes "+fact.term+"?",options,correctIndex:options.indexOf(fact.definition),answer:fact.definition,explanation:"Your notes define "+fact.term+" as: "+fact.definition,source:fact.source});
    } else {
      add({question:"According to your notes, what is "+fact.term+"?",options:[],answer:fact.definition,explanation:"This definition comes directly from your notes: "+fact.source,source:fact.source});
    }
  };
  facts.forEach((fact,index)=>{if(questions.length<count)makeDefinitionQuestion(fact,index);});
  const allTerms=keyTerms(unique.map(item=>item.sentence).join(" "),60);
  const frequency=termCounts(unique.map(item=>item.sentence).join(" "));
  scoreSentences(unique).forEach(item=>{
    if(questions.length>=count) return;
    const candidates=words(item.sentence).filter(word=>useful(word)&&word.length>=5);
    candidates.sort((a,b)=>(frequency.get(stem(b))||0)-(frequency.get(stem(a))||0) || b.length-a.length);
    const answer=candidates[0];
    if(!answer) return;
    const cloze=item.sentence.replace(new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),"________");
    const distractors=shuffleOptions(allTerms.filter(term=>stem(term)!==stem(answer))).slice(0,3);
    const wantsMultiple=style==="multiple" || (style==="mixed" && questions.length%2===0);
    if(wantsMultiple && distractors.length>=3) {
      const options=shuffleOptions([answer,...distractors]);
      add({question:"Complete the statement from your notes: "+cloze,options,correctIndex:options.indexOf(answer),answer,explanation:"The original sentence in your notes is: "+item.sentence,source:item.sentence});
    } else {
      add({question:"Complete this statement from your notes: "+cloze,options:[],answer,explanation:"The original sentence in your notes is: "+item.sentence,source:item.sentence});
    }
  });
  if(style==="multiple") return questions.filter(question=>question.options.length>=2).slice(0,count);
  if(style==="short") return questions.map(question=>({...question,options:[],correctIndex:undefined})).slice(0,count);
  return questions.slice(0,count);
}
async function generateQuiz({notes,count=10,style="mixed"}) {
  const total=Math.max(1,Math.min(20,Number(count)||10));
  if(!["mixed","multiple","short"].includes(style)) style="mixed";
  const questions=makeQuestions(notes,total,style);
  if(!questions.length) throw new Error("There aren't enough clear facts in these notes to build a quiz. Add complete sentences, bullet points or definitions and try again.");
  if(style==="multiple" && questions.some(question=>question.options.length<2)) throw new Error("There aren't enough distinct facts to create reliable multiple-choice options. Add more definitions or choose mixed or short answer.");
  return {questions,requestedCount:total,generatedCount:questions.length,notice:questions.length<total?"Your notes supported "+questions.length+" useful questions. Add more detail to generate a longer quiz.":""};
}
async function askNotes({notes,action="explain",prompt=""}) {
  return {text:explain({notes,action,prompt})};
}
window.ParlerAI=Object.freeze({
  isConfigured:()=>true,
  isLocal:true,
  generateQuiz,
  askNotes,
  diagnostics:()=>({mode:"rule-based",network:false,features:["explain","summarise","flashcards","study-guide","ask","quiz"]})
});
})();
