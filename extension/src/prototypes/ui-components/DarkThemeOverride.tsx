import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material";
import { Theme } from "@mui/system";
import { merge } from "lodash-es";
import { useState, type FC, type ReactNode, useEffect } from "react";

import { PRIMARY_COLOR } from "../../shared/constants";

import { darkTheme, darkThemeOptions } from "./theme";

export interface DarkThemeOverrideProps {
  children?: ReactNode;
}

export const DarkThemeOverride: FC<DarkThemeOverrideProps> = ({ children, ...props }) => {
  const [customTheme, setCustomTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    if (!customTheme && PRIMARY_COLOR) {
      setCustomTheme(
        createTheme(
          merge<unknown, unknown, ThemeOptions>({}, darkThemeOptions, {
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
    <ThemeProvider {...props} theme={customTheme ?? darkTheme}>
      {children}
    </ThemeProvider>
  );
};
