import react from "@vitejs/plugin-react";
import externalGlobals from "rollup-plugin-external-globals";
import { UserConfig, defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

import pkg from "./package.json";

const name = "PlateauView3";

const IS_DEV = process.env.NODE_ENV === "development";

export default defineConfig({
  mode: IS_DEV ? "development" : "production",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./reearth.yml",
          dest: ".",
        },
      ],
    }),
  ],
  envPrefix: "PLATEAU",
  define: {
    "process.env.VERSION": JSON.stringify(pkg.version),
    // Prevent conflict with import.meta.
    "process.env.NODE_ENV": JSON.stringify(""),
  },
  build: {
    minify: IS_DEV ? false : "esbuild",
    lib: {
      name: `ReearthBuiltInPlugin_${name}`,
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: () => `${name}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      plugins: [
        externalGlobals({
          react: "React",
          "react-dom": "ReactDOM",
        }),
        // visualizer(),
      ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test_setup.ts"],
  },
} as UserConfig);
