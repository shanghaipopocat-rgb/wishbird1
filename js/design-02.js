window.PackageDemo = window.PackageDemo || {};
window.PackageDemo.designs = window.PackageDemo.designs || {};
window.PackageDemo.designs['design-02'] = {
  "id": "design-02",
  "label": "A 都會鈦感｜願你・閃耀",
  "subtitle": "Urban Titanium｜SHINE YOUR WAY",
  "interiorColor": "#006bb8",
  "source": "原始設計/包裝盒1.svg",
  "units": "SVG source units; physical box dimensions are defined in js/config.js",
  "parts": [
    {
      "id": "c",
      "label": "開窗主面",
      "sourceBounds": [
        505.18,
        281.3,
        229.34,
        341.42
      ],
      "parent": null,
      "edge": null,
      "angle": 0,
      "artwork": "images/design-02/c.svg",
      "interior": "images/design-02/c-inside.svg"
    },
    {
      "id": "b",
      "label": "開窗花紋側面",
      "sourceBounds": [
        278.64,
        281.3,
        226.54,
        341.42
      ],
      "parent": "c",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-02/b.svg",
      "interior": "images/design-02/b-inside.svg"
    },
    {
      "id": "a",
      "label": "花朵背面",
      "sourceBounds": [
        51.39,
        281.3,
        227.25,
        341.42
      ],
      "parent": "b",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-02/a.svg",
      "interior": "images/design-02/a-inside.svg"
    },
    {
      "id": "d",
      "label": "品牌側面",
      "sourceBounds": [
        734.52,
        281.3,
        228.12,
        341.42
      ],
      "parent": "c",
      "edge": "right",
      "angle": 90,
      "artwork": "images/design-02/d.svg",
      "interior": "images/design-02/d-inside.svg"
    },
    {
      "id": "top",
      "label": "上蓋",
      "sourceBounds": [
        505.18,
        54.92,
        229.34,
        226.38
      ],
      "parent": "c",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-02/top.svg",
      "interior": "images/design-02/top-inside.svg"
    },
    {
      "id": "bottom",
      "label": "下蓋",
      "sourceBounds": [
        505.18,
        622.72,
        229.34,
        226.7
      ],
      "parent": "c",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-02/bottom.svg",
      "interior": "images/design-02/bottom-inside.svg"
    },
    {
      "id": "topTab",
      "label": "上插舌",
      "sourceBounds": [
        505.18,
        14.18,
        229.34,
        40.74
      ],
      "parent": "top",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-02/topTab.svg",
      "interior": "images/design-02/topTab-inside.svg"
    },
    {
      "id": "bottomTab",
      "label": "下插舌",
      "sourceBounds": [
        505.18,
        849.42,
        229.34,
        36.61
      ],
      "parent": "bottom",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-02/bottomTab.svg",
      "interior": "images/design-02/bottomTab-inside.svg"
    },
    {
      "id": "bTop",
      "label": "左上防塵翼",
      "sourceBounds": [
        278.64,
        188.99,
        226.54,
        92.31
      ],
      "parent": "b",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-02/bTop.svg",
      "interior": "images/design-02/bTop-inside.svg"
    },
    {
      "id": "dTop",
      "label": "右上防塵翼",
      "sourceBounds": [
        734.52,
        188.92,
        228.12,
        92.38
      ],
      "parent": "d",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-02/dTop.svg",
      "interior": "images/design-02/dTop-inside.svg"
    },
    {
      "id": "bBottom",
      "label": "左下防塵翼",
      "sourceBounds": [
        278.64,
        622.72,
        226.54,
        92.57
      ],
      "parent": "b",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-02/bBottom.svg",
      "interior": "images/design-02/bBottom-inside.svg"
    },
    {
      "id": "dBottom",
      "label": "右下防塵翼",
      "sourceBounds": [
        734.52,
        622.72,
        228.12,
        92.57
      ],
      "parent": "d",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-02/dBottom.svg",
      "interior": "images/design-02/dBottom-inside.svg"
    },
    {
      "id": "glue",
      "label": "黏貼邊",
      "sourceBounds": [
        20.64,
        281.3,
        30.75,
        341.42
      ],
      "parent": "a",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-02/glue.svg",
      "interior": "images/design-02/glue-inside.svg"
    }
  ]
};
window.PackageDemo.design = window.PackageDemo.design || window.PackageDemo.designs['design-02'];
