import type { Preview, Renderer } from "@storybook/react";
import React, { StrictMode } from "react";
import { CssBaseline, darkTheme, lightTheme } from "../src/prototypes/ui-components";
import { ThemeProvider } from "@mui/material";
import { withThemeFromJSXProvider } from '@storybook/addon-themes';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: lightTheme.palette.background.default
        },
        {
          name: 'dark',
          value: darkTheme.palette.background.default
        }
      ]
    },
    options: {
      showPanel: false
    },
  },
  decorators: [
       withThemeFromJSXProvider<Renderer>({
         themes: {
           light: lightTheme,
           dark: darkTheme,
         },
         defaultTheme: 'light',
         Provider: ThemeProvider,
         GlobalStyles: CssBaseline,
       }),
     ],
};

export default preview;
