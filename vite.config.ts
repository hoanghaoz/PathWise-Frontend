import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The backend's CORS only allows http://localhost:5173. Fail loudly if the
    // port is busy instead of silently moving to 5174 (requests would then be
    // blocked by CORS and show "Không kết nối được máy chủ").
    port: 5173,
    strictPort: true,
  },
});
