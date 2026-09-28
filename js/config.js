(function () {
  "use strict";

  window.PackageDemo = window.PackageDemo || {};

  window.PackageDemo.config = {
    name: "MonChic 鈦杯包裝提案",
    // Physical dimensions confirmed by the user; do not infer from artwork bounds.
    dimensionsCm: { width: 9, depth: 9, height: 12 },
    pixelsPerCm: 48,
    animationDuration: 2400,
    tuckInset: 2,
    cup: { mouthDiameter: 6, height: 9, baseDiameter: 3, wallThickness: .08, segments: 24 },
    camera: {
      closed: { rotateX: -14, rotateY: 32, zoom: 0.68 },
      flat: { rotateX: 0, rotateY: 0, zoom: 0.34 },
      minZoom: 0.25,
      maxZoom: 1.55
    }
  };
})();
