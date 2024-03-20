import { useTheme } from "@mui/material";
import { PrimitiveAtom, atom, useAtomValue } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { composeIdentifier, matchIdentifier } from "../../prototypes/cesium-helpers";
import {
  ScreenSpaceSelectionEntry,
  screenSpaceSelectionAtom,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import balloonImage from "../../shared/view/assets/balloon.png";
import cameraImage from "../../shared/view/assets/camera.png";
import { StoryAppearance, StoryLayer, STORY_MARKER_ID_PROPERTY } from "../reearth/layers/story";
import { CameraPosition } from "../reearth/types";

export const STORY_OBJECT = "STORY_OBJECT";

declare module "../../prototypes/screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [STORY_OBJECT]: string;
  }
}

export type StoryCapture = {
  id: string;
  title?: string;
  content?: string;
  camera: CameraPosition;
};

export const storySelectionAtom = atom(get => {
  return get(screenSpaceSelectionAtom).filter(
    (entry): entry is ScreenSpaceSelectionEntry<typeof STORY_OBJECT> => entry.type === STORY_OBJECT,
  );
});

type StoryContainerProps = {
  capturesAtom: PrimitiveAtom<StoryCapture[]>;
  onLoad: (layerId: string) => void;
};

export const StoryLayerContainer: FC<StoryContainerProps> = ({ capturesAtom, onLoad }) => {
  const captures = useAtomValue(capturesAtom);

  const handleLoad = useCallback(
    (layerId: string, captureId: string) => {
      if (captureId === captures[0].id) {
        onLoad?.(layerId);
      }
    },
    [captures, onLoad],
  );

  return (
    <>
      {captures.map(capture => (
        <StoryObject key={capture.id} capture={capture} onLoad={handleLoad} />
      ))}
    </>
  );
};

type StoryObjectProps = {
  capture: StoryCapture;
  onLoad: (layerId: string, captureId: string) => void;
};

const StoryObject: FC<StoryObjectProps> = ({ capture, onLoad }) => {
  const theme = useTheme();

  const objectId = composeIdentifier({
    type: "Story",
    key: capture.id,
  });

  useScreenSpaceSelectionResponder({
    type: STORY_OBJECT,
    convertToSelection: object => {
      return "properties" in object &&
        object.properties &&
        typeof object.properties === "object" &&
        STORY_MARKER_ID_PROPERTY in object.properties &&
        object.properties[STORY_MARKER_ID_PROPERTY] === objectId
        ? {
            type: STORY_OBJECT,
            value: objectId,
          }
        : undefined;
    },
    shouldRespondToSelection: (value): value is ScreenSpaceSelectionEntry<typeof STORY_OBJECT> => {
      return value.type === STORY_OBJECT && value.value === objectId;
    },
  });

  const selected = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          const screenSpaceSelection = get(screenSpaceSelectionAtom);
          return screenSpaceSelection.some(
            ({ type, value }) =>
              type === STORY_OBJECT && matchIdentifier(value, { type: "Story", key: capture.id }),
          );
        }),
      [capture.id],
    ),
  );

  const handleLoad = useCallback(
    (layerId: string) => {
      onLoad?.(layerId, capture.id);
    },
    [capture.id, onLoad],
  );

  const balloonAppearance: StoryAppearance = useMemo(
    () => ({
      marker: {
        hideIndicator: true,
        image: balloonImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        eyeOffset: [0, 0, -10],
        imageColor: selected ? theme.palette.primary.main : "#000000",
      },
    }),
    [selected, theme],
  );

  const iconAppearance: StoryAppearance = useMemo(
    () => ({
      marker: {
        hideIndicator: true,
        image: cameraImage,
        imageSize: 1,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        // WORKAROUND: Render front of balloon.
        eyeOffset: [0, 0, -10.1],
      },
    }),
    [],
  );
  return (
    <>
      <StoryLayer
        id={objectId}
        capture={capture}
        onLoad={handleLoad}
        appearances={balloonAppearance}
      />
      <StoryLayer id={objectId} capture={capture} appearances={iconAppearance} />
    </>
  );
};
