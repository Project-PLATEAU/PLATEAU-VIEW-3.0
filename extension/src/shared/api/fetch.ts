export const fetchWithGet = async <V>(url: string, token?: string): Promise<V> => {
  return await window
    .fetch(url, {
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithPost = async <D>(url: string, data: D, token?: string): Promise<D> => {
  return await window
    .fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithPatch = async <D>(url: string, data: D, token?: string): Promise<D> => {
  return await window
    .fetch(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(toJSON);
};

export const fetchWithDelete = async (url: string, token?: string): Promise<boolean> => {
  return await window
    .fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    })
    .then(checkStatusCode);
};

const toJSON = (response: Response) => {
  return response.json();
};

const checkStatusCode = (response: Response) => {
  return response.ok;
};
