import { useSetAtom } from "jotai";
import { useEffect, useMemo, type FC } from "react";

import { getGMLId } from "../../shared/plateau/utils";
import { PickedFeature } from "../../shared/reearth/types";
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
  allowClickWhenDisabled: false,
  allowedEvents: {
    point: true,
    rectangle: true,
    imagery: true,
  },
};

type ScreenSpaceSelectionOptions = Partial<typeof defaultOptions>;

export type ScreenSpaceSelectionProps = ScreenSpaceSelectionOptions & {
  filterSelectedFeature?: (f: PickedFeature) => boolean;
};

export const ScreenSpaceSelection: FC<ScreenSpaceSelectionProps> = ({
  filterSelectedFeature,
  ...options
}) => {
  const handler = useMemo(() => new ScreenSpaceSelectionHandler(), []);

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
    const isFeatureBuildingModel = (f: PickedFeature | undefined) =>
      f?.properties && !!getGMLId(f.properties);
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
          let shouldUseAddAction = true;
          if (event.feature) {
            if (filterSelectedFeature && !filterSelectedFeature(event.feature)) return;

            shouldUseAddAction = isFeatureBuildingModel(event.feature);
            objects = [event.feature];
          }
          if (!shouldUseAddAction && event.action === "add") {
            event.action = "replace";
          }
          break;
        }
        case "rectangle": {
          if (event.features?.length) {
            objects = event.features.filter(f => isFeatureBuildingModel(f));
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
  }, [handler, replace, add, remove, filterSelectedFeature]);

  return !options.disabled ? <Marquee /> : null;
};
