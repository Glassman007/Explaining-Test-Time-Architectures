'use strict';
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const graphStage = $('#graphStage');
  const nodeLayer = $('#nodeLayer');
  const edgeLayer = $('#edgeLayer');
  const viewport = $('#canvasViewport');
  const chipRow = $('#chipRow');
  const chipCount = $('#chipCount');
  const selectedReadout = $('#selectedReadout');
  const scoreTarget = $('#scoreTarget');
  const historyList = $('#historyList');
  const moveCount = $('#moveCount');
  const canvasStatus = $('#canvasStatus');
  const modeHint = $('#modeHint');
  const composer = $('#composer');
  const composerBody = $('#composerBody');
  const composerEyebrow = $('#composerEyebrow');
  const composerTitle = $('#composerTitle');
  const composerCopy = $('#composerCopy');
  const composerConfirm = $('#composerConfirm');
  const finalScreen = $('#finalScreen');
  const ranges = ['relevance','novelty','coherence'];

  let nodes, edges, chips, selectedId, multiSelected, mode, history, nodeSeq, edgeSeq, composerAction, noticeTimer;

  function makeInitialState(){
    nodes = new Map(); edges = [];
    chips = 10; selectedId = 'n1'; multiSelected = new Set(['n1']); mode = null; history = []; nodeSeq = 1; edgeSeq = 0; composerAction = null;
    nodes.set('n1', {id:'n1', text:'Design a campaign to get more students interested in learning AI.', type:'root', parents:[], lineages:new Set(), x:90, y:360, score:null, feedbackCount:0});
  }

  function label(node){ return node.type === 'root' ? 'Root Node' : `Node ${node.id.slice(1)}`; }
  function cost(amount){ return chips >= amount; }
  function spend(amount){ chips=Math.max(0,chips-amount); updateBudget(); if(chips===0) toast('Budget exhausted — submit a Final Node.'); }
  function updateBudget(){
    chipCount.textContent=chips; chipRow.replaceChildren();
    for(let i=0;i<10;i++){const dot=document.createElement('i');dot.className='chip'+(i>=chips?' spent':'');chipRow.append(dot);}
    $$('.op-button').forEach(btn=>{const c={branch:1,merge:2,reuse:0,feedback:1}[btn.dataset.op];btn.disabled=chips<c;});
    $('#scoreButton').disabled=chips<1;
  }

  function toast(message){
    let el=$('.notice'); if(!el){el=document.createElement('div');el.className='notice';document.body.append(el);} el.textContent=message; el.classList.add('show');
    clearTimeout(noticeTimer); noticeTimer=setTimeout(()=>el.classList.remove('show'),1800);
  }

  function log(action, text){
    history.unshift({action,text}); moveCount.textContent=history.length; historyList.replaceChildren();
    history.forEach(item=>{const li=document.createElement('li');li.innerHTML=`<strong>${item.action}</strong> ${escapeHtml(item.text)}`;historyList.append(li);});
  }
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function createNode({text,type,parents,x,y,lineages,score=null}){
    const id=`n${++nodeSeq}`;
    const node={id,text,type,parents:[...parents],x,y,lineages:new Set(lineages),score,feedbackCount:0};
    nodes.set(id,node);
    parents.forEach(parent=>addEdge(parent,id,type));
    renderNode(node,true); drawEdges(); selectNode(id); return node;
  }
  function addEdge(from,to,type){ edges.push({id:`e${++edgeSeq}`,from,to,type}); }

  function renderNode(node,isNew=false){
    let el=$(`[data-node-id="${node.id}"]`,nodeLayer);
    if(!el){el=document.createElement('article');el.className='thought-node';el.dataset.nodeId=node.id;el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(node.id,e.shiftKey||mode==='merge');}});nodeLayer.append(el);wireDrag(el);}
    el.className=`thought-node ${node.type}${selectedId===node.id?' selected':''}${multiSelected.has(node.id)&&selectedId!==node.id?' multi-selected':''}`;
    el.style.left=`${node.x}px`; el.style.top=`${node.y}px`;
    el.setAttribute('aria-label',`${label(node)}: ${node.text}`);el.setAttribute('aria-pressed',String(multiSelected.has(node.id)));
    const score=node.score?`<div class="node-score"><span>R ${node.score.relevance}</span><span>N ${node.score.novelty}</span><span>C ${node.score.coherence}</span></div>`:'';
    const feedback=node.feedbackCount?`<span class="feedback-count">↻ ${node.feedbackCount}/2</span>`:'';
    el.innerHTML=`<div class="node-top"><span class="node-type">${node.type.toUpperCase()}</span><span class="node-id">${node.id.toUpperCase()}</span>${feedback}</div><div class="node-text">${escapeHtml(node.text)}</div>${score}${isNew?'<span class="node-pulse"></span>':''}`;
  }

  function renderAll(){ nodeLayer.replaceChildren(); nodes.forEach(n=>renderNode(n)); drawEdges(); updateSelectionUI(); updateBudget(); }

  function drawEdges(){
    $$('.edge',edgeLayer).forEach(p=>p.remove());
    const width=graphStage.scrollWidth,height=graphStage.scrollHeight;edgeLayer.setAttribute('viewBox',`0 0 ${width} ${height}`);
    edges.forEach(edge=>{
      const a=nodes.get(edge.from), b=nodes.get(edge.to); if(!a||!b)return;
      const aEl=nodeLayer.querySelector(`[data-node-id="${a.id}"]`),bEl=nodeLayer.querySelector(`[data-node-id="${b.id}"]`);
      const ax=a.x+aEl.offsetWidth, ay=a.y+aEl.offsetHeight/2, bx=b.x, by=b.y+bEl.offsetHeight/2;
      const bend=Math.max(70,Math.abs(bx-ax)*.45);
      const d=`M ${ax} ${ay} C ${ax+bend} ${ay}, ${bx-bend} ${by}, ${bx} ${by}`;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',d); path.setAttribute('class',`edge ${edge.type}`); path.dataset.edgeId=edge.id; edgeLayer.append(path);
    });
  }

  function selectNode(id, additive=false){
    if(!nodes.has(id))return;
    if(mode==='reuse' && id!==selectedId){ completeReuse(id); return; }
    if(mode==='merge' && additive){ multiSelected.has(id)?multiSelected.delete(id):multiSelected.add(id); if(!multiSelected.size)multiSelected.add(selectedId); updateMergeComposer(); }
    else if(mode==='merge' && id!==selectedId){ multiSelected.add(id); updateMergeComposer(); }
    else { selectedId=id; multiSelected=new Set([id]); }
    nodes.forEach(n=>renderNode(n)); updateSelectionUI();
  }

  function updateSelectionUI(){
    const node=nodes.get(selectedId); if(!node)return;
    selectedReadout.textContent=label(node); scoreTarget.textContent=`${label(node)} · ${node.text}`;
    ranges.forEach(k=>{const value=node.score?node.score[k]:3;const input=$(`#${k}`),out=$(`#${k}Out`);input.value=value;out.value=value;out.textContent=value;});
    canvasStatus.textContent=mode==='merge'?'Merge mode: click nodes from different branches.':mode==='reuse'?'Reuse mode: click the destination node.':'Drag nodes to rearrange the web.';
    modeHint.textContent=mode==='merge'?`${multiSelected.size} node${multiSelected.size===1?'':'s'} selected for merge.`:mode==='reuse'?'Choose where to reuse the selected thought.':'Select a node, then make a move.';
  }

  function wireDrag(el){
    let sx=0,sy=0,ox=0,oy=0,moved=false,id;
    el.addEventListener('pointerdown',e=>{if(e.button!==0)return;id=el.dataset.nodeId;const n=nodes.get(id);sx=e.clientX;sy=e.clientY;ox=n.x;oy=n.y;moved=false;el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!el.hasPointerCapture(e.pointerId))return;const n=nodes.get(id);const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>4)moved=true;n.x=Math.max(10,Math.min(graphStage.scrollWidth-230,ox+dx));n.y=Math.max(10,Math.min(graphStage.scrollHeight-120,oy+dy));el.style.left=`${n.x}px`;el.style.top=`${n.y}px`;drawEdges();});
    el.addEventListener('pointerup',e=>{if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId); if(!moved)selectNode(id,e.shiftKey||e.ctrlKey||e.metaKey||mode==='merge');});
  }

  function nextChildPosition(parent,index,total){
    const spacing=128; return {x:Math.min(1230,parent.x+275), y:Math.max(35,Math.min(760,parent.y+(index-(total-1)/2)*spacing))};
  }

  function openComposer(config){
    composerAction=config.action;composer.classList.toggle('graph-pick',config.action==='merge');composerEyebrow.textContent=config.eyebrow;composerTitle.textContent=config.title;composerCopy.textContent=config.copy||'';composerBody.innerHTML=config.body||'';composerConfirm.textContent=config.confirm||'CREATE';composerConfirm.disabled=false;composer.hidden=false;config.afterOpen?.();
  }
  function closeComposer(){composer.hidden=true;composer.classList.remove('graph-pick');composerAction=null;if(mode!=='reuse'&&mode!=='merge')setMode(null);}

  function beginBranch(){
    setMode(null);
    if(!cost(1))return toast('Not enough chips.'); const node=nodes.get(selectedId);
    openComposer({action:'branch',eyebrow:'BRANCH · 1 CHIP',title:'Explore new directions',copy:`Create 1–3 child ideas from ${label(node)}.`,confirm:'CREATE BRANCHES',body:`<input class="branch-input" placeholder="Child idea 1"><input class="branch-input" placeholder="Child idea 2 (optional)"><input class="branch-input" placeholder="Child idea 3 (optional)">`});
  }

  function beginMerge(){
    if(!cost(2))return toast('Not enough chips.'); setMode('merge'); multiSelected=new Set([selectedId]);
    openComposer({action:'merge',eyebrow:'MERGE · 2 CHIPS',title:'Synthesize branches',copy:'Click additional nodes on the graph. Merge needs at least two different lineages.',confirm:'CREATE MERGE',body:`<div class="selection-list" id="mergeSelection"></div><textarea id="mergeText" rows="4" placeholder="Write one genuinely synthesized idea..."></textarea>`});
    updateMergeComposer();
  }

  function updateMergeComposer(){
    if(composerAction!=='merge')return;const box=$('#mergeSelection'); if(!box)return; box.replaceChildren();
    multiSelected.forEach(id=>{const n=nodes.get(id);const pill=document.createElement('span');pill.className='selection-pill';pill.textContent=`${label(n)} · ${n.text.slice(0,36)}${n.text.length>36?'…':''}`;box.append(pill);});
    const lineageSet=new Set();multiSelected.forEach(id=>nodes.get(id).lineages.forEach(x=>lineageSet.add(x)));
    composerConfirm.disabled=multiSelected.size<2||lineageSet.size<2;
  }

  function beginReuse(){ setMode('reuse'); toast('Reuse mode: click a destination node.'); }

  function completeReuse(targetId){
    const from=selectedId;if(from===targetId)return toast('Choose a different destination.');
    if(edges.some(e=>e.type==='reuse'&&e.from===from&&e.to===targetId))return toast('That reuse connection already exists.');
    addEdge(from,targetId,'reuse');drawEdges();log('REUSE',`${label(nodes.get(from))} connected to ${label(nodes.get(targetId))}.`);setMode(null);selectNode(targetId);
  }

  function beginFeedback(){
    setMode(null);
    if(!cost(1))return toast('Not enough chips.');const node=nodes.get(selectedId);
    if(!node.score)return toast('Score this node before requesting feedback.');
    if(node.feedbackCount>=2)return toast('This node already has 2 feedback loops.');
    const critique=makeCritique(node.score);
    openComposer({action:'feedback',eyebrow:'FEEDBACK LOOP · 1 CHIP',title:'Improve the thought',copy:`The original ${label(node)} stays visible.`,confirm:'CREATE IMPROVED NODE',body:`<div class="critique">${escapeHtml(critique)}</div><textarea id="feedbackText" rows="4" placeholder="Write the improved version...">${escapeHtml(node.text)}</textarea>`});
  }

  function makeCritique(score){
    const entries=Object.entries(score).sort((a,b)=>a[1]-b[1]);
    return {relevance:'Tie the idea more directly to student motivation and access.',novelty:'Add a distinctive mechanism students can actively participate in.',coherence:'Make the idea more concrete, sequenced, and easier to execute.'}[entries[0][0]];
  }

  function setMode(next){ mode=next; $$('.op-button').forEach(b=>b.classList.toggle('active',b.dataset.op===mode)); if(!next)multiSelected=new Set([selectedId]); updateSelectionUI(); }

  function confirmComposer(){
    const source=nodes.get(selectedId);
    const required={branch:1,merge:2,feedback:1}[composerAction];
    if(required===undefined)return;
    if(!cost(required))return toast('Not enough chips.');
    if(composerAction==='branch'){
      const ideas=$$('.branch-input').map(i=>i.value.trim()).filter(Boolean).slice(0,3); if(!ideas.length)return toast('Enter at least one child idea.');
      spend(1); ideas.forEach((text,i)=>{const pos=nextChildPosition(source,i,ideas.length);const lineages=source.type==='root'?new Set([`branch-${nodeSeq+1}`]):new Set(source.lineages);createNode({text,type:'branch',parents:[source.id],...pos,lineages});});
      log('BRANCH',`${ideas.length} idea${ideas.length>1?'s':''} explored from ${label(source)}.`);closeComposer();
    } else if(composerAction==='merge'){
      const text=$('#mergeText').value.trim(); if(!text)return toast('Write the synthesized idea.');
      const ids=[...multiSelected],lineages=new Set();ids.forEach(id=>nodes.get(id).lineages.forEach(x=>lineages.add(x))); if(ids.length<2||lineages.size<2)return toast('Choose nodes from different branches.');
      setMode(null);spend(2);const selected=ids.map(id=>nodes.get(id));const avgY=selected.reduce((s,n)=>s+n.y,0)/selected.length, maxX=Math.max(...selected.map(n=>n.x));
      const merged=createNode({text,type:'merge',parents:ids,x:Math.min(1230,maxX+275),y:Math.max(45,Math.min(760,avgY)),lineages});
      log('MERGE',`${ids.length} branches synthesized into ${label(merged)}.`);setMode(null);closeComposer();
    } else if(composerAction==='feedback'){
      const text=$('#feedbackText').value.trim();if(!text)return toast('Write the improved version.');
      spend(1);source.feedbackCount++;renderNode(source);const child=createNode({text,type:'feedback',parents:[source.id],x:Math.min(1230,source.x+275),y:Math.min(760,source.y+128),lineages:new Set(source.lineages)});
      log('FEEDBACK',`${label(source)} improved into ${label(child)}.`);closeComposer();
    }
  }

  function scoreSelected(){
    if(!cost(1))return toast('Not enough chips.');const node=nodes.get(selectedId);const score={};ranges.forEach(k=>score[k]=Number($(`#${k}`).value));node.score=score;spend(1);renderNode(node);log('SCORE',`${label(node)} scored R${score.relevance} · N${score.novelty} · C${score.coherence}.`);updateSelectionUI();
  }

  function collectLineage(id,seen=new Set()){
    if(seen.has(id))return seen;seen.add(id);const n=nodes.get(id);n.parents.forEach(p=>collectLineage(p,seen));return seen;
  }

  function submitFinal(){
    const node=nodes.get(selectedId);nodeLayer.querySelectorAll('.thought-node').forEach(el=>el.classList.toggle('final',el.dataset.nodeId===node.id));
    const base=node.score?(node.score.relevance+node.score.novelty+node.score.coherence)/3:0;
    const lineage=[...collectLineage(node.id)];const enhancers=lineage.map(id=>nodes.get(id)).filter(n=>n.type==='merge'||n.type==='feedback').length;
    const multiplier=1+enhancers*.5;const score=enhancers?Math.min(5,base*multiplier):Math.min(3,base);
    $('#finalNodeText').textContent=node.text;$('#finalScore').textContent=score.toFixed(1);
    $('#finalMetrics').innerHTML=node.score?`<span>Relevance ${node.score.relevance}</span><span>Novelty ${node.score.novelty}</span><span>Coherence ${node.score.coherence}</span>`:'<span>Unscored base node</span>';
    $('#finalFormula').textContent=enhancers?`Base ${base.toFixed(2)} × ${multiplier.toFixed(1)} (${enhancers} Merge/Feedback ancestor${enhancers===1?'':'s'}) → capped at 5`:`No Merge or Feedback in lineage → final score capped at 3/5`;
    finalScreen.hidden=false;log('FINAL',`${label(node)} submitted with ${score.toFixed(1)}/5.`);
  }

  function reset(){ finalScreen.hidden=true;composer.hidden=true;composer.classList.remove('graph-pick');makeInitialState();renderAll();historyList.replaceChildren();moveCount.textContent='0';setMode(null);viewport.scrollTo({left:0,top:160,behavior:'auto'}); }

  $$('.op-button').forEach(btn=>btn.addEventListener('click',()=>({branch:beginBranch,merge:beginMerge,reuse:beginReuse,feedback:beginFeedback}[btn.dataset.op])()));
  ranges.forEach(k=>{const input=$(`#${k}`),out=$(`#${k}Out`);input.addEventListener('input',()=>{out.value=input.value;out.textContent=input.value;});});
  $('#scoreButton').addEventListener('click',scoreSelected);$('#finalButton').addEventListener('click',submitFinal);
  $('#composerClose').addEventListener('click',()=>{composer.hidden=true;composer.classList.remove('graph-pick');setMode(null);composerAction=null;});composerConfirm.addEventListener('click',confirmComposer);
  $('#restartButton').addEventListener('click',reset);addEventListener('resize',drawEdges);

  makeInitialState();renderAll();requestAnimationFrame(()=>viewport.scrollTo({left:0,top:160,behavior:'auto'}));
})();
