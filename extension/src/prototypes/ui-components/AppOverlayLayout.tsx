import { styled, useMediaQuery, useTheme } from "@mui/material";
import { atom, type Atom, useSetAtom } from "jotai";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { createContext, memo, useEffect, useMemo, useRef, type FC, type ReactNode } from "react";
import invariant from "tiny-invariant";

import { DarkThemeOverride } from "./DarkThemeOverride";

const HEADER_HEIGHT = 81;

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "hidden",
})<{
  hidden?: boolean;
}>(({ hidden = false }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoFlow: "column",
  gridAutoColumns: "fit-content(0)",
  direction: "rtl",
  position: "absolute",
  inset: 0,
  top: 0,
  minHeight: HEADER_HEIGHT,
  pointerEvents: "none",
  "& > *": {
    direction: "ltr",
  },
  ...(hidden && { visibility: "hidden" }),
}));

const DeveloperColumn = styled("div")({
  minHeight: 0,
});

const DeveloperRoot = styled(OverlayScrollbarsComponent)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.default,
  pointerEvents: "auto",
}));

const Developer: FC<{ children?: ReactNode }> = props => (
  <DeveloperRoot
    options={{
      scrollbars: {
        autoHide: "scroll",
        theme: "os-theme-light",
      },
    }}
    defer
    {...props}
  />
);

const RootColumn = styled("div")(() => ({
  display: "grid",
  gridTemplateRows: "1fr",
  gridAutoFlow: "row",
  gridAutoRows: "fit-content(0)",
  minHeight: 0,
}));

const RootGrid = styled("div", {
  shouldForwardProp: prop => prop !== "spacing",
})<{ spacing?: number }>(() => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoFlow: "column",
  gridAutoColumns: "",
  // margin: theme.spacing(spacing),
  minHeight: 0,
}));

const SizeContainer = styled("div")({
  containerType: "size",
});

const MainContainer = styled("div", {
  shouldForwardProp: prop => prop !== "spacing" && prop !== "mainWidth" && prop !== "contextWidth",
})<{
  spacing?: number;
  mainWidth: number;
  contextWidth: number;
}>(({ theme, spacing = 0, mainWidth, contextWidth }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  [`@container (min-width: calc(${mainWidth + contextWidth}px + ${theme.spacing(spacing)}))`]: {
    flexDirection: "row",
    alignItems: "stretch",
  },
}));

const Main = styled("main", {
  shouldForwardProp: prop => prop !== "spacing" && prop !== "mainWidth" && prop !== "contextWidth",
})<{
  spacing?: number;
  mainWidth: number;
  contextWidth: number;
}>(({ theme, spacing = 0, mainWidth, contextWidth }) => ({
  flexBasis: "auto",
  flexShrink: 1,
  flexGrow: 0,
  width: mainWidth,
  // minHeight: 0,
  // marginRight: theme.spacing(spacing),
  [`@container (min-width: calc(${mainWidth + contextWidth}px + ${theme.spacing(spacing)}))`]: {
    flexBasis: mainWidth,
    flexShrink: 0,
  },
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
  },
}));

const Context = styled("aside", {
  shouldForwardProp: prop => prop !== "spacing" && prop !== "mainWidth" && prop !== "contextWidth",
})<{
  spacing?: number;
  mainWidth: number;
  contextWidth: number;
}>(({ theme, spacing = 0, mainWidth, contextWidth }) => ({
  position: "relative",
  display: "flex",
  flexGrow: 1,
  alignItems: "start",
  width: mainWidth,
  minWidth: 0,
  marginTop: theme.spacing(spacing),
  [`@container (min-width: calc(${mainWidth + contextWidth}px + ${theme.spacing(spacing)}))`]: {
    width: "auto",
    marginTop: 0,
  },
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
  },
}));

const BottomGrid = styled("div", {
  shouldForwardProp: prop => prop !== "spacing",
})<{ spacing?: number }>(({ theme, spacing = 0 }) => ({
  display: "grid",
  gridTemplateColumns: "fit-content(0) fit-content(0)",
  gridColumnGap: theme.spacing(spacing),
  alignItems: "end",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.default,
}));

const BottomLeftColumn = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
});

const BottomRightColumn = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "end",
});

export interface AppOverlayLayoutContextValue {
  maxMainHeightAtom: Atom<number>;
  gridHeightAtom: Atom<number>;
  searchHeaderHeight: number;
}

export const AppOverlayLayoutContext = createContext<AppOverlayLayoutContextValue>({
  maxMainHeightAtom: atom(0),
  gridHeightAtom: atom(0),
  searchHeaderHeight: 0,
});

export interface AppOverlayLayoutProps {
  hidden?: boolean;
  spacing?: number;
  mainWidth?: number;
  contextWidth?: number;
  main?: ReactNode;
  aside?: ReactNode;
  context?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
  developer?: ReactNode;
}

export const AppOverlayLayout: FC<AppOverlayLayoutProps> = memo(
  ({
    hidden = false,
    spacing = 1,
    mainWidth = 360,
    contextWidth = mainWidth,
    main,
    aside,
    context,
    bottomLeft,
    bottomRight,
    developer,
  }) => {
    const maxMainHeightAtom = useMemo(() => atom(0), []);
    const gridHeightAtom = useMemo(() => atom(0), []);
    const setMaxMainHeight = useSetAtom(maxMainHeightAtom);
    const setGridHeight = useSetAtom(gridHeightAtom);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

    const rootRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      invariant(rootRef.current != null);
      invariant(mainRef.current != null);
      setGridHeight(rootRef.current.getBoundingClientRect().height);
      setMaxMainHeight(mainRef.current.getBoundingClientRect().height * (isMobile ? 0.75 : 1));
      const observerForRoot = new ResizeObserver(([entry]) => {
        setGridHeight(entry.contentRect.height);
      });
      observerForRoot.observe(rootRef.current);
      const observerForMain = new ResizeObserver(([entry]) => {
        setMaxMainHeight(entry.contentRect.height * (isMobile ? 0.75 : 1));
      });
      observerForMain.observe(mainRef.current);
      return () => {
        observerForRoot.disconnect();
        observerForMain.disconnect();
      };
    }, [isMobile, setMaxMainHeight, setGridHeight]);

    const contextValue = useMemo(
      () => ({ maxMainHeightAtom, gridHeightAtom, searchHeaderHeight: HEADER_HEIGHT + 8 }),
      [maxMainHeightAtom, gridHeightAtom],
    );

    return (
      <AppOverlayLayoutContext.Provider value={contextValue}>
        <Root ref={rootRef} hidden={hidden}>
          <RootColumn>
            <RootGrid spacing={spacing}>
              <SizeContainer ref={mainRef}>
                <MainContainer spacing={spacing} mainWidth={mainWidth} contextWidth={contextWidth}>
                  <Main spacing={spacing} mainWidth={mainWidth} contextWidth={contextWidth}>
                    {main}
                  </Main>
                  <Context spacing={spacing} mainWidth={mainWidth} contextWidth={contextWidth}>
                    {context}
                  </Context>
                </MainContainer>
              </SizeContainer>
              {aside}
            </RootGrid>
            <DarkThemeOverride>
              <BottomGrid spacing={spacing}>
                <BottomLeftColumn>{bottomLeft}</BottomLeftColumn>
                <BottomRightColumn>{bottomRight}</BottomRightColumn>
              </BottomGrid>
            </DarkThemeOverride>
          </RootColumn>
          {developer != null && (
            <DeveloperColumn>
              <DarkThemeOverride>
                <Developer>{developer}</Developer>
              </DarkThemeOverride>
            </DeveloperColumn>
          )}
        </Root>
      </AppOverlayLayoutContext.Provider>
    );
  },
);
