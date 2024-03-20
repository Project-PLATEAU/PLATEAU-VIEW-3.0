import { styled } from "@mui/material";

import { PropertyInputField } from "./PropertyInputField";

type PropertyImageFieldProps = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const PropertyImageField: React.FC<PropertyImageFieldProps> = ({
  value,
  placeholder = "Image URL",
  onChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Wrapper>
      <Thumbnail url={value ?? ""} />
      <PropertyInputField placeholder={placeholder} value={value} onChange={handleInputChange} />
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const Thumbnail = styled("div")<{ url: string }>(({ theme, url }) => ({
  width: "25.88px",
  height: "25.88px",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundImage: `url(${url})`,
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  flexShrink: 0,
  overflow: "hidden",
}));
