import { Atom, PrimitiveAtom, SetStateAction, atom, useAtomValue } from "jotai";
import { isFunction } from "lodash-es";
import { useMemo } from "react";

export const useOptionalAtom = <V>(valueAtom: Atom<V> | undefined) => {
  return useMemo(() => {
    return atom(get => {
      if (!valueAtom) {
        return;
      }
      return get(valueAtom);
    });
  }, [valueAtom]);
};

export const useOptionalAtomValue = <V>(valueAtom: Atom<V> | undefined) => {
  const result = useOptionalAtom(valueAtom);
  return useAtomValue(result);
};

export const useOptionalPrimitiveAtom = <V>(valueAtom: PrimitiveAtom<V> | undefined) => {
  return useMemo(() => {
    return atom(
      get => {
        if (!valueAtom) {
          return;
        }
        return get(valueAtom);
      },
      (get, set, action: SetStateAction<V>) => {
        if (!valueAtom) return;
        const update = isFunction(action) ? action(get(valueAtom)) : action;
        set(valueAtom, update);
      },
    );
  }, [valueAtom]);
};
