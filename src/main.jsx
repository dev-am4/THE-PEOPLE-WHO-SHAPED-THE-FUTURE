import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV11 from './ExhibitV11.jsx'
import './exhibit-v11.css'
import './exhibit-v11-fixes.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExhibitV11 />
  </React.StrictMode>,
)
