import { useCallback, useEffect, useState } from "react";

import { useCamera } from "../../../../shared/reearth/hooks";
import { CameraPosition } from "../../../../shared/reearth/types";

import { PropertyButton } from "./PropertyButton";
import { PropertyInputField } from "./PropertyInputField";
import { PropertyItemWrapper, PropertyLineWrapper } from "./PropertyWrapper";

type PropertyCameraInputProps = {
  value: CameraPosition | undefined;
  onChange?: (camera: CameraPosition) => void;
};

export const PropertyCameraInput: React.FC<PropertyCameraInputProps> = ({ value, onChange }) => {
  const [latitude, setLatitude] = useState<number | string>(value?.lat ?? "");
  const [longitude, setLongitude] = useState<number | string>(value?.lng ?? "");
  const [altitude, setAltitude] = useState<number | string>(value?.height ?? "");
  const [heading, setHeading] = useState<number | string>(value?.heading ?? "");
  const [pitch, setPitch] = useState<number | string>(value?.pitch ?? "");
  const [roll, setRoll] = useState<number | string>(value?.roll ?? "");
  const { getCameraPosition } = useCamera();

  useEffect(() => {
    onChange?.({
      lat: latitude === "" ? undefined : Number(latitude),
      lng: longitude === "" ? undefined : Number(longitude),
      height: altitude === "" ? undefined : Number(altitude),
      heading: heading === "" ? undefined : Number(heading),
      pitch: pitch === "" ? undefined : Number(pitch),
      roll: roll === "" ? undefined : Number(roll),
      fov: getCameraPosition()?.fov ?? 1.04,
    });
  }, [latitude, longitude, altitude, heading, pitch, roll, getCameraPosition, onChange]);

  const handleClearCamera = useCallback(() => {
    setLatitude("");
    setLongitude("");
    setAltitude("");
    setHeading("");
    setPitch("");
    setRoll("");
  }, []);

  const handleCapture = useCallback(() => {
    const cameraPos = getCameraPosition();
    setLatitude(cameraPos?.lat ?? "");
    setLongitude(cameraPos?.lng ?? "");
    setAltitude(cameraPos?.height ?? "");
    setHeading(cameraPos?.heading ?? "");
    setPitch(cameraPos?.pitch ?? "");
    setRoll(cameraPos?.roll ?? "");
  }, [getCameraPosition]);

  return (
    <>
      <PropertyItemWrapper label="Position">
        <PropertyLineWrapper>
          <PropertyInputField
            placeholder="Latitude"
            type="number"
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
          />
          <PropertyInputField
            placeholder="Longitude"
            type="number"
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
          />
          <PropertyInputField
            placeholder="Altitude"
            type="number"
            value={altitude}
            onChange={e => setAltitude(e.target.value)}
          />
        </PropertyLineWrapper>
      </PropertyItemWrapper>
      <PropertyItemWrapper label="Rotation">
        <PropertyLineWrapper>
          <PropertyInputField
            placeholder="Heading"
            type="number"
            value={heading}
            onChange={e => setHeading(e.target.value)}
          />
          <PropertyInputField
            placeholder="Pitch"
            type="number"
            value={pitch}
            onChange={e => setPitch(e.target.value)}
          />
          <PropertyInputField
            placeholder="Roll"
            type="number"
            value={roll}
            onChange={e => setRoll(e.target.value)}
          />
        </PropertyLineWrapper>
      </PropertyItemWrapper>
      <PropertyLineWrapper>
        <PropertyButton onClick={handleClearCamera} fullWidth>
          Clear
        </PropertyButton>
        <PropertyButton onClick={handleCapture} fullWidth>
          Capture
        </PropertyButton>
      </PropertyLineWrapper>
    </>
  );
};
