import { ReactNode } from "react";

import { PropertyPlaceHolder } from "./PropertyPlaceHolder";
import { PropertyBox, PropertyWrapper } from "./PropertyWrapper";

export const NO_SETTINGS_FOR_THIS_COMPONNET = "No custom settings for this component";
export const FIELD_COMPONENT_NOT_FOUND = "Field component not found";

type PropertyInfoProps = {
  preset?: "no-settings" | "field-not-found";
  children?: ReactNode;
};

export const PropertyInfo: React.FC<PropertyInfoProps> = ({ preset, children }) => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        {preset === "no-settings" && (
          <PropertyPlaceHolder>{NO_SETTINGS_FOR_THIS_COMPONNET}</PropertyPlaceHolder>
        )}
        {preset === "field-not-found" && (
          <PropertyPlaceHolder>{FIELD_COMPONENT_NOT_FOUND}</PropertyPlaceHolder>
        )}
        {children && <PropertyPlaceHolder>{children}</PropertyPlaceHolder>}
      </PropertyBox>
    </PropertyWrapper>
  );
};
