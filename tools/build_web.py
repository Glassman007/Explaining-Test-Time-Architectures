"""Generate the deterministic, unlit white constellation GLB (Python stdlib only)."""
import json, math, struct, random
from pathlib import Path
root=Path(__file__).resolve().parents[1]
binary=bytearray(); views=[]; accessors=[]; meshes=[]; nodes=[]
def mesh(name, vertices, indices):
    start=len(binary); binary.extend(struct.pack('<%sf'%len(vertices),*vertices))
    views.append(dict(buffer=0,byteOffset=start,byteLength=len(binary)-start,target=34962))
    pts=list(zip(*[vertices[i:i+3] for i in range(0,len(vertices),3)]))
    accessors.append(dict(bufferView=len(views)-1,componentType=5126,count=len(vertices)//3,type='VEC3',min=[min(p) for p in pts],max=[max(p) for p in pts])); pos=len(accessors)-1
    start=len(binary);binary.extend(struct.pack('<%sI'%len(indices),*indices))
    views.append(dict(buffer=0,byteOffset=start,byteLength=len(binary)-start,target=34963))
    accessors.append(dict(bufferView=len(views)-1,componentType=5125,count=len(indices),type='SCALAR'))
    meshes.append(dict(name=name,primitives=[dict(attributes={'POSITION':pos},indices=len(accessors)-1,material=0)]));return len(meshes)-1
def ring(radius,tube):
    v=[];idx=[]
    for a in range(48):
      u=a*math.tau/48
      for b in range(6):
        t=b*math.tau/6;r=radius+tube*math.cos(t);v.extend([r*math.cos(u),r*math.sin(u),tube*math.sin(t)])
    for a in range(48):
      for b in range(6):
        p=a*6+b;q=((a+1)%48)*6+b;r=((a+1)%48)*6+(b+1)%6;s=a*6+(b+1)%6;idx.extend([p,q,r,p,r,s])
    return v,idx
outer=mesh('White node halo',*ring(.25,.009));inner=mesh('White inner halo',*ring(.145,.005))
# Octahedral star core: one solid white point in each node.
star=mesh('Single star point',[.026,0,0,-.026,0,0,0,.026,0,0,-.026,0,0,0,.026,0,0,-.026],[0,2,4,2,1,4,1,3,4,3,0,4,2,0,5,1,2,5,3,1,5,0,3,5])
rng=random.Random(2026)
points=[(-8,-3.9,0)];radii=[.11];edges=[]
# A rooted arbor: trunk and divergent boughs occupy the full viewport.
def branch(parent, end, count, spread=.22):
    start=points[parent];previous=parent;ids=[]
    for j in range(1,count+1):
        t=j/count
        point=tuple(start[k]+(end[k]-start[k])*t+(rng.uniform(-spread,spread)*math.sin(math.pi*t) if k<2 else rng.uniform(-.3,.3)) for k in range(3))
        points.append(point);radii.append(rng.uniform(.035,.085));current=len(points)-1;edges.append((previous,current))
        if len(ids)>1:edges.append((ids[-2],current))
        ids.append(current);previous=current
    return ids
trunk=branch(0,(5.8,1.8,0),55,.28)
for anchor,end in [(5,(-7.4,3.9,.1)),(10,(-4.4,4.0,.2)),(16,(-1,4.1,-.2)),(23,(2.1,4.0,.1)),(31,(5.4,4.0,-.1)),(39,(8,3.8,.1)),(15,(-2.5,-3.9,.1)),(24,(1,-3.8,-.1)),(33,(4.5,-3.8,.2)),(43,(7.8,-3.2,.1))]:
    bough=branch(trunk[anchor],end,19,.3)
    for j in [6,12,16]:
        at=points[bough[j]]
        sign=-1 if j%2 else 1
        twigend=(max(-8,min(8,at[0]+sign*1.3)),max(-4,min(4.1,at[1]+.6*sign)),at[2])
        branch(bough[j],twigend,5,.16)
# Local cross-connections add web-like complexity without erasing the branching shape.
existing={tuple(sorted(e)) for e in edges}
for i,pt in enumerate(points):
    near=sorted((j for j in range(len(points)) if j!=i),key=lambda j:sum((pt[k]-points[j][k])**2 for k in range(3)))[:2]
    for j in near:
        pair=tuple(sorted((i,j)))
        if pair not in existing:edges.append(pair);existing.add(pair)
for i,p in enumerate(points):
    children=[]
    for m in [outer,inner,outer,star]:
        children.append(len(nodes));child=dict(mesh=m)
        if len(children)==3:child['rotation']=[.70710678,0,0,.70710678]
        nodes.append(child)
    nodes.append(dict(name=f'node_{i}',translation=list(p),scale=[radii[i]/.25]*3,children=children,extras={'kind':'node','index':i,'radius':radii[i]}))
parents=[i for i,n in enumerate(nodes) if 'children' in n]
for i,(a,b) in enumerate(edges):
    p,q=points[a],points[b];delta=[q[j]-p[j] for j in range(3)];length=math.sqrt(sum(x*x for x in delta));unit=[x/length for x in delta];start=list(p);end=list(q)
    # Thin 3D cylinder between the ring boundaries.
    side=[-unit[1],unit[0],0];sl=math.hypot(*side[:2]);side=[x/sl for x in side];up=[unit[1]*side[2]-unit[2]*side[1],unit[2]*side[0]-unit[0]*side[2],unit[0]*side[1]-unit[1]*side[0]]
    center=[(p[j]+q[j])/2 for j in range(3)];v=[];inds=[]
    for pt in [start,end]:
      for k in range(6):v.extend([pt[j]-center[j]+.007*(side[j]*math.cos(k*math.tau/6)+up[j]*math.sin(k*math.tau/6)) for j in range(3)])
    for k in range(6):a0=k;b0=(k+1)%6;inds.extend([a0,b0,b0+6,a0,b0+6,a0+6])
    m=mesh(f'Connection {i}',v,inds);parents.append(len(nodes));nodes.append(dict(name=f'edge_{i}',mesh=m,translation=center,extras={'kind':'edge','index':i,'a':a,'b':b}))
gltf=dict(asset={'version':'2.0','generator':'Dataforge interconnected web'},extensionsUsed=['KHR_materials_unlit'],scene=0,scenes=[{'nodes':parents}],nodes=nodes,meshes=meshes,materials=[{'name':'Pure white','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':1},'extensions':{'KHR_materials_unlit':{}}}],buffers=[{'byteLength':len(binary)}],bufferViews=views,accessors=accessors)
j=json.dumps(gltf,separators=(',',':')).encode();j+=b' '*((-len(j))%4);binary+=b'\0'*((-len(binary))%4)
output=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary
(root/'assets/interconnected-web.glb').write_bytes(output)
print(f'GLB: {len(points)} nodes, {len(edges)} connections, {len(output)} bytes')
