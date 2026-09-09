import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
const hero=document.querySelector('.hero'),canvas=document.querySelector('.web-canvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scene=new THREE.Scene();scene.background=new THREE.Color(0);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);
let renderer,frame,last=0,nodes=[],edges=[],lineGeometry,lines,disposed=false;
const pointer=new THREE.Vector2(99,99),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3();
let hovering=false,baseDistance=11.8;
let storyState=window.ttaState||{q:0,gentle:false};
addEventListener('tta-progress',e=>{storyState=e.detail;if((storyState.q||0)<1&&renderer&&lineGeometry)wake();});
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
// A real camera move changes the field perspective; the artifact uses its own camera.
function positionCamera(){
 const q=clamp(storyState.q||0),gentle=storyState.gentle||reduced.matches;
 const leave=smooth((q-.08)/.68),arrive=gentle?0:smooth((q-.72)/.28),r=gentle?0:leave;
 const pull=1+1.45*r-1.22*(gentle?0:arrive);
 camera.position.set(baseDistance*(.48*r-.26*arrive),baseDistance*(-.31*r+.23*arrive),baseDistance*pull);
 camera.lookAt(baseDistance*(.29*r-.18*arrive),baseDistance*(-.20*r+.16*arrive),0);
 camera.updateMatrixWorld();
}
const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=128;
const ctx=textureCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.08,'rgba(255,255,255,1)');gradient.addColorStop(.25,'rgba(255,255,255,.7)');gradient.addColorStop(.55,'rgba(255,255,255,.18)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
const glowTexture=new THREE.CanvasTexture(textureCanvas);
const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false});
function resize(){const w=hero.clientWidth,h=hero.clientHeight;camera.aspect=w/h;baseDistance=Math.max(11.8,8.7/(Math.tan(Math.PI*21/180)*camera.aspect));camera.position.z=baseDistance;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);frameBranches();positionCamera();updateBrightness();}
function frameBranches(){
 const halfHeight=baseDistance*Math.tan(Math.PI*21/180);
 nodes.forEach(node=>{const a=node.userData.authored;if(!a)return;node.userData.home.copy(a);node.userData.home.y=a.y*halfHeight*.88/4.1;node.position.copy(node.userData.home);});
}
function updateBrightness(){
 const title=document.querySelector('#title').getBoundingClientRect(),box=hero.getBoundingClientRect();
 nodes.forEach(node=>{
  const pos=node.userData.home.clone().project(camera),x=(pos.x+1)*box.width/2,y=(1-pos.y)*box.height/2;
  const left=title.left-box.left,right=title.right-box.left,top=title.top-box.top,bottom=title.bottom-box.top;
  const dx=Math.max(left-x,0,x-right),dy=Math.max(top-y,0,y-bottom),distance=Math.hypot(dx,dy);
  const near=Math.exp(-distance*distance/(box.height*.16)**2);
  const root=node.userData.authored.x< -5&&node.userData.authored.y< -2;
  const varied=node.userData.index%5===0?.85:node.userData.index%3===0?.48:.22;
  const strength=root?1:Math.max(varied,near*.96);
  node.userData.ringMaterial.opacity=strength;
  node.userData.glow.material.opacity=strength;
  node.userData.glow.scale.setScalar(root?2.15:1.5+near*1.1);
 });
}
function move(e){const r=hero.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);hovering=true;}
function leave(){hovering=false;}
function render(now){if(disposed||(storyState.q||0)>=1)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;
 const paused=hero.classList.contains('paused')||reduced.matches;
 positionCamera();
 ray.setFromCamera(pointer,camera);ray.ray.intersectPlane(plane,hit);
 if(!paused){
  const blend=1-Math.exp(-dt*9);
  for(const node of nodes){const home=node.userData.home;const dx=home.x-hit.x,dy=home.y-hit.y;const distance=Math.hypot(dx,dy);const strength=hovering?Math.exp(-distance*distance/3.8):0;
   // Continuous local deformation; no clocks, bursts, or detached edge transforms.
   node.userData.target.set(home.x+dx*strength*.38,home.y+dy*strength*.38,home.z+strength*.85);
   node.position.lerp(node.userData.target,blend);
  }
 }
 const array=lineGeometry.attributes.position.array;
 edges.forEach((edge,i)=>{nodes[edge.a].position.toArray(array,i*6);nodes[edge.b].position.toArray(array,i*6+3);});
 lineGeometry.attributes.position.needsUpdate=true;
 renderer.render(scene,camera);if(!document.hidden)frame=requestAnimationFrame(render);
}
function wake(){cancelAnimationFrame(frame);last=performance.now();frame=requestAnimationFrame(render);}
function visibility(){cancelAnimationFrame(frame);if(!document.hidden)wake();}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.outputColorSpace=THREE.SRGBColorSpace;resize();
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/interconnected-web.glb',import.meta.url).href);
 const edgeParts=[];gltf.scene.traverse(part=>{if(part.userData.kind==='node')nodes.push(part);if(part.userData.kind==='edge'){edges.push(part.userData);edgeParts.push(part);}});
 nodes.sort((a,b)=>a.userData.index-b.userData.index);
 edgeParts.forEach(part=>{part.removeFromParent();part.geometry.dispose();});
 nodes.forEach(node=>{node.userData.authored=node.position.clone();node.userData.home=node.position.clone();node.userData.target=node.position.clone();
 const material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false});
 node.traverse(part=>{if(part.isMesh)part.material=material;});node.userData.ringMaterial=material;
 const glow=new THREE.Sprite(glowMaterial.clone());node.userData.glow=glow;node.add(glow);
 });frameBranches();updateBrightness();document.fonts.ready.then(updateBrightness);
 scene.add(gltf.scene);
 lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(edges.length*6),3).setUsage(THREE.DynamicDrawUsage));
 lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0xb9b9b9,transparent:true,opacity:.36,depthWrite:false}));lines.frustumCulled=false;scene.add(lines);
 addEventListener('resize',resize);hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
 addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());glowTexture.dispose();renderer.dispose();});wake();
}catch(error){console.warn('Web background could not load:',error);renderer?.dispose();canvas.hidden=true;}
