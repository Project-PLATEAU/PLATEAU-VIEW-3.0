import { List, type ListProps } from "@mui/material";
import { useAtomValue } from "jotai";
import { type FC } from "react";

import { type ImageIconSet } from "../datasets";

import { ImageIconSetListItem } from "./ImageIconSetListItem";

export interface ImageIconSetListProps extends ListProps {
  imageIconsAtom: ImageIconSet["imageIconAtomsAtom"];
  onChange?: () => void;
}

export const ImageIconSetList: FC<ImageIconSetListProps> = ({
  imageIconsAtom,
  onChange,
  ...props
}) => {
  const imageIconAtoms = useAtomValue(imageIconsAtom);
  return (
    <List disablePadding {...props}>
      {imageIconAtoms.map((imageIconAtom, i) => (
        <ImageIconSetListItem
          key={i.toString()}
          imageIconAtom={imageIconAtom}
          onChange={onChange}
        />
      ))}
    </List>
  );
};
