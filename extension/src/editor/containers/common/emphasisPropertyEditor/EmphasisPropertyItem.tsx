import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { styled, svgIconClasses } from "@mui/material";
import { useCallback } from "react";

import { EmphasisProperty } from "../../../../shared/api/types";
import { PropertyInputField } from "../../ui-components";

import useDnD from "./useDnD";

type EmphasisPropertyItemProps = {
  id: string;
  index: number;
  propertyItem: EmphasisProperty;
  onPropertyUpdate: (property: EmphasisProperty) => void;
  onPropertyRemove: (propertyId: string) => void;
  onPropertyMove: (dragIndex: number, hoverIndex: number) => void;
};

export const EmphasisPropertyItem: React.FC<EmphasisPropertyItemProps> = ({
  id,
  index,
  propertyItem,
  onPropertyUpdate,
  onPropertyRemove,
  onPropertyMove,
}) => {
  const { dragRef, previewRef, isDragging, handlerId } = useDnD({
    id,
    index,
    onMove: onPropertyMove,
  });

  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPropertyUpdate({ ...propertyItem, displayName: e.target.value });
    },
    [propertyItem, onPropertyUpdate],
  );

  const handleJsonPathChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPropertyUpdate({ ...propertyItem, jsonPath: e.target.value });
    },
    [propertyItem, onPropertyUpdate],
  );

  const handleProcessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPropertyUpdate({ ...propertyItem, process: e.target.value });
    },
    [propertyItem, onPropertyUpdate],
  );

  const handleVisibleChange = useCallback(() => {
    onPropertyUpdate({ ...propertyItem, visible: !propertyItem.visible });
  }, [propertyItem, onPropertyUpdate]);

  const handleRemove = useCallback(() => {
    onPropertyRemove(propertyItem.id);
  }, [propertyItem, onPropertyRemove]);

  return (
    <PropertyItemWrapper
      ref={previewRef}
      data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0.2 : 1 }}>
      <IconWrapper ref={dragRef}>
        <DragIndicatorIcon />
      </IconWrapper>
      <VisibleWrapper onClick={handleVisibleChange}>
        {propertyItem.visible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
      </VisibleWrapper>
      <PathWrapper>
        <PropertyInputField
          value={propertyItem.jsonPath}
          fullWidth
          onChange={handleJsonPathChange}
        />
      </PathWrapper>
      <NameWrapper>
        <PropertyInputField
          value={propertyItem.displayName}
          fullWidth
          onChange={handleDisplayNameChange}
        />
      </NameWrapper>
      <ProcessWrapper>
        <PropertyInputField value={propertyItem.process} fullWidth onChange={handleProcessChange} />
      </ProcessWrapper>
      <IconWrapper onClick={handleRemove}>
        <DeleteOutlinedIcon />
      </IconWrapper>
    </PropertyItemWrapper>
  );
};

export const PropertyItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.2),
  padding: theme.spacing(0.2, 0),
}));

export const IconWrapper = styled("div")(({ theme }) => ({
  width: "20px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",

  [`.${svgIconClasses.root}`]: {
    width: "16px",
    color: theme.palette.text.secondary,
  },
}));

export const VisibleWrapper = styled(IconWrapper)(({ theme }) => ({
  marginRight: theme.spacing(0.3),
}));

export const NameWrapper = styled("div")(() => ({
  flex: 1,
}));

export const PathWrapper = styled("div")(() => ({
  flex: 1,
}));

export const ProcessWrapper = styled("div")(() => ({
  flex: 1,
}));
