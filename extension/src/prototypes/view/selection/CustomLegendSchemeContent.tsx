import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC } from "react";
import invariant from "tiny-invariant";

import { makeCustomLegendSchemeAtomForComponent } from "../../../shared/view/state/customLegendSchemeForComponent";
import { InspectorHeader } from "../../ui-components";
import { CustomLegendIconSetList } from "../../ui-components/CustomLegendIconSetList";
import { CustomLegendSetIcon } from "../../ui-components/CustomLegendSetIcon";
import { customLegendSchemeSelectionAtom, LayerCustomLegendScheme } from "../../view-layers";
import { CUSTOM_LEGEND_SCHEME_SELECTION, type SelectionGroup } from "../states/selection";

const CustomLegendIconContent: FC<{
  customLegendScheme: Extract<LayerCustomLegendScheme, { type: "customLegend" }>;
  onClose?: () => void;
}> = ({ customLegendScheme, onClose }) => {
  const customLegends = useAtomValue(
    useMemo(() => atom(get => get(customLegendScheme.customLegendsAtom)), [customLegendScheme]),
  );

  return (
    <List disablePadding>
      <InspectorHeader
        title={customLegendScheme.name}
        icon={<CustomLegendSetIcon customLegends={customLegends} />}
        onClose={onClose}
      />
      <Divider />
      <ListItem>
        <ListItemText>
          <CustomLegendIconSetList customLegendsAtom={customLegendScheme.customLegendAtomsAtom} />
        </ListItemText>
      </ListItem>
    </List>
  );
};

export interface CustomLegendSchemeContentProps {
  values: (SelectionGroup & {
    type: typeof CUSTOM_LEGEND_SCHEME_SELECTION;
  })["values"];
}

export const CustomLegendSchemeContent: FC<CustomLegendSchemeContentProps> = ({ values }) => {
  invariant(values.length > 0);

  // TODO: Support multiple layers
  const layer = values[0];

  const setSelection = useSetAtom(customLegendSchemeSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const customLegendScheme = useAtomValue(
    useMemo(() => makeCustomLegendSchemeAtomForComponent([layer]), [layer]),
  );

  switch (customLegendScheme?.type) {
    case "customLegend":
      return (
        <CustomLegendIconContent customLegendScheme={customLegendScheme} onClose={handleClose} />
      );
  }
  return null;
};
