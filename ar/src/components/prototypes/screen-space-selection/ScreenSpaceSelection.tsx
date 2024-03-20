import { useSetAtom } from "jotai";
import { useEffect, useMemo, type FC, useRef } from "react";

import { getGMLId } from "../../shared/plateau/utils";
import { assignPropertyProps } from "../react-helpers";

import { Marquee } from "./Marquee";
import { ScreenSpaceSelectionHandler } from "./ScreenSpaceSelectionHandler";
import {
  addScreenSpaceSelectionObjectsAtom,
  removeScreenSpaceSelectionObjectsAtom,
  replaceScreenSpaceSelectionObjectsAtom,
  screenSpaceSelectionHandlerAtom,
} from "./states";

const defaultOptions = {
  disabled: false,
};

type ScreenSpaceSelectionOptions = Partial<typeof defaultOptions>;

export type ScreenSpaceSelectionProps = ScreenSpaceSelectionOptions;

export const ScreenSpaceSelection: FC<ScreenSpaceSelectionProps> = ({ ...options }) => {
  const handler = useMemo(() => new ScreenSpaceSelectionHandler(), []);
  const pointRef = useRef({ x: 0, y: 0 });

  if (handler != null) {
    assignPropertyProps(handler, options, defaultOptions);
  }

  const setHandler = useSetAtom(screenSpaceSelectionHandlerAtom);
  useEffect(() => {
    setHandler(handler ?? null);
  }, [handler, setHandler]);

  const replace = useSetAtom(replaceScreenSpaceSelectionObjectsAtom);
  const add = useSetAtom(addScreenSpaceSelectionObjectsAtom);
  const remove = useSetAtom(removeScreenSpaceSelectionObjectsAtom);

  useEffect(() => {
    return handler?.change.addEventListener(event => {
      if (!event) return;

      let objects: object[] = [];

      // TODO(ReEarth): Need to handle groundPrimitives API
      // Ignore ground primitives to pick objects below them.
      // TODO: Support ground primitives.
      // const showGroundPrimitives = scene.groundPrimitives.show;
      // scene.groundPrimitives.show = false;

      switch (event.type) {
        case "point": {
          const fs = window.reearth?.scene?.pickManyFromViewport([event.x, event.y], 1, 1);
          if (fs) {
            objects = fs;
          }
          break;
        }
        case "rectangle": {
          const { x, y, width, height } = event.rectangle;
          if (width > 0 && height > 0) {
            pointRef.current.x = x + width / 2;
            pointRef.current.y = y + height / 2;
            const fs = window.reearth?.scene?.pickManyFromViewport(
              [pointRef.current.x, pointRef.current.y],
              width,
              height,
              f => f.properties && !!getGMLId(f.properties),
            );
            if (fs) {
              objects = fs;
            }
          }
          break;
        }
        case "imagery": {
          objects = [event.object];
        }
      }
      // scene.groundPrimitives.show = showGroundPrimitives;
      ({ replace, add, remove })[event.action](objects);
    });
  }, [handler, replace, add, remove]);

  return <Marquee />;
};
