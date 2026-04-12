import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/hooks.server.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  treeshake: true,
  cjsInterop: true,
  splitting: false,
});
