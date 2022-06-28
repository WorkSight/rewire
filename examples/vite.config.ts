import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
function manualChunks(id) {
  if (id.includes('@material-ui')) {
    return 'materialUI'
  }
  if (id.includes('react')) {
    return 'react'
  }
  if (id.includes('node_modules')) {
    return 'vendor';
  }
  return 'app';
}

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()]
})
