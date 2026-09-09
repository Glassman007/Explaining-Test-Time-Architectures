'use strict';
// Small, dependency-free renderer for the POSITION/index GLB meshes supplied here.
// Materials are intentionally replaced. Background texture uses planar projection
// because neural-pathways.glb contains no TEXCOORD_0 attribute.
(() => {
 const stage=document.querySelector('.hero');
 let pointer=[0,0],smoothed=[0,0],hover=0,inside=false,frame=0,last=0;
 let state=window.ttaState||{p:0,gentle:false};
 const renderers=[];
 const vertex=`attribute vec3 position,normal; varying vec3 n,v; varying vec2 tex; varying float hot;
 uniform vec2 pointer; uniform float aspect,water,hover,clock;
 void main(){vec3 p=position;
 vec2 screen=water>.5?vec2(p.x/aspect,p.y)*.84:vec2(p.x,p.y*aspect)*1.08;
 float d=length((screen-pointer)*vec2(aspect,1.));hot=exp(-d*d*4.)*hover;
 if(water<.5){p.z+=sin(d*12.-clock*2.)*hot*.07;screen+=(screen-pointer)*hot*.04;screen+=pointer*.012;}
 gl_Position=vec4(screen,p.z*.15,1.);n=normal;v=p;tex=position.xy*.5+.5;}`;
 const fragment=`precision mediump float; varying vec3 n,v; varying vec2 tex; varying float hot;
 uniform sampler2D image;uniform float water;
 void main(){vec3 normal=normalize(n);float light=.35+.65*abs(dot(normal,normalize(vec3(-.6,.8,1.))));
 if(water>.5){float rim=pow(1.-abs(normal.z),2.);float shine=pow(max(dot(reflect(-normalize(vec3(-.5,.9,1.)),normal),vec3(0.,0.,1.)),0.),25.);
 vec3 color=mix(vec3(.025,.12,.19),vec3(.49,.79,.94),rim)*light+shine*vec3(1.,.98,.91);color+=vec3(.12,.23,.27)*pow(max(normal.y,0.),3.);gl_FragColor=vec4(color,1.);
 }else{vec3 t=texture2D(image,vec2(1.-tex.y,tex.x)).rgb;
 vec3 color=(t*.85+vec3(.035,.12,.22))*light; color+=hot*(t*.8+vec3(.12,.35,.48));gl_FragColor=vec4(color,.83);}}`;
 async function geometry(url){
  const response=await fetch(url);if(!response.ok)throw Error('Model request failed: '+url);
  const data=await response.arrayBuffer(),view=new DataView(data);
  if(view.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB');
  let json,bin;for(let offset=12;offset<data.byteLength;){const len=view.getUint32(offset,true),type=view.getUint32(offset+4,true);offset+=8;
   if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(data,offset,len)));
   if(type===0x004e4942)bin=offset;offset+=len;
  }
  // First primitive is the main liquid form; satellite drops remain in source.
  const primitive=json.meshes[0].primitives[0];
  function accessor(index){const a=json.accessors[index],b=json.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
   const bytes={5121:1,5123:2,5125:4,5126:4}[a.componentType];const start=bin+(b.byteOffset||0)+(a.byteOffset||0),stride=b.byteStride||size*bytes;
   const get={5121:'getUint8',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
   const out=new Float32Array(a.count*size);for(let i=0;i<a.count;i++)for(let k=0;k<size;k++)out[i*size+k]=view[get](start+i*stride+k*bytes,true);return out;
  }
  const pos=accessor(primitive.attributes.POSITION),indices=primitive.indices===undefined?Float32Array.from({length:pos.length/3},(_,i)=>i):accessor(primitive.indices);
  const bounds=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity];
  for(let i=0;i<pos.length;i++) {const c=i%3;bounds[c]=Math.min(bounds[c],pos[i]);bounds[c+3]=Math.max(bounds[c+3],pos[i]);}
  const scale=2/Math.max(bounds[3]-bounds[0],bounds[4]-bounds[1],bounds[5]-bounds[2]);
  const packed=new Float32Array(indices.length*6);
  for(let i=0;i<indices.length;i+=3){const points=[0,1,2].map(k=>[0,1,2].map(c=>(pos[indices[i+k]*3+c]-(bounds[c]+bounds[c+3])/2)*scale));
   const a=points[1].map((x,c)=>x-points[0][c]),b=points[2].map((x,c)=>x-points[0][c]);
   const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=Math.hypot(...n)||1;
   for(let k=0;k<3;k++)packed.set([...points[k],...n.map(x=>x/length)],(i+k)*6);
  }return packed;
 }
 async function create(canvas,url,water){
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const packed=await geometry(url),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,packed,gl.STATIC_DRAW);
  for(const [name,offset] of [['position',0],['normal',12]]){const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,offset);}
  const uniforms=Object.fromEntries(['pointer','aspect','water','hover','clock','image'].map(n=>[n,gl.getUniformLocation(program,n)]));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(!water){const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src='assets/neural-pathways.jpg';});gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const renderer={draw(now){if(gl.isContextLost())return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
   const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
   gl.useProgram(program);gl.uniform2f(uniforms.pointer,...smoothed);gl.uniform1f(uniforms.aspect,w/h);gl.uniform1f(uniforms.water,water?1:0);gl.uniform1f(uniforms.hover,state.gentle?0:hover);gl.uniform1f(uniforms.clock,now*.001);gl.uniform1i(uniforms.image,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,packed.length/6);
  }};
  renderers.push(renderer);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('models-ready');});
  stage.classList.add('models-ready');wake();
 }
 function tick(now){frame=0;if(document.hidden)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;
  const blend=1-Math.exp(-9*dt);smoothed=smoothed.map((v,i)=>v+(pointer[i]-v)*blend);hover+=((inside&&!state.gentle?1:0)-hover)*blend;
  renderers.forEach(r=>r.draw(now));if((inside||hover>.002)&&!state.gentle&&state.p<.6)frame=requestAnimationFrame(tick);
 }
 function wake(){if(!frame&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
 stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=stage.getBoundingClientRect();pointer=[(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2];inside=true;wake();});
 stage.addEventListener('pointerleave',()=>{inside=false;wake();});
 addEventListener('tta-progress',e=>{state=e.detail;wake();});addEventListener('resize',wake);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
 create(document.querySelector('.model-background'),'assets/neural-pathways.glb',false).catch(e=>console.warn('Neural model fallback:',e));
})();
