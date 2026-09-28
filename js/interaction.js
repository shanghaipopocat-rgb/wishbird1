(function () {
  "use strict";

  window.PackageDemo = window.PackageDemo || {};

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  class InteractionController {
    constructor(viewport, camera, config, onMotionChange = () => {}) {
      this.viewport = viewport;
      this.camera = camera;
      this.config = config;
      this.rotateX = config.closed.rotateX;
      this.rotateY = config.closed.rotateY;
      this.zoom = config.closed.zoom;
      this.pointer = null;
      this.lastPinchDistance = 0;
      this.autoRotate = false;
      this.autoFrame = 0;
      this.onMotionChange = onMotionChange;
      this.heldKeys = new Set();
      this.idleTimer = 0;
      this.bind();
      this.render();
    }

    bind() {
      this.viewport.addEventListener("pointerdown", (event) => this.onPointerDown(event));
      window.addEventListener("pointermove", (event) => this.onPointerMove(event));
      window.addEventListener("pointerup", (event) => this.onPointerUp(event));
      window.addEventListener("pointercancel", (event) => this.onPointerUp(event));
      this.viewport.addEventListener("lostpointercapture", (event) => this.onPointerUp(event));
      this.viewport.addEventListener("wheel", (event) => this.onWheel(event), { passive: false });
      this.viewport.addEventListener("keydown", (event) => this.onKeyDown(event));
      window.addEventListener("keyup", (event) => {
        if (this.heldKeys.delete(event.key.toLowerCase())) this.trackMotion();
      });
      window.addEventListener("blur", () => {
        this.pointer = null;
        this.heldKeys.clear();
        this.viewport.classList.remove("dragging");
        this.trackMotion();
      });
    }

    onPointerDown(event) {
      this.viewport.focus({ preventScroll: true });
      this.viewport.setPointerCapture?.(event.pointerId);
      this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      this.viewport.classList.add("dragging");
      this.trackMotion();
    }

    onPointerMove(event) {
      if (!this.pointer || event.pointerId !== this.pointer.id) return;
      const dx = event.clientX - this.pointer.x;
      const dy = event.clientY - this.pointer.y;
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.rotateY += dx * .32;
      this.rotateX = clamp(this.rotateX - dy * .28, -82, 82);
      this.render();
    }

    onPointerUp(event) {
      if (!this.pointer || event.pointerId !== this.pointer.id) return;
      this.pointer = null;
      this.viewport.classList.remove("dragging");
      this.trackMotion();
    }

    onWheel(event) {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * .0012);
      this.zoom = clamp(this.zoom * factor, this.config.minZoom, this.config.maxZoom);
      this.render();
    }

    onKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key.startsWith('arrow')) this.heldKeys.add(key);
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "r", "a"].includes(key)) event.preventDefault();
      if (key === "arrowleft") this.rotateY -= 7;
      if (key === "arrowright") this.rotateY += 7;
      if (key === "arrowup") this.rotateX = clamp(this.rotateX + 7, -82, 82);
      if (key === "arrowdown") this.rotateX = clamp(this.rotateX - 7, -82, 82);
      if (key === "r") this.reset(false);
      if (key === "a") this.setAutoRotate(!this.autoRotate);
      this.render();
    }

    applyPreset(preset, keepRotation) {
      if (!keepRotation) {
        this.rotateX = preset.rotateX;
        this.rotateY = preset.rotateY;
      }
      this.zoom = preset.zoom;
      this.render();
    }

    reset(flat) {
      this.applyPreset(flat ? this.config.flat : this.config.closed, false);
    }

    setAutoRotate(enabled) {
      this.autoRotate = Boolean(enabled);
      cancelAnimationFrame(this.autoFrame);
      this.trackMotion();
      if (!this.autoRotate) return;
      let previous = performance.now();
      const tick = (now) => {
        const delta = Math.min(40, now - previous);
        previous = now;
        this.rotateY += delta * .018;
        this.render();
        if (this.autoRotate) this.autoFrame = requestAnimationFrame(tick);
      };
      this.autoFrame = requestAnimationFrame(tick);
    }

    render() {
      this.trackMotion();
      this.camera.style.transform = `scale(${this.zoom}) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`;
    }

    trackMotion() {
      clearTimeout(this.idleTimer);
      this.onMotionChange(true);
      if (this.autoRotate || this.pointer || this.heldKeys.size) return;
      // Repaint the cup only once the view has settled.
      this.idleTimer = setTimeout(() => this.onMotionChange(false), 180);
    }
  }

  window.PackageDemo.InteractionController = InteractionController;
})();
