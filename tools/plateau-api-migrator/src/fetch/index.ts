import { env } from "../env";
import { Data as View2Data, Template as View2Template, RawDataCatalogItem } from "../types/view2";
import { Setting as View3Setting, Template as View3Template } from "../types/view3";

import { fetchWithDelete, fetchWithGet, fetchWithPatch, fetchWithPost } from "./base";

const handleError = <T>(obj: T) => {
  if (!obj) return [];
  if (typeof obj === "object" && "error" in obj) return [];
  if (!Array.isArray(obj)) return [];
  return obj;
};

export const fetchView2Data = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View2Data[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW2}/data`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView2Template = async () => {
  const e = env();
  return handleError(
    await fetchWithGet<View2Template[]>(
      `${e.PLATEAU_SIDEBAR_API}/${e.PLATEAU_API_PROJECT_NAME_VIEW2}/templates`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView2Datacatalog = async () => {
  const e = env();
  return handleError(await fetchWithGet<RawDataCatalogItem[]>(e.PLATEAU_DATACATALOG_API_VIEW2));
};

export const fetchView3Data = async () => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  return handleError(
    await fetchWithGet<View3Setting[]>(
      `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

export const fetchView3Template = async () => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  return handleError(
    await fetchWithGet<View3Template[]>(
      `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates`,
      e.PLATEAU_SIDEBAR_API_TOKEN,
    ),
  );
};

const wait = (n: number) => new Promise(resolve => setTimeout(resolve, n));

export const postView3Data = async (data: View3Setting[]) => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  const threashold = e.CONVERT_TARGET === "dev" ? 50 : 500;

  const pendings = [];
  for (const d of data) {
    if (pendings.length >= threashold) {
      await Promise.all(pendings);
      await wait(1);
      pendings.length = 0;
    }

    if (d.id) {
      pendings.push(
        fetchWithPatch<View3Setting>(
          `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data/${d.id}`,
          d,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        ),
      );
    }
    pendings.push(
      fetchWithPost<View3Setting>(
        `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data`,
        d,
        e.PLATEAU_SIDEBAR_API_TOKEN,
      ),
    );
  }

  await Promise.all(pendings);
};

export const postView3Template = async (templates: View3Template[]) => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  const threashold = e.CONVERT_TARGET === "dev" ? 50 : 500;

  const pendings = [];
  for (const t of templates) {
    if (pendings.length >= threashold) {
      await Promise.all(pendings);
      await wait(1);
      pendings.length = 0;
    }

    if (t.id) {
      pendings.push(
        fetchWithPatch<View3Template>(
          `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates/${t.id}`,
          t,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        ),
      );
    }
    pendings.push(
      fetchWithPost<View3Template>(
        `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates`,
        t,
        e.PLATEAU_SIDEBAR_API_TOKEN,
      ),
    );
  }

  await Promise.all(pendings);
};

export const dengerDeleteAllData = async (data: View3Setting[]) => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  const threashold = e.CONVERT_TARGET === "dev" ? 50 : 500;

  const pendings = [];
  for (const d of data) {
    if (pendings.length >= threashold) {
      await Promise.all(pendings);
      await wait(1);
      pendings.length = 0;
    }

    if (d.id) {
      pendings.push(
        fetchWithDelete(
          `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/data/${d.id}`,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        ),
      );
    }
  }

  await Promise.all(pendings);
};

export const dengerDeleteAllTemplate = async (templates: View3Template[]) => {
  const e = env();
  const api = e.CONVERT_TARGET === "dev" ? e.PLATEAU_SIDEBAR_DEV_API : e.PLATEAU_SIDEBAR_API;
  const threashold = e.CONVERT_TARGET === "dev" ? 50 : 500;

  const pendings = [];
  for (const t of templates) {
    if (pendings.length >= threashold) {
      await Promise.all(pendings);
      await wait(1);
      pendings.length = 0;
    }

    if (t.id) {
      pendings.push(
        fetchWithDelete(
          `${api}/${e.PLATEAU_API_PROJECT_NAME_VIEW3}/templates/${t.id}`,
          e.PLATEAU_SIDEBAR_API_TOKEN,
        ),
      );
    }
  }

  await Promise.all(pendings);
};
