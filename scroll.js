'use strict';
(() => {
 const hero=document.querySelector('.hero'),story=document.querySelector('.scroll-story'),title=document.querySelector('.title-group'),heading=document.querySelector('#title');
 const chapter=document.querySelector('.chapter'),category=document.querySelector('.chapter-category em'),question=document.querySelector('.chapter-question'),hint=document.querySelector('.chapter-hint');
 const links=[...document.querySelectorAll('.artifact-link,.chapter-link')],insight=document.querySelector('.bottom-insight'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const entries=[null,{category:'Architecture',question:'What does the thinking?',href:'bdh-cq/index.html'}, {category:'Inference Strategy',question:'How is compute spent?',href:'inference-strategy/index.html'}, {category:'Adaptation',question:'What can change?',href:'adaptation/index.html'}];
 const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
 let pending=false,frame=0,target=null,used=false,sum=0,idle=0,shown=-1;
 const gentle=()=>reduced.matches||hero.classList.contains('paused');
 heading.setAttribute('aria-label',[...heading.children].map(x=>x.textContent).join(' '));
 [...heading.children].forEach(row=>{const text=row.textContent;row.className='title-row';row.setAttribute('aria-hidden','true');row.replaceChildren();[...text].forEach(char=>{const b=document.createElement('b');b.className=char===' '?'title-space':'title-letter';b.textContent=char;row.append(b);});});
 function render(){pending=false;
  const distance=story.offsetHeight-hero.offsetHeight,q=clamp((scrollY-story.offsetTop)/Math.max(1,distance))*3,g=gentle();
  // Observed Igloo sequence: short orbit, diagonal recession, then a soft occlusion.
  const retreat=smooth((q-.10)/.76),fade=smooth((q-.22)/.67),veil=Math.sin(Math.PI*clamp((q-.14)/.86));
  const dx=g?0:-hero.clientWidth*.23*retreat,dy=g?0:-hero.clientHeight*.23*retreat,depth=g?0:-820*retreat;
  const cameraTransform=`perspective(1000px) translate3d(${dx}px,${dy}px,${depth}px) rotateX(${g?0:retreat*13}deg) rotateY(${g?0:-retreat*19}deg) rotateZ(${g?0:-retreat*5}deg) scale(${1-retreat*.24})`;
  title.style.opacity=1-fade;title.style.transform=`translate(-50%,-50%) ${cameraTransform}`;
  title.style.filter=g?'none':`blur(${retreat*12}px)`;
  heading.style.textShadow=g||q===0?'none':`${retreat*3}px 0 ${retreat*7}px #b5dfff66,${-retreat*3}px 0 ${retreat*7}px #ffd8cc55`;
  title.inert=q>.3;hero.style.setProperty('--support',1-fade);
  hero.style.setProperty('--scene-alpha',1-smooth((q-.12)/.78));
  hero.style.setProperty('--field-blur',`${g?0:veil*8}px`);
  hero.querySelectorAll('.subtitle,footer,.side').forEach(el=>{el.style.animation='none';if(!el.classList.contains('subtitle')){el.style.transform=cameraTransform;el.style.filter=g?'none':`blur(${retreat*10}px)`;}});
  const n=Math.max(1,Math.min(3,Math.round(q))),entry=entries[n],settled=1-smooth(Math.abs(q-n)/.26);
  if(shown!==n){shown=n;category.textContent=entry.category;question.textContent=entry.question;links.forEach(a=>{a.href=entry.href;a.setAttribute('aria-label',`Explore ${entry.category}`)});hint.textContent='Click to explore';}
  chapter.style.opacity=settled;chapter.style.setProperty('--callout-draw',1-settled);chapter.inert=settled<.95;
  category.style.transform=`translateY(${g?0:(1-settled)*8}px)`;
  insight.classList.toggle('is-visible',q>2.97);insight.inert=q<=2.97;
  hero.querySelectorAll('.side').forEach(el=>el.tabIndex=q>.3?-1:0);
  document.querySelectorAll('[data-step]').forEach(b=>{if(+b.dataset.step===Math.round(q))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  const fallback=hero.querySelector('.artifact-fallback');fallback.textContent=q<.5?'✦':q<1.5?'?':q<2.5?'⚙':'◷';fallback.style.left=q<.5?'8%':'47%';fallback.style.top=q<.5?'10%':'40%';
  window.ttaState={p:q/3,q,gentle:g};dispatchEvent(new CustomEvent('tta-progress',{detail:window.ttaState}));
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
 function go(step){cancelAnimationFrame(frame);target=step;const from=scrollY,to=story.offsetTop+step*(story.offsetHeight-hero.offsetHeight)/3,start=performance.now();
  const duration=gentle()?1:((window.ttaState?.q||0)<.01||step===0?1450:1750);
  function tick(now){const t=clamp((now-start)/duration);scrollTo(0,from+(to-from)*smooth(t));if(t<1)frame=requestAnimationFrame(tick);else{target=null;document.querySelector('.story-status').textContent=step?entries[step].category:'Introduction';}}
  frame=requestAnimationFrame(tick);
 }
 addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY)return;
  const local=scrollY-story.offsetTop,distance=story.offsetHeight-hero.offsetHeight,dir=Math.sign(e.deltaY);
  if(local< -1||local>distance+1||(local<=0&&dir<0)||(local>=distance-1&&dir>0))return;
  e.preventDefault();clearTimeout(idle);idle=setTimeout(()=>{used=false;sum=0;},240);
  if(used||target!==null)return;sum+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(sum)<12)return;used=true;go(Math.max(0,Math.min(3,Math.round(local/distance*3)+dir)));
 },{passive:false});
 document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.step)));
 addEventListener('keydown',e=>{
  if(e.target.closest('button,a,input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;
  const keys={ArrowDown:1,PageDown:1,' ':e.shiftKey?-1:1,ArrowUp:-1,PageUp:-1};
  if(!(e.key in keys)&&!['Home','End'].includes(e.key))return;e.preventDefault();
  if(target!==null)return;const q=window.ttaState?.q||0;go(e.key==='Home'?0:e.key==='End'?3:Math.max(0,Math.min(3,Math.round(q)+keys[e.key])));
 });
 let touchY=null,touchStep=0;
 addEventListener('touchstart',e=>{if(e.touches.length!==1)return;cancelAnimationFrame(frame);target=null;touchY=e.touches[0].clientY;touchStep=Math.round(window.ttaState?.q||0);},{passive:true});
 addEventListener('touchmove',e=>{if(touchY!==null&&e.touches.length===1&&Math.abs(touchY-e.touches[0].clientY)>12)e.preventDefault();},{passive:false});
 addEventListener('touchend',e=>{if(touchY===null)return;const delta=touchY-e.changedTouches[0].clientY;if(Math.abs(delta)>35)go(Math.max(0,Math.min(3,touchStep+Math.sign(delta))));touchY=null;},{passive:true});
 addEventListener('touchcancel',()=>{touchY=null;},{passive:true});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);addEventListener('tta-motion-change',schedule);
 window.ttaGo=go;
 const sceneHashes={'#architectures':1,'#inference':2,'#adaptation':3};
 function restoreScene(){
  const chapterStep=sceneHashes[location.hash] ?? history.state?.chapterStep;
  if(chapterStep!=null){cancelAnimationFrame(frame);target=null;scrollTo({top:story.offsetTop+chapterStep*(story.offsetHeight-hero.offsetHeight)/3,behavior:'instant'});}
  render();document.documentElement.classList.remove('restoring-scene');
 }
 addEventListener('pageshow',restoreScene);addEventListener('hashchange',restoreScene);
 restoreScene();
})();
