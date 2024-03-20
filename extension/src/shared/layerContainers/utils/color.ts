export const colorWithAlpha = (
  color: string | undefined,
  alpha: number | undefined,
): string | undefined => {
  if (!color || alpha === undefined || !color.startsWith("#")) return color;
  if (color.length === 7) {
    return (
      color +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  } else if (color.length === 9) {
    return (
      color.slice(0, 7) +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  } else if (color.length === 4 || color.length === 5) {
    return `#${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}${Math.round(
      alpha * 255,
    )
      .toString(16)
      .padStart(2, "0")}`;
  }
  return color;
};
