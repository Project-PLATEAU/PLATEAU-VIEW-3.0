import { IconButton, Stack, styled, Tooltip } from "@mui/material";
import {
  useState,
  type FC,
  type MouseEventHandler,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { XYZ } from "../../shared/reearth/types";
import { LayerModelOverrides } from "../layers";
import { useForkEventHandler } from "../react-helpers";
import { STORY_LAYER } from "../view-layers";

import { EntityTitleButton, type EntityTitleButtonProps } from "./EntityTitleButton";
import { TrashSmallIcon } from "./icons/TrashSmallIcon";
import { VisibilityOffSmallIcon } from "./icons/VisibilityOffSmallIcon";
import { VisibilityOnSmallIcon } from "./icons/VisibilityOnSmallIcon";

import { AddressIcon } from "./index";

const StyledEntityTitleButton = styled(EntityTitleButton, {
  shouldForwardProp: props => props !== "layerType" && props !== "hasStoryCamera",
})(({ theme }) => ({
  paddingRight: theme.spacing(1),
}));

function stopPropagation(event: SyntheticEvent): void {
  event.stopPropagation();
}

interface HoverMenuProps {
  hovered?: boolean;
  hidden?: boolean;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
  onToggleHidden?: MouseEventHandler<HTMLButtonElement>;
  onMove?: () => void;
  boundingSphere?: XYZ | null;
  layerId?: string | null;
  layerType?: keyof LayerModelOverrides;
  hasStoryCamera?: boolean;
}

const HoverMenu: FC<HoverMenuProps> = ({
  hovered = false,
  hidden = false,
  onRemove,
  onToggleHidden,
  onMove,
  layerId,
  layerType,
  boundingSphere,
  hasStoryCamera,
}) => {
  const isButtonDisabled =
    layerId == null && boundingSphere == null && !(layerType === STORY_LAYER && hasStoryCamera);
  if (!hovered && !hidden) {
    return null;
  }

  return (
    <Stack direction="row" onMouseDown={stopPropagation}>
      {onMove && (
        <Tooltip title="移動">
          <span>
            <IconButton
              color="inherit"
              aria-label="移動"
              disabled={isButtonDisabled}
              onClick={onMove}>
              <AddressIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {(hovered || !hidden) && (
        <Tooltip title="削除">
          <IconButton color="inherit" aria-label="削除" onClick={onRemove}>
            <TrashSmallIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {layerType !== STORY_LAYER && (
        <Tooltip title={hidden ? "表示" : "隠す"}>
          <IconButton
            color="inherit"
            aria-label={hidden ? "表示" : "隠す"}
            onClick={onToggleHidden}>
            {hidden ? (
              <VisibilityOffSmallIcon fontSize="small" />
            ) : (
              <VisibilityOnSmallIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

export interface LayerListItemProps extends EntityTitleButtonProps, Omit<HoverMenuProps, "hidden"> {
  accessory?: ReactNode;
}

export const LayerListItem: FC<LayerListItemProps> = ({
  accessory,
  hidden = false,
  onRemove,
  onToggleHidden,
  onMouseEnter,
  onMouseLeave,
  onMove,
  layerId,
  layerType,
  boundingSphere,
  hasStoryCamera,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useForkEventHandler(onMouseEnter, () => {
    setHovered(true);
  });
  const handleMouseLeave = useForkEventHandler(onMouseLeave, () => {
    setHovered(false);
  });
  return (
    <StyledEntityTitleButton
      {...props}
      hidden={hidden}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <Stack direction="row" spacing={0.5}>
        <HoverMenu
          hovered={hovered}
          hidden={hidden}
          onRemove={onRemove}
          onToggleHidden={onToggleHidden}
          onMove={onMove}
          layerId={layerId}
          layerType={layerType}
          boundingSphere={boundingSphere}
          hasStoryCamera={hasStoryCamera}
        />
        {accessory}
      </Stack>
    </StyledEntityTitleButton>
  );
};
