import { atom, type PrimitiveAtom } from "jotai";
import { splitAtom } from "jotai/utils";

import { type SplitAtom } from "../type-helpers";

export interface ImageIcon {
  id?: string;
  value: string | number;
  imageUrl: string;
  imageColor?: string;
  name: string;
}

export interface ImageIconSet {
  type: "imageIcon";
  name: string;
  imageIconsAtom: PrimitiveAtom<ImageIcon[]>;
  imageIconAtomsAtom: SplitAtom<ImageIcon>;
}

export interface ImageIconSetOptions {
  name: string;
  imageIcons: readonly ImageIcon[];
}

export function atomsWithImageIconSet({ name, imageIcons }: ImageIconSetOptions): ImageIconSet {
  const imageIconsAtom = atom([...imageIcons]);
  const imageIconAtomsAtom = splitAtom(imageIconsAtom);
  return {
    type: "imageIcon",
    name,
    imageIconsAtom,
    imageIconAtomsAtom,
  };
}
