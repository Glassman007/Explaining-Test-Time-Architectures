import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
const hero=document.querySelector('.hero'),canvas=document.querySelector('.artifact-canvas'),fallback=document.querySelector('.artifact-fallback');
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)};
let state=window.ttaState||{q:0,gentle:false},renderer,frame,disposed=false;
addEventListener('tta-progress',e=>{state=e.detail;const q=state.q;fallback.textContent=q<.5?'✦':q<1.5?'?':q<2.5?'⚙':'⑂';fallback.style.left=q<.5?'8%':'47%';fallback.style.top=q<.5?'10%':'40%';});
try{
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.65;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,100);camera.position.z=20;
 const rig=new THREE.Group();scene.add(rig);
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/interconnected-star.glb',import.meta.url).href);
 // Only particle targets are rendered. Original solid meshes and struts are not added to the scene.
 const targetNames=['star','question','gears','fork'],targets=[];
 for(const name of targetNames){let found;for(const sc of gltf.scenes)sc.traverse(o=>{if(o.userData.particleTarget===name)found=o;});if(!found)throw Error(`Missing embedded particle target: ${name}`);targets.push(found);}
 // Extra grains use distinct phases on the existing GLB transport paths; no duplicate rigid layer.
 const sourceCount=targets[0].geometry.attributes.position.count,count=Math.round(sourceCount*1.60);
 const positions=targets.map(o=>o.geometry.attributes.position.array),colors=targets.map(o=>o.geometry.attributes.color.array),partIds=targets.map(o=>o.geometry.attributes._part.array);
 const gearMeta=targets[2].userData,gearCenters=[new THREE.Vector3(.48,.4,0),new THREE.Vector3(-.64,-.49,0)].map(v=>v.sub(new THREE.Vector3().fromArray(gearMeta.sourceCenter)).multiplyScalar(gearMeta.sourceScale));
 const flowNext=targets.map(o=>o.geometry.attributes._flow_next.array);
 const flowIndex=targets.map(()=>Uint32Array.from({length:count},(_,i)=>i%sourceCount)),flowPhase=Float32Array.from({length:count},(_,i)=>(i*.61803398875)%1);
 let tubeSource;for(const sc of gltf.scenes)sc.traverse(o=>{if(o.userData.suspensionTube)tubeSource=o;});if(!tubeSource)throw Error('Missing hex suspension tube');
 // Size each cage once from its complete rotation envelope. It never breathes or turns with the object.
 const tubeWidths=positions.map((data,kind)=>{
  let envelope=0;
  for(let i=0;i<sourceCount;i++){
   const k=i*3;let extent=Math.hypot(data[k],data[k+2]);
   if(kind===2){const c=gearCenters[partIds[kind][i]===0?0:1];extent=Math.hypot(Math.abs(c.x)+Math.hypot(data[k]-c.x,data[k+1]-c.y),data[k+2]);}
   envelope=Math.max(envelope,extent);
  }
  return (envelope+.16)/.83;
 });
 const tubeRoot=new THREE.Group();scene.add(tubeRoot);
 const IMPACT_COUNT=16,impactSpots=Array.from({length:IMPACT_COUNT},()=>new THREE.Vector4(0,0,0,0));
 const contactUntil=new Float32Array(count);
 function touchTube(x,y,z,energy){
  let spot=impactSpots.find(p=>p.w>.002&&Math.hypot(p.x-x,p.y-y,p.z-z)<.30);
  if(!spot)spot=impactSpots.reduce((weakest,p)=>p.w<weakest.w?p:weakest,impactSpots[0]);
  spot.set(x,y,z,Math.max(spot.w,.45+.55*clamp(energy/5)));
 }
 const tubeMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,toneMapped:false,
  uniforms:{clock:{value:0},strength:{value:0},impacts:{value:impactSpots}},
  vertexShader:`attribute float _section;varying float sectionId;varying vec3 tubePoint;
   void main(){sectionId=_section;tubePoint=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying float sectionId;varying vec3 tubePoint;uniform float clock;uniform float strength;uniform vec4 impacts[16];
   float pulse(float period,float offset){float p=mod(clock+offset,period);if(p>=1.3)return 0.0;return pow(sin(p*3.14159265/1.3),2.0);}
   void main(){float flash=0.0;
    if(abs(sectionId-2.0)<.1)flash=pulse(13.0,3.0);
    if(abs(sectionId-11.0)<.1)flash=pulse(17.0,8.0);
    if(abs(sectionId-20.0)<.1)flash=pulse(19.0,1.0);
    if(abs(sectionId-23.0)<.1)flash=pulse(23.0,12.0);
    float contact=0.0;
    for(int i=0;i<16;i++)contact=max(contact,impacts[i].w*(1.0-smoothstep(.12,.48,distance(tubePoint,impacts[i].xyz))));
    // Zero resting opacity: only scheduled sections or the hexes beside an actual impact can appear.
    float alpha=max(flash*.025,contact*.14)*strength;
    if(alpha<.0005)discard;
    gl_FragColor=vec4(vec3(.82,.88,.94),alpha);}`});
 const suspensionTube=new THREE.LineSegments(tubeSource.geometry,tubeMaterial);tubeRoot.add(suspensionTube);
 let tubeHalfWidth=1.86,tubeCenterX=0;
 const moving=new Float32Array(count*3),tints=new Float32Array(count*3),localAmount=new Float32Array(count),geo=new THREE.BufferGeometry();
 const goldReveal=new Float32Array(count),goldBrightness=new Float32Array(count).fill(1);
 geo.setAttribute('goldReveal',new THREE.BufferAttribute(goldReveal,1).setUsage(THREE.DynamicDrawUsage));
 geo.setAttribute('goldBrightness',new THREE.BufferAttribute(goldBrightness,1).setUsage(THREE.DynamicDrawUsage));
 geo.setAttribute('grain',new THREE.BufferAttribute(Float32Array.from({length:count},(_,i)=>(i*.754877666)%1),1));
 geo.setAttribute('localAmount',new THREE.BufferAttribute(localAmount,1).setUsage(THREE.DynamicDrawUsage));
 // Each grain keeps its own displacement and launch velocity; untouched grains keep flowing normally.
 const disturbed=new Uint8Array(count);
 const displacement=new Float32Array(count*3),launchVelocity=new Float32Array(count*3),releaseAt=new Float32Array(count);
 const pointerMoves=[];let pointerSample=null,interactionKind=-1;
 const inverseRotation=new THREE.Quaternion(),brushDirection=new THREE.Vector3(),projectedPoint=new THREE.Vector3();
 geo.setAttribute('position',new THREE.BufferAttribute(moving,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.BufferAttribute(tints,3).setUsage(THREE.DynamicDrawUsage));
 const particleShader={vertexShader:`attribute vec3 color;attribute float localAmount;attribute float goldReveal;attribute float goldBrightness;attribute float grain;
 varying float vLocal;varying vec3 vColor;varying float vReveal;varying float vBrightness;varying float vGrain;
 uniform float pixelRatio;uniform float halo;uniform float particleScale;
 void main(){vGrain=grain;vLocal=localAmount;vColor=color;vReveal=goldReveal;vBrightness=goldBrightness;
 vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;
 gl_PointSize=mix(1.1+vGrain*.9,3.0+vReveal*4.0,halo)*pixelRatio*particleScale;}`,
 fragmentShader:`varying float vGrain;varying float vLocal;varying vec3 vColor;varying float vReveal;varying float vBrightness;
 uniform float amount;uniform float halo;
 void main(){vec2 uv=gl_PointCoord-.5;float radius=length(uv)*2.0;if(radius>1.0)discard;
 float core=1.0-smoothstep(.45,1.0,radius);float bloom=exp(-radius*radius*5.0)*.24;
 // A recessed inner ring: the outer rim remains white, and intact grains reveal no gold at any viewing angle.
 float innerRing=smoothstep(.18,.32,radius)*(1.0-smoothstep(.48,.64,radius));
 float goldMask=vReveal*mix(innerRing,.48,halo);
 vec3 gold=vec3(1.0,.64,.16)*vBrightness;
 vec3 light=mix(vColor,gold,goldMask);
 float alpha=mix(core,bloom,halo)*max(amount,vLocal)*(.55+vGrain*.45);
 if(alpha<.002)discard;gl_FragColor=vec4(light*(.78+vGrain*.22),alpha);}`};
 const pointMaterial=halo=>new THREE.ShaderMaterial({...particleShader,uniforms:{amount:{value:.72},particleScale:{value:1},halo:{value:halo},pixelRatio:{value:Math.min(devicePixelRatio||1,1.5)}},transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,toneMapped:false});
 const dustMat=pointMaterial(0),haloMat=pointMaterial(1),dust=new THREE.Points(geo,dustMat),goldHalo=new THREE.Points(geo,haloMat);dust.frustumCulled=goldHalo.frustumCulled=false;rig.add(dust,goldHalo);
 // Keep the original glow → comet flight → question-mark path separate from the field camera.
 const trailGeo=new THREE.BufferGeometry(),trailPos=new Float32Array(72*3),trailColors=new Float32Array(72*3);trailGeo.setAttribute('position',new THREE.BufferAttribute(trailPos,3));trailGeo.setAttribute('color',new THREE.BufferAttribute(trailColors,3));const trailMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const trail=new THREE.Line(trailGeo,trailMat);trail.frustumCulled=false;scene.add(trail);
 const chapter=document.querySelector('.chapter'),callout=document.querySelector('.chapter-callout'),calloutSvg=callout.querySelector('svg'),calloutPath=callout.querySelector('path'),calloutLink=document.querySelector('.chapter-link'),category=document.querySelector('.chapter-category'),objectLink=document.querySelector('.artifact-link');
 let width=1,height=1,halfW=1,halfH=1,px=-10000,py=-10000,pointerInside=false,spin=0,last=0,nearestIndex=-1;
 const pointerScreen=new THREE.Vector2(-10000,-10000),view=new THREE.Vector3();
 const offsets=new Float32Array(count*3);for(let i=0;i<count;i++){const a=i*2.399963,b=Math.sin(i*13.27);offsets[i*3]=Math.cos(a)*(.25+.6*Math.abs(b));offsets[i*3+1]=Math.sin(a)*(.25+.65*Math.abs(b));offsets[i*3+2]=Math.cos(i*3.14)*.55;}
 const bounds={left:0,right:0,top:0,bottom:0};
 function resize(){width=hero.clientWidth;height=hero.clientHeight;halfH=height/150;halfW=width/150;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(width,height,false);dustMat.uniforms.pixelRatio.value=haloMat.uniforms.pixelRatio.value=Math.min(devicePixelRatio||1,1.5);calloutSvg.setAttribute('viewBox',`0 0 ${width} ${height}`);}
 resize();addEventListener('resize',resize);
 hero.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const r=hero.getBoundingClientRect(),allowed=!e.target.closest('.chapter-link,.motion,.story-controls,.bottom-insight');
  // Retain the swept path, including coalesced samples, so a fast pass cannot skip the shape between frames.
  const samples=e.getCoalescedEvents?.()||[];
  for(const sample of samples.length?samples:[e]){
   const x=sample.clientX-r.left,y=sample.clientY-r.top,time=sample.timeStamp;
   if(allowed&&pointerSample){
    const elapsed=(time-pointerSample.time)/1000,dx=x-pointerSample.x,dy=y-pointerSample.y;
    if(elapsed>0&&elapsed<.16&&dx*dx+dy*dy>.01){
     pointerMoves.push({x0:pointerSample.x,y0:pointerSample.y,x1:x,y1:y,speed:Math.min(4000,Math.hypot(dx,dy)/elapsed)});
     if(pointerMoves.length>48)pointerMoves.shift();
    }
   }
   pointerSample=allowed?{x,y,time}:null;px=x;py=y;
  }
  pointerScreen.set(px,py);pointerInside=allowed;
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{pointerInside=false;pointerSample=null;});
 // Use the intact rotating surface for hit testing, so dispersing particles cannot flicker the hover state.
 function mechanical(p,k,kind,part,angle,out){out.set(p[k],p[k+1],p[k+2]);if(kind===2){const c=gearCenters[part===0?0:1],a=part===0?angle:-angle*16/10;const x=out.x-c.x,y=out.y-c.y;out.x=c.x+x*Math.cos(a)-y*Math.sin(a);out.y=c.y+x*Math.sin(a)+y*Math.cos(a);}return out;}
 const fromPoint=new THREE.Vector3(),toPoint=new THREE.Vector3(),flowA=new THREE.Vector3(),flowB=new THREE.Vector3();
 function flowPoint(kind,i,angle,out){
  const a=flowIndex[kind][i],b=flowNext[kind][a],t=ease(flowPhase[i]);
  mechanical(positions[kind],a*3,kind,partIds[kind][a],angle,flowA);mechanical(positions[kind],b*3,kind,partIds[kind][b],angle,flowB);out.copy(flowA).lerp(flowB,t);
  // Neighbour-to-neighbour transport plus bounded coherent eddies: always flowing, never welded.
  {
   const x=out.x,y=out.y,z=out.z,time=spin*.85,wisp=i%13===0?1+1.2*Math.pow(Math.sin(spin*.55+i*.17),4):1;
   out.x+=(.062*Math.sin(y*3.2+time)+.028*Math.cos(z*4-time*1.3))*wisp;
   out.y+=(.052*Math.sin(z*3.6+time*.7)+.025*Math.cos(x*3-time)) *wisp;
   out.z+=(.067*Math.sin(x*3-time*.6)+.027*Math.cos(y*4+time))*wisp;
   out.x+=Math.sin(i*1.71+spin*1.5)*.014;out.y+=Math.cos(i*2.12+spin*1.1)*.014;
  }
  return out;
 }
 function anchorLayout(kind,gearAngle,sourceKind=kind,morph=0){const data=positions[kind],ids=partIds[kind];bounds.left=Infinity;bounds.right=-Infinity;bounds.top=Infinity;bounds.bottom=-Infinity;let distance=Infinity,nearestDepth=Infinity,closeFound=false,rightAnchor=null;nearestIndex=-1;
  for(let i=0;i<count;i+=7){const k=i*3;flowPoint(sourceKind,i,gearAngle,view);if(morph>0){flowPoint(sourceKind+1,i,gearAngle,toPoint);view.lerp(toPoint,morph);}view.applyMatrix4(rig.matrixWorld).project(camera);const x=(view.x+1)*width/2,y=(1-view.y)*height/2;bounds.left=Math.min(bounds.left,x);bounds.right=Math.max(bounds.right,x);bounds.top=Math.min(bounds.top,y);bounds.bottom=Math.max(bounds.bottom,y);
   const d=(x-px)**2+(y-py)**2;if(d<25){if(!closeFound||view.z<nearestDepth){distance=d;nearestDepth=view.z;nearestIndex=i;}closeFound=true;}else if(!closeFound&&d<distance){distance=d;nearestIndex=i;}
   if(y<height*.49&&y>height*.23&&(!rightAnchor||x>rightAnchor.x))rightAnchor={x,y};
  }
  if(kind>0){const anchor=rightAnchor||{x:bounds.right,y:(bounds.top+bounds.bottom)/2},textWidth=calloutLink.offsetWidth||190;
   // Text is anchored to the viewport, independent of the object's rotation.
   const displayHeight=2.5*rig.scale.x*75;
   const tx=width<700?Math.max(18,width-textWidth-24):Math.min(width-textWidth-32,width*.5+displayHeight*.40+28);
   const ty=width<700?Math.max(58,height*.5-displayHeight*.5-62):Math.max(72,height*.29);
   calloutLink.style.left=`${tx}px`;calloutLink.style.top=`${ty}px`;
   calloutPath.setAttribute('d',`M ${anchor.x.toFixed(2)} ${anchor.y.toFixed(2)} L ${tx-12} ${ty+23} H ${tx+textWidth}`);
   category.style.left=`${width*.5}px`;category.style.top=`${height*.5+displayHeight*.5+18}px`;
   objectLink.style.left=`${bounds.left-12}px`;objectLink.style.top=`${bounds.top-12}px`;objectLink.style.width=`${bounds.right-bounds.left+24}px`;objectLink.style.height=`${bounds.bottom-bounds.top+24}px`;
  }
  return pointerInside&&distance<(kind===0?9:12)**2;
 }
 function render(now){if(disposed)return;const dt=Math.min((now-last)/1000||.016,.1);last=now;const q=clamp((state.q||0)/3)*3,g=state.gentle||hero.classList.contains('paused'),first=q<1;
  if(!g){spin+=dt;for(let i=0;i<count;i++){flowPhase[i]+=dt*(.22+(i%17)*.007);if(flowPhase[i]>=1){flowPhase[i]-=1;for(let k=0;k<4;k++)flowIndex[k][i]=flowNext[k][flowIndex[k][i]];}}}
  const n=Math.min(2,Math.floor(q)),raw=q-n,settledKind=Math.min(3,Math.round(q)),stable=Math.abs(q-settledKind)<.006;
  const travel=ease((q-.18)/.6),startX=-halfW*.79,startY=halfH*.73;
  // 0–40%: rise + disintegrate. 40–100%: descend + assemble the next surface.
  const lift=first||g?0:height*.4/75*(raw<.4?ease(raw/.4):1-ease((raw-.4)/.6));
  rig.position.set(first?startX*(1-travel):0,first?startY*(1-travel):lift,0);
  const fit=Math.min(height*.5/(2.5*75),width*.78/(2.9*75)),scale=first?.27+(fit-.27)*ease((q-.3)/.7):fit;rig.scale.setScalar(scale);
  // One complete turn in ten seconds for every object, including the gear assembly.
  rig.rotation.set(0,spin*Math.PI*2/10,0);
  const gearAngle=spin*.21;
  const morph=first?ease((q-.53)/.47):ease((raw-.40)/.56);
  tubeRoot.position.copy(rig.position);tubeRoot.scale.copy(rig.scale);tubeRoot.rotation.set(0,0,0);tubeMaterial.uniforms.clock.value=spin;
  // The opening star's cage is always hidden. Chapter cages can flash only once their object is settled.
  tubeMaterial.uniforms.strength.value=stable&&settledKind>0?1:0;
  for(const spot of impactSpots){if(!stable||settledKind===0)spot.w=0;else if(!g)spot.w*=Math.exp(-3.8*dt);}
  suspensionTube.visible=tubeMaterial.uniforms.strength.value>0;
  dustMat.uniforms.particleScale.value=haloMat.uniforms.particleScale.value=1.35*1.25*Math.min(1,.55+scale*.22);
  rig.updateMatrixWorld(true);
  const hit=anchorLayout(settledKind,gearAngle,n,morph);
  // Only a chapter morph changes the cage dimensions; idle rotation and flow never change its shape or center.
  tubeHalfWidth=tubeWidths[n]+(tubeWidths[n+1]-tubeWidths[n])*morph;
  tubeCenterX=0;
  suspensionTube.scale.x=tubeHalfWidth/1.86;suspensionTube.position.x=tubeCenterX;
  const rotationCos=Math.cos(rig.rotation.y),rotationSin=Math.sin(rig.rotation.y);
  const wallX=Math.max(.06,tubeHalfWidth-.018),wallZ=1.80;
  if(interactionKind!==settledKind||!stable){
   displacement.fill(0);launchVelocity.fill(0);releaseAt.fill(0);disturbed.fill(0);contactUntil.fill(0);interactionKind=settledKind;
  }
  inverseRotation.copy(rig.quaternion).invert();
  const brushRadius=settledKind===0?10:Math.max(15,Math.min(28,scale*75*.20));
  const sweeps=[];
  if(!g&&stable)for(const move of pointerMoves){
   const dx=move.x1-move.x0,dy=move.y1-move.y0,length=Math.hypot(dx,dy);
   const energy=clamp(move.speed/1400);
   brushDirection.set(dx/length,-dy/length,.12).applyQuaternion(inverseRotation).normalize();
   sweeps.push({...move,dx,dy,length2:length*length,energy,
    // Distance weighting keeps input consistent across event frequencies; speed gives fast flicks more energy.
    impulse:Math.min(1.4,length/(scale*75))*(1.0+energy*12),direction:brushDirection.clone()});
  }
  pointerMoves.length=0;
  const interactive=!g&&stable;
  const breakup=first?Math.sin(Math.PI*morph):ease(raw/.28)*(1-ease((raw-.72)/.28));
  const transitionScatter=breakup*(first?.14:.72);
  const shine=first?Math.sin(clamp(q/.6)*Math.PI)*2.3:0;
  dustMat.uniforms.amount.value=.72+Math.min(.28,shine*.12);
  haloMat.uniforms.amount.value=.18+Math.min(.3,shine*.12);
  const a=positions[n],b=positions[n+1],ca=colors[n],cb=colors[n+1];
  for(let i=0;i<count;i++){const k=i*3;flowPoint(n,i,gearAngle,fromPoint);flowPoint(n+1,i,gearAngle,toPoint);
   const bx=fromPoint.x+(toPoint.x-fromPoint.x)*morph,by=fromPoint.y+(toPoint.y-fromPoint.y)*morph,bz=fromPoint.z+(toPoint.z-fromPoint.z)*morph;
   let local=0;
   if(interactive){
    projectedPoint.set(bx,by,bz).applyMatrix4(rig.matrixWorld).project(camera);
    const sx=(projectedPoint.x+1)*width/2,sy=(1-projectedPoint.y)*height/2;
    for(const sweep of sweeps){
     const along=clamp(((sx-sweep.x0)*sweep.dx+(sy-sweep.y0)*sweep.dy)/sweep.length2);
     const distance=Math.hypot(sx-sweep.x0-along*sweep.dx,sy-sweep.y0-along*sweep.dy);
     const influence=1-ease(distance/brushRadius);
     if(influence<=0)continue;
     const impulse=sweep.impulse*influence;
     launchVelocity[k]+=impulse*(sweep.direction.x+offsets[k]*.32);
     launchVelocity[k+1]+=impulse*(sweep.direction.y+offsets[k+1]*.32);
     launchVelocity[k+2]+=impulse*(sweep.direction.z+offsets[k+2]*.65);
     releaseAt[i]=spin+.12;disturbed[i]=1;
    }
    // Resting the cursor gives a small local eddy, not the high-energy throw of a fast sweep.
    if(pointerInside&&hit){
     const influence=1-ease(Math.hypot(sx-px,sy-py)/brushRadius);
     if(influence>0){
      disturbed[i]=1;
      const follow=1-Math.exp(-3*dt),amplitude=.20*influence;
      if(Math.hypot(displacement[k],displacement[k+1],displacement[k+2])<.28){
       displacement[k]+=(offsets[k]*amplitude-displacement[k])*follow;
       displacement[k+1]+=(offsets[k+1]*amplitude-displacement[k+1])*follow;
       displacement[k+2]+=(offsets[k+2]*amplitude-displacement[k+2])*follow;
      }
     }
    }
    const velocity=Math.hypot(launchVelocity[k],launchVelocity[k+1],launchVelocity[k+2]);
    if(velocity>18){const limit=18/velocity;for(let j=0;j<3;j++)launchVelocity[k+j]*=limit;}
    // Integrate the outward flick with exponential drag, independent of display refresh rate.
    const drag=Math.exp(-7*dt),travel=(1-drag)/7;
    for(let j=0;j<3;j++){displacement[k+j]+=launchVelocity[k+j]*travel;launchVelocity[k+j]*=drag;}
    const distance=Math.hypot(displacement[k],displacement[k+1],displacement[k+2]);
    // A divergence-free curl turns the return into traveling waves, without adding displacement energy.
    // Rodrigues rotation preserves distance; the exponential envelope still brings far grains home fastest.
    const returningTime=Math.max(0,Math.min(dt,spin-releaseAt[i]));
    const returnFactor=Math.exp(-(1.0+1.8*distance)*returningTime);
    if(distance>.00001&&returningTime>0){
     const phase=spin*2.3+bx*2.1+by*1.7+bz*.9+(i%19)*.075;
     let ax=Math.sin(phase*.61),ay=.65*Math.cos(phase*.47),az=1;
     const axisLength=Math.hypot(ax,ay,az);ax/=axisLength;ay/=axisLength;az/=axisLength;
     const angle=(.65+2.0*Math.sin(phase))*returningTime;
     const c=Math.cos(angle),sn=Math.sin(angle),u=1-c;
     const dx=displacement[k],dy=displacement[k+1],dz=displacement[k+2],dot=ax*dx+ay*dy+az*dz;
     displacement[k]=(dx*c+(ay*dz-az*dy)*sn+ax*dot*u)*returnFactor;
     displacement[k+1]=(dy*c+(az*dx-ax*dz)*sn+ay*dot*u)*returnFactor;
     displacement[k+2]=(dz*c+(ax*dy-ay*dx)*sn+az*dot*u)*returnFactor;
    }else for(let j=0;j<3;j++)displacement[k+j]*=returnFactor;
   }
   local=Math.min(1,Math.hypot(displacement[k],displacement[k+1],displacement[k+2])*2);
   localAmount[i]=local;
   const ripple=g?0:Math.sin(i*.71+spin*3)*transitionScatter*.035;
   moving[k]=bx+displacement[k]+offsets[k]*transitionScatter+ripple;
   moving[k+1]=by+displacement[k+1]+offsets[k+1]*transitionScatter;
   moving[k+2]=bz+displacement[k+2]+offsets[k+2]*transitionScatter;
   // The narrower tube stays fixed in screen orientation while the object turns inside it.
   // Bound particles in that same elliptical cross-section, then transform them back to object space.
   const wx=rotationCos*moving[k]+rotationSin*moving[k+2]-tubeCenterX;
   const wz=-rotationSin*moving[k]+rotationCos*moving[k+2];
   const radial=Math.hypot(wx/wallX,wz/wallZ);
   if(radial>1){
    const cx=wx/radial,cz=wz/radial;
    if(!g&&stable&&settledKind>0&&disturbed[i]&&spin>=contactUntil[i]&&Math.hypot(displacement[k],displacement[k+1],displacement[k+2])>.10){
     const energy=Math.hypot(launchVelocity[k],launchVelocity[k+1],launchVelocity[k+2]);
     // Contact coordinates use the cage geometry's own fixed frame, so the flash stays on the struck hexes.
     touchTube(cx/wallX*1.86,Math.max(-1.66,Math.min(1.66,moving[k+1])),cz/wallZ*1.86,energy);
     contactUntil[i]=spin+.28;
    }
    moving[k]=rotationCos*(cx+tubeCenterX)-rotationSin*cz;
    moving[k+2]=rotationSin*(cx+tubeCenterX)+rotationCos*cz;
    if(stable){
     displacement[k]=moving[k]-bx;displacement[k+2]=moving[k+2]-bz;
     let nx=cx/(wallX*wallX),nz=cz/(wallZ*wallZ);const norm=Math.hypot(nx,nz);nx/=norm;nz/=norm;
     const vx=rotationCos*launchVelocity[k]+rotationSin*launchVelocity[k+2];
     const vz=-rotationSin*launchVelocity[k]+rotationCos*launchVelocity[k+2],outward=vx*nx+vz*nz;
     if(outward>0){launchVelocity[k]-=outward*(rotationCos*nx-rotationSin*nz);launchVelocity[k+2]-=outward*(rotationSin*nx+rotationCos*nz);}
    }
   }
   if(Math.abs(moving[k+1])>1.66){
    moving[k+1]=Math.sign(moving[k+1])*1.66;
    if(stable){displacement[k+1]=moving[k+1]-by;if(launchVelocity[k+1]*moving[k+1]>0)launchVelocity[k+1]=0;}
   }
   const disturbedDistance=Math.hypot(moving[k]-bx,moving[k+1]-by,moving[k+2]-bz);
   // Gold belongs to the grain's interior, revealed by disturbance only. Far gold is at most 32% brighter.
   if(disturbedDistance<.012&&Math.hypot(launchVelocity[k],launchVelocity[k+1],launchVelocity[k+2])<.02)disturbed[i]=0;
   goldReveal[i]=(disturbed[i]||transitionScatter>.0001)?ease((disturbedDistance-.012)/.07):0;
   goldBrightness[i]=1+.32*ease((disturbedDistance-.082)/.75);
   tints[k]=tints[k+1]=tints[k+2]=1;
  }
  geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.attributes.localAmount.needsUpdate=true;geo.attributes.goldReveal.needsUpdate=true;geo.attributes.goldBrightness.needsUpdate=true;
  trail.visible=first&&q>.18&&q<.9&&!g;trailMat.opacity=Math.sin(clamp((q-.18)/.72)*Math.PI)*.85;
  if(trail.visible){for(let i=0;i<72;i++){const f=i/71,lag=clamp(travel-f*.43);trailPos[i*3]=startX*(1-lag);trailPos[i*3+1]=startY*(1-lag);trailPos[i*3+2]=-.2;trailColors.fill((1-f)**2,i*3,i*3+3);}trailGeo.attributes.position.needsUpdate=true;trailGeo.attributes.color.needsUpdate=true;}
  canvas.style.filter=`drop-shadow(0 0 ${.6+shine*4}px #ffffff55) drop-shadow(0 0 ${2+shine*10}px #ffffff18)`;
  renderer.render(scene,camera);if(!document.hidden)frame=requestAnimationFrame(render);
 }
 hero.classList.add('artifact-ready');frame=requestAnimationFrame(render);
 document.addEventListener('visibilitychange',()=>{pointerSample=null;pointerMoves.length=0;cancelAnimationFrame(frame);if(!document.hidden){last=performance.now();frame=requestAnimationFrame(render);}});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);hero.classList.remove('artifact-ready');});canvas.addEventListener('webglcontextrestored',()=>{hero.classList.add('artifact-ready');frame=requestAnimationFrame(render);});
 addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)mats.add(o.material);});geometries.forEach(o=>o.dispose());mats.forEach(o=>o.dispose());renderer.dispose();});
}catch(error){console.warn('Artifact model unavailable; using accessible symbol fallback.',error);renderer?.dispose();canvas.hidden=true;}
