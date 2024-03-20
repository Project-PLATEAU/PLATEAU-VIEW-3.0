// Note: this component does not follow the pattern of the other parameterItem components.
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { styled, IconButton, Select, Typography, SelectChangeEvent } from "@mui/material";
import { PrimitiveAtom, useAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SelectItem } from "../../prototypes/ui-components/SelectItem";

import TimelineBar from "./TimelineBar";

type TimelineParameterItemProps = {
  id: string;
  start?: string;
  current?: string;
  end?: string;
  timezone?: string;
  activeIdAtom: PrimitiveAtom<string>;
  onPlay?: (props: { start: Date; stop: Date; current: Date; speed: number }) => void;
  onPlayReverse?: (props: { start: Date; stop: Date; current: Date; speed: number }) => void;
  onPause?: () => void;
  onJump?: (props: { start: Date; stop: Date; current: Date }) => void;
  onSetSpeed?: (speed: number) => void;
  onTickEventAdd?: (callback: (date: Date) => void) => void;
  onTickEventRemove?: (callback: (date: Date) => void) => void;
};

const Timeline = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 8,
  "*": {
    boxSizing: "border-box",
  },
}));

const Controls = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

const ButtonsWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ButtonWrapper = styled("div")(() => ({
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledButton = styled(IconButton)<{ active?: number }>(({ active, theme }) => ({
  minWidth: "unset",
  padding: "0",
  width: 36,
  height: 36,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
}));

const SelectWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 0),
}));

const CurrentTime = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 32,
  color: theme.palette.text.secondary,
  fontSize: theme.typography.body2.fontSize,
}));

const speedOptions = [
  {
    value: 60,
    label: "1分 / 秒",
  },
  {
    value: 1800,
    label: "30分 / 秒",
  },
  {
    value: 3600,
    label: "1時間 / 秒",
  },
  {
    value: 36000,
    label: "10時間 / 秒",
  },
];

export const TimelineParameterItem: FC<TimelineParameterItemProps> = ({
  id,
  start,
  current,
  end,
  timezone = "+9",
  activeIdAtom,
  onPlay,
  onPlayReverse,
  onPause,
  onJump,
  onSetSpeed,
  onTickEventAdd,
  onTickEventRemove,
}) => {
  const startDate = useMemo(() => new Date(start ?? ""), [start]);
  const endDate = useMemo(() => new Date(end ?? ""), [end]);
  const [currentDate, setCurrentDate] = useState(new Date(current ?? ""));

  useEffect(() => {
    setCurrentDate(new Date(current ?? ""));
  }, [current]);

  const [activeTimelineComponentId, setActiveTimelineComponentId] = useAtom(activeIdAtom);

  const isActive = useRef(false);
  const [playState, setPlayState] = useState<"play" | "pause" | "reverse" | undefined>(undefined);

  const [speed, setSpeed] = useState(speedOptions[0].value);

  const handleSpeedChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      setSpeed(Number(event.target.value));
      if (playState === "play" || playState === "reverse") {
        onSetSpeed?.((playState === "reverse" ? -1 : 1) * Number(event.target.value));
      }
    },
    [playState, onSetSpeed],
  );

  const handlePlay = useCallback(() => {
    setActiveTimelineComponentId(id);
    if (currentDate >= endDate) return;
    setPlayState("play");
    isActive.current = true;
    onPlay?.({
      start: startDate,
      stop: endDate,
      current: currentDate,
      speed,
    });
  }, [startDate, endDate, currentDate, speed, id, onPlay, setActiveTimelineComponentId]);

  const handlePause = useCallback(() => {
    setActiveTimelineComponentId(id);
    setPlayState("pause");
    isActive.current = true;
    onPause?.();
  }, [id, onPause, setActiveTimelineComponentId]);

  const handlePlayReverse = useCallback(() => {
    setActiveTimelineComponentId(id);
    if (currentDate <= startDate) return;
    setPlayState("reverse");
    isActive.current = true;
    onPlayReverse?.({
      start: startDate,
      stop: endDate,
      current: currentDate,
      speed,
    });
  }, [startDate, endDate, currentDate, speed, id, onPlayReverse, setActiveTimelineComponentId]);

  const handleJumpTime = useCallback(
    (_: Event, value: number | number[]) => {
      if (typeof value === "number") {
        setActiveTimelineComponentId(id);
        setPlayState("pause");
        isActive.current = true;
        onJump?.({
          start: startDate,
          stop: endDate,
          current: new Date(value),
        });
      }
    },
    [id, startDate, endDate, onJump, setActiveTimelineComponentId],
  );

  const stateRef = useRef({ endDate, startDate, playState, handlePause });
  stateRef.current = { endDate, startDate, playState, handlePause };

  const onTick = useCallback((current: Date) => {
    if (isActive.current) {
      setCurrentDate(current);
      if (
        (current >= stateRef.current.endDate && stateRef.current.playState === "play") ||
        (current <= stateRef.current.startDate && stateRef.current.playState === "reverse")
      ) {
        stateRef.current.handlePause();
      }
    }
  }, []);

  useEffect(() => {
    onTickEventAdd?.(onTick);
    return () => {
      if (isActive.current) {
        setActiveTimelineComponentId("");
        onPause?.();
      }
      onTickEventRemove?.(onTick);
    };
  }, [onTick, onPause, onTickEventAdd, onTickEventRemove, setActiveTimelineComponentId]);

  useEffect(() => {
    isActive.current = activeTimelineComponentId === id;
    if (!isActive.current) {
      setPlayState("pause");
    }
  }, [activeTimelineComponentId, id]);

  return (
    <Timeline>
      <Controls>
        <ButtonsWrapper>
          <ButtonWrapper>
            <StyledButton
              size="small"
              onClick={handlePlayReverse}
              active={playState === "reverse" ? 1 : 0}>
              <PlayArrowIcon fontSize="medium" style={{ transform: "rotate(180deg)" }} />
            </StyledButton>
          </ButtonWrapper>
          <ButtonWrapper>
            <StyledButton size="small" onClick={handlePause}>
              <PauseIcon fontSize="medium" />
            </StyledButton>
          </ButtonWrapper>
          <ButtonWrapper>
            <StyledButton size="small" onClick={handlePlay} active={playState === "play" ? 1 : 0}>
              <PlayArrowIcon fontSize="medium" />
            </StyledButton>
          </ButtonWrapper>
        </ButtonsWrapper>
        <SelectWrapper>
          <Select size="small" variant="filled" value={speed} onChange={handleSpeedChange}>
            {speedOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <Typography variant="body2">{option.label}</Typography>
              </SelectItem>
            ))}
          </Select>
        </SelectWrapper>
      </Controls>
      <TimelineBar
        startDate={startDate}
        endDate={endDate}
        currentDate={currentDate}
        timezone={timezone}
        onChange={handleJumpTime}
      />
      <CurrentTime>{formatDateWithTimezone(currentDate, timezone)}</CurrentTime>
    </Timeline>
  );
};

const localTimezoneOffset = new Date().getTimezoneOffset();

const formatDateWithTimezone = (date: Date, timezone: string) => {
  const timezoneOffset = (localTimezoneOffset + Number(timezone) * 60) * 60 * 1000;
  const dateWithTimezone = new Date(date.getTime() + timezoneOffset);

  const yyyy = dateWithTimezone.getFullYear();
  const mm = dateWithTimezone.getMonth() + 1;
  const dd = dateWithTimezone.getDate();
  const HH = dateWithTimezone.getHours();
  const MM = dateWithTimezone.getMinutes();
  const SS = dateWithTimezone.getSeconds();

  return `${yyyy}年${mm < 10 ? "0" + mm : mm}月${dd < 10 ? "0" + dd : dd}日 ${
    HH < 10 ? "0" + HH : HH
  }:${MM < 10 ? "0" + MM : MM}:${SS < 10 ? "0" + SS : SS} (UTC${timezone})`;
};
