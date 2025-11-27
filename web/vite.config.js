import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.svg']
  // server: {
  //   host: 'http://192.168.8.9' , // Permite acesso de qualquer IP da rede
  //   port: 5173 // Porta padrão do Vite, você pode alterá-la se desejar
  // }
})
