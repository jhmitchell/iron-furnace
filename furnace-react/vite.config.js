import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const API_PREFIX = '/api/v1'
const STATIC_DIR = '/static'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      [API_PREFIX]: 'http://localhost:3001',
      [STATIC_DIR]: 'http://localhost:3001',
    },
    port: 3000,
    host: true,
  },
});
