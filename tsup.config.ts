import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['resources/js/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
})