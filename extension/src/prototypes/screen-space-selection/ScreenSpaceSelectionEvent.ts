import { PickedFeature } from "../../shared/reearth/types";

export type ScreenSpaceSelectionEventType = "point" | "rectangle" | "select";
export type ScreenSpaceSelectionEventAction = "replace" | "add" | "remove";

interface ScreenSpaceSelectionEventBase {
  type: ScreenSpaceSelectionEventType;
  action: ScreenSpaceSelectionEventAction;
}

export interface PointScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "point";
  x: number;
  y: number;
  feature: PickedFeature | undefined;
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
  features: PickedFeature[] | undefined;
}

export interface ImageryScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "select";
  object: any;
}

export type ScreenSpaceSelectionEvent =
  | PointScreenSpaceSelectionEvent
  | RectangleScreenSpaceSelectionEvent
  | ImageryScreenSpaceSelectionEvent;

export type ScreenSpaceSelectionEventHandler = (event: ScreenSpaceSelectionEvent) => void;
