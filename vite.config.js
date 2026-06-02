import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// El código fuente usa la extensión .js para componentes con JSX, por lo que
// configuramos esbuild para interpretar JSX dentro de archivos .js tanto en
// desarrollo (optimizeDeps/esbuild) como en producción (build vía rollup).
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
});
