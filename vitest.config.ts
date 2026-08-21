import { defineConfig } from "vitest/config";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import path from "path";

// SengenUI の package.json は dist を指すがビルド成果物はコミットされていないため、
// tsconfig.json の paths と同じ意図でソース(index.ts)へ直接エイリアスする。
// AgentRoom 側の packages/ui/vite.config.ts と同じ対処。
export default defineConfig({
    plugins: [vanillaExtractPlugin()],
    resolve: {
        alias: [
            {
                find: /^sengen-ui$/,
                replacement: path.resolve(import.meta.dirname, "../SengenUI/index.ts"),
            },
            {
                find: /^sengen-ui\//,
                replacement: path.resolve(import.meta.dirname, "../SengenUI") + "/",
            },
        ],
    },
});
