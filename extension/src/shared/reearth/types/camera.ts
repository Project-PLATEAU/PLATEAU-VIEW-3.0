import { LngLatHeight } from "./value";

export type Camera = {
  /** Current camera position */
  readonly position: CameraPosition | undefined;
  //   readonly viewport: Rect | undefined;
  readonly zoomIn: (amount: number, options?: CameraOptions) => void;
  readonly zoomOut: (amount: number, options?: CameraOptions) => void;
  /** Moves the camera position to the specified destination. */
  readonly flyTo: (destination: string | FlyToDestination, options?: CameraOptions) => void;
  readonly flyToBBox: (
    bbox: [number, number, number, number],
    options?: CameraOptions & { heading?: number; pitch?: number; range?: number },
  ) => void;
  readonly rotateOnCenter: (radian: number) => void;
  readonly overrideScreenSpaceController: (options?: ScreenSpaceCameraControllerOptions) => void;
  readonly rollCameraHorizontal: () => void;

  /** Moves the camera position to look at the specified destination. */
  readonly lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  /** Rotate the camera around the center of earth. */
  readonly rotateRight: (radian: number) => void;
  /** Move the angle of camera around the center of earth. */
  readonly orbit: (radian: number) => void;
  readonly enableScreenSpaceController: (enabled: boolean) => void;
  readonly lookHorizontal: (amount: number) => void;
  readonly lookVertical: (amount: number) => void;
  readonly moveForward: (amount: number) => void;
  readonly moveBackward: (amount: number) => void;
  readonly moveUp: (amount: number) => void;
  readonly moveDown: (amount: number) => void;
  readonly moveLeft: (amount: number) => void;
  readonly moveRight: (amount: number) => void;
  readonly moveOverTerrain: (offset?: number) => void;
  readonly flyToGround: (
    destination: FlyToDestination,
    options?: CameraOptions,
    offset?: number,
  ) => void;
  readonly getFovInfo: (options: { withTerrain?: boolean; calcViewSize?: boolean }) =>
    | {
        center?: LngLatHeight;
        viewSize?: number;
      }
    | undefined;
  readonly setView: (camera: CameraPosition) => void;
  readonly forceHorizontalRoll: (enable: boolean) => void;
};

export type FlyToDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  roll?: number;
  /** Radian */
  fov?: number;
};

export type LookAtDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  range?: number;
  /** Radian */
  fov?: number;
  /** Meters */
  radius?: number;
};

/** Represents the camera position and state */
export type CameraPosition = {
  /** degrees */
  lat?: number;
  /** degrees */
  lng?: number;
  /** meters */
  height?: number;
  /** radians */
  heading?: number;
  /** radians */
  pitch?: number;
  /** radians */
  roll?: number;
  /** Field of view expressed in radians */
  fov?: number;
  /** Aspect ratio of frustum */
  aspectRatio?: number;
};

export type CameraOptions = {
  /** Seconds */
  duration?: number;
  easing?: (time: number) => number;
  withoutAnimation?: boolean;
};

export type Position2d = [x: number, y: number];
export type Position3d = [x: number, y: number, z: number];

type CameraEventType = "left_drag" | "right_drag" | "middle_drag" | "wheel" | "pinch";
type KeyboardEventModifier = "ctrl" | "shift" | "alt";

export type ScreenSpaceCameraControllerOptions = {
  zoomEventTypes?: (CameraEventType | ModifiedCameraEventType)[];
  rotateEventTypes?: (CameraEventType | ModifiedCameraEventType)[];
  tiltEventTypes?: (CameraEventType | ModifiedCameraEventType)[];
  lookEventTypes?: (CameraEventType | ModifiedCameraEventType)[];
  minimumZoomDistance?: number;
  maximumZoomDistance?: number;
  enableCollisionDetection?: boolean;
};

type ModifiedCameraEventType = {
  eventType: CameraEventType;
  modifier: KeyboardEventModifier;
};
