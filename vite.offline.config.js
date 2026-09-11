import { defineConfig } from 'vite'

const ELON_REMOTE = 'https://commons.wikimedia.org/wiki/Special:FilePath/Elon%20Musk%20Royal%20Society%20crop.jpg?width=1200'

export default defineConfig({
  plugins: [
    {
      name: 'offline-portrait-rewrite',
      enforce: 'pre',
      transform(code, id) {
        if (!id.replace(/\\/g, '/').endsWith('/src/people-reference.js')) return null
        return {
          code: code.replace(ELON_REMOTE, '/api/portrait?id=musk'),
          map: null,
        }
      },
    },
  ],
  build: {
    outDir: 'offline/dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
