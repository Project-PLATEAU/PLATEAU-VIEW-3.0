import { useCallback, useEffect } from "react";

export const useTimeline = () => {
  const getTimeline = useCallback(() => {
    return window.reearth?.clock;
  }, []);

  const handleTimelinePlay = useCallback(
    ({
      start,
      stop,
      current,
      speed,
    }: {
      start: Date;
      stop: Date;
      current: Date;
      speed: number;
    }) => {
      window.reearth?.clock?.setTime?.({
        start,
        stop,
        current,
      });
      window.reearth?.clock?.setSpeed?.(speed);
      window.reearth?.clock?.play?.();
    },
    [],
  );

  const handleTimelinePlayReverse = useCallback(
    ({
      start,
      stop,
      current,
      speed,
    }: {
      start: Date;
      stop: Date;
      current: Date;
      speed: number;
    }) => {
      window.reearth?.clock?.setTime?.({
        start,
        stop,
        current,
      });
      window.reearth?.clock?.setSpeed?.(-speed);
      window.reearth?.clock?.play?.();
    },
    [],
  );

  const handleTimelinePause = useCallback(() => {
    window.reearth?.clock?.pause?.();
  }, []);

  const handleTimelineJump = useCallback(
    ({ start, stop, current }: { start: Date; stop: Date; current: Date }) => {
      window.reearth?.clock?.pause?.();
      window.reearth?.clock?.setTime?.({
        start,
        stop,
        current,
      });
    },
    [],
  );

  const handleTimelineSetSpeed = useCallback((speed: number) => {
    window.reearth?.clock?.setSpeed?.(speed);
  }, []);

  const handleTimelineOnTickEventAdd = useCallback((callback: (date: Date) => void) => {
    window.reearth?.on?.("tick", callback);
  }, []);

  const handleTimelineOnTickEventRemove = useCallback((callback: (date: Date) => void) => {
    window.reearth?.off?.("tick", callback);
  }, []);

  useEffect(() => {
    // set default range type to clamped
    window.reearth?.clock?.setRangeType?.("clamped");
  }, []);

  return {
    getTimeline,
    handleTimelinePlay,
    handleTimelinePlayReverse,
    handleTimelinePause,
    handleTimelineJump,
    handleTimelineSetSpeed,
    handleTimelineOnTickEventAdd,
    handleTimelineOnTickEventRemove,
  };
};
