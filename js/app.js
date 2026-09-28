(function () {
  "use strict";

  const ns = window.PackageDemo;
  const config = ns.config;
  const byId = (id) => document.getElementById(id);

  const elements = {
    viewport: byId("viewport"),
    camera: byId("camera"),
    boxRoot: byId("boxRoot"),
    progressLabel: byId("progressLabel"),
    modeLabel: byId("modeLabel"),
    flatButton: byId("flatButton"),
    assembleButton: byId("assembleButton"),
    autoRotateButton: byId("autoRotateButton"),
    resetButton: byId("resetButton")
  };

  const model = new ns.BoxModel(config, elements);
  const interaction = new ns.InteractionController(elements.viewport, elements.camera, config.camera,
    moving => model.cup.setMoving(moving));
  let busy = false;
  const tabs = [...document.querySelectorAll('[data-design]')];
  function setBusy(value) {
    busy=value;
    tabs.forEach(tab=>{tab.disabled=value;});
  }
  function selectDesign(id) {
    if(busy || !ns.designs[id]) return;
    model.setDesign(ns.designs[id]);
    ns.design=ns.designs[id];
    tabs.forEach(tab=>{
      const selected=tab.dataset.design===id;
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected?0:-1;
    });
    byId('designLabel').textContent=`${model.design.label} · ${model.design.source.split('/').pop()} · 9 × 9 × 12 cm`;
    byId('designSubtitle').textContent=model.design.subtitle;
    byId('designViewer').setAttribute('aria-labelledby',`tab-${id}`);
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectDesign(tab.dataset.design));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next===undefined || busy) return;
      event.preventDefault();
      selectDesign(tabs[next].dataset.design);
      tabs[next].focus();
    });
  });

  async function showFlat() {
    if (busy) return;
    setBusy(true);
    interaction.setAutoRotate(false);
    syncAutoButton();
    elements.modeLabel.textContent = "Flat 模式";
    elements.flatButton.classList.add("primary");
    elements.assembleButton.classList.remove("primary");
    interaction.applyPreset(config.camera.flat, false);
    await model.animateTo(0, config.animationDuration);
    setBusy(false);
  }

  async function assemble() {
    if (busy) return;
    setBusy(true);
    elements.modeLabel.textContent = "Assembly 模式";
    elements.flatButton.classList.remove("primary");
    elements.assembleButton.classList.add("primary");
    interaction.applyPreset(config.camera.closed, false);
    await model.animateTo(1, config.animationDuration);
    elements.modeLabel.textContent = "3D 模式";
    setBusy(false);
  }

  function syncAutoButton() {
    elements.autoRotateButton.setAttribute("aria-pressed", String(interaction.autoRotate));
    elements.autoRotateButton.textContent = interaction.autoRotate ? "停止旋轉" : "自動旋轉";
  }

  elements.flatButton.addEventListener("click", showFlat);
  elements.assembleButton.addEventListener("click", assemble);
  elements.autoRotateButton.addEventListener("click", () => {
    interaction.setAutoRotate(!interaction.autoRotate);
    syncAutoButton();
  });
  elements.resetButton.addEventListener("click", () => interaction.reset(model.progress < .1));
  elements.viewport.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "a") requestAnimationFrame(syncAutoButton);
  });

  window.addEventListener("blur", () => elements.viewport.classList.remove("dragging"));
  window.packageDemo = { model, interaction, config, showFlat, assemble, selectDesign };
})();
