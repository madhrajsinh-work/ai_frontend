import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/inter'; 
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { BrowserRouter } from 'react-router-dom';



createRoot(document.getElementById('root')).render(
 <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
