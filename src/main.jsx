import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV15 from './ExhibitV15.jsx'
import './exhibit-v14.css'
import './gallery-portrait-grid.css'
import './detail-open-layout.css'
import './detail-story-first.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExhibitV15 />
  </React.StrictMode>,
)
