import { Event } from "../../shared/helpers";
import { MouseEvent } from "../../shared/reearth/types";
import { DataType } from "../../shared/reearth/types/layer";

import {
  type ScreenSpaceSelectionEvent,
  type ScreenSpaceSelectionEventAction,
} from "./ScreenSpaceSelectionEvent";

const pointEvent = {
  type: "point",
  action: "replace" as ScreenSpaceSelectionEventAction,
  x: 0,
  y: 0,
} satisfies ScreenSpaceSelectionEvent;

const rectangleEvent = {
  type: "rectangle",
  action: "replace" as ScreenSpaceSelectionEventAction,
  startPosition: [0, 0],
  endPosition: [0, 0],
  rectangle: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
} satisfies ScreenSpaceSelectionEvent;

const IMAGERY_LAYER_TYPE: DataType[] = ["mvt", "wms"];
const imageryEvent = {
  type: "imagery",
  action: "replace" as ScreenSpaceSelectionEventAction,
  object: {},
} satisfies ScreenSpaceSelectionEvent;

function actionForModifier(keyName?: string): ScreenSpaceSelectionEventAction {
  // TODO: How we can determine meta key is pressed?

  return keyName === "Shift" ? "add" : "replace";
}

export class ScreenSpaceSelectionHandler {
  readonly indeterminate = new Event<ScreenSpaceSelectionEvent>();
  readonly change = new Event<ScreenSpaceSelectionEvent>();

  // private readonly handler: ScreenSpaceEventHandler;
  private startPosition?: [x: number, y: number];

  private currentKeyName?: string;

  private moving?: boolean = false;
  private downing?: boolean = false;

  #disabled = false;

  constructor() {
    // const handler = new ScreenSpaceEventHandler(scene.canvas);

    window.addEventListener("keydown", this.handleKeyDown);

    // TODO(reearth): Support event with `shift` key
    window.reearth?.on?.("select", this.handleSelect);
    window.reearth?.on?.("mousedown", this.handleMouseDown);
    window.reearth?.on?.("mouseup", this.handleMouseUp);
    window.reearth?.on?.("mousemove", this.handleMouseMove);
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);

    window.reearth?.off?.("select", this.handleSelect);
    window.reearth?.off?.("mousedown", this.handleMouseDown);
    window.reearth?.off?.("mouseup", this.handleMouseUp);
    window.reearth?.off?.("mousemove", this.handleMouseMove);
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.currentKeyName = e.key;
  }

  private readonly handleClick = (position: [x: number, y: number], keyName?: string): void => {
    if (this.disabled || this.moving) {
      return;
    }
    pointEvent.action = actionForModifier(keyName);
    pointEvent.x = position[0];
    pointEvent.y = position[1];
    this.change.dispatch(pointEvent);
  };

  private readonly handleSelect = (layerId?: string): void => {
    if (this.disabled || this.moving || !layerId) {
      return;
    }
    const l = window.reearth?.layers?.findById?.(layerId);
    const type = l?.type === "simple" ? l.data?.type : undefined;
    if (!type || !IMAGERY_LAYER_TYPE.includes(type)) return;

    imageryEvent.action = "replace";
    imageryEvent.object = { ...window.reearth?.layers?.selectedFeature, layerId } ?? {};
    this.change.dispatch(imageryEvent);
  };

  private readonly handleMouseDown = (event: MouseEvent): void => {
    if (this.disabled) {
      return;
    }
    // TODO(ReEarth): Support selecting multiple feature
    this.startPosition = [event.x ?? 0, event.y ?? 0];
    this.downing = true;
  };

  private readonly handleMouseUp = (event: MouseEvent): void => {
    if (this.disabled) {
      return;
    }

    if (this.moving) {
      this.handleMouseMove(event, false);
      this.moving = false;
      this.startPosition = undefined;
      this.downing = false;
    } else {
      this.startPosition = undefined;
      this.downing = false;
      this.handleClick([event.x ?? 0, event.y ?? 0], this.currentKeyName);
    }
  };

  private readonly handleMouseMove = (event: MouseEvent, indeterminate = true): void => {
    if (this.disabled) {
      return;
    }
    if (!this.startPosition) {
      return;
    }
    if (!this.downing) {
      return;
    }

    let x1 = this.startPosition[0];
    let y1 = this.startPosition[1];
    let x2 = event.x ?? 0;
    let y2 = event.y ?? 0;

    if (x2 - x1 === 0 && y2 - y1 === 0) return;

    this.moving = true;

    if (x1 > x2) {
      [x2, x1] = [x1, x2];
    }
    if (y1 > y2) {
      [y2, y1] = [y1, y2];
    }
    // TODO(ReEarth): Support selecting multiple feature
    rectangleEvent.action = actionForModifier(this.currentKeyName);
    rectangleEvent.startPosition = [...this.startPosition];
    rectangleEvent.endPosition = [event.x ?? 0, event.y ?? 0];
    rectangleEvent.rectangle.x = x1;
    rectangleEvent.rectangle.y = y1;
    rectangleEvent.rectangle.width = x2 - x1;
    rectangleEvent.rectangle.height = y2 - y1;
    if (indeterminate) {
      this.indeterminate.dispatch(rectangleEvent);
    } else {
      this.change.dispatch(rectangleEvent);
    }
  };
}
