// Rebuild the reviewed, source-specific dieline. No network or runtime dependencies.
// Development dependency: xml-js (set NODE_PATH to its installation if needed).
const fs = require('fs');
const path = require('path');
const xml = require('xml-js');
const root = path.resolve(__dirname, '..');
const variant=Number(process.argv[2] || 1);
const settings=[
  {file:'包裝盒.svg',label:'B 彩鈦時尚｜為你・綻放',subtitle:'Titanium Chic｜BLOOM FOR YOU',color:'#c4aac8',dx:0,dy:0},
  {file:'包裝盒1.svg',label:'A 都會鈦感｜願你・閃耀',subtitle:'Urban Titanium｜SHINE YOUR WAY',color:'#006bb8',dx:-32.82,dy:-32.96},
  {file:'包裝盒2.svg',label:'C 彩光幾何｜Prismatic Titanium',subtitle:'品牌基本款 Master Packaging',color:'#f5f1ee',dx:51.2,dy:3.5}
][variant-1];
if(!settings) throw Error('Choose variant 1, 2 or 3.');
const designId=`design-${String(variant).padStart(2,'0')}`;
const source = fs.readFileSync(path.join(root, '原始設計',settings.file), 'utf8');
const tree = xml.xml2js(source);
const svg = tree.elements.find(e => e.name === 'svg');
const defs = svg.elements.find(e => e.name === 'defs');
function find(node,predicate) {
  if(predicate(node)) return node;
  for(const child of node.elements || []) {const found=find(child,predicate);if(found)return found;}
}
const knife = find(svg,e=>e.name==='g' && e.elements?.some(c=>c.attributes?.d?.includes('l.7,364.37s')));
if (!knife) throw Error('Source dieline changed; review the coordinates before importing.');
const outline = knife.elements.find(e => e.attributes?.d?.includes('l.7,364.37s')).attributes.d;
const hole = knife.elements.find(e => e.attributes?.d?.includes('h165.04c15.38')).attributes.d;
function clean(node) {
  if(node===knife) return null;
  if(variant===1 && node.elements?.some(c=>c.name==='rect' && c.attributes?.class==='cls-60')) return null;
  if(variant===2 && node.attributes?.class==='cls-40' && node.name==='g') return null;
  return {...node,...(node.elements?{elements:node.elements.map(clean).filter(Boolean)}:{})};
}
const outer={type:'element',name:'g',elements:svg.elements.filter(e=>e!==defs).map(clean).filter(Boolean)};
// The cream design has six base-color shapes followed by decorative artwork.
// Keep the base full-bleed; fit decorations uniformly to the physical panel.
const creamLayer=variant===3 ? find(outer,e=>e.name==='g' && e.elements?.[0]?.name==='rect' && e.elements[0].attributes?.class==='cls-44') : null;
if(variant===3 && !creamLayer) throw Error('Cream artwork structure changed; review before fitting.');
const parts = [
  ['c','開窗主面',538,314.26,229.34,341.42,null,null,0],
  ['b','開窗花紋側面',311.46,314.26,226.54,341.42,'c','left',-90],
  ['a','花朵背面',84.21,314.26,227.25,341.42,'b','left',-90],
  ['d','品牌側面',767.34,314.26,228.12,341.42,'c','right',90],
  ['top','上蓋',538,87.88,229.34,226.38,'c','top',90],
  ['bottom','下蓋',538,655.68,229.34,226.70,'c','bottom',-90],
  ['topTab','上插舌',538,47.14,229.34,40.74,'top','top',90],
  ['bottomTab','下插舌',538,882.38,229.34,36.61,'bottom','bottom',-90],
  ['bTop','左上防塵翼',311.46,221.95,226.54,92.31,'b','top',90],
  ['dTop','右上防塵翼',767.34,221.88,228.12,92.38,'d','top',90],
  ['bBottom','左下防塵翼',311.46,655.68,226.54,92.57,'b','bottom',-90],
  ['dBottom','右下防塵翼',767.34,655.68,228.12,92.57,'d','bottom',-90],
  ['glue','黏貼邊',53.46,314.26,30.75,341.42,'a','left',-90]
];
const out = path.join(root, 'images',designId);
fs.mkdirSync(out, {recursive:true});
// Cull only raster images whose explicit, axis-aligned bounds miss the crop.
function cull(node, bounds) {
  if (node.name === 'image') {
    const a=node.attributes;
    const m=a.transform?.match(/^translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)(?: ([-\d.]+))?\)$/);
    if(m) {
      const [x,y,sx,sy]=[+m[1],+m[2],+m[3],+(m[4]||m[3])];
      if(x>bounds[0]+bounds[2] || y>bounds[1]+bounds[3] || x+a.width*sx<bounds[0] || y+a.height*sy<bounds[1]) return null;
    }
  }
  return {...node, ...(node.elements ? {elements:node.elements.map(n=>cull(n,bounds)).filter(Boolean)} : {})};
}
const manifest=[];
for(const [id,label,bx,by,w,h,parent,edge,angle] of parts) {
  const x=Number((bx+settings.dx).toFixed(2)),y=Number((by+settings.dy).toFixed(2));
  const bounds=[x,y,w,h];
  const [, ,vbw,vbh]=svg.attributes.viewBox.split(/\s+/).map(Number);
  const extra=`<clipPath id="paper-outline"><path d="${outline}"/></clipPath><mask id="paper-window" maskUnits="userSpaceOnUse" x="0" y="0" width="${vbw}" height="${vbh}"><rect width="${vbw}" height="${vbh}" fill="white"/><path d="${hole}" fill="black"/></mask>`;
  const definitions=xml.js2xml({elements:[defs]}).replace('</defs>',extra+'</defs>');
  let art=xml.js2xml({elements:[cull(outer,bounds)]});
  let artworkFit;
  if(variant===3) {
    const side=['a','b','c','d','glue'].includes(id);
    const lid=['top','bottom'].includes(id);
    const panelWidth=['a','b','c','d','top','bottom'].includes(id)?9:w*9/229.34;
    const panelHeight=side?12:lid?9:h*9/229.34;
    const sx=panelWidth/w,sy=panelHeight/h,uniform=Math.min(sx,sy);
    const fx=uniform/sx,fy=uniform/sy;
    const tx=(x+w/2)*(1-fx),ty=(y+h/2)*(1-fy);
    const base=xml.js2xml({elements:creamLayer.elements.slice(0,6)});
    const decorations=xml.js2xml({elements:creamLayer.elements.slice(6)});
    art=`${base}<defs><clipPath id="art-panel"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g transform="translate(${tx} ${ty}) scale(${fx} ${fy})"><g clip-path="url(#art-panel)">${decorations}</g></g>`;
    artworkFit={mode:'uniform-decoration-fit',scaleX:fx,scaleY:fy,physicalWidth:panelWidth,physicalHeight:panelHeight};
  }
  const output=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${bounds.join(' ')}" width="${w}" height="${h}" preserveAspectRatio="none">${definitions}<g clip-path="url(#paper-outline)" mask="url(#paper-window)">${art}</g></svg>`;
  fs.writeFileSync(path.join(out,`${id}.svg`),output);
  // Mirror in texture space: the back face is rotated 180 degrees by CSS.
  // Keep the same cut silhouette and opening, with a plain exterior-base lilac.
  const interior=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.join(' ')}" width="${w}" height="${h}" preserveAspectRatio="none"><defs>${extra}</defs><g transform="translate(${2*x+w} 0) scale(-1 1)"><g clip-path="url(#paper-outline)" mask="url(#paper-window)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${settings.color}"/></g></g></svg>`;
  fs.writeFileSync(path.join(out,`${id}-inside.svg`),interior);
  manifest.push({id,label,sourceBounds:bounds,parent,edge,angle,...(artworkFit?{artworkFit}:{}),artwork:`images/${designId}/${id}.svg`,interior:`images/${designId}/${id}-inside.svg`});
}
const data={id:designId,label:settings.label,subtitle:settings.subtitle,interiorColor:settings.color,source:`原始設計/${settings.file}`,units:'SVG source units; physical box dimensions are defined in js/config.js',parts:manifest};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(data,null,2));
fs.writeFileSync(path.join(root,`js/${designId}.js`),`window.PackageDemo = window.PackageDemo || {};\nwindow.PackageDemo.designs = window.PackageDemo.designs || {};\nwindow.PackageDemo.designs['${designId}'] = ${JSON.stringify(data,null,2)};\nwindow.PackageDemo.design = window.PackageDemo.design || window.PackageDemo.designs['${designId}'];\n`);
console.log(`Imported ${manifest.length} panels from the original SVG.`);
