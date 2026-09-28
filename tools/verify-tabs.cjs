const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Element {
  constructor(){this.style={setProperty(){}};this.dataset={};this.children=[];this.attributes={};this.events={};this.classList={toggle(){},add(){},remove(){}};}
  append(n){this.children.push(n);n.parentNode=this;}
  replaceChildren(){this.children=[];}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,f){this.events[k]=f;}
  focus(){}
}
const ids=new Map(),tabs=['01','02','03'].map(n=>{const el=new Element();el.dataset.design=`design-${n}`;return el;});
const ctx={console,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},window:{addEventListener(){}},document:{documentElement:new Element(),createElement:()=>new Element(),querySelectorAll:()=>tabs,getElementById:id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);}}};
vm.createContext(ctx);
for(const file of ['config','design-01','design-02','design-03','cup-model','box-model','interaction','app']) vm.runInContext(fs.readFileSync(`js/${file}.js`,'utf8'),ctx);
const demo=ctx.window.packageDemo,cup=demo.model.cup;
demo.interaction.rotateY=73;
for(const progress of [0,1]) {
  demo.model.setProgress(progress);
  for(const tab of [...tabs,...tabs].reverse()) {
    tab.events.click();
    assert.equal(demo.model.design.id,tab.dataset.design);
    assert.equal(demo.model.progress,progress);
    assert.equal(demo.interaction.rotateY,73);
    assert.equal(demo.model.cup,cup);
    assert.equal(ids.get('boxRoot').children.length,2);
    assert.equal(tabs.filter(t=>t.attributes['aria-selected']==='true').length,1);
    assert.equal(ids.get('designViewer').attributes['aria-labelledby'],`tab-${tab.dataset.design}`);
    for(const part of demo.model.design.parts)assert.equal(demo.model.panels.get(part.id).panel.children[0].src,part.artwork);
  }
}
demo.interaction.setAutoRotate(true);tabs[1].events.click();assert.equal(cup.element.style.display,'none');
tabs[1].events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(demo.model.design.id,'design-03');
demo.assemble(); // Busy tabs must not rebuild an animating hierarchy.
assert(tabs.every(t=>t.disabled));tabs[0].events.click();assert.equal(demo.model.design.id,'design-03');
console.log('PASS: three tabs, repeated switching, correct artwork, shared cup, flat/closed state, camera, rotation hiding, keyboard navigation and busy guard.');
