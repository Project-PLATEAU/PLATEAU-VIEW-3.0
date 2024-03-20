import { styled, Switch, SwitchProps } from "@mui/material";

import { PropertyLineWrapper } from "./PropertyWrapper";

export const PropertySwitchField: React.FC<SwitchProps> = ({ ...props }) => {
  return <Switch {...props} />;
};

type PropertySwitchProps = SwitchProps & {
  label: string;
};

export const PropertySwitch: React.FC<PropertySwitchProps> = ({ label, ...props }) => {
  return (
    <PropertyLineWrapper>
      <Label>{label}</Label>
      <Switch {...props} />
    </PropertyLineWrapper>
  );
};

const Label = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 0.5),
}));
