import { type FC } from "react";
import invariant from "tiny-invariant";

import { Scene, SceneProps } from "../../../shared/reearth/scene";

export const GooglePhotorealisticEnvironment: FC<SceneProps> = ({ tileLabels, ...props }) => {
  invariant(
    process.env.NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY != null,
    "Missing environment variable: NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY",
  );
  return (
    <>
      <Scene showGlobe={false} shadowDarkness={0.7} tileLabels={tileLabels} {...props} />
      {/* TODO(ReEarth): Support Google photorealistic */}
      {/* <GooglePhotorealisticTileset apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY} /> */}
    </>
  );
};
