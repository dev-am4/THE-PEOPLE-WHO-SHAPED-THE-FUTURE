import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV14 from './ExhibitV14.jsx'
import './exhibit-v14.css'
import './gallery-portrait-grid.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExhibitV14 />
  </React.StrictMode>,
)
