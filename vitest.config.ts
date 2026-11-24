import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright"
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    test: {
        browser: {
            provider: playwright(),
            enabled: true,
            instances: [
                {
                    browser: 'chromium'
                }
            ]
        },
        include: ['src/tests/**/*.test.{ts,tsx}'],
    }
})