import { useCallback, useEffect, useRef } from "react";

import { useConstant, useWindowEvent } from "../../react-helpers";

const directions = ["forward", "backward", "right", "left", "up", "down"] as const;

type Direction = (typeof directions)[number];

function isDirection(value: unknown): value is Direction {
  return directions.includes(value as Direction);
}

const modes = ["sprint"] as const;

type Mode = (typeof modes)[number];

function isMode(value: unknown): value is Mode {
  return modes.includes(value as Mode);
}

type KeyAssignments = Record<string, Direction | Mode>;

const defaultKeyAssignments: KeyAssignments = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "up",
  ControlLeft: "down",
  ShiftLeft: "sprint",
};

type KeyboardHandlersProps = {
  isMoving: boolean;
};

export const KeyboardHandlers = ({ isMoving }: KeyboardHandlersProps) => {
  const directionsRef = useRef<{
    [key: string]: boolean;
  }>({});

  const modesRef = useRef<{
    sprint?: boolean;
  }>({});

  const keyRef = useRef<string | null>(null);

  const acceleration = 0.1;
  const damping = 0.3;
  const maximumSpeed = 3;

  const state = useConstant(() => ({
    time: Date.now(),
    speed: 0,
  }));

  const checkOnKeyboard = useCallback(() => {
    const previousTime = state.time;
    const currentTime = Date.now();
    const deltaSeconds = (currentTime - previousTime) / 1000;
    const flags = modesRef.current;
    state.time = currentTime;

    const camera = window.reearth?.camera;
    const globeHeight = window.reearth?.scene?.getGlobeHeight();
    if (!camera || !globeHeight) return;
    if (flags.sprint === true) {
      state.speed = Math.min(maximumSpeed * 2, state.speed + acceleration);
    } else if (state.speed > 1) {
      state.speed = Math.max(maximumSpeed, state.speed - damping);
    } else {
      state.speed = Math.min(maximumSpeed, state.speed + acceleration);
    }

    const cameraHeight = camera?.position?.height;
    let speed = state.speed;

    let amount = 1;
    if (globeHeight != null && cameraHeight != null) {
      speed *= 1 + Math.max(0, cameraHeight - globeHeight) * 0.1;
      amount = speed * deltaSeconds;
    }
    if (!amount) return;

    if (directionsRef.current["forward"]) camera.moveForward(amount);
    if (directionsRef.current["backward"]) camera.moveBackward(amount);
    if (directionsRef.current["left"]) camera.moveLeft(amount);
    if (directionsRef.current["right"]) camera.moveRight(amount);
    if (directionsRef.current["up"]) camera.moveUp(amount);
    if (directionsRef.current["down"]) camera.moveDown(amount);
  }, [state]);

  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      checkOnKeyboard();
      if (isMoving) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (isMoving) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [checkOnKeyboard, isMoving]);

  useWindowEvent("keydown", event => {
    const assignment = defaultKeyAssignments[event.code];
    if (assignment == null) return;

    if (isDirection(assignment)) {
      directionsRef.current[assignment] = true;
      if (keyRef.current === null) keyRef.current = assignment;
      event.preventDefault();
    } else if (isMode(assignment)) {
      modesRef.current[assignment] = true;
      event.preventDefault();
    }
  });

  useWindowEvent("keyup", event => {
    const assignment = defaultKeyAssignments[event.code];
    if (assignment == null) return;

    if (isDirection(assignment)) {
      directionsRef.current[assignment] = false;
      if (assignment === keyRef.current) keyRef.current = null;
      event.preventDefault();
    } else if (isMode(assignment)) {
      modesRef.current[assignment] = false;
      event.preventDefault();
    }
  });

  useWindowEvent("blur", () => {
    directionsRef.current = {};
    modesRef.current = {};
    keyRef.current = null;
  });

  return null;
};
