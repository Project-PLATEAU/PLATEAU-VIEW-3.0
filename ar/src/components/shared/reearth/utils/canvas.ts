export const getCesiumCanvas = () =>
  document.querySelector(".cesium-widget")?.querySelector("canvas") as
    | HTMLCanvasElement
    | undefined;
