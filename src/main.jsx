import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import ExhibitV6 from './ExhibitV6.jsx'
import './exhibit-v6.css'
import './exhibit-v7.css'
import './exhibit-v8.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExhibitV6 />
  </React.StrictMode>,
)
