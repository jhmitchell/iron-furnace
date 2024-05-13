import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ResponsiveProvider } from "/src/context/ResponsiveContext";
import './index.css'
import './assets/fonts/fonts.css'

const addAdobeGaramondPro = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://use.typekit.net/kra7lnn.css';
  document.head.appendChild(link)
};

addAdobeGaramondPro()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ResponsiveProvider>
    <App />
  </ResponsiveProvider>,
)
