/* Input affordances for static and dynamically generated lesson controls. */
(() => {
 const actionWords=/^(run|send|check|reset|restore|erase|rebuild|go deeper|continue|halt|clear|turn output|inject|reveal temporary|step computation|lock|next|back|freeze|start|generate|expand|prune|sample)/i;
 function decorate(root){
  root.querySelectorAll('button').forEach(b=>{if(actionWords.test(b.textContent.trim()))b.classList.add('action-control');});
  root.querySelectorAll('.machine-canvas,#timelineTheta,.route-drop,[data-classify-drop],#queryToken,.rebuild-canvas').forEach(el=>{if(el.tagName==='BUTTON')return;el.classList.add('click-target');el.tabIndex=0;el.setAttribute('role','button');if(el.matches('.machine-canvas'))el.setAttribute('aria-label',el.closest('.machine-build').querySelector('h4').textContent.trim()+' component canvas');else if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim().replace(/\s+/g,' ').slice(0,150));});
 }
 decorate(document);let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate(document);});}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.click-target')){e.preventDefault();e.target.click();}});
})();
