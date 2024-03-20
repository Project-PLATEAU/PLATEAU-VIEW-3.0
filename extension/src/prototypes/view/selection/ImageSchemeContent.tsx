import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC } from "react";
import invariant from "tiny-invariant";

import { makeImageSchemeAtomForComponent } from "../../../shared/view/state/imageSchemaForComponent";
import { InspectorHeader } from "../../ui-components";
import { ImageIconSetIcon } from "../../ui-components/ImageIconSetIcon";
import { ImageIconSetList } from "../../ui-components/ImageIconSetList";
import { imageSchemeSelectionAtom, type LayerImageScheme } from "../../view-layers";
import { type IMAGE_SCHEME_SELECTION, type SelectionGroup } from "../states/selection";

const ImageIconContent: FC<{
  imageScheme: Extract<LayerImageScheme, { type: "imageIcon" }>;
  onClose?: () => void;
}> = ({ imageScheme, onClose }) => {
  const imageIcons = useAtomValue(
    useMemo(() => atom(get => get(imageScheme.imageIconsAtom)), [imageScheme]),
  );

  return (
    <List disablePadding>
      <InspectorHeader
        title={imageScheme.name}
        icon={<ImageIconSetIcon imageIcons={imageIcons} />}
        onClose={onClose}
      />
      <Divider />
      <ListItem>
        <ListItemText>
          <ImageIconSetList imageIconsAtom={imageScheme.imageIconAtomsAtom} />
        </ListItemText>
      </ListItem>
    </List>
  );
};

export interface ImageSchemeContentProps {
  values: (SelectionGroup & {
    type: typeof IMAGE_SCHEME_SELECTION;
  })["values"];
}

export const ImageSchemeContent: FC<ImageSchemeContentProps> = ({ values }) => {
  invariant(values.length > 0);

  // TODO: Support multiple layers
  const layer = values[0];

  const setSelection = useSetAtom(imageSchemeSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const imageScheme = useAtomValue(
    useMemo(() => makeImageSchemeAtomForComponent([layer]), [layer]),
  );

  switch (imageScheme?.type) {
    case "imageIcon":
      return <ImageIconContent imageScheme={imageScheme} onClose={handleClose} />;
  }
  return null;
};
