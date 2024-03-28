import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { FC, memo } from "react";

import { LayersRenderer } from "../prototypes/layers";
import { AppFrame, LoadingScreen } from "../prototypes/ui-components";
import { AutoRotateCamera } from "../prototypes/view/containers/AutoRotateCamera";
import { Environments } from "../prototypes/view/containers/Environments";
import { HighlightedAreas } from "../prototypes/view/containers/HighlightedAreas";
import { KeyBindings } from "../prototypes/view/containers/KeyBindings";
import { PedestrianTool } from "../prototypes/view/containers/PedestrianTool";
import { ReverseGeocoding } from "../prototypes/view/containers/ReverseGeocoding";
import { ScreenSpaceCamera } from "../prototypes/view/containers/ScreenSpaceCamera";
import { ScreenSpaceSelection } from "../prototypes/view/containers/ScreenSpaceSelection";
import { SelectionCoordinator } from "../prototypes/view/containers/SelectionCoordinator";
import { SketchTool } from "../prototypes/view/containers/SketchTool";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { readyAtom } from "../prototypes/view/states/app";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { FileDrop } from "../prototypes/view/ui-containers/FileDrop";
import { Notifications } from "../prototypes/view/ui-containers/Notifications";
import { WidgetContext } from "../shared/context/WidgetContext";
import { CameraPosition } from "../shared/reearth/types";
import { WidgetProps } from "../shared/types/widget";
import { PLATEAUVIEW_TOOLBAR_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";
import { InitialLayers } from "../shared/view/containers/InitialLayers";
import JapanPlateauPolygon from "../shared/view/containers/JapanPlateauPolygon";
import FeedBack from "../shared/view/ui-container/Feedback";
import Help from "../shared/view/ui-container/Help";
import MyData from "../shared/view/ui-container/MyData";
import { layerComponents } from "../shared/view-layers/layerComponents";

import { InitializeApp } from "./containers/InitializeApp";
import { useAttachScreenSpaceSelection } from "./hooks/useAttachScreenSpaceSelection";
import { useSelectSketchFeature } from "./hooks/useSelectSketchFeature";

type DefaultProps = {
  geoURL?: string;
  gsiTileURL?: string;
  arURL?: string;
  plateauURL?: string;
  plateauAccessToken?: string;
  catalogURL?: string;
  catalogURLForAdmin?: string;
  projectName?: string;
  googleStreetViewAPIKey?: string;
  geojsonURL?: string;
};

type OptionalProps = {
  cityName?: string;
  primaryColor?: string;
  logo?: string;
  pedestrian?: CameraPosition;
  siteUrl?: string;
};

type Props = WidgetProps<DefaultProps, OptionalProps>;

export const Loading: FC = () => {
  const ready = useAtomValue(readyAtom);
  return <AnimatePresence>{!ready && <LoadingScreen />}</AnimatePresence>;
};

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget, inEditor }) {
  useAttachScreenSpaceSelection();
  useSelectSketchFeature();

  return (
    <div id={PLATEAUVIEW_TOOLBAR_DOM_ID}>
      <WidgetContext
        inEditor={inEditor}
        plateauUrl={widget.property.default.plateauURL}
        projectId={widget.property.default.projectName}
        plateauToken={widget.property.default.plateauAccessToken}
        catalogUrl={widget.property.default.catalogURL}
        catalogURLForAdmin={widget.property.default.catalogURLForAdmin}
        geoUrl={widget.property.default.geoURL}
        gsiTileURL={widget.property.default.gsiTileURL}
        googleStreetViewAPIKey={widget.property.default.googleStreetViewAPIKey}
        geojsonURL={widget.property.default.geojsonURL}
        cityName={widget.property.optional?.cityName}
        customPrimaryColor={widget.property.optional?.primaryColor}
        customLogo={widget.property.optional?.logo}
        customPedestrian={widget.property.optional?.pedestrian}
        customSiteUrl={widget.property.optional?.siteUrl}>
        <InitializeApp />
        <AppFrame header={<AppHeader arURL={widget.property.default.arURL} />} />
        {/* TODO(ReEarth): Support initial layer loading(Splash screen) */}
        <Loading />
        {/* <Suspense>
        <SuspendUntilTilesLoaded
          initialTileCount={35}
          remainingTileCount={30}
          onComplete={handleTilesLoadComplete}> */}
        <LayersRenderer components={layerComponents} />
        {/* </SuspendUntilTilesLoaded>
      </Suspense> */}
        <Environments />
        <ToolMachineEvents />
        <Notifications />
        <InitialLayers />
        <JapanPlateauPolygon />
        <SelectionCoordinator />
        <KeyBindings />
        <ScreenSpaceSelection />
        <FileDrop />
        <ScreenSpaceCamera tiltByRightButton />
        <HighlightedAreas />
        <ReverseGeocoding />
        <PedestrianTool />
        <SketchTool />
        <MyData />
        <Help />
        <AutoRotateCamera />
        <FeedBack />
      </WidgetContext>
    </div>
  );
});
