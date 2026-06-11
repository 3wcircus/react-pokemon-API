/**
 * main.jsx — Application entry point
 *
 * Mounts the React application into the #root div defined in index.html.
 * React.StrictMode is kept enabled — it intentionally double-invokes renders
 * and effects in development to help surface side-effect bugs early.
 * It has no effect in production builds.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
