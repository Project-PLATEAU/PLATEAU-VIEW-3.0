import { CameraPosition } from "./camera";

export type MouseEvent = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: CameraPosition];
  //   layeredit: [e: LayerEditEvent];
  select: [layerId: string | undefined, featureId: string | undefined];
  message: [message: any];
  click: [props: MouseEvent];
  doubleclick: [props: MouseEvent];
  mousedown: [props: MouseEvent];
  mouseup: [props: MouseEvent];
  rightclick: [props: MouseEvent];
  rightdown: [props: MouseEvent];
  rightup: [props: MouseEvent];
  middleclick: [props: MouseEvent];
  middledown: [props: MouseEvent];
  middleup: [props: MouseEvent];
  mousemove: [props: MouseEvent];
  mouseenter: [props: MouseEvent];
  mouseleave: [props: MouseEvent];
  wheel: [props: MouseEvent];
  tick: [props: Date];
  //   resize: [props: ViewportSize];
  modalclose: [];
  popupclose: [];
  //   pluginmessage: [props: PluginMessage];
};
