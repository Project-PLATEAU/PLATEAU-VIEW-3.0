export type ScreenSpaceSelectionEventType = "point" | "rectangle" | "imagery";
export type ScreenSpaceSelectionEventAction = "replace" | "add" | "remove";

interface ScreenSpaceSelectionEventBase {
  type: ScreenSpaceSelectionEventType;
  action: ScreenSpaceSelectionEventAction;
}

export interface PointScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "point";
  x: number;
  y: number;
}

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface RectangleScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "rectangle";
  startPosition: [x: number, y: number];
  endPosition: [x: number, y: number];
  rectangle: Rectangle;
}

export interface ImageryScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "imagery";
  object: any;
}

export type ScreenSpaceSelectionEvent =
  | PointScreenSpaceSelectionEvent
  | RectangleScreenSpaceSelectionEvent
  | ImageryScreenSpaceSelectionEvent;

export type ScreenSpaceSelectionEventHandler = (event: ScreenSpaceSelectionEvent) => void;
