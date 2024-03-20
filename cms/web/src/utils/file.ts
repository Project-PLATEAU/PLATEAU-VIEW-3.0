export const getExtension = (filename?: string) => {
  if (!filename?.includes(".")) return "";

  return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1, filename.length);
};
