'use strict';
(() => {
  const chooser = document.querySelector('#chooser');
  const lesson = document.querySelector('#lesson');
  const stage = document.querySelector('#stage');
  const dock = document.querySelector('#dock');
  const processLine = document.querySelector('#processLine');
  const problemStrip = document.querySelector('#problemStrip');
  const lessonTitle = document.querySelector('#lessonTitle');
  const lessonType = document.querySelector('#lessonType');
  const stepIndicator = document.querySelector('.step-indicator');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let lessonName = null;
  let timers = [];
  const later = (fn, ms) => {
    const id = setTimeout(fn, reduced.matches ? 0 : ms);
    timers.push(id);
    return id;
  };
  const wait = ms => new Promise(resolve => later(resolve, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const lessons = {
    maze: { title: 'Mini Maze', type: 'BACKTRACKING', problem: 'Start at <strong>A</strong>. Search the maze until the agent reaches <strong>Z</strong>.', process: ['EXPLORE','DEAD END','BACKTRACK','TRY ANOTHER PATH','GOAL'] },
    planning: { title: 'Planning Problem', type: 'FUTURE CONSEQUENCES', problem: '“You have <strong>3 hours</strong> before a flight. You must eat, reach the airport, and complete check-in.”', process: ['GENERATE','COMPARE','PRUNE','EXPAND','PLAN'] },
    constraint: { title: 'Constraint Puzzle', type: 'CONSTRAINT SEARCH', problem: 'Arrange <strong>A, B, C, D</strong> · A before C · B not next to D · D not first', process: ['GENERATE','PRUNE','EXPAND','REPEAT','SOLUTION'] }
  };

  function setProcess(index) {
    [...processLine.children].forEach((el, i) => {
      el.classList.toggle('current', i === index);
      el.classList.toggle('done', i < index);
    });
    if (lessonName) stepIndicator.textContent = `${lessons[lessonName].title} · ${lessons[lessonName].process[Math.min(index, lessons[lessonName].process.length - 1)]}`;
  }

  function renderProcess(items) {
    processLine.innerHTML = items.map(x => `<span class="process-step">${x}</span>`).join('');
    setProcess(0);
  }

  function openLesson(name) {
    clearTimers(); lessonName = name;
    chooser.hidden = true; lesson.hidden = false;
    stage.dataset.lesson = name;
    const data = lessons[name];
    lessonTitle.textContent = data.title;
    lessonType.textContent = data.type;
    problemStrip.innerHTML = data.problem;
    renderProcess(data.process);
    stage.scrollLeft = 0;
    if (name === 'maze') initMaze();
    if (name === 'planning') initPlanning();
    if (name === 'constraint') initConstraint();
  }

  function goChooser() {
    clearTimers(); lessonName = null;
    lesson.hidden = true; chooser.hidden = false;
    stage.innerHTML = ''; dock.innerHTML = ''; processLine.innerHTML = '';
    delete stage.dataset.lesson;
    stepIndicator.textContent = 'Choose an example';
  }

  document.querySelectorAll('[data-lesson]').forEach(card => card.addEventListener('click', () => openLesson(card.dataset.lesson)));
  document.querySelector('#allExamples').addEventListener('click', goChooser);
  document.querySelector('#resetLesson').addEventListener('click', () => openLesson(lessonName));

  function canvas(extraClass = '') {
    stage.innerHTML = `<div class="canvas ${extraClass}"><svg class="edge-layer" aria-hidden="true"></svg></div>`;
    return stage.querySelector('.canvas');
  }

  function node(parent, id, html, x, y, classes = '') {
    const el = document.createElement('button');
    el.type = 'button'; el.id = id; el.className = `node ${classes}`.trim();
    el.style.left = `${x}px`; el.style.top = `${y}px`; el.innerHTML = html;
    parent.append(el); requestAnimationFrame(() => el.classList.add('show'));
    return el;
  }

  function passiveNode(parent, id, html, x, y, classes='') {
    const el = node(parent,id,html,x,y,classes); el.disabled = true; return el;
  }

  function center(el) {
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
  }

  function edge(parent, from, to, cls='draw') {
    const svg = parent.querySelector('.edge-layer');
    const a = center(from), b = center(to);
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    const dx = Math.max(24,(b.x-a.x)*.42);
    path.setAttribute('d',`M${a.x} ${a.y} C${a.x+dx} ${a.y}, ${b.x-dx} ${b.y}, ${b.x} ${b.y}`);
    path.setAttribute('class',`edge ${cls}`); path.dataset.from=from.id; path.dataset.to=to.id; svg.append(path); return path;
  }

  function dockUI(question, actions=[], note='') {
    dock.innerHTML = `<p class="dock-question">${question}</p><div class="dock-actions"></div>${note?`<div class="dock-note">${note}</div>`:''}`;
    const box = dock.querySelector('.dock-actions');
    actions.forEach(a => {
      const b = document.createElement('button'); b.type='button'; b.className=`action ${a.primary?'primary':''}`; b.textContent=a.label;
      b.addEventListener('click', a.onClick, {once: !!a.once}); box.append(b);
    });
  }

  function toast(text) {
    stage.querySelector('.toast')?.remove();
    const t=document.createElement('div');t.className='toast';t.textContent=text;stage.append(t);later(()=>t.remove(),2200);
  }

  // -------------------- MINI MAZE A-Z --------------------
  const MAZE_ADJ = {
    A:['B','C','D'], B:['E','F'], C:[], D:['G'], E:['I','H','J'], F:[], G:[],
    H:[], I:['M','L','N'], J:['K'], K:[], L:[], M:['Q','P','R'], N:['O'], O:[],
    P:[], Q:['U','T'], R:['S'], S:[], T:[], U:['Y','V','X'], V:['W'], W:[], X:[], Y:['Z'], Z:[]
  };
  const DFS_ADJ = {
    A:['C','D','B'], B:['F','E'], C:[], D:['G'], E:['H','J','I'], F:[], G:[],
    H:[], I:['L','N','M'], J:['K'], K:[], L:[], M:['P','R','Q'], N:['O'], O:[],
    P:[], Q:['T','U'], R:['S'], S:[], T:[], U:['V','X','Y'], V:['W'], W:[], X:[], Y:['Z'], Z:[]
  };
  const MAZE_POS = {
    A:[38,278], B:[142,278], C:[142,58], D:[142,498],
    E:[246,278], F:[246,148], G:[246,498],
    I:[350,278], H:[350,58], J:[350,408],
    M:[454,278], L:[454,88], N:[454,408], K:[454,508],
    Q:[558,278], P:[558,88], R:[558,408], O:[558,508],
    U:[662,278], T:[662,88], S:[662,448],
    Y:[766,278], V:[766,408], X:[766,88],
    Z:[870,278], W:[870,448]
  };
  const MAZE_GOAL_PATH = ['A','B','E','I','M','Q','U','Y','Z'];
  const MAZE_GOAL_EDGES = new Set(MAZE_GOAL_PATH.slice(0,-1).map((n,i)=>`${n}>${MAZE_GOAL_PATH[i+1]}`));
  const MAZE_PARENTS = {};
  Object.entries(MAZE_ADJ).forEach(([p,children]) => children.forEach(ch => { MAZE_PARENTS[ch]=p; }));

  let mazeNodes = {};
  let mazeCurrent = 'A';
  let mazePath = ['A'];
  let mazeExplored = new Set();
  let mazeAgentRunning = false;

  function initMaze() {
    const c = canvas('maze-canvas');
    mazeNodes = {}; mazeCurrent = 'A'; mazePath = ['A']; mazeExplored = new Set(); mazeAgentRunning = false;

    Object.entries(MAZE_POS).forEach(([key,[x,y]]) => {
      const n = node(c,`maze-${key.toLowerCase()}`,key,x,y,`maze-node ${key==='Z'?'goal-node':''}`);
      n.disabled = true;
      n.addEventListener('click',()=>manualMazeChoose(key));
      mazeNodes[key]=n;
    });

    Object.entries(MAZE_ADJ).forEach(([from,children]) => children.forEach(to => edge(c,mazeNodes[from],mazeNodes[to],'maze-edge')));
    mazeNodes.A.classList.add('active');
    setMazeChoices('A');
    addAgentControls(c);
    setProcess(0);
    dockUI('Choose a route from A — or let an AI agent visualize the search.',[], 'Connections stay hidden until you choose them or visualize with AI');
  }

  function mazeEdge(from,to) {
    return stage.querySelector(`.edge[data-from="maze-${from.toLowerCase()}"][data-to="maze-${to.toLowerCase()}"]`);
  }

  function setMazeChoices(parent) {
    Object.values(mazeNodes).forEach(n=>{ n.disabled=true; n.classList.remove('choice'); });
    const remaining = (MAZE_ADJ[parent]||[]).filter(ch=>!mazeExplored.has(`${parent}>${ch}`));
    remaining.forEach(ch=>{ mazeNodes[ch].disabled=false; mazeNodes[ch].classList.add('choice'); });
    if (remaining.length) dockUI(`Choose the next branch from ${parent}.`,[], 'Explore alternatives; failed branches remain visible');
  }

  function manualMazeChoose(key) {
    if (mazeAgentRunning) return;
    const from = mazeCurrent;
    if (!(MAZE_ADJ[from]||[]).includes(key)) return;
    mazeExplored.add(`${from}>${key}`);
    Object.values(mazeNodes).forEach(n=>{n.disabled=true;n.classList.remove('choice');});
    mazeNodes[from].classList.remove('active');
    mazeNodes[key].classList.add('active');
    mazeEdge(from,key)?.classList.add('active');
    mazePath.push(key); mazeCurrent=key;
    setProcess(0);

    if (key === 'Z') {
      finishManualMaze();
      return;
    }
    if ((MAZE_ADJ[key]||[]).length === 0) {
      setProcess(1);
      mazeNodes[key].classList.add('failed');
      dockUI('Dead end. The search must return to the last node with another option.',[], 'Backtracking keeps earlier alternatives available');
      later(backtrackManualMaze,650);
      return;
    }
    setMazeChoices(key);
  }

  function backtrackManualMaze() {
    setProcess(2);
    while (mazePath.length > 1) {
      const leaving = mazePath.pop();
      const parent = mazePath[mazePath.length-1];
      mazeNodes[leaving].classList.remove('active');
      if (!MAZE_GOAL_PATH.includes(leaving)) mazeNodes[leaving].classList.add('failed');
      const remaining = (MAZE_ADJ[parent]||[]).filter(ch=>!mazeExplored.has(`${parent}>${ch}`));
      mazeCurrent=parent;
      if (remaining.length) {
        mazeNodes[parent].classList.add('active');
        setProcess(3);
        setMazeChoices(parent);
        toast(`Backtrack to ${parent}`);
        return;
      }
      mazeNodes[parent].classList.remove('active');
      if (!MAZE_GOAL_PATH.includes(parent) && parent !== 'A') mazeNodes[parent].classList.add('failed');
    }
    mazeCurrent='A'; mazeNodes.A.classList.add('active'); setMazeChoices('A');
  }

  function finishManualMaze() {
    setProcess(4);
    MAZE_GOAL_PATH.forEach(k=>{mazeNodes[k].classList.remove('active','choice');mazeNodes[k].classList.add('success');});
    MAZE_GOAL_EDGES.forEach(pair=>{const [a,b]=pair.split('>');mazeEdge(a,b)?.classList.add('success');});
    dockUI('Goal reached: A → B → E → I → M → Q → U → Y → Z',[{label:'Run again',onClick:()=>openLesson('maze')}],'The successful route stays highlighted');
  }

  function addAgentControls(c) {
    const trigger=document.createElement('button');
    trigger.type='button'; trigger.className='agent-trigger'; trigger.textContent='Visualize with AI Agent';
    stage.append(trigger);

    const chooser=document.createElement('div');
    chooser.className='agent-algorithm-picker';
    chooser.innerHTML='<span>Choose search strategy</span><button type="button" data-algo="bfs">Breadth First Search</button><button type="button" data-algo="dfs">Depth First Search</button>';
    stage.append(chooser);

    const cost=document.createElement('div');
    cost.className='cost-panel';
    cost.innerHTML='<span>Computational Cost</span><div class="cost-track"><i></i></div><b>0 dead ends</b>';
    stage.append(cost);

    trigger.addEventListener('click',()=>{
      if (mazeAgentRunning) return;
      c.classList.add('agent-revealed');
      resetMazeForAgent();
      ensureRobot(c);
      chooser.classList.add('show');
      trigger.classList.add('active');
      trigger.textContent='AI Agent Ready';
      dockUI('Choose how the agent should search the graph.',[], 'Breadth-first explores level by level; depth-first follows a branch before returning');
    });
    chooser.querySelectorAll('[data-algo]').forEach(btn=>btn.addEventListener('click',()=>runMazeAgent(btn.dataset.algo)));
  }

  function resetMazeForAgent() {
    Object.values(mazeNodes).forEach(n=>{
      n.disabled=true;
      n.classList.remove('choice','active','failed','success','agent-visited','agent-current');
    });
    stage.querySelectorAll('.maze-edge').forEach(e=>e.classList.remove('active','failed','success','agent-active'));
    mazeNodes.A.classList.add('active');
    updateCost(0);
  }

  function ensureRobot(c) {
    let robot=c.querySelector('.maze-robot');
    if (!robot) {
      robot=document.createElement('div'); robot.className='maze-robot'; robot.setAttribute('aria-label','AI search agent');
      robot.innerHTML='<i></i><span></span>';
      c.append(robot);
    }
    moveRobotInstant(robot,'A');
    return robot;
  }

  function moveRobotInstant(robot,key) {
    const n=mazeNodes[key];
    robot.style.left=`${n.offsetLeft + n.offsetWidth/2 - 14}px`;
    robot.style.top=`${n.offsetTop - 34}px`;
  }

  function updateCost(cost) {
    const panel=stage.querySelector('.cost-panel'); if(!panel)return;
    panel.classList.add('show');
    panel.querySelector('.cost-track i').style.width=`${Math.min(100,cost*8)}%`;
    panel.querySelector('b').textContent=`${cost} dead end${cost===1?'':'s'}`;
  }

  function algorithmOrder(type) {
    if (type === 'bfs') {
      const q=['A'], seen=new Set(['A']), order=[];
      while(q.length){
        const cur=q.shift(); order.push(cur); if(cur==='Z')break;
        (MAZE_ADJ[cur]||[]).forEach(ch=>{if(!seen.has(ch)){seen.add(ch);q.push(ch);}});
      }
      return order;
    }
    const order=[]; let found=false;
    const dfs=(cur)=>{
      if(found)return; order.push(cur); if(cur==='Z'){found=true;return;}
      (DFS_ADJ[cur]||[]).forEach(ch=>dfs(ch));
    };
    dfs('A'); return order;
  }

  function routeBetween(from,to) {
    if(from===to)return [];
    const chainA=[]; let a=from; while(a){chainA.push(a);a=MAZE_PARENTS[a];}
    const chainB=[]; let b=to; while(b){chainB.push(b);b=MAZE_PARENTS[b];}
    const setA=new Set(chainA); const lca=chainB.find(x=>setA.has(x));
    const up=chainA.slice(0,chainA.indexOf(lca)+1);
    const down=chainB.slice(0,chainB.indexOf(lca)).reverse();
    return [...up.slice(1),...down];
  }

  function getEdgeBetween(a,b) {
    if (MAZE_PARENTS[b]===a) return mazeEdge(a,b);
    if (MAZE_PARENTS[a]===b) return mazeEdge(b,a);
    return null;
  }

  async function runMazeAgent(type) {
    if (mazeAgentRunning) return;
    mazeAgentRunning=true;
    const picker=stage.querySelector('.agent-algorithm-picker'); picker.classList.remove('show');
    const trigger=stage.querySelector('.agent-trigger'); trigger.textContent=type==='bfs'?'Running BFS…':'Running DFS…';
    const robot=ensureRobot(stage.querySelector('.maze-canvas'));
    const order=algorithmOrder(type);
    let current='A', cost=0;
    resetMazeForAgent(); mazeNodes.A.classList.add('agent-visited');
    setProcess(0);
    dockUI(type==='bfs'?'Breadth First Search is exploring level by level.':'Depth First Search is following one branch at a time.',[], 'Watch the robot revisit earlier nodes when it needs another branch');

    for (const target of order.slice(1)) {
      const route=routeBetween(current,target);
      if (route.length>1) setProcess(2);
      let hopFrom=current;
      for (const hop of route) {
        const e=getEdgeBetween(hopFrom,hop); if(e)e.classList.add('agent-active');
        const n=mazeNodes[hop];
        robot.style.left=`${n.offsetLeft+n.offsetWidth/2-14}px`;
        robot.style.top=`${n.offsetTop-34}px`;
        await wait(340);
        if(e)e.classList.remove('agent-active');
        hopFrom=hop;
      }
      current=target;
      Object.values(mazeNodes).forEach(n=>n.classList.remove('agent-current'));
      mazeNodes[target].classList.add('agent-current','agent-visited');
      if ((MAZE_ADJ[target]||[]).length===0 && target!=='Z') {
        cost+=1; updateCost(cost); setProcess(1);
        mazeNodes[target].classList.add('failed');
        const parent=MAZE_PARENTS[target]; if(parent)mazeEdge(parent,target)?.classList.add('failed');
        await wait(520);
      } else {
        setProcess(0);
        await wait(230);
      }
      if(target==='Z')break;
    }

    setProcess(4);
    MAZE_GOAL_PATH.forEach(k=>{mazeNodes[k].classList.remove('failed','agent-current');mazeNodes[k].classList.add('success');});
    MAZE_GOAL_EDGES.forEach(pair=>{const [a,b]=pair.split('>');mazeEdge(a,b)?.classList.add('success');});
    mazeNodes.Z.classList.add('agent-current');
    trigger.textContent=type==='bfs'?'BFS reached Z':'DFS reached Z';
    dockUI(`${type==='bfs'?'Breadth First Search':'Depth First Search'} reached Z.`,[{label:'Run again',onClick:()=>openLesson('maze')}],`${cost} dead ends increased the visible computational cost`);
    mazeAgentRunning=false;
  }

  // -------------------- PLANNING --------------------
  function initPlanning() {
    const c=canvas('planning-canvas'); setProcess(0);
    const start=passiveNode(c,'plan-start','<span class="small">TIME REMAINING</span><span class="score">180 min</span>',36,274,'active plan-root');
    later(()=>{
      const eat=node(c,'plan-eat','Eat at restaurant<span class="small">60 min</span>',220,78,'choice plan-option');
      const travel=node(c,'plan-travel','Travel to airport<span class="small">45 min</span>',220,268,'choice plan-option');
      const order=node(c,'plan-order','Order food<span class="small">35 min</span>',220,458,'choice plan-option');
      edge(c,start,eat);edge(c,start,travel);edge(c,start,order);
      eat.addEventListener('click',()=>expandEatPlan(c,eat,travel,order),{once:true});
      travel.addEventListener('click',()=>expandTravelPlan(c,eat,travel,order),{once:true});
      order.addEventListener('click',()=>expandOrderPlan(c,eat,travel,order),{once:true});
      dockUI('Which plan should we explore?',[], 'Each branch expands into its future consequences');
    },350);
  }

  function lockPlanRoots(selected, ...others) {
    [selected,...others].forEach(n=>{n.classList.remove('choice');n.disabled=true;});
    selected.classList.add('active');
    others.forEach(n=>n.classList.add('muted-option'));
    setProcess(1);
  }

  function compareAnotherPlanAction() {
    return {label:'Compare another plan',onClick:()=>openLesson('planning')};
  }

  function expandEatPlan(c,eat,travel,order) {
    lockPlanRoots(eat,travel,order);
    eat.innerHTML='Eat at restaurant<span class="small">60 min</span><span class="score">28%</span>';
    const after=passiveNode(c,'eat-after','<span class="small">AFTER MEAL</span><span class="score">120 min</span>',430,78,'active plan-generated');
    edge(c,eat,after,'draw active plan-generated-edge');
    const airport=node(c,'eat-airport','Reach airport<span class="small">90 min</span><span class="score">24%</span>',625,18,'choice plan-generated');
    const cab=node(c,'eat-cab','Priority cab<span class="small">75 min</span><span class="score">41%</span>',625,108,'choice plan-generated');
    const linger=node(c,'eat-linger','Stay 20 min more<span class="small">+20 min</span><span class="score">8%</span>',625,198,'choice plan-generated');
    edge(c,after,airport,'plan-generated-edge');edge(c,after,cab,'plan-generated-edge');edge(c,after,linger,'plan-generated-edge');
    airport.addEventListener('click',()=>{
      [airport,cab,linger].forEach(n=>{n.disabled=true;n.classList.remove('choice');});
      airport.classList.add('active'); cab.classList.add('failed'); linger.classList.add('failed'); setProcess(3);
      const left=passiveNode(c,'eat-left','<span class="small">AT AIRPORT</span><span class="score">30 min</span>',820,18,'active plan-generated'); edge(c,airport,left,'draw active plan-generated-edge');
      const check=passiveNode(c,'eat-check','Check-in<span class="small">25 min</span><span class="score">5 min buffer</span>',1010,4,'plan-generated warning-node');
      const queue=passiveNode(c,'eat-queue','Security queue<span class="small">35 min</span><span class="score">MISSED</span>',1010,100,'failed plan-generated');
      edge(c,left,check,'plan-generated-edge');edge(c,left,queue,'plan-generated-edge failed');
      setProcess(2);
      dockUI('Restaurant first leaves almost no recovery time.',[compareAnotherPlanAction()],'A 90-minute airport leg collapses the safety margin');
    },{once:true});
    cab.addEventListener('click',()=>toast('Faster, but the meal-first choice still consumes too much buffer'));
    linger.addEventListener('click',()=>toast('This branch makes the airport deadline highly fragile'));
    dockUI('Eating first creates a longer airport leg. Which consequence should we inspect?',[], 'The 90-minute route exposes why this plan is weak');
  }

  function expandTravelPlan(c,eat,travel,order) {
    lockPlanRoots(travel,eat,order);
    travel.innerHTML='Travel to airport<span class="small">45 min</span><span class="score best">88%</span>';
    const t135=passiveNode(c,'travel-after','<span class="small">AT AIRPORT</span><span class="score">135 min</span>',430,268,'active plan-generated'); edge(c,travel,t135,'draw active plan-generated-edge');
    const sit=node(c,'travel-sit','Sit-down meal<span class="small">45 min</span><span class="score">48%</span>',625,78,'choice plan-generated');
    const quick=node(c,'travel-quick','Quick meal<span class="small">20 min</span><span class="score">72%</span>',625,198,'choice plan-generated');
    const check=node(c,'travel-check','Check in first<span class="small">15 min</span><span class="score best">94%</span>',625,318,'choice plan-generated');
    const coffee=node(c,'travel-coffee','Coffee + snack<span class="small">10 min</span><span class="score">82%</span>',625,438,'choice plan-generated');
    [sit,quick,check,coffee].forEach(n=>edge(c,t135,n,n===check?'draw active plan-generated-edge':'plan-generated-edge'));
    check.addEventListener('click',()=>{
      [sit,quick,check,coffee].forEach(n=>{n.disabled=true;n.classList.remove('choice');}); sit.classList.add('failed'); quick.classList.add('muted-option'); coffee.classList.add('muted-option'); check.classList.add('active'); setProcess(3);
      const t120=passiveNode(c,'travel-120','<span class="small">AFTER CHECK-IN</span><span class="score">120 min</span>',820,318,'active plan-generated');edge(c,check,t120,'draw active plan-generated-edge');
      const ready=passiveNode(c,'travel-ready','Quick meal<span class="small">20 min</span><span class="goal-tag">READY FOR FLIGHT ✓</span>',1010,258,'success plan-generated');
      const lounge=passiveNode(c,'travel-lounge','Meal + lounge<span class="small">45 min</span><span class="score">75 min buffer</span>',1010,378,'plan-generated');
      edge(c,t120,ready,'draw success plan-generated-edge');edge(c,t120,lounge,'plan-generated-edge');
      setProcess(4);
      dockUI('Travel → Check in → Quick meal → Ready',[compareAnotherPlanAction()],'The plan protects time-critical tasks before optional comfort');
    },{once:true});
    sit.addEventListener('click',()=>toast('A long meal before check-in spends too much of the remaining buffer'));
    quick.addEventListener('click',()=>toast('Better, but check-in is still unresolved'));
    coffee.addEventListener('click',()=>toast('Low time cost, but the required check-in still comes next'));
    dockUI('At the airport, compare more future actions.',[], 'The graph now makes trade-offs visible instead of collapsing them into one score');
  }

  function expandOrderPlan(c,eat,travel,order) {
    lockPlanRoots(order,eat,travel);
    order.innerHTML='Order food<span class="small">35 min</span><span class="score">61%</span>';
    const t145=passiveNode(c,'order-after','<span class="small">AFTER FOOD</span><span class="score">145 min</span>',430,458,'active plan-generated');edge(c,order,t145,'draw active plan-generated-edge');
    const leave=node(c,'order-leave','Leave immediately<span class="small">60 min travel</span><span class="score">74%</span>',625,338,'choice plan-generated');
    const delay=node(c,'order-delay','Food delayed<span class="small">+20 min</span><span class="score">43%</span>',625,458,'choice plan-generated');
    const eatride=node(c,'order-ride','Eat during ride<span class="small">55 min travel</span><span class="score">79%</span>',625,548,'choice plan-generated');
    edge(c,t145,leave,'plan-generated-edge');edge(c,t145,delay,'plan-generated-edge');edge(c,t145,eatride,'draw active plan-generated-edge');
    eatride.addEventListener('click',()=>{
      [leave,delay,eatride].forEach(n=>{n.disabled=true;n.classList.remove('choice');}); delay.classList.add('failed'); eatride.classList.add('active'); setProcess(3);
      const t90=passiveNode(c,'order-90','<span class="small">AT AIRPORT</span><span class="score">90 min</span>',820,548,'active plan-generated'); edge(c,eatride,t90,'draw active plan-generated-edge');
      const check=passiveNode(c,'order-check','Check-in<span class="small">20 min</span><span class="score">70 min buffer</span>',1010,508,'success plan-generated');
      edge(c,t90,check,'draw success plan-generated-edge');
      setProcess(4);
      dockUI('Order → Eat during ride → Check in',[compareAnotherPlanAction()],'Feasible, but still less robust than travelling first');
    },{once:true});
    leave.addEventListener('click',()=>toast('Feasible, but waiting for the order already spent 35 minutes'));
    delay.addEventListener('click',()=>toast('A small delay compounds the risk because travel still remains'));
    dockUI('Ordering preserves more time than a restaurant, but adds delivery uncertainty.',[], 'Expand a branch to see how uncertainty propagates');
  }

  // -------------------- CONSTRAINT PUZZLE --------------------
  const slots = arr => `<span class="slots">${arr.map(v=>`<i class="${v?'':'empty'}">${v||'_'}</i>`).join('')}</span>`;
  const alphabet=['A','B','C','D'];
  function violations(arr){
    const reasons=[];
    if(arr.includes('C')&&(!arr.includes('A')||arr.indexOf('A')>arr.indexOf('C')))reasons.push('A must come before C');
    if(arr[0]==='D')reasons.push('D cannot be first');
    if(arr.includes('B')&&arr.includes('D')&&Math.abs(arr.indexOf('B')-arr.indexOf('D'))===1)reasons.push('B cannot be next to D');
    return reasons;
  }
  function permutations(prefix=[]){if(prefix.length===4)return [prefix];return alphabet.filter(x=>!prefix.includes(x)).flatMap(x=>permutations([...prefix,x]));}
  function initConstraint(){renderConstraint([]);}
  function renderConstraint(prefix){
    const c=canvas('constraint-canvas');
    c.style.minWidth='1320px';c.style.minHeight='670px';
    let previous=null;
    for(let d=0;d<=prefix.length;d++){
      const part=prefix.slice(0,d),reasons=violations(part),last=d===prefix.length;
      const n=node(c,'con-path-'+d,slots([...part,...Array(4-d).fill('')]),25+d*235,290,'slot-node '+(last?(reasons.length?'failed':'active'):''));
      n.addEventListener('click',()=>renderConstraint(part));
      if(previous)edge(c,previous,n,reasons.length?'failed':'active');previous=n;
    }
    const reasons=violations(prefix);
    if(prefix.length===4){
      previous.classList.add(reasons.length?'failed':'success');
      previous.insertAdjacentHTML('beforeend',`<span class="${reasons.length?'prune-tag':'goal-tag'}">${reasons.length?'INVALID':'SOLUTION ✓'}</span>`);
      setProcess(reasons.length?1:4);
      dockUI(`${prefix.join(' → ')} — ${reasons.length?reasons.join(' · '):'All three constraints satisfied.'}`,[{label:'Backtrack one position',onClick:()=>renderConstraint(prefix.slice(0,-1))},{label:'Start another branch',onClick:()=>renderConstraint([])},{label:'Compare all 24 outcomes',onClick:showConstraintOutcomes}], 'Every ordering is available to explore.');
      return;
    }
    const choices=alphabet.filter(x=>!prefix.includes(x));
    choices.forEach((letter,i)=>{
      const next=[...prefix,letter],bad=violations(next),y=80+i*145;
      const count=permutations(next).filter(arr=>!violations(arr).length).length;
      const n=node(c,'con-choice-'+letter,slots([...next,...Array(4-next.length).fill('')])+`<span class="small">${bad.length?'Rule broken':count+' valid completion'+(count===1?'':'s')}</span>`,25+(prefix.length+1)*235,y,'slot-node choice');
      edge(c,previous,n,bad.length?'failed':'draw');n.addEventListener('click',()=>renderConstraint(next));
    });
    setProcess(prefix.length?2:0);
    const actions=[];
    if(prefix.length)actions.push({label:'Backtrack',onClick:()=>renderConstraint(prefix.slice(0,-1))});
    actions.push({label:'Compare all 24 outcomes',onClick:showConstraintOutcomes});
    dockUI(reasons.length?reasons.join(' · '):`Choose any remaining letter for position ${prefix.length+1}.`,actions,reasons.length?'This branch cannot satisfy the rules, but you can complete it to inspect its outcome.':'Click any previous node to return to that prefix.');
  }
  function showConstraintOutcomes(){
    dock.querySelector('.constraint-outcomes')?.remove();
    const table=document.createElement('table');table.className='constraint-outcomes';
    table.innerHTML='<thead><tr><th>Ordering</th><th>Result</th></tr></thead><tbody>'+permutations().map(arr=>{const bad=violations(arr);return `<tr class="${bad.length?'':'valid'}"><td>${arr.join(' → ')}</td><td>${bad.length?bad.join('; '):'Valid solution ✓'}</td></tr>`;}).join('')+'</tbody>';
    dock.append(table);
  }
})();
