export type Clock = {
  startTime?: Date;
  stopTime?: Date;
  currentTime?: Date;
  playing?: boolean;
  paused?: boolean;
  /** Speed of time. Specifies a multiplier for the speed of time in reality. Default is 1. */
  speed?: number;
  stepType?: "rate" | "fixed";
  rangeType?: "unbounded" | "clamped" | "bounced";
  readonly tick?: () => Date | void;
  readonly play?: () => void;
  readonly pause?: () => void;
  readonly setTime?: (time: {
    start: Date | string;
    stop: Date | string;
    current: Date | string;
  }) => void;
  readonly setSpeed?: (speed: number) => void;
  readonly setRangeType?: (rangeType: "unbounded" | "clamped" | "bounced") => void;
  readonly setStepType?: (stepType: "rate" | "fixed") => void;
};
