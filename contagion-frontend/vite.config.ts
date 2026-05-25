import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import fs from 'fs'

// The Initia SDK (@initia/interwovenkit-react) deep-imports cosmjs internals
// like `@cosmjs/amino/build/signdoc.js` and `cosmjs-types/cosmos/.../keys.js`,
// but those packages' `exports` maps don't expose the subpaths. Bun ignored
// exports maps and resolved the files directly; Vite/Node enforce them, so the
// build errors with "Missing specifier in exports". This shim maps any such
// cosmjs deep `.js` import straight to the file on disk, bypassing exports.
function cosmjsDeepImports(): Plugin {
  const re = /^((?:@cosmjs\/[a-z-]+)|cosmjs-types)\/(.+\.js)$/
  return {
    name: 'cosmjs-deep-imports',
    enforce: 'pre',
    resolveId(source) {
      const m = re.exec(source)
      if (!m) return null
      const onDisk = path.resolve(__dirname, 'node_modules', m[1], m[2])
      return fs.existsSync(onDisk) ? onDisk : null
    },
  }
}

export default defineConfig({
  plugins: [
    cosmjsDeepImports(),
    react(),
    nodePolyfills({
      globals: { Buffer: true, process: true },
    }),
  ],
  envDir: '..',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'wagmi', '@tanstack/react-query', 'viem'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', 'react-router-dom', 'wagmi', 'viem', '@tanstack/react-query'],
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['contagion.crevn.xyz'],
    proxy: {
      '/ws': {
        target: 'http://localhost:3001',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
