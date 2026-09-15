import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV17 from './ExhibitV17.jsx'
import AdminPanelV2 from './AdminPanelV2.jsx'
import './exhibit-v17.css'
import './admin-compact.css'

const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')
document.documentElement.classList.toggle('admin-mode', isAdmin)
document.body.classList.toggle('admin-mode', isAdmin)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <AdminPanelV2 /> : <ExhibitV17 />}
  </React.StrictMode>,
)
