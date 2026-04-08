import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient'
import { Toaster } from '@pages/components/ui/sonner'
import { Helmet, HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <Helmet>
      <title>TCenterOS</title>
      <link rel='canonical' href='https://tcenteros.com/' />
    </Helmet>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position='top-center' duration={2000} />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  </HelmetProvider>
)
