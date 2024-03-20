import { useRef, useEffect, useCallback } from "react";

import { PLATEAUVIEW_EDITOR_DOM_ID } from "..";

type EditorClickAwayListenerProps = {
  children?: React.ReactNode;
  onClickAway?: () => void;
};

export const EditorClickAwayListener: React.FC<EditorClickAwayListenerProps> = ({
  children,
  onClickAway,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickAway = useCallback(
    (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) {
        return;
      }
      onClickAway?.();
    },
    [onClickAway],
  );

  useEffect(() => {
    window.addEventListener("click", handleClickAway);
    return () => {
      window.removeEventListener("click", handleClickAway);
    };
  }, [handleClickAway]);

  useEffect(() => {
    document.getElementById(PLATEAUVIEW_EDITOR_DOM_ID)?.addEventListener("click", handleClickAway);
    return () => {
      document
        .getElementById(PLATEAUVIEW_EDITOR_DOM_ID)
        ?.removeEventListener("click", handleClickAway);
    };
  }, [handleClickAway]);
  return <div ref={ref}>{children}</div>;
};
