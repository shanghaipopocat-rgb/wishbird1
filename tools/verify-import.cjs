const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');
const path=require('path');
const designId=process.argv.find(a=>/^design-0[123]$/.test(a)) || 'design-01';
process.chdir(path.resolve(__dirname,'..'));
class Element {
  setAttribute(){}
  constructor(){this.style={setProperty(){}};this.dataset={};this.children=[];this.classList={toggle(){}};}
  append(n){this.children.push(n);n.parentNode=this;}
  replaceChildren(){this.children=[];}
}
const context={window:{},document:{createElement:()=>new Element(),documentElement:new Element()},console};
vm.createContext(context);
for(const file of ['config',designId,'cup-model','box-model']) vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),context);
const ns=context.window.PackageDemo;
const elements={boxRoot:new Element(),viewport:new Element(),progressLabel:new Element()};
const model=new ns.BoxModel(ns.config,elements);
assert.equal(model.panels.size,13);
assert.equal(model.hinges.length,12);
for(const part of ns.design.parts) {
  assert(fs.existsSync(part.artwork));
  assert(fs.existsSync(part.interior));
  const inside=fs.readFileSync(part.interior,'utf8');
  assert(!/<(?:image|text)\b/.test(inside),`${part.id}: plain interior only`);
  assert(inside.includes(`fill="${ns.design.interiorColor}"`));
  assert.equal(model.panels.get(part.id).panel.children[1].src,part.interior);
  const svg=fs.readFileSync(part.artwork,'utf8');
  assert(svg.includes('mask="url(#paper-window)"'));
  assert(!svg.includes('translate(440.72 341.35)')); // mockup cup removed
  const guideClass={'design-01':'cls-35','design-02':'cls-8','design-03':'cls-17'}[designId];
  assert(!svg.includes(`class="${guideClass}"`)); // production cut guides removed
  if(designId==='design-02') assert(!svg.includes('translate(-119.58 74.13)'));
  if(part.parent) assert.equal(model.panels.get(part.id).panel.parentNode.parentNode,model.panels.get(part.parent).panel);
}
for(const progress of [0,0.25,0.5,0.75,1,0]) {
  model.setProgress(progress);
  for(const hinge of model.hinges) {
    assert(!hinge.element.style.transform.includes('NaN'));
    if(progress===0) assert(hinge.element.style.transform.includes('(0deg)'));
    if(progress===1) assert(hinge.element.style.transform.includes(`(${hinge.definition.closed}deg)`));
  }
  for(const tuck of model.tuckHinges) {
    const y=parseFloat(tuck.element.style.top);
    if(progress===0) assert.equal(y,tuck.edge==='top'?0:tuck.parentHeight);
    if(progress===1) {
      // At +/-90 degrees the lid's local y becomes world z.
      const worldZ=tuck.edge==='top'?-model.size.depth+y:-y;
      assert(worldZ>-model.size.depth && worldZ<0,'tongue lies inside back wall');
    }
  }
}
console.log('PASS: 13 assets, 12 parent hinges, transparent masks, no mockup cup/cut guides, fold endpoints and reverse progress.');
async function preview(){
  const sharp=require('sharp');
  // The cross-corner opening must be alpha-zero, not painted white.
  for (const [id,x] of [['b',210],['c',50]]) {
    const part=ns.design.parts.find(p=>p.id===id);
    const {data,info}=await sharp(part.artwork).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(data[(100*info.width+x)*info.channels+3],0,`${id}: window alpha`);
    assert(data[(20*info.width+20)*info.channels+3]>240,`${id}: opaque paper`);
    const inside=await sharp(part.interior).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const ix=inside.info.width-1-x;
    assert.equal(inside.data[(100*inside.info.width+ix)*inside.info.channels+3],0,`${id}: mirrored interior opening`);
  }
  console.log('PASS: both window halves have alpha 0; surrounding paper is opaque.');
  if(process.argv.includes('--no-preview')) return;
  const composites=[];
  for(let i=0;i<ns.design.parts.length;i++){
    const part=ns.design.parts[i];
    const tile=await sharp(part.artwork,{limitInputPixels:false}).resize(210,280,{fit:'contain',background:'#e5e5e5'}).png().toBuffer();
    composites.push({input:tile,left:(i%5)*230+10,top:Math.floor(i/5)*310+10});
    const label=Buffer.from(`<svg width="210" height="20"><text x="8" y="15" font-size="14">${part.id}</text></svg>`);
    composites.push({input:label,left:(i%5)*230+10,top:Math.floor(i/5)*310+290});
  }
  await sharp({create:{width:1150,height:930,channels:4,background:'#ffffff'}}).composite(composites).png().toFile(`images/${designId}/contact-sheet.png`);
}
preview().catch(e=>{console.error(e);process.exitCode=1;});
