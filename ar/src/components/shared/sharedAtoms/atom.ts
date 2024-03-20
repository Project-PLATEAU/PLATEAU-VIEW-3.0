import { WritableAtom, atom } from "jotai";
import { omit } from "lodash-es";

import {
  getSharedStoreValue,
  getStorageStoreValue,
  setSharedStoreValue,
  setStorageStoreValue,
} from "./store";

export type AtomValue<V> = { name: string; value: V };

type SharedAtom<V> = WritableAtom<
  AtomValue<V>,
  [update: (value: V, name: string) => Promise<V>],
  Promise<void>
>;

export const sharedAtom = <V>(name: string, initialValue: V): SharedAtom<V> => {
  const a = atom<AtomValue<V>>({ name, value: initialValue });
  const wrapped = atom(
    get => get(a),
    async (get, set, update: (value: V, name: string) => Promise<V>) => {
      const { value } = get(a);
      const result = await update(value, name);
      set(a, { name, value: result });
    },
  );
  return wrapped;
};

export const sharedAtomValue = <V>(a: SharedAtom<V>) => {
  return atom(
    get => get(a).value,
    (_get, set, update: V) => {
      set(a, async () => update);
    },
  );
};

// For the share feature
export const sharedStoreAtom = <V>(a: SharedAtom<V>, shouldInitialize = true) => {
  const w = atom(
    get => get(a),
    async (_get, set, update: (value: V, name: string) => Promise<V>) => {
      set(a, async (v, n) => {
        setSharedStoreValue(n, await update(v, n));
        return await update(v, n);
      });
    },
  );
  w.onMount = set => {
    if (!shouldInitialize) return;
    // Use an existence value, if storaged value is exist.
    set(async (v, n) => {
      const storageValue = getStorageStoreValue<V>(n);
      return storageValue ? storageValue : (await getSharedStoreValue<V>(n)) ?? v;
    });
  };
  return w;
};

export const sharedStoreAtomWrapper = <V, A extends unknown[], S>(
  name: string,
  a: WritableAtom<V, A, S>,
  shouldInitialize = true,
) => {
  const w = atom(
    get => get(a),
    (_get, set, ...args: A) => {
      setSharedStoreValue(name, args);
      set(a, ...args);
    },
  );
  w.onMount = set => {
    if (!shouldInitialize) return;
    getSharedStoreValue<A>(name).then(v => {
      if (v) {
        set(...v);
      }
    });
  };
  return w;
};

// For the UI setting
export const storageStoreAtom = <V>(
  a: SharedAtom<V>,
  omitProperyNames?: string[],
  shouldInitialize = true,
) => {
  const wrapped = atom(
    get => get(a),
    async (_get, set, update: (value: V, name: string) => Promise<V>) => {
      set(a, async (v, n) => {
        const result = await update(v, n);
        setStorageStoreValue(
          n,
          typeof result === "object" && omitProperyNames ? omit(result, omitProperyNames) : result,
        );
        return result;
      });
    },
  );
  wrapped.onMount = set => {
    if (!shouldInitialize) return;
    set(async (v, n) => getStorageStoreValue(n) ?? v);
  };
  return wrapped;
};

export const storageStoreAtomWrapper = <V, A extends unknown[], S>(
  name: string,
  a: WritableAtom<V, A, S>,
  shouldInitialize = true,
) => {
  const w = atom(
    get => get(a),
    (_get, set, ...args: A) => {
      setStorageStoreValue(name, args);
      set(a, ...args);
    },
  );
  w.onMount = set => {
    if (!shouldInitialize) return;
    const v = getStorageStoreValue<A>(name);
    if (v) {
      set(...v);
    }
  };
  return w;
};
