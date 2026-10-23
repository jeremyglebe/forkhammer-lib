// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import vue from "rollup-plugin-vue";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { bundledLicenses } from "./scripts/bundled-licenses.mjs";

export default {
    input: "src/forkhammer-lib.js",
    output: { file: "dist/forkhammer-lib.js", format: "iife", sourcemap: true },
    plugins: [
        replace({
            preventAssignment: true,
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production"),
            __VUE_OPTIONS_API__: "true",
            __VUE_PROD_DEVTOOLS__: "false",
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false"
        }),
        vue({
            css: false,
            compilerOptions: { isCustomElement: tag => tag === "code-mirror" }
        }),
        nodeResolve({ browser: true }),
        postcss({ extract: "forkhammer.css", plugins: [] }),
        bundledLicenses(),
        copy({
            targets: [
                { src: "./module.json", dest: "dist" },
                { src: "./static/*", dest: "dist" },
                { src: ["./LICENSE", "./NOTICE"], dest: "dist" }
            ],
            hook: "writeBundle",
            copyOnce: false
        })
    ],
    watch: { include: ["src/**", "styles/**", "static/**", "module.json"] }
};
