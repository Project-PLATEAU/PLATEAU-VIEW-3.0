import { useMemo } from "react";

import { EXPERIMENTAL_clipping } from "../../reearth/types";
import { TilesetDrawClippingField } from "../../types/fieldComponents/3dtiles";

export const useDrawClipping = (
  component: TilesetDrawClippingField | undefined,
): EXPERIMENTAL_clipping | undefined => {
  const drawClippingProps: EXPERIMENTAL_clipping | undefined = useMemo(
    () =>
      component?.value
        ? ({
            draw: {
              enabled: component?.value.enabled,
              surfacePoints: component?.value.drawGeometryCoordinates?.map(c => ({
                lng: c[0],
                lat: c[1],
              })),
              direction: component?.value.direction,
              visible: component?.value.visible,
              top: component?.value.top,
              bottom: component?.value.bottom,
              style: {
                fill: true,
                fillColor: "#00BEBE11",
                stroke: true,
                strokeColor: "#00BEBE",
                strokeWidth: 1,
              },
            },
          } as EXPERIMENTAL_clipping)
        : undefined,
    [component?.value],
  );

  return drawClippingProps;
};
