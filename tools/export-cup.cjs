const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
process.chdir(path.resolve(__dirname,'..'));
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['config','cup-model'])vm.runInContext(fs.readFileSync(`js/${name}.js`,'utf8'),ctx);
const ns=ctx.window.PackageDemo,c=ns.config.cup,rings=ns.cupGeometry.profile(c),n=c.segments;
const inner=rings.map(([y,r])=>[Math.min(y,c.height-c.wallThickness),r-c.wallThickness]);
assert.equal(rings[0][1]*2,6);assert.equal(rings.at(-1)[0],9);assert.equal(rings.at(-1)[1]*2,3);
assert(Math.max(...rings.map(r=>2*r[1]))<ns.config.dimensionsCm.width);
assert(c.height<ns.config.dimensionsCm.height);
const vertices=[],faces=[];
for(const wall of [rings,inner])for(const [y,r] of wall)for(let i=0;i<n;i++)vertices.push([r*Math.sin(i*2*Math.PI/n),c.height-y,r*Math.cos(i*2*Math.PI/n)]);
const index=(wall,row,i)=>wall*rings.length*n+row*n+(i%n);
for(let w=0;w<2;w++)for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
  const f=[index(w,j,i),index(w,j+1,i),index(w,j+1,i+1),index(w,j,i+1)];
  faces.push(w?f.reverse():f);
}
for(let i=0;i<n;i++)faces.push([index(0,0,i),index(0,0,i+1),index(1,0,i+1),index(1,0,i)]);
for(let w=0;w<2;w++) {
  const center=vertices.length;vertices.push([0,w?c.wallThickness:0,0]);
  for(let i=0;i<n;i++){
    const face=[center,index(w,rings.length-1,i),index(w,rings.length-1,i+1)];
    faces.push(w?face:face.reverse());
  }
}
// Every seam must be closed, including rim and both floor surfaces.
const edges=new Map();
for(const f of faces)for(let i=0;i<f.length;i++){
 const edge=[f[i],f[(i+1)%f.length]].sort((a,b)=>a-b).join('/');edges.set(edge,(edges.get(edge)||0)+1);
}
assert([...edges.values()].every(v=>v===2));
fs.mkdirSync('models',{recursive:true});
fs.writeFileSync('models/egg-cup.obj','# Units: centimetres. Lip diameter 6, height 9, base diameter 3.\nmtllib egg-cup.mtl\no EggCup\n'+vertices.map(v=>'v '+v.join(' ')).join('\n')+'\nusemtl BrushedGold\ns 1\n'+faces.map(f=>'f '+f.map(i=>i+1).join(' ')).join('\n')+'\n');
fs.writeFileSync('models/egg-cup.mtl','newmtl BrushedGold\nKa 0.25 0.17 0.06\nKd 0.72 0.49 0.16\nKs 0.95 0.8 0.45\nNs 110\nillum 2\n');
// Orthographic geometry preview; no alteration of the reference photo.
function project([x,y,z]){const a=.30;return [260+x*43,475-(y*Math.cos(a)-z*Math.sin(a))*43,y*Math.sin(a)+z*Math.cos(a)];}
const polygons=faces.map(f=>{
 const p=f.map(i=>project(vertices[i]));
 const mid=f.map(i=>vertices[i]).reduce((a,v)=>a.map((x,j)=>x+v[j]/f.length),[0,0,0]);
 const theta=Math.atan2(mid[0],mid[2]);
 const shine=Math.pow(Math.max(0,Math.cos(theta-.65)),22)+.8*Math.pow(Math.max(0,Math.cos(theta+1.5)),30);
 const light=28+shine*48;
 return {z:p.reduce((s,q)=>s+q[2]/p.length,0),svg:`<polygon points="${p.map(q=>q.slice(0,2).join(',')).join(' ')}" fill="hsl(43,58%,${Math.min(88,light)}%)"/>`};
}).sort((a,b)=>a.z-b.z);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="560"><rect width="520" height="560" fill="#f4f1ec"/><ellipse cx="260" cy="480" rx="112" ry="18" fill="#d6cec0"/>${polygons.map(p=>p.svg).join('')}<text x="260" y="530" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#574631">Ø 6 cm · H 9 cm · Base Ø 3 cm</text></svg>`;
fs.writeFileSync('models/egg-cup-preview.svg',svg);
require('sharp')(Buffer.from(svg)).png().toFile('models/egg-cup-preview.png').then(()=>console.log(`PASS: measured dimensions, box fit, closed mesh. Exported ${vertices.length} vertices / ${faces.length} faces.`));
