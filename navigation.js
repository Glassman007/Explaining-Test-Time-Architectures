'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const expandToPage=async(link,e)=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
  if(reduced.matches||document.querySelector('.hero.paused'))return;e.preventDefault();if(document.querySelector('.page-expansion'))return;
  const rect=link.getBoundingClientRect(),overlay=document.createElement('div');overlay.className='page-expansion';document.body.append(overlay);
  try{await overlay.animate([{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:'20px'},{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}],{duration:900,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'}).finished;}catch{}
  location.href=link.href;
 };
 document.querySelectorAll('.tree-search,.graph-search,.architecture-link,.artifact-link,.chapter-link').forEach(link=>link.addEventListener('click',e=>expandToPage(link,e)));
 addEventListener('pageshow',()=>document.querySelector('.page-expansion')?.remove());


})();
