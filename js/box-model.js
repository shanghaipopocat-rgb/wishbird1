(function () {
  "use strict";

  window.PackageDemo = window.PackageDemo || {};

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function phaseProgress(progress, phase) {
    return smoothstep((progress - phase[0]) / (phase[1] - phase[0]));
  }
  function mix(from, to, amount) { return from + (to - from) * amount; }

  class BoxModel {
    constructor(config, elements) {
      this.config = config;
      this.elements = elements;
      this.progress = 1;
      this.animationFrame = 0;
      this.design = window.PackageDemo.design;

      const d = config.dimensionsCm;
      const scale = config.pixelsPerCm;
      this.size = {
        width: d.width * scale,
        depth: d.depth * scale,
        height: d.height * scale
      };

      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--panel-w", `${this.size.width}px`);
      rootStyle.setProperty("--panel-d", `${this.size.depth}px`);
      rootStyle.setProperty("--panel-h", `${this.size.height}px`);
      this.buildSourceModel();
      this.cup = new window.PackageDemo.CupModel(config.cup, this.size, scale);
      this.elements.boxRoot.append(this.cup.element);
      this.setProgress(1);
    }

    buildSourceModel() {
      const parts = this.design.parts;
      const root = this.elements.boxRoot;
      root.replaceChildren();
      this.sourceScale = this.size.width / parts.find(p=>p.id==='c').sourceBounds[2];
      this.panels = new Map();
      this.hinges = [];
      this.tuckHinges = [];
      for (const part of parts) {
        const panel = document.createElement('section');
        panel.className = 'panel source-panel';
        panel.dataset.panel = part.id;
        const w = part.sourceBounds[2] * this.sourceScale;
        const h = part.sourceBounds[3] * this.sourceScale;
        // Opposite walls are normalized to close the box despite small drawing offsets.
        const isTuck = /Tab$/.test(part.id);
        const width = isTuck ? this.size.width - 2 * this.config.tuckInset : ['a','c','top','bottom'].includes(part.id) ? this.size.width :
          ['b','d','bTop','dTop','bBottom','dBottom'].includes(part.id) ? this.size.depth : w;
        const height = ['a','b','c','d','glue'].includes(part.id) ? this.size.height :
          ['top','bottom'].includes(part.id) ? this.size.depth : h;
        Object.assign(panel.style, {width:`${width}px`, height:`${height}px`});
        const art = document.createElement('img');
        art.className = 'artwork';
        art.src = part.artwork;
        art.alt = part.label;
        art.draggable = false;
        panel.append(art);
        const inside = document.createElement('img');
        inside.className = 'artwork interior-artwork';
        inside.src = part.interior;
        inside.alt = `${part.label}・素色內側`;
        inside.draggable = false;
        panel.append(inside);
        this.panels.set(part.id, {panel,width,height});
        if (!part.parent) { root.append(panel); continue; }
        const parent = this.panels.get(part.parent);
        const hinge = document.createElement('div');
        hinge.className = 'hinge source-hinge';
        hinge.dataset.hinge = part.id;
        const horizontal = ['top','bottom'].includes(part.edge);
        Object.assign(hinge.style, {
          left: `${part.edge === 'right' ? parent.width : 0}px`,
          top: `${part.edge === 'bottom' ? parent.height : 0}px`,
          width: horizontal ? `${width}px` : '0px',
          height: horizontal ? '0px' : `${height}px`,
          transformOrigin:'0 0'
        });
        panel.style.left = `${part.edge === 'left' ? -width : 0}px`;
        panel.style.top = `${part.edge === 'top' ? -height : 0}px`;
        hinge.append(panel);
        parent.panel.append(hinge);
        if (isTuck) this.tuckHinges.push({element:hinge,edge:part.edge,parentHeight:parent.height});
        const phase = ['a','b','d'].includes(part.id) ? [0.05,0.5] :
          part.id === 'glue' ? [0.1,0.35] :
          /Tab$/.test(part.id) ? [0.55,0.78] :
          ['top','bottom'].includes(part.id) ? [0.68,1] : [0.38,0.67];
        this.hinges.push({element:hinge,definition:{open:0,closed:part.angle,phase},axis:horizontal?'X':'Y'});
      }
    }

    setDesign(design) {
      this.design = design;
      this.buildSourceModel();
      this.elements.boxRoot.append(this.cup.element);
      this.setProgress(this.progress);
    }

    setProgress(progress) {
      this.progress = clamp(progress, 0, 1);
      this.cup.setProgress(this.progress);
      this.hinges.forEach(h => this.setHinge(h.element,h.definition,this.progress,h.axis));
      // Insert the tongue just inside the back wall; coplanar tongues show
      // through the outer print in CSS 3D. Keep the flat dieline unshifted.
      const inset = this.config.tuckInset * phaseProgress(this.progress, [0.68, 1]);
      this.tuckHinges.forEach(h => {
        h.element.style.left = `${this.config.tuckInset}px`;
        h.element.style.top = `${h.edge === 'top' ? inset : h.parentHeight - inset}px`;
      });

      const rootX = mix(15 * this.sourceScale, -this.size.width / 2, smoothstep(this.progress));
      const rootY = mix(-this.size.height / 2, -this.size.height / 2, this.progress);
      const rootZ = mix(0, this.size.depth / 2, smoothstep(this.progress));
      this.elements.boxRoot.style.transform = `translate3d(${rootX}px, ${rootY}px, ${rootZ}px)`;
      this.elements.viewport.classList.toggle("flat-mode", this.progress < 0.08);
      this.elements.progressLabel.textContent = `組裝 ${Math.round(this.progress * 100)}%`;
    }

    setHinge(element, definition, progress, axis) {
      const local = phaseProgress(progress, definition.phase);
      const angle = mix(definition.open, definition.closed, local);
      element.style.transform = `rotate${axis}(${angle}deg)`;
    }

    animateTo(target, duration) {
      cancelAnimationFrame(this.animationFrame);
      const start = this.progress;
      const delta = target - start;
      if (Math.abs(delta) < 0.001) return Promise.resolve();

      const startedAt = performance.now();
      return new Promise((resolve) => {
        const tick = (now) => {
          const elapsed = clamp((now - startedAt) / duration, 0, 1);
          const eased = elapsed < .5
            ? 4 * elapsed * elapsed * elapsed
            : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
          this.setProgress(start + delta * eased);
          if (elapsed < 1) this.animationFrame = requestAnimationFrame(tick);
          else resolve();
        };
        this.animationFrame = requestAnimationFrame(tick);
      });
    }
  }

  window.PackageDemo.BoxModel = BoxModel;
})();
