import fetch, { Response } from "node-fetch";

export const fetchWithGet = async <D>(url: string, token?: string): Promise<D> => {
  return (await fetch(url, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }).then(toJSON)) as Promise<D>;
};

export const fetchWithPost = async <D>(url: string, data: D, token?: string): Promise<D> => {
  return (await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }).then(toJSON)) as Promise<D>;
};

export const fetchWithPatch = async <D>(url: string, data: D, token?: string): Promise<D> => {
  return (await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }).then(toJSON)) as Promise<D>;
};

export const fetchWithDelete = async (url: string, token?: string): Promise<boolean> => {
  return (await fetch(url, {
    method: "DELETE",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }).then(checkStatusCode)) as unknown as Promise<boolean>;
};

const toJSON = (response: Response) => {
  return response.json();
};

const checkStatusCode = (response: Response) => {
  return response.ok;
};
