import { useCallback } from "react";

import { ReearthSketchType } from "../types";

export const useSketch = () => {
  const handleSetType = useCallback((type: ReearthSketchType | undefined) => {
    window.reearth?.sketch?.setType(type);
  }, []);

  const handleSetColor = useCallback((color: string) => {
    window.reearth?.sketch?.setColor(color);
  }, []);

  const handleCreateDataOnly = useCallback((dataOnly: boolean) => {
    window.reearth?.sketch?.createDataOnly(dataOnly);
  }, []);

  const handleDisableShadow = useCallback((disable: boolean) => {
    window.reearth?.sketch?.disableShadow(disable);
  }, []);

  const handleEnableRelativeHeight = useCallback((enable: boolean) => {
    window.reearth?.sketch?.enableRelativeHeight(enable);
  }, []);

  const handleAllowRightClickToAbort = useCallback((allow: boolean) => {
    window.reearth?.sketch?.allowRightClickToAbort(allow);
  }, []);

  const handleAllowAutoResetInteractionMode = useCallback((allow: boolean) => {
    window.reearth?.sketch?.allowAutoResetInteractionMode(allow);
  }, []);

  return {
    handleSetType,
    handleSetColor,
    handleCreateDataOnly,
    handleDisableShadow,
    handleEnableRelativeHeight,
    handleAllowRightClickToAbort,
    handleAllowAutoResetInteractionMode,
  };
};
