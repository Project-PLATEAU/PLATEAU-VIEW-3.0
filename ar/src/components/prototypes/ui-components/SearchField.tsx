import {
  InputAdornment,
  styled,
  TextField,
  textFieldClasses,
  type TextFieldProps,
} from "@mui/material";
import { forwardRef } from "react";

import { SearchIcon } from "./icons";

const Root = styled("div")`
  & .${textFieldClasses.root} {
    width: auto;
  }
`;

const StyledTextField = styled(TextField)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  boxSizing: "border-box",
  minHeight: theme.spacing(6),
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
}));

export type SearchFieldProps = TextFieldProps;

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>((props, ref) => {
  return (
    <Root>
      <StyledTextField
        ref={ref}
        variant="standard"
        fullWidth
        {...props}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 26 }} />
            </InputAdornment>
          ),
          ...props.InputProps,
        }}
      />
    </Root>
  );
});
