import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { BrowserRouter, RouterProvider } from 'react-router-dom'
import DonationPage from './components/DonationPage.jsx'
import './index.css'
import App from './App.jsx'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
)
