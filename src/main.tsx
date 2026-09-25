import '@fontsource/zen-maru-gothic/700.css'
import '@fontsource/zen-maru-gothic/900.css'
import '@fontsource/dela-gothic-one/400.css'
import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('#root がありません')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
