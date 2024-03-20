import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { Theme } from "@mui/system";
import { merge } from "lodash-es";
import { useState, type FC, type ReactNode, useEffect } from "react";

import { PRIMARY_COLOR } from "../../shared/constants";

import { lightTheme, lightThemeOptions } from "./theme";

export interface LightThemeOverrideProps {
  children?: ReactNode;
}

export const LightThemeOverride: FC<LightThemeOverrideProps> = ({ children, ...props }) => {
  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if (!customTheme && PRIMARY_COLOR) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, lightThemeOptions, {
            palette: {
              primary: {
                main: PRIMARY_COLOR,
              },
            },
          }),
        ),
      );
    }
  }, [customTheme]);

  return (
    <ThemeProvider {...props} theme={customTheme ?? lightTheme}>
      {children}
    </ThemeProvider>
  );
};
