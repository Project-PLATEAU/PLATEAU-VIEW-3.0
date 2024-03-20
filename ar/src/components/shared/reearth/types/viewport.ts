export type ViewportSize = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
};

export type Viewport = ViewportSize & {
  readonly query: Record<string, string>;
};
