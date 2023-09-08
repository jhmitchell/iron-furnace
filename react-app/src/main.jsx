import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import './index.css'

const addAdobeGaramondPro = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://use.typekit.net/kra7lnn.css';
  document.head.appendChild(link)
};

addAdobeGaramondPro()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
