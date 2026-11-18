/* MYP DESK — Haese Mathematics 9 (MYP 4), 3rd Edition workspace.
   Chapter and section headings follow the publisher's public table of contents.
   All lesson explanations, examples and assessment questions are original. */
(() => {
"use strict";
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const chapters = [
["Number",["Exponent notation","The Fundamental Theorem of Arithmetic","Order of operations","Absolute value"]],
["Algebra: Expressions",["Algebraic notation","Writing expressions","Algebraic substitution","The language of algebra","Collecting like terms","Algebraic products","Algebraic quotients","Algebraic common factors"]],
["Exponents",["Exponent laws","Zero and negative exponents","Standard form (scientific notation)","International system (SI) units"]],
["Algebra: Expansion",["The distributive law","The product (a + b)(c + d)","The difference between two squares","The perfect squares expansion","Further expansion"]],
["Sets",["Sets","Complement of a set","Intersection and union","Special number sets","Interval notation"]],
["Linear Equations and Inequalities",["Linear equations","Equations with fractions","Problem solving","Linear inequalities","Solving linear inequalities"]],
["Venn Diagrams",["Venn diagrams","Venn diagram regions","Numbers in regions","Problem solving with Venn diagrams"]],
["Surds and Other Radicals",["Square roots","Properties of radicals","Simplest surd form","Cube and higher roots","Power equations","Operations with radicals","Division with surds"]],
["Pythagoras' Theorem",["Pythagoras' theorem","Pythagorean triples","Problem solving"]],
["Formulae",["Formula construction","Substituting into formulae","Rearranging formulae","Rearrangement and substitution"]],
["Financial Mathematics",["Percentage increase or decrease","Business calculations","Appreciation and depreciation","Simple interest","Compound interest"]],
["Measurement: Length and Area",["Units of length","Perimeter","Units of area","Area of polygons","Area of circles and sectors"]],
["Measurement: Surface Area, Volume and Capacity",["Surface area of a solid with planar faces","Surface area of a cylinder","Surface area of a cone","Surface area of a sphere","Units of volume","Volume of a solid of uniform cross-section","Volume of a tapered solid","Volume of a sphere","Capacity"]],
["Algebra: Factorisation",["Common factors","Difference between two squares factorisation","Perfect squares factorisation","Factorising x² + bx + c","Miscellaneous factorisation","Expressions with four terms","Factorising ax² + bx + c"]],
["Algebraic Fractions",["Evaluating algebraic fractions","Simplifying algebraic fractions","Multiplying algebraic fractions","Dividing algebraic fractions","Adding and subtracting algebraic fractions"]],
["Coordinate Geometry",["The distance between two points","Midpoints","Gradient","Parallel and perpendicular lines","Using coordinate geometry"]],
["Straight Lines",["Vertical and horizontal lines","Points on a line","Axes intercepts","Graphing from a table of values","Gradient-intercept form","General form","Finding the equation of a line"]],
["Simultaneous Equations",["Solution by trial and error","Graphical solution","Solution by equating values of y","Solution by substitution","Solution by elimination","Problem solving"]],
["Transformation Geometry",["Translations","Reflections","Rotations","Enlargements and reductions","Stretches","Combinations of transformations"]],
["Quadratic Equations",["Quadratic equations","Equations of the form x² = k","The null factor law","Solving by factorisation","Problem solving","Completing the square"]],
["Quadratic Functions",["Quadratic functions","Graphs of quadratic functions","Using transformations to graph quadratics","Axes intercepts","Using axes intercepts to graph quadratics","Projectile motion"]],
["Congruence and Similarity",["Congruence","Congruent triangles","Similarity","Similar triangles","Areas of similar figures","Volumes of similar solids"]],
["Trigonometry",["Scale diagrams in geometry","Labelling right-angled triangles","The trigonometric ratios","Finding side lengths","Finding angles","Problem solving","Bearings"]],
["Deductive Geometry",["Deductive geometry","Midpoint theorem","Angle in a semi-circle theorem","Chords of a circle theorem","Radius-tangent theorem","Tangents from an external point theorem"]],
["Proportion",["Direct proportion","Powers in direct proportion","Inverse proportion","Powers in inverse proportion"]],
["Probability",["Sample space and events","Theoretical probability","Probabilities from Venn diagrams","Independent events","Dependent events","Probabilities from tree diagrams","Experimental probability","Probabilities from tabled data","Expectation"]],
["Statistics",["Types of data","Discrete numerical data","Continuous numerical data","Describing the distribution of data","Measures of centre","Cumulative frequency graphs","Measures of spread","Box plots","Comparing numerical data"]],
["Networks",["Networks","Routes on networks","Shortest route problems","Eulerian networks"]],
["Non-right-angled Triangle Trigonometry",["Trigonometry with obtuse angles","The area of a triangle","The sine rule","The cosine rule","Problem solving"]],
["Mathematical Logic",["Propositions","Compound propositions","Implication","Equivalence","Constructing truth tables","Tautology and logical contradiction","Logical equivalence"]]
];
const assumed = [
["Number foundations",["Prime and composite numbers","Highest common factor","Multiples","Operations with fractions","Rounding numbers","Roots","Rational numbers"]],
["Percentage foundations",["Converting percentages into decimals and fractions","Converting decimals and fractions into percentages","Expressing one quantity as a percentage of another","Finding a percentage of a quantity"]]
];
const formulas = [
["Number & exponents",[
["Prime factorisation","Write a number as a product of prime factors.","Example: 60 = 2² × 3 × 5."],
["Product of powers","aᵐ × aⁿ = aᵐ⁺ⁿ","When multiplying powers with the same base, add the exponents."],
["Quotient of powers","aᵐ ÷ aⁿ = aᵐ⁻ⁿ","When dividing powers with the same non-zero base, subtract the exponents."],
["Power of a power","(aᵐ)ⁿ = aᵐⁿ","Multiply the exponents."],
["Zero exponent","a⁰ = 1 (a ≠ 0)","Any non-zero base raised to zero equals one."],
["Negative exponent","a⁻ⁿ = 1/aⁿ","A negative exponent means take the reciprocal."],
["Scientific notation","N = a × 10ⁿ, where 1 ≤ a < 10","Use for very large or very small numbers."]
]],
["Algebra",[
["Distributive law","a(b + c) = ab + ac","Multiply the term outside the brackets by every term inside."],
["Difference of squares","a² − b² = (a − b)(a + b)","Use when two perfect squares are separated by subtraction."],
["Perfect square expansion","(a + b)² = a² + 2ab + b²","The middle term is twice the product of the two terms."],
["Perfect square expansion","(a − b)² = a² − 2ab + b²","The middle term is negative."],
["Linear equation","ax + b = c  ⇒  x = (c − b)/a","Use inverse operations to isolate x; a ≠ 0."],
["Gradient","m = (y₂ − y₁)/(x₂ − x₁)","Change in y divided by change in x."],
["Straight-line form","y = mx + c","m is the gradient and c is the y-intercept."],
["Quadratic formula","x = (−b ± √(b² − 4ac))/(2a)","For ax² + bx + c = 0, a ≠ 0."],
["Null factor law","If AB = 0, then A = 0 or B = 0","Set each factor equal to zero."]
]],
["Geometry & measurement",[
["Pythagoras","a² + b² = c²","For a right-angled triangle; c is the hypotenuse."],
["Rectangle perimeter","P = 2l + 2w","Add all four sides."],
["Rectangle area","A = lw","Length multiplied by width."],
["Triangle area","A = ½bh","Base multiplied by perpendicular height, then halved."],
["Parallelogram area","A = bh","Use perpendicular height, not the sloping side."],
["Trapezium area","A = ½(a + b)h","a and b are the parallel sides."],
["Circle circumference","C = 2πr = πd","Distance around a circle."],
["Circle area","A = πr²","r is the radius."],
["Sector arc length","s = (θ/360°) × 2πr","θ is the central angle in degrees."],
["Sector area","A = (θ/360°) × πr²","The fraction of the full circle is θ/360°."],
["Prism volume","V = cross-sectional area × length","Works for a solid with a constant cross-section."],
["Cylinder volume","V = πr²h","Circular base area multiplied by height."],
["Cylinder curved surface area","CSA = 2πrh","Wrap-around area only; total SA adds both circular ends."],
["Cone volume","V = ⅓πr²h","One third of the matching cylinder's volume."],
["Sphere volume","V = ⁴⁄₃πr³","r is the sphere's radius."],
["Sphere surface area","SA = 4πr²","Area of the curved outside of a sphere."]
]],
["Financial mathematics",[
["Percentage change","Percentage change = (change/original) × 100%","Use the original value as the denominator."],
["New value after increase","New = Original × (1 + r/100)","r is the percentage increase."],
["New value after decrease","New = Original × (1 − r/100)","r is the percentage decrease."],
["Simple interest","I = Prt","P is principal, r is annual rate as a decimal, t is time in years."],
["Simple-interest total","A = P(1 + rt)","Total amount after simple interest."],
["Compound interest","A = P(1 + r)ⁿ","r is the rate per period and n is the number of periods."]
]],
["Coordinate geometry & transformations",[
["Distance","d = √((x₂ − x₁)² + (y₂ − y₁)²)","Distance between two coordinate points."],
["Midpoint","M = ((x₁ + x₂)/2, (y₁ + y₂)/2)","Average the x-coordinates and y-coordinates separately."],
["Parallel lines","m₁ = m₂","Non-vertical parallel lines have equal gradients."],
["Perpendicular lines","m₁m₂ = −1","For non-vertical perpendicular lines, gradients are negative reciprocals."],
["Enlargement scale factor","k = image length / original length","A negative scale factor also changes the side of the centre."]
]],
["Similarity & trigonometry",[
["Similar lengths","Image length / Original length = k","Corresponding lengths have the same scale factor."],
["Similar areas","Area scale factor = k²","Square the length scale factor."],
["Similar volumes","Volume scale factor = k³","Cube the length scale factor."],
["Sine ratio","sin θ = opposite / hypotenuse","SOH."],
["Cosine ratio","cos θ = adjacent / hypotenuse","CAH."],
["Tangent ratio","tan θ = opposite / adjacent","TOA."],
["Sine rule","a/sin A = b/sin B = c/sin C","Use when you know a side and its opposite angle, plus another pair."],
["Cosine rule","a² = b² + c² − 2bc cos A","Use when you know two sides and the included angle, or all three sides."],
["Triangle area with sine","Area = ½ab sin C","a and b enclose angle C."]
]],
["Probability & statistics",[
["Theoretical probability","P(A) = favourable outcomes / total equally likely outcomes","Probability lies from 0 to 1."],
["Complement","P(not A) = 1 − P(A)","Use for the event not happening."],
["Expected frequency","Expected frequency = probability × number of trials","A long-run prediction, not a guarantee."],
["Mean","Mean = sum of values / number of values","Sensitive to extreme values."],
["Range","Range = maximum − minimum","A simple measure of spread."],
["Interquartile range","IQR = Q₃ − Q₁","Spread of the middle 50% of the data."],
["Grouped-data mean estimate","Estimated mean = Σ(f × midpoint) / Σf","Use each class midpoint multiplied by its frequency."]
]],
["Networks & logic",[
["Handshaking lemma","Sum of vertex degrees = 2 × number of edges","Every edge contributes two ends to the total degree count."],
["Conditional statement","p → q","Read as 'if p, then q'."],
["Biconditional","p ↔ q","True when p and q have the same truth value."]
]]
];
let activeTab="lessons",openChapter=-1,lessonBusy=false,currentPaper=null;
const tabs=[["lessons","Lessons","▤"],["assessment","E-assessment Prep","⌘"],["formulae","Formulae","∑"]];
function shell(body){
 return '<div class="math-shell"><div class="math-kicker"><span class="eyebrow">MYP 4 · HAESE MATHEMATICS 9 · THIRD EDITION</span><span class="math-book-tag">ISBN 9781922416346</span></div><div class="math-heading"><div><h1>Mathematics<span>.</span></h1><p class="intro">A clear, step-by-step workspace for learning the ideas, practising MYP-style problems and finding the formula you need.</p></div><div class="math-orbit" aria-hidden="true"><span>∑</span><i></i></div></div><div class="math-tabs" role="tablist" aria-label="Mathematics sections">'+tabs.map(([id,label,icon])=>'<button type="button" class="math-tab '+(activeTab===id?"active":"")+'" role="tab" aria-selected="'+(activeTab===id)+'" data-math-tab="'+id+'"><span>'+icon+'</span>'+label+'</button>').join("")+'</div><div class="math-tab-content">'+body+'</div><div class="math-footer"><span>HAESE MATHEMATICS 9 · MYP 4</span><span>ORIGINAL LEARNING MATERIAL · NOT AN OFFICIAL IB PAPER</span></div></div>';
}
function lessonsMarkup(){
 return '<div class="math-section-head"><div><div class="eyebrow">CHAPTER-BY-CHAPTER LEARNING</div><h2>Learn it properly.</h2><p>Each chapter is broken into smaller lessons. Open a lesson for a full explanation, a worked example and exam-style practice.</p></div><span class="math-count">30 CHAPTERS</span></div><details class="math-assumed"><summary>Assumed knowledge · online foundation units</summary><div class="math-assumed-grid">'+assumed.map((group,i)=>'<article><strong>'+esc(group[0])+'</strong>'+group[1].map(item=>'<span>'+esc(item)+'</span>').join("")+'</article>').join("")+'</div></details><div class="math-chapters">'+chapters.map((chapter,i)=>'<details class="math-chapter" '+(openChapter===i?"open":"")+'><summary><span class="math-chapter-no">'+String(i+1).padStart(2,"0")+'</span><span class="math-chapter-name"><strong>'+esc(chapter[0])+'</strong><small>'+chapter[1].length+' lessons · '+(i>=27?"online chapter":"textbook chapter")+'</small></span><span class="math-chapter-arrow">↗</span></summary><div class="math-lesson-grid">'+chapter[1].map((lesson,j)=>'<button type="button" class="math-lesson-card" data-math-lesson="'+i+'|'+j+'"><span>LESSON '+String(j+1).padStart(2,"0")+'</span><strong>'+esc(lesson)+'</strong><small>Open full explanation →</small></button>').join("")+'</div></details>').join("")+'</div><div id="mathLessonView" class="math-lesson-view" hidden></div>';
}
function assessmentMarkup(){
 return '<div class="math-section-head"><div><div class="eyebrow">ORIGINAL MYP-STYLE PRACTICE</div><h2>Think. Apply. Communicate.</h2><p>Generate fresh mathematical tasks, show your working and receive feedback on your reasoning. This is practice, not an official IB assessment.</p></div></div><div class="math-assess-controls"><label>ASSESSMENT TYPE<select id="math-mode"><option value="full">Full practice paper · all four criteria</option><option value="A">Criterion A · Knowing and understanding</option><option value="B">Criterion B · Investigating patterns</option><option value="C">Criterion C · Communicating</option><option value="D">Criterion D · Applying mathematics in real-life contexts</option></select></label><label>LEVEL<select id="math-level"><option>MYP 4</option><option selected>MYP 4–5</option><option>MYP 5</option></select></label><label>TOPIC<select id="math-topic"><option value="mixed">Mixed topics</option>'+chapters.map((c,i)=>'<option value="'+i+'">'+esc(c[0])+'</option>').join("")+'</select></label><button type="button" class="math-primary" data-math-generate>Generate practice ↗</button></div><div id="mathAssessmentResults" class="math-assessment-results"><div class="math-empty"><strong>Your next maths challenge.</strong>Choose a practice type and topic. The AI will create original questions at your selected level.</div></div><div class="math-criteria-guide"><h3>What each criterion is looking for</h3><div><b>A · Knowing and understanding</b><p>Use mathematical knowledge, choose suitable methods and solve problems accurately.</p></div><div><b>B · Investigating patterns</b><p>Explore examples, identify relationships, make a conjecture and test whether it works.</p></div><div><b>C · Communicating</b><p>Use correct mathematical language, notation, diagrams and logical steps so another person can follow your reasoning.</p></div><div><b>D · Applying mathematics in real-life contexts</b><p>Build a mathematical model, apply it to a real situation, interpret the result and consider whether the answer makes sense.</p></div></div>';
}
function formulaMarkup(){
 return '<div class="math-section-head"><div><div class="eyebrow">QUICK REFERENCE</div><h2>Find the formula.</h2><p>Use the search box or choose a topic group. Each entry explains what the formula is for, not just what to memorise.</p></div><span class="math-count">'+formulas.reduce((n,g)=>n+g[1].length,0)+' REFERENCES</span></div><div class="math-formula-search"><input id="mathFormulaSearch" type="search" placeholder="Search a formula, topic or keyword…" aria-label="Search formulae"><span>⌕</span></div><div id="mathFormulaGroups" class="math-formula-groups">'+formulaGroupsMarkup("")+'</div>';
}
function formulaGroupsMarkup(query){
 const q=String(query||"").toLowerCase();
 const groups=formulas.map(group=>{const items=group[1].filter(item=>!q||item.join(" ").toLowerCase().includes(q));return items.length?'<section class="math-formula-group"><h3>'+esc(group[0])+'</h3><div>'+items.map(item=>'<article class="math-formula"><div><strong>'+esc(item[0])+'</strong><code>'+esc(item[1])+'</code></div><p>'+esc(item[2])+'</p></article>').join("")+'</div></section>':""}).join("");
 return groups||'<div class="math-empty">No matching formulae. Try a different keyword.</div>';
}
function markup(){return shell(activeTab==="lessons"?lessonsMarkup():activeTab==="assessment"?assessmentMarkup():formulaMarkup())}
function lessonFallback(chapter,lesson){
 return '<div class="math-lesson-head"><div><span>HAESE · CHAPTER '+String(chapter+1).padStart(2,"0")+' · MYP 4</span><h2>'+esc(chapters[chapter][1][lesson])+'</h2></div><button type="button" data-math-close-lesson aria-label="Close lesson">×</button></div><p class="math-ai-note">Loading a complete lesson. The explanation will use original examples and step-by-step mathematical reasoning.</p><h3>LESSON OUTLINE</h3><p>'+esc(chapters[chapter][0])+' · '+esc(chapters[chapter][1][lesson])+'</p>';
}
function lessonView(detail,chapter,lesson){
 return '<div class="math-lesson-head"><div><span>HAESE · CHAPTER '+String(chapter+1).padStart(2,"0")+' · MYP 4</span><h2>'+esc(chapters[chapter][1][lesson])+'</h2></div><button type="button" data-math-close-lesson aria-label="Close lesson">×</button></div><p class="math-lesson-overview">'+esc(detail.overview)+'</p><section class="math-learning-goals"><h3>BY THE END OF THIS LESSON</h3><ul>'+detail.objectives.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></section><h3>LEARN THE IDEA</h3><div class="math-explain-sections">'+detail.sections.map((s,i)=>'<article><span>0'+(i+1)+'</span><div><h4>'+esc(s.heading)+'</h4><p>'+esc(s.explanation)+'</p></div></article>').join("")+'</div><section class="math-worked-example"><h3>WORKED EXAMPLE</h3><p>'+esc(detail.workedExample)+'</p></section><section class="math-vocabulary"><h3>IMPORTANT WORDS</h3><dl>'+detail.keyTerms.map(x=>'<div><dt>'+esc(x.term)+'</dt><dd>'+esc(x.definition)+'</dd></div>').join("")+'</dl></section><section class="math-mistake"><h3>COMMON MISTAKE</h3><p>'+esc(detail.commonMistake)+'</p></section><section class="math-practice"><h3>TRY THESE · EXAM-STYLE PRACTICE</h3>'+detail.examPractice.map((x,i)=>'<article><div><b>QUESTION '+(i+1)+'</b><span>'+Number(x.marks)+' MARKS</span></div><p>'+esc(x.question)+'</p><details><summary>Show answer outline</summary><p>'+esc(x.answerOutline)+'</p></details></article>').join("")+'</section><section class="math-check"><h3>CHECK YOUR UNDERSTANDING</h3><p>'+esc(detail.checkQuestion)+'</p><details><summary>Show a worked answer</summary><p>'+esc(detail.modelAnswer)+'</p></details></section><div class="math-lesson-end"><span>ORIGINAL MYP 4 EXPLANATION · STEP BY STEP</span><button type="button" data-math-close-lesson>BACK TO CHAPTERS</button></div>';
}
async function openLesson(chapter,lesson,button){
 const view=document.getElementById("mathLessonView");if(!view)return;
 view.hidden=false;view.innerHTML=lessonFallback(chapter,lesson);view.scrollIntoView({behavior:"smooth",block:"start"});
 try{
  const response=await fetch(window.PARLER_AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"math_lesson",level:"MYP 4",chapter:chapters[chapter][0],title:chapters[chapter][1][lesson],chapterTopics:chapters[chapter][1]})});
  const data=await response.json();if(!response.ok||!data.lesson)throw new Error(data.error||"The lesson could not be generated.");
  if(view.isConnected&&!view.hidden)view.innerHTML=lessonView(data.lesson,chapter,lesson);
 }catch(error){if(view.isConnected&&!view.hidden)view.innerHTML=lessonFallback(chapter,lesson)+'<p class="math-ai-note">The full explanation could not load right now. Please try again. '+esc(error.message)+'</p>'}
}
function renderPaper(paper){
 currentPaper=paper;
 return '<div class="math-paper-head"><span>'+esc(paper.level)+' · '+esc(paper.topicLabel)+' · '+paper.totalMarks+' MARKS · '+paper.durationMinutes+' MINUTES</span><h2>'+esc(paper.title)+'</h2><p>Original practice paper. Show all working, use correct notation and explain your reasoning where asked.</p><div class="math-paper-criteria">'+paper.tasks.map(t=>'<span>CRITERION '+esc(t.criterion)+' <b>'+t.marks+'</b></span>').join("")+'</div></div>'+paper.tasks.map((task,ti)=>'<article class="math-task"><div class="math-task-top"><span>CRITERION '+esc(task.criterion)+' · '+esc(task.criterionName)+'</span><b>'+task.marks+' MARKS</b></div><h3>'+esc(task.title)+'</h3><div class="math-context"><span>MATHEMATICAL CONTEXT</span><p>'+esc(task.context)+'</p></div>'+task.questions.map((q,qi)=>'<section class="math-question"><div><span>QUESTION '+(ti+1)+'.'+(qi+1)+' · '+esc(q.commandTerm)+'</span><b>'+q.marks+' MARKS</b></div><h4>'+esc(q.question)+'</h4><textarea data-math-answer="'+ti+'-'+qi+'" rows="4" placeholder="Show your working and write your answer here…"></textarea><small>Focus: '+q.successCriteria.map(esc).join(" · ")+'</small></section>').join("")+'</article>').join("")+'<div class="math-submit"><button type="button" class="math-primary" data-math-submit>Submit for AI feedback ↗</button><p id="math-mark-status" aria-live="polite">Your answers will be reviewed for mathematical accuracy, method and communication.</p><div id="math-mark-results"></div></div>';
}
async function generatePaper(button){
 const root=document.getElementById("mathAssessmentResults");if(!root)return;
 const mode=document.getElementById("math-mode").value,level=document.getElementById("math-level").value,topic=document.getElementById("math-topic").value;
 button.disabled=true;button.textContent="Building your paper…";root.innerHTML='<div class="math-empty">Creating original questions and checking that the mathematics is consistent…</div>';
 try{
  const response=await fetch(window.PARLER_AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"math_eassessment",mode,level,topic:topic==="mixed"?"mixed":chapters[Number(topic)][0]})});
  const data=await response.json();if(!response.ok||!data.paper)throw new Error(data.error||"Could not generate practice.");
  root.innerHTML=renderPaper(data.paper);
 }catch(error){root.innerHTML='<div class="math-empty"><strong>Practice could not be generated.</strong>'+esc(error.message||"Please try again.")+'</div>'}
 finally{button.disabled=false;button.textContent="Generate practice ↗"}
}
async function markPaper(button){
 if(!currentPaper)return;
 const root=document.getElementById("mathAssessmentResults"),status=document.getElementById("math-mark-status"),results=document.getElementById("math-mark-results");
 const answers=[];currentPaper.tasks.forEach((task,ti)=>task.questions.forEach((q,qi)=>{const field=root.querySelector('[data-math-answer="'+ti+'-'+qi+'"]');answers.push({criterion:task.criterion,criterionName:task.criterionName,taskTitle:task.title,context:task.context,question:q.question,commandTerm:q.commandTerm,marks:q.marks,successCriteria:q.successCriteria,response:field?.value||""})}));
 if(answers.every(a=>!a.response.trim())){status.textContent="Write your answers before submitting.";return}
 button.disabled=true;button.textContent="Marking your work…";status.textContent="Checking each answer against its marks and the mathematical reasoning required.";
 try{
  const response=await fetch(window.PARLER_AI_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"math_eassessment_mark",level:currentPaper.level,answers})});
  const data=await response.json();if(!response.ok||!Array.isArray(data.assessments))throw new Error(data.error||"AI marking failed.");
  let score=0,max=0;
  results.innerHTML=data.assessments.map((a,i)=>{score+=Number(a.score)||0;max+=Number(a.maxScore)||0;return '<article class="math-mark-card"><div><strong>'+Number(a.score)+' / '+Number(a.maxScore)+'</strong><span>QUESTION '+(i+1)+'</span></div><p>'+esc(a.feedback)+'</p><b>What worked</b><ul>'+a.strengths.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul><b>Next steps</b><ul>'+a.improvements.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></article>'}).join("");
  const percent=max?Math.round(score/max*100):0;results.insertAdjacentHTML("afterbegin",'<div class="math-mark-total"><span>INDICATIVE PRACTICE RESULT</span><strong>'+score+' / '+max+'</strong><p>'+percent+'% · This is formative AI feedback, not an official IB grade.</p></div>');
  status.textContent="Your answers have been reviewed. Use the next steps to guide your revision.";button.textContent="Feedback complete ✓";
 }catch(error){status.textContent=error.message||"Marking failed. Please try again.";button.textContent="Retry feedback ↗"}
 finally{button.disabled=false}
}
function handleClick(event){
 const tab=event.target.closest("[data-math-tab]");if(tab){activeTab=tab.dataset.mathTab;openChapter=-1;const content=document.querySelector(".math-shell");if(content)content.outerHTML=markup();return}
 const lesson=event.target.closest("[data-math-lesson]");if(lesson){const [chapter,index]=lesson.dataset.mathLesson.split("|").map(Number);openLesson(chapter,index,lesson);return}
 if(event.target.closest("[data-math-close-lesson]")){const view=document.getElementById("mathLessonView");if(view){view.hidden=true;view.innerHTML=""}return}
 const generate=event.target.closest("[data-math-generate]");if(generate){generatePaper(generate);return}
 const submit=event.target.closest("[data-math-submit]");if(submit){markPaper(submit);return}
}
function handleInput(event){if(event.target.id==="mathFormulaSearch"){const root=document.getElementById("mathFormulaGroups");if(root)root.innerHTML=formulaGroupsMarkup(event.target.value)}}
window.MYPMath=Object.freeze({markup,handleClick,handleInput});
})();