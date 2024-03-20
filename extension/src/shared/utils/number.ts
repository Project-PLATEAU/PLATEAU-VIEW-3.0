export const roundFloat = (n: number, float = 1000) => {
  return Math.floor(n * float) / float;
};
