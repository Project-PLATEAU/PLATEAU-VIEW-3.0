import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { pickUpFeature, updateCompassBias, updateFov } from "./ar";
import { compassBiasAtom, fovPiOverAtom, cesiumLoadedAtom, arStartedAtom } from "./components/prototypes/view/states/ar";

export default function AROverlayView({...props}) {
  // const cesiumLoaded = useAtomValue(cesiumLoadedAtom);
  // const [selectedFeature, setSelectedFeature] = useAtom(selectedFeatureAtom);
  // useEffect(() => {
  //   if (!cesiumLoaded) { return; }
  //   console.log('cesiumLoaded:', cesiumLoaded);
  //   // ar.jsからFeatureをクリックした際のpropertiesを取得
  //   const handlePickedFeature = (pickedFeature) => {
  //     console.log('pickedFeature updated:', pickedFeature);
  //     //setSelectedFeature(pickedFeature);
  //   };
  //   pickUpFeature(handlePickedFeature);
  // }, [cesiumLoaded]);

  // UIのステート変更を監視してVMに反映
  const arStarted = useAtomValue(arStartedAtom);
  const compassBias = useAtomValue(compassBiasAtom);
  const fovPiOver = useAtomValue(fovPiOverAtom);
  useEffect(() => {
    if (!arStarted) { return; }
    console.log("compass bias (UI): ", compassBias);
    updateCompassBias(compassBias);
  }, [compassBias]);
  useEffect(() => {
    if (!arStarted) { return; }
    console.log("fov pi over (UI): ", fovPiOver);
    updateFov(fovPiOver);
  }, [fovPiOver]);

  return <div {...props}>AROverlayView</div>;
}
