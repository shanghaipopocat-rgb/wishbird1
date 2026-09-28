window.PackageDemo = window.PackageDemo || {};
window.PackageDemo.designs = window.PackageDemo.designs || {};
window.PackageDemo.designs['design-01'] = {
  "id": "design-01",
  "label": "B 彩鈦時尚｜為你・綻放",
  "subtitle": "Titanium Chic｜BLOOM FOR YOU",
  "interiorColor": "#c4aac8",
  "source": "原始設計/包裝盒.svg",
  "units": "SVG source units; physical box dimensions are defined in js/config.js",
  "parts": [
    {
      "id": "c",
      "label": "開窗主面",
      "sourceBounds": [
        538,
        314.26,
        229.34,
        341.42
      ],
      "parent": null,
      "edge": null,
      "angle": 0,
      "artwork": "images/design-01/c.svg",
      "interior": "images/design-01/c-inside.svg"
    },
    {
      "id": "b",
      "label": "開窗花紋側面",
      "sourceBounds": [
        311.46,
        314.26,
        226.54,
        341.42
      ],
      "parent": "c",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-01/b.svg",
      "interior": "images/design-01/b-inside.svg"
    },
    {
      "id": "a",
      "label": "花朵背面",
      "sourceBounds": [
        84.21,
        314.26,
        227.25,
        341.42
      ],
      "parent": "b",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-01/a.svg",
      "interior": "images/design-01/a-inside.svg"
    },
    {
      "id": "d",
      "label": "品牌側面",
      "sourceBounds": [
        767.34,
        314.26,
        228.12,
        341.42
      ],
      "parent": "c",
      "edge": "right",
      "angle": 90,
      "artwork": "images/design-01/d.svg",
      "interior": "images/design-01/d-inside.svg"
    },
    {
      "id": "top",
      "label": "上蓋",
      "sourceBounds": [
        538,
        87.88,
        229.34,
        226.38
      ],
      "parent": "c",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-01/top.svg",
      "interior": "images/design-01/top-inside.svg"
    },
    {
      "id": "bottom",
      "label": "下蓋",
      "sourceBounds": [
        538,
        655.68,
        229.34,
        226.7
      ],
      "parent": "c",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-01/bottom.svg",
      "interior": "images/design-01/bottom-inside.svg"
    },
    {
      "id": "topTab",
      "label": "上插舌",
      "sourceBounds": [
        538,
        47.14,
        229.34,
        40.74
      ],
      "parent": "top",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-01/topTab.svg",
      "interior": "images/design-01/topTab-inside.svg"
    },
    {
      "id": "bottomTab",
      "label": "下插舌",
      "sourceBounds": [
        538,
        882.38,
        229.34,
        36.61
      ],
      "parent": "bottom",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-01/bottomTab.svg",
      "interior": "images/design-01/bottomTab-inside.svg"
    },
    {
      "id": "bTop",
      "label": "左上防塵翼",
      "sourceBounds": [
        311.46,
        221.95,
        226.54,
        92.31
      ],
      "parent": "b",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-01/bTop.svg",
      "interior": "images/design-01/bTop-inside.svg"
    },
    {
      "id": "dTop",
      "label": "右上防塵翼",
      "sourceBounds": [
        767.34,
        221.88,
        228.12,
        92.38
      ],
      "parent": "d",
      "edge": "top",
      "angle": 90,
      "artwork": "images/design-01/dTop.svg",
      "interior": "images/design-01/dTop-inside.svg"
    },
    {
      "id": "bBottom",
      "label": "左下防塵翼",
      "sourceBounds": [
        311.46,
        655.68,
        226.54,
        92.57
      ],
      "parent": "b",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-01/bBottom.svg",
      "interior": "images/design-01/bBottom-inside.svg"
    },
    {
      "id": "dBottom",
      "label": "右下防塵翼",
      "sourceBounds": [
        767.34,
        655.68,
        228.12,
        92.57
      ],
      "parent": "d",
      "edge": "bottom",
      "angle": -90,
      "artwork": "images/design-01/dBottom.svg",
      "interior": "images/design-01/dBottom-inside.svg"
    },
    {
      "id": "glue",
      "label": "黏貼邊",
      "sourceBounds": [
        53.46,
        314.26,
        30.75,
        341.42
      ],
      "parent": "a",
      "edge": "left",
      "angle": -90,
      "artwork": "images/design-01/glue.svg",
      "interior": "images/design-01/glue-inside.svg"
    }
  ]
};
window.PackageDemo.design = window.PackageDemo.design || window.PackageDemo.designs['design-01'];
