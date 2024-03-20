import { styled } from "@mui/material";
import { motion, useMotionValue } from "framer-motion";
import { forwardRef, useRef, type ComponentPropsWithRef, useEffect, useMemo } from "react";
import { mergeRefs } from "react-merge-refs";

import { XYZ } from "../../shared/reearth/types";

const Root = styled(motion.div)({
  position: "absolute",
  pointerEvents: "none",
});

export interface ScreenSpaceElementProps extends ComponentPropsWithRef<typeof Root> {
  position?: XYZ;
  trigger?: any;
}

export const ScreenSpaceElement = forwardRef<HTMLDivElement, ScreenSpaceElementProps>(
  ({ position: positionProps, children, trigger, ...props }, forwardedRef) => {
    const motionTransform = useMotionValue("");
    const motionDisplay = useMotionValue("none");
    const position = useMemo(
      () =>
        positionProps
          ? ([positionProps.x, positionProps.y, positionProps.z] as [
              x: number,
              y: number,
              z: number,
            ])
          : undefined,
      [positionProps],
    );

    const motionTransformRef = useRef(motionTransform);
    motionTransformRef.current = motionTransform;
    const motionDisplayRef = useRef(motionDisplay);
    motionDisplayRef.current = motionDisplay;

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (ref.current == null || !position) {
        return;
      }
      const windowPosition = { x: 0, y: 0 };
      try {
        [windowPosition.x, windowPosition.y] = window.reearth?.scene?.toWindowPosition(
          position,
        ) ?? [0, 0];
      } catch (error) {
        motionDisplayRef.current.set("none");
        return;
      }
      if (
        windowPosition == null ||
        windowPosition.x < 0 ||
        windowPosition.y < 0 ||
        windowPosition.x > window.innerWidth ||
        windowPosition.y > window.innerHeight ||
        !window.reearth?.scene?.isPositionVisible?.(position)
      ) {
        motionDisplayRef.current.set("none");
        return;
      }
      const x = `calc(${windowPosition.x}px - 50%)`;
      const y = `calc(${windowPosition.y}px - 50%)`;
      motionTransformRef.current.set(`translate(${x}, ${y})`);
      motionDisplayRef.current.set("block");
    }, [position, trigger]);

    return (
      <Root
        ref={mergeRefs([ref, forwardedRef])}
        {...props}
        style={{
          ...props.style,
          transform: motionTransform,
          display: motionDisplay,
        }}>
        {children}
      </Root>
    );
  },
);
