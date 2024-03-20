import { PLATEAU_API_URL, PROJECT_ID, USE_LOCAL_STORAGE } from "../constants";

import { MOCK_SHARED_DATA } from "./mock";

let shareId: string | undefined;
export const getShareId = () => {
  if (shareId) return shareId;
  shareId = new URLSearchParams(window.location.search).get("share") || undefined;
  return shareId;
};

// Initialize stores for the share feature.
export let SHARED_STORE: Promise<Record<string, any>> = new Promise(r => setTimeout(r, Infinity));

// TODO(ReEarth): Support share feature

export const fetchShare = () => {
  const shareId = getShareId();
  if (!shareId) {
    SHARED_STORE = Promise.resolve({});
    return;
  }
  // For testing
  if (shareId === "test" && import.meta.env.DEV) {
    SHARED_STORE = new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_SHARED_DATA);
      }, 3000);
    });
    return;
  }
  SHARED_STORE = fetch(`${PLATEAU_API_URL}/share/${PROJECT_ID}/${shareId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then(r => r.json());
};

const STORAGE_PREFIX = "PLATEAUVIEW3_STORAGE";
const makeStorageKey = (k: string) => `${STORAGE_PREFIX}_${k}`;

export const getSharedStoreValue = async <T>(k: string): Promise<T | undefined> => {
  return SHARED_STORE.then(r => r[k]);
};
export const getStorageStoreValue = <T>(k: string): T | undefined =>
  USE_LOCAL_STORAGE()
    ? JSON.parse(window.localStorage.getItem(makeStorageKey(k)) ?? "null")
    : undefined;

export const setSharedStoreValue = async <T>(k: string, v: T) => {
  SHARED_STORE.then(r => (r[k] = v));
};
export const setStorageStoreValue = <T>(k: string, v: T) =>
  window.localStorage.setItem(makeStorageKey(k), JSON.stringify(v ?? null));
