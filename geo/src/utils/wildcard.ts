export const wildCardToRegExp = (v: string) => {
  return v.includes("*") ? new RegExp(`^${v.replaceAll("*", ".+")}$`) : v;
};
