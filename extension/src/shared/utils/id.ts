export const generateID = () => {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
};
