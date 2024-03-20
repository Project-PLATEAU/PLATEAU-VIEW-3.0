/* eslint-disable @typescript-eslint/no-unused-vars */

import { Event } from "../../shared/helpers";
import {
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  MouseEvent,
  PickedFeature,
} from "../../shared/reearth/types";
import { DataType } from "../../shared/reearth/types/layer";

import {
  type ScreenSpaceSelectionEvent,
  type ScreenSpaceSelectionEventAction,
} from "./ScreenSpaceSelectionEvent";

type EventType = "point" | "rectangle" | "imagery";

const pointEvent = {
  type: "point",
  action: "replace" as ScreenSpaceSelectionEventAction,
  x: 0,
  y: 0,
  feature: undefined as PickedFeature | undefined,
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
  features: undefined as PickedFeature[] | undefined,
} satisfies ScreenSpaceSelectionEvent;

const IMAGERY_LAYER_TYPE: DataType[] = ["mvt", "wms"];
const imageryEvent = {
  type: "imagery",
  action: "replace" as ScreenSpaceSelectionEventAction,
  object: {},
} satisfies ScreenSpaceSelectionEvent;

function actionForModifier(keyName?: string): ScreenSpaceSelectionEventAction {
  // TODO: How we can determine meta key is pressed?

  return keyName === "shift" ? "add" : "replace";
}

export class ScreenSpaceSelectionHandler {
  readonly indeterminate = new Event<ScreenSpaceSelectionEvent>();
  readonly change = new Event<ScreenSpaceSelectionEvent>();

  private moving?: boolean = false;

  #disabled = false;
  #allowClickWhenDisabled = false;
  #allowedEvents: { [key in EventType]: boolean } = {
    point: true,
    rectangle: true,
    imagery: true,
  };
  #imageryFound = false;

  constructor() {
    window.reearth?.on?.("select", this.handleSelect);

    // This is for mobile.
    // Because if you use mousedown and mouseup to handle the click behavior,
    // it will conflict with pinch motion.
    window.reearth?.on?.("click", this.handleClickOnMobile);

    window.reearth?.on?.("layerSelectWithRectMove", this.handleMouseMove);
    window.reearth?.on?.("layerSelectWithRectEnd", this.handleMouseUp);
  }

  destroy(): void {
    window.reearth?.off?.("select", this.handleSelect);
    window.reearth?.off?.("click", this.handleClickOnMobile);
    window.reearth?.off?.("layerSelectWithRectMove", this.handleMouseMove);
    window.reearth?.off?.("layerSelectWithRectEnd", this.handleMouseUp);
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = value;
  }

  get allowClickWhenDisabled(): boolean {
    return this.#allowClickWhenDisabled;
  }

  set allowClickWhenDisabled(value: boolean) {
    this.#allowClickWhenDisabled = value;
  }

  get allowedEvents(): { [key in EventType]: boolean } {
    return this.#allowedEvents;
  }

  set allowedEvents(value: { [key in EventType]: boolean }) {
    this.#allowedEvents = value;
  }

  private readonly handleClickOnMobile = (event: MouseEvent): void => {
    if (this.disabled && !this.allowClickWhenDisabled) return;
    this.handleClick([event.x ?? 0, event.y ?? 0]);
  };

  private readonly handleClick = (position: [x: number, y: number], keyName?: string): void => {
    if (
      (this.disabled && !this.allowClickWhenDisabled) ||
      !this.allowedEvents.point ||
      this.moving
    ) {
      return;
    }
    pointEvent.action = actionForModifier(keyName);
    pointEvent.x = position[0];
    pointEvent.y = position[1];
    pointEvent.feature = window.reearth?.scene?.pickManyFromViewport(position, 1, 1)?.[0];
    this.change.dispatch(pointEvent);
  };

  private readonly handleSelect = (layerId?: string): void => {
    if (
      (this.disabled && !this.allowClickWhenDisabled) ||
      !this.#allowedEvents.imagery ||
      !layerId
    ) {
      return;
    }
    const l = window.reearth?.layers?.findById?.(layerId);
    const type = l?.type === "simple" ? l.data?.type : undefined;
    if (!type || !IMAGERY_LAYER_TYPE.includes(type)) return;

    if (window.reearth?.layers?.selectedFeature) {
      this.#imageryFound = true;
    }

    imageryEvent.action = "replace";
    imageryEvent.object = { ...window.reearth?.layers?.selectedFeature, layerId } ?? {};
    this.change.dispatch(imageryEvent);
    requestAnimationFrame(() => {
      this.#imageryFound = false;
    });
  };

  private readonly handleMouseUp = (event: LayerSelectWithRectEnd): void => {
    if (this.disabled || this.#imageryFound) {
      this.moving = false;
      return;
    }
    if (!event.isClick && !this.#allowedEvents.rectangle) return;

    if (event.isClick) {
      this.handleClick([event.x ?? 0, event.y ?? 0], event.pressedKey);
      pointEvent.feature = event.features?.[0];
      this.change.dispatch(pointEvent);
    } else {
      this.handleMouseMove(event);
      rectangleEvent.features = event.features;
      this.change.dispatch(rectangleEvent);
    }

    this.moving = false;
  };

  private readonly handleMouseMove = (
    event: LayerSelectWithRectMove,
    indeterminate = true,
  ): void => {
    if (this.#imageryFound) return;
    this.moving = true;
    // TODO(ReEarth): Support selecting multiple feature
    rectangleEvent.action = actionForModifier(event.pressedKey);
    rectangleEvent.startPosition = [event.startX ?? 0, event.startY ?? 0];
    rectangleEvent.endPosition = [event.x ?? 0, event.y ?? 0];
    rectangleEvent.rectangle.x = event.startX ?? 0;
    rectangleEvent.rectangle.y = event.startY ?? 0;
    rectangleEvent.rectangle.width = event.width ?? 0;
    rectangleEvent.rectangle.height = event.height ?? 0;
    if (indeterminate) {
      this.indeterminate.dispatch(rectangleEvent);
    } else {
      this.change.dispatch(rectangleEvent);
    }
  };
}
