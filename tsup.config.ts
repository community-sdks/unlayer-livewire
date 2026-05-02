import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['resources/js/index.ts'],
    format: ['iife'],
    globalName: 'UnlayerLivewireBundle',
    platform: 'browser',
    target: 'es2020',
    bundle: true,
    splitting: false,
    dts: false,
    clean: true,
    sourcemap: false,
    noExternal: [
        '@community-sdks/unlayer-alpinejs',
        '@community-sdks/unlayer-ts',
    ],
    outExtension() {
        return {
            js: '.js',
        }
    },
})
