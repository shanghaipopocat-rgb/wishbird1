(function () {
  'use strict';
  const ns = window.PackageDemo = window.PackageDemo || {};

  // Surface of revolution in centimetres, y measured down from the lip.
  // Only lip, height and foot are measured; the belly follows the reference photo.
  function profile(c) {
    const shape = [[0,1],[.08,1.035],[.2,1.075],[.35,1.1],[.5,1.1],
      [.63,1.06],[.75,.97],[.85,.84],[.93,.68],[1,.5]];
    return shape.map(([y,r]) => [y*c.height, y===1 ? c.baseDiameter/2 : r*c.mouthDiameter/2]);
  }

  function facet(a,b,theta,step,scale) {
    const half=step/2, cos=Math.cos(theta), sin=Math.sin(theta);
    const dy=(b[0]-a[0])*scale, dr=(b[1]-a[1])*Math.cos(half)*scale;
    const length=Math.hypot(dy,dr);
    const top=2*a[1]*Math.sin(half)*scale, bottom=2*b[1]*Math.sin(half)*scale;
    const width=Math.max(top,bottom);
    const u=[cos,0,-sin], v=[dr*sin/length,dy/length,dr*cos/length];
    const n=[sin*dy/length,-dr/length,cos*dy/length];
    const r=(a[1]+b[1])/2*Math.cos(half)*scale;
    const center=[r*sin,(a[0]+b[0])/2*scale,r*cos];
    const p=center.map((x,i)=>x-u[i]*width/2-v[i]*length/2);
    return {width,height:length,clip:`polygon(${(width-top)/2/width*100}% 0,${(width+top)/2/width*100}% 0,${(width+bottom)/2/width*100}% 100%,${(width-bottom)/2/width*100}% 100%)`,
      matrix:[...u,0,...v,0,...n,0,...p,1]};
  }

  class CupModel {
    constructor(config,boxSize,scale) {
      this.config=config;
      this.profile=profile(config);
      this.element=document.createElement('div');
      this.element.className='cup-model';
      this.element.setAttribute('role','img');
      this.element.setAttribute('aria-label',`金色蛋杯，杯口直徑 ${config.mouthDiameter} 公分、高 ${config.height} 公分、底部直徑 ${config.baseDiameter} 公分`);
      this.element.style.transform=`translate3d(${boxSize.width/2}px,${boxSize.height-config.height*scale-.3}px,${-boxSize.depth/2}px)`;
      const segments=config.segments, step=2*Math.PI/segments;
      const inside=this.profile.map(([y,r])=>[Math.min(y,config.height-config.wallThickness),r-config.wallThickness]);
      const append=(a,b,i,inner=false,rim=false)=>{
        const theta=(i+.5)*step, f=facet(a,b,theta,step,scale);
        const face=document.createElement('div');
        face.className='cup-facet';
        // Broad gold reflection bands; one solid fill per facet avoids layered paints.
        const light=Math.pow(Math.max(0,Math.cos(theta-.65)),22)+.8*Math.pow(Math.max(0,Math.cos(theta+1.5)),30);
        const l=inner ? 20+light*28 : 28+light*48;
        Object.assign(face.style,{width:`${f.width}px`,height:`${f.height}px`,clipPath:f.clip,
          transform:`matrix3d(${f.matrix.join(',')})`,
          background:rim ? '#e7c477' : `hsl(43 58% ${Math.min(88,l+3)}%)`});
        this.element.append(face);
      };
      for(let i=0;i<segments;i++) {
        for(let j=0;j<this.profile.length-1;j++) {
          append(this.profile[j],this.profile[j+1],i);
          append(inside[j],inside[j+1],i,true);
        }
        append(this.profile[0],inside[0],i,false,true);
      }
      // Opaque foot and inner floor, leaving the mouth open.
      for(const inner of [false,true]) {
        const disc=document.createElement('div');
        disc.className='cup-floor';
        const radius=(config.baseDiameter/2-(inner?config.wallThickness:0))*scale;
        Object.assign(disc.style,{width:`${radius*2}px`,height:`${radius*2}px`,
          background:inner?'#70552c':'#735728',
          transform:`translate3d(${-radius}px,${(config.height-(inner?config.wallThickness:0))*scale}px,${-radius}px) rotateX(90deg)`});
        this.element.append(disc);
      }
    }
    setProgress(progress) {
      this.progress = progress;
      this.updateVisibility();
    }
    setMoving(moving) {
      this.moving = moving;
      this.updateVisibility();
    }
    updateVisibility() {
      // display:none removes all cup facets from rendering during interaction.
      this.element.style.display = this.moving || this.progress < .08 ? 'none' : '';
    }
  }
  ns.CupModel=CupModel;
  ns.cupGeometry={profile,facet};
})();
