import { useCallback, useEffect, useRef, useState } from "react";

export const useFrame = (cb: () => void) => {
  const [shouldStart, setShouldStart] = useState(false);
  const isCanceled = useRef(false);
  isCanceled.current = !shouldStart;

  useEffect(() => {
    let timer: number;
    const animate = () => {
      if (isCanceled.current) return;
      cb();
      timer = requestAnimationFrame(animate);
    };
    if (shouldStart) timer = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(timer);
  }, [cb, shouldStart]);

  const start = useCallback(() => {
    setShouldStart(true);
  }, []);
  const stop = useCallback(() => {
    setShouldStart(false);
  }, []);

  return { start, stop };
};
