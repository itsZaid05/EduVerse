import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser ONLY talks to this origin. Colyseus traffic goes to /colyseus/*
// and is proxied (HTTP matchmake + WebSocket upgrade) to the game server on
// :2567 — so a single exposed port (the preview's 5173) is enough, no CORS,
// no dependence on a second public port/host being reachable.
const colyseusProxy = {
  "/colyseus": {
    target: "http://localhost:2567",
    changeOrigin: true,
    ws: true,
    rewrite: (path: string) => path.replace(/^\/colyseus/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5173, allowedHosts: true, proxy: colyseusProxy },
  preview: { host: "0.0.0.0", port: 5173, allowedHosts: true, proxy: colyseusProxy },
});
