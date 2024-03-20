import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { styled } from "@mui/material";
import { useCallback } from "react";

import { EmphasisProperty } from "../../../../shared/api/types";
import { generateID } from "../../../../shared/utils/id";
import { EditorButton } from "../../ui-components";

import { EmphasisPropertyHeader } from "./EmphasisPropertyHeader";
import { EmphasisPropertyItem } from "./EmphasisPropertyItem";

type EmphasisPropertyEditorProps = {
  id: string;
  properties: EmphasisProperty[];
  onPropertiesUpdate: (properties: EmphasisProperty[]) => void;
};

export const EmphasisPropertyEditor: React.FC<EmphasisPropertyEditorProps> = ({
  properties,
  onPropertiesUpdate,
}) => {
  const handlePropertyAdd = useCallback(() => {
    onPropertiesUpdate([
      ...properties,
      {
        id: generateID(),
        displayName: "",
        jsonPath: "",
        visible: true,
        process: "",
      },
    ]);
  }, [properties, onPropertiesUpdate]);

  const handlePropertyUpdate = useCallback(
    (property: EmphasisProperty) => {
      onPropertiesUpdate?.(
        properties.map(p => {
          if (p.id === property.id) return property;
          return p;
        }),
      );
    },
    [properties, onPropertiesUpdate],
  );

  const handlePropertyRemove = useCallback(
    (propertyId: string) => {
      onPropertiesUpdate?.(properties.filter(p => p.id !== propertyId));
    },
    [properties, onPropertiesUpdate],
  );

  const handlePropertyMove = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragProperty = properties[dragIndex];
      const newProperties = [...properties];
      newProperties.splice(dragIndex, 1);
      newProperties.splice(hoverIndex, 0, dragProperty);
      onPropertiesUpdate?.(newProperties);
    },
    [properties, onPropertiesUpdate],
  );

  return (
    <EmphasisPropertyEditorWrapper>
      {properties?.length > 0 && (
        <>
          <EmphasisPropertyHeader />
          <PropertyListWrapper>
            {properties.map((p, index) => (
              <EmphasisPropertyItem
                id={p.id}
                key={p.id}
                index={index}
                propertyItem={p}
                onPropertyUpdate={handlePropertyUpdate}
                onPropertyRemove={handlePropertyRemove}
                onPropertyMove={handlePropertyMove}
              />
            ))}
          </PropertyListWrapper>
        </>
      )}
      <EditorButton variant="contained" fullWidth onClick={handlePropertyAdd}>
        <AddOutlinedIcon />
        Add Property
      </EditorButton>
    </EmphasisPropertyEditorWrapper>
  );
};

const EmphasisPropertyEditorWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const PropertyListWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0.5, 0, 1),
}));
