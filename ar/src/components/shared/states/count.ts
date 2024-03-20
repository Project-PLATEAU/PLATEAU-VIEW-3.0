import { sharedAtom, storageStoreAtom } from "../sharedAtoms";

const countAtomPrimitive = sharedAtom("count", 0);
export const countAtom = storageStoreAtom(countAtomPrimitive);
