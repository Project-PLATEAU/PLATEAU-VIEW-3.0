import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import { styled, List, ListItemButton, svgIconClasses } from "@mui/material";
import { useCallback, useState, useMemo, useEffect } from "react";

import {
  FieldComponentTree,
  FieldComponentTreeItem,
} from "../../common/fieldComponentEditor/fields";

type ComponentSelectorProps = {
  tree: FieldComponentTree;
  existFieldGroups?: string[];
  existFields?: string[];
  onComponentSelect?: (type: string) => void;
  onComponentDoubleClick?: () => void;
};

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  tree,
  existFieldGroups,
  existFields,
  onComponentSelect,
  onComponentDoubleClick,
}) => {
  const [selectedCategory, selectCategory] = useState<FieldComponentTreeItem>(tree[0]);
  const [selectedGroupOrField, selectGroupOrField] = useState<FieldComponentTreeItem>();
  const [selectedField, selectField] = useState<FieldComponentTreeItem>();

  const handleCategoryClick = useCallback((category: FieldComponentTreeItem) => {
    selectCategory(category);
    selectGroupOrField(undefined);
    selectField(undefined);
  }, []);

  const handleFieldOrGroupClick = useCallback((fieldOrGroup: FieldComponentTreeItem) => {
    selectGroupOrField(fieldOrGroup);
    selectField(undefined);
  }, []);

  const handleFieldClick = useCallback((field: FieldComponentTreeItem) => {
    selectField(field);
  }, []);

  const handleDoubleClick = useCallback(
    (fieldOrGroup: FieldComponentTreeItem) => {
      if (!fieldOrGroup.isFolder) {
        onComponentDoubleClick?.();
      }
    },
    [onComponentDoubleClick],
  );

  const fieldOrGroups = useMemo(
    () => tree.find(c => c.value === selectedCategory.value)?.children,
    [tree, selectedCategory],
  );

  const fields = useMemo(
    () =>
      tree
        .find(c => c.value === selectedCategory.value)
        ?.children?.find(g => g.value === selectedGroupOrField?.value)?.children,
    [tree, selectedCategory, selectedGroupOrField],
  );

  useEffect(() => {
    onComponentSelect?.(
      selectedField
        ? selectedField.value
        : selectedGroupOrField && !selectedGroupOrField.isFolder
        ? selectedGroupOrField.value
        : "",
    );
  }, [selectedField, selectedGroupOrField, onComponentSelect]);

  return (
    <Wrapper>
      <StyledMenuList>
        {tree.map(category => (
          <StyledListItemButton
            key={category.value}
            onClick={() => handleCategoryClick(category)}
            selected={category.value === selectedCategory.value}>
            {category.isFolder && (
              <StyledIcon>
                <ArrowRightOutlinedIcon />
              </StyledIcon>
            )}
            {category.label}
          </StyledListItemButton>
        ))}
      </StyledMenuList>
      <StyledList>
        {fieldOrGroups?.map(fieldOrGroup => (
          <StyledListItemButton
            key={fieldOrGroup.value}
            onClick={() => handleFieldOrGroupClick(fieldOrGroup)}
            onDoubleClick={() => handleDoubleClick(fieldOrGroup)}
            selected={fieldOrGroup.value === selectedGroupOrField?.value}
            disabled={
              existFields?.includes(fieldOrGroup.value) ||
              !!(fieldOrGroup.group && existFieldGroups?.includes(fieldOrGroup.group))
            }>
            <StyledIcon>
              {fieldOrGroup.isFolder ? (
                <ArrowRightOutlinedIcon />
              ) : existFields?.includes(fieldOrGroup.value) ? (
                <RadioButtonCheckedOutlinedIcon />
              ) : (
                <RadioButtonUncheckedOutlinedIcon />
              )}
            </StyledIcon>
            {fieldOrGroup.label}
          </StyledListItemButton>
        ))}
      </StyledList>
      <StyledList>
        {fields?.map(field => (
          <StyledListItemButton
            key={field.value}
            onClick={() => handleFieldClick(field)}
            onDoubleClick={() => handleDoubleClick(field)}
            selected={field.value === selectedField?.value}
            disabled={
              existFields?.includes(field.value) ||
              !!(field.group && existFieldGroups?.includes(field.group))
            }>
            <StyledIcon>
              {existFields?.includes(field.value) ? (
                <RadioButtonCheckedOutlinedIcon />
              ) : (
                <RadioButtonUncheckedOutlinedIcon />
              )}
            </StyledIcon>
            {field.label}
          </StyledListItemButton>
        ))}
      </StyledList>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(0.5),
  flex: 1,
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

const StyledMenuList = styled(StyledList)(() => ({
  flex: 0.623,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.body2.fontSize,
  borderRadius: theme.shape.borderRadius,
  flexGrow: 0,
  height: "28px",
  display: "flex",
  alignItems: "center",

  [`&.Mui-selected, &.Mui-selected:hover`]: {
    color: "#fff",
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledIcon = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(0.5),

  [`.${svgIconClasses.root}`]: {
    width: "16px",
  },
}));
