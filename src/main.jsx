import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV17 from './ExhibitV17.jsx'
import AdminPanel from './AdminPanel.jsx'
import './exhibit-v17.css'

const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <AdminPanel /> : <ExhibitV17 />}
  </React.StrictMode>,
)
