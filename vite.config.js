import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from "url"

import { config, env } from "./config.js"

const {
    __projdir,
    __distdir,
    __publicdir,
    __clientdir
} = config;

// vite requires placing scripts with type="module" in html and keeps it when built, but
// i prefer to set defer property for scripts instead
let dummyPlugin = (transformer = (rawHtml) => rawHtml) => {
    return {
        name: 'dummy_plugin',
        enforce: 'post',
        transformIndexHtml(html) {
            return transformer(html)
        }
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // react(),
        dummyPlugin(async function (html) {
            if (config.isProd) {
                let rawHtml = html.split("\n")
                for (let i = 0; i < rawHtml.length; i++) {
                    if (rawHtml[i].includes(`type="module"`)) {
                        console.log("\n>>" + rawHtml[i]);
                        rawHtml[i] = rawHtml[i].replace(`type="module"`, `defer`)
                    }
                }
                return rawHtml.join("\n")
            } else {
                return html
            }
        })
    ],
    root: __clientdir,
    publicDir: __publicdir,
    build: {
        minify: "esbuild",
        outDir: __distdir,
        emptyOutDir: true,

        rollupOptions: {
            input: {
                main: path.join(__clientdir, "/index.html"),
                // another: path.join(__clientdir, "/auth.html")
            },
            output: {
                assetFileNames: `bundles/[name].[ext]`,
                entryFileNames: `bundles/[name].js`,
                format: "commonjs"
            }
        }
    },
    clearScreen: false,
    server: {
        host: "127.0.0.1",
        port: "9999",
        strictPort: true,
        open: false
    }
})

export {
    __projdir
}
