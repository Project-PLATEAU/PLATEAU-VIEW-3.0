import styled from "@emotion/styled";

export const Spacer = styled("div")<{
  hidden?: boolean;
  width: number;
  height?: number;
}>(({ hidden = false, width, height = "auto" }) => ({
  minWidth: width,
  minHeight: height,
  ...(hidden && { visibility: "hidden" }),
}));
