import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: ["pages/index.html", "pages/history.html", "pages/setup.html"],
    },
  },
});
