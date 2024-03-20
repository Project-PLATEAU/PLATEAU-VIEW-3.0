import { useRef, useEffect, useCallback } from "react";

type ViewClickAwayListenerProps = {
  children?: React.ReactNode;
  onClickAway?: () => void;
};
export const PLATEAUVIEW_TOOLBAR_DOM_ID = "__plateauview_toolbar__";
export const PLATEAUVIEW_SEARCH_DOM_ID = "__plateauview_search__";
export const PLATEAUVIEW_INSPECTOR_DOM_ID = "__plateauview_inspector__";

export const ViewClickAwayListener: React.FC<ViewClickAwayListenerProps> = ({
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
    return window.addEventListener("click", handleClickAway);
  }, [handleClickAway]);

  useEffect(() => {
    return document
      .getElementById(PLATEAUVIEW_TOOLBAR_DOM_ID)
      ?.addEventListener("click", handleClickAway);
  }, [handleClickAway]);

  useEffect(() => {
    return document
      .getElementById(PLATEAUVIEW_SEARCH_DOM_ID)
      ?.addEventListener("click", handleClickAway);
  }, [handleClickAway]);

  useEffect(() => {
    return document
      .getElementById(PLATEAUVIEW_INSPECTOR_DOM_ID)
      ?.addEventListener("click", handleClickAway);
  }, [handleClickAway]);

  return <div ref={ref}>{children}</div>;
};
