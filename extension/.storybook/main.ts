import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.story.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      define: {
        "process.env.QTS_DEBUG": "false", // quickjs-emscripten
      },

      build:
        configType === "PRODUCTION"
          ? {
              // https://github.com/storybookjs/builder-vite/issues/409
              minify: false,
              sourcemap: false,
            }
          : {},
      server: {
        watch: {
          // https://github.com/storybookjs/storybook/issues/22253#issuecomment-1673229400
          ignored: ["**/.env"],
        },
      },
    });
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
