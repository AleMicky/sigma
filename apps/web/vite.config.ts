import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/app/router/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: "vendor-tanstack",
              test: /node_modules[\\/]@tanstack[\\/]/,
              priority: 25,
            },
            {
              name: "vendor-charts",
              test: /node_modules[\\/](recharts|d3-|victory-vendor)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-calendar",
              test: /node_modules[\\/]@fullcalendar[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-maps",
              test: /node_modules[\\/](leaflet|react-leaflet)[\\/]/,
              priority: 20,
            },
            {
              name: "vendor-icons",
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 15,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](@base-ui|motion|framer-motion)[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})