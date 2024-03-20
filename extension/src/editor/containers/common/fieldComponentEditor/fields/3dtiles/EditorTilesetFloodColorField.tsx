import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, ReactElement, useMemo, useState } from "react";

import { BasicFieldProps } from "..";
import { generateID } from "../../../../../../shared/utils/id";
import {
  PropertyBox,
  PropertyCard,
  PropertyInputField,
  PropertyColorField,
  PropertyButton,
  PropertyWrapper,
  PropertyLineWrapper,
} from "../../../../ui-components";
import { useNumberFieldState } from "../../hooksUtils";

type TilesetFloodColorFieldPresetCondition = {
  id: string;
  rank?: number;
  color?: string;
  legendName?: string;
};

export type TilesetFloodColorFieldPreset = {
  conditions?: TilesetFloodColorFieldPresetCondition[];
};

export const EditorTilesetFloodColorField = ({
  component,
  onUpdate,
}: BasicFieldProps<"TILESET_FLOOD_COLOR_FIELD">): ReactElement | null => {
  const [movingId, setMovingId] = useState<string>();

  const conditions = useMemo(() => component.preset?.conditions ?? [], [component]);
  const handleConditionCreate = useCallback(() => {
    const newCondition = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        conditions: [...(conditions ?? []), newCondition],
      },
    });
  }, [component, conditions, onUpdate]);

  const handleConditionUpdate = useCallback(
    (condition: TilesetFloodColorFieldPresetCondition) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: conditions?.map(c => (c.id === condition.id ? condition : c)),
        },
      });
    },
    [component, conditions, onUpdate],
  );

  const handleConditionMove = useCallback(
    (id: string, direction: "up" | "down") => {
      if (!conditions) return;
      const index = conditions?.findIndex(c => c.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= conditions.length) return;
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      newConditions.splice(newIndex, 0, conditions[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: newConditions,
        },
      });
    },
    [component, onUpdate, conditions],
  );

  const handleConditionRemove = useCallback(
    (id: string) => {
      if (!conditions) return;
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          conditions: conditions?.filter(c => c.id !== id),
        },
      });
    },
    [component, conditions, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox>
        {component.preset?.conditions?.map((condition, index) => (
          <PropertyCard
            key={condition.id}
            id={condition.id}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === conditions.length - 1}
            onMove={handleConditionMove}
            onRemove={handleConditionRemove}
            mainPanel={
              <ConditionMainPanel condition={condition} onConditionUpdate={handleConditionUpdate} />
            }
            legendPanel={
              <ConditionLegendPanel
                condition={condition}
                onConditionUpdate={handleConditionUpdate}
              />
            }
          />
        ))}
        <PropertyButton onClick={handleConditionCreate}>
          <AddOutlinedIcon /> Rank
        </PropertyButton>
      </PropertyBox>
    </PropertyWrapper>
  );
};

type ConditionPanelProps = {
  condition: TilesetFloodColorFieldPresetCondition;
  onConditionUpdate: (condition: TilesetFloodColorFieldPresetCondition) => void;
};

const ConditionMainPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handleColorChange = useCallback(
    (color: string) => {
      onConditionUpdate({
        ...condition,
        color,
      });
    },
    [condition, onConditionUpdate],
  );

  const [value, handleRankChange] = useNumberFieldState(condition.rank, rank => {
    onConditionUpdate({
      ...condition,
      rank,
    });
  });

  return (
    <>
      <PropertyLineWrapper>
        Rank
        <PropertyInputField value={value} onChange={handleRankChange} />
      </PropertyLineWrapper>
      <PropertyColorField value={condition.color} onChange={handleColorChange} />
    </>
  );
};

const ConditionLegendPanel: React.FC<ConditionPanelProps> = ({ condition, onConditionUpdate }) => {
  const handleLegendNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConditionUpdate({
        ...condition,
        legendName: e.target.value,
      });
    },
    [condition, onConditionUpdate],
  );

  return (
    <PropertyInputField
      placeholder="Legend Name"
      value={condition.legendName ?? ""}
      onChange={handleLegendNameChange}
    />
  );
};
