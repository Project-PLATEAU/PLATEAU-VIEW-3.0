import { default as colorMapCividis } from "./colorMaps/cividis";
import { default as colorMapCrest } from "./colorMaps/crest";
import { default as colorMapFlare } from "./colorMaps/flare";
import { default as colorMapIcefire } from "./colorMaps/icefire";
import { default as colorMapInferno } from "./colorMaps/inferno";
import { default as colorMapMagma } from "./colorMaps/magma";
import { default as colorMapMako } from "./colorMaps/mako";
import { default as colorMapPlasma } from "./colorMaps/plasma";
import { default as colorMapPlateau } from "./colorMaps/plateau";
import { default as colorMapRocket } from "./colorMaps/rocket";
import { default as colorMapTurbo } from "./colorMaps/turbo";
import { default as colorMapViridis } from "./colorMaps/viridis";
import { default as colorMapVlag } from "./colorMaps/vlag";

export * from "./ColorMap";
export * from "./types";

export { default as colorMapCividis } from "./colorMaps/cividis";
export { default as colorMapCrest } from "./colorMaps/crest";
export { default as colorMapFlare } from "./colorMaps/flare";
export { default as colorMapIcefire } from "./colorMaps/icefire";
export { default as colorMapInferno } from "./colorMaps/inferno";
export { default as colorMapMagma } from "./colorMaps/magma";
export { default as colorMapMako } from "./colorMaps/mako";
export { default as colorMapPlasma } from "./colorMaps/plasma";
export { default as colorMapPlateau } from "./colorMaps/plateau";
export { default as colorMapRocket } from "./colorMaps/rocket";
export { default as colorMapTurbo } from "./colorMaps/turbo";
export { default as colorMapViridis } from "./colorMaps/viridis";
export { default as colorMapVlag } from "./colorMaps/vlag";

export const createColorMapFromType = (colorMapName: string) => {
  switch (colorMapName) {
    case colorMapCividis.name:
      return colorMapCividis;
    case colorMapCrest.name:
      return colorMapCrest;
    case colorMapFlare.name:
      return colorMapFlare;
    case colorMapIcefire.name:
      return colorMapIcefire;
    case colorMapInferno.name:
      return colorMapInferno;
    case colorMapMagma.name:
      return colorMapMagma;
    case colorMapMako.name:
      return colorMapMako;
    case colorMapPlasma.name:
      return colorMapPlasma;
    case colorMapPlateau.name:
      return colorMapPlateau;
    case colorMapRocket.name:
      return colorMapRocket;
    case colorMapTurbo.name:
      return colorMapTurbo;
    case colorMapViridis.name:
      return colorMapViridis;
    case colorMapVlag.name:
      return colorMapVlag;
  }
};
