import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ProviderProvider } from './context/ProviderContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
 <BrowserRouter>
 <ThemeProvider>
 <ProviderProvider>
 <ToastProvider>
 <App />
 </ToastProvider>
 </ProviderProvider>
 </ThemeProvider>
 </BrowserRouter>
 </React.StrictMode>,
)
