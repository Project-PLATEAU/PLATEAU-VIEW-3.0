export const getView2ID = (obj: object) => {
  return "view2ID" in obj && typeof obj.view2ID === "string" ? obj.view2ID : undefined;
};

export const setView2ID = (target: object, source: object) => {
  if (!("id" in source)) return;
  (target as any).view2ID = source.id;
};
