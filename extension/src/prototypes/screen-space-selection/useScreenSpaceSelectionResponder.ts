import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

import { useConstant } from "../react-helpers";

import { becomeResponder, removeScreenSpaceSelectionAtom } from "./states";
import {
  type ScreenSpaceSelectionEntry,
  type ScreenSpaceSelectionResponder,
  type ScreenSpaceSelectionType,
} from "./types";

export interface ScreenSpaceSelectionResponderParams<T extends ScreenSpaceSelectionType>
  extends ScreenSpaceSelectionResponder<T> {
  type: T;
}

export function useScreenSpaceSelectionResponder<T extends ScreenSpaceSelectionType>(
  params: ScreenSpaceSelectionResponderParams<T>,
): void {
  const selection = useConstant(() => new Set<ScreenSpaceSelectionEntry<T>>());

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const responder = useConstant<ScreenSpaceSelectionResponder<T>>(() => ({
    convertToSelection: object => {
      return paramsRef.current.convertToSelection(object);
    },
    shouldRespondToSelection: (value): value is ScreenSpaceSelectionEntry<T> => {
      return paramsRef.current.shouldRespondToSelection(value);
    },
    onSelect: value => {
      paramsRef.current.onSelect?.(value);
      selection.add(value);
    },
    onDeselect: value => {
      paramsRef.current.onDeselect?.(value);
      selection.delete(value);
    },
    computeBoundingSphere: value => {
      return paramsRef.current.computeBoundingSphere?.(value);
    },
  }));

  // Assume that component is ephemeral.
  const remove = useSetAtom(removeScreenSpaceSelectionAtom);
  useEffect(() => {
    const resignResponder = becomeResponder(responder);
    return () => {
      resignResponder();
      if (selection.size > 0) {
        remove(Array.from(selection.values()));
      }
    };
  }, [selection, responder, remove]);
}
