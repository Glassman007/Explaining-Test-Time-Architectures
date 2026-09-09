'use strict';

const stages=[...document.querySelectorAll('.stage')];
const labels=[
  'PARAMETERS / TEMPORARY STATE','ARCHITECTURE FOUNDATION','PARAMETERS / MEMORY / WORKSPACE','HOW DOES THE MACHINE REMEMBER?',
  'THE QUERY ARRIVES','WHERE DOES THE REASONING HAPPEN?','HOW DOES INFORMATION MOVE?','WHICH PART CARRIES THIS INFORMATION?','FROM INTERNAL STATE TO PREDICTION','SAME PROBLEM, THREE MACHINES','HOW DEEP CAN THE MACHINE THINK?','RECONSTRUCT THE MACHINE','IDENTIFY THE MACHINE','FINAL SCREEN'
];
let step=0;
const stepCount=document.querySelector('#stepCount');
const railFill=document.querySelector('#railFill');
const navLabel=document.querySelector('#navLabel');
const prev=document.querySelector('#prevStep');
const next=document.querySelector('#nextStep');

function showStep(n){
  step=Math.max(0,Math.min(stages.length-1,n));
  window.scrollTo({top:0,behavior:'instant'});
  stages.forEach((s,i)=>s.classList.toggle('active',i===step));
  stepCount.textContent=String(step+1).padStart(2,'0')+' / '+stages.length;
  railFill.style.height=((step+1)/stages.length*100)+'%';
  navLabel.textContent=labels[step];
  prev.disabled=step===0;
  next.textContent=step===stages.length-1?'Back to architectures ↗':'Next →';
}
prev.addEventListener('click',()=>showStep(step-1));
next.addEventListener('click',()=>step===stages.length-1?location.href='../index.html#architectures':showStep(step+1));

function markChoiceGroup(group,correctText,feedback){
  const buttons=[...group.querySelectorAll('button')];
  buttons.forEach(button=>button.addEventListener('click',()=>{
    buttons.forEach(x=>x.classList.remove('correct','wrong'));
    const ok=button.dataset.answer==='correct' || button.dataset.correct==='true';
    button.classList.add(ok?'correct':'wrong');
    const right=buttons.find(x=>x.dataset.answer==='correct'||x.dataset.correct==='true');
    if(right) right.classList.add('correct');
    feedback.textContent=ok?correctText:'That would change the machine or its training history, not the temporary inference-time information.';
    feedback.className='feedback '+(ok?'good':'bad');
  }));
}

// MODULE 1 — Locked Machine
const runLength=document.querySelector('#runLengthRule');
const lengthPrediction=document.querySelector('#lengthPrediction');
const lengthQuestion=document.querySelector('#lengthQuestion');
const lengthFeedback=document.querySelector('#lengthFeedback');
runLength.addEventListener('click',()=>{
  runLength.disabled=true;
  lengthPrediction.classList.add('running');
  lengthPrediction.querySelector('strong').textContent='3';
  setTimeout(()=>{lengthPrediction.classList.add('solved');lengthQuestion.classList.remove('hidden');},450);
});
const lengthGroup=document.querySelector('[data-choice-group="length"]');
[...lengthGroup.querySelectorAll('button')].forEach(button=>button.addEventListener('click',()=>{
  [...lengthGroup.querySelectorAll('button')].forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.dataset.answer==='correct';
  button.classList.add(ok?'correct':'wrong');
  lengthGroup.querySelector('[data-answer="correct"]').classList.add('correct');
  lengthFeedback.textContent=ok?'Correct — the inferred rule was available in temporary context/state used during inference.':'θ stayed locked. Look for the temporary information available to this particular inference.';
  lengthFeedback.className='feedback '+(ok?'good':'bad');
  if(ok) setTimeout(()=>{document.querySelector('#lockedRoundOne').classList.add('hidden');document.querySelector('#lockedRoundTwo').classList.remove('hidden');},650);
}));

const runDuplicate=document.querySelector('#runDuplicateRule');
const duplicateAnimation=document.querySelector('#duplicateAnimation');
const duplicateQuestion=document.querySelector('#duplicateQuestion');
const duplicateFeedback=document.querySelector('#duplicateFeedback');
runDuplicate.addEventListener('click',()=>{
  duplicateAnimation.classList.add('solved');
  duplicateAnimation.querySelector('strong').textContent='◆◆';
  duplicateQuestion.classList.remove('hidden');
});
const duplicateGroup=document.querySelector('[data-choice-group="duplicate"]');
[...duplicateGroup.querySelectorAll('button')].forEach(button=>button.addEventListener('click',()=>{
  [...duplicateGroup.querySelectorAll('button')].forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.dataset.answer==='correct';
  button.classList.add(ok?'correct':'wrong');
  duplicateGroup.querySelector('[data-answer="correct"]').classList.add('correct');
  duplicateFeedback.textContent=ok?'Correct — something in the current computation changed while θ remained fixed.':'The trained parameters and dataset did not move during this inference.';
  duplicateFeedback.className='feedback '+(ok?'good':'bad');
  if(ok) document.querySelector('#mysteryMachines').classList.remove('hidden');
}));

// MODULE 2 — Build the Silhouette
const requirements={transformer:['Attention','Feed-Forward'],bdh:['Local Nodes','Synapses'],hrm:['H Module','L Module','Recurrence']};
const placed={transformer:new Set(),bdh:new Set(),hrm:new Set()};
let selectedPart=null;
const buildFeedback=document.querySelector('#buildFeedback');
const partButtons=[...document.querySelectorAll('#partsTray [data-part]')];
const buildMachines=[...document.querySelectorAll('.machine-build')];
const clues={
  'Attention|bdh':'BDH is organized around local interactions, not Transformer-style attention as its defining structure.',
  'Attention|hrm':'HRM is defined by hierarchical recurrent modules operating at different timescales.',
  'Synapses|hrm':'HRM is defined by hierarchical recurrent modules operating at different timescales.',
  'Recurrence|transformer':'This lesson uses stacked attention + feed-forward as the Transformer’s defining structure.',
  'Local Nodes|transformer':'Local graph nodes belong to the BDH silhouette in this comparison.'
};
function updateBuild(machine){
  const block=document.querySelector(`.machine-build[data-machine="${machine}"]`);
  const req=requirements[machine];
  block.querySelector('.machine-status').textContent=`${placed[machine].size} / ${req.length} parts`;
  block.classList.toggle('complete',placed[machine].size===req.length);
  const canvas=block.querySelector('.machine-canvas');
  canvas.querySelector('.machine-placeholder')?.remove();
  canvas.querySelectorAll('.built-part').forEach(x=>x.remove());
  [...placed[machine]].forEach(part=>{
    const chip=document.createElement('span');chip.className='built-part';chip.textContent=part;canvas.append(chip);
  });
  if(buildMachines.every(x=>x.classList.contains('complete'))){
    document.querySelector('#runSameSignal').classList.remove('hidden');
    document.querySelector('#partsTray').classList.add('tray-complete');
    buildFeedback.textContent='All three silhouettes are complete. Run one signal through all of them.';
  }
}
function tryPlace(part,machine){
  if(requirements[machine].includes(part)){
    placed[machine].add(part);
    buildFeedback.textContent=`${part} locked into ${machine.toUpperCase()}.`;
    buildFeedback.className='build-feedback good';
    updateBuild(machine);
  }else{
    buildFeedback.textContent=clues[`${part}|${machine}`]||`That part is not one of the defining pieces requested for ${machine.toUpperCase()} in this lesson.`;
    buildFeedback.className='build-feedback bad';
  }
}
partButtons.forEach(button=>{
  button.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',button.dataset.part);});
  button.addEventListener('click',()=>{
    selectedPart=button.dataset.part;
    partButtons.forEach(x=>x.classList.toggle('selected-part',x===button));
    buildFeedback.textContent=`${selectedPart} selected — now click a silhouette.`;
  });
});
buildMachines.forEach(block=>{
  const machine=block.dataset.machine;
  const canvas=block.querySelector('.machine-canvas');
  canvas.addEventListener('dragover',e=>e.preventDefault());
  canvas.addEventListener('drop',e=>{e.preventDefault();tryPlace(e.dataTransfer.getData('text/plain'),machine);});
  canvas.addEventListener('click',()=>{if(selectedPart){tryPlace(selectedPart,machine);selectedPart=null;partButtons.forEach(x=>x.classList.remove('selected-part'));}});
});
document.querySelector('#runSameSignal').addEventListener('click',()=>{
  document.querySelector('#sameSignal').classList.remove('hidden');
  document.querySelector('#sameSignal').classList.add('running');
});

// MODULE 3 — Timeline scrubber
const scrubber=document.querySelector('#timelineScrubber');
const theta=document.querySelector('#timelineTheta');
const memObj=document.querySelector('#timelineMemory');
const workObj=document.querySelector('#timelineWorkspace');
const scene=document.querySelector('#timelineScene');
const contextChoices=document.querySelector('#timelineContextChoices');
const finalChoices=document.querySelector('#timelineFinalChoices');
const timelineFeedback=document.querySelector('#timelineFeedback');
const scrubBackHint=document.querySelector('#scrubBackHint');
const scenes=[
  {html:'<small>TRAINING</small><div class="scene-flow">Training Data <i>→</i> Learning <i>→</i> <b>θ</b></div><p>Memory/state for this test has not been created yet. No current problem is being solved.</p>',m:false,w:false,lock:false},
  {html:'<small>TRAINING ENDS</small><div class="scene-lock">θ <span>🔒</span></div><p>Training machinery disappears from view, but the trained parameters remain and are fixed for this experiment.</p>',m:false,w:false,lock:true},
  {html:'<small>TEST CONTEXT</small><div class="context-cards"><b>■ → ■■</b><b>▲ → ▲▲</b><b>● → ●●</b></div><p>Temporary information forms beside locked θ while the demonstrations are processed.</p>',m:true,w:false,lock:true},
  {html:'<small>QUERY</small><div class="workspace-flow"><span>context</span><i>+</i><b>◆ → ?</b><i>→</i><strong>WORKSPACE</strong></div><p>Memory/state carries useful information forward. Workspace is where the current query is actively transformed.</p>',m:true,w:true,lock:true},
  {html:'<small>REASONING</small><div class="workspace-steps">W₀ <i>→</i> W₁ <i>→</i> W₂ <i>→</i> W₃</div><p>θ stays stationary. Memory/state changes slowly or remains available. Workspace changes rapidly.</p>',m:true,w:true,lock:true},
  {html:'<small>ANSWER</small><div class="answer-pop">◆◆</div><p>The answer is exposed. Temporary context/state and workspace may be cleared or replaced depending on the system and inference setup.</p>',m:true,w:true,lock:true}
];
function renderTimeline(){
  const s=scenes[Number(scrubber.value)];
  scene.innerHTML=s.html;
  theta.classList.toggle('locked',s.lock);
  memObj.classList.toggle('active-object',s.m);
  memObj.classList.toggle('ghost-object',!s.m);
  workObj.classList.toggle('active-object',s.w);
  workObj.classList.toggle('ghost-object',!s.w);
  contextChoices.classList.toggle('hidden',Number(scrubber.value)!==2);
  finalChoices.classList.toggle('hidden',Number(scrubber.value)!==5);
  if(Number(scrubber.value)===5) scrubBackHint.classList.remove('hidden');
}
theta.addEventListener('click',()=>{
  scrubber.disabled=false;
  theta.classList.add('locked');
  document.querySelector('#timelineQuestion').innerHTML='<p>Correct. θ is the trained machinery that survives the training boundary.</p><span>Drag the scrubber across the timeline.</span>';
  scrubber.value=1;renderTimeline();
});
scrubber.addEventListener('input',renderTimeline);
contextChoices.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  contextChoices.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.dataset.correct==='true';button.classList.add(ok?'correct':'wrong');
  timelineFeedback.textContent=ok?'Correct — temporary information available during inference changed; θ did not.':'θ is still locked. The new demonstrations changed temporary inference-time information.';
  timelineFeedback.className='feedback '+(ok?'good':'bad');
}));
finalChoices.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  finalChoices.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.dataset.persist==='theta';button.classList.add(ok?'correct':'wrong');
  timelineFeedback.textContent=ok?'Correct — θ persists. Temporary context/state and workspace may be cleared or replaced depending on the system and inference setup.':'For the next unrelated task, the trained parameters persist; temporary state does not have to remain unchanged.';
  timelineFeedback.className='feedback '+(ok?'good':'bad');
}));
renderTimeline();

// MODULE 4 — Memory Eraser
const erased=new Set();
const eraserFeedback=document.querySelector('#eraserFeedback');
function eraseMachine(type){
  const machine=document.querySelector(`[data-eraser-machine="${type}"]`);
  if(erased.has(type)) return;
  erased.add(type);machine.classList.add('erased');
  const output=machine.querySelector('.machine-output');
  if(type==='transformer'){
    output.textContent='MEMORY LOST';
    eraserFeedback.innerHTML='<strong>Transformer:</strong> the earlier context disappeared, so attention has nothing task-specific to retrieve. θ remained locked. During autoregressive generation, cached K/V representations associated with that context would also disappear.';
  }else if(type==='bdh'){
    output.textContent='ASSOCIATION LOST';
    eraserFeedback.innerHTML='<strong>BDH:</strong> the nodes remained, but temporary connection strengths returned to baseline. The task-specific relationship disappeared while θ stayed locked.';
  }else{
    output.textContent='CONTEXT LOST';
    eraserFeedback.innerHTML='<strong>HRM:</strong> H and L returned toward their initial state. The recurrent history disappeared; the trained machinery remained.';
  }
  if(erased.size===3) document.querySelector('#matchChallenge').classList.remove('hidden');
}
document.querySelectorAll('[data-erase]').forEach(button=>button.addEventListener('click',()=>eraseMachine(button.dataset.erase)));

document.querySelector('#checkMatch').addEventListener('click',()=>{
  const expected={transformer:'Transformer',bdh:'BDH',hrm:'HRM'};
  const rows=[...document.querySelectorAll('#matchChallenge [data-clue]')];
  const ok=rows.every(row=>row.querySelector('select').value===expected[row.dataset.clue]);
  const feedback=document.querySelector('#matchFeedback');
  feedback.textContent=ok?'Correct — context removed → Transformer, synaptic state reset → BDH, recurrent state reset → HRM.':'Use the carrier that disappeared: earlier context, temporary synaptic strengths, or recurrent H/L state.';
  feedback.className='feedback '+(ok?'good':'bad');
  if(ok) document.querySelector('#wrongThingChallenge').classList.remove('hidden');
});
const finalSolved=new Set();
document.querySelectorAll('[data-final-machine] button').forEach(button=>button.addEventListener('click',()=>{
  const article=button.closest('[data-final-machine]');
  article.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.hasAttribute('data-correct');button.classList.add(ok?'correct':'wrong');
  if(ok){finalSolved.add(article.dataset.finalMachine);article.classList.add('solved');}
  const feedback=document.querySelector('#wrongThingFeedback');
  feedback.textContent=ok?'Correct — you removed temporary memory while leaving the trained machinery intact.':'That erases or changes the machine itself, not just the temporary information carrier.';
  feedback.className='feedback '+(ok?'good':'bad');
  if(finalSolved.size===3) document.querySelector('#memoryFinal').classList.remove('hidden');
}));

// MODULE 5 — The Query Port
const queryVisited=new Set();
const queryToken=document.querySelector('#queryToken');
const queryReadout=document.querySelector('#queryPortReadout');
let queryArmed=false;
function runQueryPort(machine){
  const port=document.querySelector(`[data-query-port="${machine}"]`);
  if(!port) return;
  queryVisited.add(machine);
  port.classList.add('received');
  document.querySelectorAll('[data-query-port]').forEach(x=>x.classList.toggle('focus',x===port));
  if(machine==='transformer'){
    port.querySelector('em').textContent='QUERY CONNECTED TO RELEVANT CONTEXT';
    queryReadout.innerHTML='<strong>TRANSFORMER:</strong> ◆ became an internal representation, joined accessible context, and a relevance link strengthened.';
  }else if(machine==='bdh'){
    port.querySelector('em').textContent="QUERY CHANGED THE NETWORK'S CURRENT ACTIVITY";
    queryReadout.innerHTML='<strong>BDH:</strong> a local region activated, activity spread through neighboring nodes, and previously strengthened synapses responded more strongly.';
  }else{
    port.querySelector('em').textContent='HIERARCHICAL COMPUTATION HAS BEGUN';
    port.querySelector('.hrm-port').classList.add('started');
    queryReadout.innerHTML='<strong>HRM:</strong> H₀ and L₀ initialized; L performed the first fast update while H changed more slowly.';
  }
  queryArmed=false;queryToken?.classList.remove('armed');
  if(queryVisited.size===3) document.querySelector('#queryBlindChallenge')?.classList.remove('hidden');
}
queryToken?.addEventListener('click',()=>{queryArmed=!queryArmed;queryToken.classList.toggle('armed',queryArmed);queryReadout.textContent=queryArmed?'Query selected. Choose a machine port.':'Send the same query into all three machines.';});
queryToken?.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','query');});
document.querySelectorAll('[data-query-port]').forEach(port=>{
  port.addEventListener('click',()=>{if(queryArmed||queryVisited.size>=0)runQueryPort(port.dataset.queryPort);});
  port.addEventListener('dragover',e=>e.preventDefault());
  port.addEventListener('drop',e=>{e.preventDefault();runQueryPort(port.dataset.queryPort);});
});
document.querySelector('#checkQueryBlind')?.addEventListener('click',()=>{
  const expected={transformer:'Transformer',bdh:'BDH',hrm:'HRM'};
  const rows=[...document.querySelectorAll('#queryBlindTraces [data-trace]')];
  const ok=rows.every(row=>row.querySelector('select').value===expected[row.dataset.trace]);
  const f=document.querySelector('#queryBlindFeedback');
  f.textContent=ok?'Correct — attention routing → Transformer, local activation spreading → BDH, H/L recurrent initialization → HRM.':'Match the first internal consequence, not the final answer.';
  f.className='feedback '+(ok?'good':'bad');
  if(ok) document.querySelector('#queryPortTakeaway')?.classList.remove('hidden');
});

// MODULE 6 — The Hidden Room
let hiddenTick=null,hiddenLayer=0,hiddenL=0,hiddenH=0,hiddenFrozen=false;
const hiddenMachines=document.querySelector('#hiddenMachines');
function renderHiddenRoom(){
  const layerArticle=document.querySelector('[data-hidden-machine="transformer"]');
  layerArticle?.querySelectorAll('.layer-chain b').forEach((b,i)=>b.classList.toggle('active',i===Math.min(hiddenLayer,3)));
  const readout=layerArticle?.querySelector('.hidden-state-readout strong');if(readout) readout.textContent='X'+Math.min(hiddenLayer+1,4);
  const lMeter=document.querySelector('#lMeter');const hMeter=document.querySelector('#hMeter');
  if(lMeter) lMeter.style.width=Math.min(100,18+hiddenL*18)+'%';if(hMeter) hMeter.style.width=Math.min(100,16+hiddenH*30)+'%';
  const state=document.querySelector('#hrmHiddenState');if(state) state.textContent=`H${hiddenH} / L${hiddenL}`;
}
document.querySelector('#runHiddenRoom')?.addEventListener('click',e=>{
  e.currentTarget.disabled=true;hiddenMachines?.classList.add('running');
  document.querySelector('.freeze-transformer')?.removeAttribute('disabled');
  hiddenTick=setInterval(()=>{
    if(!hiddenFrozen) hiddenLayer=(hiddenLayer+1)%4;
    hiddenL++;if(hiddenL%3===0) hiddenH++;
    renderHiddenRoom();
    if(hiddenL>=6){clearInterval(hiddenTick);document.querySelector('#hiddenRoomQuestion')?.classList.remove('hidden');}
  },520);
});
document.querySelector('.freeze-transformer')?.addEventListener('click',e=>{hiddenFrozen=!hiddenFrozen;e.currentTarget.textContent=hiddenFrozen?'CONTINUE':'FREEZE';});
const hiddenChoices=document.querySelector('#hiddenRoomChoices');
hiddenChoices?.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  hiddenChoices.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));
  const ok=button.dataset.correct==='true';button.classList.add(ok?'correct':'wrong');hiddenChoices.querySelector('[data-correct="true"]').classList.add('correct');
  const f=document.querySelector('#hiddenRoomFeedback');f.textContent=ok?'Correct — computation can continue entirely inside changing representations and states.':'The output screen is off, but the internal state traces are still changing.';f.className='feedback '+(ok?'good':'bad');
  if(ok) document.querySelector('#turnOutputOn')?.classList.remove('hidden');
}));
document.querySelector('#turnOutputOn')?.addEventListener('click',e=>{document.querySelector('#outputSwitch')?.classList.remove('off');document.querySelector('#outputSwitch')?.classList.add('on');document.querySelector('#outputSwitch strong').textContent='ON';document.querySelector('#hiddenOutputReveal')?.classList.remove('hidden');document.querySelector('#hiddenRoomTakeaway')?.classList.remove('hidden');e.currentTarget.classList.add('hidden');});

// MODULE 7 — Deliver the Signal
const signalSolved=new Set();
function activateSignalRound(name){document.querySelectorAll('[data-signal-round]').forEach(x=>x.classList.toggle('active',x.dataset.signalRound===name));const names=['transformer','bdh','hrm'];document.querySelectorAll('#signalProgress span').forEach((s,i)=>{s.classList.toggle('active',names[i]===name);s.classList.toggle('done',signalSolved.has(names[i]));});}
function finishSignal(name,next){signalSolved.add(name);document.querySelectorAll('#signalProgress span').forEach((s,i)=>s.classList.toggle('done',signalSolved.has(['transformer','bdh','hrm'][i])));if(signalSolved.size===3)document.querySelector('#signalBlindChallenge')?.classList.remove('hidden');else if(next)setTimeout(()=>activateSignalRound(next),550);}
const attentionDial=document.querySelector('#attentionDial');
attentionDial?.addEventListener('input',()=>{const v=Number(attentionDial.value);document.querySelector('#attentionValue').textContent=v+'%';document.querySelector('#attentionBeam')?.style.setProperty('--strength',v/100);const f=document.querySelector('#transformerSignalFeedback');if(v>=72){f.textContent='A CAN DIRECTLY INFLUENCE E THROUGH ATTENTION';f.classList.add('good');finishSignal('transformer','bdh');}else f.textContent='Increase E\'s attention to A.';});
let bdhStep=0;const bdhNodes=['A','B','C','E'];
document.querySelector('#propagateBdh')?.addEventListener('click',()=>{bdhStep=Math.min(bdhStep+1,bdhNodes.length);document.querySelectorAll('#bdhRoute [data-bdh-node]').forEach((n,i)=>n.classList.toggle('active',i<bdhStep));const f=document.querySelector('#bdhSignalFeedback');if(bdhStep<bdhNodes.length)f.textContent=`Local propagation reached ${bdhNodes[Math.max(0,bdhStep-1)]}.`;else{f.textContent='LOCAL STEPS CREATED A LONGER-RANGE EFFECT';f.classList.add('good');finishSignal('bdh','hrm');}});
let hrmTransferStep=0;
document.querySelector('#transferUp')?.addEventListener('click',e=>{hrmTransferStep=1;document.querySelector('#hrmTransfer [data-level="l1"]')?.classList.add('active');document.querySelector('#hrmTransfer [data-level="h"]')?.classList.add('active');e.currentTarget.disabled=true;document.querySelector('#transferDown').disabled=false;document.querySelector('#hrmSignalFeedback').textContent='Detail moved upward: L → H. The slow high-level state changed.';});
document.querySelector('#transferDown')?.addEventListener('click',e=>{if(hrmTransferStep!==1)return;hrmTransferStep=2;document.querySelector('#hrmTransfer [data-level="l2"]')?.classList.add('active');e.currentTarget.disabled=true;const f=document.querySelector('#hrmSignalFeedback');f.textContent='INFORMATION CROSSED LEVELS AND TIMESCALES — detail → abstraction → new detailed computation';f.classList.add('good');finishSignal('hrm');});
document.querySelector('#checkSignalBlind')?.addEventListener('click',()=>{const expected={transformer:'Transformer',bdh:'BDH',hrm:'HRM'};const rows=[...document.querySelectorAll('[data-route-match]')];const ok=rows.every(s=>s.value===expected[s.dataset.routeMatch]);const f=document.querySelector('#signalBlindFeedback');f.textContent=ok?'Correct — three architectures, three communication topologies.':'Look at whether the route is relevance-based, local graph propagation, or fast/slow hierarchical recurrence.';f.className='feedback '+(ok?'good':'bad');if(ok)document.querySelector('#signalTakeaway')?.classList.remove('hidden');});

// MODULE 8 — Signal Forensics
const forensicCases=[
  {arch:'TRAINING KNOWLEDGE',clue:'“This information was learned from millions of training examples and exists before the current task arrives.”',targets:['Context','Workspace','θ','Output'],answer:'θ',visual:'theta'},
  {arch:'TRANSFORMER',clue:'“The current position needs information from an earlier representation.”',targets:['Current token only','Attention connection / earlier representation','Training dataset','Output token'],answer:'Attention connection / earlier representation',visual:'attention'},
  {arch:'BDH',clue:'“The association B → BLUE was created during this task.”',targets:["Model's permanent weights",'Dynamic synaptic state','Decoder','Training dataset'],answer:'Dynamic synaptic state',visual:'synapse'},
  {arch:'HRM',clue:'“This is slow-changing information coordinating several faster computation cycles.”',targets:['H state','L state','Output head','Training data'],answer:'H state',visual:'h'},
  {arch:'HRM',clue:'“This representation is changing rapidly while working through the current detail.”',targets:['H state','L state','Parameters θ','Decoder'],answer:'L state',visual:'l'}
];
let forensicI=0;
function forensicVisual(type){if(type==='theta')return '<div class="forensic-theta">θ <span>trained machinery</span></div>';if(type==='attention')return '<div class="forensic-attention"><b>earlier</b><i></i><strong>current</strong></div>';if(type==='synapse')return '<div class="forensic-synapse"><b>B</b><i></i><strong>BLUE</strong></div>';if(type==='h')return '<div class="forensic-hrm"><b class="hot">H</b><i>↕</i><b>L</b></div>';return '<div class="forensic-hrm"><b>H</b><i>↕</i><b class="hot">L</b></div>';}
function renderForensic(){const c=forensicCases[forensicI];document.querySelector('#forensicIndex').textContent=`CASE ${forensicI+1} / ${forensicCases.length}`;document.querySelector('#forensicArchitecture').textContent=c.arch;document.querySelector('#forensicClue').textContent=c.clue;document.querySelector('#forensicMachine').innerHTML=forensicVisual(c.visual);const targets=document.querySelector('#forensicTargets');targets.replaceChildren();c.targets.forEach(t=>{const b=document.createElement('button');b.textContent=t;b.addEventListener('click',()=>{targets.querySelectorAll('button').forEach(x=>x.classList.remove('correct','wrong'));const ok=t===c.answer;b.classList.add(ok?'correct':'wrong');const f=document.querySelector('#forensicFeedback');f.textContent=ok?(forensicI===0?'PARAMETERS θ':forensicI===1?'Attention is providing access to the relevant earlier representation.':forensicI===2?'Dynamic synaptic state carries the task-created association.':forensicI===3?'H state carries the slow coordinating information.':'L state carries the rapidly changing detail.'):'That is not the carrier described by the clue.';f.className='feedback '+(ok?'good':'bad');if(ok)setTimeout(()=>{if(forensicI<forensicCases.length-1){forensicI++;renderForensic();}else document.querySelector('#forensicFinal')?.classList.remove('hidden');},520);});targets.append(b);});document.querySelector('#forensicFeedback').textContent='';document.querySelector('#forensicFeedback').className='feedback';}
renderForensic();
document.querySelector('#checkForensicFinal')?.addEventListener('click',()=>{const ok=document.querySelector('#forensicArchSelect').value==='BDH'&&document.querySelector('#forensicRoleSelect').value==='temporary working state';const f=document.querySelector('#forensicFinalFeedback');f.textContent=ok?'Correct — BDH / temporary working state.':'A changing task-created synaptic connection points to BDH dynamic synaptic working state.';f.className='feedback '+(ok?'good':'bad');if(ok)document.querySelector('#forensicTakeaway')?.classList.remove('hidden');});

// MODULE 9 — The Decoder Dock
let activeDock='language';const dockSolved=new Set();
const dockConfig={language:{head:'language',detail:'PARIS 0.72 · LONDON 0.13 · ROME 0.08',out:'PARIS'},class:{head:'class',detail:'CAT 91% · DOG 6% · OTHER 3%',out:'CAT 91%'},grid:{head:'grid',detail:'Decoded spatial output',out:'■ □ ■\n□ ■ □\n■ □ ■'}};
function setDock(name){activeDock=name;document.querySelectorAll('#dockTabs button').forEach(b=>b.classList.toggle('active',b.dataset.dock===name));document.querySelectorAll('.dock-head').forEach(b=>b.classList.remove('correct','wrong'));document.querySelector('#dockOutput').textContent='?';document.querySelector('#dockDetail').textContent='Choose an output mapping.';}
document.querySelectorAll('#dockTabs button').forEach(b=>b.addEventListener('click',()=>setDock(b.dataset.dock)));
document.querySelectorAll('.dock-head').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.dock-head').forEach(x=>x.classList.remove('correct','wrong'));const cfg=dockConfig[activeDock];const ok=b.dataset.head===cfg.head;b.classList.add(ok?'correct':'wrong');const f=document.querySelector('#dockFeedback');if(ok){dockSolved.add(activeDock);document.querySelector('#dockDetail').textContent=cfg.detail;const out=document.querySelector('#dockOutput');out.textContent=cfg.out;out.classList.toggle('grid-output',activeDock==='grid');f.textContent='Correct output mapping connected.';f.className='feedback good';if(dockSolved.size===3)document.querySelector('#decoderTakeaway')?.classList.remove('hidden');}else{document.querySelector('#dockOutput').textContent='INCOMPATIBLE';document.querySelector('#dockDetail').textContent='The representation is being exposed through the wrong output space.';f.textContent='A useful internal representation still needs the correct output mapping.';f.className='feedback bad';}}));
document.querySelector('#incompatibleDock')?.addEventListener('click',()=>{setDock('grid');const word=document.querySelector('.dock-head[data-head="language"]');word?.classList.add('wrong');document.querySelector('#dockOutput').textContent='???';document.querySelector('#dockDetail').textContent='GRID STATE → WORD OUTPUT produced an incompatible result.';const f=document.querySelector('#dockFeedback');f.textContent='A useful internal representation still needs the correct output mapping.';f.className='feedback bad';});

// MODULE 10 — Three-Machine Replay
const replaySteps=[
  {phase:'INPUT',t:'Same puzzle entered all three machines.',states:{transformer:'Same input represented',bdh:'Same input injected',hrm:'Same input initializes H / L'}},
  {phase:'EARLY',t:'The first architectural differences appear.',states:{transformer:'Attention pattern forms',bdh:'Local nodes activate',hrm:'L begins rapid recurrence'}},
  {phase:'MIDDLE',t:'Each machine develops its internal computation differently.',states:{transformer:'Deeper representations change',bdh:'Activity propagates; network state evolves',hrm:'H updates and feeds back into L'}},
  {phase:'LATE',t:'All three approach a prediction-ready representation.',states:{transformer:'Prediction-ready hidden state',bdh:'Prediction-ready network state',hrm:'Prediction-ready recurrent state'}},
  {phase:'OUTPUT',t:'Educational replay complete: all three expose the same target answer.',states:{transformer:'OUTPUT: ✓',bdh:'OUTPUT: ✓',hrm:'OUTPUT: ✓'}}
];
const replayScrubber=document.querySelector('#replayScrubber');
function renderReplay(){
  if(!replayScrubber)return;
  const i=Number(replayScrubber.value),stepData=replaySteps[i];
  document.querySelectorAll('[data-replay-machine]').forEach(card=>{
    const machine=card.dataset.replayMachine;
    card.dataset.phase=String(i);
    card.querySelector('.replay-state').textContent=stepData.states[machine];
  });
  const f=document.querySelector('#replayFeedback');f.textContent=`${stepData.phase} — ${stepData.t}`;
  if(i===4)document.querySelector('#replayComparison')?.classList.remove('hidden');
}
document.querySelector('#runAllMachines')?.addEventListener('click',()=>{document.querySelector('#replayTimelineWrap')?.classList.remove('hidden');replayScrubber.value=0;renderReplay();});
replayScrubber?.addEventListener('input',renderReplay);
let draggedRoute=null;const routeSolved=new Set();
document.querySelectorAll('[data-route-card]').forEach(card=>{card.addEventListener('dragstart',()=>draggedRoute=card);card.addEventListener('click',()=>{draggedRoute=card;document.querySelectorAll('[data-route-card]').forEach(x=>x.classList.toggle('selected',x===card));});});
document.querySelectorAll('[data-route-drop]').forEach(drop=>{
  drop.addEventListener('dragover',e=>e.preventDefault());
  drop.addEventListener('drop',e=>{e.preventDefault();placeRoute(drop);});
  drop.addEventListener('click',()=>{if(draggedRoute)placeRoute(drop);});
});
function placeRoute(drop){
  const card=draggedRoute;if(!card)return;const ok=card.dataset.routeCard===drop.dataset.routeDrop;const f=document.querySelector('#routeDropFeedback');
  if(!ok){f.textContent=card.dataset.routeCard==='none'?'That clue belongs to NONE: inference does not require permanent weight updates every time.':'That route describes a different computational organization.';f.className='feedback bad';return;}
  card.classList.remove('selected');card.classList.add('used');card.draggable=false;drop.append(card);routeSolved.add(drop.dataset.routeDrop);draggedRoute=null;f.textContent=drop.dataset.routeDrop==='none'?'Correct — permanent weight update during every inference belongs to NONE.':'Correct placement.';f.className='feedback good';
  if(routeSolved.size===4)document.querySelector('#replayTakeaway')?.classList.remove('hidden');
}

// MODULE 11 — The Depth Elevator
let depthStep=0;let depthSegment=0;const maxDepthSteps=7;
function renderDepth(){
  const t=document.querySelector('#transformerDepth'),b=document.querySelector('#bdhDepth'),h=document.querySelector('#hrmDepth'),f=document.querySelector('#depthFeedback');if(!t||!b||!h)return;
  const transformerBlock=Math.min(depthStep,4),state=depthStep, l=depthStep%3, hIndex=Math.floor(depthStep/3);
  t.textContent=depthStep===0?'DEPTH 0':`BLOCK ${transformerBlock}${depthStep>4?' · STACK COMPLETE':''}`;
  b.textContent=`STATE ${state}`;
  h.innerHTML=`<b>H${hIndex}</b><span>L${l}</span>`;
  if(depthStep===0)f.textContent='Depth 0 — all three machines are at their starting state.';
  else if(depthStep%3===0){f.textContent=`Step ${depthStep}: Transformer crossed another stacked transformation; BDH evolved to state ${state}; HRM completed fast L updates and changed H.`;document.querySelector('#haltPanel')?.classList.remove('hidden');}
  else f.textContent=`Step ${depthStep}: Transformer advances through stacked blocks; BDH evolves state; HRM performs another fast L update under slower H.`;
  document.querySelector('[data-depth-machine="transformer"]')?.classList.add('active');document.querySelector('[data-depth-machine="bdh"]')?.classList.add('active');document.querySelector('[data-depth-machine="hrm"]')?.classList.add('active');
  if(depthStep>=maxDepthSteps){document.querySelector('#goDeeper').disabled=true;document.querySelector('#depthSummary')?.classList.remove('hidden');document.querySelector('#depthTakeaway')?.classList.remove('hidden');}
}
document.querySelector('#goDeeper')?.addEventListener('click',()=>{if(depthStep<maxDepthSteps){depthStep++;renderDepth();}});
document.querySelector('#haltChoice')?.addEventListener('click',()=>{const f=document.querySelector('#depthFeedback');f.textContent='HALT selected conceptually: the recurrent segment would stop here if additional computation were not useful.';document.querySelector('#haltPanel')?.classList.add('hidden');});
document.querySelector('#continueChoice')?.addEventListener('click',()=>{depthSegment++;const f=document.querySelector('#depthFeedback');f.textContent='CONTINUE selected conceptually: another recurrent segment can begin.';document.querySelector('#haltPanel')?.classList.add('hidden');});
renderDepth();

// MODULE 12 — Black Box Reconstruction
const reconstructions=[
  {name:'TRANSFORMER',observation:'Dynamic long-range relevance links appear.',visual:'transformer-observation',required:['Attention','Feed-forward transformation'],diagram:'representation → attention → feed-forward → repeat'},
  {name:'BDH',observation:'Signal moves through irregular neighboring units and temporary connections change.',visual:'bdh-observation',required:['Local nodes','Synaptic connections/state'],diagram:'local nodes → local interaction → changing synaptic/network state'},
  {name:'HRM',observation:'A fast subsystem repeatedly updates while a slower subsystem occasionally changes.',visual:'hrm-observation',required:['H Module','L Module','Recurrence'],diagram:'H ↕ L → repeated fast/slow recurrent updates'}
];
let reconstructionI=0,draggedComponent=null;const placedComponents=new Set();
function renderObservation(){const r=reconstructions[reconstructionI],v=document.querySelector('#observationVisual');document.querySelector('#observationTitle').textContent=r.observation;v.className=`observation-visual ${r.visual}`;v.innerHTML=r.name==='HRM'?'<b>H</b><span><i>L</i><i>L</i><i>L</i></span>':'<i></i><i></i><i></i><i></i><i></i>';document.querySelector('#observationWindow').classList.remove('hidden');document.querySelector('#rebuildPhase').classList.add('hidden');}
function renderRebuild(){placedComponents.clear();document.querySelector('#placedComponents').replaceChildren();document.querySelectorAll('[data-component]').forEach(b=>{b.classList.remove('used','selected');b.draggable=true;});document.querySelector('#rebuildIndex').textContent=`RECONSTRUCTION ${String.fromCharCode(65+reconstructionI)} / 3`;document.querySelector('#rebuildFeedback').textContent='';}
document.querySelector('#beginRebuild')?.addEventListener('click',()=>{document.querySelector('#observationWindow').classList.add('hidden');document.querySelector('#rebuildPhase').classList.remove('hidden');renderRebuild();});
document.querySelectorAll('[data-component]').forEach(card=>{card.addEventListener('dragstart',()=>draggedComponent=card);card.addEventListener('click',()=>{draggedComponent=card;document.querySelectorAll('[data-component]').forEach(x=>x.classList.toggle('selected',x===card));});});
const rebuildCanvas=document.querySelector('#rebuildCanvas');rebuildCanvas?.addEventListener('dragover',e=>e.preventDefault());rebuildCanvas?.addEventListener('drop',e=>{e.preventDefault();addComponent();});rebuildCanvas?.addEventListener('click',e=>{if(e.target===rebuildCanvas||e.target.closest('#placedComponents'))addComponent();});
function addComponent(){if(!draggedComponent||draggedComponent.classList.contains('used'))return;const c=draggedComponent.dataset.component;placedComponents.add(c);draggedComponent.classList.add('used');draggedComponent.classList.remove('selected');const chip=document.createElement('button');chip.textContent=c;chip.type='button';chip.addEventListener('click',()=>{placedComponents.delete(c);draggedComponent=null;document.querySelector(`[data-component="${CSS.escape(c)}"]`)?.classList.remove('used');chip.remove();});document.querySelector('#placedComponents').append(chip);draggedComponent=null;}
document.querySelector('#clearRebuild')?.addEventListener('click',()=>renderRebuild());
document.querySelector('#checkRebuild')?.addEventListener('click',()=>{
  const r=reconstructions[reconstructionI],f=document.querySelector('#rebuildFeedback');const required=new Set(r.required);const missing=r.required.filter(x=>!placedComponents.has(x));const extra=[...placedComponents].filter(x=>!required.has(x));
  if(extra.length){const distractor=extra[0];f.textContent=distractor==='Tree search'||distractor==='Majority vote'||distractor==='Prompt optimizer'?`${distractor} can be an external inference strategy, but it is not a defining component of ${r.name}.`:distractor==='Gradient update'?'Changing model parameters is different from the inference-time state mechanisms being reconstructed here.':`${distractor} belongs to a different architecture.`;f.className='feedback bad';return;}
  if(missing.length){f.textContent=`Still missing: ${missing.join(' + ')}.`;f.className='feedback bad';return;}
  f.innerHTML=`<strong>${r.name}</strong> — ${r.diagram}`;f.className='feedback good';
  setTimeout(()=>{if(reconstructionI<reconstructions.length-1){reconstructionI++;renderObservation();}else{document.querySelector('#rebuildPhase').classList.add('hidden');document.querySelector('#reconstructTakeaway')?.classList.remove('hidden');}},700);
});
renderObservation();

// MODULE 13 — The Black Box Lab
let experimentStep=0;
const blackboxEvidence={
  input:{alpha:'Dynamic long-range relevance links appear.',beta:'Signal spreads locally through graph nodes.',gamma:'A fast loop begins beneath a slower loop.'},
  state:{alpha:'Accessible context representations are visible.',beta:'Temporary synaptic strengths are visible.',gamma:'Recurrent H / L states are visible.'},
  step:{alpha:'Another stacked transformation occurs.',beta:'The network state evolves.',gamma:'Several L updates occur before H changes.'}
};
document.querySelectorAll('[data-experiment]').forEach(button=>button.addEventListener('click',()=>{
  const kind=button.dataset.experiment;document.querySelectorAll('[data-blackbox]').forEach(card=>{const key=card.dataset.blackbox;card.classList.add(`experiment-${kind}`);card.querySelector('.blackbox-readout').textContent=blackboxEvidence[kind][key];});button.classList.add('used');button.disabled=true;experimentStep++;
  if(kind==='input')document.querySelector('[data-experiment="state"]').disabled=false;
  if(kind==='state')document.querySelector('[data-experiment="step"]').disabled=false;
  if(experimentStep>=3)document.querySelector('#classificationPhase')?.classList.remove('hidden');
}));
let draggedArch=null;const classifications={};
document.querySelectorAll('[data-arch-label]').forEach(label=>{label.addEventListener('dragstart',()=>draggedArch=label);label.addEventListener('click',()=>{draggedArch=label;document.querySelectorAll('[data-arch-label]').forEach(x=>x.classList.toggle('selected',x===label));});});
document.querySelectorAll('[data-classify-drop]').forEach(drop=>{drop.addEventListener('dragover',e=>e.preventDefault());drop.addEventListener('drop',e=>{e.preventDefault();placeArchitecture(drop);});drop.addEventListener('click',()=>{if(draggedArch)placeArchitecture(drop);});});
function placeArchitecture(drop){if(!draggedArch)return;const name=draggedArch.dataset.archLabel;Object.keys(classifications).forEach(k=>{if(classifications[k]===name)delete classifications[k];});classifications[drop.dataset.classifyDrop]=name;drop.querySelectorAll('strong').forEach(x=>x.remove());const tag=document.createElement('strong');tag.textContent=name;drop.append(tag);document.querySelectorAll('[data-arch-label]').forEach(x=>x.classList.remove('selected'));draggedArch=null;const f=document.querySelector('#classificationFeedback');if(Object.keys(classifications).length===3){const ok=classifications.alpha==='Transformer'&&classifications.beta==='BDH'&&classifications.gamma==='HRM';f.textContent=ok?'Classification hypothesis is correct. Now justify every choice with evidence.':'At least one label conflicts with the observed structure. Recheck the three experiments.';f.className='feedback '+(ok?'good':'bad');if(ok){renderEvidenceCases();document.querySelector('#evidencePhase')?.classList.remove('hidden');}}}
const reasonBank={alpha:[['Attention-based dynamic relevance',true],['Stacked transformations',true],['Uses majority voting',false],['Requires parameter updates for every query',false]],beta:[['Locally interacting graph nodes',true],['Dynamic synaptic working state',true],['Two recurrent H/L levels',false],['Prompt optimizer',false]],gamma:[['Two interacting recurrent levels',true],['Different computational timescales',true],['Uses majority voting',false],['Requires parameter updates for every query',false]]};
function renderEvidenceCases(){const wrap=document.querySelector('#evidenceCases');wrap.replaceChildren();Object.entries(reasonBank).forEach(([key,reasons])=>{const article=document.createElement('article');article.dataset.evidenceMachine=key;article.innerHTML=`<small>MACHINE ${key==='alpha'?'α':key==='beta'?'β':'γ'} — ${classifications[key].toUpperCase()}</small>`;const choices=document.createElement('div');choices.className='evidence-choices';reasons.forEach(([text,correct])=>{const b=document.createElement('button');b.textContent=text;b.dataset.correct=correct?'true':'false';b.addEventListener('click',()=>{b.classList.toggle('selected');});choices.append(b);});article.append(choices);wrap.append(article);});}
document.querySelector('#checkEvidence')?.addEventListener('click',()=>{const cases=[...document.querySelectorAll('[data-evidence-machine]')];const ok=cases.every(article=>{const selected=[...article.querySelectorAll('button.selected')];return selected.length===2&&selected.every(b=>b.dataset.correct==='true');});const f=document.querySelector('#evidenceFeedback');f.textContent=ok?'Accepted — each architecture was identified from multiple structural clues, not a single buzzword.':'Each machine needs exactly two structural reasons, and both must be architecture evidence.';f.className='feedback '+(ok?'good':'bad');if(ok)document.querySelector('#impostorPhase')?.classList.remove('hidden');});
document.querySelectorAll('.impostor-clues button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.impostor-clues button').forEach(x=>x.classList.remove('correct','wrong'));const ok=button.hasAttribute('data-impostor');button.classList.add(ok?'correct':'wrong');const f=document.querySelector('#impostorFeedback');f.textContent=ok?'Correct — 32 independent samples + majority vote is an external inference strategy, not HRM\'s defining architecture.':'That clue is structural evidence for HRM itself.';f.className='feedback '+(ok?'good':'bad');if(ok)document.querySelector('#chapterReveal')?.classList.remove('hidden');}));
document.querySelector('#computeBudget')?.addEventListener('input',e=>{document.querySelector('#computeBudgetOutput').textContent=`${e.target.value}×`;});
document.querySelector('.compute-next')?.addEventListener('click',e=>e.preventDefault());

showStep(0);

// ============================================================
// MODULES 5–13 — SHARED 100-POINT ARCHITECTURE MASTERY SYSTEM
// Explore remains unscored. Scoring begins only when the learner
// explicitly opens "Check My Understanding" for a module.
// ============================================================
const MASTERY_STORAGE_KEY='dataforge-architecture-mastery-v1';
const masteryMisconceptionDefs={
  tempParams:{label:'Temporary state = trained parameters',reviewModule:8,reviewTarget:'#signalForensicsLab',repairPrompt:'A demonstration changes task behavior while θ remains fixed. What changed?',repairOptions:[['The temporary context/state used during this task',true],['The trained parameters θ',false],['The training dataset',false]]},
  cotRequired:{label:'Reasoning requires visible Chain-of-Thought',reviewModule:6,reviewTarget:'#hiddenRoomLab',repairPrompt:'The output screen is off, but hidden representations keep updating. Is internal computation still occurring?',repairOptions:[['Yes — hidden computation can continue without visible reasoning text',true],['No — reasoning exists only when a Chain-of-Thought is printed',false]]},
  archStrategy:{label:'Architecture = inference strategy',reviewModule:12,reviewTarget:'#reconstructionLab',repairPrompt:'Tree search is wrapped around a model at inference time. Does that make tree search a defining neural architecture component?',repairOptions:[['No — it is an inference strategy that can be placed around an architecture',true],['Yes — any inference-time strategy becomes part of the architecture',false]]},
  stateRetrain:{label:'Recurrence/state change = weight retraining',reviewModule:11,reviewTarget:'#depthElevatorLab',repairPrompt:'During inference HRM moves from H₀ to H₁ while θ remains fixed. What happened?',repairOptions:[['The recurrent state changed; the model was not retrained',true],['The model weights were retrained for the query',false]]},
  stateEqualsAnswer:{label:'Internal state = final answer',reviewModule:9,reviewTarget:'#decoderDockLab',repairPrompt:'A hidden vector contains answer-relevant information. What is still needed before the user can observe a token, class, grid, or action?',repairOptions:[['An output mapping / head / decoder',true],['Nothing — the hidden state is already the observable answer',false]]}
};

const masteryModules={
  5:{
    focus:'How the same query enters Transformer, BDH, and HRM differently.',lab:'#queryPortLab',
    questions:[
      {id:'m5-core',part:'Core Task',points:50,prompt:'The same query ◆ → ? enters all three machines. Which comparison is structurally correct?',hint:'Focus on the first internal consequence of the query, not on the final answer.',domains:['Architecture Recognition','Information Flow'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer routes relevance through attention; BDH perturbs local network activity/state; HRM begins H/L recurrent computation.',true],
        ['All three must update their trained weights before they can use the query.',false,'stateRetrain'],
        ['Transformer, BDH, and HRM all begin with the same attention operation.',false],
        ['The query is already the final output representation in all three systems.',false,'stateEqualsAnswer'] ]},
      {id:'m5-mech',part:'Mechanism Understanding',points:30,prompt:'You see three first-step traces: dynamic attention links, local activation spreading, and H/L initialization. What is the correct mapping?',hint:'Match each trace to the architecture’s communication/recurrent structure.',domains:['Architecture Recognition','Information Flow'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer → attention links; BDH → local spreading; HRM → H/L initialization.',true],
        ['Transformer → H/L; BDH → attention links; HRM → local spreading.',false],
        ['Transformer → local spreading; BDH → H/L; HRM → attention links.',false],
        ['All three traces are just different names for weight updates.',false,'stateRetrain'] ]},
      {id:'m5-transfer',part:'Transfer Check',points:20,prompt:'A model behaves differently after seeing demonstrations, but θ is locked. Which explanation is best?',hint:'Separate what training fixed from what the current inference can temporarily carry.',domains:['Memory & State'],architectures:['Transformer','BDH','HRM'],options:[
        ['Temporary context/state changed what the fixed machinery could use for this problem.',true],
        ['The demonstrations silently became new trained parameters.',false,'tempParams'],
        ['The training dataset must have been edited.',false],
        ['A visible Chain-of-Thought must have rewritten the weights.',false,'cotRequired'] ]}
    ]
  },
  6:{
    focus:'Hidden internal computation without requiring visible reasoning text.',lab:'#hiddenRoomLab',
    questions:[
      {id:'m6-core',part:'Core Task',points:50,prompt:'The output display is switched off, but hidden representations continue changing. What follows?',hint:'Output visibility and internal computation are different layers of the process.',domains:['Internal Computation'],architectures:['Transformer','BDH','HRM'],options:[
        ['Internal computation can still be occurring even though no reasoning text is visible.',true],
        ['No visible Chain-of-Thought means no reasoning occurred.',false,'cotRequired'],
        ['Only Transformer can compute without printing intermediate text.',false,'cotRequired'],
        ['The model must be retraining its weights while the screen is off.',false,'stateRetrain'] ]},
      {id:'m6-mech',part:'Mechanism Understanding',points:30,prompt:'Which description correctly locates hidden computation in the three machines?',hint:'Think layers for Transformer, evolving network state for BDH, and recurrent states for HRM.',domains:['Internal Computation','Architecture Recognition'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer: successive hidden representations; BDH: evolving network activity/state; HRM: recurrent H/L states.',true],
        ['Transformer: majority vote; BDH: prompt rewrite; HRM: tree search.',false,'archStrategy'],
        ['All useful computation exists only in the final decoded token.',false,'stateEqualsAnswer'],
        ['All three reason only by producing visible natural-language steps.',false,'cotRequired'] ]},
      {id:'m6-transfer',part:'Transfer Check',points:20,prompt:'A non-language model solves a grid task without ever generating sentences. Can its hidden-state transformations still count as internal reasoning computation in this lesson?',hint:'Do not equate reasoning with a particular output format.',domains:['Internal Computation'],architectures:['Transformer','BDH','HRM'],options:[
        ['Yes — useful internal transformations need not be expressed as text.',true],
        ['No — reasoning requires visible Chain-of-Thought sentences.',false,'cotRequired'],
        ['Only if it updates θ during the task.',false,'stateRetrain'] ]}
    ]
  },
  7:{
    focus:'Routing differences between attention, local graph propagation, and hierarchical recurrence.',lab:'#deliverSignalLab',
    questions:[
      {id:'m7-core',part:'Core Task',points:50,prompt:'A must influence E. Which route description best distinguishes the architectures?',hint:'Compare who can communicate with whom and whether influence is direct, local, or cross-level.',domains:['Information Flow'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer can form relevance-based attention links; BDH propagates through local graph interactions; HRM exchanges information between fast L and slower H dynamics.',true],
        ['All three require A to move one neighboring step at a time.',false],
        ['All three route information by running 32 independent samples.',false,'archStrategy'],
        ['All three must update trained parameters to move information.',false,'stateRetrain'] ]},
      {id:'m7-mech',part:'Mechanism Understanding',points:30,prompt:'Why can BDH produce a longer-range effect even though its basic interactions are local?',hint:'A chain of local interactions can transmit influence farther than one edge.',domains:['Information Flow'],architectures:['BDH'],options:[
        ['Influence can propagate across multiple local steps, with graph hubs also helping connect regions.',true],
        ['Every node directly attends to every other node exactly like a Transformer.',false],
        ['The graph retrains its permanent weights at each hop.',false,'stateRetrain'],
        ['Majority voting teleports the signal to the destination.',false,'archStrategy'] ]},
      {id:'m7-transfer',part:'Transfer Check',points:20,prompt:'A fast low-level clue changes a slower coordinating state, which then shapes the next fast cycle. Which information-flow pattern is this?',hint:'Look for information crossing levels operating at different timescales.',domains:['Information Flow','Architecture Recognition'],architectures:['HRM'],options:[
        ['HRM hierarchical recurrence: L → H → later L computation.',true],
        ['Transformer vocabulary decoding.',false],
        ['BDH local graph propagation only.',false],
        ['External tree search.',false,'archStrategy'] ]}
    ]
  },
  8:{
    focus:'Identifying where specific information is being carried.',lab:'#signalForensicsLab',
    questions:[
      {id:'m8-core',part:'Core Task',points:50,prompt:'An association was learned during the current BDH task and disappears when temporary working state is reset. Where is it carried?',hint:'The clue says current-task association, not long-term training knowledge.',domains:['Memory & State'],architectures:['BDH'],options:[
        ['Dynamic synaptic working state.',true],
        ['Permanent trained parameters θ.',false,'tempParams'],
        ['The original training dataset.',false],
        ['The final decoder output.',false,'stateEqualsAnswer'] ]},
      {id:'m8-mech',part:'Mechanism Understanding',points:30,prompt:'Which carrier-role pairing is correct?',hint:'Separate long-term trained machinery, current access/routing, and recurrent state.',domains:['Memory & State','Information Flow'],architectures:['Transformer','HRM'],options:[
        ['Training knowledge → θ; Transformer earlier information → accessible context via attention; slow HRM coordination → H state.',true],
        ['Training knowledge → H state; Transformer context → θ; HRM coordination → decoder.',false,'tempParams'],
        ['All three kinds of information are stored in the final answer token.',false,'stateEqualsAnswer'],
        ['Any temporary state change is equivalent to retraining.',false,'stateRetrain'] ]},
      {id:'m8-transfer',part:'Transfer Check',points:20,prompt:'A fact is available before the current problem arrives because it was learned across training data. Which category should you inspect first?',hint:'Ask whether the information exists before this particular task starts.',domains:['Memory & State'],architectures:['Transformer','BDH','HRM'],options:[
        ['Trained parameters θ.',true],
        ['Temporary task state.',false,'tempParams'],
        ['Current output head only.',false],
        ['Visible Chain-of-Thought text.',false,'cotRequired'] ]}
    ]
  },
  9:{
    focus:'The distinction between hidden representation, output mapping, and prediction.',lab:'#decoderDockLab',
    questions:[
      {id:'m9-core',part:'Core Task',points:50,prompt:'A machine has finished internal computation and holds an answer-relevant hidden representation. Is that hidden state already the observable answer?',hint:'Ask what converts numerical internal state into the task’s output space.',domains:['Output/Decoding','Internal Computation'],architectures:['Transformer','BDH','HRM'],options:[
        ['No — an output mapping/head/decoder must expose a token, class, grid, action, or other prediction.',true],
        ['Yes — internal state and final answer are the same object.',false,'stateEqualsAnswer'],
        ['Yes, as long as a Chain-of-Thought was generated.',false,'cotRequired'],
        ['No, because the model must retrain θ before decoding.',false,'stateRetrain'] ]},
      {id:'m9-mech',part:'Mechanism Understanding',points:30,prompt:'For autoregressive language generation, what commonly happens after the current hidden representation?',hint:'Think projection into the vocabulary space before selecting the next token.',domains:['Output/Decoding'],architectures:['Transformer'],options:[
        ['Hidden representation → vocabulary scores/probabilities → next token.',true],
        ['Hidden representation → gradient update → new θ → next token.',false,'stateRetrain'],
        ['Hidden representation is printed directly with no output mapping.',false,'stateEqualsAnswer'],
        ['Hidden representation → majority vote over architectures.',false,'archStrategy'] ]},
      {id:'m9-transfer',part:'Transfer Check',points:20,prompt:'A useful grid-task state is connected to an incompatible word-output head and produces nonsense. What does this demonstrate?',hint:'A good internal representation still has to be mapped into the correct task output space.',domains:['Output/Decoding'],architectures:['Transformer','BDH','HRM'],options:[
        ['Internal computation can be useful while the wrong output mapping still produces an invalid observable prediction.',true],
        ['The internal state must therefore contain no useful information.',false,'stateEqualsAnswer'],
        ['The architecture automatically became an inference strategy.',false,'archStrategy'] ]}
    ]
  },
  10:{
    focus:'Controlled comparison on the same problem while separating architecture from inference strategy.',lab:'#threeMachineReplay',
    questions:[
      {id:'m10-core',part:'Core Task',points:50,prompt:'All three machines receive the same task and reach the same educational target answer. What is the controlled comparison meant to reveal?',hint:'Hold input and target constant; inspect what changes internally.',domains:['Architecture Recognition','Internal Computation'],architectures:['Transformer','BDH','HRM'],options:[
        ['The organization of computation can differ even when the external problem and answer are held constant.',true],
        ['The same answer proves the architectures are internally identical.',false],
        ['Each architecture must use a different task for a fair comparison.',false],
        ['The winner is whichever system uses the most samples.',false,'archStrategy'] ]},
      {id:'m10-mech',part:'Mechanism Understanding',points:30,prompt:'Which compact route set is correct?',hint:'Attend/transform; local interaction/evolving state; fast/slow hierarchy.',domains:['Architecture Recognition','Information Flow'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer: represent → attend → transform; BDH: activate → interact locally → evolve state; HRM: initialize → fast L ↔ slow H.',true],
        ['Transformer: local graph; BDH: H/L hierarchy; HRM: self-attention stack.',false],
        ['All three: sample 32 answers → majority vote.',false,'archStrategy'],
        ['All three: update θ during every inference.',false,'stateRetrain'] ]},
      {id:'m10-transfer',part:'Transfer Check',points:20,prompt:'Where does “32 independent solution samples + majority vote” belong in this architecture comparison?',hint:'Ask whether it defines the neural machine itself or how inference compute is spent around it.',domains:['Architecture Recognition'],architectures:['Transformer','BDH','HRM'],options:[
        ['None of the three as a defining architecture component; it is an external inference strategy.',true],
        ['Transformer only.',false,'archStrategy'],
        ['BDH only.',false,'archStrategy'],
        ['HRM only.',false,'archStrategy'] ]}
    ]
  },
  11:{
    focus:'Stacked depth, evolving state, and hierarchical recurrence.',lab:'#depthElevatorLab',
    questions:[
      {id:'m11-core',part:'Core Task',points:50,prompt:'Which statement best captures how “deeper computation” differs across these machines?',hint:'Depth can come from more stacked transformations or from repeated state updates.',domains:['Internal Computation','Architecture Recognition'],architectures:['Transformer','BDH','HRM'],options:[
        ['Transformer: stacked blocks; BDH: evolving internal state/dynamics; HRM: fast recurrence nested inside slower recurrence.',true],
        ['All depth is simply more visible Chain-of-Thought tokens.',false,'cotRequired'],
        ['Every deeper step retrains model weights.',false,'stateRetrain'],
        ['Depth is identical to majority-vote sample count.',false,'archStrategy'] ]},
      {id:'m11-mech',part:'Mechanism Understanding',points:30,prompt:'What is conceptually special about HRM at a segment boundary?',hint:'The published mechanism can decide whether another recurrent segment is useful.',domains:['Internal Computation'],architectures:['HRM'],options:[
        ['An adaptive halting decision can choose whether to stop or continue recurrent computation.',true],
        ['It must permanently update θ before continuing.',false,'stateRetrain'],
        ['It switches into Transformer self-attention.',false],
        ['It launches majority voting as a defining H/L component.',false,'archStrategy'] ]},
      {id:'m11-transfer',part:'Transfer Check',points:20,prompt:'BDH state changes from state₁ to state₂ during inference while θ stays locked. What should you conclude?',hint:'State evolution and parameter learning are not the same event.',domains:['Memory & State','Internal Computation'],architectures:['BDH'],options:[
        ['The internal state evolved; this does not imply weight retraining.',true],
        ['The trained parameters must have changed.',false,'stateRetrain'],
        ['The state is now automatically the final answer.',false,'stateEqualsAnswer'] ]}
    ]
  },
  12:{
    focus:'Reconstructing each architecture from essential components and rejecting distractors.',lab:'#reconstructionLab',
    questions:[
      {id:'m12-core',part:'Core Task',points:50,prompt:'You observe fast updates inside a slower coordinating loop. What is the smallest defining component set?',hint:'Reconstruct the machine, not every strategy that could be wrapped around it.',domains:['Architecture Recognition'],architectures:['HRM'],options:[
        ['H module + L module + recurrence.',true],
        ['H module + L module + tree search + majority vote.',false,'archStrategy'],
        ['Attention + feed-forward only.',false],
        ['Gradient update + prompt optimizer.',false,'stateRetrain'] ]},
      {id:'m12-mech',part:'Mechanism Understanding',points:30,prompt:'Which minimal reconstruction best fits BDH in this lesson?',hint:'Look for locally interacting units and temporary synaptic/network state.',domains:['Architecture Recognition','Memory & State'],architectures:['BDH'],options:[
        ['Local nodes + synaptic connections/state.',true],
        ['Local nodes + mandatory gradient update on every query.',false,'stateRetrain'],
        ['H module + L module + recurrence.',false],
        ['Attention + majority vote.',false,'archStrategy'] ]},
      {id:'m12-transfer',part:'Transfer Check',points:20,prompt:'Which item should be rejected when asked for a defining component of Transformer, BDH, or HRM?',hint:'Separate the neural architecture from methods for allocating extra test-time compute.',domains:['Architecture Recognition'],architectures:['Transformer','BDH','HRM'],options:[
        ['Tree search / majority voting as an inference strategy.',true],
        ['Attention in a Transformer.',false],
        ['Dynamic synaptic working state in BDH.',false],
        ['H/L recurrence in HRM.',false] ]}
    ]
  },
  13:{
    focus:'Final black-box architecture identification using multiple structural clues.',lab:'#blackBoxLab',
    questions:[
      {id:'m13-core',part:'Core Task',points:50,prompt:'Black box γ shows a slow high-level state, rapid low-level updates, and repeated interaction between them. Which machine is it?',hint:'Use several structural clues together rather than one keyword.',domains:['Architecture Recognition','Internal Computation'],architectures:['HRM'],options:[
        ['HRM.',true],
        ['Transformer.',false],
        ['BDH.',false],
        ['A majority-vote architecture.',false,'archStrategy'] ]},
      {id:'m13-mech',part:'Mechanism Understanding',points:30,prompt:'Which pair of clues is strongest evidence for BDH?',hint:'Choose structural evidence about graph communication and temporary connection state.',domains:['Architecture Recognition','Information Flow','Memory & State'],architectures:['BDH'],options:[
        ['Locally interacting graph nodes + dynamic synaptic working state.',true],
        ['Vocabulary head + 32-sample majority vote.',false,'archStrategy'],
        ['H/L recurrent levels + adaptive halting.',false],
        ['Visible Chain-of-Thought + parameter retraining.',false,'cotRequired'] ]},
      {id:'m13-transfer',part:'Transfer Check',points:20,prompt:'Machine γ is HRM, but a controller also explores 32 independent solution samples and majority-votes them. Which clue belongs to the external inference layer?',hint:'The architecture remains HRM even when a separate compute-allocation strategy is added around it.',domains:['Architecture Recognition'],architectures:['HRM'],options:[
        ['32 independent samples + majority vote.',true],
        ['High-level recurrent state.',false],
        ['Low-level recurrent state.',false],
        ['Fast/slow computational timescales.',false] ]}
    ]
  }
};

const masteryDomains=['Architecture Recognition','Information Flow','Memory & State','Internal Computation','Output/Decoding'];
const masteryArchitectures=['Transformer','BDH','HRM'];
const masteryState=loadMasteryState();

function loadMasteryState(){
  const blank={modules:{},misconceptions:{}};
  try{
    const parsed=JSON.parse(localStorage.getItem(MASTERY_STORAGE_KEY)||'null');
    if(parsed&&typeof parsed==='object')return {...blank,...parsed,modules:parsed.modules||{},misconceptions:parsed.misconceptions||{}};
  }catch(_e){}
  return blank;
}
function saveMasteryState(){try{localStorage.setItem(MASTERY_STORAGE_KEY,JSON.stringify(masteryState));}catch(_e){}}
function getModuleState(module){
  if(!masteryState.modules[module])masteryState.modules[module]={started:false,questions:{},penalties:{}};
  const m=masteryState.modules[module];m.questions=m.questions||{};m.penalties=m.penalties||{};return m;
}
function getQuestionState(module,qid){
  const m=getModuleState(module);
  if(!m.questions[qid])m.questions[qid]={attempts:0,hinted:false,revealed:false,completed:false,earned:0};
  return m.questions[qid];
}
function getMisconceptionState(key){
  if(!masteryState.misconceptions[key])masteryState.misconceptions[key]={status:'stable',wrongCount:0};
  return masteryState.misconceptions[key];
}
function misconceptionWrong(key,module){
  if(!key)return null;
  const mc=getMisconceptionState(key);const m=getModuleState(module);
  if(mc.status==='stable'){
    mc.status='suspected';mc.wrongCount=1;
  }else if(mc.status==='suspected'){
    mc.status='active';mc.wrongCount=(mc.wrongCount||1)+1;
    if(m.penalties[key]==null)m.penalties[key]=8;
  }else if(mc.status==='corrected'){
    mc.status='suspected';mc.wrongCount=1;
  }else{
    mc.wrongCount=(mc.wrongCount||0)+1;
  }
  saveMasteryState();
  return mc.status;
}
function repairMisconception(key){
  const mc=getMisconceptionState(key);mc.status='corrected';
  Object.values(masteryState.modules).forEach(m=>{if(m.penalties&&m.penalties[key]!=null)m.penalties[key]=3;});
  saveMasteryState();
}
function modulePenalty(module){return Math.min(16,Object.values(getModuleState(module).penalties||{}).reduce((a,b)=>a+(Number(b)||0),0));}
function moduleRaw(module){return masteryModules[module].questions.reduce((sum,q)=>sum+(getQuestionState(module,q.id).earned||0),0);}
function moduleAdjusted(module){return Math.max(0,moduleRaw(module)-modulePenalty(module));}
function moduleCompleted(module){return masteryModules[module].questions.every(q=>getQuestionState(module,q.id).completed);}
function questionMultiplier(qs){if(qs.revealed)return .3;if(qs.hinted)return .6;if(qs.attempts<=1)return 1;if(qs.attempts===2)return .8;return .6;}
function tierFor(pct){if(pct>=90)return 'Architect';if(pct>=75)return 'Systems Thinker';if(pct>=60)return 'Explorer';return 'Rebuild';}
function statusLabel(key){const s=getMisconceptionState(key).status;if(s==='corrected')return 'Corrected';if(s==='suspected'||s==='active')return 'Needs Reinforcement';return 'Stable';}
function misconceptionNote(status){if(status==='suspected')return 'Concept flag: suspected — no misconception penalty yet.';if(status==='active')return 'Persistent misconception detected — −8 adjustment applied. A repair check is now available.';if(status==='corrected')return 'Concept repaired — the adjustment is reduced to −3.';return '';}

function createMasteryShell(module){
  const cfg=masteryModules[module],mState=getModuleState(module);const shell=document.createElement('section');
  shell.className='mastery-shell';shell.id=`masteryModule${module}`;shell.dataset.masteryModule=module;
  shell.innerHTML=`<div class="mastery-modebar"><div class="mastery-modecopy"><span class="mastery-mode-pill">EXPLORE</span><div><strong>Explore freely. Scoring is off.</strong><small>${cfg.focus}</small></div></div><button class="ghost mastery-start">CHECK MY UNDERSTANDING</button></div><div class="mastery-check ${mState.started?'':'hidden'}"><div class="mastery-check-head"><div><small>100-POINT MODULE MASTERY</small><strong>50 Core · 30 Mechanism · 20 Transfer</strong></div><span>Misconception adjustment capped at −16</span></div><div class="mastery-questions"></div><div class="repair-zone"></div><div class="module-mastery-result"></div></div>`;
  const start=shell.querySelector('.mastery-start');
  if(mState.started){shell.classList.add('checking');start.textContent='CHECK IN PROGRESS';start.disabled=true;shell.querySelector('.mastery-mode-pill').textContent='CHECK';shell.querySelector('.mastery-modecopy strong').textContent='Check mode is active. Your original interaction remains free to explore.';}
  start.addEventListener('click',()=>{mState.started=true;saveMasteryState();shell.classList.add('checking');shell.querySelector('.mastery-check').classList.remove('hidden');shell.querySelector('.mastery-mode-pill').textContent='CHECK';shell.querySelector('.mastery-modecopy strong').textContent='Check mode is active. Your original interaction remains free to explore.';start.textContent='CHECK IN PROGRESS';start.disabled=true;renderModuleMastery(module);});
  const lab=document.querySelector(cfg.lab);if(lab)lab.insertAdjacentElement('afterend',shell);else document.querySelector(`.stage[data-stage="${module}"]`)?.append(shell);
  renderModuleMastery(module);
}

function renderModuleMastery(module){
  const shell=document.querySelector(`#masteryModule${module}`);if(!shell)return;const cfg=masteryModules[module];
  const questionsWrap=shell.querySelector('.mastery-questions');questionsWrap.replaceChildren();
  cfg.questions.forEach(q=>questionsWrap.append(renderQuestionCard(module,q)));
  renderRepairZone(module);renderModuleResult(module);renderArchitectureMasterySummary();
}

function renderQuestionCard(module,q){
  const qs=getQuestionState(module,q.id);const card=document.createElement('article');card.className='mastery-question-card'+(qs.completed?' complete':'');card.dataset.qid=q.id;
  const correctIndex=q.options.findIndex(o=>o[1]);
  card.innerHTML=`<div class="mastery-question-top"><span>${q.part}</span><strong>${q.points} pts</strong></div><h4>${q.prompt}</h4><div class="mastery-options"></div><div class="mastery-help"><button class="mastery-hint ghost" type="button">CONCEPTUAL HINT</button><button class="mastery-reveal ghost" type="button">EXPLICIT REVEAL</button></div><div class="mastery-hint-text ${qs.hinted?'':'hidden'}">${qs.revealed?`Correct answer: ${q.options[correctIndex][0]}`:q.hint}</div><div class="feedback mastery-feedback"></div>`;
  const opts=card.querySelector('.mastery-options');
  q.options.forEach((opt,index)=>{
    const b=document.createElement('button');b.type='button';b.textContent=opt[0];b.dataset.optionIndex=index;
    if(qs.completed){b.disabled=true;if(opt[1])b.classList.add('correct');}
    if(qs.revealed&&opt[1])b.classList.add('revealed-correct');
    b.addEventListener('click',()=>answerMasteryQuestion(module,q,index,card));opts.append(b);
  });
  const feedback=card.querySelector('.mastery-feedback');
  if(qs.completed){feedback.innerHTML=`Locked in. <strong>${Math.round(qs.earned)} / ${q.points}</strong> points earned for this part.`;feedback.className='feedback mastery-feedback good';}
  card.querySelector('.mastery-hint').disabled=qs.completed;
  card.querySelector('.mastery-reveal').disabled=qs.completed;
  card.querySelector('.mastery-hint').addEventListener('click',()=>{if(qs.completed)return;qs.hinted=true;saveMasteryState();const ht=card.querySelector('.mastery-hint-text');ht.textContent=q.hint;ht.classList.remove('hidden');feedback.textContent='Hint opened. A correct answer now earns up to 60% of this part.';feedback.className='feedback mastery-feedback';});
  card.querySelector('.mastery-reveal').addEventListener('click',()=>{if(qs.completed)return;qs.revealed=true;qs.hinted=true;saveMasteryState();card.querySelector('.mastery-hint-text').textContent=`Correct answer: ${q.options[correctIndex][0]}`;card.querySelector('.mastery-hint-text').classList.remove('hidden');card.querySelectorAll('.mastery-options button').forEach((b,i)=>b.classList.toggle('revealed-correct',i===correctIndex));feedback.textContent='Answer revealed. Select the revealed answer to confirm understanding for 30% credit.';feedback.className='feedback mastery-feedback';});
  return card;
}

function answerMasteryQuestion(module,q,index,card){
  const qs=getQuestionState(module,q.id);if(qs.completed)return;const option=q.options[index];qs.attempts++;
  card.querySelectorAll('.mastery-options button').forEach(b=>b.classList.remove('wrong'));
  const feedback=card.querySelector('.mastery-feedback');
  if(option[1]){
    const mult=questionMultiplier(qs);qs.earned=Math.round(q.points*mult*10)/10;qs.completed=true;saveMasteryState();
    card.classList.add('complete');card.querySelectorAll('.mastery-options button').forEach((b,i)=>{b.disabled=true;b.classList.toggle('correct',i===index);});card.querySelectorAll('.mastery-help button').forEach(b=>b.disabled=true);
    feedback.innerHTML=`Correct. <strong>${Math.round(qs.earned)} / ${q.points}</strong> points recorded for ${q.part}.`;feedback.className='feedback mastery-feedback good';
  }else{
    card.querySelector(`.mastery-options button[data-option-index="${index}"]`)?.classList.add('wrong');
    const misconception=option[2]||null;const mcStatus=misconceptionWrong(misconception,module);
    let note='No misconception penalty — use the feedback and try again.';
    if(mcStatus)note=misconceptionNote(mcStatus);
    if(qs.attempts>=2&&!qs.hinted&&!qs.revealed){qs.hinted=true;card.querySelector('.mastery-hint-text').textContent=q.hint;card.querySelector('.mastery-hint-text').classList.remove('hidden');note+=' A conceptual hint has opened; the next correct answer can earn up to 60%.';}
    saveMasteryState();feedback.textContent=`Not yet. ${note}`;feedback.className='feedback mastery-feedback bad';
  }
  renderRepairZone(module);renderModuleResult(module);renderArchitectureMasterySummary();
}

function renderRepairZone(module){
  const shell=document.querySelector(`#masteryModule${module}`);if(!shell)return;const zone=shell.querySelector('.repair-zone');zone.replaceChildren();const m=getModuleState(module);
  const keys=[...new Set([...Object.keys(m.penalties||{}),...Object.keys(masteryMisconceptionDefs).filter(k=>masteryMisconceptionDefs[k].reviewModule===Number(module)&&['active','corrected'].includes(getMisconceptionState(k).status))])].filter(k=>getMisconceptionState(k).status==='active'||getMisconceptionState(k).status==='corrected');
  if(!keys.length)return;
  const title=document.createElement('div');title.className='repair-zone-title';title.innerHTML='<small>REPAIRABLE MISCONCEPTIONS</small><strong>Correct the concept, not just the score.</strong>';zone.append(title);
  keys.forEach(key=>{
    const def=masteryMisconceptionDefs[key],mc=getMisconceptionState(key);const card=document.createElement('article');card.className='repair-card '+(mc.status==='corrected'?'repaired':'');
    card.innerHTML=`<div><span>${def.label}</span><small>${mc.status==='corrected'?'Corrected · penalty reduced to −3':'Active · −8 until repaired'}</small></div><p>${def.repairPrompt}</p><div class="repair-options"></div><div class="feedback repair-feedback"></div>`;
    const options=card.querySelector('.repair-options');def.repairOptions.forEach(([text,correct])=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.disabled=mc.status==='corrected';if(mc.status==='corrected'&&correct)b.classList.add('correct');b.addEventListener('click',()=>{const f=card.querySelector('.repair-feedback');if(correct){repairMisconception(key);f.textContent='Concept repaired. The −8 misconception adjustment is now −3.';f.className='feedback repair-feedback good';renderRepairZone(module);renderModuleResult(module);renderArchitectureMasterySummary();}else{f.textContent='That repeats the misconception. Re-read the distinction, then try the other explanation.';f.className='feedback repair-feedback bad';}});options.append(b);});zone.append(card);
  });
}

function renderModuleResult(module){
  const shell=document.querySelector(`#masteryModule${module}`);if(!shell)return;const out=shell.querySelector('.module-mastery-result');const done=masteryModules[module].questions.filter(q=>getQuestionState(module,q.id).completed).length;const raw=moduleRaw(module),pen=modulePenalty(module),adjusted=moduleAdjusted(module);
  if(!getModuleState(module).started){out.innerHTML='';return;}
  if(done<3){out.innerHTML=`<div class="module-progress"><span>${done} / 3 checks complete</span><i><b style="width:${done/3*100}%"></b></i><small>Scoring stays secondary until all three parts are complete.</small></div>`;return;}
  const tier=tierFor(adjusted);out.innerHTML=`<div class="module-scoreline"><div><small>MODULE ${module} MASTERY</small><strong>${tier}</strong></div><div class="module-score-secondary"><b>${Math.round(adjusted)}%</b><span>raw ${Math.round(raw)}/100${pen?` · misconception adjustment −${pen}`:''}</span></div></div>`;
}

function calculateConceptScores(){
  const domainTotals=Object.fromEntries(masteryDomains.map(x=>[x,{earned:0,max:0}]));const archTotals=Object.fromEntries(masteryArchitectures.map(x=>[x,{earned:0,max:0}]));
  Object.entries(masteryModules).forEach(([module,cfg])=>cfg.questions.forEach(q=>{const earned=getQuestionState(module,q.id).earned||0;(q.domains||[]).forEach(d=>{domainTotals[d].earned+=earned;domainTotals[d].max+=q.points;});(q.architectures||[]).forEach(a=>{archTotals[a].earned+=earned;archTotals[a].max+=q.points;});}));
  const normalize=obj=>Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,v.max?Math.round(v.earned/v.max*100):0]));return{domains:normalize(domainTotals),architectures:normalize(archTotals)};
}
function totalMastery(){let raw=0,pen=0,completed=0;Object.keys(masteryModules).forEach(m=>{raw+=moduleRaw(m);pen+=modulePenalty(m);if(moduleCompleted(m))completed++;});const adjusted=Math.max(0,raw-pen);return{raw,pen,adjusted,pct:Math.round(adjusted/900*100),completed};}
function masteryNarrative(tier){
  if(tier==='Architect')return 'You are distinguishing the machines by structure, information flow, state, internal computation, and decoding rather than by surface labels.';
  if(tier==='Systems Thinker')return 'Your architecture model is coherent. A small number of distinctions still need reinforcement before you allocate test-time compute around these machines.';
  if(tier==='Explorer')return 'You recognize many of the mechanisms, but some boundaries between architecture, state, and inference strategy are still unstable.';
  return 'Rebuild the structural distinctions before moving on. Focus on what changes during inference, where information lives, and what belongs outside the architecture.';
}
function masteryStatusClass(status){return status==='Stable'?'stable':status==='Corrected'?'corrected':'reinforce';}
function lowestEntry(obj){return Object.entries(obj).sort((a,b)=>a[1]-b[1])[0];}
function reviewDestination(scores){
  const weak=Object.keys(masteryMisconceptionDefs).find(k=>['active','suspected'].includes(getMisconceptionState(k).status));if(weak){const d=masteryMisconceptionDefs[weak];return{label:d.label,module:d.reviewModule,target:d.reviewTarget};}
  const [domain]=lowestEntry(scores.domains);const map={'Architecture Recognition':[13,'#blackBoxLab'],'Information Flow':[7,'#deliverSignalLab'],'Memory & State':[8,'#signalForensicsLab'],'Internal Computation':[6,'#hiddenRoomLab'],'Output/Decoding':[9,'#decoderDockLab']};return{label:domain,module:map[domain][0],target:map[domain][1]};
}
function jumpToReview(module,target){const idx=stages.findIndex(s=>Number(s.dataset.stage)===Number(module));if(idx>=0){showStep(idx);setTimeout(()=>document.querySelector(target)?.scrollIntoView({behavior:'smooth',block:'center'}),120);}}

function ensureArchitectureMasterySummary(){
  const reveal=document.querySelector('#chapterReveal');if(!reveal||document.querySelector('#architectureMasterySummary'))return;
  const summary=document.createElement('section');summary.id='architectureMasterySummary';summary.className='architecture-mastery-summary';const budget=reveal.querySelector('.compute-budget');if(budget)reveal.insertBefore(summary,budget);else reveal.append(summary);
}
function renderScoreBars(title,scores){return `<section class="mastery-score-group"><small>${title}</small><div>${Object.entries(scores).map(([name,value])=>`<article><span>${name}</span><i><b style="width:${value}%"></b></i><strong>${value}%</strong></article>`).join('')}</div></section>`;}
function renderArchitectureMasterySummary(){
  ensureArchitectureMasterySummary();const box=document.querySelector('#architectureMasterySummary');if(!box)return;const total=totalMastery(),scores=calculateConceptScores(),tier=tierFor(total.pct);const strongest=Object.entries(scores.architectures).sort((a,b)=>b[1]-a[1])[0];const weakest=lowestEntry(scores.domains);const destination=reviewDestination(scores);
  const conceptRows=Object.entries(masteryMisconceptionDefs).map(([key,def])=>{const status=statusLabel(key);const mc=getMisconceptionState(key);const extra=mc.status==='active'?'−8 active':mc.status==='corrected'?'−3 after repair':mc.status==='suspected'?'suspected · no penalty':'no flag';return `<article class="concept-status ${masteryStatusClass(status)}"><span>${def.label}</span><strong>${status}</strong><small>${extra}</small></article>`;}).join('');
  const priority=Object.keys(masteryMisconceptionDefs).find(k=>['active','suspected'].includes(getMisconceptionState(k).status));
  box.innerHTML=`<div class="mastery-summary-head"><div><small>ARCHITECTURE MASTERY</small><h4>${tier}</h4><p>${masteryNarrative(tier)}</p></div><div class="mastery-percent"><strong>${total.pct}%</strong><span>${total.completed}/9 module checks complete</span><small>Raw model: ${Math.round(total.raw)}/900${total.pen?` · misconception adjustment −${total.pen}`:''}</small></div></div><div class="mastery-insights"><article><small>STRONGEST ARCHITECTURE</small><strong>${strongest[0]}</strong><span>${strongest[1]}% demonstrated mastery</span></article><article><small>WEAKEST CONCEPT AREA</small><strong>${weakest[0]}</strong><span>${weakest[1]}% demonstrated mastery</span></article><article><small>BEFORE “HOW IS COMPUTE SPENT?”</small><strong>${priority?masteryMisconceptionDefs[priority].label:'No major misconception is currently active.'}</strong><span>${priority?'Repair this distinction before adding inference strategies.':'Your next review target is the lowest conceptual sub-score.'}</span></article></div>${renderScoreBars('CONCEPTUAL SUB-SCORES',scores.domains)}${renderScoreBars('ARCHITECTURE-SPECIFIC MASTERY',scores.architectures)}<section class="concepts-revisit"><div class="concepts-revisit-head"><div><small>CONCEPTS TO REVISIT</small><strong>Stable · Corrected · Needs Reinforcement</strong></div><button class="primary" id="reviewWeakConcepts">REVIEW WEAK CONCEPTS</button></div><div>${conceptRows}</div><p class="review-target-copy">Next review target: <strong>${destination.label}</strong>. The button jumps directly to the relevant interaction rather than replaying the whole module.</p></section>`;
  box.querySelector('#reviewWeakConcepts')?.addEventListener('click',()=>jumpToReview(destination.module,destination.target));
}

Object.keys(masteryModules).forEach(module=>createMasteryShell(Number(module)));
ensureArchitectureMasterySummary();renderArchitectureMasterySummary();
