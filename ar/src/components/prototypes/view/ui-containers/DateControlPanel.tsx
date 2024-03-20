import { styled } from "@mui/material";
import { useAtom } from "jotai";
import { useState, type FC, useCallback, useLayoutEffect, useEffect } from "react";

import { useCamera, useReEarthEvent } from "../../../shared/reearth/hooks";
import { useTimeline } from "../../../shared/reearth/hooks/useTimeline";
import { activeTimelineComponentIdAtom } from "../../../shared/view/state/timeline";
import { DateControl, FloatingPanel } from "../../ui-components";

const Root = styled(FloatingPanel)({
  width: 640,
});

// Use JST for UI
const timezone = "9";

export const DateControlPanel: FC = () => {
  const [date, _setDate] = useState<Date>();
  const [coords, _setCoords] = useState<{
    longitude: number;
    latitude: number;
  }>();

  const [_, setActiveTimelineComponentId] = useAtom(activeTimelineComponentIdAtom);

  const { getCameraFovInfo } = useCamera();

  const updateCroods = useCallback(() => {
    const fovInfo = getCameraFovInfo();
    if (fovInfo?.center) {
      _setCoords({
        longitude: fovInfo.center.lng,
        latitude: fovInfo.center.lat,
      });
    }
  }, [getCameraFovInfo]);

  useReEarthEvent("cameramove", updateCroods);

  const {
    getTimeline,
    handleTimelineJump,
    handleTimelineOnTickEventAdd,
    handleTimelineOnTickEventRemove,
  } = useTimeline();

  useLayoutEffect(() => {
    updateCroods();
    const timeline = getTimeline();
    if (timeline?.currentTime) {
      _setDate(timeline.currentTime);
    }
  }, [updateCroods, getTimeline]);

  const handleTick = useCallback((date: Date) => {
    _setDate(date);
  }, []);

  useEffect(() => {
    handleTimelineOnTickEventAdd(handleTick);
    return () => {
      handleTimelineOnTickEventRemove(handleTick);
    };
  }, [handleTimelineOnTickEventAdd, handleTimelineOnTickEventRemove, handleTick]);

  const handleChange = useCallback(
    (_: unknown, date: Date) => {
      const dateWithoutTimezone = recoverDateFromTimezone(date, timezone);
      _setDate(dateWithoutTimezone);
      handleTimelineJump({
        start: dateWithoutTimezone,
        stop: dateWithoutTimezone,
        current: dateWithoutTimezone,
      });
      setActiveTimelineComponentId("daytime");
    },
    [handleTimelineJump, setActiveTimelineComponentId],
  );

  const [dateWithTimezone, setDateWithTimezone] = useState<Date>();
  useLayoutEffect(() => {
    if (date) {
      setDateWithTimezone(getDateWithTimezone(date, timezone));
    }
  }, [date]);

  if (dateWithTimezone == null || coords == null) {
    return null;
  }
  return (
    <Root>
      <DateControl date={dateWithTimezone} {...coords} onChange={handleChange} />
    </Root>
  );
};

const localTimezoneOffset = new Date().getTimezoneOffset();

const getDateWithTimezone = (date: Date, timezone: string) => {
  const timezoneOffset = (localTimezoneOffset + Number(timezone) * 60) * 60 * 1000;
  return new Date(date.getTime() + timezoneOffset);
};

const recoverDateFromTimezone = (date: Date, timezone: string) => {
  const timezoneOffset = (localTimezoneOffset + Number(timezone) * 60) * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset);
};
