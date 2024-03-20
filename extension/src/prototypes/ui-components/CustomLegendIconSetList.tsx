import { List, type ListProps } from "@mui/material";
import { useAtomValue } from "jotai";
import { type FC } from "react";

import { CustomLegendSet } from "../datasets";

import { CustomLegendIconSetListItem } from "./CustomLegendIconSetListItem";

export interface CustomLegendIconSetListProps extends ListProps {
  customLegendsAtom: CustomLegendSet["customLegendAtomsAtom"];
  onChange?: () => void;
}

export const CustomLegendIconSetList: FC<CustomLegendIconSetListProps> = ({
  customLegendsAtom,
  onChange,
  ...props
}) => {
  const customLegendAtoms = useAtomValue(customLegendsAtom);
  return (
    <List disablePadding {...props}>
      {customLegendAtoms.map((customLegendAtom, i) => (
        <CustomLegendIconSetListItem
          key={i.toString()}
          customLegendAtom={customLegendAtom}
          onChange={onChange}
        />
      ))}
    </List>
  );
};
