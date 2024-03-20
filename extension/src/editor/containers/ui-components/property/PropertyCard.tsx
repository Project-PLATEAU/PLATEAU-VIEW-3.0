import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import SettingsIcon from "@mui/icons-material/Settings";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { styled, svgIconClasses } from "@mui/material";
import { MouseEventHandler, useCallback, useMemo, useState } from "react";

type PropertyCardProps = {
  id: string;
  selected?: boolean;
  movingId?: string;
  moveUpDisabled?: boolean;
  moveDownDisabled?: boolean;
  noMove?: boolean;
  noRemove?: boolean;
  mainPanel: React.ReactNode;
  layerPanel?: React.ReactNode;
  legendPanel?: React.ReactNode;
  onMove?: (id: string, direction: "up" | "down") => void;
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
};

type PropertyCardTabs = "main" | "layer" | "legend";

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  selected,
  movingId,
  moveUpDisabled,
  moveDownDisabled,
  noMove,
  noRemove,
  mainPanel,
  layerPanel,
  legendPanel,
  onMove,
  onSelect,
  onRemove,
}) => {
  const handleSelect = useCallback(() => {
    onSelect?.(id);
  }, [id, onSelect]);

  const handleRemove: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      e.stopPropagation();
      onRemove?.(id);
    },
    [id, onRemove],
  );

  const handleMoveUp: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      e.stopPropagation();
      onMove?.(id, "up");
    },
    [id, onMove],
  );

  const handleMoveDown: MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      e.stopPropagation();
      onMove?.(id, "down");
    },
    [id, onMove],
  );

  const moving = useMemo(() => movingId === id, [movingId, id]);

  const [currentTab, setCurrentTab] = useState<PropertyCardTabs>("main");
  const handleSetTabMain: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.stopPropagation();
    setCurrentTab("main");
  }, []);
  const handleSetTabLayer: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.stopPropagation();
    setCurrentTab("layer");
  }, []);
  const handleSetTabLegend: MouseEventHandler<HTMLDivElement> = useCallback(e => {
    e.stopPropagation();
    setCurrentTab("legend");
  }, []);

  return (
    <StyledPropertyCard selected={selected ? 1 : 0} moving={moving ? 1 : 0}>
      <CardHeader onClick={handleSelect}>
        <CardIconButtonWrapper>
          <StyledIconButton active={currentTab === "main"} onClick={handleSetTabMain}>
            <SettingsIcon />
          </StyledIconButton>
          {legendPanel && (
            <StyledIconButton active={currentTab === "legend"} onClick={handleSetTabLegend}>
              <WidgetsIcon />
            </StyledIconButton>
          )}
          {layerPanel && (
            <StyledIconButton active={currentTab === "layer"} onClick={handleSetTabLayer}>
              <LayersIcon />
            </StyledIconButton>
          )}
        </CardIconButtonWrapper>
        <CardIconButtonWrapper>
          {!noMove && (
            <StyledIconButton disabled={moveUpDisabled ? 1 : 0} onClick={handleMoveUp}>
              <ArrowUpwardOutlinedIcon />
            </StyledIconButton>
          )}
          {!noMove && (
            <StyledIconButton disabled={moveDownDisabled ? 1 : 0} onClick={handleMoveDown}>
              <ArrowDownwardOutlinedIcon />
            </StyledIconButton>
          )}
          {!noRemove && (
            <StyledIconButton onClick={handleRemove}>
              <DeleteOutlinedIcon />
            </StyledIconButton>
          )}
        </CardIconButtonWrapper>
      </CardHeader>
      <CardConent>
        {mainPanel && currentTab === "main" && <CardPanel>{mainPanel}</CardPanel>}
        {layerPanel && currentTab === "layer" && <CardPanel>{layerPanel}</CardPanel>}
        {legendPanel && currentTab === "legend" && <CardPanel>{legendPanel}</CardPanel>}
      </CardConent>
    </StyledPropertyCard>
  );
};

const StyledPropertyCard = styled("div")<{ selected?: number; moving?: number }>(
  ({ selected, moving, theme }) => ({
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${selected ? theme.palette.primary.main : "transparent"}`,
    boxShadow: moving ? `0 0 10px ${theme.palette.info.main}` : theme.shadows[1],
    transition: moving ? "none" : "box-shadow 0.75s ease-out",
  }),
);

const CardHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(0, 0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CardIconButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.1),
}));

const StyledIconButton = styled("div")<{ disabled?: number; active?: boolean }>(
  ({ disabled, active, theme }) => ({
    width: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    cursor: "pointer",
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",

    [`.${svgIconClasses.root}`]: {
      fontSize: "12px",
    },
  }),
);

const CardConent = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const CardPanel = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(0.5),
  gap: theme.spacing(0.5),
}));
